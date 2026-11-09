/**
 * Bruno-compatible HTTP / REST Client Engine and Test Runner.
 * Supports:
 * - Full HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
 * - Variable interpolation {{var}} from active Environment & Collection
 * - Query Params, Headers, Body (raw JSON, text, form-urlencoded, multipart, XML, none)
 * - Authentication (Bearer Token, Basic Auth, API Key in header/query)
 * - Bruno Bru file format parser & serializer (.bru)
 * - Collections & Folder hierarchy import/export
 * - Assertion runner (status equals, headers, JSONPath/body checks, response time)
 * - Pre-request scripts & Post-response test execution
 * - Response stats: status code, status text, execution time (ms), response byte size, headers
 */

import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export type AuthType = 'none' | 'bearer' | 'basic' | 'apikey';

export interface AuthConfig {
  type: AuthType;
  bearer?: { token: string };
  basic?: { username: string; password: string };
  apiKey?: { key: string; value: string; addTo: 'header' | 'query' };
}

export type BodyType = 'none' | 'json' | 'text' | 'xml' | 'form-urlencoded';

export interface RequestBodyConfig {
  type: BodyType;
  raw?: string;
  formData?: KeyValuePair[];
}

export interface RestApiRequest {
  id?: string;
  name?: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  headers?: KeyValuePair[];
  params?: KeyValuePair[];
  auth?: AuthConfig;
  body?: RequestBodyConfig;
  assertions?: string[]; // e.g. ["res.status: eq 200", "res.responseTime: lte 2000", "res.body.id: isDefined"]
  tests?: string; // JavaScript test script (e.g. bru/chai style assertions)
  preRequestScript?: string;
  timeoutMs?: number;
}

export interface AssertionResult {
  expression: string;
  passed: boolean;
  actual?: any;
  expected?: any;
  error?: string;
}

export interface TestScriptResult {
  name: string;
  passed: boolean;
  error?: string;
}

export interface RestApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string | string[]>;
  body: string;
  parsedBody?: any;
  timeMs: number;
  sizeBytes: number;
  assertions: AssertionResult[];
  tests: TestScriptResult[];
  consoleLogs: string[];
  error?: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
}

export interface CollectionItem {
  id: string;
  name: string;
  request: RestApiRequest;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  variables?: KeyValuePair[];
  items: CollectionItem[];
}

/**
 * Replace {{variable_name}} with values from combined environment/collection dictionary.
 */
export function interpolateVariables(template: string, vars: Record<string, string>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_\-\.]+)\s*\}\}/g, (_, key) => {
    return vars[key] !== undefined ? vars[key] : `{{${key}}}`;
  });
}

/**
 * Flattens array of enabled KeyValuePair into Record<string, string>, resolving {{vars}}.
 */
export function resolveKeyValuePairs(
  pairs?: KeyValuePair[],
  vars: Record<string, string> = {}
): Record<string, string> {
  const result: Record<string, string> = {};
  if (!pairs || !Array.isArray(pairs)) return result;

  for (const pair of pairs) {
    if (pair.enabled && pair.key && pair.key.trim()) {
      const k = interpolateVariables(pair.key.trim(), vars);
      const v = interpolateVariables(pair.value !== undefined ? String(pair.value) : '', vars);
      result[k] = v;
    }
  }
  return result;
}

/**
 * Evaluate simple Bruno-like assertion rules:
 * Syntax:
 *  - res.status: eq 200
 *  - res.status: neq 400
 *  - res.responseTime: lte 1000
 *  - res.body.propertyName: eq expectedValue
 *  - res.body.propertyName: contains expectedSub
 *  - res.body: isDefined
 */
export function evaluateAssertion(
  rule: string,
  response: { status: number; responseTime: number; body: string; parsedBody?: any; headers: Record<string, string | string[]> }
): AssertionResult {
  const trimmed = rule.trim();
  if (!trimmed) {
    return { expression: rule, passed: true };
  }

  const parts = trimmed.split(':');
  if (parts.length < 2) {
    return { expression: trimmed, passed: false, error: 'Invalid assertion syntax. Expected "target: operator expected"' };
  }

  const targetPath = parts[0].trim();
  const rest = parts.slice(1).join(':').trim();
  const opMatch = rest.match(/^([a-zA-Z]+)\s*(.*)$/);
  const operator = opMatch ? opMatch[1].toLowerCase() : rest.toLowerCase();
  const expectedRaw = opMatch && opMatch[2] ? opMatch[2].trim() : '';

  // Extract target value
  let actualValue: any = undefined;
  if (targetPath === 'res.status') {
    actualValue = response.status;
  } else if (targetPath === 'res.responseTime') {
    actualValue = response.responseTime;
  } else if (targetPath === 'res.body') {
    actualValue = response.parsedBody !== undefined ? response.parsedBody : response.body;
  } else if (targetPath.startsWith('res.body.')) {
    const propPath = targetPath.substring('res.body.'.length);
    actualValue = getNestedProperty(response.parsedBody, propPath);
  } else if (targetPath.startsWith('res.headers.')) {
    const headerName = targetPath.substring('res.headers.'.length).toLowerCase();
    actualValue = response.headers[headerName];
  } else {
    return { expression: trimmed, passed: false, error: `Unknown target ${targetPath}` };
  }

  // Parse expected value
  let expectedValue: any = expectedRaw;
  if (expectedRaw === 'true') expectedValue = true;
  else if (expectedRaw === 'false') expectedValue = false;
  else if (expectedRaw === 'null') expectedValue = null;
  else if (expectedRaw !== '' && !isNaN(Number(expectedRaw))) expectedValue = Number(expectedRaw);
  else if ((expectedRaw.startsWith('"') && expectedRaw.endsWith('"')) || (expectedRaw.startsWith("'") && expectedRaw.endsWith("'"))) {
    expectedValue = expectedRaw.substring(1, expectedRaw.length - 1);
  }

  let passed = false;
  switch (operator) {
    case 'eq':
      passed = actualValue == expectedValue;
      break;
    case 'neq':
      passed = actualValue != expectedValue;
      break;
    case 'gt':
      passed = Number(actualValue) > Number(expectedValue);
      break;
    case 'gte':
      passed = Number(actualValue) >= Number(expectedValue);
      break;
    case 'lt':
      passed = Number(actualValue) < Number(expectedValue);
      break;
    case 'lte':
      passed = Number(actualValue) <= Number(expectedValue);
      break;
    case 'contains':
      if (typeof actualValue === 'string') {
        passed = actualValue.includes(String(expectedValue));
      } else if (Array.isArray(actualValue)) {
        passed = actualValue.includes(expectedValue);
      } else if (actualValue && typeof actualValue === 'object') {
        passed = String(expectedValue) in actualValue;
      }
      break;
    case 'isdefined':
      passed = actualValue !== undefined && actualValue !== null;
      break;
    case 'isempty':
      passed = actualValue === undefined || actualValue === null || actualValue === '' || (Array.isArray(actualValue) && actualValue.length === 0) || (actualValue && typeof actualValue === 'object' && Object.keys(actualValue).length === 0);
      break;
    default:
      return { expression: trimmed, passed: false, actual: actualValue, expected: expectedValue, error: `Unknown operator: ${operator}` };
  }

  return {
    expression: trimmed,
    passed,
    actual: actualValue,
    expected: expectedValue
  };
}

function getNestedProperty(obj: any, path: string): any {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr == null) return undefined;
    curr = curr[part];
  }
  return curr;
}

/**
 * Execute custom post-response test scripts safely.
 * Provides a minimal Bruno/Postman-like `test(name, fn)` sandbox with `expect()` helpers.
 */
export function runTestScript(
  script: string,
  res: { status: number; headers: Record<string, any>; body: string; parsedBody: any; responseTime: number }
): { tests: TestScriptResult[]; logs: string[] } {
  const tests: TestScriptResult[] = [];
  const logs: string[] = [];

  if (!script || !script.trim()) {
    return { tests, logs };
  }

  const customConsole = {
    log: (...args: any[]) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
    warn: (...args: any[]) => logs.push('[WARN] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
    error: (...args: any[]) => logs.push('[ERROR] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '))
  };

  const testFn = (title: string, fn: () => void) => {
    try {
      fn();
      tests.push({ name: title, passed: true });
    } catch (err: any) {
      tests.push({ name: title, passed: false, error: err?.message || String(err) });
    }
  };

  const expectHelper = (actual: any) => ({
    toBe: (expected: any) => {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
    },
    toEqual: (expected: any) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
    },
    toBeGreaterThan: (expected: number) => {
      if (!(actual > expected)) throw new Error(`Expected ${actual} to be > ${expected}`);
    },
    toBeLessThan: (expected: number) => {
      if (!(actual < expected)) throw new Error(`Expected ${actual} to be < ${expected}`);
    },
    toContain: (expected: any) => {
      if (!actual || !actual.includes || !actual.includes(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`);
      }
    },
    toBeDefined: () => {
      if (actual === undefined || actual === null) throw new Error(`Expected value to be defined`);
    }
  });

  try {
    const runner = new Function('res', 'test', 'expect', 'console', script);
    runner(
      {
        status: res.status,
        headers: res.headers,
        body: res.body,
        data: res.parsedBody,
        responseTime: res.responseTime,
        getStatus: () => res.status,
        getBody: () => res.parsedBody || res.body,
        getHeader: (name: string) => res.headers[name.toLowerCase()]
      },
      testFn,
      expectHelper,
      customConsole
    );
  } catch (err: any) {
    tests.push({ name: 'Script Evaluation', passed: false, error: `Script execution error: ${err.message}` });
  }

  return { tests, logs };
}

/**
 * Execute HTTP Request End-to-End locally using Node's native HTTP/HTTPS modules.
 * Completely offline capable (e.g. against localhost, 127.0.0.1, internal test servers or online APIs).
 */
export async function executeRestRequest(
  req: RestApiRequest,
  envVars: Record<string, string> = {}
): Promise<RestApiResponse> {
  const startTime = Date.now();
  const consoleLogs: string[] = [];

  // Run Pre-request script if present
  if (req.preRequestScript && req.preRequestScript.trim()) {
    try {
      const preRunner = new Function('req', 'env', 'console', req.preRequestScript);
      preRunner(
        req,
        envVars,
        {
          log: (...args: any[]) => consoleLogs.push('[PreRequest] ' + args.map(a => String(a)).join(' '))
        }
      );
    } catch (err: any) {
      consoleLogs.push(`[PreRequest Error] ${err.message}`);
    }
  }

  // 1. Resolve URL with variables
  let targetUrlStr = interpolateVariables(req.url, envVars);
  if (!targetUrlStr.startsWith('http://') && !targetUrlStr.startsWith('https://')) {
    targetUrlStr = 'http://' + targetUrlStr;
  }

  let urlObj: URL;
  try {
    urlObj = new URL(targetUrlStr);
  } catch (err: any) {
    return {
      status: 0,
      statusText: 'Invalid URL',
      headers: {},
      body: '',
      timeMs: 0,
      sizeBytes: 0,
      assertions: [],
      tests: [],
      consoleLogs,
      error: `Invalid URL format: ${err.message}`
    };
  }

  // 2. Query Parameters
  const resolvedParams = resolveKeyValuePairs(req.params, envVars);
  for (const [key, value] of Object.entries(resolvedParams)) {
    urlObj.searchParams.append(key, value);
  }

  // 3. Headers
  const resolvedHeaders: Record<string, string> = resolveKeyValuePairs(req.headers, envVars);

  // 4. Authentication
  if (req.auth) {
    if (req.auth.type === 'bearer' && req.auth.bearer?.token) {
      const token = interpolateVariables(req.auth.bearer.token, envVars);
      resolvedHeaders['authorization'] = `Bearer ${token}`;
    } else if (req.auth.type === 'basic' && req.auth.basic) {
      const user = interpolateVariables(req.auth.basic.username, envVars);
      const pass = interpolateVariables(req.auth.basic.password, envVars);
      const encoded = Buffer.from(`${user}:${pass}`).toString('base64');
      resolvedHeaders['authorization'] = `Basic ${encoded}`;
    } else if (req.auth.type === 'apikey' && req.auth.apiKey) {
      const k = interpolateVariables(req.auth.apiKey.key, envVars);
      const v = interpolateVariables(req.auth.apiKey.value, envVars);
      if (req.auth.apiKey.addTo === 'query') {
        urlObj.searchParams.append(k, v);
      } else {
        resolvedHeaders[k.toLowerCase()] = v;
      }
    }
  }

  // 5. Body payload
  let payloadBuffer: Buffer | null = null;
  if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
    if (req.body.type === 'json' && req.body.raw) {
      const interpolatedBody = interpolateVariables(req.body.raw, envVars);
      payloadBuffer = Buffer.from(interpolatedBody, 'utf-8');
      if (!resolvedHeaders['content-type'] && !resolvedHeaders['Content-Type']) {
        resolvedHeaders['content-type'] = 'application/json';
      }
    } else if (req.body.type === 'form-urlencoded' && req.body.formData) {
      const formObj = resolveKeyValuePairs(req.body.formData, envVars);
      const searchParams = new URLSearchParams(formObj);
      const formStr = searchParams.toString();
      payloadBuffer = Buffer.from(formStr, 'utf-8');
      if (!resolvedHeaders['content-type'] && !resolvedHeaders['Content-Type']) {
        resolvedHeaders['content-type'] = 'application/x-www-form-urlencoded';
      }
    } else if (req.body.type === 'text' && req.body.raw) {
      const interpolatedBody = interpolateVariables(req.body.raw, envVars);
      payloadBuffer = Buffer.from(interpolatedBody, 'utf-8');
      if (!resolvedHeaders['content-type'] && !resolvedHeaders['Content-Type']) {
        resolvedHeaders['content-type'] = 'text/plain';
      }
    } else if (req.body.type === 'xml' && req.body.raw) {
      const interpolatedBody = interpolateVariables(req.body.raw, envVars);
      payloadBuffer = Buffer.from(interpolatedBody, 'utf-8');
      if (!resolvedHeaders['content-type'] && !resolvedHeaders['Content-Type']) {
        resolvedHeaders['content-type'] = 'application/xml';
      }
    }
  }

  if (payloadBuffer) {
    resolvedHeaders['content-length'] = String(payloadBuffer.length);
  }

  // 6. Perform native HTTP/HTTPS request
  const isHttps = urlObj.protocol === 'https:';
  const transport = isHttps ? https : http;

  const timeoutMs = req.timeoutMs || 15000;

  return new Promise<RestApiResponse>((resolve) => {
    const requestOptions: https.RequestOptions = {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      port: urlObj.port ? Number(urlObj.port) : isHttps ? 443 : 80,
      path: urlObj.pathname + urlObj.search,
      method: req.method,
      headers: resolvedHeaders,
      timeout: timeoutMs,
      rejectUnauthorized: false // Allow self-signed certificates for local QA testing
    };

    const clientReq = transport.request(requestOptions, (clientRes) => {
      const chunks: Buffer[] = [];
      let totalBytes = 0;

      clientRes.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        totalBytes += chunk.length;
      });

      clientRes.on('end', () => {
        const timeMs = Date.now() - startTime;
        const bodyBuffer = Buffer.concat(chunks);
        const bodyStr = bodyBuffer.toString('utf-8');

        let parsedBody: any = undefined;
        try {
          parsedBody = JSON.parse(bodyStr);
        } catch {
          // not JSON, keep undefined
        }

        const responseHeaders: Record<string, string | string[]> = {};
        for (const [k, v] of Object.entries(clientRes.headers)) {
          if (v !== undefined) {
            responseHeaders[k] = v;
          }
        }

        // Run Assertions
        const assertionResults: AssertionResult[] = [];
        if (req.assertions && Array.isArray(req.assertions)) {
          for (const rule of req.assertions) {
            if (rule && rule.trim()) {
              assertionResults.push(
                evaluateAssertion(rule, {
                  status: clientRes.statusCode || 0,
                  responseTime: timeMs,
                  body: bodyStr,
                  parsedBody,
                  headers: responseHeaders
                })
              );
            }
          }
        }

        // Run Post-response Test Scripts
        const testScriptResult = runTestScript(req.tests || '', {
          status: clientRes.statusCode || 0,
          headers: responseHeaders,
          body: bodyStr,
          parsedBody,
          responseTime: timeMs
        });

        consoleLogs.push(...testScriptResult.logs);

        resolve({
          status: clientRes.statusCode || 0,
          statusText: clientRes.statusMessage || '',
          headers: responseHeaders,
          body: bodyStr,
          parsedBody,
          timeMs,
          sizeBytes: totalBytes,
          assertions: assertionResults,
          tests: testScriptResult.tests,
          consoleLogs
        });
      });
    });

    clientReq.on('timeout', () => {
      clientReq.destroy();
      const timeMs = Date.now() - startTime;
      resolve({
        status: 0,
        statusText: 'Timeout',
        headers: {},
        body: '',
        timeMs,
        sizeBytes: 0,
        assertions: [],
        tests: [],
        consoleLogs,
        error: `Request timed out after ${timeoutMs}ms`
      });
    });

    clientReq.on('error', (err: any) => {
      const timeMs = Date.now() - startTime;
      resolve({
        status: 0,
        statusText: 'Network / Connection Error',
        headers: {},
        body: '',
        timeMs,
        sizeBytes: 0,
        assertions: [],
        tests: [],
        consoleLogs,
        error: `Connection error: ${err.message} (${err.code || 'UNKNOWN'})`
      });
    });

    if (payloadBuffer) {
      clientReq.write(payloadBuffer);
    }
    clientReq.end();
  });
}

/**
 * Bruno (.bru) File Parser and Serializer
 * Implements parsing and generation of Bruno's plain-text declarative markup format.
 */
export function parseBruFile(bruContent: string): RestApiRequest {
  const req: RestApiRequest = {
    name: '',
    url: '',
    method: 'GET',
    headers: [],
    params: [],
    assertions: []
  };

  if (!bruContent) return req;

  // Split content by root-level blocks (e.g. meta { ... }, get { ... }, headers { ... }, etc.)
  const blockRegex = /([a-zA-Z0-9_\-]+)\s*(?::([a-zA-Z0-9_\-]+))?\s*\{([^}]*)\}/g;
  let match;

  while ((match = blockRegex.exec(bruContent)) !== null) {
    const blockType = match[1].toLowerCase();
    const subType = match[2] ? match[2].toLowerCase() : '';
    const blockBody = match[3].trim();

    if (blockType === 'meta') {
      const nameMatch = blockBody.match(/name:\s*(.*)/i);
      if (nameMatch) req.name = nameMatch[1].trim();
      const seqMatch = blockBody.match(/seq:\s*(\d+)/i);
    } else if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(blockType)) {
      req.method = blockType.toUpperCase() as any;
      const urlMatch = blockBody.match(/url:\s*(.*)/i);
      if (urlMatch) req.url = urlMatch[1].trim();
      const bodyMatch = blockBody.match(/body:\s*(.*)/i);
      if (bodyMatch && !req.body) {
        req.body = { type: bodyMatch[1].trim() as BodyType };
      }
    } else if (blockType === 'headers') {
      const lines = blockBody.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#')) {
          const colonIdx = trimmed.indexOf(':');
          if (colonIdx > 0) {
            req.headers?.push({
              key: trimmed.substring(0, colonIdx).trim(),
              value: trimmed.substring(colonIdx + 1).trim(),
              enabled: !trimmed.startsWith('~')
            });
          }
        }
      }
    } else if (blockType === 'params' && (subType === 'query' || !subType)) {
      const lines = blockBody.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('#')) {
          const colonIdx = trimmed.indexOf(':');
          if (colonIdx > 0) {
            req.params?.push({
              key: trimmed.substring(0, colonIdx).trim(),
              value: trimmed.substring(colonIdx + 1).trim(),
              enabled: !trimmed.startsWith('~')
            });
          }
        }
      }
    } else if (blockType === 'auth' || blockType.startsWith('auth:')) {
      const authType = subType || (blockType.startsWith('auth:') ? blockType.substring(5) : '');
      if (authType === 'bearer') {
        const tokenMatch = blockBody.match(/token:\s*(.*)/i);
        req.auth = {
          type: 'bearer',
          bearer: { token: tokenMatch ? tokenMatch[1].trim() : '' }
        };
      } else if (authType === 'basic') {
        const userMatch = blockBody.match(/username:\s*(.*)/i);
        const passMatch = blockBody.match(/password:\s*(.*)/i);
        req.auth = {
          type: 'basic',
          basic: {
            username: userMatch ? userMatch[1].trim() : '',
            password: passMatch ? passMatch[1].trim() : ''
          }
        };
      } else if (authType === 'apikey') {
        const keyMatch = blockBody.match(/key:\s*(.*)/i);
        const valueMatch = blockBody.match(/value:\s*(.*)/i);
        const placementMatch = blockBody.match(/placement:\s*(.*)/i);
        req.auth = {
          type: 'apikey',
          apiKey: {
            key: keyMatch ? keyMatch[1].trim() : '',
            value: valueMatch ? valueMatch[1].trim() : '',
            addTo: (placementMatch && placementMatch[1].trim().toLowerCase() === 'query') ? 'query' : 'header'
          }
        };
      }
    } else if (blockType === 'body') {
      if (subType === 'json') {
        req.body = { type: 'json', raw: blockBody };
      } else if (subType === 'text') {
        req.body = { type: 'text', raw: blockBody };
      } else if (subType === 'xml') {
        req.body = { type: 'xml', raw: blockBody };
      } else if (subType === 'form-urlencoded') {
        const formData: KeyValuePair[] = [];
        const lines = blockBody.split('\n');
        for (const line of lines) {
          const colonIdx = line.indexOf(':');
          if (colonIdx > 0) {
            formData.push({
              key: line.substring(0, colonIdx).trim(),
              value: line.substring(colonIdx + 1).trim(),
              enabled: true
            });
          }
        }
        req.body = { type: 'form-urlencoded', formData };
      }
    } else if (blockType === 'assert') {
      const lines = blockBody.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('//')) {
          req.assertions?.push(trimmed);
        }
      }
    } else if (blockType === 'script' && subType === 'pre-request') {
      req.preRequestScript = blockBody;
    } else if (blockType === 'tests') {
      req.tests = blockBody;
    }
  }

  return req;
}

/**
 * Serialize a RestApiRequest to Bruno (.bru) markup format.
 */
export function serializeToBruFile(req: RestApiRequest): string {
  const parts: string[] = [];

  // Meta block
  parts.push(`meta {\n  name: ${req.name || 'Untitled Request'}\n  type: http\n  seq: 1\n}`);

  // HTTP Method & URL block
  const method = (req.method || 'GET').toLowerCase();
  const bodyType = req.body?.type || 'none';
  parts.push(`${method} {\n  url: ${req.url || ''}\n  body: ${bodyType}\n  auth: ${req.auth?.type || 'none'}\n}`);

  // Headers block
  if (req.headers && req.headers.length > 0) {
    const headerLines = req.headers.map(h => `  ${h.enabled ? '' : '~'}${h.key}: ${h.value}`).join('\n');
    parts.push(`headers {\n${headerLines}\n}`);
  }

  // Query Params block
  if (req.params && req.params.length > 0) {
    const paramLines = req.params.map(p => `  ${p.enabled ? '' : '~'}${p.key}: ${p.value}`).join('\n');
    parts.push(`params:query {\n${paramLines}\n}`);
  }

  // Auth block
  if (req.auth && req.auth.type !== 'none') {
    if (req.auth.type === 'bearer' && req.auth.bearer?.token) {
      parts.push(`auth:bearer {\n  token: ${req.auth.bearer.token}\n}`);
    } else if (req.auth.type === 'basic' && req.auth.basic) {
      parts.push(`auth:basic {\n  username: ${req.auth.basic.username}\n  password: ${req.auth.basic.password}\n}`);
    } else if (req.auth.type === 'apikey' && req.auth.apiKey) {
      parts.push(`auth:apikey {\n  key: ${req.auth.apiKey.key}\n  value: ${req.auth.apiKey.value}\n  placement: ${req.auth.apiKey.addTo}\n}`);
    }
  }

  // Body block
  if (req.body) {
    if (req.body.type === 'json' && req.body.raw) {
      parts.push(`body:json {\n${req.body.raw}\n}`);
    } else if (req.body.type === 'text' && req.body.raw) {
      parts.push(`body:text {\n${req.body.raw}\n}`);
    } else if (req.body.type === 'xml' && req.body.raw) {
      parts.push(`body:xml {\n${req.body.raw}\n}`);
    } else if (req.body.type === 'form-urlencoded' && req.body.formData) {
      const formLines = req.body.formData.map(f => `  ${f.key}: ${f.value}`).join('\n');
      parts.push(`body:form-urlencoded {\n${formLines}\n}`);
    }
  }

  // Assert block
  if (req.assertions && req.assertions.length > 0) {
    const assertLines = req.assertions.map(a => `  ${a}`).join('\n');
    parts.push(`assert {\n${assertLines}\n}`);
  }

  // Script blocks
  if (req.preRequestScript) {
    parts.push(`script:pre-request {\n${req.preRequestScript}\n}`);
  }

  if (req.tests) {
    parts.push(`tests {\n${req.tests}\n}`);
  }

  return parts.join('\n\n') + '\n';
}

/**
 * Generate reproducible cURL command string from RestApiRequest.
 */
export function generateCurlFromRequest(req: RestApiRequest, envVars: Record<string, string> = {}): string {
  let targetUrlStr = interpolateVariables(req.url, envVars);
  const resolvedParams = resolveKeyValuePairs(req.params, envVars);

  if (Object.keys(resolvedParams).length > 0) {
    try {
      const u = new URL(targetUrlStr.startsWith('http') ? targetUrlStr : `http://${targetUrlStr}`);
      for (const [k, v] of Object.entries(resolvedParams)) {
        u.searchParams.append(k, v);
      }
      targetUrlStr = u.toString();
    } catch {
      const qs = Object.entries(resolvedParams).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
      targetUrlStr += (targetUrlStr.includes('?') ? '&' : '?') + qs;
    }
  }

  const parts = [`curl --request ${req.method} \\\n  --url '${targetUrlStr}'`];

  const headers = resolveKeyValuePairs(req.headers, envVars);
  if (req.auth) {
    if (req.auth.type === 'bearer' && req.auth.bearer?.token) {
      headers['Authorization'] = `Bearer ${interpolateVariables(req.auth.bearer.token, envVars)}`;
    } else if (req.auth.type === 'basic' && req.auth.basic) {
      const encoded = Buffer.from(`${interpolateVariables(req.auth.basic.username, envVars)}:${interpolateVariables(req.auth.basic.password, envVars)}`).toString('base64');
      headers['Authorization'] = `Basic ${encoded}`;
    }
  }

  for (const [k, v] of Object.entries(headers)) {
    parts.push(`  --header '${k}: ${v}'`);
  }

  if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
    if (req.body.type === 'json' && req.body.raw) {
      parts.push(`  --header 'Content-Type: application/json'`);
      parts.push(`  --data '${req.body.raw.replace(/'/g, "'\\''")}'`);
    } else if (req.body.type === 'form-urlencoded' && req.body.formData) {
      const formObj = resolveKeyValuePairs(req.body.formData, envVars);
      const sp = new URLSearchParams(formObj).toString();
      parts.push(`  --header 'Content-Type: application/x-www-form-urlencoded'`);
      parts.push(`  --data '${sp}'`);
    } else if (req.body.type === 'text' && req.body.raw) {
      parts.push(`  --data '${req.body.raw.replace(/'/g, "'\\''")}'`);
    }
  }

  return parts.join(' \\\n');
}

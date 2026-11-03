/**
 * Core developer and QA utilities engine written in TypeScript.
 * 100% Offline, Zero external network calls, Secure & Compliant.
 */

import * as crypto from 'crypto';

// =========================================================================
// 1. JSON Utilities (Format, Minify, Validate)
// =========================================================================
export interface JsonFormatResult {
  success: boolean;
  result?: string;
  error?: string;
}

export function formatJson(raw: string, indent: number = 2): JsonFormatResult {
  try {
    const parsed = JSON.parse(raw);
    return { success: true, result: JSON.stringify(parsed, null, indent) };
  } catch (err: any) {
    return { success: false, error: `Invalid JSON: ${err.message}` };
  }
}

export function minifyJson(raw: string): JsonFormatResult {
  try {
    const parsed = JSON.parse(raw);
    return { success: true, result: JSON.stringify(parsed) };
  } catch (err: any) {
    return { success: false, error: `Invalid JSON: ${err.message}` };
  }
}

// =========================================================================
// 2. JWT Inspector & Offline Decoder
// =========================================================================
export interface JwtInspectionResult {
  success: boolean;
  header?: Record<string, any>;
  payload?: Record<string, any>;
  signature?: string;
  claimsInfo?: {
    expiresAtUtc?: string;
    isExpired?: boolean;
    remainingSeconds?: number;
    issuedAtUtc?: string;
    notBeforeUtc?: string;
  };
  error?: string;
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }
  return Buffer.from(output, 'base64').toString('utf8');
}

export function decodeJwt(token: string): JwtInspectionResult {
  const clean = token.trim();
  const parts = clean.split('.');
  if (parts.length !== 3) {
    return {
      success: false,
      error: 'Invalid JWT structure: Token must contain exactly 3 dot-separated segments (header.payload.signature).'
    };
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    const claimsInfo: NonNullable<JwtInspectionResult['claimsInfo']> = {};
    const nowSec = Math.floor(Date.now() / 1000);

    if (typeof payload.exp === 'number') {
      claimsInfo.expiresAtUtc = new Date(payload.exp * 1000).toISOString();
      claimsInfo.isExpired = nowSec > payload.exp;
      claimsInfo.remainingSeconds = payload.exp - nowSec;
    }
    if (typeof payload.iat === 'number') {
      claimsInfo.issuedAtUtc = new Date(payload.iat * 1000).toISOString();
    }
    if (typeof payload.nbf === 'number') {
      claimsInfo.notBeforeUtc = new Date(payload.nbf * 1000).toISOString();
    }

    return {
      success: true,
      header,
      payload,
      signature,
      claimsInfo
    };
  } catch (err: any) {
    return { success: false, error: `Failed to decode JWT: ${err.message}` };
  }
}

// =========================================================================
// 3. Base64, URL & HTML Entity Encoders/Decoders
// =========================================================================
export function base64Encode(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64');
}

export function base64Decode(encoded: string): { success: boolean; result?: string; error?: string } {
  try {
    const res = Buffer.from(encoded.trim(), 'base64').toString('utf8');
    return { success: true, result: res };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export function urlEncode(text: string): string {
  return encodeURIComponent(text);
}

export function urlDecode(text: string): string {
  return decodeURIComponent(text);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

// =========================================================================
// 4. Cryptographic Hash & HMAC Generator
// =========================================================================
export interface HashResult {
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
  hmacSha256?: string;
  hmacSha512?: string;
}

export function generateHashes(text: string, secretKey?: string): HashResult {
  const result: HashResult = {
    md5: crypto.createHash('md5').update(text, 'utf8').digest('hex'),
    sha1: crypto.createHash('sha1').update(text, 'utf8').digest('hex'),
    sha256: crypto.createHash('sha256').update(text, 'utf8').digest('hex'),
    sha512: crypto.createHash('sha512').update(text, 'utf8').digest('hex'),
  };

  if (secretKey && secretKey.length > 0) {
    result.hmacSha256 = crypto.createHmac('sha256', secretKey).update(text, 'utf8').digest('hex');
    result.hmacSha512 = crypto.createHmac('sha512', secretKey).update(text, 'utf8').digest('hex');
  }

  return result;
}

// =========================================================================
// 5. UUID / GUID & Mock Data Generator
// =========================================================================
export function generateUuids(count: number = 5, uppercase: boolean = false, noHyphens: boolean = false): string[] {
  const clamped = Math.max(1, Math.min(500, count));
  const list: string[] = [];
  for (let i = 0; i < clamped; i++) {
    let id: string = crypto.randomUUID();
    if (noHyphens) {
      id = id.replace(/-/g, '');
    }
    if (uppercase) {
      id = id.toUpperCase();
    }
    list.push(id);
  }
  return list;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
}

export function generateMockUsers(count: number = 5): MockUser[] {
  const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Chris', 'Riley', 'Casey', 'Dakota', 'Jamie'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson'];
  const domains = ['example.com', 'testmail.org', 'qa-corp.net', 'techwasti.io'];
  const departments = ['Engineering', 'QA', 'Product', 'DevOps', 'Security'];

  const results: MockUser[] = [];
  const clamped = Math.max(1, Math.min(500, count));

  for (let i = 0; i < clamped; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const num = Math.floor(10 + Math.random() * 90);

    results.push({
      id: crypto.randomUUID(),
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${num}@${domain}`,
      role: i % 2 === 0 ? 'QA Automation Engineer' : 'Full Stack Developer',
      department: departments[Math.floor(Math.random() * departments.length)],
      status: Math.random() > 0.1 ? 'active' : 'inactive'
    });
  }

  return results;
}

// =========================================================================
// 6. Unix Timestamp & Date Converter
// =========================================================================
export interface TimestampResult {
  isoUtc: string;
  utcDateString: string;
  localDateString: string;
  epochSeconds: number;
  epochMilliseconds: number;
}

export function parseTimestamp(input: number): TimestampResult {
  const isMs = input > 1e11;
  const ms = isMs ? input : input * 1000;
  const dt = new Date(ms);

  return {
    isoUtc: dt.toISOString(),
    utcDateString: dt.toUTCString(),
    localDateString: dt.toLocaleString(),
    epochSeconds: Math.floor(ms / 1000),
    epochMilliseconds: ms
  };
}

export function parseDateStringToTimestamp(dateStr: string): { success: boolean; result?: TimestampResult; error?: string } {
  const dt = new Date(dateStr.trim());
  if (isNaN(dt.getTime())) {
    return { success: false, error: `Invalid date format: ${dateStr}` };
  }
  return {
    success: true,
    result: {
      isoUtc: dt.toISOString(),
      utcDateString: dt.toUTCString(),
      localDateString: dt.toLocaleString(),
      epochSeconds: Math.floor(dt.getTime() / 1000),
      epochMilliseconds: dt.getTime()
    }
  };
}

// =========================================================================
// 7. Regex Tester & Inspector
// =========================================================================
export interface RegexMatch {
  match: string;
  index: number;
  groups: string[];
}

export interface RegexResult {
  success: boolean;
  matchCount?: number;
  matches?: RegexMatch[];
  error?: string;
}

export function testRegex(pattern: string, flags: string, text: string): RegexResult {
  try {
    const rx = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    const matches: RegexMatch[] = [];
    let m: RegExpExecArray | null;

    while ((m = rx.exec(text)) !== null) {
      matches.push({
        match: m[0],
        index: m.index,
        groups: m.slice(1)
      });
      if (rx.lastIndex === m.index) {
        rx.lastIndex++;
      }
    }

    return {
      success: true,
      matchCount: matches.length,
      matches
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =========================================================================
// 8. Text Diff Comparison
// =========================================================================
export interface DiffLine {
  type: 'same' | 'added' | 'removed';
  text: string;
}

export function computeSimpleDiff(originalText: string, modifiedText: string): DiffLine[] {
  const origLines = originalText.split('\n');
  const modLines = modifiedText.split('\n');
  const result: DiffLine[] = [];

  let i = 0;
  let j = 0;

  while (i < origLines.length || j < modLines.length) {
    const o = origLines[i];
    const m = modLines[j];

    if (o === m) {
      result.push({ type: 'same', text: o });
      i++;
      j++;
    } else if (i < origLines.length && !modLines.includes(o)) {
      result.push({ type: 'removed', text: o });
      i++;
    } else if (j < modLines.length && !origLines.includes(m)) {
      result.push({ type: 'added', text: m });
      j++;
    } else {
      if (i < origLines.length) {
        result.push({ type: 'removed', text: o });
        i++;
      }
      if (j < modLines.length) {
        result.push({ type: 'added', text: m });
        j++;
      }
    }
  }

  return result;
}

// =========================================================================
// 9. Format Converter: JSON <-> CSV
// =========================================================================
export function jsonToCsv(jsonStr: string): { success: boolean; csv?: string; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    if (arr.length === 0 || typeof arr[0] !== 'object' || arr[0] === null) {
      return { success: false, error: 'JSON input must be an array of objects or an object.' };
    }

    const headers = Object.keys(arr[0]);
    const lines = [headers.join(',')];

    for (const item of arr) {
      const row = headers.map(h => {
        let val = item[h] !== undefined && item[h] !== null ? String(item[h]) : '';
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      });
      lines.push(row.join(','));
    }

    return { success: true, csv: lines.join('\n') };
  } catch (err: any) {
    return { success: false, error: `JSON to CSV conversion error: ${err.message}` };
  }
}

export function csvToJson(csvStr: string): { success: boolean; json?: string; error?: string } {
  try {
    const lines = csvStr.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, error: 'CSV must contain at least a header row and one data row.' };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      rows.push(obj);
    }

    return { success: true, json: JSON.stringify(rows, null, 2) };
  } catch (err: any) {
    return { success: false, error: `CSV to JSON conversion error: ${err.message}` };
  }
}

// =========================================================================
// 10. Curl Command to Code Converter
// =========================================================================
export interface CurlParseResult {
  success: boolean;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: string;
  codeSnippets?: {
    javascriptFetch: string;
    pythonRequests: string;
  };
  error?: string;
}

export function parseCurl(curlCmd: string): CurlParseResult {
  const clean = curlCmd.trim().replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ');
  if (!clean.startsWith('curl')) {
    return { success: false, error: 'Command must start with "curl"' };
  }

  let method = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  let body: string | undefined;

  const matches = clean.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];

  for (let i = 1; i < matches.length; i++) {
    const token = matches[i].replace(/^['"]|['"]$/g, '');

    if ((token === '-X' || token === '--request') && i + 1 < matches.length) {
      method = matches[i + 1].replace(/^['"]|['"]$/g, '').toUpperCase();
      i++;
    } else if ((token === '-H' || token === '--header') && i + 1 < matches.length) {
      const headerVal = matches[i + 1].replace(/^['"]|['"]$/g, '');
      const colonIdx = headerVal.indexOf(':');
      if (colonIdx > 0) {
        const k = headerVal.substring(0, colonIdx).trim();
        const v = headerVal.substring(colonIdx + 1).trim();
        headers[k] = v;
      }
      i++;
    } else if ((token === '-d' || token === '--data' || token === '--data-raw') && i + 1 < matches.length) {
      body = matches[i + 1].replace(/^['"]|['"]$/g, '');
      if (method === 'GET') method = 'POST';
      i++;
    } else if (!token.startsWith('-') && !url) {
      url = token;
    }
  }

  const jsFetch = `fetch('${url}', {\n  method: '${method}',\n  headers: ${JSON.stringify(headers, null, 2)}${body ? `,\n  body: ${JSON.stringify(body)}` : ''}\n})\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`;

  const pyRequests = `import requests\n\nurl = "${url}"\nheaders = ${JSON.stringify(headers, null, 2)}\n${body ? `data = ${JSON.stringify(body)}\nresponse = requests.${method.toLowerCase()}(url, headers=headers, data=data)` : `response = requests.${method.toLowerCase()}(url, headers=headers)`}\n\nprint(response.status_code)\nprint(response.text)`;

  return {
    success: true,
    method,
    url,
    headers,
    body,
    codeSnippets: {
      javascriptFetch: jsFetch,
      pythonRequests: pyRequests
    }
  };
}

// =========================================================================
// 11. String Case Converter & Text Inspector
// =========================================================================
export interface CaseConversions {
  camelCase: string;
  pascalCase: string;
  snakeCase: string;
  kebabCase: string;
  constantCase: string;
  titleCase: string;
}

export function convertCases(text: string): CaseConversions {
  const words = text.match(/[A-Za-z0-9]+/g) || [];
  if (words.length === 0) {
    return {
      camelCase: '',
      pascalCase: '',
      snakeCase: '',
      kebabCase: '',
      constantCase: '',
      titleCase: ''
    };
  }

  const lower = words.map(w => w.toLowerCase());
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return {
    camelCase: lower[0] + lower.slice(1).map(cap).join(''),
    pascalCase: lower.map(cap).join(''),
    snakeCase: lower.join('_'),
    kebabCase: lower.join('-'),
    constantCase: lower.map(w => w.toUpperCase()).join('_'),
    titleCase: lower.map(cap).join(' ')
  };
}

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  bytes: number;
}

export function inspectText(text: string): TextStats {
  const words = text.match(/\b\w+\b/g) || [];
  const lines = text.length > 0 ? text.split('\n').length : 0;
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s+/g, '').length,
    words: words.length,
    lines,
    bytes: Buffer.byteLength(text, 'utf8')
  };
}

// =========================================================================
// 12. Cron Expression Descriptor
// =========================================================================
export function describeCron(cron: string): { success: boolean; description?: string; error?: string } {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      success: false,
      error: 'Invalid cron format. Standard format requires 5 fields: <minute> <hour> <day-of-month> <month> <day-of-week>'
    };
  }

  const [min, hour, dom, mon, dow] = parts;
  const desc: string[] = [];

  if (min === '*') desc.push('Every minute');
  else if (min.startsWith('*/')) desc.push(`Every ${min.slice(2)} minutes`);
  else desc.push(`At minute ${min}`);

  if (hour === '*') desc.push('past every hour');
  else if (hour.startsWith('*/')) desc.push(`every ${hour.slice(2)} hours`);
  else desc.push(`past hour ${hour}`);

  if (dom !== '*') desc.push(`on day ${dom} of the month`);
  if (mon !== '*') desc.push(`in month ${mon}`);
  if (dow !== '*') desc.push(`and on weekday ${dow}`);

  return { success: true, description: desc.join(' ') + '.' };
}

// =========================================================================
// 13. XML Prettifier & Validator
// =========================================================================
export function formatXml(xmlStr: string, indentSpaces: number = 2): { success: boolean; result?: string; error?: string } {
  try {
    let formatted = '';
    let indent = 0;
    const tab = ' '.repeat(indentSpaces);

    const tokens = xmlStr.replace(/>\s*</g, '><').match(/<[^>]+>|[^<]+/g) || [];

    for (const token of tokens) {
      if (token.startsWith('</')) {
        indent = Math.max(0, indent - 1);
        formatted += tab.repeat(indent) + token + '\n';
      } else if (token.startsWith('<') && !token.startsWith('<?') && !token.startsWith('<!') && !token.endsWith('/>')) {
        formatted += tab.repeat(indent) + token + '\n';
        indent++;
      } else {
        formatted += tab.repeat(indent) + token + '\n';
      }
    }
    return { success: true, result: formatted.trim() };
  } catch (err: any) {
    return { success: false, error: `XML format error: ${err.message}` };
  }
}

// =========================================================================
// 14. SQL Formatter & Beautifier
// =========================================================================
export function formatSql(sql: string): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
    'INNER JOIN', 'OUTER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
    'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE',
    'ALTER TABLE', 'DROP TABLE', 'UNION ALL', 'UNION'
  ];

  let cleaned = sql.replace(/\s+/g, ' ').trim();

  keywords.forEach(kw => {
    const rx = new RegExp(`\\b${kw}\\b`, 'gi');
    cleaned = cleaned.replace(rx, `\n${kw}`);
  });

  return cleaned
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join('\n');
}

// =========================================================================
// 15. Hex ↔ Text Converter
// =========================================================================
export function textToHex(text: string, spaceDelimited: boolean = true): string {
  const buf = Buffer.from(text, 'utf8');
  const hex = buf.toString('hex');
  if (!spaceDelimited) return hex;
  return hex.match(/.{1,2}/g)?.join(' ') || '';
}

export function hexToText(hex: string): { success: boolean; result?: string; error?: string } {
  try {
    const clean = hex.replace(/\s+/g, '');
    if (clean.length % 2 !== 0) {
      return { success: false, error: 'Hex string length must be an even number of characters.' };
    }
    const buf = Buffer.from(clean, 'hex');
    return { success: true, result: buf.toString('utf8') };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =========================================================================
// 16. Secure Password / Secret Generator
// =========================================================================
export interface PasswordOptions {
  length: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
}

export function generateSecurePassword(options: PasswordOptions): string {
  const len = Math.max(8, Math.min(128, options.length || 16));
  let chars = '';
  if (options.lowercase !== false) chars += 'abcdefghjkmnpqrstuvwxyz';
  if (options.uppercase !== false) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  if (options.numbers !== false) chars += '23456789';
  if (options.symbols !== false) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (chars.length === 0) chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*';

  const randomBytes = crypto.randomBytes(len);
  let res = '';
  for (let i = 0; i < len; i++) {
    res += chars[randomBytes[i] % chars.length];
  }
  return res;
}

// =========================================================================
// 17. CIDR / IPv4 Subnet Calculator
// =========================================================================
export interface SubnetInfo {
  cidr: string;
  ip: string;
  prefix: number;
  netmask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalHosts: number;
  usableHosts: number;
}

export function calculateSubnet(cidrStr: string): { success: boolean; result?: SubnetInfo; error?: string } {
  try {
    const parts = cidrStr.trim().split('/');
    if (parts.length !== 2) {
      return { success: false, error: 'Invalid CIDR notation. Expected format: 192.168.1.0/24' };
    }

    const ip = parts[0];
    const prefix = parseInt(parts[1], 10);
    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
      return { success: false, error: 'Prefix must be an integer between 0 and 32.' };
    }

    const ipOctets = ip.split('.').map(Number);
    if (ipOctets.length !== 4 || ipOctets.some(o => isNaN(o) || o < 0 || o > 255)) {
      return { success: false, error: 'Invalid IPv4 address format.' };
    }

    const ipInt = (ipOctets[0] << 24) | (ipOctets[1] << 16) | (ipOctets[2] << 8) | ipOctets[3];
    const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix));

    const netInt = ipInt & maskInt;
    const bcastInt = netInt | (~maskInt >>> 0);

    const intToIp = (val: number) => [
      (val >>> 24) & 255,
      (val >>> 16) & 255,
      (val >>> 8) & 255,
      val & 255
    ].join('.');

    const totalHosts = Math.pow(2, 32 - prefix);
    const usableHosts = prefix >= 31 ? 0 : totalHosts - 2;

    return {
      success: true,
      result: {
        cidr: cidrStr,
        ip,
        prefix,
        netmask: intToIp(maskInt),
        networkAddress: intToIp(netInt),
        broadcastAddress: intToIp(bcastInt),
        firstUsableIp: prefix >= 31 ? 'N/A' : intToIp(netInt + 1),
        lastUsableIp: prefix >= 31 ? 'N/A' : intToIp(bcastInt - 1),
        totalHosts,
        usableHosts
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =========================================================================
// 18. HTTP Status Codes & Headers Reference
// =========================================================================
export interface HttpStatusDetail {
  code: number;
  phrase: string;
  description: string;
  category: '1xx Informational' | '2xx Success' | '3xx Redirection' | '4xx Client Error' | '5xx Server Error';
}

const HTTP_CODES_MAP: Record<number, { phrase: string; desc: string; category: HttpStatusDetail['category'] }> = {
  200: { phrase: 'OK', desc: 'Standard successful HTTP response.', category: '2xx Success' },
  201: { phrase: 'Created', desc: 'Resource successfully created.', category: '2xx Success' },
  204: { phrase: 'No Content', desc: 'Request succeeded, but returns no message body.', category: '2xx Success' },
  301: { phrase: 'Moved Permanently', desc: 'Target resource has been assigned a new permanent URI.', category: '3xx Redirection' },
  304: { phrase: 'Not Modified', desc: 'Client has cached copy, no need to retransmit.', category: '3xx Redirection' },
  400: { phrase: 'Bad Request', desc: 'Server cannot process request due to client error/invalid payload.', category: '4xx Client Error' },
  401: { phrase: 'Unauthorized', desc: 'Authentication is required and has failed or not been provided.', category: '4xx Client Error' },
  403: { phrase: 'Forbidden', desc: 'Server understands request, but refuses to authorize it.', category: '4xx Client Error' },
  404: { phrase: 'Not Found', desc: 'Requested resource could not be found.', category: '4xx Client Error' },
  405: { phrase: 'Method Not Allowed', desc: 'HTTP method not supported for target resource.', category: '4xx Client Error' },
  409: { phrase: 'Conflict', desc: 'Request conflicts with current state of resource.', category: '4xx Client Error' },
  422: { phrase: 'Unprocessable Entity', desc: 'Semantic validation errors in request body.', category: '4xx Client Error' },
  429: { phrase: 'Too Many Requests', desc: 'User has sent too many requests in given amount of time (rate limited).', category: '4xx Client Error' },
  500: { phrase: 'Internal Server Error', desc: 'Generic unexpected server error condition.', category: '5xx Server Error' },
  502: { phrase: 'Bad Gateway', desc: 'Gateway/proxy received an invalid response from upstream.', category: '5xx Server Error' },
  503: { phrase: 'Service Unavailable', desc: 'Server currently unable to handle request due to overload/maintenance.', category: '5xx Server Error' },
  504: { phrase: 'Gateway Timeout', desc: 'Gateway/proxy did not receive timely response from upstream.', category: '5xx Server Error' }
};

export function lookupHttpStatusCode(code: number): HttpStatusDetail | null {
  const item = HTTP_CODES_MAP[code];
  if (!item) return null;
  return {
    code,
    phrase: item.phrase,
    description: item.desc,
    category: item.category
  };
}

// =========================================================================
// 19. Markdown to HTML Converter (Offline)
// =========================================================================
export function markdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');

  // Handle unordered list items
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

  // Paragraphs
  const paras = html.split(/\n{2,}/);
  return paras
    .map(p => {
      p = p.trim();
      if (!p) return '';
      if (/^<(h[1-6]|ul|li|blockquote|pre)/i.test(p)) return p;
      return `<p>${p.replace(/\n/g, '<br/>')}</p>`;
    })
    .filter(Boolean)
    .join('\n');
}

// =========================================================================
// 20. Color Palette & Format Converter (HEX, RGB, HSL)
// =========================================================================
export interface ColorInfo {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  r: number;
  g: number;
  b: number;
}

export function convertColor(input: string): { success: boolean; result?: ColorInfo; error?: string } {
  let str = input.trim();
  let r = 0, g = 0, b = 0;

  try {
    if (str.startsWith('#')) {
      let hex = str.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
      }
      if (hex.length !== 6) {
        return { success: false, error: 'HEX color must be 3 or 6 characters (e.g. #38bdf8).' };
      }
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (str.toLowerCase().startsWith('rgb')) {
      const match = str.match(/\d+/g);
      if (!match || match.length < 3) {
        return { success: false, error: 'Invalid rgb() format. Expected rgb(255, 255, 255).' };
      }
      r = Math.min(255, parseInt(match[0], 10));
      g = Math.min(255, parseInt(match[1], 10));
      b = Math.min(255, parseInt(match[2], 10));
    } else {
      return { success: false, error: 'Color format not recognized. Use HEX (e.g. #38bdf8) or RGB (e.g. rgb(56, 189, 248)).' };
    }

    const toHexVal = (n: number) => n.toString(16).padStart(2, '0');
    const hex = `#${toHexVal(r)}${toHexVal(g)}${toHexVal(b)}`.toUpperCase();
    const rgbStr = `rgb(${r}, ${g}, ${b})`;
    const rgbaStr = `rgba(${r}, ${g}, ${b}, 1.0)`;

    // Calculate HSL
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: h = (bNorm - rNorm) / d + 2; break;
        case bNorm: h = (rNorm - gNorm) / d + 4; break;
      }
      h /= 6;
    }

    const hslStr = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

    return {
      success: true,
      result: {
        hex,
        rgb: rgbStr,
        rgba: rgbaStr,
        hsl: hslStr,
        r, g, b
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// =========================================================================
// 21. Dummy Data & Lorem Ipsum Text Generator
// =========================================================================
export function generateLoremIpsum(paragraphs: number = 3): string {
  const words = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const count = Math.max(1, Math.min(20, paragraphs));
  const paras: string[] = [];

  for (let p = 0; p < count; p++) {
    const sentencesCount = 4 + Math.floor(Math.random() * 3);
    const sentences: string[] = [];
    for (let s = 0; s < sentencesCount; s++) {
      const sentenceLen = 6 + Math.floor(Math.random() * 10);
      const sWords: string[] = [];
      for (let w = 0; w < sentenceLen; w++) {
        sWords.push(words[Math.floor(Math.random() * words.length)]);
      }
      const sentence = sWords.join(' ');
      sentences.push(sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
    }
    paras.push(sentences.join(' '));
  }

  return paras.join('\n\n');
}

// =========================================================================
// 22. URL Query String & URI Component Parser
// =========================================================================
export interface ParsedUrlDetails {
  protocol: string;
  host: string;
  port: string;
  pathname: string;
  hash: string;
  searchParams: Record<string, string>;
}

export function parseUrlQuery(urlStr: string): { success: boolean; result?: ParsedUrlDetails; error?: string } {
  try {
    const parsed = new URL(urlStr.trim());
    const params: Record<string, string> = {};
    parsed.searchParams.forEach((val, key) => {
      params[key] = val;
    });

    return {
      success: true,
      result: {
        protocol: parsed.protocol,
        host: parsed.host,
        port: parsed.port || (parsed.protocol === 'https:' ? '443' : parsed.protocol === 'http:' ? '80' : ''),
        pathname: parsed.pathname,
        hash: parsed.hash,
        searchParams: params
      }
    };
  } catch (err: any) {
    return { success: false, error: `Invalid URL: ${err.message}` };
  }
}

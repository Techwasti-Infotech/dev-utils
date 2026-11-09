import * as http from 'http';
import {
  RestApiRequest,
  executeRestRequest,
  parseBruFile,
  serializeToBruFile,
  evaluateAssertion,
  runTestScript,
  interpolateVariables,
  generateCurlFromRequest
} from '../../src/shared/utils/restClientEngine';

describe('Bruno-like REST API Testing Tool Engine', () => {
  let server: http.Server;
  let serverPort: number;

  beforeAll((done) => {
    server = http.createServer((req, res) => {
      let bodyData = '';
      req.on('data', chunk => {
        bodyData += chunk;
      });

      req.on('end', () => {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);

        // Custom echo endpoint
        if (url.pathname === '/api/echo') {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'X-Custom-Echo': 'DevUtils-Test'
          });
          res.end(JSON.stringify({
            method: req.method,
            path: url.pathname,
            query: Object.fromEntries(url.searchParams.entries()),
            headers: req.headers,
            body: bodyData ? JSON.parse(bodyData) : null
          }));
          return;
        }

        // Auth protected endpoint
        if (url.pathname === '/api/protected') {
          const auth = req.headers['authorization'];
          if (auth === 'Bearer test-secret-token-123') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ authenticated: true, user: 'tester' }));
          } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ authenticated: false, error: 'Unauthorized' }));
          }
          return;
        }

        // Delay endpoint for responseTime testing
        if (url.pathname === '/api/delay') {
          setTimeout(() => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ delayed: true }));
          }, 50);
          return;
        }

        // 404 fallback
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      serverPort = address.port;
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('Variable interpolation works properly with {{var}} syntax', () => {
    const template = '{{baseUrl}}/api/users/{{userId}}?limit={{limit}}';
    const vars = {
      baseUrl: 'http://localhost:8080',
      userId: '42',
      limit: '10'
    };
    const resolved = interpolateVariables(template, vars);
    expect(resolved).toBe('http://localhost:8080/api/users/42?limit=10');
  });

  test('Execute GET request with query params & assertions against test server', async () => {
    const request: RestApiRequest = {
      method: 'GET',
      url: `http://127.0.0.1:${serverPort}/api/echo`,
      params: [
        { key: 'filter', value: 'active', enabled: true },
        { key: 'page', value: '2', enabled: true },
        { key: 'disabled', value: 'ignore', enabled: false }
      ],
      assertions: [
        'res.status: eq 200',
        'res.body.query.filter: eq active',
        'res.body.query.page: eq 2',
        'res.body.query.disabled: isEmpty'
      ]
    };

    const res = await executeRestRequest(request);

    expect(res.status).toBe(200);
    expect(res.parsedBody).toBeDefined();
    expect(res.parsedBody.query.filter).toBe('active');
    expect(res.parsedBody.query.page).toBe('2');
    expect(res.parsedBody.query.disabled).toBeUndefined();

    // Check assertions
    expect(res.assertions.length).toBe(4);
    expect(res.assertions.every(a => a.passed)).toBe(true);
  });

  test('Execute POST request with JSON body and header verification', async () => {
    const request: RestApiRequest = {
      method: 'POST',
      url: `http://127.0.0.1:${serverPort}/api/echo`,
      headers: [
        { key: 'X-Client-App', value: 'DevUtils-Desktop', enabled: true }
      ],
      body: {
        type: 'json',
        raw: JSON.stringify({ item: 'Widget A', price: 99.99, inStock: true })
      },
      assertions: [
        'res.status: eq 200',
        'res.body.body.item: eq "Widget A"',
        'res.body.body.price: eq 99.99',
        'res.body.body.inStock: eq true'
      ]
    };

    const res = await executeRestRequest(request);
    expect(res.status).toBe(200);
    expect(res.parsedBody.headers['x-client-app']).toBe('DevUtils-Desktop');
    expect(res.parsedBody.body.item).toBe('Widget A');
    expect(res.assertions.every(a => a.passed)).toBe(true);
  });

  test('Authentication via Bearer token succeeds and fails correctly', async () => {
    // 1. Success with token
    const successReq: RestApiRequest = {
      method: 'GET',
      url: `http://127.0.0.1:${serverPort}/api/protected`,
      auth: {
        type: 'bearer',
        bearer: { token: 'test-secret-token-123' }
      },
      assertions: [
        'res.status: eq 200',
        'res.body.authenticated: eq true',
        'res.body.user: eq tester'
      ]
    };

    const resSuccess = await executeRestRequest(successReq);
    expect(resSuccess.status).toBe(200);
    expect(resSuccess.assertions.every(a => a.passed)).toBe(true);

    // 2. Failure with wrong token
    const failReq: RestApiRequest = {
      method: 'GET',
      url: `http://127.0.0.1:${serverPort}/api/protected`,
      auth: {
        type: 'bearer',
        bearer: { token: 'wrong-token' }
      },
      assertions: [
        'res.status: eq 401',
        'res.body.authenticated: eq false'
      ]
    };

    const resFail = await executeRestRequest(failReq);
    expect(resFail.status).toBe(401);
    expect(resFail.assertions.every(a => a.passed)).toBe(true);
  });

  test('Post-response test script execution runs assertions and logs', async () => {
    const testScript = `
      test("Status code is 200", () => {
        expect(res.status).toBe(200);
      });
      test("Returned body has user tester", () => {
        expect(res.data.user).toBe("tester");
      });
      console.log("Logged from script, user is " + res.data.user);
    `;

    const request: RestApiRequest = {
      method: 'GET',
      url: `http://127.0.0.1:${serverPort}/api/protected`,
      auth: {
        type: 'bearer',
        bearer: { token: 'test-secret-token-123' }
      },
      tests: testScript
    };

    const res = await executeRestRequest(request);
    expect(res.status).toBe(200);
    expect(res.tests.length).toBe(2);
    expect(res.tests[0].passed).toBe(true);
    expect(res.tests[1].passed).toBe(true);
    expect(res.consoleLogs).toContain('Logged from script, user is tester');
  });

  test('Pre-request script modifies environment or logs before execution', async () => {
    const request: RestApiRequest = {
      method: 'GET',
      url: `http://127.0.0.1:${serverPort}/api/echo`,
      preRequestScript: `
        console.log("Preparing request for echo endpoint");
        env.dynamicToken = "token_from_pre_script";
      `,
      headers: [
        { key: 'X-Pre-Token', value: '{{dynamicToken}}', enabled: true }
      ]
    };

    const envVars: Record<string, string> = {};
    const res = await executeRestRequest(request, envVars);
    expect(res.status).toBe(200);
    expect(res.consoleLogs.some(l => l.includes('Preparing request for echo endpoint'))).toBe(true);
    expect(res.parsedBody.headers['x-pre-token']).toBe('token_from_pre_script');
  });

  test('Bruno (.bru) parser parses declarative bru format into RestApiRequest', () => {
    const bruSample = `
meta {
  name: Get User Details
  type: http
  seq: 2
}

get {
  url: https://api.example.com/users/123
  body: none
  auth: bearer
}

params:query {
  includeDetails: true
  ~verbose: false
}

headers {
  Accept: application/json
  ~X-Deprecated: true
}

auth:bearer {
  token: secret-token-xyz
}

assert {
  res.status: eq 200
  res.body.id: eq 123
}

tests {
  test("Validate user id", () => {
    expect(res.data.id).toBe(123);
  });
}
`;

    const parsed = parseBruFile(bruSample);
    expect(parsed.name).toBe('Get User Details');
    expect(parsed.method).toBe('GET');
    expect(parsed.url).toBe('https://api.example.com/users/123');
    expect(parsed.auth?.type).toBe('bearer');
    expect(parsed.auth?.bearer?.token).toBe('secret-token-xyz');
    expect(parsed.headers?.length).toBe(2);
    expect(parsed.headers?.[0].key).toBe('Accept');
    expect(parsed.headers?.[0].enabled).toBe(true);
    expect(parsed.headers?.[1].enabled).toBe(false);
    expect(parsed.params?.length).toBe(2);
    expect(parsed.assertions?.length).toBe(2);
    expect(parsed.tests).toContain('Validate user id');
  });

  test('Bruno (.bru) serializer generates valid declarative markup', () => {
    const request: RestApiRequest = {
      name: 'Create User',
      method: 'POST',
      url: 'https://api.example.com/users',
      headers: [
        { key: 'Content-Type', value: 'application/json', enabled: true }
      ],
      params: [
        { key: 'notify', value: 'true', enabled: true }
      ],
      body: {
        type: 'json',
        raw: '{"username": "johndoe", "email": "john@example.com"}'
      },
      auth: {
        type: 'bearer',
        bearer: { token: 'my-token' }
      },
      assertions: [
        'res.status: eq 201'
      ]
    };

    const bruString = serializeToBruFile(request);
    expect(bruString).toContain('meta {');
    expect(bruString).toContain('name: Create User');
    expect(bruString).toContain('post {');
    expect(bruString).toContain('url: https://api.example.com/users');
    expect(bruString).toContain('auth:bearer {');
    expect(bruString).toContain('token: my-token');
    expect(bruString).toContain('body:json {');
    expect(bruString).toContain('assert {');
    expect(bruString).toContain('res.status: eq 201');

    // Round-trip parse test
    const reparsed = parseBruFile(bruString);
    expect(reparsed.name).toBe(request.name);
    expect(reparsed.method).toBe('POST');
    expect(reparsed.url).toBe(request.url);
    expect(reparsed.body?.type).toBe('json');
  });

  test('cURL command generation creates valid CLI curl command', () => {
    const request: RestApiRequest = {
      name: 'Test Request',
      method: 'POST',
      url: 'https://api.example.com/v1/resource',
      headers: [
        { key: 'Accept', value: 'application/json', enabled: true }
      ],
      params: [
        { key: 'limit', value: '50', enabled: true }
      ],
      body: {
        type: 'json',
        raw: '{"active": true}'
      },
      auth: {
        type: 'bearer',
        bearer: { token: 'tok_abc123' }
      }
    };

    const curl = generateCurlFromRequest(request);
    expect(curl).toContain("curl --request POST");
    expect(curl).toContain("--url 'https://api.example.com/v1/resource?limit=50'");
    expect(curl).toContain("--header 'Authorization: Bearer tok_abc123'");
    expect(curl).toContain("--header 'Content-Type: application/json'");
    expect(curl).toContain("--data '{\"active\": true}'");
  });
});


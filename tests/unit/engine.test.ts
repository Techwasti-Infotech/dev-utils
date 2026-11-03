import {
  formatJson,
  minifyJson,
  decodeJwt,
  base64Encode,
  base64Decode,
  urlEncode,
  urlDecode,
  escapeHtml,
  unescapeHtml,
  generateHashes,
  generateUuids,
  generateMockUsers,
  parseTimestamp,
  parseDateStringToTimestamp,
  testRegex,
  computeSimpleDiff,
  jsonToCsv,
  csvToJson,
  parseCurl,
  convertCases,
  inspectText,
  describeCron,
  formatXml,
  formatSql,
  textToHex,
  hexToText,
  generateSecurePassword,
  calculateSubnet,
  lookupHttpStatusCode
} from '../../src/shared/utils/engine';

describe('DevUtils TypeScript Core Engine Unit Tests', () => {

  // 1. JSON
  test('formatJson & minifyJson', () => {
    const raw = '{"a":1,"b":[true,false]}';
    const formatted = formatJson(raw);
    expect(formatted.success).toBe(true);
    expect(formatted.result).toContain('  "a": 1');

    const minified = minifyJson(raw);
    expect(minified.success).toBe(true);
    expect(minified.result).toBe('{"a":1,"b":[true,false]}');

    const invalid = formatJson('{not valid json}');
    expect(invalid.success).toBe(false);
    expect(invalid.error).toBeDefined();
  });

  // 2. JWT Offline Decoder
  test('decodeJwt offline validation', () => {
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJ1c2VyIjoidGVzdGVyIiwiZXhwIjoxOTk5OTk5OTk5fQ.signature_part';
    const decoded = decodeJwt(token);
    expect(decoded.success).toBe(true);
    expect(decoded.header?.alg).toBe('HS256');
    expect(decoded.payload?.user).toBe('tester');
    expect(decoded.claimsInfo?.isExpired).toBe(false);
  });

  // 3. Encoders & Decoders
  test('Base64, URL and HTML entity conversions', () => {
    const original = 'Techwasti QA & Developer Studio 2026!';
    const b64 = base64Encode(original);
    expect(base64Decode(b64).result).toBe(original);

    const urlStr = 'param=hello world & symbol=+';
    const encodedUrl = urlEncode(urlStr);
    expect(urlDecode(encodedUrl)).toBe(urlStr);

    const script = '<script src="evil.js">alert("test");</script>';
    const escaped = escapeHtml(script);
    expect(escaped).toContain('&lt;script');
    expect(unescapeHtml(escaped)).toBe(script);
  });

  // 4. Cryptographic Hashing
  test('generateHashes generates expected hashes & HMAC', () => {
    const hashes = generateHashes('super-secret-text', 'hmac-key');
    expect(hashes.sha256).toBeDefined();
    expect(hashes.sha256.length).toBe(64);
    expect(hashes.md5.length).toBe(32);
    expect(hashes.hmacSha256).toBeDefined();
    expect(hashes.hmacSha256?.length).toBe(64);
  });

  // 5. UUIDs and Mock Data
  test('UUID generation and Mock user generation', () => {
    const uuids = generateUuids(5, true, true);
    expect(uuids.length).toBe(5);
    expect(uuids[0].length).toBe(32);
    expect(uuids[0]).toBe(uuids[0].toUpperCase());

    const users = generateMockUsers(10);
    expect(users.length).toBe(10);
    expect(users[0].email).toContain('@');
    expect(users[0].department).toBeDefined();
  });

  // 6. Timestamps
  test('Unix timestamp conversions', () => {
    const epoch = 1609459200;
    const parsed = parseTimestamp(epoch);
    expect(parsed.isoUtc).toBe('2021-01-01T00:00:00.000Z');

    const strParsed = parseDateStringToTimestamp('2021-01-01T00:00:00Z');
    expect(strParsed.success).toBe(true);
    expect(strParsed.result?.epochSeconds).toBe(epoch);
  });

  // 7. Regex Tester
  test('Regex testing and group captures', () => {
    const pattern = '\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b';
    const text = 'Reach out to support@techwasti.com or info@devutils.io for info';
    const res = testRegex(pattern, 'i', text);
    expect(res.success).toBe(true);
    expect(res.matchCount).toBe(2);
    expect(res.matches?.[0].match).toBe('support@techwasti.com');
  });

  // 8. Text Diff
  test('Text Diff calculation', () => {
    const t1 = 'Line 1\nLine 2';
    const t2 = 'Line 1\nLine 2 modified\nLine 3';
    const diff = computeSimpleDiff(t1, t2);
    expect(diff.some(d => d.type === 'added')).toBe(true);
  });

  // 9. Format Converter
  test('JSON <-> CSV bidirectional transformation', () => {
    const json = JSON.stringify([{ id: '1', role: 'developer' }, { id: '2', role: 'qa' }]);
    const csvRes = jsonToCsv(json);
    expect(csvRes.success).toBe(true);
    expect(csvRes.csv).toContain('id,role');

    const jsonBack = csvToJson(csvRes.csv!);
    expect(jsonBack.success).toBe(true);
    expect(JSON.parse(jsonBack.json!).length).toBe(2);
  });

  // 10. Curl Parser
  test('Curl parser to code snippets', () => {
    const cmd = `curl -X POST https://api.techwasti.com/items -H "Content-Type: application/json" -d "{\\"title\\":\\"test\\"}"`;
    const parsed = parseCurl(cmd);
    expect(parsed.success).toBe(true);
    expect(parsed.method).toBe('POST');
    expect(parsed.url).toBe('https://api.techwasti.com/items');
    expect(parsed.codeSnippets?.javascriptFetch).toContain('fetch(');
    expect(parsed.codeSnippets?.pythonRequests).toContain('import requests');
  });

  // 11. String Cases & Stats
  test('String case conversion and word stats', () => {
    const cases = convertCases('dev utils for desktop');
    expect(cases.camelCase).toBe('devUtilsForDesktop');
    expect(cases.snakeCase).toBe('dev_utils_for_desktop');
    expect(cases.kebabCase).toBe('dev-utils-for-desktop');

    // 'Hello', 'world', 'from', 'QA', 'studio', 'Line', '2' -> 7 words
    const stats = inspectText('Hello world from QA studio\nLine 2');
    expect(stats.words).toBe(7);
    expect(stats.lines).toBe(2);
  });

  // 12. Cron Descriptor
  test('Cron descriptor', () => {
    const desc = describeCron('*/15 10 * * 1');
    expect(desc.success).toBe(true);
    expect(desc.description).toContain('Every 15 minutes');
  });

  // 13. XML Prettifier
  test('XML formatter indents nested elements', () => {
    const xml = '<root><user id="1"><name>Alice</name></user></root>';
    const res = formatXml(xml);
    expect(res.success).toBe(true);
    expect(res.result).toContain('<user');
    expect(res.result).toContain('Alice');
    expect(res.result).toContain('</name>');
  });

  // 14. SQL Formatter
  test('SQL formatter uppercases keywords and breaks lines', () => {
    const sql = 'select u.id, u.name from users u where u.status = 1 and u.role = "qa"';
    const formatted = formatSql(sql);
    expect(formatted).toContain('SELECT');
    expect(formatted).toContain('FROM');
    expect(formatted).toContain('WHERE');
    expect(formatted).toContain('AND');
  });

  // 15. Hex ↔ Text
  test('Hex conversion bidirectional', () => {
    const text = 'DevUtils QA';
    const hex = textToHex(text, true);
    expect(hex.length).toBeGreaterThan(10);

    const back = hexToText(hex);
    expect(back.success).toBe(true);
    expect(back.result).toBe(text);
  });

  // 16. Secure Password Generator
  test('generateSecurePassword respects length and characters', () => {
    const pwd = generateSecurePassword({ length: 24, symbols: true, numbers: true });
    expect(pwd.length).toBe(24);
    expect(typeof pwd).toBe('string');
  });

  // 17. CIDR / Subnet Calculator
  test('calculateSubnet handles standard IPv4 /24', () => {
    const sub = calculateSubnet('192.168.1.50/24');
    expect(sub.success).toBe(true);
    expect(sub.result?.netmask).toBe('255.255.255.0');
    expect(sub.result?.networkAddress).toBe('192.168.1.0');
    expect(sub.result?.broadcastAddress).toBe('192.168.1.255');
    expect(sub.result?.firstUsableIp).toBe('192.168.1.1');
    expect(sub.result?.lastUsableIp).toBe('192.168.1.254');
    expect(sub.result?.usableHosts).toBe(254);
  });

  // 18. HTTP Status Codes
  test('lookupHttpStatusCode returns details', () => {
    const ok = lookupHttpStatusCode(200);
    expect(ok?.phrase).toBe('OK');
    expect(ok?.category).toBe('2xx Success');

    const notFound = lookupHttpStatusCode(404);
    expect(notFound?.phrase).toBe('Not Found');

    const unknown = lookupHttpStatusCode(999);
    expect(unknown).toBeNull();
  });
});

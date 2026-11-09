// Renderer script: Event binding and UI controller for all 18 utilities

const toolsMeta = {
  'json-tab': {
    title: 'JSON Formatter & Minifier',
    desc: 'Format, minify, and validate JSON payloads instantly with zero network transmission.'
  },
  'jwt-tab': {
    title: 'JWT Inspector',
    desc: 'Inspect JWT header, payload, expiry status, and timestamps completely offline.'
  },
  'converter-tab': {
    title: 'JSON ↔ CSV Converter',
    desc: 'Convert data between JSON array of objects and CSV spreadsheets.'
  },
  'xml-tab': {
    title: 'XML Prettifier & Validator',
    desc: 'Format nested XML documents and inspect tags locally.'
  },
  'sql-tab': {
    title: 'SQL Query Beautifier',
    desc: 'Format messy SQL queries with standardized keyword capitalization and indentation.'
  },
  'codec-tab': {
    title: 'Base64 / URL / HTML Encoders',
    desc: 'Encode and decode Base64 strings, URL parameters, and HTML entities.'
  },
  'hex-tab': {
    title: 'Hex ↔ Text Converter',
    desc: 'Convert raw strings to hexadecimal byte representations and back.'
  },
  'hash-tab': {
    title: 'Hash & HMAC Generator',
    desc: 'Calculate cryptographic digests (MD5, SHA-1, SHA-256, SHA-512, HMAC) locally.'
  },
  'password-tab': {
    title: 'Secure Password / Secret Generator',
    desc: 'Generate cryptographically random passwords and secrets with custom criteria.'
  },
  'regex-tab': {
    title: 'Regex Tester & Debugger',
    desc: 'Test and inspect regular expressions with match groups and occurrences.'
  },
  'rest-tab': {
    title: 'REST Client & API Testing (Bruno-compatible)',
    desc: 'Feature-rich HTTP/REST testing tool with collections, environments, assertions, and .bru file support.'
  },
  'diff-tab': {
    title: 'Text Diff & Comparison',
    desc: 'Compare two text snippets side-by-side with color-coded additions and deletions.'
  },
  'generator-tab': {
    title: 'UUID & Mock QA Data Generator',
    desc: 'Quickly generate random UUIDs/GUIDs and fake user profile datasets for testing.'
  },
  'http-tab': {
    title: 'HTTP Status & Headers Reference',
    desc: 'Quick offline lookup for HTTP response codes and semantics.'
  },
  'curl-tab': {
    title: 'cURL Command to Code Converter',
    desc: 'Translate cURL requests into copy-pasteable JavaScript fetch and Python requests scripts.'
  },
  'subnet-tab': {
    title: 'CIDR / Subnet Calculator',
    desc: 'Compute netmask, network address, broadcast address, and usable IP ranges.'
  },
  'timestamp-tab': {
    title: 'Unix Timestamp / Epoch Converter',
    desc: 'Convert Unix epoch seconds and milliseconds to UTC and local human-readable dates.'
  },
  'text-tab': {
    title: 'String Case Converter & Inspector',
    desc: 'Transform text into camelCase, snake_case, kebab-case, and measure word/byte stats.'
  },
  'cron-tab': {
    title: 'Cron Expression Explainer',
    desc: 'Translate 5-part cron schedules into plain English.'
  },
  'markdown-tab': {
    title: 'Markdown to HTML Converter & Preview',
    desc: 'Render Markdown into sanitized HTML with live preview and syntax translation.'
  },
  'color-tab': {
    title: 'Color Palette & Format Converter',
    desc: 'Convert color values between HEX, RGB, RGBA, and HSL.'
  },
  'lorem-tab': {
    title: 'Lorem Ipsum Dummy Text Generator',
    desc: 'Generate paragraphs of placeholder text for UI layouts and test mockups.'
  },
  'url-tab': {
    title: 'URL & Query String Parser',
    desc: 'Decompose URLs into protocol, host, port, path, hash, and parsed key-value parameters.'
  },
  'yaml-tab': {
    title: 'YAML ↔ JSON Converter',
    desc: 'Bidirectional translation and formatting between YAML configuration files and JSON.'
  },
  'schema-tab': {
    title: 'JSON Schema Validator',
    desc: 'Verify JSON objects against JSON Schema definitions with error reporting.'
  },
  'chmod-tab': {
    title: 'Unix Chmod Permissions Calculator',
    desc: 'Calculate octal codes, symbolic notation, and interactive permission flags.'
  },
  'env-tab': {
    title: '.env ↔ JSON Environment Config',
    desc: 'Convert dotenv configuration files to structured JSON objects and back.'
  },
  'minifier-tab': {
    title: 'Quick Code Minifier (JS / CSS / HTML)',
    desc: 'Remove comments, whitespace, and collapse production scripts and stylesheets.'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupJsonTool();
  setupJwtTool();
  setupConverterTool();
  setupXmlTool();
  setupSqlTool();
  setupCodecTool();
  setupHexTool();
  setupHashTool();
  setupPasswordTool();
  setupRegexTool();
  setupDiffTool();
  setupGeneratorTool();
  setupHttpLookupTool();
  setupCurlTool();
  setupSubnetTool();
  setupTimestampTool();
  setupTextTool();
  setupCronTool();
  setupMarkdownTool();
  setupColorTool();
  setupLoremTool();
  setupUrlTool();
  setupRestApiTool();
  setupYamlTool();
  setupSchemaTool();
  setupChmodTool();
  setupEnvTool();
  setupMinifierTool();
});

// Navigation & Tab Switching
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const panes = document.querySelectorAll('.tab-pane');
  const titleEl = document.getElementById('active-tool-title');
  const descEl = document.getElementById('active-tool-desc');
  const searchInput = document.getElementById('tool-search');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-tab');
      navItems.forEach(n => n.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add('active');

      if (toolsMeta[targetId]) {
        titleEl.textContent = toolsMeta[targetId].title;
        descEl.textContent = toolsMeta[targetId].desc;
      }
    });
  });

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    navItems.forEach(item => {
      const txt = item.textContent.toLowerCase();
      item.style.display = txt.includes(q) ? 'flex' : 'none';
    });
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

// 1. JSON Tool
function setupJsonTool() {
  const input = document.getElementById('json-input');
  const output = document.getElementById('json-output');
  const status = document.getElementById('json-status');

  document.getElementById('json-format-btn').onclick = async () => {
    const res = await window.devUtilsAPI.json.format(input.value, 2);
    if (res.success) {
      output.value = res.result;
      status.textContent = '✓ Valid JSON formatted';
      status.style.color = 'var(--success-color)';
    } else {
      output.value = res.error;
      status.textContent = '✕ ' + res.error;
      status.style.color = 'var(--error-color)';
    }
  };

  document.getElementById('json-format-4-btn').onclick = async () => {
    const res = await window.devUtilsAPI.json.format(input.value, 4);
    if (res.success) output.value = res.result;
  };

  document.getElementById('json-minify-btn').onclick = async () => {
    const res = await window.devUtilsAPI.json.minify(input.value);
    if (res.success) output.value = res.result;
  };

  document.getElementById('json-clear-btn').onclick = () => {
    input.value = '';
    output.value = '';
    status.textContent = '';
  };

  document.getElementById('json-copy-btn').onclick = () => {
    navigator.clipboard.writeText(output.value);
  };
}

// 2. JWT Tool
function setupJwtTool() {
  const input = document.getElementById('jwt-input');
  const headerOut = document.getElementById('jwt-header-output');
  const payloadOut = document.getElementById('jwt-payload-output');
  const banner = document.getElementById('jwt-claims-banner');

  document.getElementById('jwt-decode-btn').onclick = async () => {
    const res = await window.devUtilsAPI.jwt.decode(input.value);
    if (res.success) {
      headerOut.value = JSON.stringify(res.header, null, 2);
      payloadOut.value = JSON.stringify(res.payload, null, 2);

      let msg = '';
      if (res.claimsInfo?.isExpired !== undefined) {
        msg += res.claimsInfo.isExpired ? '⚠️ Token is EXPIRED' : '✓ Token is ACTIVE';
        if (res.claimsInfo.expiresAtUtc) msg += ` (Expires: ${res.claimsInfo.expiresAtUtc})`;
      }
      banner.textContent = msg;
      banner.style.color = res.claimsInfo?.isExpired ? 'var(--error-color)' : 'var(--success-color)';
    } else {
      headerOut.value = '';
      payloadOut.value = res.error;
      banner.textContent = '✕ Error decoding token';
      banner.style.color = 'var(--error-color)';
    }
  };

  document.getElementById('jwt-clear-btn').onclick = () => {
    input.value = '';
    headerOut.value = '';
    payloadOut.value = '';
    banner.textContent = '';
  };
}

// 3. Converter Tool
function setupConverterTool() {
  const input = document.getElementById('conv-input');
  const output = document.getElementById('conv-output');

  document.getElementById('json-to-csv-btn').onclick = async () => {
    const res = await window.devUtilsAPI.convert.jsonToCsv(input.value);
    output.value = res.success ? res.csv : res.error;
  };

  document.getElementById('csv-to-json-btn').onclick = async () => {
    const res = await window.devUtilsAPI.convert.csvToJson(input.value);
    output.value = res.success ? res.json : res.error;
  };

  document.getElementById('conv-clear-btn').onclick = () => {
    input.value = '';
    output.value = '';
  };

  document.getElementById('conv-copy-btn').onclick = () => {
    navigator.clipboard.writeText(output.value);
  };
}

// 4. XML Tool
function setupXmlTool() {
  const input = document.getElementById('xml-input');
  const output = document.getElementById('xml-output');

  document.getElementById('xml-format-btn').onclick = async () => {
    const res = await window.devUtilsAPI.xml.format(input.value, 2);
    output.value = res.success ? res.result : res.error;
  };

  document.getElementById('xml-clear-btn').onclick = () => {
    input.value = '';
    output.value = '';
  };

  document.getElementById('xml-copy-btn').onclick = () => {
    navigator.clipboard.writeText(output.value);
  };
}

// 5. SQL Tool
function setupSqlTool() {
  const input = document.getElementById('sql-input');
  const output = document.getElementById('sql-output');

  document.getElementById('sql-format-btn').onclick = async () => {
    output.value = await window.devUtilsAPI.sql.format(input.value);
  };

  document.getElementById('sql-clear-btn').onclick = () => {
    input.value = '';
    output.value = '';
  };

  document.getElementById('sql-copy-btn').onclick = () => {
    navigator.clipboard.writeText(output.value);
  };
}

// 6. Codec Tool
function setupCodecTool() {
  const input = document.getElementById('codec-input');
  const output = document.getElementById('codec-output');

  document.getElementById('b64-encode-btn').onclick = async () => {
    output.value = await window.devUtilsAPI.codec.base64Encode(input.value);
  };

  document.getElementById('b64-decode-btn').onclick = async () => {
    const res = await window.devUtilsAPI.codec.base64Decode(input.value);
    output.value = res.success ? res.result : res.error;
  };

  document.getElementById('url-encode-btn').onclick = async () => {
    output.value = await window.devUtilsAPI.codec.urlEncode(input.value);
  };

  document.getElementById('url-decode-btn').onclick = async () => {
    output.value = await window.devUtilsAPI.codec.urlDecode(input.value);
  };

  document.getElementById('html-escape-btn').onclick = async () => {
    output.value = await window.devUtilsAPI.codec.escapeHtml(input.value);
  };

  document.getElementById('html-unescape-btn').onclick = async () => {
    output.value = await window.devUtilsAPI.codec.unescapeHtml(input.value);
  };
}

// 7. Hex Tool
function setupHexTool() {
  const input = document.getElementById('hex-input');
  const output = document.getElementById('hex-output');

  document.getElementById('text-to-hex-btn').onclick = async () => {
    output.value = await window.devUtilsAPI.hex.toHex(input.value, true);
  };

  document.getElementById('hex-to-text-btn').onclick = async () => {
    const res = await window.devUtilsAPI.hex.toText(input.value);
    output.value = res.success ? res.result : res.error;
  };

  document.getElementById('hex-clear-btn').onclick = () => {
    input.value = '';
    output.value = '';
  };
}

// 8. Hash Tool
function setupHashTool() {
  const input = document.getElementById('hash-input');
  const key = document.getElementById('hmac-key');

  document.getElementById('hash-generate-btn').onclick = async () => {
    const res = await window.devUtilsAPI.crypto.hash(input.value, key.value);
    document.getElementById('hash-md5').value = res.md5;
    document.getElementById('hash-sha1').value = res.sha1;
    document.getElementById('hash-sha256').value = res.sha256;
    document.getElementById('hash-sha512').value = res.sha512;
    document.getElementById('hash-hmac256').value = res.hmacSha256 || 'N/A (Provide HMAC Key)';
  };
}

// 9. Password Tool
function setupPasswordTool() {
  const len = document.getElementById('pwd-len');
  const upper = document.getElementById('pwd-upper');
  const lower = document.getElementById('pwd-lower');
  const nums = document.getElementById('pwd-nums');
  const syms = document.getElementById('pwd-syms');
  const out = document.getElementById('pwd-output');

  document.getElementById('pwd-generate-btn').onclick = async () => {
    out.value = await window.devUtilsAPI.password.generate({
      length: parseInt(len.value, 10),
      uppercase: upper.checked,
      lowercase: lower.checked,
      numbers: nums.checked,
      symbols: syms.checked
    });
  };

  document.getElementById('pwd-copy-btn').onclick = () => {
    navigator.clipboard.writeText(out.value);
  };
}

// 10. Regex Tool
function setupRegexTool() {
  const pattern = document.getElementById('regex-pattern');
  const flags = document.getElementById('regex-flags');
  const text = document.getElementById('regex-text');
  const count = document.getElementById('regex-match-count');
  const list = document.getElementById('regex-matches-container');

  document.getElementById('regex-run-btn').onclick = async () => {
    const res = await window.devUtilsAPI.regex.test(pattern.value, flags.value, text.value);
    list.innerHTML = '';
    if (res.success) {
      count.textContent = `${res.matchCount} matches`;
      res.matches.forEach((m, idx) => {
        const div = document.createElement('div');
        div.className = 'match-item';
        div.textContent = `#${idx + 1}: "${m.match}" [index ${m.index}]`;
        list.appendChild(div);
      });
    } else {
      count.textContent = 'Regex error';
      list.textContent = res.error;
    }
  };
}

// 11. Diff Tool
function setupDiffTool() {
  const orig = document.getElementById('diff-orig');
  const mod = document.getElementById('diff-mod');
  const out = document.getElementById('diff-output');

  document.getElementById('diff-run-btn').onclick = async () => {
    const lines = await window.devUtilsAPI.diff.compute(orig.value, mod.value);
    out.innerHTML = '';
    lines.forEach(l => {
      const lineDiv = document.createElement('div');
      lineDiv.className = `diff-line ${l.type}`;
      lineDiv.textContent = (l.type === 'added' ? '+ ' : l.type === 'removed' ? '- ' : '  ') + l.text;
      out.appendChild(lineDiv);
    });
  };

  document.getElementById('diff-clear-btn').onclick = () => {
    orig.value = '';
    mod.value = '';
    out.innerHTML = '';
  };
}

// 12. Generator Tool
function setupGeneratorTool() {
  const count = document.getElementById('gen-count');
  const upper = document.getElementById('gen-upper');
  const noHyphen = document.getElementById('gen-nohyphen');
  const output = document.getElementById('gen-output');

  document.getElementById('gen-uuid-btn').onclick = async () => {
    const list = await window.devUtilsAPI.generator.uuid(parseInt(count.value, 10), upper.checked, noHyphen.checked);
    output.value = list.join('\n');
  };

  document.getElementById('gen-users-btn').onclick = async () => {
    const users = await window.devUtilsAPI.generator.mockUsers(parseInt(count.value, 10));
    output.value = JSON.stringify(users, null, 2);
  };
}

// 13. HTTP Status Lookup Tool
function setupHttpLookupTool() {
  const codeIn = document.getElementById('http-code-input');

  document.getElementById('http-lookup-btn').onclick = async () => {
    const val = parseInt(codeIn.value, 10);
    const detail = await window.devUtilsAPI.http.lookup(val);
    if (detail) {
      document.getElementById('http-res-code').value = detail.code;
      document.getElementById('http-res-phrase').value = detail.phrase;
      document.getElementById('http-res-cat').value = detail.category;
      document.getElementById('http-res-desc').value = detail.description;
    } else {
      document.getElementById('http-res-code').value = val;
      document.getElementById('http-res-phrase').value = 'Unrecognized / Custom Code';
      document.getElementById('http-res-cat').value = 'N/A';
      document.getElementById('http-res-desc').value = 'No standard RFC description found.';
    }
  };
}

// 14. Curl Tool
function setupCurlTool() {
  const input = document.getElementById('curl-input');
  const jsOut = document.getElementById('curl-js-output');
  const pyOut = document.getElementById('curl-py-output');

  document.getElementById('curl-parse-btn').onclick = async () => {
    const res = await window.devUtilsAPI.curl.parse(input.value);
    if (res.success) {
      jsOut.value = res.codeSnippets.javascriptFetch;
      pyOut.value = res.codeSnippets.pythonRequests;
    } else {
      jsOut.value = res.error;
      pyOut.value = '';
    }
  };

  document.getElementById('curl-clear-btn').onclick = () => {
    input.value = '';
    jsOut.value = '';
    pyOut.value = '';
  };
}

// 15. Subnet Tool
function setupSubnetTool() {
  const cidrIn = document.getElementById('subnet-cidr-input');

  document.getElementById('subnet-calc-btn').onclick = async () => {
    const res = await window.devUtilsAPI.subnet.calculate(cidrIn.value);
    if (res.success && res.result) {
      document.getElementById('sub-mask').value = res.result.netmask;
      document.getElementById('sub-net').value = res.result.networkAddress;
      document.getElementById('sub-bcast').value = res.result.broadcastAddress;
      document.getElementById('sub-first').value = res.result.firstUsableIp;
      document.getElementById('sub-last').value = res.result.lastUsableIp;
      document.getElementById('sub-hosts').value = `${res.result.usableHosts} usable hosts (Total: ${res.result.totalHosts})`;
    } else {
      alert(res.error || 'Subnet calculation error');
    }
  };
}

// 16. Timestamp Tool
function setupTimestampTool() {
  const input = document.getElementById('time-input');

  const populate = (data) => {
    document.getElementById('time-iso').value = data.isoUtc;
    document.getElementById('time-utc').value = data.utcDateString;
    document.getElementById('time-local').value = data.localDateString;
    document.getElementById('time-sec').value = data.epochSeconds;
    document.getElementById('time-ms').value = data.epochMilliseconds;
  };

  document.getElementById('time-convert-btn').onclick = async () => {
    const val = input.value.trim();
    if (!isNaN(Number(val))) {
      const res = await window.devUtilsAPI.time.parseTimestamp(Number(val));
      populate(res);
    } else {
      const res = await window.devUtilsAPI.time.parseDate(val);
      if (res.success) populate(res.result);
      else alert(res.error);
    }
  };

  document.getElementById('time-now-btn').onclick = async () => {
    const now = Math.floor(Date.now() / 1000);
    input.value = now;
    const res = await window.devUtilsAPI.time.parseTimestamp(now);
    populate(res);
  };
}

// 17. String Cases & Stats
function setupTextTool() {
  const input = document.getElementById('text-input');

  document.getElementById('text-inspect-btn').onclick = async () => {
    const val = input.value;
    const cases = await window.devUtilsAPI.text.cases(val);
    const stats = await window.devUtilsAPI.text.stats(val);

    document.getElementById('case-camel').value = cases.camelCase;
    document.getElementById('case-pascal').value = cases.pascalCase;
    document.getElementById('case-snake').value = cases.snakeCase;
    document.getElementById('case-kebab').value = cases.kebabCase;
    document.getElementById('case-constant').value = cases.constantCase;

    document.getElementById('stat-chars').value = stats.characters;
    document.getElementById('stat-chars-ns').value = stats.charactersNoSpaces;
    document.getElementById('stat-words').value = stats.words;
    document.getElementById('stat-lines').value = stats.lines;
    document.getElementById('stat-bytes').value = stats.bytes;
  };
}

// 18. Cron Tool
function setupCronTool() {
  const input = document.getElementById('cron-input');
  const desc = document.getElementById('cron-description');

  document.getElementById('cron-explain-btn').onclick = async () => {
    const res = await window.devUtilsAPI.cron.describe(input.value);
    if (res.success) {
      desc.textContent = res.description;
      desc.style.color = 'var(--success-color)';
    } else {
      desc.textContent = res.error;
      desc.style.color = 'var(--error-color)';
    }
  };
}

// 19. Markdown Tool
function setupMarkdownTool() {
  const input = document.getElementById('md-input');
  const preview = document.getElementById('md-preview');

  document.getElementById('md-render-btn').onclick = async () => {
    const html = await window.devUtilsAPI.markdown.toHtml(input.value);
    preview.innerHTML = html;
  };

  document.getElementById('md-copy-btn').onclick = async () => {
    const html = await window.devUtilsAPI.markdown.toHtml(input.value);
    navigator.clipboard.writeText(html);
  };

  document.getElementById('md-clear-btn').onclick = () => {
    input.value = '';
    preview.innerHTML = '';
  };
}

// 20. Color Tool
function setupColorTool() {
  const input = document.getElementById('color-input');
  const picker = document.getElementById('color-picker');
  const swatch = document.getElementById('color-swatch');

  const update = async (val) => {
    const res = await window.devUtilsAPI.color.convert(val);
    if (res.success && res.result) {
      document.getElementById('color-hex').value = res.result.hex;
      document.getElementById('color-rgb').value = res.result.rgb;
      document.getElementById('color-rgba').value = res.result.rgba;
      document.getElementById('color-hsl').value = res.result.hsl;
      swatch.style.backgroundColor = res.result.hex;
      picker.value = res.result.hex;
    } else {
      alert(res.error || 'Color conversion error');
    }
  };

  document.getElementById('color-convert-btn').onclick = () => update(input.value);
  picker.oninput = (e) => {
    input.value = e.target.value;
    update(e.target.value);
  };
}

// 21. Lorem Ipsum Tool
function setupLoremTool() {
  const count = document.getElementById('lorem-count');
  const output = document.getElementById('lorem-output');

  document.getElementById('lorem-generate-btn').onclick = async () => {
    output.value = await window.devUtilsAPI.lorem.generate(parseInt(count.value, 10));
  };

  document.getElementById('lorem-copy-btn').onclick = () => {
    navigator.clipboard.writeText(output.value);
  };
}

// 22. URL Query Tool
function setupUrlTool() {
  const input = document.getElementById('url-input');

  document.getElementById('url-parse-btn').onclick = async () => {
    const res = await window.devUtilsAPI.url.parseQuery(input.value);
    if (res.success && res.result) {
      document.getElementById('url-protocol').value = res.result.protocol;
      document.getElementById('url-host').value = res.result.host;
      document.getElementById('url-port').value = res.result.port;
      document.getElementById('url-path').value = res.result.pathname;
      document.getElementById('url-hash').value = res.result.hash;
      document.getElementById('url-params-output').value = JSON.stringify(res.result.searchParams, null, 2);
    } else {
      alert(res.error || 'URL parsing error');
    }
  };
}

// =========================================================================
// 23. REST API Testing Tool (Bruno-compatible)
// =========================================================================
function setupRestApiTool() {
  const methodSelect = document.getElementById('rest-method');
  const urlInput = document.getElementById('rest-url');
  const sendBtn = document.getElementById('rest-send-btn');
  const saveBruBtn = document.getElementById('rest-save-bru-btn');
  const importBruBtn = document.getElementById('rest-import-bru-btn');
  const copyCurlBtn = document.getElementById('rest-copy-curl-btn');

  // Sub-tabs on request side
  const subTabs = document.querySelectorAll('.rest-sub-tab');
  const tabSections = document.querySelectorAll('.rest-tab-section');

  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      subTabs.forEach(t => t.classList.remove('active'));
      tabSections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `rest-tab-${tab.getAttribute('data-sub')}`;
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add('active');
    });
  });

  // Response sub-tabs
  const resTabs = document.querySelectorAll('.res-sub-tab');
  const resSections = document.querySelectorAll('.res-pane-section');

  resTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      resTabs.forEach(t => t.classList.remove('active'));
      resSections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const targetId = tab.getAttribute('data-res-tab');
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add('active');
    });
  });

  // Environment and variables
  const envSelect = document.getElementById('rest-env-select');
  const envEditBtn = document.getElementById('rest-env-edit-btn');
  const envPanel = document.getElementById('rest-env-panel');
  const envCloseBtn = document.getElementById('rest-env-close-btn');
  const envVarsInput = document.getElementById('rest-env-vars-input');
  const envSaveVarsBtn = document.getElementById('rest-env-save-vars-btn');

  const environments = {
    none: {},
    local: { baseUrl: 'http://127.0.0.1:3000', token: 'local-test-token', userId: '1' },
    staging: { baseUrl: 'https://staging.api.example.com', token: 'staging-token-xyz', userId: '10' },
    production: { baseUrl: 'https://api.example.com', token: 'prod-token', userId: '100' },
    custom: { baseUrl: 'https://jsonplaceholder.typicode.com', userId: '1' }
  };

  let activeEnvVars = { ...environments.none };

  function refreshEnvDisplay() {
    const lines = Object.entries(activeEnvVars).map(([k, v]) => `${k}: ${v}`);
    envVarsInput.value = lines.join('\n');
  }

  envSelect.addEventListener('change', () => {
    const selected = envSelect.value;
    activeEnvVars = { ...(environments[selected] || {}) };
    refreshEnvDisplay();
  });

  envEditBtn.addEventListener('click', () => {
    envPanel.style.display = envPanel.style.display === 'none' ? 'block' : 'none';
  });

  envCloseBtn.addEventListener('click', () => {
    envPanel.style.display = 'none';
  });

  envSaveVarsBtn.addEventListener('click', () => {
    const lines = envVarsInput.value.split('\n');
    activeEnvVars = {};
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx > 0) {
        activeEnvVars[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
      }
    }
    environments['custom'] = { ...activeEnvVars };
    envSelect.value = 'custom';
    envPanel.style.display = 'none';
  });

  // Parameter table management
  const paramsList = document.getElementById('rest-params-list');
  const addParamBtn = document.getElementById('rest-add-param-btn');

  function createKvRow(container, key = '', val = '', enabled = true) {
    const row = document.createElement('div');
    row.className = 'kv-row';
    row.innerHTML = `
      <input type="checkbox" ${enabled ? 'checked' : ''} class="kv-enable">
      <input type="text" placeholder="Key" value="${key}" class="kv-key">
      <input type="text" placeholder="Value" value="${val}" class="kv-val">
      <button class="btn-icon-del" title="Delete">✕</button>
    `;

    row.querySelector('.btn-icon-del').onclick = () => row.remove();
    container.appendChild(row);
  }

  addParamBtn.onclick = () => createKvRow(paramsList);

  // Initialize sample parameter
  createKvRow(paramsList, 'userId', '{{userId}}', false);

  // Header table management
  const headersList = document.getElementById('rest-headers-list');
  const addHeaderBtn = document.getElementById('rest-add-header-btn');
  addHeaderBtn.onclick = () => createKvRow(headersList);

  // Initialize common headers
  createKvRow(headersList, 'Accept', 'application/json', true);
  createKvRow(headersList, 'User-Agent', 'DevUtils-Desktop/1.0', true);

  // Auth type toggling
  const authTypeSelect = document.getElementById('rest-auth-type');
  const authBearerGroup = document.getElementById('rest-auth-bearer-group');
  const authBasicGroup = document.getElementById('rest-auth-basic-group');
  const authApiKeyGroup = document.getElementById('rest-auth-apikey-group');

  authTypeSelect.addEventListener('change', () => {
    const val = authTypeSelect.value;
    authBearerGroup.style.display = val === 'bearer' ? 'flex' : 'none';
    authBasicGroup.style.display = val === 'basic' ? 'flex' : 'none';
    authApiKeyGroup.style.display = val === 'apikey' ? 'flex' : 'none';
  });

  // Body formatting button
  const formatBodyBtn = document.getElementById('rest-format-body-btn');
  const bodyRaw = document.getElementById('rest-body-raw');
  formatBodyBtn.onclick = () => {
    try {
      const parsed = JSON.parse(bodyRaw.value);
      bodyRaw.value = JSON.stringify(parsed, null, 2);
    } catch (e) {
      alert('Invalid JSON body');
    }
  };

  // Assertions and test snippets
  const addAssertBtn = document.getElementById('rest-add-assert-example-btn');
  const assertionsInput = document.getElementById('rest-assertions-input');
  addAssertBtn.onclick = () => {
    assertionsInput.value = `res.status: eq 200\nres.responseTime: lte 2500\nres.body: isDefined`;
  };

  const addTestSnippetBtn = document.getElementById('rest-add-test-snippet-btn');
  const testScriptInput = document.getElementById('rest-test-script');
  addTestSnippetBtn.onclick = () => {
    testScriptInput.value = `test("Status is 200 OK", () => {\n  expect(res.status).toBe(200);\n});\ntest("Response time is acceptable", () => {\n  expect(res.responseTime).toBeLessThan(3000);\n});\nconsole.log("Response status: " + res.status);`;
  };

  // Helper to extract KeyValuePairs from list container
  function extractKvList(container) {
    const rows = container.querySelectorAll('.kv-row');
    const items = [];
    rows.forEach(r => {
      const enabled = r.querySelector('.kv-enable').checked;
      const key = r.querySelector('.kv-key').value.trim();
      const value = r.querySelector('.kv-val').value.trim();
      if (key) {
        items.push({ key, value, enabled });
      }
    });
    return items;
  }

  // Construct RestApiRequest object from UI state
  function getRequestFromUI() {
    const method = methodSelect.value;
    const url = urlInput.value.trim();
    const params = extractKvList(paramsList);
    const headers = extractKvList(headersList);

    const authType = authTypeSelect.value;
    const auth = { type: authType };
    if (authType === 'bearer') {
      auth.bearer = { token: document.getElementById('rest-auth-bearer-token').value.trim() };
    } else if (authType === 'basic') {
      auth.basic = {
        username: document.getElementById('rest-auth-basic-user').value.trim(),
        password: document.getElementById('rest-auth-basic-pass').value.trim()
      };
    } else if (authType === 'apikey') {
      auth.apiKey = {
        key: document.getElementById('rest-auth-apikey-key').value.trim(),
        value: document.getElementById('rest-auth-apikey-val').value.trim(),
        addTo: document.getElementById('rest-auth-apikey-place').value
      };
    }

    const bodyTypeRadio = document.querySelector('input[name="rest-body-type"]:checked');
    const bodyType = bodyTypeRadio ? bodyTypeRadio.value : 'none';
    const body = {
      type: bodyType,
      raw: bodyRaw.value
    };

    const assertions = assertionsInput.value.split('\n').map(s => s.trim()).filter(Boolean);
    const tests = testScriptInput.value;
    const preRequestScript = document.getElementById('rest-prescript-input').value;

    return {
      method,
      url,
      params,
      headers,
      auth,
      body,
      assertions,
      tests,
      preRequestScript
    };
  }

  // Apply RestApiRequest object to UI
  function populateUIFromRequest(req) {
    if (req.method) methodSelect.value = req.method;
    if (req.url) urlInput.value = req.url;

    // Params
    paramsList.innerHTML = '';
    if (req.params && req.params.length > 0) {
      req.params.forEach(p => createKvRow(paramsList, p.key, p.value, p.enabled !== false));
    }

    // Headers
    headersList.innerHTML = '';
    if (req.headers && req.headers.length > 0) {
      req.headers.forEach(h => createKvRow(headersList, h.key, h.value, h.enabled !== false));
    }

    // Auth
    if (req.auth) {
      authTypeSelect.value = req.auth.type;
      authTypeSelect.dispatchEvent(new Event('change'));
      if (req.auth.type === 'bearer' && req.auth.bearer) {
        document.getElementById('rest-auth-bearer-token').value = req.auth.bearer.token || '';
      } else if (req.auth.type === 'basic' && req.auth.basic) {
        document.getElementById('rest-auth-basic-user').value = req.auth.basic.username || '';
        document.getElementById('rest-auth-basic-pass').value = req.auth.basic.password || '';
      } else if (req.auth.type === 'apikey' && req.auth.apiKey) {
        document.getElementById('rest-auth-apikey-key').value = req.auth.apiKey.key || '';
        document.getElementById('rest-auth-apikey-val').value = req.auth.apiKey.value || '';
        document.getElementById('rest-auth-apikey-place').value = req.auth.apiKey.addTo || 'header';
      }
    }

    // Body
    if (req.body) {
      const radio = document.querySelector(`input[name="rest-body-type"][value="${req.body.type || 'none'}"]`);
      if (radio) radio.checked = true;
      bodyRaw.value = req.body.raw || '';
    }

    // Assertions & Scripts
    if (req.assertions) {
      assertionsInput.value = req.assertions.join('\n');
    }
    if (req.tests) {
      testScriptInput.value = req.tests;
    }
    if (req.preRequestScript) {
      document.getElementById('rest-prescript-input').value = req.preRequestScript;
    }
  }

  // Send Request Event Handler
  sendBtn.addEventListener('click', async () => {
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span>⏳ Sending...</span>';

    const req = getRequestFromUI();
    const quickTag = document.getElementById('rest-quick-stats');
    quickTag.textContent = 'Request in progress...';

    const statusBadge = document.getElementById('res-status-badge');
    const timeBadge = document.getElementById('res-time-badge');
    const sizeBadge = document.getElementById('res-size-badge');
    const bodyText = document.getElementById('res-body-text');
    const headersTable = document.getElementById('res-headers-table');
    const testItemsList = document.getElementById('res-test-items-list');
    const testSummaryBar = document.getElementById('res-test-summary-bar');
    const consoleLogsBox = document.getElementById('res-console-logs');
    const bruPreview = document.getElementById('res-bru-preview-text');

    try {
      const response = await window.devUtilsAPI.rest.execute(req, activeEnvVars);

      // Status badge
      statusBadge.textContent = `Status: ${response.status} ${response.statusText}`;
      statusBadge.className = 'res-badge';
      if (response.status >= 200 && response.status < 300) {
        statusBadge.classList.add('res-badge-2xx');
      } else if (response.status >= 300 && response.status < 400) {
        statusBadge.classList.add('res-badge-3xx');
      } else {
        statusBadge.classList.add('res-badge-4xx');
      }

      timeBadge.textContent = `Time: ${response.timeMs} ms`;
      sizeBadge.textContent = `Size: ${response.sizeBytes} B`;
      quickTag.textContent = `${response.status} ${response.statusText} (${response.timeMs}ms)`;

      // Body formatting
      let displayBody = response.body;
      if (response.parsedBody) {
        displayBody = JSON.stringify(response.parsedBody, null, 2);
      }
      bodyText.value = displayBody;

      // HTML Preview if applicable
      const previewFrame = document.getElementById('res-body-iframe');
      if (response.body.includes('<html') || response.headers['content-type']?.includes('html')) {
        previewFrame.srcdoc = response.body;
      }

      // Headers tab
      headersTable.innerHTML = '';
      const headerEntries = Object.entries(response.headers || {});
      document.getElementById('res-headers-count').textContent = headerEntries.length;
      if (headerEntries.length === 0) {
        headersTable.innerHTML = '<div class="panel-hint">No headers returned.</div>';
      } else {
        for (const [k, v] of headerEntries) {
          const item = document.createElement('div');
          item.className = 'res-header-item';
          item.innerHTML = `<span class="res-header-name">${k}</span><span class="res-header-val">${Array.isArray(v) ? v.join(', ') : v}</span>`;
          headersTable.appendChild(item);
        }
      }

      // Assertions & Tests Results
      testItemsList.innerHTML = '';
      const totalAssertions = (response.assertions || []).length;
      const totalScriptTests = (response.tests || []).length;
      const totalTestsCount = totalAssertions + totalScriptTests;

      let passedCount = 0;

      // 1. Render declarative assertions
      if (response.assertions) {
        response.assertions.forEach(a => {
          if (a.passed) passedCount++;
          const row = document.createElement('div');
          row.className = `test-item-row ${a.passed ? 'test-pass' : 'test-fail'}`;
          row.innerHTML = `
            <span><strong>[Assert]</strong> ${a.expression}</span>
            <span>${a.passed ? '✓ PASSED' : `✗ FAILED: ${a.error || `Expected ${JSON.stringify(a.expected)}, got ${JSON.stringify(a.actual)}`}`}</span>
          `;
          testItemsList.appendChild(row);
        });
      }

      // 2. Render script test assertions
      if (response.tests) {
        response.tests.forEach(t => {
          if (t.passed) passedCount++;
          const row = document.createElement('div');
          row.className = `test-item-row ${t.passed ? 'test-pass' : 'test-fail'}`;
          row.innerHTML = `
            <span><strong>[Test]</strong> ${t.name}</span>
            <span>${t.passed ? '✓ PASSED' : `✗ FAILED: ${t.error}`}</span>
          `;
          testItemsList.appendChild(row);
        });
      }

      document.getElementById('res-tests-count').textContent = totalTestsCount;
      if (totalTestsCount === 0) {
        testSummaryBar.innerHTML = '<span>No assertions or test scripts configured.</span>';
      } else {
        const isAllPass = passedCount === totalTestsCount;
        testSummaryBar.innerHTML = `<span style="color: ${isAllPass ? 'var(--success-color)' : 'var(--error-color)'};">
          ${passedCount} of ${totalTestsCount} tests passed (${Math.round((passedCount / totalTestsCount) * 100)}%)
        </span>`;
      }

      // Console logs
      consoleLogsBox.innerHTML = '';
      const logs = response.consoleLogs || [];
      document.getElementById('res-console-count').textContent = logs.length;
      if (logs.length === 0) {
        consoleLogsBox.innerHTML = '<div class="panel-hint">No logs recorded.</div>';
      } else {
        logs.forEach(log => {
          const l = document.createElement('div');
          l.className = 'console-log-line';
          l.textContent = log;
          consoleLogsBox.appendChild(l);
        });
      }

      // Update .bru preview
      const bruString = await window.devUtilsAPI.rest.serializeBru(req);
      bruPreview.value = bruString;

    } catch (err) {
      statusBadge.textContent = 'Status: Error';
      statusBadge.className = 'res-badge res-badge-err';
      bodyText.value = `Error executing request:\n${err.message || String(err)}`;
      quickTag.textContent = 'Request Failed';
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<span>▶ Send</span>';
    }
  });

  // Export to .bru file
  saveBruBtn.addEventListener('click', async () => {
    const req = getRequestFromUI();
    const bruString = await window.devUtilsAPI.rest.serializeBru(req);
    const blob = new Blob([bruString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${req.name || 'request'}.bru`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import from .bru file
  importBruBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.bru,.txt';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const text = await file.text();
        const parsed = await window.devUtilsAPI.rest.parseBru(text);
        populateUIFromRequest(parsed);
      }
    };
    fileInput.click();
  });

  // Copy as cURL
  copyCurlBtn.addEventListener('click', async () => {
    const req = getRequestFromUI();
    const curl = await window.devUtilsAPI.rest.generateCurl(req, activeEnvVars);
    navigator.clipboard.writeText(curl);
    copyCurlBtn.innerHTML = '<span>✓ Copied!</span>';
    setTimeout(() => {
      copyCurlBtn.innerHTML = '<span>📋 cURL</span>';
    }, 1500);
  });

  // Copy Response Body
  document.getElementById('res-copy-body-btn').onclick = () => {
    const text = document.getElementById('res-body-text').value;
    navigator.clipboard.writeText(text);
  };

  // Clear Response
  document.getElementById('res-clear-btn').onclick = () => {
    document.getElementById('res-body-text').value = '';
    document.getElementById('res-status-badge').textContent = 'Status: --';
    document.getElementById('res-status-badge').className = 'res-badge res-badge-idle';
    document.getElementById('res-time-badge').textContent = 'Time: -- ms';
    document.getElementById('res-size-badge').textContent = 'Size: -- B';
    document.getElementById('res-headers-table').innerHTML = '<div class="panel-hint">No response received yet.</div>';
    document.getElementById('res-test-items-list').innerHTML = '';
    document.getElementById('res-test-summary-bar').innerHTML = '<span>No assertions or tests executed yet.</span>';
    document.getElementById('res-console-logs').innerHTML = '<div class="panel-hint">No logs recorded.</div>';
  };

  // Format view switch (pretty / raw / preview)
  const formatRadios = document.querySelectorAll('input[name="res-view-format"]');
  formatRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const val = radio.value;
      const bodyTextarea = document.getElementById('res-body-text');
      const previewFrame = document.getElementById('res-body-iframe');

      if (val === 'preview') {
        bodyTextarea.style.display = 'none';
        previewFrame.style.display = 'block';
      } else {
        bodyTextarea.style.display = 'block';
        previewFrame.style.display = 'none';
      }
    });
  });

  // Collections Switcher (Demo presets)
  const collSelect = document.getElementById('rest-collection-select');
  collSelect.addEventListener('change', () => {
    if (collSelect.value === 'demo-todos') {
      populateUIFromRequest({
        name: 'Get Todo Item',
        method: 'GET',
        url: 'https://jsonplaceholder.typicode.com/todos/1',
        params: [],
        headers: [
          { key: 'Accept', value: 'application/json', enabled: true }
        ],
        assertions: [
          'res.status: eq 200',
          'res.body.id: eq 1',
          'res.body.title: isDefined'
        ],
        tests: `test("Status is 200 OK", () => {\n  expect(res.status).toBe(200);\n});`
      });
    }
  });
}

// 24. YAML ↔ JSON Tool
function setupYamlTool() {
  const input = document.getElementById('yaml-input');
  const output = document.getElementById('yaml-output');

  document.getElementById('yaml-to-json-btn').onclick = async () => {
    const res = await window.devUtilsAPI.yaml.yamlToJson(input.value);
    if (res.success) {
      output.value = res.result;
    } else {
      output.value = `Error: ${res.error}`;
    }
  };

  document.getElementById('json-to-yaml-btn').onclick = async () => {
    const res = await window.devUtilsAPI.yaml.jsonToYaml(input.value);
    if (res.success) {
      output.value = res.result;
    } else {
      output.value = `Error: ${res.error}`;
    }
  };

  document.getElementById('yaml-clear-btn').onclick = () => {
    input.value = '';
    output.value = '';
  };

  document.getElementById('yaml-copy-btn').onclick = () => {
    navigator.clipboard.writeText(output.value);
  };
}

// 25. JSON Schema Validator Tool
function setupSchemaTool() {
  const dataInput = document.getElementById('schema-data-input');
  const defInput = document.getElementById('schema-def-input');
  const statusBox = document.getElementById('schema-status-box');

  document.getElementById('schema-validate-btn').onclick = async () => {
    const res = await window.devUtilsAPI.schema.validate(dataInput.value, defInput.value);
    if (res.valid) {
      statusBox.innerHTML = '<span style="color: var(--success-color); font-weight: bold;">✓ Schema Validation Passed: Payload conforms to JSON Schema specifications.</span>';
    } else {
      const errList = res.errors.map(e => `• ${e}`).join('<br>');
      statusBox.innerHTML = `<span style="color: var(--error-color); font-weight: bold;">✗ Validation Errors (${res.errors.length}):</span><div style="margin-top:6px; color: var(--text-light);">${errList}</div>`;
    }
  };

  document.getElementById('schema-sample-btn').onclick = () => {
    dataInput.value = JSON.stringify({
      id: 101,
      name: "API Gateway",
      active: true,
      port: 8080,
      tags: ["microservices", "proxy"]
    }, null, 2);

    defInput.value = JSON.stringify({
      type: "object",
      required: ["id", "name", "port"],
      properties: {
        id: { type: "integer", minimum: 1 },
        name: { type: "string", minLength: 3 },
        active: { type: "boolean" },
        port: { type: "integer", minimum: 1024, maximum: 65535 },
        tags: { type: "array", items: { type: "string" } }
      }
    }, null, 2);
  };

  document.getElementById('schema-clear-btn').onclick = () => {
    dataInput.value = '';
    defInput.value = '';
    statusBox.innerHTML = '<div class="panel-hint">Cleared.</div>';
  };
}

// 26. Chmod Calculator Tool
function setupChmodTool() {
  const input = document.getElementById('chmod-input');
  const octal = document.getElementById('chmod-octal');
  const symbolic = document.getElementById('chmod-symbolic');
  const command = document.getElementById('chmod-command');

  const pUr = document.getElementById('perm-ur');
  const pUw = document.getElementById('perm-uw');
  const pUx = document.getElementById('perm-ux');
  const pGr = document.getElementById('perm-gr');
  const pGw = document.getElementById('perm-gw');
  const pGx = document.getElementById('perm-gx');
  const pOr = document.getElementById('perm-or');
  const pOw = document.getElementById('perm-ow');
  const pOx = document.getElementById('perm-ox');

  async function updateFromInput(val) {
    const res = await window.devUtilsAPI.chmod.calculate(val);
    octal.value = res.octal;
    symbolic.value = res.symbolic;
    command.value = res.command;

    pUr.checked = res.breakdown.user.read;
    pUw.checked = res.breakdown.user.write;
    pUx.checked = res.breakdown.user.execute;

    pGr.checked = res.breakdown.group.read;
    pGw.checked = res.breakdown.group.write;
    pGx.checked = res.breakdown.group.execute;

    pOr.checked = res.breakdown.others.read;
    pOw.checked = res.breakdown.others.write;
    pOx.checked = res.breakdown.others.execute;
  }

  function updateFromCheckboxes() {
    const u = (pUr.checked ? 4 : 0) + (pUw.checked ? 2 : 0) + (pUx.checked ? 1 : 0);
    const g = (pGr.checked ? 4 : 0) + (pGw.checked ? 2 : 0) + (pGx.checked ? 1 : 0);
    const o = (pOr.checked ? 4 : 0) + (pOw.checked ? 2 : 0) + (pOx.checked ? 1 : 0);
    const oct = `${u}${g}${o}`;
    input.value = oct;
    updateFromInput(oct);
  }

  document.getElementById('chmod-calc-btn').onclick = () => updateFromInput(input.value);
  input.oninput = () => updateFromInput(input.value);

  [pUr, pUw, pUx, pGr, pGw, pGx, pOr, pOw, pOx].forEach(cb => {
    cb.onchange = updateFromCheckboxes;
  });

  // initial load
  updateFromInput('755');
}

// 27. .env <-> JSON Tool
function setupEnvTool() {
  const input = document.getElementById('env-input');
  const output = document.getElementById('env-output');

  document.getElementById('env-to-json-btn').onclick = async () => {
    const res = await window.devUtilsAPI.env.parse(input.value);
    output.value = JSON.stringify(res, null, 2);
  };

  document.getElementById('json-to-env-btn').onclick = async () => {
    const res = await window.devUtilsAPI.env.jsonToEnv(input.value);
    if (res.success) {
      output.value = res.result;
    } else {
      output.value = `Error: ${res.error}`;
    }
  };

  document.getElementById('env-clear-btn').onclick = () => {
    input.value = '';
    output.value = '';
  };

  document.getElementById('env-copy-btn').onclick = () => {
    navigator.clipboard.writeText(output.value);
  };
}

// 28. Quick Code Minifier Tool
function setupMinifierTool() {
  const langSelect = document.getElementById('minifier-lang');
  const input = document.getElementById('minifier-input');
  const output = document.getElementById('minifier-output');
  const statsBar = document.getElementById('minifier-stats-bar');

  document.getElementById('minifier-run-btn').onclick = async () => {
    const orig = input.value;
    const min = await window.devUtilsAPI.minify.code(orig, langSelect.value);
    output.value = min;

    const origBytes = new Blob([orig]).size;
    const minBytes = new Blob([min]).size;
    const saved = origBytes > 0 ? Math.round(((origBytes - minBytes) / origBytes) * 100) : 0;

    statsBar.innerHTML = `<span style="color: var(--success-color);">Original: ${origBytes} bytes | Minified: ${minBytes} bytes | Saved: ${saved}%</span>`;
  };

  document.getElementById('minifier-copy-btn').onclick = () => {
    navigator.clipboard.writeText(output.value);
  };

  document.getElementById('minifier-clear-btn').onclick = () => {
    input.value = '';
    output.value = '';
    statsBar.innerHTML = '';
  };
}



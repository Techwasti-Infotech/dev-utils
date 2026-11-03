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

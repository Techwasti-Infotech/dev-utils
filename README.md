# ⚡ DevUtils - Cross-Platform Developer & QA Utilities

[![CI Build & Release](https://github.com/techwasti/dev-utils/actions/workflows/build-and-release.yml/badge.svg)](https://github.com/techwasti/dev-utils/actions/workflows/build-and-release.yml)
[![Pages Deployment](https://github.com/techwasti/dev-utils/actions/workflows/pages.yml/badge.svg)](https://github.com/techwasti/dev-utils/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Privacy Compliance](https://img.shields.io/badge/Privacy-100%25%20Offline%20Air--Gapped-brightgreen.svg)](docs/SECURITY_AND_COMPLIANCE.md)
[![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20macOS%20%7C%20Linux-blue.svg)](docs/BUILD_AND_PACKAGING_GUIDE.md)

**DevUtils** is an open-source, air-gapped desktop application engineered for software developers and QA automation engineers. It bundles **18 essential day-to-day utilities** into a fast, privacy-first interface that **never transmits your data over the internet**.

📖 Detailed Reference: Check the [Complete Utilities Catalog & Reference](docs/UTILITIES_CATALOG.md).

---

## 🛡️ Why DevUtils? (Security & Privacy Compliance)

When developers and QA specialists paste production payloads, customer tokens, database exports, or secrets into random web tools (online JSON formatters, JWT decoders, base64 converters), **critical company and customer data can be leaked or logged by remote servers**.

DevUtils runs **100% locally on your machine**:
* **Air-gapped by design**: No outbound telemetry, no analytics, no external CDN dependencies.
* **Electron Sandbox**: Enforces strict `contextIsolation`, disabled `nodeIntegration`, and secure preload IPC communication.
* **Compliant with GDPR, HIPAA, and SOC-2**: Safely format, decode, and inspect sensitive enterprise tokens and logs without risk.

Read the detailed [Security & Compliance Guide](docs/SECURITY_AND_COMPLIANCE.md).

---

## 🧰 Included Utilities (24 Tools)

| Category | Utility | Description |
| :--- | :--- | :--- |
| **Data & Formatting** | **JSON Prettifier & Minifier** | Validate, format (2/4 spaces), and minify payloads with instant error diagnostics. |
| | **YAML ↔ JSON Converter** | Bidirectional translation and formatting between YAML configuration files and JSON. |
| | **JSON ↔ CSV Converter** | Transform JSON arrays of objects to CSV spreadsheets and vice-versa. |
| | **XML Prettifier & Validator** | Indent nested XML documents with syntax inspection. |
| | **SQL Query Beautifier** | Standardize keyword casing and formatting for complex database queries. |
| **Security & Tokens** | **JWT Inspector** | Decode header, payload claims, expiry countdown, and timestamps offline. |
| | **Cryptographic Hashes & HMAC** | Instant checksums: MD5, SHA-1, SHA-256, SHA-512, and secret-keyed HMAC. |
| | **Secure Password Generator** | Cryptographically random passwords with custom symbols, numbers, and length. |
| **Encoding & Codecs** | **Base64, URL & HTML Codec** | UTF-8 safe encoding and decoding for web tokens, query strings, and markup. |
| | **Hex ↔ Text Converter** | Bidirectional conversion between raw UTF-8 text and hexadecimal byte strings. |
| **Testing & QA** | **REST Client & API Testing (Bruno-compatible)** | Full HTTP/REST test runner with environments, assertions, pre/post scripts, and `.bru` support. |
| | **JSON Schema Validator** | Validate JSON payloads against JSON Schema definitions with error breakdown. |
| | **Regex Tester & Debugger** | Test patterns against sample text with real-time match count and group breakdown. |
| | **Text Diff & Comparison** | Compare expected vs. actual outputs with color-coded unified diff view. |
| | **UUID & QA Mock Data** | Generate UUID v4/v1 IDs and randomized mock user datasets (JSON) for test scenarios. |
| | **HTTP Status & Headers** | Instant offline lookup for HTTP status codes (2xx, 3xx, 4xx, 5xx) and RFC meanings. |
| **DevOps & Environment** | **Unix Chmod Calculator** | Calculate octal codes, symbolic notation, and interactive permission flags. |
| | **.env ↔ JSON Config** | Bidirectional translation between dotenv environment files and structured JSON. |
| | **Quick Code Minifier** | Remove whitespace and comments from JavaScript, CSS, and HTML with size savings stats. |
| **Network & APIs** | **cURL to Code Converter** | Convert cURL commands into JavaScript `fetch` and Python `requests` snippets. |
| | **CIDR / Subnet Calculator** | Compute IPv4 netmasks, network bounds, broadcast addresses, and usable host counts. |
| | **URL & Query String Parser** | Decompose URI parts and extract query string parameters into structured JSON. |
| **Time & Text** | **Unix Timestamp / Epoch** | Convert between Unix epoch seconds/milliseconds and human UTC / Local dates. |
| | **String Cases & Text Stats** | camelCase, PascalCase, snake_case, kebab-case, word count, line count, and byte size. |
| | **Cron Expression Explainer** | Translate standard 5-part cron syntax into clear human English. |
| | **Markdown to HTML Preview** | Offline Markdown parser with live HTML rendering and preview. |
| | **Lorem Ipsum Text Generator** | Instant multi-paragraph dummy text for UI mockups and testing. |
| **Web & Styling** | **Color Palette Converter** | Bidirectional converter between HEX, RGB, RGBA, and HSL with interactive swatch. |

---

## 🚀 Quick Start (Build & Run from Source)

### Prerequisites
* **Node.js** (v18.x or v20.x LTS recommended)
* **npm** (bundled with Node.js)
* **Git**

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/techwasti/dev-utils.git
cd dev-utils

# 2. Install dependencies
npm install

# 3. Run unit tests
npm test

# 4. Start the application locally
npm start
```

---

## 📦 Multi-OS Executable Packaging

DevUtils packages into native installers and single-file portable binaries for all major desktop platforms:

```bash
# Package for Windows (.exe installer & portable)
npm run dist:win

# Package for macOS (.dmg and .zip)
npm run dist:mac

# Package for Linux (.AppImage, .deb, .rpm)
npm run dist:linux
```

All build artifacts will be generated in the `release/` folder. For detailed instructions, refer to the [Build & Packaging Guide](docs/BUILD_AND_PACKAGING_GUIDE.md).

---

## 🤖 Automated CI/CD & GitHub Actions

DevUtils includes pre-configured GitHub Actions workflows:

1. **Automated Cross-Platform Builds** ([`.github/workflows/build-and-release.yml`](.github/workflows/build-and-release.yml)):
   - Automatically executes test suites across Ubuntu.
   - Concurrently builds native `.exe`, `.dmg`, and `.AppImage` binaries on tag pushes (`v*`).
   - Generates and publishes releases directly to GitHub Releases with downloadable binaries.
2. **GitHub Pages Documentation** ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)):
   - Automatically deploys the interactive product portal in `docs/` to GitHub Pages upon merge to `main`.
   - See the [GitHub Pages Guide](docs/GITHUB_PAGES_GUIDE.md) to enable hosting in 1 click.

---

## 🤝 Contributing

We welcome contributions from developers, QA automation engineers, and security researchers!
* Read our [Contributing Guide](CONTRIBUTING.md) to learn how to propose new offline utilities and run tests.
* Use our standardized templates for [Bug Reports](.github/ISSUE_TEMPLATE/bug_report.yml) and [Feature Requests](.github/ISSUE_TEMPLATE/feature_request.yml).
* Review our [Pull Request Checklist](.github/PULL_REQUEST_TEMPLATE.md).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use it across personal and commercial enterprise environments.

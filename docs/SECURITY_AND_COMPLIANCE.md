# Security & Privacy Compliance Guide

## Zero Telemetry & Air-Gapped Philosophy

Modern developers and QA engineers frequently deal with sensitive information during day-to-day testing and debugging:
* Production JSON logs and payload dumps containing user PII (Personally Identifiable Information).
* Authentication tokens (JWTs, session IDs, bearer tokens) with user IDs and permissions.
* API secrets, private keys, HMAC tokens, and database connection strings.
* Internal microservice schemas and business logic.

Using standard online websites (e.g., online JSON formatters, JWT decoders, or regex testers) carries significant data privacy risks:
1. **Data in Flight**: Pasting data into a browser can send raw payload bodies to third-party web servers and log aggregators.
2. **Server-Side Caching**: Online tools often log query strings and request bodies in reverse proxies (Cloudflare, Nginx) or analytics databases.
3. **Compliance Violations**: Transmitting PII, healthcare records, or payment data to unauthorized external endpoints violates GDPR, HIPAA, SOC 2, and ISO 27001 policies.

---

## How DevUtils Guarantees Complete Data Safety

**DevUtils** was built ground-up with a strict, air-gapped security model:

### 1. 100% Offline Processing
Every single utility (JSON prettifier, JWT claims parser, regex evaluation, hash generation, etc.) is executed entirely locally on your machine. No computational step ever requires an internet connection.

### 2. Electron Sandbox & Context Isolation
Our Electron main process enforces the highest level of desktop application isolation:
```typescript
webPreferences: {
  preload: path.join(__dirname, '../preload/preload.js'),
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: true,
  webSecurity: true
}
```
* **No `eval()` execution**: External scripts cannot be loaded.
* **Controlled IPC Bridge**: The UI communicates strictly through explicit, predefined IPC channels defined in [`preload.ts`](file:///c:/Users/mahes/Downloads/Personal Projects- WOrk/Techwasti/dev-utils/src/preload/preload.ts).

### 3. Zero Outbound Network Requests
* DevUtils does **not** include Google Analytics, Sentry, Mixpanel, or telemetry pings.
* There are no background update checks or external font/CDN downloads.
* All assets, fonts, icons, and styling are bundled locally within the desktop binary.

### 4. Enterprise Air-Gapped Environments
DevUtils can be deployed inside closed enterprise networks, VPN-restricted environments, or fully air-gapped workstations (defense, finance, banking) without requiring proxy exceptions or network firewall rules.

---

## Verifying Compliance Yourself
Because DevUtils is completely open source under the MIT License, you can independently verify its offline behavior:
1. Open the Developer Tools (`Ctrl+Shift+I` or `Cmd+Option+I`) inside DevUtils.
2. Switch to the **Network** tab.
3. Perform any operation (decode a JWT, format a 50MB JSON file, generate HMAC hashes).
4. Notice that **zero network requests are sent**.


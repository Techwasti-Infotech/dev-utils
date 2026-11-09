import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
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
  lookupHttpStatusCode,
  markdownToHtml,
  convertColor,
  generateLoremIpsum,
  parseUrlQuery,
  jsonToYaml,
  yamlToJson,
  validateJsonSchema,
  calculateChmod,
  parseEnvFile,
  jsonToEnvFile,
  minifyCode
} from '../shared/utils/engine';
import {
  RestApiRequest,
  executeRestRequest,
  parseBruFile,
  serializeToBruFile,
  generateCurlFromRequest
} from '../shared/utils/restClientEngine';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 950,
    minHeight: 650,
    title: 'DevUtils - Offline Developer & QA Utilities',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIpcHandlers() {
  ipcMain.handle('json:format', (_, raw, indent) => formatJson(raw, indent));
  ipcMain.handle('json:minify', (_, raw) => minifyJson(raw));
  ipcMain.handle('jwt:decode', (_, token) => decodeJwt(token));
  ipcMain.handle('codec:base64Encode', (_, text) => base64Encode(text));
  ipcMain.handle('codec:base64Decode', (_, encoded) => base64Decode(encoded));
  ipcMain.handle('codec:urlEncode', (_, text) => urlEncode(text));
  ipcMain.handle('codec:urlDecode', (_, encoded) => urlDecode(encoded));
  ipcMain.handle('codec:escapeHtml', (_, text) => escapeHtml(text));
  ipcMain.handle('codec:unescapeHtml', (_, text) => unescapeHtml(text));
  ipcMain.handle('crypto:hash', (_, text, key) => generateHashes(text, key));
  ipcMain.handle('generator:uuid', (_, count, upper, noHyphens) => generateUuids(count, upper, noHyphens));
  ipcMain.handle('generator:mockUsers', (_, count) => generateMockUsers(count));
  ipcMain.handle('time:parseTimestamp', (_, ts) => parseTimestamp(ts));
  ipcMain.handle('time:parseDate', (_, dateStr) => parseDateStringToTimestamp(dateStr));
  ipcMain.handle('regex:test', (_, pattern, flags, text) => testRegex(pattern, flags, text));
  ipcMain.handle('diff:compute', (_, orig, mod) => computeSimpleDiff(orig, mod));
  ipcMain.handle('convert:jsonToCsv', (_, json) => jsonToCsv(json));
  ipcMain.handle('convert:csvToJson', (_, csv) => csvToJson(csv));
  ipcMain.handle('curl:parse', (_, cmd) => parseCurl(cmd));
  ipcMain.handle('text:cases', (_, text) => convertCases(text));
  ipcMain.handle('text:stats', (_, text) => inspectText(text));
  ipcMain.handle('cron:describe', (_, cron) => describeCron(cron));
  ipcMain.handle('xml:format', (_, xml, indent) => formatXml(xml, indent));
  ipcMain.handle('sql:format', (_, sql) => formatSql(sql));
  ipcMain.handle('hex:toHex', (_, text, spaces) => textToHex(text, spaces));
  ipcMain.handle('hex:toText', (_, hex) => hexToText(hex));
  ipcMain.handle('password:generate', (_, options) => generateSecurePassword(options));
  ipcMain.handle('subnet:calculate', (_, cidr) => calculateSubnet(cidr));
  ipcMain.handle('http:lookup', (_, code) => lookupHttpStatusCode(code));
  ipcMain.handle('markdown:toHtml', (_, md) => markdownToHtml(md));
  ipcMain.handle('color:convert', (_, input) => convertColor(input));
  ipcMain.handle('lorem:generate', (_, count) => generateLoremIpsum(count));
  ipcMain.handle('url:parseQuery', (_, urlStr) => parseUrlQuery(urlStr));

  // Additional Developer Utilities handlers
  ipcMain.handle('yaml:jsonToYaml', (_, jsonStr) => jsonToYaml(jsonStr));
  ipcMain.handle('yaml:yamlToJson', (_, yamlStr) => yamlToJson(yamlStr));
  ipcMain.handle('schema:validate', (_, dataJson, schemaJson) => validateJsonSchema(dataJson, schemaJson));
  ipcMain.handle('chmod:calculate', (_, input) => calculateChmod(input));
  ipcMain.handle('env:parse', (_, envStr) => parseEnvFile(envStr));
  ipcMain.handle('env:jsonToEnv', (_, jsonStr) => jsonToEnvFile(jsonStr));
  ipcMain.handle('minify:code', (_, code, lang) => minifyCode(code, lang));

  // REST API Client & Testing Tool handlers
  ipcMain.handle('rest:execute', (_, request: RestApiRequest, envVars: Record<string, string>) =>
    executeRestRequest(request, envVars)
  );
  ipcMain.handle('rest:parseBru', (_, bruContent: string) => parseBruFile(bruContent));
  ipcMain.handle('rest:serializeBru', (_, request: RestApiRequest) => serializeToBruFile(request));
  ipcMain.handle('rest:generateCurl', (_, request: RestApiRequest, envVars: Record<string, string>) =>
    generateCurlFromRequest(request, envVars)
  );
}

import { contextBridge, ipcRenderer } from 'electron';
import { PasswordOptions } from '../shared/utils/engine';

export const api = {
  json: {
    format: (raw: string, indent: number) => ipcRenderer.invoke('json:format', raw, indent),
    minify: (raw: string) => ipcRenderer.invoke('json:minify', raw),
  },
  jwt: {
    decode: (token: string) => ipcRenderer.invoke('jwt:decode', token),
  },
  codec: {
    base64Encode: (text: string) => ipcRenderer.invoke('codec:base64Encode', text),
    base64Decode: (encoded: string) => ipcRenderer.invoke('codec:base64Decode', encoded),
    urlEncode: (text: string) => ipcRenderer.invoke('codec:urlEncode', text),
    urlDecode: (encoded: string) => ipcRenderer.invoke('codec:urlDecode', encoded),
    escapeHtml: (text: string) => ipcRenderer.invoke('codec:escapeHtml', text),
    unescapeHtml: (text: string) => ipcRenderer.invoke('codec:unescapeHtml', text),
  },
  crypto: {
    hash: (text: string, secretKey?: string) => ipcRenderer.invoke('crypto:hash', text, secretKey),
  },
  generator: {
    uuid: (count: number, uppercase: boolean, noHyphens: boolean) =>
      ipcRenderer.invoke('generator:uuid', count, uppercase, noHyphens),
    mockUsers: (count: number) => ipcRenderer.invoke('generator:mockUsers', count),
  },
  time: {
    parseTimestamp: (ts: number) => ipcRenderer.invoke('time:parseTimestamp', ts),
    parseDate: (dateStr: string) => ipcRenderer.invoke('time:parseDate', dateStr),
  },
  regex: {
    test: (pattern: string, flags: string, text: string) =>
      ipcRenderer.invoke('regex:test', pattern, flags, text),
  },
  diff: {
    compute: (orig: string, mod: string) => ipcRenderer.invoke('diff:compute', orig, mod),
  },
  convert: {
    jsonToCsv: (json: string) => ipcRenderer.invoke('convert:jsonToCsv', json),
    csvToJson: (csv: string) => ipcRenderer.invoke('convert:csvToJson', csv),
  },
  curl: {
    parse: (cmd: string) => ipcRenderer.invoke('curl:parse', cmd),
  },
  text: {
    cases: (text: string) => ipcRenderer.invoke('text:cases', text),
    stats: (text: string) => ipcRenderer.invoke('text:stats', text),
  },
  cron: {
    describe: (cron: string) => ipcRenderer.invoke('cron:describe', cron),
  },
  xml: {
    format: (xml: string, indent: number = 2) => ipcRenderer.invoke('xml:format', xml, indent),
  },
  sql: {
    format: (sql: string) => ipcRenderer.invoke('sql:format', sql),
  },
  hex: {
    toHex: (text: string, spaceDelimited: boolean = true) => ipcRenderer.invoke('hex:toHex', text, spaceDelimited),
    toText: (hex: string) => ipcRenderer.invoke('hex:toText', hex),
  },
  password: {
    generate: (options: PasswordOptions) => ipcRenderer.invoke('password:generate', options),
  },
  subnet: {
    calculate: (cidr: string) => ipcRenderer.invoke('subnet:calculate', cidr),
  },
  http: {
    lookup: (code: number) => ipcRenderer.invoke('http:lookup', code),
  },
  markdown: {
    toHtml: (md: string) => ipcRenderer.invoke('markdown:toHtml', md),
  },
  color: {
    convert: (input: string) => ipcRenderer.invoke('color:convert', input),
  },
  lorem: {
    generate: (count: number) => ipcRenderer.invoke('lorem:generate', count),
  },
  url: {
    parseQuery: (urlStr: string) => ipcRenderer.invoke('url:parseQuery', urlStr),
  }
};

contextBridge.exposeInMainWorld('devUtilsAPI', api);

declare global {
  interface Window {
    devUtilsAPI: typeof api;
  }
}

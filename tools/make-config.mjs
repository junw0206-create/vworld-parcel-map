// 로컬(Live Server)용: .env → config.js 생성 (config.js 는 .gitignore 대상)
import fs from 'node:fs';
const env = Object.fromEntries(
  fs.readFileSync(new URL('../.env', import.meta.url), 'utf8').split(/\r?\n/)
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const cfg = { VWORLD_KEY: env.VWORLD_KEY || '', DATA_GO_KR_KEY: env.DATA_GO_KR_KEY || '' };
fs.writeFileSync(new URL('../config.js', import.meta.url),
  `// 자동 생성 — 커밋 금지\nwindow.APP_CONFIG=${JSON.stringify(cfg)};\n`);
console.log('config.js 생성:', Object.entries(cfg).map(([k, v]) => `${k}=${v ? '✓' : '(비어 있음)'}`).join(' '));

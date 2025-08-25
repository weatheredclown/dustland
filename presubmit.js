#!/usr/bin/env node
import fs from 'node:fs';

const files = ['dustland.html', 'adventure-kit.html'];
const patterns = [
  {regex: /\bfetch\s*\(/, message: 'fetch() usage'},
  {regex: /\brequire\s*\(/, message: 'require() usage'},
  {regex: /<script[^>]*src=["'][^"']+\.json["'][^>]*>/i, message: 'script tag loading JSON file'},
  {regex: /import[^;"'`]*\.json/, message: 'import of JSON file'},
  {regex: /<script[^>]*src=["']https?:\/\//i, message: 'remote script URL may be blocked by CORS'}
];

let failed = false;
for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const {regex, message} of patterns) {
    if (regex.test(text)) {
      console.error(`${file} contains forbidden pattern: ${message}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error('Presubmit failed: remove unsupported patterns from HTML files.');
  process.exit(1);
}

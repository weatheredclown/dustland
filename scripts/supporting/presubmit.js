#!/usr/bin/env node
/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
function getHtmlFiles(dir) {
    const out = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const p = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            if (ent.name === 'node_modules')
                continue;
            out.push(...getHtmlFiles(p));
        }
        else if (ent.name.endsWith('.html')) {
            out.push(p);
        }
    }
    return out;
}
const htmlFiles = getHtmlFiles('.');
const allowModules = new Set(['balance-tester.html']);
const patterns = [
    { regex: /\bfetch\s*\(/, message: 'fetch() usage' },
    { regex: /\brequire\s*\(/, message: 'require() usage' },
    { regex: /<script[^>]*src=["'][^"']+\.json["'][^>]*>/i, message: 'script tag loading JSON file' },
    { regex: /import[^;"'`]*\.json/, message: 'import of JSON file' },
    { regex: /<script[^>]*src=["']https?:\/\//i, message: 'remote script URL may be blocked by CORS' },
    { regex: /<script[^>]*type=["']module["'][^>]*>/i, message: 'module script tag' }
];
let failed = false;
for (const file of htmlFiles) {
    const text = fs.readFileSync(file, 'utf8');
    for (const { regex, message } of patterns) {
        if (regex.test(text)) {
            if (message === 'module script tag' && allowModules.has(path.basename(file))) {
                continue;
            }
            console.error(`${file} contains forbidden pattern: ${message}`);
            failed = true;
        }
    }
}
if (failed) {
    console.error('Presubmit failed: remove unsupported patterns from HTML files.');
    process.exit(1);
}
console.log('Presubmit passed: no forbidden patterns found.');

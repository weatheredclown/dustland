#!/usr/bin/env node
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
const moduleScriptAllowlist = new Map([
    ['adventure-kit.html', new Set([
            './scripts/hosting/firebase-bootstrap.js',
            './scripts/ack/server-mode-controls.js',
            './scripts/ack/cloud-actions.js'
        ])],
    ['dustland.html', new Set(['./scripts/hosting/firebase-bootstrap.js'])],
    ['balance-tester.html', new Set(['./scripts/supporting/balance-tester-agent.js'])]
]);
const moduleScriptRegex = /<script[^>]*type=["']module["'][^>]*>/gi;
const moduleSrcRegex = /src=["']([^"']+)["']/i;
const patterns = [
    { regex: /\bfetch\s*\(/, message: 'fetch() usage' },
    { regex: /\brequire\s*\(/, message: 'require() usage' },
    { regex: /<script[^>]*src=["'][^"']+\.json["'][^>]*>/i, message: 'script tag loading JSON file' },
    { regex: /import[^;"'`]*\.json/, message: 'import of JSON file' },
    { regex: /<script[^>]*src=["']https?:\/\//i, message: 'remote script URL may be blocked by CORS' }
];
let failed = false;
for (const file of htmlFiles) {
    const text = fs.readFileSync(file, 'utf8');
    const relPath = path.relative('.', file);
    for (const { regex, message } of patterns) {
        if (regex.test(text)) {
            console.error(`${relPath} contains forbidden pattern: ${message}`);
            failed = true;
        }
    }
    if (hasDisallowedModuleScript(relPath, text)) {
        console.error(`${relPath} contains forbidden pattern: module script tag`);
        failed = true;
    }
}
if (failed) {
    console.error('Presubmit failed: remove unsupported patterns from HTML files.');
    process.exit(1);
}
console.log('Presubmit passed: no forbidden patterns found.');
function hasDisallowedModuleScript(relPath, text) {
    const matches = text.match(moduleScriptRegex);
    if (!matches)
        return false;
    const allowedSources = moduleScriptAllowlist.get(relPath);
    for (const tag of matches) {
        const srcMatch = tag.match(moduleSrcRegex);
        if (!srcMatch)
            return true;
        if (!allowedSources || !allowedSources.has(srcMatch[1])) {
            return true;
        }
    }
    return false;
}

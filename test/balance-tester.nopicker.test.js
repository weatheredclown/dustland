import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('balance tester does not load module picker', () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const htmlPath = path.join(__dirname, '..', 'balance-tester.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>\s*<script[^>]*src="\.\/balance-tester-agent.js"><\/script>/);
  assert.ok(match, 'inline script not found');
  const script = match[1];
  const appended = [];
  const document = {
    body: { appendChild: (el) => appended.push(el) },
    getElementById: () => ({ style: {}, appendChild: () => {} }),
    createElement: () => ({})
  };
  const location = { search: '' };
  new Function('document', 'location', script)(document, location);
  const hasModulePicker = appended.some((el) => (el.src || '').includes('module-picker.js'));
  assert.strictEqual(hasModulePicker, false, 'module picker script should not be appended');
});

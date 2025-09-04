import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';

test('NPC Templates legend includes tooltip', async () => {
  const html = await fs.readFile(new URL('../adventure-kit.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html);
  const tip = dom.window.document.querySelector('#templateCard legend .help');
  assert(tip, 'help icon missing');
  assert.strictEqual(tip.textContent.trim(), '(?)');
  assert.ok(tip.getAttribute('title').includes('spawn from dialog'));
});

import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';

const cssFile = new URL('../dustland.css', import.meta.url);

function hasRule(src, selector, prop, value){
  const start = src.indexOf(selector);
  if (start === -1) return false;
  const end = src.indexOf('}', start);
  if (end === -1) return false;
  const block = src.slice(start, end);
  return block.includes(`${prop}: ${value}`);
}

test('status row spacing and icon contrast tweaked', async () => {
  const src = await fs.readFile(cssFile, 'utf8');
  assert.ok(hasRule(src, '.status-row', 'gap', '1px'));
  assert.ok(hasRule(src, '.status-row', 'margin-top', '2px'));
  assert.ok(hasRule(src, '.status-row span', 'filter', 'contrast(1.2)'));
});

test('xp bar hover displays xp label', async () => {
  const src = await fs.readFile(cssFile, 'utf8');
  assert.ok(hasRule(src, '.xpbar:hover::after', 'content', "attr(data-xp) ' xp'"));
});

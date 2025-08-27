import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';

test('damage flash checkbox updates fxConfig', async () => {
  const html = `<div id="fxPanel"><header></header><input id="fxDamageFlash" type="checkbox" /></div><div id="hpBar" class="hurt"></div>`;
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  const { window } = dom;
  window.fxConfig = { damageFlash: true };
  const code = await fs.readFile(new URL('../fx-debug.js', import.meta.url), 'utf8');
  window.eval(code);
  const cb = window.document.getElementById('fxDamageFlash');
  cb.checked = false;
  cb.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(window.fxConfig.damageFlash, false);
  assert.ok(!window.document.getElementById('hpBar').classList.contains('hurt'));
  cb.checked = true;
  cb.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(window.fxConfig.damageFlash, true);
});

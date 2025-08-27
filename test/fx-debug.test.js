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

test('fx checkboxes apply classes and update config', async () => {
  const html = `<div id="fxPanel"><header></header>
    <input id="fxScanlines" type="checkbox" />
    <input id="fxCrtShear" type="checkbox" />
    <input id="fxColorBleed" type="checkbox" />
  </div><canvas id="game"></canvas>`;
  const dom = new JSDOM(html, { runScripts: 'outside-only' });
  const { window } = dom;
  window.fxConfig = { scanlines: false, crtShear: false, colorBleed: false };
  const code = await fs.readFile(new URL('../fx-debug.js', import.meta.url), 'utf8');
  window.eval(code);
  const canvas = window.document.getElementById('game');
  const scan = window.document.getElementById('fxScanlines');
  const shear = window.document.getElementById('fxCrtShear');
  const bleed = window.document.getElementById('fxColorBleed');

  scan.checked = true;
  scan.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(window.fxConfig.scanlines, true);
  assert.ok(canvas.classList.contains('scanlines'));

  shear.checked = true;
  shear.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(window.fxConfig.crtShear, true);
  assert.ok(canvas.classList.contains('shear'));

  bleed.checked = true;
  bleed.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(window.fxConfig.colorBleed, true);
  assert.ok(canvas.classList.contains('color-bleed'));

  bleed.checked = false;
  bleed.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(window.fxConfig.colorBleed, false);
  assert.ok(!canvas.classList.contains('color-bleed'));
});

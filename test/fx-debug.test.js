import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

test('damage flash checkbox updates fxConfig', async () => {
  const document = makeDocument();
  const window = { document };
  window.fxConfig = { damageFlash: true };
  const sandbox = { window, document, fxConfig: window.fxConfig };
  sandbox.globalThis = sandbox;
  sandbox.setTimeout = setTimeout;
  sandbox.clearTimeout = clearTimeout;
  document.getElementById('fxPanel').appendChild(document.getElementById('fxDamageFlash'));
  document.getElementById('hpBar').classList.add('hurt');
  const code = await fs.readFile(new URL('../scripts/fx-debug.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  const cb = document.getElementById('fxDamageFlash');
  cb.checked = false;
  cb.dispatchEvent({ type:'change' });
  assert.equal(window.fxConfig.damageFlash, false);
  assert.ok(!document.getElementById('hpBar').classList.contains('hurt'));
  cb.checked = true;
  cb.dispatchEvent({ type:'change' });
  assert.equal(window.fxConfig.damageFlash, true);
});

test('fx checkboxes apply classes and update config', async () => {
  const document = makeDocument();
  const window = { document };
  window.fxConfig = { scanlines: false, crtShear: false, colorBleed: false };
  const sandbox = { window, document, fxConfig: window.fxConfig };
  sandbox.globalThis = sandbox;
  sandbox.setTimeout = setTimeout;
  sandbox.clearTimeout = clearTimeout;
  document.getElementById('fxPanel').appendChild(document.getElementById('fxScanlines'));
  document.getElementById('fxPanel').appendChild(document.getElementById('fxCrtShear'));
  document.getElementById('fxPanel').appendChild(document.getElementById('fxColorBleed'));
  const canvas = document.getElementById('game');
  const code = await fs.readFile(new URL('../scripts/fx-debug.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  const scan = document.getElementById('fxScanlines');
  const shear = document.getElementById('fxCrtShear');
  const bleed = document.getElementById('fxColorBleed');

  scan.checked = true;
  scan.dispatchEvent({ type:'change' });
  assert.equal(window.fxConfig.scanlines, true);
  assert.ok(canvas.classList.contains('scanlines'));

  shear.checked = true;
  shear.dispatchEvent({ type:'change' });
  assert.equal(window.fxConfig.crtShear, true);
  assert.ok(canvas.classList.contains('shear'));
  await new Promise(r => setTimeout(r, 150));
  assert.ok(!canvas.classList.contains('shear'));

  bleed.checked = true;
  bleed.dispatchEvent({ type:'change' });
  assert.equal(window.fxConfig.colorBleed, true);
  assert.ok(canvas.classList.contains('color-bleed'));

  bleed.checked = false;
  bleed.dispatchEvent({ type:'change' });
  assert.equal(window.fxConfig.colorBleed, false);
  assert.ok(!canvas.classList.contains('color-bleed'));
});

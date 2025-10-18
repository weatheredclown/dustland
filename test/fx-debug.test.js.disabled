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
  const code = await fs.readFile(new URL('../scripts/supporting/fx-debug.js', import.meta.url), 'utf8');
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

test('footstep bump checkbox updates fxConfig', async () => {
  const document = makeDocument();
  const window = { document };
  window.fxConfig = { footstepBump: false };
  const sandbox = { window, document, fxConfig: window.fxConfig };
  sandbox.globalThis = sandbox;
  sandbox.setTimeout = setTimeout;
  sandbox.clearTimeout = clearTimeout;
  document.getElementById('fxPanel').appendChild(document.getElementById('fxFootstepBump'));
  const code = await fs.readFile(new URL('../scripts/supporting/fx-debug.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  const cb = document.getElementById('fxFootstepBump');
  cb.checked = true;
  cb.dispatchEvent({ type:'change' });
  assert.equal(window.fxConfig.footstepBump, true);
  cb.checked = false;
  cb.dispatchEvent({ type:'change' });
  assert.equal(window.fxConfig.footstepBump, false);
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
  const code = await fs.readFile(new URL('../scripts/supporting/fx-debug.js', import.meta.url), 'utf8');
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

test('grayscale and adrenaline tint toggles update config and call updateHUD', async () => {
  const document = makeDocument();
  const window = { document };
  let calls = 0;
  function updateHUD(){ calls++; }
  window.updateHUD = updateHUD;
  window.fxConfig = { grayscale: false, adrenalineTint: true };
  const sandbox = { window, document, fxConfig: window.fxConfig, updateHUD };
  sandbox.globalThis = sandbox;
  sandbox.setTimeout = setTimeout;
  sandbox.clearTimeout = clearTimeout;
  document.getElementById('fxPanel').appendChild(document.getElementById('fxGrayscale'));
  document.getElementById('fxPanel').appendChild(document.getElementById('fxAdrTint'));
  const code = await fs.readFile(new URL('../scripts/supporting/fx-debug.js', import.meta.url), 'utf8');
  vm.runInNewContext(code, sandbox);
  const gray = document.getElementById('fxGrayscale');
  const adr = document.getElementById('fxAdrTint');
  gray.checked = true; gray.dispatchEvent({ type:'change' });
  adr.checked = false; adr.dispatchEvent({ type:'change' });
  assert.equal(window.fxConfig.grayscale, true);
  assert.equal(window.fxConfig.adrenalineTint, false);
  assert.equal(calls, 3);
});

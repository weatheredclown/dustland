import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const src = await fs.readFile(new URL('../modules/true-dust.module.js', import.meta.url), 'utf8');

let interval;
const logs = [];

test('radio static triggers near scrap cache', async () => {
  const context = {
    setInterval: fn => { interval = fn; return 1; },
    clearInterval: () => {},
    toast: () => {},
    log: msg => logs.push(msg),
    party: [{ equip: { trinket: { id: 'cracked_radio' } } }],
    globalThis: {}
  };
  vm.createContext(context);
  vm.runInContext(src, context);
  context.TRUE_DUST = context.globalThis.TRUE_DUST;
  const cache = context.TRUE_DUST.items.find(i => i.id.startsWith('scrap_cache'));
  context.party.map = cache.map;
  context.party.x = cache.x;
  context.party.y = cache.y;
  vm.runInContext('TRUE_DUST.startRadio();', context);
  interval();
  assert.ok(logs.some(l => /radio crackles/.test(l)));
});

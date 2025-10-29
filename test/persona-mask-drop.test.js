import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const globalsCode = await fs.readFile(new URL('../scripts/core/globals.js', import.meta.url), 'utf8');
const genCode = await fs.readFile(new URL('../scripts/core/item-generator.js', import.meta.url), 'utf8');
const cacheCode = await fs.readFile(new URL('../scripts/core/spoils-cache.js', import.meta.url), 'utf8');
const invCode = await fs.readFile(new URL('../scripts/core/inventory.js', import.meta.url), 'utf8');
const gsCode = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
const personasCode = await fs.readFile(new URL('../scripts/core/personas.js', import.meta.url), 'utf8');

const listeners = {};
const bus = { on(evt,fn){ (listeners[evt]=listeners[evt]||[]).push(fn); }, emit(evt,p){ (listeners[evt]||[]).forEach(fn=>fn(p)); } };
global.EventBus = bus;
global.party = [{}];
vm.runInThisContext(globalsCode, { filename: 'core/globals.js' });
vm.runInThisContext(genCode, { filename: 'core/item-generator.js' });
vm.runInThisContext(cacheCode, { filename: 'core/spoils-cache.js' });
vm.runInThisContext(invCode, { filename: 'core/inventory.js' });
vm.runInThisContext(gsCode, { filename: 'game-state.js' });
vm.runInThisContext(personasCode, { filename: 'core/personas.js' });

test('mask cache drop registers persona', () => {
  global.player = { inv: [SpoilsCache.create('sealed')] };
  global.notifyInventoryChanged = () => {};
  const origPick = ItemGen.pick;
  ItemGen.pick = (list, rng) => list.includes('Mask') ? 'MASK' : origPick(list, rng);
  const item = SpoilsCache.open('sealed');
  ItemGen.pick = origPick;
  const pid = item.persona;
  assert.ok(pid);
  assert.ok(global.Dustland.gameState.getPersona(pid));
  delete global.player;
});

import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createGameProxy } from './test-harness.js';

test('applyPersona uses profile runtime service', async () => {
  const party = [{ id:'m1', name:'M', role:'', lvl:1, hp:5, maxHp:5, adr:0, ap:2, stats:{}, equip:{weapon:null,armor:null,trinket:null}, _bonus:{} }];
  const { context } = createGameProxy(party);
  const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
  vm.runInContext(gs, context);
  const prof = await fs.readFile(new URL('../scripts/core/profiles.js', import.meta.url), 'utf8');
  vm.runInContext(prof, context);
  context.Dustland.effects = { apply(list){ context.applied = list; } };
  context.Dustland.gameState.setPersona('p.test', { mods:{ STR:2 }, effects:[{ effect:'log', msg:'hi'}] });
  context.Dustland.gameState.updateState(s => { s.party = party; });
  context.Dustland.gameState.applyPersona('m1', 'p.test');
  assert.equal(party[0]._bonus.STR, 2);
  assert.ok(context.applied[0].effect === 'log');
});

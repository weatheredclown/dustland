import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');

test('applyPersona emits equip and unequip', async () => {
  const events = [];
  const context = { EventBus: { emit: (evt, payload) => events.push({ evt, payload }) } };
  vm.createContext(context);
  vm.runInContext(gs, context);
  const gsApi = context.Dustland.gameState;
  gsApi.updateState(s => { s.party = [{ id: 'mara', name: 'Mara' }]; });
  gsApi.setPersona('mask1', {});
  gsApi.setPersona('mask2', {});
  gsApi.applyPersona('mara', 'mask1');
  gsApi.applyPersona('mara', 'mask2');
  const plain = JSON.parse(JSON.stringify(events.filter(e => e.evt !== 'state:changed')));
  assert.deepStrictEqual(plain, [
    { evt: 'persona:equip', payload: { memberId: 'mara', personaId: 'mask1' } },
    { evt: 'persona:unequip', payload: { memberId: 'mara', personaId: 'mask1' } },
    { evt: 'persona:equip', payload: { memberId: 'mara', personaId: 'mask2' } }
  ]);
});

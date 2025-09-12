import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const gs = await fs.readFile(new URL('../scripts/game-state.js', import.meta.url), 'utf8');
const npcCode = await fs.readFile(new URL('../scripts/core/npc.js', import.meta.url), 'utf8');

test('npc memory stores values', () => {
  const context = {
    Dustland: { actions: {} },
    player: { inv: [], scrap: 0 },
    CURRENCY: 's',
    renderInv: () => {},
    updateHUD: () => {},
    textEl: {},
    dialogState: {},
    renderDialog: () => {},
    closeDialog: () => {},
    defaultQuestProcessor: () => {},
    queueNanoDialogForNPCs: () => {}
  };
  vm.createContext(context);
  vm.runInContext(gs, context);
  vm.runInContext(npcCode, context);
  const npc = new context.NPC({ id: 'n1', map: 'w', x: 0, y: 0, color: '#fff', name: 'Bob', title: '', desc: '', tree: { start: { text: '', choices: [] } } });
  npc.remember('favor', 2);
  assert.strictEqual(context.Dustland.gameState.recallNPC('n1', 'favor'), 2);
  npc.remember('favor', 3);
  assert.strictEqual(npc.recall('favor'), 3);
  context.Dustland.gameState.forgetNPC('n1', 'favor');
  assert.strictEqual(npc.recall('favor'), undefined);
});

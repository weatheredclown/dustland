import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

test('dustland module starts in test hall', () => {
  const party = { map: 'creator', x: 0, y: 0 };
  const state = { map: 'creator' };
  function setPartyPos(x, y) { party.x = x; party.y = y; }
  function setMap(map) { state.map = map; party.map = map; }
  const context = {
    CURRENCY: 'Scrap',
    TILE: { WALL: 1, FLOOR: 2, DOOR: 3 },
    WORLD_H: 90,
    player: { scrap: 0 },
    addToInv() {},
    renderInv() {},
    renderQuests() {},
    renderParty() {},
    updateHUD() {},
    log() {},
    toast() {},
    party,
    state,
    setPartyPos,
    setMap,
    applyModule(data) { return data; },
    DC: { TALK: 10 },
    rand() { return 0; },
    NPCS: [],
    queueNanoDialogForNPCs() {}
  };
  context.global = context;
  vm.createContext(context);
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'dustland.module.js'), 'utf8');
  vm.runInContext(src, context);
  context.startGame();
  assert.strictEqual(state.map, 'hall');
  assert.strictEqual(party.x, 15);
  assert.strictEqual(party.y, 18);
});

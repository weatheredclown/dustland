import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('closeCombat restores party without overlay', async () => {
  const code = await fs.readFile(new URL('../scripts/core/combat.js', import.meta.url), 'utf8');
  const hero = { hp: 7 };
  const party = [];
  party._roster = [hero];
  party.fallen = [hero];
  party.restoreCalled = false;
  party.restore = function(){
    this.restoreCalled = true;
    this.length = 0;
    this.push(...(this._roster || []));
    this._roster = null;
    this.fallen.length = 0;
  };

  const context = {
    document: { getElementById: () => null },
    window: { addEventListener: () => {} },
    party,
    state: {},
    setMap: () => {},
    setPartyPos: () => {},
    player: { hp: 0 },
    log: () => {},
    updateHUD: () => {},
    EventBus: { emit: () => {} },
    Dustland: {},
    console,
    Date,
    performance,
    requestAnimationFrame: () => 0,
    setTimeout: () => 0,
    clearTimeout: () => {}
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(code, context, { filename: '../scripts/core/combat.js' });

  context.closeCombat('bruise');

  assert.strictEqual(party.restoreCalled, true);
  assert.strictEqual(party.length, 1);
  assert.strictEqual(party[0], hero);
  assert.strictEqual(context.player.hp, hero.hp);
});

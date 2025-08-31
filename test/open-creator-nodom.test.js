import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const code = await fs.readFile(new URL('../scripts/dustland-core.js', import.meta.url), 'utf8');

test('openCreator does nothing without DOM', () => {
  const dom = new JSDOM('<body></body>');
  const context = {
    window: dom.window,
    document: dom.window.document,
    EventBus: { on: () => {}, emit: () => {} },
    baseStats: () => ({ STR:4, AGI:4, INT:4, PER:4, LCK:4, CHA:4 }),
    makeMember: (id, name, role) => ({ id, name, role, stats:{}, special:[] }),
    joinParty: () => {},
    addToInv: () => {},
    rand: () => 0,
    log: () => {},
    party: {},
    Math: Object.assign(Object.create(Math), { random: () => 0 })
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  assert.doesNotThrow(() => context.openCreator());
});


import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

function makeStubDocument() {
  const byId = {};
  function makeEl(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      style: {},
      textContent: '',
      _id: '',
      _innerHTML: '',
      htmlHistory: [],
      appendChild(child) { (this.children ??= []).push(child); if (child._id) byId[child._id] = child; }
    };
    Object.defineProperty(el, 'id', {
      get() { return this._id; },
      set(v) { this._id = v; byId[v] = el; }
    });
    Object.defineProperty(el, 'innerHTML', {
      get() { return this._innerHTML; },
      set(v) { this._innerHTML = v; this.htmlHistory.push(v); }
    });
    return el;
  }
  return {
    body: makeEl('body'),
    getElementById: id => byId[id] ?? null,
    createElement: makeEl
  };
}

function makeActionsContext(extra = {}) {
  const document = makeStubDocument();
  const logs = [];
  const context = {
    console,
    document,
    setTimeout,
    clearTimeout,
    requestAnimationFrame: fn => fn(),
    log: msg => logs.push(msg),
    ...extra
  };
  context.globalThis = context;
  vm.createContext(context);
  return { context, document, logs };
}

async function loadActions(context) {
  const code = await fs.readFile(new URL('../scripts/core/actions.js', import.meta.url), 'utf8');
  vm.runInContext(code, context);
}

test('playEndSequence filters slides by flag condition', async () => {
  const flags = { pump_restored: 1 };
  const { context, logs } = makeActionsContext({
    checkFlagCondition: cond => (flags[cond.flag] ?? 0) >= (cond.value ?? 0)
  });
  await loadActions(context);

  await context.Dustland.actions.playEndSequence({
    fadeMs: 0,
    messageMs: 0,
    creditMs: 1,
    includeGameCredits: false,
    messages: [
      'The dust settles.',
      { text: 'The pump sings again.', if: { flag: 'pump_restored', op: '>=', value: 1 } },
      { text: 'The duke keeps his word.', if: { flag: 'duke_pact', op: '>=', value: 1 } }
    ]
  });

  assert.ok(logs.includes('The dust settles.'), 'plain slide plays');
  assert.ok(logs.includes('The pump sings again.'), 'slide with satisfied condition plays');
  assert.ok(!logs.includes('The duke keeps his word.'), 'slide with unmet condition skipped');
});

test('playEndSequence ends on a return-to-title button', async () => {
  const { context, document } = makeActionsContext();
  await loadActions(context);

  await context.Dustland.actions.playEndSequence({
    fadeMs: 0,
    messageMs: 0,
    creditMs: 1,
    includeGameCredits: false,
    messages: ['GAME OVER']
  });

  const btn = document.getElementById('dustlandEndRestart');
  assert.ok(btn, 'restart button appended after the sequence');
  assert.ok(/RETURN TO TITLE/.test(btn.textContent), 'button offers a way back to the title');
});

test('combat applies deathEffects when an enemy falls', async () => {
  const code = await fs.readFile(new URL('../scripts/core/combat.js', import.meta.url), 'utf8');
  const applied = [];
  const party = [];
  party.fallen = [];
  party.restore = () => {};
  const context = {
    document: { getElementById: () => null },
    window: { addEventListener: () => {} },
    party,
    state: {},
    player: { hp: 10 },
    log: () => {},
    updateHUD: () => {},
    EventBus: { emit: () => {} },
    Dustland: { effects: { apply: list => applied.push(...list) } },
    console,
    Date,
    performance,
    Math,
    requestAnimationFrame: () => 0,
    setTimeout: () => 0,
    clearTimeout: () => {}
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(code, context, { filename: '../scripts/core/combat.js' });

  const deathEffects = [{ effect: 'addFlag', flag: 'sovereign_fallen' }];
  context.__combatState.enemies = [{ name: 'Sovereign of Dust', hp: 1, DEF: 0, deathEffects }];
  context.playerItemAOEDamage({ name: 'Hero' }, 5, { label: 'blast' });

  assert.deepStrictEqual(applied, deathEffects, 'deathEffects handed to Dustland.effects.apply');
});

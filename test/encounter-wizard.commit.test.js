import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

const clean = v => JSON.parse(JSON.stringify(v));

async function loadWizard(extraContext = {}) {
  const document = makeDocument();
  const context = { window: { document }, document, console, ...extraContext };
  vm.createContext(context);
  for (const f of ['../components/wizard/steps/confirm.js', '../components/wizard/encounter-wizard.js']) {
    const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
    vm.runInContext(code, context);
  }
  return context;
}

test('EncounterWizard registers with steps', async () => {
  const context = await loadWizard();
  const cfg = context.Dustland.EncounterWizard;
  assert.ok(cfg && cfg.steps && cfg.steps.length === 4);
  assert.strictEqual(context.Dustland.wizards.encounter, cfg);
});

test('EncounterWizard commit creates a new template with loot', async () => {
  const context = await loadWizard();
  const mod = clean(context.Dustland.EncounterWizard.commit({
    map: 'world',
    zoneTag: '',
    minDist: 2,
    maxDist: 6,
    template: '',
    templateName: 'Dust Hound',
    hp: 10,
    atk: 3,
    def: 1,
    lootItem: '',
    lootItemName: 'Hound Fang',
    lootChance: 50
  }));
  assert.deepStrictEqual(mod, {
    encounters: [{ map: 'world', templateId: 'dust_hound', mode: 'distance', minDist: 2, maxDist: 6 }],
    templates: [{
      id: 'dust_hound',
      name: 'Dust Hound',
      combat: { HP: 10, ATK: 3, DEF: 1, lootTable: [{ item: 'hound_fang', chance: 0.5 }] }
    }],
    items: [{ id: 'hound_fang', name: 'Hound Fang', type: 'quest' }]
  });
});

test('EncounterWizard commit reuses an existing template with a zone', async () => {
  const context = await loadWizard();
  const mod = clean(context.Dustland.EncounterWizard.commit({
    map: 'cave',
    zoneTag: 'spider_den',
    template: 'spider',
    lootItem: 'silk',
    lootChance: 100
  }));
  assert.deepStrictEqual(mod, {
    encounters: [{
      map: 'cave',
      templateId: 'spider',
      mode: 'zone',
      zoneTag: 'spider_den',
      lootTable: [{ item: 'silk', chance: 1 }]
    }]
  });
});

test('EncounterWizard commit omits loot when none picked', async () => {
  const context = await loadWizard();
  const mod = clean(context.Dustland.EncounterWizard.commit({
    map: 'world',
    template: 'raider',
    minDist: 0
  }));
  assert.deepStrictEqual(mod, {
    encounters: [{ map: 'world', templateId: 'raider', mode: 'distance', minDist: 0 }]
  });
});

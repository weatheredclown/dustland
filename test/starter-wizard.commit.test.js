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
  const files = [
    '../components/wizard/steps/text.js',
    '../components/wizard/steps/map-placement.js',
    '../components/wizard/steps/confirm.js',
    '../components/wizard/starter-wizard.js'
  ];
  for (const f of files) {
    const code = await fs.readFile(new URL(f, import.meta.url), 'utf8');
    vm.runInContext(code, context);
  }
  return context;
}

test('StarterWizard registers with steps', async () => {
  const context = await loadWizard();
  const cfg = context.Dustland.StarterWizard;
  assert.ok(cfg && cfg.steps && cfg.steps.length === 9);
  assert.strictEqual(context.Dustland.wizards.starter, cfg);
});

test('StarterWizard commit produces a playable minimal module', async () => {
  let genSeed = null;
  const context = await loadWizard({ genWorld: seed => { genSeed = seed; } });
  const mod = clean(context.Dustland.StarterWizard.commit({
    moduleName: 'My First Module',
    seed: '42',
    startPos: { x: 1, y: 2 },
    npcName: 'Scout Jena',
    npcDialogue: 'You made it.',
    itemName: 'Water Chip',
    scrapReward: 8,
    itemPos: { x: 3, y: 4 },
    bldgPos: { x: 5, y: 6 }
  }));
  assert.strictEqual(genSeed, 42);
  assert.strictEqual(mod.name, 'My First Module');
  assert.strictEqual(mod.seed, 42);
  assert.deepStrictEqual(mod.start, { map: 'world', x: 1, y: 2 });
  const npc = mod.npcs[0];
  assert.strictEqual(npc.id, 'scout_jena');
  assert.strictEqual(npc.tree.start.text, 'You made it.');
  assert.strictEqual(npc.tree.job.choices[0].q, 'accept');
  assert.strictEqual(npc.tree.job.choices[1].q, 'turnin');
  assert.deepStrictEqual(mod.items, [{
    id: 'water_chip',
    name: 'Water Chip',
    type: 'quest',
    map: 'world',
    x: 3,
    y: 4
  }]);
  assert.deepStrictEqual(mod.quests, [{
    id: 'scout_jena_quest',
    giver: 'scout_jena',
    item: 'water_chip',
    title: 'Bring back Water Chip',
    reward: 'SCRAP 8'
  }]);
  assert.deepStrictEqual(mod.buildings, [{ x: 5, y: 6 }]);
});

test('StarterWizard keeps word seeds as strings', async () => {
  const context = await loadWizard();
  const mod = clean(context.Dustland.StarterWizard.commit({
    moduleName: 'm',
    seed: 'rustwind',
    startPos: { x: 0, y: 0 },
    npcName: 'g',
    npcDialogue: 'hi',
    itemName: 'chip',
    itemPos: { x: 1, y: 1 },
    bldgPos: { x: 2, y: 2 }
  }));
  assert.strictEqual(mod.seed, 'rustwind');
});

test('StarterWizard snaps picked tiles onto walkable terrain', async () => {
  const context = await loadWizard({
    TILE: { SAND: 0, WATER: 2, WALL: 6, BUILDING: 9 },
    world: [
      [2, 2, 2],
      [2, 2, 0],
      [2, 0, 0]
    ]
  });
  const mod = clean(context.Dustland.StarterWizard.commit({
    moduleName: 'm',
    seed: '1',
    startPos: { x: 0, y: 0 },
    npcName: 'g',
    npcDialogue: 'hi',
    itemName: 'chip',
    itemPos: { x: 0, y: 0 },
    bldgPos: { x: 2, y: 2 }
  }));
  const start = mod.start;
  assert.notStrictEqual(context.world[start.y][start.x], 2);
  const item = mod.items[0];
  assert.notStrictEqual(context.world[item.y][item.x], 2);
  assert.deepStrictEqual(mod.buildings, [{ x: 2, y: 2 }]);
});

import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { makeDocument } from './test-harness.js';

const clean = v => JSON.parse(JSON.stringify(v));

async function loadWizard(extraContext = {}) {
  const document = makeDocument();
  const container = document.getElementById('w');
  document.body.appendChild(container);
  const context = { window: { document }, document, console, ...extraContext };
  vm.createContext(context);
  const wizCode = await fs.readFile(new URL('../components/wizard/wizard.js', import.meta.url), 'utf8');
  vm.runInContext(wizCode, context);
  const stepFiles = ['text.js', 'asset-picker.js', 'item-picker.js', 'map-placement.js', 'confirm.js'];
  for (const f of stepFiles) {
    const code = await fs.readFile(new URL('../components/wizard/steps/' + f, import.meta.url), 'utf8');
    vm.runInContext(code, context);
  }
  const npcCode = await fs.readFile(new URL('../components/wizard/npc-wizard.js', import.meta.url), 'utf8');
  vm.runInContext(npcCode, context);
  return { context, document };
}

test('NpcWizard commit builds a fetch quest with wired dialog', async () => {
  const { context } = await loadWizard();
  const cfg = context.Dustland.NpcWizard;
  const mod = JSON.parse(JSON.stringify(cfg.commit({
    name: 'Bob',
    portrait: 'p.png',
    prompt: 'rusted scavenger',
    dialogue: 'Hi',
    questType: 'fetch',
    questItem: 'widget',
    goalCount: 1,
    scrapReward: 5,
    rewardItem: '',
    xpReward: 0,
    pos: { x: 1, y: 2 }
  })));
  assert.deepStrictEqual(mod, {
    npcs: [{
      id: 'bob',
      name: 'Bob',
      portrait: 'p.png',
      prompt: 'rusted scavenger',
      tree: {
        start: {
          text: 'Hi',
          choices: [
            { label: '(Ask about work)', to: 'job' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        job: {
          text: 'I need widget. Bring it back and I\'ll make it worth your while.',
          choices: [
            { label: '(Accept the job)', to: 'accept', q: 'accept' },
            { label: '(Turn in)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: {
          text: 'Good. It should be somewhere in the waste. Don\'t come back empty-handed.',
          choices: [{ label: '(Leave)', to: 'bye' }]
        },
        do_turnin: {
          text: 'You came through. Here\'s your cut.',
          choices: [{ label: '(Leave)', to: 'bye' }]
        }
      },
      map: 'world',
      x: 1,
      y: 2
    }],
    quests: [{
      id: 'bob_quest',
      giver: 'bob',
      item: 'widget',
      title: 'Bring back widget',
      reward: 'SCRAP 5'
    }]
  });
});

test('NpcWizard commit creates a new quest item when a custom name is given', async () => {
  const { context } = await loadWizard();
  const cfg = context.Dustland.NpcWizard;
  const mod = clean(cfg.commit({
    name: 'Bob',
    dialogue: 'Hi',
    questType: 'fetch',
    questItem: '',
    questItemName: 'Odd Gear',
    goalCount: 2,
    scrapReward: 5,
    pos: { x: 0, y: 0 }
  }));
  assert.deepStrictEqual(mod.items, [{ id: 'odd_gear', name: 'Odd Gear', type: 'quest' }]);
  assert.strictEqual(mod.quests[0].item, 'odd_gear');
  assert.strictEqual(mod.quests[0].count, 2);
});

test('NpcWizard commit builds a kill quest with a new enemy template', async () => {
  const { context } = await loadWizard();
  const cfg = context.Dustland.NpcWizard;
  const mod = clean(cfg.commit({
    name: 'Ana',
    dialogue: 'Yo',
    questType: 'kill',
    killTemplate: '',
    killTemplateName: 'Rust Wolf',
    goalCount: 3,
    scrapReward: 12,
    pos: { x: 4, y: 4 }
  }));
  assert.deepStrictEqual(mod.templates, [{
    id: 'rust_wolf',
    name: 'Rust Wolf',
    combat: { HP: 8, ATK: 2, DEF: 0, lootTable: [{ item: 'ana_quest_trophy', chance: 1 }] }
  }]);
  assert.deepStrictEqual(mod.items, [{ id: 'ana_quest_trophy', name: 'Rust Wolf Trophy', type: 'quest' }]);
  assert.strictEqual(mod.quests[0].item, 'ana_quest_trophy');
  assert.strictEqual(mod.quests[0].count, 3);
  assert.strictEqual(mod.quests[0].title, 'Cull 3 Rust Wolf');
  assert.strictEqual(mod.quests[0].reward, 'SCRAP 12');
});

test('NpcWizard commit attaches the trophy drop to an existing template', async () => {
  const moduleData = { templates: [{ id: 'raider', name: 'Raider', combat: { HP: 5 } }] };
  const { context } = await loadWizard({ ackGetModuleData: () => moduleData });
  const cfg = context.Dustland.NpcWizard;
  const mod = clean(cfg.commit({
    name: 'Ana',
    dialogue: 'Yo',
    questType: 'kill',
    killTemplate: 'raider',
    goalCount: 2,
    scrapReward: 4,
    pos: { x: 0, y: 0 }
  }));
  assert.strictEqual(mod.templates, undefined);
  assert.deepStrictEqual(clean(moduleData.templates[0].combat.lootTable), [{ item: 'ana_quest_trophy', chance: 1 }]);
  assert.deepStrictEqual(mod.items, [{ id: 'ana_quest_trophy', name: 'Raider Trophy', type: 'quest' }]);
  assert.strictEqual(mod.quests[0].count, 2);
});

test('NpcWizard commit builds an explore quest with a flag event', async () => {
  const { context } = await loadWizard();
  const cfg = context.Dustland.NpcWizard;
  const mod = clean(cfg.commit({
    name: 'Sam',
    dialogue: 'Hey',
    questType: 'explore',
    exploreX: 5,
    exploreY: 7,
    scrapReward: 2,
    xpReward: 20,
    pos: { x: 0, y: 0 }
  }));
  assert.deepStrictEqual(mod.events, [{
    map: 'world',
    x: 5,
    y: 7,
    events: [
      { when: 'enter', effect: 'addFlag', flag: 'sam_quest_reached' },
      { when: 'enter', effect: 'toast', msg: 'This is the spot Sam described.' }
    ]
  }]);
  assert.strictEqual(mod.quests[0].reqFlag, 'sam_quest_reached');
  assert.strictEqual(mod.quests[0].item, undefined);
  assert.strictEqual(mod.quests[0].xp, 20);
});

test('NpcWizard commit prefers an item reward over scrap when chosen', async () => {
  const { context } = await loadWizard();
  const cfg = context.Dustland.NpcWizard;
  const mod = clean(cfg.commit({
    name: 'Bob',
    dialogue: 'Hi',
    questType: 'fetch',
    questItem: 'widget',
    goalCount: 1,
    scrapReward: 5,
    rewardItem: 'medkit',
    pos: { x: 0, y: 0 }
  }));
  assert.strictEqual(mod.quests[0].reward, 'medkit');
});

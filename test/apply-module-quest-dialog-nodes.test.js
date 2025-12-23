import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const questsSrc = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'core', 'quests.js'), 'utf8');
const coreSrc = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'dustland-core.js'), 'utf8');
const applySrc = coreSrc.match(/function applyModule[\s\S]*?return moduleData;\n}/)[0];

test('applyModule registers dialog node objectives on quests', () => {
  const context = {
    Math,
    console: { log: () => {} },
    log: () => {},
    toast: () => {},
    interiors: {},
    buildings: [],
    portals: [],
    tileEvents: [],
    itemDrops: [],
    npcTemplates: [],
    enemyBanks: {},
    mapLabels: {},
    world: [],
    worldFlags: {},
    NPCS: [],
    hiddenNPCs: [],
    ITEMS: {},
    quests: {},
    party: [],
    player: { inv: [] },
    EventBus: { on: () => {}, emit: () => {} },
    soundSources: [],
    Dustland: {
      behaviors: { teardown: () => {}, setup: () => {} },
      effects: { reset: () => {} },
      personaTemplates: {}
    },
    questItemLocations: {},
    state: {},
    renderQuests: () => {},
    revealHiddenNPCs: () => {},
    queueNanoDialogForNPCs: () => {},
    flagValue: () => true,
    textEl: { textContent: '' },
    choicesEl: { innerHTML: '', appendChild: () => {} },
    closeDialog: () => {},
    addToInv: () => {},
    removeFromInv: () => {},
    findItemIndex: () => -1,
    resolveItem: () => null,
    countItems: () => 0,
    awardXP: () => {},
    setRNGSeed: () => {},
    genWorld: () => {},
    gridFromEmoji: () => [],
    placeHut: () => {},
    registerTileEvents: () => {},
    registerZoneEffects: () => {},
    registerItem: def => def,
    makeNPC: (id, map, x, y, color, name, title, desc, tree, quest) => ({ id, map, x, y, color, name, title, desc, tree, quest }),
    getNextId: id => id,
    hasItem: () => false,
    setPartyPos: () => {},
    setMap: () => {},
    centerCamera: () => {}
  };
  context.globalThis = context;
  context.coreGlobals = context;
  vm.runInNewContext(questsSrc, context);
  vm.runInNewContext(applySrc, context);

  const moduleData = {
    name: 'test-module',
    quests: [
      {
        id: 'q_dialog',
        title: 'Currying Favor',
        desc: 'Earn the Duke\'s respect.',
        dialogNodes: [{ npcId: 'duke_wastes', nodeId: 'favor_granted' }],
        progressText: 'The Duke has not pledged us his favor yet.'
      }
    ]
  };

  context.applyModule(moduleData, { fullReset: true });

  const quest = context.quests.q_dialog;
  assert.ok(quest, 'quest should be registered');
  assert.equal(quest.requiresDialogNodes, true);
  assert.ok(Array.isArray(quest.dialogNodes));
  assert.equal(quest.dialogNodes.length, 1);
  assert.equal(quest.dialogNodes[0].npcId, 'duke_wastes');
  assert.equal(quest.dialogNodes[0].nodeId, 'favor_granted');
  assert.equal(quest.count, 1);
  assert.equal(quest.progress, 0);

  context.questLog.add(quest);
  assert.equal(quest.status, 'active');

  context.trackQuestDialogNode('duke_wastes', 'favor_granted');
  assert.equal(quest.progress, 1);
});

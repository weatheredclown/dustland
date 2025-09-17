import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

const [moduleSrc, questsSrc] = await Promise.all([
  fs.readFile(new URL('../modules/true-dust.module.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('../scripts/core/quests.js', import.meta.url), 'utf8')
]);

function makeEventBus(events) {
  const listeners = new Map();
  return {
    on(evt, fn) {
      if (!listeners.has(evt)) listeners.set(evt, new Set());
      listeners.get(evt).add(fn);
    },
    emit(evt, payload) {
      events.push({ evt, payload });
      listeners.get(evt)?.forEach(fn => fn(payload));
    }
  };
}

test('mask memory quest updates journal and checkpoints', async () => {
  const events = [];
  const flags = {};
  const context = {
    setInterval: () => 0,
    clearInterval: () => {},
    log: () => {},
    renderQuests: () => {},
    queueNanoDialogForNPCs: () => {},
    toast: () => {},
    textEl: { textContent: '' },
    choicesEl: { innerHTML: '', appendChild: () => {} },
    closeDialog: () => {},
    party: [{}, {}],
    player: { inv: [], scrap: 0 },
    addToInv: item => { context.player.inv.push(item); return true; },
    removeFromInv: idx => { if (idx > -1) context.player.inv.splice(idx, 1); },
    countItems: tag => {
      const needle = typeof tag === 'string' ? tag.toLowerCase() : '';
      return context.player.inv.reduce((sum, it) => {
        const tags = Array.isArray(it?.tags) ? it.tags.map(t => t.toLowerCase()) : [];
        return sum + (it.id === tag || tags.includes(needle) ? 1 : 0);
      }, 0);
    },
    findItemIndex: tag => {
      const needle = typeof tag === 'string' ? tag.toLowerCase() : '';
      return context.player.inv.findIndex(it => it.id === tag || it.tags?.map(t => t.toLowerCase()).includes(needle));
    },
    resolveItem: it => (typeof it === 'string' ? { id: it, name: it } : it),
    awardXP: () => {},
    flagValue: flag => flags[flag] ?? 0,
    setFlag: (flag, value) => { flags[flag] = value; },
    EventBus: makeEventBus(events),
    console
  };
  context.globalThis = context;
  vm.createContext(context);

  vm.runInContext(questsSrc, context);
  vm.runInContext(moduleSrc, context);

  const mod = context.TRUE_DUST;
  const questDef = mod.quests.find(q => q.id === 'mask_memory');
  const quest = new context.Quest(questDef.id, questDef.title, questDef.desc, questDef);
  context.quests[quest.id] = quest;

  mod.postLoad(mod);

  const hermit = mod.npcs.find(n => n.id === 'mask_giver');
  assert.ok(hermit, 'mask hermit exists');
  const accept = hermit.tree.start.choices.find(c => c.q === 'accept');
  assert.ok(accept?.effects?.length, 'accept choice gains effects');
  accept.effects.forEach(fn => typeof fn === 'function' && fn());

  assert.strictEqual(context.quests[quest.id].status, 'active');
  assert.strictEqual(context.quests[quest.id].progress, 0);
  assert.strictEqual(context.quests[quest.id].desc, 'Salvage a buried mask near Stonegate so the hermit can wake the persona dreaming inside.');
  assert.strictEqual(flags.mask_memory_stage, 1);
  assert.ok(events.some(e => e.evt === 'quest:checkpoint' && e.payload?.stage === 'accepted'));

  context.player.inv.push({ id: 'cache_mask', name: 'Dormant Mask', tags: ['mask'] });
  context.EventBus.emit('item:picked', { tags: ['mask'] });

  assert.strictEqual(context.quests[quest.id].progress, 1);
  assert.strictEqual(context.quests[quest.id].desc, 'You recovered a dormant mask humming with borrowed life. Bring it to the hermit before the echo fades.');
  assert.ok(events.some(e => e.evt === 'quest:checkpoint' && e.payload?.stage === 'recovered'));

  context.quests[quest.id].complete();

  assert.strictEqual(context.quests[quest.id].status, 'completed');
  assert.strictEqual(context.quests[quest.id].progress, 2);
  assert.strictEqual(context.quests[quest.id].desc, 'The mask is awake. Rest at camp so it can choose whose face to wear.');
  assert.strictEqual(flags.mask_memory_stage, 2);
  assert.ok(events.some(e => e.evt === 'quest:checkpoint' && e.payload?.stage === 'awakened'));
  assert.strictEqual(hermit.tree.start.text, 'The hermit watches the awakened mask tilt toward your camp, content to let the memory ride with you.');
});

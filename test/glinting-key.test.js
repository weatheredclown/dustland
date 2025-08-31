import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import vm from 'node:vm';

// verify the Glinting Key transports the party and logs a vision

test('glinting key triggers vision', async () => {
  const code = await fs.readFile(new URL('../modules/dustland.module.js', import.meta.url), 'utf8');
  const context = {
    log(msg){ context.logged = msg; },
    setMap(map){ context.map = map; },
    setPartyPos(x, y){ context.pos = { x, y }; },
    NPCS: []
  };
  vm.createContext(context);
  vm.runInContext(code, context);
  context.DUSTLAND_MODULE.postLoad(context.DUSTLAND_MODULE);
  const key = context.DUSTLAND_MODULE.items.find(i => i.id === 'glinting_key');
  assert.ok(key && key.use && typeof key.use.onUse === 'function');
  key.use.onUse();
  assert.strictEqual(context.map, 'echo_chamber');
  assert.deepEqual(context.pos, { x: 2, y: 2 });
  assert.strictEqual(context.logged, 'A vision of a shining world surrounds you.');
});

test('exit door remarks on glinting key', async () => {
  const [modSrc, dialogSrc] = await Promise.all([
    fs.readFile(new URL('../modules/dustland.module.js', import.meta.url), 'utf8'),
    fs.readFile(new URL('../scripts/core/dialog.js', import.meta.url), 'utf8')
  ]);

  function stubEl() {
    return { children: [], classList: { toggle() {} }, appendChild() {}, querySelector() {}, textContent: '', innerHTML: '' };
  }
  const overlay = stubEl();
  const choicesEl = stubEl();
  const dialogText = stubEl();
  const npcName = stubEl();
  const npcTitle = stubEl();
  const portEl = stubEl();

  const context = {
    player: { inv: [{ id: 'glinting_key', tags: ['key'] }] },
    party: {},
    state: {},
    NPCS: [],
    Dustland: { actions: { applyQuestReward() {} }, effects: { apply() {} } },
    countItems: (id) => (id === 'glinting_key' ? 1 : 0),
    dialogJoinParty: () => {},
    processQuestFlag: () => {},
    handleGoto: () => {},
    document: {
      getElementById: (id) => ({ overlay, choices: choicesEl, dialogText, npcName, npcTitle, port: portEl }[id] || stubEl()),
      createElement: () => stubEl(),
      querySelector: () => stubEl()
    },
    window: {},
    log: () => {}
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(dialogSrc, context);
  vm.runInContext(modSrc, context);

  const exit = context.DUSTLAND_MODULE.npcs.find((n) => n.id === 'exitdoor');
  const normalizeDialogTree = (tree) => {
    const out = {};
    for (const id in tree) {
      const n = tree[id];
      const next = (n.choices || []).map((c) => ({ id: c.to, label: c.label, to: c.to }));
      out[id] = { text: n.text || '', next };
    }
    return out;
  };
  const tree = normalizeDialogTree(exit.tree);
  const dialog = { tree, node: 'start' };
  const idx = tree.start.next.findIndex((c) => c.label === '(Use Glinting Key)');
  assert.ok(idx > -1);
  context.advanceDialog(dialog, idx);
  assert.equal(dialog.node, 'glint_fail');
  assert.match(tree.glint_fail.text, /shiny things aren't always the best in this place/i);
});

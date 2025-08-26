// ===== NPCs =====
var Dustland = globalThis.Dustland;
class NPC {
  constructor({id,map,x,y,color,name,title,desc,tree,quest=null,processNode=null,processChoice=null,combat=null,shop=false,portraitSheet=null}) {
    Object.assign(this, {id,map,x,y,color,name,title,desc,tree,quest,combat,shop,portraitSheet});
    const capNode = (node) => {
      if (this.combat && node === 'do_fight') {
        closeDialog();
        Dustland.actions.startCombat({ ...this.combat, npc: this, name: this.name });
      } else if (this.shop && node === 'sell') {
        const items = player.inv.map((it, idx) => ({label: `Sell ${it.name} (${Math.max(1, it.value || 0)} ${CURRENCY})`, to: 'sell', sellIndex: idx}));
        this.tree.sell.text = items.length ? 'What are you selling?' : 'Nothing to sell.';
        items.push({label: '(Back)', to: 'start'});
        this.tree.sell.choices = items;
      } else if (this.shop && node === 'buy') {
        closeDialog();
        Dustland.actions.openShop(this);
        return;
      }
    };
    const capChoice = (c) => {
      if (this.shop && typeof c.sellIndex === 'number') {
        const it = player.inv.splice(c.sellIndex, 1)[0];
        const val = Math.max(1, it.value || 0);
        player.scrap += val;
        renderInv?.(); updateHUD?.();
        textEl.textContent = `Sold ${it.name} for ${val} ${CURRENCY}.`;
        dialogState.node = 'sell';
        renderDialog();
        return true;
      }
      return false;
    };
    const userPN = processNode;
    this.processNode = (node) => {
      if (quest) defaultQuestProcessor(this, node);
      capNode(node);
      if (userPN) userPN.call(this, node);
    };
    const userPC = processChoice;
    if (userPC) {
      this.processChoice = (c) => { if (capChoice(c)) return; return userPC.call(this, c); };
    } else {
      this.processChoice = (c) => { capChoice(c); };
    }
  }
}

function makeNPC(id, map, x, y, color, name, title, desc, tree, quest, processNode, processChoice, opts) {
  if (opts?.combat) {
    tree = tree || {};
    tree.start = tree.start || {text: '', choices: []};
    tree.start.choices = tree.start.choices || [];
    let fightChoice = tree.start.choices.find(c => c.label === '(Fight)' || c.to === 'do_fight');
    if (fightChoice) {
      fightChoice.label = '(Fight)';
      fightChoice.to = 'do_fight';
    } else {
      fightChoice = {label: '(Fight)', to: 'do_fight'};
      tree.start.choices.unshift(fightChoice);
    }
    tree.start.choices = tree.start.choices.filter(c => c === fightChoice || c.label !== '(Fight)');
    tree.do_fight = tree.do_fight || {text: '', choices: [{label: '(Continue)', to: 'bye'}]};
  }
  if (opts?.shop) {
    tree = tree || {};
    tree.start = tree.start || {text: '', choices: []};
    tree.start.choices = tree.start.choices || [];
    if (!tree.start.choices.some(c => c.to === 'sell')) {
      tree.start.choices.push({label: '(Sell items)', to: 'sell'});
    }
    tree.sell = tree.sell || {text: 'What are you selling?', choices: []};
  }
  return new NPC({id,map,x,y,color,name,title,desc,tree,quest,processNode,processChoice, ...(opts || {})});
}

function resolveNode(tree, nodeId) {
  const n = tree && tree[nodeId];
  if (!n) return null;
  const choices = n.choices || [];
  return { ...n, choices };
}

const NPCS = [];
function npcsOnMap(map = state.map) {
  return NPCS.filter(n => n.map === map);
}

function queueNanoDialogForNPCs(nodeId = 'start', reason = 'inventory change', map = state.map) {
  if (!window.NanoDialog) return;
  npcsOnMap(map).forEach(n => NanoDialog.queueForNPC(n, nodeId, reason));
}

function removeNPC(npc) {
  const idx = NPCS.indexOf(npc);
  if (idx > -1) NPCS.splice(idx, 1);
}

function createNpcFactory(defs) {
  const npcFactory = {};
  (defs || []).forEach(n => {
    npcFactory[n.id] = (x = n.x, y = n.y) => {
      let tree = n.tree;
      if (typeof tree === 'string') { try { tree = JSON.parse(tree); } catch (e) { tree = null; } }
      if (!tree || !Object.keys(tree).length) {
        tree = { start: { text: n.dialog || '', choices: [{label: '(Leave)', to: 'bye'}] } };
      }
      const opts = {};
      if (n.combat) opts.combat = n.combat;
      if (n.shop) opts.shop = n.shop;
      if (n.portraitSheet) opts.portraitSheet = n.portraitSheet;
      const npc = makeNPC(
        n.id,
        n.map || 'world',
        x,
        y,
        n.color || '#9ef7a0',
        n.name || n.id,
        n.title || '',
        n.desc || '',
        tree,
        null,
        null,
        null,
        opts
      );
      if (Array.isArray(n.loop)) npc.loop = n.loop;
      return npc;
    };
  });
  return npcFactory;
}

function scaleEnemy(npc, lvl = 1, build = []) {
  npc.stats = npc.stats || (typeof baseStats === 'function' ? baseStats() : {});
  npc.maxHp = npc.maxHp ?? npc.hp ?? 10;
  npc.hp = npc.maxHp;
  for (let i = 1; i < lvl; i++) {
    npc.maxHp += 10;
    npc.hp = npc.maxHp;
    const stat = Array.isArray(build) && build.length ? build[(i - 1) % build.length] : null;
    if (stat) npc.stats[stat] = (npc.stats[stat] || 0) + 1;
  }
  npc.lvl = lvl;
}

function scaleEnemyWithPreset(npc, lvl = 1, preset = '') {
  const build = enemyPresets?.[preset] || [];
  scaleEnemy(npc, lvl, build);
}

const npcExports = { NPC, makeNPC, resolveNode, NPCS, npcsOnMap, queueNanoDialogForNPCs, removeNPC, createNpcFactory, scaleEnemy, scaleEnemyWithPreset };
Object.assign(globalThis, npcExports);

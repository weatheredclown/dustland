// ===== NPCs =====
var Dustland = globalThis.Dustland;
const NPC_COLOR = '#9ef7a0';
const OBJECT_COLOR = '#225a20';
class NPC {
  constructor({id,map,x,y,color,name,title,desc,tree,quest=null,quests=null,questDialogs=null,processNode=null,processChoice=null,combat=null,shop=false,workbench=false,portraitSheet=null,portraitLock=true,symbol='!',door=false,locked=false,prompt=null,unlockTime=null,questIdx=0,trainer=null,overrideColor=false}) {
    Object.assign(this, {id,map,x,y,color,name,title,desc,tree,quest,quests,questDialogs,combat,shop,workbench,portraitSheet,portraitLock,symbol,door,locked,prompt,unlockTime,questIdx,trainer,overrideColor});
    if (Array.isArray(this.quests) && !this.quest) {
      this.quest = this.quests[this.questIdx] ?? null;
    }
    if (!this.tree) this.tree = { start: { text: '', choices: [{label: '(Leave)', to: 'bye'}] } };
    if (Array.isArray(this.questDialogs) && this.questDialogs.length) {
      this.tree.start.text = this.questDialogs[this.questIdx] ?? this.tree.start.text;
    }
    if (this.quest && !this.quest.status) this.quest.status = 'available';
    // `door` marks an NPC tile as passable when unlocked
    const capNode = (node) => {
      if (this.combat && node === 'do_fight') {
        closeDialog();
        Dustland.actions.startCombat({ ...this.combat, npc: this, name: this.name });
      } else if (this.shop && node === 'sell') {
        const items = player.inv.map((it, idx) => {
          const price = typeof it.scrap === 'number' ? it.scrap : Math.max(1, it.value ?? 0);
          const qty = Math.max(1, Number.isFinite(it?.count) ? it.count : 1);
          const name = qty > 1 ? `${it.name} x${qty}` : it.name;
          return { label: `Sell ${name} (${price} ${CURRENCY})`, to: 'sell', sellIndex: idx };
        });
        this.tree.sell.text = items.length ? 'What are you selling?' : 'Nothing to sell.';
        items.push({label: '(Back)', to: 'start'});
        this.tree.sell.choices = items;
      } else if (this.shop && node === 'buy') {
        closeDialog();
        Dustland.openShop?.(this);
        return;
      } else if (this.workbench && node === 'start') {
        closeDialog();
        Dustland.openWorkbench?.();
        return;
      }
    };
    const capChoice = (c) => {
      if (this.shop && typeof c.sellIndex === 'number') {
        const it = player.inv[c.sellIndex];
        if (!it) return false;
        const val = typeof it.scrap === 'number' ? it.scrap : Math.max(1, it.value ?? 0);
        player.scrap += val;
        removeFromInv?.(c.sellIndex);
        const shop = this.shop;
        if (shop && Array.isArray(shop.inv)) {
          const existing = shop.inv.find(entry => entry?.id === it.id && Math.max(1, Number.isFinite(entry.count) ? entry.count : 1) < 256);
          if (existing) {
            const current = Math.max(1, Number.isFinite(existing.count) ? existing.count : 1);
            existing.count = Math.min(256, current + 1);
          } else {
            shop.inv.push({ id: it.id, count: 1 });
          }
        }
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
      if (this.quest) defaultQuestProcessor(this, node);
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

  remember(key, value){
    Dustland.gameState?.rememberNPC?.(this.id, key, value);
  }

  recall(key){
    return Dustland.gameState?.recallNPC?.(this.id, key);
  }
}

function makeNPC(id, map, x, y, color, name, title, desc, tree, quest, processNode, processChoice, opts) {
  if (opts?.combat) {
    tree = tree ?? {};
    tree.start = tree.start ?? {text: '', choices: []};
    tree.start.choices = tree.start.choices ?? [];
    let fightChoice = tree.start.choices.find(c => c.label === '(Fight)' || c.to === 'do_fight');
    if (fightChoice) {
      fightChoice.label = '(Fight)';
      fightChoice.to = 'do_fight';
    } else {
      fightChoice = {label: '(Fight)', to: 'do_fight'};
      tree.start.choices.unshift(fightChoice);
    }
    tree.start.choices = tree.start.choices.filter(c => c === fightChoice || c.label !== '(Fight)');
    tree.do_fight = tree.do_fight ?? {text: '', choices: [{label: '(Continue)', to: 'bye'}]};
  }
  if (opts?.shop) {
    tree = tree ?? {};
    tree.start = tree.start ?? {text: '', choices: []};
    tree.start.choices = tree.start.choices ?? [];
    if (!tree.start.choices.some(c => c.to === 'sell')) {
      tree.start.choices.push({label: '(Sell items)', to: 'sell'});
    }
    tree.sell = tree.sell ?? {text: 'What are you selling?', choices: []};
  }
  if (opts?.trainer) {
    tree = tree ?? {};
    tree.start = tree.start ?? {text: '', choices: []};
    tree.start.choices = tree.start.choices ?? [];
    if (!tree.start.choices.some(c => c.to === 'train')) {
      tree.start.choices.unshift({
        label: '(Upgrade Skills)',
        to: 'train',
        effects: [{ effect: 'showTrainer', trainer: opts.trainer }]
      });
    }
    tree.train = tree.train ?? { text: '', choices: [{ label: '(Back)', to: 'start' }] };
    if (!tree.train.choices?.length) tree.train.choices = [{ label: '(Back)', to: 'start' }];
  }
  const q = quest ?? (opts?.quests ? opts.quests[0] : null);
  color = color ?? (opts?.symbol && opts.symbol !== '!' ? OBJECT_COLOR : NPC_COLOR);
  return new NPC({id,map,x,y,color,name,title,desc,tree,quest:q,processNode,processChoice, ...(opts ?? {})});
}

function resolveNode(tree, nodeId) {
  const n = tree && tree[nodeId];
  if (!n) return null;
  const choices = n.choices ?? [];
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
  (defs ?? []).forEach(n => {
    npcFactory[n.id] = (x = n.x, y = n.y) => {
      let tree = n.tree;
      if (typeof tree === 'string') { try { tree = JSON.parse(tree); } catch (e) { tree = null; } }
      const dlgArr = n.dialogs ?? (Array.isArray(n.dialog) ? n.dialog : null);
      if (!tree || !Object.keys(tree).length) {
        const txt = dlgArr ? dlgArr[0] : (n.dialog ?? '');
        tree = { start: { text: txt, choices: [{label: '(Leave)', to: 'bye'}] } };
      }
      const opts = {};
      if (n.combat) opts.combat = n.combat;
      if (n.shop) opts.shop = n.shop;
      if (n.workbench) opts.workbench = true;
      if (n.portraitSheet) opts.portraitSheet = n.portraitSheet;
      if (n.portraitLock === false) opts.portraitLock = false;
      if (n.prompt) opts.prompt = n.prompt;
      if (n.symbol) opts.symbol = n.symbol;
      if (n.door) opts.door = n.door;
      if (typeof n.locked === 'boolean') opts.locked = n.locked;
      if (n.trainer) opts.trainer = n.trainer;
      else if (n.id && n.id.startsWith('trainer_')) opts.trainer = n.id.split('_')[1];
      if (typeof n.overrideColor === 'boolean') opts.overrideColor = n.overrideColor;
      if (Array.isArray(n.quests)) {
        opts.quests = n.quests.map(q => typeof q === 'string' ? (globalThis.quests?.[q] ?? null) : q).filter(Boolean);
      }
      if (dlgArr) opts.questDialogs = dlgArr;
      const npc = makeNPC(
        n.id,
        n.map ?? 'world',
        x,
        y,
        n.color,
        n.name ?? n.id,
        n.title ?? '',
        n.desc ?? '',
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
  npc.stats = npc.stats ?? (typeof baseStats === 'function' ? baseStats() : {});
  npc.maxHp = npc.maxHp ?? npc.hp ?? 10;
  npc.hp = npc.maxHp;
  for (let i = 1; i < lvl; i++) {
    npc.maxHp += 10;
    npc.hp = npc.maxHp;
    const stat = Array.isArray(build) && build.length ? build[(i - 1) % build.length] : null;
    if (stat) npc.stats[stat] = (npc.stats[stat] ?? 0) + 1;
  }
  npc.lvl = lvl;
}

function scaleEnemyWithPreset(npc, lvl = 1, preset = '') {
  const build = enemyPresets?.[preset] ?? [];
  scaleEnemy(npc, lvl, build);
}

const npcExports = { NPC, makeNPC, resolveNode, NPCS, npcsOnMap, queueNanoDialogForNPCs, removeNPC, createNpcFactory, scaleEnemy, scaleEnemyWithPreset };
Object.assign(globalThis, npcExports);

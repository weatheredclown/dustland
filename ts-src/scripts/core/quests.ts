// @ts-nocheck
// ===== Quests =====

/* global renderQuests, log, toast, EventBus, queueNanoDialogForNPCs, flagValue, textEl, choicesEl, closeDialog, player */
/** @typedef {import('./inventory.js').GameItem} GameItem */

/**
 * @typedef {object} QuestData
 * @property {string} id
 * @property {string} title
 * @property {string} desc
 * @property {'available'|'active'|'completed'} status
 * @property {boolean} [pinned]
 * @property {string} [item]
 * @property {string} [itemTag]
 * @property {number} [count]
 * @property {number} [progress]
 * @property {string} [reqFlag]
 * @property {string|GameItem} [reward]
 * @property {number} [xp]
 * @property {{x:number,y:number}} [moveTo]
 * @property {{map:string,x:number,y:number,name?:string,id?:string}[]} [givers]
 * @property {{map:string,x:number,y:number}} [itemLocation]
 * @property {string} [outcome]
 * @property {Quest[]} [quests]
 * @property {{npcId:string,nodeId:string}[]} [dialogNodes]
 * @property {Record<string, boolean>} [dialogProgress]
 * @property {string} [progressText]
 */

class Quest {
  /**
   * @param {string} id
   * @param {string} title
   * @param {string} desc
   * @param {QuestData} [meta]
   */
  constructor(id, title, desc, meta = {}) {
    this.id = id;
    this.title = title;
    this.desc = desc;
    this.status = 'available';
    this.pinned = meta.pinned || false;
    this.givers = Array.isArray(meta.givers) ? meta.givers.map(g => ({ ...g })) : [];
    this.itemLocation = meta.itemLocation ? { ...meta.itemLocation } : null;
    const rawDialog = meta.dialog ? JSON.parse(JSON.stringify(meta.dialog)) : null;
    Object.assign(this, meta);
    this.dialog = rawDialog ?? (this.dialog ? JSON.parse(JSON.stringify(this.dialog)) : null);
    if (Array.isArray(this.givers)) {
      this.givers = this.givers.map(g => ({ ...g }));
    } else {
      this.givers = this.givers ? [{ ...this.givers }] : [];
    }
    if (this.itemLocation) this.itemLocation = { ...this.itemLocation };
    if (!Number.isFinite(this.progress)) this.progress = 0;
    const rawDialogNodes = Array.isArray(this.dialogNodes)
      ? this.dialogNodes
      : Array.isArray(meta.dialogNodes)
        ? meta.dialogNodes
        : [];
    this.dialogNodes = rawDialogNodes
      .map(normalizeDialogNode)
      .filter(Boolean);
    if (this.dialogNodes.length) {
      if (!this.dialogProgress || typeof this.dialogProgress !== 'object') {
        this.dialogProgress = {};
      } else {
        const keys = Object.keys(this.dialogProgress).filter(k => this.dialogProgress[k]);
        this.dialogProgress = Object.fromEntries(keys.map(k => [k, true]));
      }
      if (typeof this.count !== 'number') this.count = this.dialogNodes.length;
      const visited = Object.keys(this.dialogProgress).length;
      if (!Number.isFinite(this.progress) || this.progress < visited) {
        this.progress = visited;
      }
      this.requiresDialogNodes = true;
    } else {
      this.dialogProgress = {};
      this.requiresDialogNodes = false;
    }
    if (this.itemLocation) this.itemLocation = { ...this.itemLocation };
  }
  complete(outcome) {
    if (this.status !== 'completed') {
      this.status = 'completed';
      if (outcome) this.outcome = outcome;
      renderQuests();
      log('Quest completed: ' + this.title);
      if (typeof toast === 'function') toast(`QUEST COMPLETE: ${this.title}`);
      EventBus.emit('quest:completed', { quest: this });
      queueNanoDialogForNPCs?.('start', 'quest update');
    }
  }
}

class QuestLog {
  constructor() { /** @type {Record<string, Quest>} */ this.quests = {}; }
  /** @param {Quest} quest */
  add(quest) {
    const existing = this.quests[quest.id];
    if (existing) {
      if (existing.status === 'available') {
        existing.status = 'active';
        renderQuests();
        log('Quest added: ' + existing.title);
        queueNanoDialogForNPCs?.('start', 'quest update');
      }
      return;
    }
    quest.status = 'active';
    this.quests[quest.id] = quest;
    renderQuests();
    log('Quest added: ' + quest.title);
    queueNanoDialogForNPCs?.('start', 'quest update');
  }
  /** @param {string} id 
   *  @param {string} [outcome]
   */
  complete(id, outcome) {
    const q = this.quests[id];
    if (q) q.complete(outcome);
  }
  /** @param {string} id */
  pin(id) {
    const q = this.quests[id];
    if (q && !q.pinned) {
      q.pinned = true;
      renderQuests();
    }
  }
  /** @param {string} id */
  unpin(id) {
    const q = this.quests[id];
    if (q && q.pinned) {
      q.pinned = false;
      renderQuests();
    }
  }
}

const questLog = new QuestLog();
const quests = questLog.quests;
function addQuest(id, title, desc, meta) { questLog.add(new Quest(id, title, desc, meta)); }
function completeQuest(id, outcome) { questLog.complete(id, outcome); }
function pinQuest(id) { questLog.pin(id); }
function unpinQuest(id) { questLog.unpin(id); }

function normalizeDialogNode(entry) {
  if (!entry) return null;
  if (typeof entry === 'string') {
    const [npcPart = '', nodePart = 'start'] = entry.split('::');
    const npcId = npcPart.trim();
    const nodeId = (nodePart || 'start').trim() || 'start';
    return npcId ? { npcId, nodeId } : null;
  }
  if (typeof entry === 'object') {
    const npcId = (entry.npcId || entry.npc || entry.id || '').trim();
    if (!npcId) return null;
    const nodeRaw = entry.nodeId || entry.node || entry.to || 'start';
    const nodeId = typeof nodeRaw === 'string' && nodeRaw.trim() ? nodeRaw.trim() : 'start';
    return { npcId, nodeId };
  }
  return null;
}

function hasDialogGoals(meta) {
  return Array.isArray(meta?.dialogNodes) && meta.dialogNodes.length > 0;
}

function trackQuestDialogNode(npcId, nodeId) {
  if (!npcId || !nodeId) return;
  Object.values(quests).forEach(q => {
    if (!q || q.status !== 'active' || !hasDialogGoals(q)) return;
    const target = q.dialogNodes.find(goal => goal.npcId === npcId && (goal.nodeId || 'start') === nodeId);
    if (!target) return;
    if (!q.dialogProgress || typeof q.dialogProgress !== 'object') q.dialogProgress = {};
    const key = `${npcId}::${nodeId}`;
    if (q.dialogProgress[key]) return;
    q.dialogProgress[key] = true;
    const required = typeof q.count === 'number' ? q.count : q.dialogNodes.length || 1;
    const visited = Object.keys(q.dialogProgress).filter(k => q.dialogProgress[k]).length;
    q.progress = Math.min(required, visited);
    if (typeof renderQuests === 'function') renderQuests();
  });
}

// minimal core helpers so defaultQuestProcessor works even without content helpers loaded yet
function defaultQuestProcessor(npc, nodeId) {
  const meta = npc.quest;
  if (!meta) return null;
  if (nodeId === 'accept') {
    if (meta.status === 'available') questLog.add(meta);
    return { handled: true };
  }
  if (nodeId !== 'do_turnin') return null;

  if (meta.status === 'available') questLog.add(meta);
  if (meta.status !== 'active') {
    return { handled: true, blocked: true };
  }

  const requiredCount = meta.count || 1;
  const itemKey = meta.itemTag || meta.item;
  const have = itemKey ? countItems(itemKey) : 0;
  const prev = meta.progress || 0;
  const remaining = requiredCount - prev;
  const turnIn = itemKey ? Math.min(have, remaining) : 0;
  const hasFlag = !meta.reqFlag || (typeof flagValue === 'function' && flagValue(meta.reqFlag));
  const dialogGoal = hasDialogGoals(meta);
  if (!itemKey && !dialogGoal) meta.progress = requiredCount;

  if (turnIn > 0) {
    for (let i = 0; i < turnIn; i++) {
      const idx = findItemIndex(itemKey);
      if (idx > -1) {
        log(`Turned in ${player.inv[idx].name}.`);
        removeFromInv(idx);
      }
    }
    meta.progress = prev + turnIn;
  }

  if (meta.progress >= requiredCount && hasFlag) {
    questLog.complete(meta.id);
    if (meta.reward) {
      const rewardIt = resolveItem(meta.reward);
      if (rewardIt) addToInv(rewardIt);
    }
    let xp = typeof meta.xp === 'number' ? meta.xp : Number.parseInt(meta.xp, 10);
    if (!Number.isFinite(xp)) xp = 10;
    xp = Math.round(xp);
    if (xp < 10) xp = 10;
    else if (xp > 100) xp = 100;
    party.forEach(p => awardXP(p, xp));
    if (meta.moveTo) { npc.x = meta.moveTo.x; npc.y = meta.moveTo.y; }
    if (Array.isArray(npc.quests)) {
      npc.questIdx = (npc.questIdx || 0) + 1;
      npc.quest = npc.quests[npc.questIdx] || null;
      if (npc.quest && !npc.quest.status) npc.quest.status = 'available';
      if (Array.isArray(npc.questDialogs)) {
        npc.tree.start.text = npc.questDialogs[npc.questIdx] || npc.tree.start.text;
      }
    }
    return { handled: true, completed: true };
  }

  const def = itemKey ? ITEMS[itemKey] : null;
  const progress = Math.min(meta.progress || 0, requiredCount);
  let message = '';
  if (dialogGoal) {
    if (meta.progressText) message = meta.progressText;
    else message = `You still need to finish earning that favor. (${progress}/${requiredCount})`;
  } else if (itemKey) {
    message = meta.progress > 0
      ? `That’s ${meta.progress}/${requiredCount}. Keep going.`
      : `You don’t have ${def ? def.name : itemKey}.`;
  } else {
    message = progress > 0
      ? `That’s ${progress}/${requiredCount}. Keep going.`
      : 'You’re not done yet.';
  }
  if (typeof textEl !== 'undefined' && textEl) textEl.textContent = message;
  if (typeof choicesEl !== 'undefined' && choicesEl && typeof document !== 'undefined') {
    choicesEl.innerHTML = '';
    const cont = document.createElement('div');
    cont.className = 'choice';
    cont.textContent = '(Keep going)';
    cont.onclick = () => closeDialog?.();
    choicesEl.appendChild(cont);
  }
  return { handled: true, blocked: true, message };
}

const questExports = { Quest, QuestLog, questLog, quests, addQuest, completeQuest, defaultQuestProcessor, pinQuest, unpinQuest,
  trackQuestDialogNode };
Object.assign(globalThis, questExports);

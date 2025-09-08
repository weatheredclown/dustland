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
 * @property {Quest[]} [quests]
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
    Object.assign(this, meta);
  }
  complete() {
    if (this.status !== 'completed') {
      this.status = 'completed';
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
  /** @param {string} id */
  complete(id) {
    const q = this.quests[id];
    if (q) q.complete();
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
function completeQuest(id) { questLog.complete(id); }
function pinQuest(id) { questLog.pin(id); }
function unpinQuest(id) { questLog.unpin(id); }

// minimal core helpers so defaultQuestProcessor works even without content helpers loaded yet
function defaultQuestProcessor(npc, nodeId) {
  const meta = npc.quest;
  if (!meta) return;
  if (nodeId === 'accept') {
    if (meta.status === 'available') questLog.add(meta);
  } else if (nodeId === 'do_turnin') {
    if (meta.status === 'available') questLog.add(meta);
    if (meta.status === 'active') {
      const requiredCount = meta.count || 1;
      const itemKey = meta.itemTag || meta.item;
      const have = itemKey ? countItems(itemKey) : 0;
      const prev = meta.progress || 0;
      const remaining = requiredCount - prev;
      const turnIn = itemKey ? Math.min(have, remaining) : 0;
      const hasFlag = !meta.reqFlag || (typeof flagValue === 'function' && flagValue(meta.reqFlag));
      if (!itemKey) meta.progress = requiredCount;

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
        const xp = meta.xp ?? 5;
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
      } else {
        const def = itemKey ? ITEMS[itemKey] : null;
        textEl.textContent = meta.progress > 0
          ? `That’s ${meta.progress}/${requiredCount}. Keep going.`
          : `You don’t have ${def ? def.name : itemKey}.`;
        if (typeof choicesEl !== 'undefined') {
          choicesEl.innerHTML = '';
          const cont = document.createElement('div');
          cont.className = 'choice';
          cont.textContent = '(Keep going)';
          cont.onclick = () => closeDialog?.();
          choicesEl.appendChild(cont);
        }
      }
    }
  }
}

const questExports = { Quest, QuestLog, questLog, quests, addQuest, completeQuest, defaultQuestProcessor, pinQuest, unpinQuest };
Object.assign(globalThis, questExports);

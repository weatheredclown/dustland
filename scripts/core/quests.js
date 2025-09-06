// ===== Quests =====
class Quest {
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
  constructor() { this.quests = {}; }
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
  complete(id) {
    const q = this.quests[id];
    if (q) q.complete();
  }
  pin(id) {
    const q = this.quests[id];
    if (q && !q.pinned) {
      q.pinned = true;
      renderQuests();
    }
  }
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
      const hasItems = !meta.item || countItems(meta.item) >= requiredCount;
      const hasFlag = !meta.reqFlag || (typeof flagValue === 'function' && flagValue(meta.reqFlag));

      if (hasItems && hasFlag) {
        if (meta.item) {
          for (let i = 0; i < requiredCount; i++) {
            const itemIdx = findItemIndex(meta.item);
            if (itemIdx > -1) removeFromInv(itemIdx);
          }
        }
        questLog.complete(meta.id);
        if (meta.reward) {
          const rewardIt = resolveItem(meta.reward);
          if (rewardIt) addToInv(rewardIt);
        }
        const xp = meta.xp ?? 5;
        party.forEach(p => awardXP(p, xp));
        if (meta.moveTo) { npc.x = meta.moveTo.x; npc.y = meta.moveTo.y; }
      } else {
        const def = ITEMS[meta.item];
        textEl.textContent = `You don’t have ${def ? def.name : meta.item}.`;
      }
    }
  }
}

const questExports = { Quest, QuestLog, questLog, quests, addQuest, completeQuest, defaultQuestProcessor, pinQuest, unpinQuest };
Object.assign(globalThis, questExports);

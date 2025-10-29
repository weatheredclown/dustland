// ===== Quests =====
(() => {
    const questGlobals = globalThis;
    const ensureArray = (value) => {
        if (!value)
            return [];
        return Array.isArray(value) ? value.slice() : [value];
    };
    const cloneValue = (value) => {
        try {
            return JSON.parse(JSON.stringify(value));
        }
        catch (err) {
            return value;
        }
    };
    const isQuestDialogNode = (node) => node !== null;
    const isQuestLike = (value) => {
        if (!value || typeof value !== 'object')
            return false;
        const candidate = value;
        return typeof candidate.id === 'string'
            && typeof candidate.title === 'string'
            && typeof candidate.desc === 'string';
    };
    class Quest {
        constructor(id, title, desc, meta = {}) {
            const source = meta ?? {};
            this.id = id;
            this.title = title;
            this.name = title;
            this.desc = desc;
            this.status = typeof source.status === 'string' ? source.status : 'available';
            this.pinned = Boolean(source.pinned);
            this.givers = [];
            this.itemLocation = null;
            this.dialog = null;
            this.dialogNodes = [];
            this.dialogProgress = {};
            this.requiresDialogNodes = false;
            this.progress = 0;
            const rawDialog = source.dialog ? cloneValue(source.dialog) : null;
            Object.assign(this, source);
            this.pinned = Boolean(source.pinned);
            this.givers = ensureArray(source.givers).map(giver => ({ ...giver }));
            this.itemLocation = source.itemLocation ? { ...source.itemLocation } : null;
            const existingDialog = this.dialog;
            const normalizedDialog = (rawDialog ?? (existingDialog ? cloneValue(existingDialog) : null)) ?? null;
            this.dialog = normalizedDialog;
            if (typeof this.name !== 'string' || !this.name) {
                this.name = this.title;
            }
            const candidateNodes = Array.isArray(source.dialogNodes) ? source.dialogNodes : [];
            this.dialogNodes = candidateNodes
                .map(entry => normalizeDialogNode(entry))
                .filter(isQuestDialogNode);
            const normalizedProgress = Number(source.progress);
            this.progress = Number.isFinite(normalizedProgress) ? normalizedProgress : 0;
            if (this.dialogNodes.length > 0) {
                const progressState = this.dialogProgress && typeof this.dialogProgress === 'object'
                    ? this.dialogProgress
                    : source.dialogProgress && typeof source.dialogProgress === 'object'
                        ? source.dialogProgress
                        : {};
                const keys = Object.keys(progressState).filter(key => Boolean(progressState[key]));
                this.dialogProgress = Object.fromEntries(keys.map(key => [key, true]));
                if (typeof this.count !== 'number') {
                    this.count = this.dialogNodes.length;
                }
                const visited = Object.keys(this.dialogProgress).length;
                if (!Number.isFinite(this.progress) || this.progress < visited) {
                    this.progress = visited;
                }
                this.requiresDialogNodes = true;
            }
            else {
                this.dialogProgress = {};
                this.requiresDialogNodes = false;
            }
            if (this.itemLocation) {
                this.itemLocation = { ...this.itemLocation };
            }
        }
        complete(outcome) {
            if (this.status === 'completed')
                return;
            this.status = 'completed';
            if (outcome)
                this.outcome = outcome;
            questGlobals.renderQuests?.();
            questGlobals.log?.(`Quest completed: ${this.title}`);
            if (typeof questGlobals.toast === 'function') {
                questGlobals.toast(`QUEST COMPLETE: ${this.title}`);
            }
            const bus = questGlobals.EventBus ?? questGlobals.Dustland?.eventBus ?? null;
            bus?.emit('quest:completed', { quest: this });
            questGlobals.queueNanoDialogForNPCs?.('start', 'quest update');
        }
    }
    class QuestLog {
        constructor() {
            this.quests = {};
        }
        add(entry) {
            if (!entry?.id)
                return;
            const quest = entry instanceof Quest
                ? entry
                : new Quest(entry.id, entry.title ?? entry.id, entry.desc ?? '', entry);
            const existing = this.quests[quest.id];
            if (existing) {
                if (existing.status === 'available') {
                    existing.status = 'active';
                    questGlobals.renderQuests?.();
                    questGlobals.log?.(`Quest added: ${existing.title}`);
                    questGlobals.queueNanoDialogForNPCs?.('start', 'quest update');
                }
                return;
            }
            quest.status = 'active';
            this.quests[quest.id] = quest;
            questGlobals.renderQuests?.();
            questGlobals.log?.(`Quest added: ${quest.title}`);
            questGlobals.queueNanoDialogForNPCs?.('start', 'quest update');
        }
        complete(id, outcome) {
            const quest = this.quests[id];
            quest?.complete(outcome);
        }
        pin(id) {
            const quest = this.quests[id];
            if (quest && !quest.pinned) {
                quest.pinned = true;
                questGlobals.renderQuests?.();
            }
        }
        unpin(id) {
            const quest = this.quests[id];
            if (quest && quest.pinned) {
                quest.pinned = false;
                questGlobals.renderQuests?.();
            }
        }
    }
    const questLog = new QuestLog();
    const quests = questLog.quests;
    function addQuest(id, title, desc, meta) {
        questLog.add(new Quest(id, title, desc, meta));
    }
    function completeQuest(id, outcome) {
        questLog.complete(id, outcome);
    }
    function pinQuest(id) {
        questLog.pin(id);
    }
    function unpinQuest(id) {
        questLog.unpin(id);
    }
    function normalizeDialogNode(entry) {
        if (!entry)
            return null;
        if (typeof entry === 'string') {
            const [npcPart = '', nodePart = 'start'] = entry.split('::');
            const npcId = npcPart.trim();
            const nodeId = (nodePart || 'start').trim() || 'start';
            return npcId ? { npcId, nodeId } : null;
        }
        if (typeof entry === 'object') {
            const candidate = entry;
            const npcId = (candidate.npcId ?? candidate.npc ?? candidate.id ?? '').trim();
            if (!npcId)
                return null;
            const nodeRaw = candidate.nodeId ?? candidate.node ?? candidate.to ?? 'start';
            const nodeId = typeof nodeRaw === 'string' && nodeRaw.trim() ? nodeRaw.trim() : 'start';
            return { npcId, nodeId };
        }
        return null;
    }
    function hasDialogGoals(meta) {
        if (!meta)
            return false;
        if (Array.isArray(meta.dialogNodes) && meta.dialogNodes.length > 0) {
            return true;
        }
        const dataNodes = meta.dialogNodes;
        return Array.isArray(dataNodes) && dataNodes.length > 0;
    }
    function trackQuestDialogNode(npcId, nodeId) {
        if (!npcId || !nodeId)
            return;
        Object.values(quests).forEach(quest => {
            if (!quest || quest.status !== 'active' || !hasDialogGoals(quest))
                return;
            const target = quest.dialogNodes.find(goal => goal.npcId === npcId && (goal.nodeId || 'start') === nodeId);
            if (!target)
                return;
            quest.dialogProgress = quest.dialogProgress && typeof quest.dialogProgress === 'object' ? quest.dialogProgress : {};
            const key = `${npcId}::${nodeId}`;
            if (quest.dialogProgress[key])
                return;
            quest.dialogProgress[key] = true;
            const required = typeof quest.count === 'number' ? quest.count : quest.dialogNodes.length || 1;
            const visited = Object.keys(quest.dialogProgress).filter(k => quest.dialogProgress[k]).length;
            quest.progress = Math.min(required, visited);
            if (typeof questGlobals.renderQuests === 'function')
                questGlobals.renderQuests();
        });
    }
    function defaultQuestProcessor(npc, nodeId) {
        if (!npc?.quest)
            return null;
        const metaCandidate = npc.quest;
        if (!isQuestLike(metaCandidate))
            return null;
        const meta = metaCandidate;
        if (nodeId === 'accept') {
            if (meta.status === 'available')
                questLog.add(meta);
            return { handled: true };
        }
        if (nodeId !== 'do_turnin')
            return null;
        if (meta.status === 'available')
            questLog.add(meta);
        if (meta.status !== 'active') {
            return { handled: true, blocked: true };
        }
        const rawCount = Number(meta.count ?? 1);
        const requiredCount = Number.isFinite(rawCount) && rawCount > 0 ? rawCount : 1;
        const itemKey = typeof meta.itemTag === 'string' && meta.itemTag
            ? meta.itemTag
            : typeof meta.item === 'string' && meta.item
                ? meta.item
                : null;
        const have = typeof itemKey === 'string' ? questGlobals.countItems?.(itemKey) ?? 0 : 0;
        const prev = Number.isFinite(Number(meta.progress)) ? Number(meta.progress) : 0;
        const remaining = requiredCount - prev;
        const turnIn = typeof itemKey === 'string' ? Math.min(have, remaining) : 0;
        const hasFlag = !meta.reqFlag
            || (typeof meta.reqFlag === 'string' && Boolean(questGlobals.flagValue?.(meta.reqFlag)));
        const dialogGoal = hasDialogGoals(meta);
        if (!itemKey && !dialogGoal)
            meta.progress = requiredCount;
        if (turnIn > 0 && typeof itemKey === 'string') {
            for (let i = 0; i < turnIn; i += 1) {
                const idx = questGlobals.findItemIndex?.(itemKey) ?? -1;
                if (idx > -1) {
                    const playerState = questGlobals.player;
                    const invItem = playerState?.inv?.[idx];
                    if (invItem?.name) {
                        questGlobals.log?.(`Turned in ${invItem.name}.`);
                    }
                    questGlobals.removeFromInv?.(idx);
                }
            }
            meta.progress = prev + turnIn;
        }
        if ((meta.progress ?? 0) >= requiredCount && hasFlag) {
            questLog.complete(meta.id);
            if (meta.reward) {
                const rewardIt = questGlobals.resolveItem?.(meta.reward) ?? null;
                if (rewardIt)
                    questGlobals.addToInv?.(rewardIt);
            }
            let xpValue;
            if (typeof meta.xp === 'number')
                xpValue = meta.xp;
            else if (typeof meta.xp === 'string')
                xpValue = Number.parseInt(meta.xp, 10);
            else
                xpValue = Number(meta.xp);
            if (!Number.isFinite(xpValue))
                xpValue = 10;
            xpValue = Math.round(xpValue);
            if (xpValue < 10)
                xpValue = 10;
            else if (xpValue > 100)
                xpValue = 100;
            questGlobals.party?.forEach(member => {
                questGlobals.awardXP?.(member, xpValue);
            });
            const moveTo = meta.moveTo;
            if (moveTo && typeof moveTo === 'object') {
                if (typeof moveTo.x === 'number')
                    npc.x = moveTo.x;
                if (typeof moveTo.y === 'number')
                    npc.y = moveTo.y;
            }
            if (Array.isArray(npc.quests)) {
                const nextIdx = (npc.questIdx ?? 0) + 1;
                npc.questIdx = nextIdx;
                const nextQuest = npc.quests[nextIdx] ?? null;
                const resolvedQuest = isQuestLike(nextQuest) ? nextQuest : null;
                npc.quest = resolvedQuest;
                if (resolvedQuest && (!resolvedQuest.status || typeof resolvedQuest.status !== 'string')) {
                    resolvedQuest.status = 'available';
                }
                const startNode = npc.tree?.start;
                if (Array.isArray(npc.questDialogs) && startNode && typeof startNode === 'object') {
                    const nextDialog = npc.questDialogs[nextIdx];
                    if (nextDialog) {
                        startNode.text = nextDialog;
                    }
                }
            }
            return { handled: true, completed: true };
        }
        const itemDictionary = questGlobals.ITEMS ?? {};
        const definition = typeof itemKey === 'string' ? itemDictionary[itemKey] : null;
        const progress = Math.min(Number(meta.progress ?? 0), requiredCount);
        let message;
        if (dialogGoal) {
            message = typeof meta.progressText === 'string' && meta.progressText
                ? meta.progressText
                : `You still need to finish earning that favor. (${progress}/${requiredCount})`;
        }
        else if (typeof itemKey === 'string') {
            message = (meta.progress ?? 0) > 0
                ? `That’s ${meta.progress}/${requiredCount}. Keep going.`
                : `You don’t have ${definition ? definition.name : itemKey}.`;
        }
        else {
            message = progress > 0
                ? `That’s ${progress}/${requiredCount}. Keep going.`
                : 'You’re not done yet.';
        }
        const textTarget = questGlobals.textEl ?? null;
        if (textTarget) {
            textTarget.textContent = message;
        }
        const choicesTarget = questGlobals.choicesEl ?? null;
        if (choicesTarget && typeof document !== 'undefined') {
            choicesTarget.innerHTML = '';
            const container = document.createElement('div');
            container.className = 'choice';
            container.textContent = '(Keep going)';
            container.onclick = () => questGlobals.closeDialog?.();
            choicesTarget.appendChild(container);
        }
        return { handled: true, blocked: true, message };
    }
    const questExports = {
        Quest,
        QuestLog,
        questLog,
        quests,
        addQuest,
        completeQuest,
        defaultQuestProcessor,
        pinQuest,
        unpinQuest,
        trackQuestDialogNode,
    };
    Object.assign(globalThis, questExports);
})();

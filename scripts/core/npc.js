const npcGlobals = globalThis;
const Dustland = npcGlobals.Dustland;
const NPC_COLOR = '#9ef7a0';
const OBJECT_COLOR = '#225a20';
class NpcEntity {
    constructor({ id, map, x, y, color, name, title, desc, tree, quest = null, quests = null, questDialogs = null, processNode = null, processChoice = null, combat = null, shop = false, workbench = false, portraitSheet = null, portraitLock = true, symbol = '!', door = false, locked = false, prompt = null, unlockTime = null, questIdx = 0, trainer = null, overrideColor = false }) {
        this.id = id;
        this.map = map;
        this.x = x;
        this.y = y;
        this.color = color;
        this.name = name;
        this.title = title;
        this.desc = desc;
        this.tree = tree ?? { start: { text: '', choices: [{ label: '(Leave)', to: 'bye' }] } };
        this.quest = quest;
        this.quests = quests;
        this.questDialogs = questDialogs;
        this.processNode = undefined;
        this.processChoice = undefined;
        this.combat = combat;
        this.shop = shop;
        this.workbench = workbench;
        this.portraitSheet = portraitSheet;
        this.portraitLock = portraitLock ?? true;
        this.symbol = symbol;
        this.door = door;
        this.locked = locked;
        this.prompt = prompt;
        this.unlockTime = unlockTime;
        this.questIdx = questIdx ?? 0;
        this.trainer = trainer;
        this.overrideColor = overrideColor;
        if (Array.isArray(this.quests) && !this.quest) {
            this.quest = this.quests[this.questIdx] ?? null;
        }
        if (Array.isArray(this.questDialogs) && this.questDialogs.length) {
            const startNode = this.tree.start ?? (this.tree.start = { text: '', choices: [] });
            startNode.text = this.questDialogs[this.questIdx] ?? startNode.text;
        }
        const questData = this.quest;
        if (questData && typeof questData === 'object' && 'status' in questData && questData.status === undefined) {
            questData.status = 'available';
        }
        const capNode = (node) => {
            var _a;
            if (this.combat && node === 'do_fight') {
                npcGlobals.closeDialog?.();
                const combatSource = this.combat ?? {};
                const combatant = {
                    ...combatSource,
                    npc: this,
                    name: this.name ?? 'Opponent',
                    hp: Math.max(0, Number(combatSource.hp ?? combatSource.HP ?? 0))
                };
                Dustland?.actions?.startCombat?.(combatant);
            }
            else if (this.shop && node === 'sell') {
                const player = npcGlobals.player;
                const inventory = Array.isArray(player?.inv) ? player.inv : [];
                const currency = npcGlobals.CURRENCY ?? 'scrap';
                const items = inventory.map((it, idx) => {
                    const price = typeof it.scrap === 'number' ? it.scrap : Math.max(1, it.value ?? 0);
                    const qty = Math.max(1, Number.isFinite(it?.count) ? it.count : 1);
                    const itemName = qty > 1 ? `${it.name} x${qty}` : it.name;
                    return { label: `Sell ${itemName} (${price} ${currency})`, to: 'sell', sellIndex: idx };
                });
                const sellNode = ((_a = this.tree).sell ?? (_a.sell = { text: '', choices: [] }));
                sellNode.text = items.length ? 'What are you selling?' : 'Nothing to sell.';
                items.push({ label: '(Back)', to: 'start' });
                sellNode.choices = items;
            }
            else if (this.shop && node === 'buy') {
                npcGlobals.closeDialog?.();
                Dustland?.openShop?.(this);
                return;
            }
            else if (this.workbench && node === 'start') {
                npcGlobals.closeDialog?.();
                Dustland?.openWorkbench?.();
                return;
            }
        };
        const capChoice = (choice) => {
            if (this.shop && typeof choice.sellIndex === 'number') {
                const player = npcGlobals.player;
                if (!player)
                    return false;
                const item = player.inv[choice.sellIndex];
                if (!item)
                    return false;
                const value = typeof item.scrap === 'number' ? item.scrap : Math.max(1, item.value ?? 0);
                player.scrap = (player.scrap ?? 0) + value;
                npcGlobals.removeFromInv?.(choice.sellIndex);
                const shopData = this.shop;
                if (shopData && typeof shopData === 'object' && Array.isArray(shopData.inv)) {
                    const existing = shopData.inv.find(entry => entry?.id === item.id && Math.max(1, Number.isFinite(entry?.count) ? Number(entry?.count) : 1) < 256);
                    if (existing) {
                        const current = Math.max(1, Number.isFinite(existing.count) ? Number(existing.count) : 1);
                        existing.count = Math.min(256, current + 1);
                    }
                    else {
                        shopData.inv.push({ id: item.id, count: 1 });
                    }
                }
                npcGlobals.renderInv?.();
                npcGlobals.updateHUD?.();
                const textElement = npcGlobals.textEl;
                if (textElement) {
                    textElement.textContent = `Sold ${item.name} for ${value} ${npcGlobals.CURRENCY ?? 'scrap'}.`;
                }
                if (npcGlobals.dialogState) {
                    npcGlobals.dialogState.node = 'sell';
                }
                npcGlobals.renderDialog?.();
                return true;
            }
            return false;
        };
        const userPN = processNode ?? null;
        this.processNode = (node) => {
            if (this.quest) {
                npcGlobals.defaultQuestProcessor?.(this, node);
            }
            capNode(node);
            userPN?.call(this, node);
        };
        const userPC = processChoice ?? null;
        if (userPC) {
            this.processChoice = (choice) => {
                if (capChoice(choice))
                    return;
                userPC.call(this, choice);
            };
        }
        else {
            this.processChoice = (choice) => {
                capChoice(choice);
            };
        }
    }
    remember(key, value) {
        Dustland?.gameState?.rememberNPC?.(this.id, key, value);
    }
    recall(key) {
        return Dustland?.gameState?.recallNPC?.(this.id, key);
    }
}
function cloneShopData(shop) {
    if (shop === true)
        return true;
    if (!shop || typeof shop !== 'object')
        return null;
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(shop);
        }
        catch (err) {
            // fall back to JSON copy
        }
    }
    try {
        return JSON.parse(JSON.stringify(shop));
    }
    catch (err) {
        const clone = { ...shop };
        if (Array.isArray(shop.inv)) {
            clone.inv = shop.inv.map(entry => (entry && typeof entry === 'object' ? { ...entry } : entry));
        }
        return clone;
    }
}
function makeNPC(id, map, x, y, color, name, title, desc, tree, quest, processNode, processChoice, opts) {
    let nextTree = tree ?? null;
    if (opts?.combat) {
        nextTree = nextTree ?? {};
        const start = (nextTree.start ?? (nextTree.start = { text: '', choices: [] }));
        start.choices = start.choices ?? [];
        let fightChoice = start.choices.find(choice => choice.label === '(Fight)' || choice.to === 'do_fight');
        if (fightChoice) {
            fightChoice.label = '(Fight)';
            fightChoice.to = 'do_fight';
        }
        else {
            fightChoice = { label: '(Fight)', to: 'do_fight' };
            start.choices.unshift(fightChoice);
        }
        start.choices = start.choices.filter(choice => choice === fightChoice || choice.label !== '(Fight)');
        nextTree.do_fight = nextTree.do_fight ?? { text: '', choices: [{ label: '(Continue)', to: 'bye' }] };
    }
    if (opts?.shop) {
        nextTree = nextTree ?? {};
        const start = (nextTree.start ?? (nextTree.start = { text: '', choices: [] }));
        start.choices = start.choices ?? [];
        if (!start.choices.some(choice => choice.to === 'sell')) {
            start.choices.push({ label: '(Sell items)', to: 'sell' });
        }
        nextTree.sell = nextTree.sell ?? { text: 'What are you selling?', choices: [] };
    }
    if (opts?.trainer) {
        nextTree = nextTree ?? {};
        const start = (nextTree.start ?? (nextTree.start = { text: '', choices: [] }));
        start.choices = start.choices ?? [];
        if (!start.choices.some(choice => choice.to === 'train')) {
            start.choices.unshift({
                label: '(Upgrade Skills)',
                to: 'train',
                effects: [{ effect: 'showTrainer', trainer: opts.trainer }]
            });
        }
        const trainNode = (nextTree.train ?? (nextTree.train = { text: '', choices: [{ label: '(Back)', to: 'start' }] }));
        if (!trainNode.choices?.length)
            trainNode.choices = [{ label: '(Back)', to: 'start' }];
    }
    const nextQuest = quest ?? (opts?.quests ? opts.quests[0] ?? null : null);
    const nextColor = color ?? (opts?.symbol && opts.symbol !== '!' ? OBJECT_COLOR : NPC_COLOR);
    return new NpcEntity({
        id,
        map,
        x,
        y,
        color: nextColor,
        name,
        title,
        desc,
        tree: nextTree,
        quest: nextQuest,
        processNode: processNode ?? null,
        processChoice: processChoice ?? null,
        ...(opts ?? {})
    });
}
const resolveNpcNode = (tree, nodeId) => {
    if (!tree)
        return null;
    const node = tree[nodeId];
    if (!node)
        return null;
    const choices = (node.choices ?? []).filter(Boolean);
    return { ...node, choices };
};
const NPC = NpcEntity;
const NPCS = [];
function npcsOnMap(map = npcGlobals.state?.map ?? 'world') {
    return NPCS.filter(n => n.map === map);
}
function queueNanoDialogForNPCs(nodeId = 'start', reason = 'inventory change', map = npcGlobals.state?.map ?? 'world') {
    const nanoDialog = npcGlobals.NanoDialog;
    if (!nanoDialog)
        return;
    npcsOnMap(map).forEach(n => nanoDialog.queueForNPC(n, nodeId, reason));
}
function removeNPC(npc) {
    if (!npc)
        return;
    const idx = NPCS.findIndex(existing => existing === npc || (npc.id && existing.id === npc.id));
    if (idx > -1)
        NPCS.splice(idx, 1);
}
function createNpcFactory(defs) {
    const npcFactory = {};
    (defs ?? []).forEach(n => {
        npcFactory[n.id] = (x, y) => {
            const spawnX = typeof x === 'number' ? x : (typeof n.x === 'number' ? n.x : 0);
            const spawnY = typeof y === 'number' ? y : (typeof n.y === 'number' ? n.y : 0);
            const treeSource = n.tree;
            let treeData;
            if (typeof treeSource === 'string') {
                try {
                    treeData = JSON.parse(treeSource);
                }
                catch (e) {
                    treeData = null;
                }
            }
            else {
                treeData = treeSource;
            }
            const rawDialogs = 'dialogs' in n ? n.dialogs : undefined;
            const dialogsList = Array.isArray(rawDialogs) ? rawDialogs : null;
            const dialogProp = 'dialog' in n ? n.dialog : undefined;
            const dlgArr = dialogsList ?? (Array.isArray(dialogProp) ? dialogProp : null);
            if (!treeData || !Object.keys(treeData).length) {
                const txt = dlgArr && dlgArr.length ? dlgArr[0] : (typeof dialogProp === 'string' ? dialogProp : '');
                treeData = { start: { text: txt, choices: [{ label: '(Leave)', to: 'bye' }] } };
            }
            const opts = {};
            if (n.combat)
                opts.combat = n.combat;
            const shopSetting = n.shop;
            if (shopSetting)
                opts.shop = cloneShopData(shopSetting) ?? true;
            if (n.workbench)
                opts.workbench = true;
            if (typeof n.portraitSheet === 'string')
                opts.portraitSheet = n.portraitSheet;
            if (n.portraitLock === false)
                opts.portraitLock = false;
            if (typeof n.prompt === 'string')
                opts.prompt = n.prompt;
            if (typeof n.symbol === 'string')
                opts.symbol = n.symbol;
            if (typeof n.door === 'boolean')
                opts.door = n.door;
            if (typeof n.locked === 'boolean')
                opts.locked = n.locked;
            if (typeof n.trainer === 'string')
                opts.trainer = n.trainer;
            else if (n.id && n.id.startsWith('trainer_'))
                opts.trainer = n.id.split('_')[1];
            if (typeof n.overrideColor === 'boolean')
                opts.overrideColor = n.overrideColor;
            if (Array.isArray(n.quests)) {
                const questRegistry = npcGlobals.quests ?? {};
                opts.quests = n.quests
                    .map(q => (typeof q === 'string' ? questRegistry[q] ?? null : q))
                    .filter((q) => Boolean(q));
            }
            if (dlgArr)
                opts.questDialogs = dlgArr;
            const npc = makeNPC(n.id, n.map ?? 'world', spawnX, spawnY, typeof n.color === 'string' ? n.color : undefined, (typeof n.name === 'string' ? n.name : undefined) ?? n.id, typeof n.title === 'string' ? n.title : '', typeof n.desc === 'string' ? n.desc : '', treeData ?? null, null, null, null, opts);
            if (Array.isArray(n.loop))
                npc.loop = n.loop;
            return npc;
        };
    });
    return npcFactory;
}
function scaleEnemy(npc, lvl = 1, build = []) {
    const baseStatsFactory = npcGlobals.baseStats;
    const stats = (npc.stats = npc.stats ?? (typeof baseStatsFactory === 'function' ? baseStatsFactory() : {}));
    npc.maxHp = npc.maxHp ?? npc.hp ?? 10;
    npc.hp = npc.maxHp;
    for (let i = 1; i < lvl; i++) {
        npc.maxHp += 10;
        npc.hp = npc.maxHp;
        const stat = Array.isArray(build) && build.length ? build[(i - 1) % build.length] : null;
        if (stat)
            stats[stat] = (stats[stat] ?? 0) + 1;
    }
    npc.lvl = lvl;
}
function scaleEnemyWithPreset(npc, lvl = 1, preset = '') {
    const presets = npcGlobals.enemyPresets ?? {};
    const build = presets[preset] ?? [];
    scaleEnemy(npc, lvl, build);
}
const npcExports = { NPC, makeNPC, resolveNode: resolveNpcNode, NPCS, npcsOnMap, queueNanoDialogForNPCs, removeNPC, createNpcFactory, scaleEnemy, scaleEnemyWithPreset };
Object.assign(globalThis, npcExports);

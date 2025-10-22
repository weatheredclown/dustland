// @ts-nocheck
// ===== Dialog =====
const overlay = document.getElementById('overlay');
const choicesEl = document.getElementById('choices');
const textEl = document.getElementById('dialogText');
const nameEl = document.getElementById('npcName');
const titleEl = document.getElementById('npcTitle');
const portEl = document.getElementById('port');
const persistBtn = document.getElementById('persistLLM');
let currentNPC = null;
Object.defineProperty(globalThis, 'currentNPC', { get: () => currentNPC, set: v => { currentNPC = v; } });
const dialogState = { tree: null, node: null };
let selectedChoice = 0;
var Dustland = globalThis.Dustland;
if (persistBtn) {
    persistBtn.onclick = function () {
        persistLlmNodes(dialogState.tree);
        renderDialog();
    };
}
function dlgHighlightChoice() {
    [...choicesEl.children].forEach((c, i) => {
        if (c.classList?.toggle)
            c.classList.toggle('sel', i === selectedChoice);
    });
}
function dlgMoveChoice(dir) {
    const total = choicesEl.children.length;
    if (total === 0)
        return;
    selectedChoice = (selectedChoice + dir + total) % total;
    dlgHighlightChoice();
}
function handleDialogKey(e) {
    if (!dialogState.tree)
        return false;
    switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
        case 'w':
        case 'W':
        case 'a':
        case 'A':
            dlgMoveChoice(-1);
            return true;
        case 'ArrowDown':
        case 'ArrowRight':
        case 's':
        case 'S':
        case 'd':
        case 'D':
            dlgMoveChoice(1);
            return true;
        case 'Enter':
        case ' ': // space
        case 'Spacebar': {
            const el = choicesEl.children[selectedChoice];
            if (el?.click)
                el.click();
            else
                el?.onclick?.();
            return true;
        }
        case 'Escape':
            closeDialog();
            return true;
    }
    return false;
}
function ensureLeaveOption(node) {
    if (!node || node.noLeave)
        return;
    const choices = Array.isArray(node.next) ? node.next.filter(Boolean) : [];
    const hasExit = choices.some(opt => (opt?.to || opt?.id) === 'bye');
    if (!hasExit) {
        choices.push({ label: '(Leave)', to: 'bye', id: 'bye' });
    }
    node.next = choices;
}
function normalizeDialogTree(tree) {
    const out = {};
    for (const id in tree) {
        if (id === 'imports')
            continue;
        const n = tree[id];
        const next = (n.next || n.choices || []).map(c => {
            if (typeof c === 'string')
                return { id: c, label: c };
            const { to, id: cid, label, text, checks = [], effects = [], ...rest } = c;
            const obj = { id: to || cid, label: label || text || '(Continue)', checks, effects, ...rest };
            if (to)
                obj.to = to;
            return obj;
        });
        const jump = (Array.isArray(n.jump) ? n.jump : []).map(j => ({ to: j.to, if: j.if }));
        out[id] = { text: n.text || '', checks: n.checks || [], effects: n.effects || [], next, jump, noLeave: !!n.noLeave };
        ensureLeaveOption(out[id]);
    }
    return out;
}
function ensureNode(tree, id) {
    if (!tree[id])
        tree[id] = { text: '', checks: [], effects: [], next: [] };
    const node = tree[id];
    node.text = typeof node.text === 'string' ? node.text : '';
    node.checks = Array.isArray(node.checks) ? node.checks : [];
    node.effects = Array.isArray(node.effects) ? node.effects : [];
    node.next = Array.isArray(node.next) ? node.next.filter(Boolean) : [];
    return node;
}
function normalizeChoiceConfig(data, defaults) {
    if (!data)
        return { ...defaults };
    if (typeof data === 'string')
        return { ...defaults, label: data };
    if (typeof data === 'object') {
        const result = { ...defaults, ...data };
        if (typeof data.choice === 'string' && !result.label)
            result.label = data.choice;
        if (typeof data.text === 'string' && !result.label)
            result.label = data.text;
        if (typeof data.label !== 'string' && typeof data.name === 'string')
            result.label = data.name;
        delete result.choice;
        return result;
    }
    return { ...defaults };
}
function normalizeDialogStage(data) {
    if (!data)
        return { text: '' };
    if (typeof data === 'string')
        return { text: data };
    if (typeof data === 'object') {
        const stage = {};
        if (typeof data.text === 'string')
            stage.text = data.text;
        else if (typeof data.dialog === 'string')
            stage.text = data.dialog;
        else if (typeof data.description === 'string')
            stage.text = data.description;
        if (data.choice !== undefined)
            stage.choice = normalizeChoiceConfig(data.choice, {});
        else if (typeof data.label === 'string')
            stage.choice = normalizeChoiceConfig({ label: data.label }, {});
        return stage;
    }
    return { text: '' };
}
function normalizeQuestDialogConfig(dialog) {
    if (!dialog)
        return { offer: { text: '' }, accept: { text: '' }, turnIn: { text: '' }, active: { text: '' }, completed: { text: '' } };
    const src = typeof dialog === 'string' ? { offer: dialog } : dialog;
    const offer = normalizeDialogStage(src.offer ?? src.offerText ?? src.start ?? src.available ?? null);
    if (!offer.choice) {
        const raw = src.acceptLabel ?? src.offerChoice ?? null;
        if (raw)
            offer.choice = normalizeChoiceConfig(raw, {});
    }
    const accept = normalizeDialogStage(src.accept ?? src.acceptText ?? null);
    if (!accept.choice) {
        const raw = src.acceptChoice ?? null;
        if (raw)
            accept.choice = normalizeChoiceConfig(raw, {});
    }
    const turnIn = normalizeDialogStage(src.turnIn ?? src.turnin ?? src.turnInText ?? src.turninText ?? null);
    if (!turnIn.choice) {
        const raw = src.turnInChoice ?? src.turnInLabel ?? src.turninChoice ?? src.turninLabel ?? null;
        if (raw)
            turnIn.choice = normalizeChoiceConfig(raw, {});
    }
    const active = normalizeDialogStage(src.active ?? src.activeText ?? src.progress ?? null);
    const completed = normalizeDialogStage(src.completed ?? src.completedText ?? src.complete ?? src.completeText ?? null);
    return {
        offer,
        accept,
        turnIn,
        active,
        completed
    };
}
function applyQuestDialog(tree, npc) {
    const quest = npc?.quest;
    if (!quest)
        return;
    const qConfig = normalizeQuestDialogConfig(quest.dialog);
    const offer = qConfig.offer || { text: '' };
    const acceptCfg = qConfig.accept || { text: '' };
    const turnCfg = qConfig.turnIn || { text: '' };
    const activeCfg = qConfig.active || { text: '' };
    const completedCfg = qConfig.completed || { text: '' };
    const status = quest.status || 'available';
    const startNode = ensureNode(tree, 'start');
    const acceptNode = ensureNode(tree, 'accept');
    const turnNode = ensureNode(tree, 'do_turnin');
    const acceptChoiceDefaults = { label: '(Accept quest)' };
    const turnChoiceDefaults = { label: '(Turn in quest)' };
    const acceptChoiceConfig = acceptCfg.choice || offer.choice;
    const turnChoiceConfig = turnCfg.choice;
    const acceptChoice = normalizeChoiceConfig(acceptChoiceConfig, acceptChoiceDefaults);
    const turnChoice = normalizeChoiceConfig(turnChoiceConfig, turnChoiceDefaults);
    acceptNode.text = typeof acceptCfg.text === 'string' && acceptCfg.text ? acceptCfg.text : (acceptNode.text || 'Good luck.');
    turnNode.text = typeof turnCfg.text === 'string' && turnCfg.text ? turnCfg.text : (turnNode.text || 'Thanks for helping.');
    let stageText = '';
    if (status === 'available')
        stageText = offer.text || '';
    else if (status === 'active')
        stageText = activeCfg.text || offer.text || '';
    else
        stageText = completedCfg.text || activeCfg.text || offer.text || '';
    if (stageText)
        startNode.text = stageText;
    const others = (startNode.next || []).filter(opt => opt && opt.q !== 'accept' && opt.q !== 'turnin');
    const questChoices = [];
    if (status === 'available') {
        questChoices.push({ ...acceptChoice, to: 'accept', q: 'accept' });
    }
    if (Object.keys(turnChoice).length) {
        questChoices.push({ ...turnChoice, to: 'do_turnin', q: 'turnin' });
    }
    startNode.next = [...questChoices, ...others];
    ensureLeaveOption(startNode);
    ensureLeaveOption(acceptNode);
    ensureLeaveOption(turnNode);
}
function runEffects(effects) {
    for (const eff of effects || []) {
        if (typeof eff === 'function')
            eff({ player, party, state });
        else if (eff && typeof eff === 'object' && Dustland?.effects?.apply) {
            Dustland.effects.apply([eff], { player, party, state });
        }
    }
}
function resolveCheck(check, actor = leader(), rng = Math.random) {
    const roll = Dice.skill(actor, check.stat, 0, ROLL_SIDES, rng);
    const dc = check.dc || 0;
    const success = roll >= dc;
    log?.(`Check ${check.stat} rolled ${roll} vs DC ${dc}: ${success ? 'success' : 'fail'}`);
    runEffects(success ? check.onSuccess : check.onFail);
    return { success, roll, dc, stat: check.stat };
}
function processQuestFlag(c) {
    if (!currentNPC?.quest || !c?.q)
        return null;
    if (c.q === 'accept')
        return defaultQuestProcessor(currentNPC, 'accept');
    if (c.q === 'turnin')
        return defaultQuestProcessor(currentNPC, 'do_turnin');
    return null;
}
function dialogJoinParty(join) {
    if (!join)
        return;
    const opts = {};
    if (join.portraitSheet) {
        opts.portraitSheet = join.portraitSheet;
    }
    else if (currentNPC?.portraitSheet) {
        opts.portraitSheet = currentNPC.portraitSheet;
    }
    const m = makeMember(join.id, join.name, join.role, opts);
    if (joinParty(m)) {
        removeNPC(currentNPC);
    }
}
// Teleport actor to a new position.
// g: { map?, x?, y?, target?:'npc'|'player', rel?:true }
//   target defaults to player (party).
//   rel=true offsets from current position.
function handleGoto(g) {
    if (!g)
        return;
    const tgtNPC = g.target === 'npc' ? currentNPC : null;
    const base = tgtNPC || party;
    const x = g.rel ? base.x + (g.x || 0) : (g.x != null ? g.x : base.x);
    const y = g.rel ? base.y + (g.y || 0) : (g.y != null ? g.y : base.y);
    if (tgtNPC) {
        if (g.map)
            tgtNPC.map = g.map;
        tgtNPC.x = x;
        tgtNPC.y = y;
        if (tgtNPC._loop) {
            tgtNPC._loop.path = [];
            tgtNPC._loop.job = null;
        }
    }
    else {
        if (g.map === 'world') {
            if (!world.length)
                applyModule({});
            setPartyPos(x, y);
            setMap('world');
        }
        else {
            setPartyPos(x, y);
            if (g.map)
                setMap(g.map);
            else if (typeof centerCamera === 'function')
                centerCamera(party.x, party.y, state.map);
        }
    }
    updateHUD?.();
}
function calcCombatXP(npc) {
    const enemies = [npc.combat || {}];
    const px = party.x, py = party.y, map = party.map || state.map;
    for (const n of NPCS) {
        if (n === npc || !n.combat)
            continue;
        if (n.map !== map)
            continue;
        const dist = Math.abs(n.x - px) + Math.abs(n.y - py);
        if (dist <= 2)
            enemies.push(n.combat);
    }
    const avgLvl = Math.max(1, party.reduce((s, m) => s + (m.lvl || 1), 0) / (party.length || 1));
    let xp = 0;
    for (const e of enemies) {
        if (!e)
            continue;
        const override = Number.isFinite(e.xp) ? e.xp : null;
        if (override != null) {
            xp += override;
            continue;
        }
        const count = Math.max(1, e.count || 1);
        const str = e.challenge || e.hp || e.HP || 1;
        xp += count * Math.max(1, Math.ceil(str / avgLvl));
    }
    return xp;
}
function getNextId(prefix, arr) {
    let i = 1;
    while (arr.some(o => o.id === prefix + i))
        i++;
    return prefix + i;
}
function advanceDialog(stateObj, choiceIdx) {
    const prevNode = stateObj.node;
    const node = stateObj.tree[stateObj.node];
    const choice = node.next[choiceIdx];
    if (!choice) {
        stateObj.node = null;
        return { next: null, text: null, close: true, success: false };
    }
    runEffects(choice.checks);
    const res = { next: null, text: null, close: false, success: true, retriable: false };
    const finalize = (text, ok, retriable = false) => { res.text = text || null; res.close = true; res.success = !!ok; res.retriable = !!retriable; stateObj.node = null; return res; };
    if (choice.reqItem || choice.reqSlot || choice.reqTag) {
        const requiredCount = choice.reqCount || 1;
        const hasEnough = choice.reqItem
            ? countItems(choice.reqItem) >= requiredCount
            : choice.reqSlot
                ? player.inv.some(it => it.type === choice.reqSlot)
                : countItems(choice.reqTag) >= requiredCount;
        if (!hasEnough) {
            return finalize(choice.failure || 'You lack the required item.', false, true);
        }
        Dustland.actions.applyQuestReward(choice.reward);
        dialogJoinParty(choice.join);
        processQuestFlag(choice);
        runEffects(choice.effects);
        if (choice.goto) {
            handleGoto(choice.goto);
            res.close = true;
            res.success = true;
            stateObj.node = null;
            return res;
        }
        const nextId = choice.to || choice.id;
        if (nextId) {
            res.next = nextId;
            stateObj.node = nextId;
            return res;
        }
        return finalize(choice.success || '', true);
    }
    if (choice.costItem || choice.costSlot || choice.costTag) {
        const costCount = choice.costCount || 1;
        const hasEnough = choice.costItem
            ? countItems(choice.costItem) >= costCount
            : choice.costSlot
                ? player.inv.some(it => it.type === choice.costSlot)
                : countItems(choice.costTag) >= costCount;
        if (!hasEnough) {
            return finalize(choice.failure || 'You lack the required item.', false, true);
        }
        if (choice.costItem) {
            for (let i = 0; i < costCount; i++) {
                const itemIdx = findItemIndex(choice.costItem);
                if (itemIdx > -1)
                    removeFromInv(itemIdx);
            }
        }
        else if (choice.costSlot) {
            const itemIdx = player.inv.findIndex(it => it.type === choice.costSlot);
            if (itemIdx > -1)
                removeFromInv(itemIdx);
        }
        else if (choice.costTag) {
            for (let i = 0; i < costCount; i++) {
                const itemIdx = findItemIndex(choice.costTag);
                if (itemIdx > -1)
                    removeFromInv(itemIdx);
            }
        }
        Dustland.actions.applyQuestReward(choice.reward);
        dialogJoinParty(choice.join);
        processQuestFlag(choice);
        runEffects(choice.effects);
        if (choice.goto) {
            handleGoto(choice.goto);
            res.close = true;
            res.success = true;
            stateObj.node = null;
            return res;
        }
        const nextId = choice.to || choice.id;
        if (nextId) {
            res.next = nextId;
            stateObj.node = nextId;
            return res;
        }
        return finalize(choice.success || '', true);
    }
    if (choice.check) {
        const { success, roll, dc } = resolveCheck(choice.check, leader());
        log?.(`Dialog check ${choice.check.stat}: ${roll} vs ${dc}`);
        if (!success) {
            return finalize(choice.failure || 'Failed.', false);
        }
    }
    Dustland.actions.applyQuestReward(choice.reward);
    dialogJoinParty(choice.join);
    const questResult = processQuestFlag(choice);
    if (questResult?.blocked) {
        const msg = typeof questResult.message === 'string' && questResult.message
            ? questResult.message
            : 'You’re not done yet.';
        res.text = msg;
        res.success = false;
        res.retriable = true;
        res.next = prevNode;
        stateObj.node = prevNode;
        return res;
    }
    runEffects(choice.effects);
    if (choice.setFlag) {
        const { flag, op, value } = choice.setFlag;
        if (op === 'set') {
            setFlag(flag, value);
        }
        else if (op === 'add') {
            incFlag(flag, value);
        }
        else if (op === 'clear') {
            Dustland.eventFlags.clear(flag);
        }
    }
    if (choice.spawn) {
        const template = npcTemplates.find(t => t.id === choice.spawn.templateId);
        if (template) {
            const id = getNextId(template.id, typeof NPCS !== 'undefined' ? NPCS : []);
            const x = choice.spawn.x;
            const y = choice.spawn.y;
            const combat = template.combat ? { ...template.combat } : {};
            if (choice.spawn.challenge) {
                combat.HP = choice.spawn.challenge;
                combat.challenge = choice.spawn.challenge;
            }
            const npc = makeNPC(id, state.map, x, y, template.color, template.name, '', template.desc, {}, null, null, null, {
                combat,
                portraitSheet: template.portraitSheet,
                portraitLock: template.portraitLock
            });
            if (typeof NPCS !== 'undefined')
                NPCS.push(npc);
        }
    }
    if (choice.q === 'accept' && currentNPC?.quest) {
        const meta = currentNPC.quest;
        const requiredCount = meta.count || 1;
        const itemKey = meta.itemTag || meta.item;
        const hasItems = !itemKey || countItems(itemKey) >= requiredCount;
        const hasFlag = !meta.reqFlag || (typeof flagValue === 'function' && flagValue(meta.reqFlag));
        if (meta.status === 'active' && hasItems && hasFlag) {
            res.next = prevNode;
            stateObj.node = prevNode;
            return res;
        }
    }
    if (choice.applyModule) {
        const moduleData = globalThis[choice.applyModule];
        if (moduleData) {
            applyModule(moduleData, { fullReset: false });
        }
        else {
            console.error(`Module ${choice.applyModule} not found in global scope.`);
        }
    }
    if (choice.goto) {
        handleGoto(choice.goto);
        res.close = true;
        res.success = true;
        stateObj.node = null;
        return res;
    }
    const nextId = choice.to || choice.id;
    if (nextId) {
        res.next = nextId;
        stateObj.node = nextId;
        return res;
    }
    return finalize(choice.text || '', true);
}
const onceChoices = globalThis.usedOnceChoices || (globalThis.usedOnceChoices = new Set());
function setPortrait(portEl, npc) {
    if (!portEl)
        return;
    if (!npc.portraitSheet) {
        portEl.style.backgroundImage = '';
        portEl.style.background = npc.color || '#274227';
        return;
    }
    setPortraitDiv(portEl, npc);
}
function openDialog(npc, node = 'start') {
    currentNPC = npc;
    const rawTree = typeof npc.tree === 'function' ? npc.tree() : npc.tree;
    dialogState.tree = normalizeDialogTree(rawTree || {});
    applyQuestDialog(dialogState.tree, npc);
    dialogState.node = node;
    if (npc.unlockTime && Date.now() >= npc.unlockTime) {
        npc.locked = false;
        npc.unlockTime = null;
    }
    if (npc.locked && dialogState.tree.locked) {
        dialogState.node = 'locked';
    }
    nameEl.textContent = npc.name;
    titleEl.textContent = npc.title;
    setPortrait(portEl, npc);
    const desc = npc.desc;
    if (desc) {
        const small = document.createElement('div');
        small.className = 'small npcdesc';
        small.textContent = desc;
        const hdr = titleEl.parentElement;
        [...hdr.querySelectorAll('.small.npcdesc')].forEach(n => n.remove());
        hdr.appendChild(small);
    }
    renderDialog();
    globalThis.EventBus?.emit?.('music:mood', { id: 'dialog', source: 'dialog', priority: 60 });
    overlay.classList.add('shown');
    setGameState(GAME_STATE.DIALOG);
}
function closeDialog() {
    globalThis.EventBus?.emit?.('music:mood', { id: null, source: 'dialog' });
    overlay.classList.remove('shown');
    currentNPC = null;
    dialogState.tree = null;
    dialogState.node = null;
    choicesEl.innerHTML = '';
    const back = state.map === 'world' ? GAME_STATE.WORLD : GAME_STATE.INTERIOR;
    setGameState(back);
}
function renderDialog() {
    if (!dialogState.tree)
        return;
    currentNPC?.processNode?.(dialogState.node);
    if (currentNPC?.id && dialogState.node && typeof trackQuestDialogNode === 'function') {
        trackQuestDialogNode(currentNPC.id, dialogState.node);
    }
    if (!dialogState.tree || !dialogState.node)
        return;
    let node = dialogState.tree[dialogState.node];
    if (!node) {
        closeDialog();
        return;
    }
    // Optional auto-redirects for config-only dialog trees.
    if (node.jump && node.jump.length) {
        const tgt = node.jump.find(j => !j.if || checkFlagCondition(j.if));
        if (tgt) {
            dialogState.node = tgt.to;
            renderDialog();
            return;
        }
    }
    runEffects(node.checks);
    runEffects(node.effects);
    textEl.textContent = node.text;
    choicesEl.innerHTML = '';
    if (!node.next || node.next.length === 0) {
        const cont = document.createElement('div');
        cont.className = 'choice';
        cont.textContent = '(Continue)';
        cont.onclick = () => closeDialog();
        choicesEl.appendChild(cont);
        selectedChoice = 0;
        dlgHighlightChoice();
        return;
    }
    let choices = node.next.map((opt, idx) => ({ opt, idx }));
    choices = choices.filter(({ opt }) => !opt.if || checkFlagCondition(opt.if));
    choices = choices.filter(({ opt }) => {
        const cond = opt.ifOnce;
        if (!cond)
            return true;
        const nodeId = cond.node;
        const label = cond.label;
        if (!nodeId || !label)
            return true;
        const key = `${currentNPC.id}::${nodeId}::${label}`;
        const used = cond.used === true;
        const seen = onceChoices.has(key);
        return used ? seen : !seen;
    });
    if (currentNPC?.quest) {
        const meta = currentNPC.quest;
        const itemKey = meta.itemTag || meta.item;
        const hasDialogGoals = Array.isArray(meta.dialogNodes) && meta.dialogNodes.length > 0;
        const progress = typeof meta.progress === 'number' ? meta.progress : 0;
        const requiredCount = meta.count || (hasDialogGoals ? meta.dialogNodes.length || 1 : 1);
        choices = choices.filter(({ opt }) => {
            if (opt.q === 'accept' && meta.status !== 'available')
                return false;
            if (opt.q === 'turnin') {
                if (meta.status !== 'active')
                    return false;
                if (itemKey && !hasItem(itemKey))
                    return false;
                if (!itemKey && hasDialogGoals && progress < requiredCount)
                    return false;
            }
            return true;
        });
    }
    choices = choices.filter(({ opt }) => {
        if (!opt.once)
            return true;
        const key = `${currentNPC.id}::${dialogState.node}::${opt.label}`;
        return !onceChoices.has(key);
    });
    const isExit = opt => opt.to === 'bye';
    choices.sort((a, b) => {
        const aExit = isExit(a.opt);
        const bExit = isExit(b.opt);
        return aExit === bExit ? 0 : (aExit ? 1 : -1);
    });
    choices.forEach(({ opt, idx }) => {
        const div = document.createElement('div');
        div.className = 'choice';
        div.textContent = opt.label || '(Continue)';
        if (opt.to === 'do_fight' && currentNPC?.combat) {
            const xp = calcCombatXP(currentNPC);
            div.textContent = `${opt.label} (${xp} XP)`;
        }
        div.onclick = () => {
            const key = `${currentNPC.id}::${dialogState.node}::${opt.label}`;
            const result = advanceDialog(dialogState, idx);
            if (opt.once && !result.retriable)
                onceChoices.add(key);
            if (result && result.text !== null) {
                textEl.textContent = result.text;
                choicesEl.innerHTML = '';
                const cont = document.createElement('div');
                cont.className = 'choice';
                cont.textContent = '(Continue)';
                cont.onclick = () => { if (result.close)
                    closeDialog();
                else {
                    dialogState.node = result.next;
                    renderDialog();
                } };
                choicesEl.appendChild(cont);
            }
            else {
                if (result && result.close)
                    closeDialog();
                else
                    renderDialog();
            }
        };
        choicesEl.appendChild(div);
    });
    selectedChoice = 0;
    dlgHighlightChoice();
}
const dialogExports = { overlay, choicesEl, textEl, nameEl, titleEl, portEl, openDialog, closeDialog, renderDialog, advanceDialog, resolveCheck, handleDialogKey, handleGoto };
Object.assign(globalThis, dialogExports);

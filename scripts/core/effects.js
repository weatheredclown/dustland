// @ts-nocheck
// ===== Effects =====
(function () {
    const globals = globalThis;
    let dustStormCanvas = null;
    let dustStormCtx = null;
    let dustParticles = [];
    let slotMachines = {};
    function createDustStorm() {
        if (dustStormCanvas)
            return;
        dustStormCanvas = document.createElement('canvas');
        dustStormCanvas.id = 'dustStorm';
        dustStormCanvas.style.position = 'fixed';
        dustStormCanvas.style.top = '0';
        dustStormCanvas.style.left = '0';
        dustStormCanvas.style.width = '100%';
        dustStormCanvas.style.height = '100%';
        dustStormCanvas.style.pointerEvents = 'none';
        dustStormCanvas.style.zIndex = '100';
        document.body.appendChild(dustStormCanvas);
        dustStormCtx = dustStormCanvas.getContext('2d');
        if (!dustStormCtx) {
            dustStormCanvas.remove();
            dustStormCanvas = null;
            return;
        }
        dustStormCanvas.width = window.innerWidth;
        dustStormCanvas.height = window.innerHeight;
        for (let i = 0; i < 100; i++) {
            dustParticles.push({
                x: Math.random() * dustStormCanvas.width,
                y: Math.random() * dustStormCanvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 3 + 1,
            });
        }
        animateDustStorm();
    }
    function animateDustStorm() {
        if (!dustStormCanvas || !dustStormCtx)
            return;
        dustStormCtx.clearRect(0, 0, dustStormCanvas.width, dustStormCanvas.height);
        dustStormCtx.fillStyle = 'rgba(210, 180, 140, 0.3)';
        for (const p of dustParticles) {
            p.x -= p.speed;
            if (p.x < 0)
                p.x = dustStormCanvas.width;
            dustStormCtx.fillRect(p.x, p.y, p.size, p.size);
        }
        requestAnimationFrame(animateDustStorm);
    }
    function removeDustStorm() {
        if (!dustStormCanvas)
            return;
        document.body.removeChild(dustStormCanvas);
        dustStormCanvas = null;
        dustStormCtx = null;
        dustParticles = [];
    }
    function getSlotState(id = 'slot_machine') {
        const key = id ?? 'slot_machine';
        if (!slotMachines[key])
            slotMachines[key] = { net: 0, exhausted: false };
        return slotMachines[key];
    }
    function invokeWorkbench(recipe) {
        if (!recipe)
            return;
        const workbench = globalThis.Dustland?.workbench;
        if (!workbench)
            return;
        if (typeof recipe === 'string') {
            if (typeof workbench.craft === 'function') {
                workbench.craft(recipe);
            }
            else {
                const fn = workbench[recipe];
                if (typeof fn === 'function')
                    fn();
            }
        }
        else if (typeof recipe === 'function') {
            recipe();
        }
    }
    const Effects = {
        apply(list = [], ctx = {}) {
            for (const eff of list) {
                if (!eff)
                    continue;
                const type = (eff.effect ?? eff.type);
                switch (type) {
                    case 'dustStorm':
                        if (eff.active)
                            createDustStorm();
                        else
                            removeDustStorm();
                        break;
                    case 'addSoundSource':
                        if (eff.id && typeof eff.x === 'number' && typeof eff.y === 'number') {
                            if (!soundSources.some(s => s.id === eff.id)) {
                                soundSources.push({ id: eff.id, x: eff.x, y: eff.y, map: eff.map ?? state.map });
                            }
                        }
                        break;
                    case 'removeSoundSource':
                        if (eff.id) {
                            const index = soundSources.findIndex(s => s.id === eff.id);
                            if (index > -1)
                                soundSources.splice(index, 1);
                        }
                        break;
                    case 'removeNpc': {
                        const roster = Array.isArray(globals.NPCS) ? globals.NPCS : [];
                        const ids = [];
                        if (typeof eff.id === 'string')
                            ids.push(eff.id);
                        if (typeof eff.npcId === 'string')
                            ids.push(eff.npcId);
                        if (Array.isArray(eff.ids)) {
                            for (const entry of eff.ids) {
                                if (typeof entry === 'string')
                                    ids.push(entry);
                            }
                        }
                        if (!ids.length) {
                            const activeNPC = globals.currentNPC;
                            if (activeNPC?.id)
                                ids.push(activeNPC.id);
                        }
                        const uniqueIds = Array.from(new Set(ids));
                        for (const id of uniqueIds) {
                            const npc = roster.find(n => n && n.id === id) ?? null;
                            if (npc && typeof removeNPC === 'function')
                                removeNPC(npc);
                        }
                        break;
                    }
                    case 'toast':
                        if (typeof toast === 'function')
                            toast(eff.msg ?? '');
                        else if (typeof log === 'function')
                            log(eff.msg ?? '');
                        break;
                    case 'log':
                        if (typeof log === 'function')
                            log(eff.msg ?? '');
                        break;
                    case 'openWorkbench':
                        globalThis.Dustland?.openWorkbench?.();
                        break;
                    case 'showTrainer':
                        if (eff.trainer)
                            globals.TrainerUI?.showTrainer?.(eff.trainer);
                        break;
                    case 'addFlag': {
                        const p = ctx.party ?? globals.party ?? null;
                        if (p && eff.flag) {
                            const flags = (p.flags ?? {});
                            p.flags = flags;
                            flags[eff.flag] = true;
                            if (typeof revealHiddenNPCs === 'function')
                                revealHiddenNPCs();
                        }
                        break;
                    }
                    case 'unboardDoor': {
                        const buildings = Array.isArray(globals.buildings) ? globals.buildings : [];
                        if ((eff.interiorId || eff.bunkerId) && buildings.length) {
                            const b = buildings.find(entry => {
                                if (!entry)
                                    return false;
                                if (eff.interiorId)
                                    return entry.interiorId === eff.interiorId;
                                return entry.bunkerId === eff.bunkerId;
                            });
                            if (b) {
                                b.boarded = false;
                                if (b.bunkerId) {
                                    const bk = globalThis.Dustland?.bunkers?.find(u => u.id === b.bunkerId);
                                    if (bk)
                                        bk.active = true;
                                }
                            }
                        }
                        break;
                    }
                    case 'boardDoor': {
                        const buildings = Array.isArray(globals.buildings) ? globals.buildings : [];
                        if ((eff.interiorId || eff.bunkerId) && buildings.length) {
                            const b = buildings.find(entry => {
                                if (!entry)
                                    return false;
                                if (eff.interiorId)
                                    return entry.interiorId === eff.interiorId;
                                return entry.bunkerId === eff.bunkerId;
                            });
                            if (b) {
                                b.boarded = true;
                                if (b.bunkerId) {
                                    const bk = globalThis.Dustland?.bunkers?.find(u => u.id === b.bunkerId);
                                    if (bk)
                                        bk.active = false;
                                }
                            }
                        }
                        break;
                    }
                    case 'lockNPC': {
                        if (eff.npcId && Array.isArray(globals.NPCS)) {
                            const n = globals.NPCS.find(npc => npc && npc.id === eff.npcId);
                            if (n) {
                                n.locked = true;
                                if (typeof eff.duration === 'number' && eff.duration > 0) {
                                    n.unlockTime = Date.now() + eff.duration;
                                    setTimeout(() => { n.locked = false; n.unlockTime = null; }, eff.duration);
                                }
                            }
                        }
                        break;
                    }
                    case 'unlockNPC': {
                        if (eff.npcId && Array.isArray(globals.NPCS)) {
                            const n = globals.NPCS.find(npc => npc && npc.id === eff.npcId);
                            if (n) {
                                n.locked = false;
                                n.unlockTime = null;
                            }
                        }
                        break;
                    }
                    case 'npcColor': {
                        if (eff.npcId && typeof eff.color === 'string' && Array.isArray(globals.NPCS)) {
                            const n = globals.NPCS.find(npc => npc && npc.id === eff.npcId);
                            if (n) {
                                n.color = eff.color;
                                n.overrideColor = true;
                                if (typeof render === 'function')
                                    render();
                            }
                        }
                        break;
                    }
                    case 'addItem': {
                        if ((eff.id ?? eff.item) && typeof globals.addToInv === 'function') {
                            globals.addToInv(eff.id ?? eff.item);
                        }
                        break;
                    }
                    case 'removeItem': {
                        if (eff.id && typeof findItemIndex === 'function' && typeof removeFromInv === 'function') {
                            const idx = findItemIndex(eff.id);
                            if (idx !== -1)
                                removeFromInv(idx);
                        }
                        break;
                    }
                    case 'teleport': {
                        const map = eff.map ?? state.map;
                        if (map && typeof setMap === 'function') {
                            if (typeof eff.label === 'string')
                                setMap(map, eff.label);
                            else
                                setMap(map);
                        }
                        const partyState = globals.party;
                        const px = Number.isFinite(eff.x) ? eff.x : partyState?.x;
                        const py = Number.isFinite(eff.y) ? eff.y : partyState?.y;
                        if (Number.isFinite(px) && Number.isFinite(py) && typeof setPartyPos === 'function') {
                            setPartyPos(px, py);
                        }
                        if (typeof eff.log === 'string' && typeof log === 'function')
                            log(eff.log);
                        if (typeof eff.toast === 'string' && typeof toast === 'function')
                            toast(eff.toast);
                        break;
                    }
                    case 'pullSlots': {
                        const playerState = globals.player;
                        if (!playerState || typeof playerState.scrap !== 'number')
                            break;
                        const cost = Number.isFinite(eff.cost) ? eff.cost : 0;
                        if (cost > 0 && playerState.scrap < cost) {
                            if (typeof log === 'function')
                                log('Not enough scrap.');
                            break;
                        }
                        if (cost > 0)
                            playerState.scrap -= cost;
                        const payouts = Array.isArray(eff.payouts) && eff.payouts.length ? eff.payouts : [0];
                        const lead = typeof leader === 'function' ? leader() : null;
                        const luck = (lead?.stats?.LCK ?? 0) + (lead?._bonus?.LCK ?? 0);
                        const effLuck = Math.max(0, luck - 7);
                        const roll = typeof rng === 'function' ? rng : Math.random;
                        let idx = Math.floor(roll() * payouts.length);
                        if (effLuck > 0 && roll() < effLuck * 0.05) {
                            idx = Math.min(idx + 1, payouts.length - 1);
                            if (typeof log === 'function')
                                log('Lucky spin!');
                        }
                        const reward = Number.isFinite(payouts[idx]) ? payouts[idx] : 0;
                        if (reward > 0) {
                            playerState.scrap += reward;
                            if (typeof log === 'function')
                                log(`The machine rattles and spits out ${reward} scrap.`);
                        }
                        else if (typeof log === 'function') {
                            log('The machine coughs and eats your scrap.');
                        }
                        const machine = getSlotState(eff.npcId ?? eff.machineId ?? 'slot_machine');
                        machine.net += reward - cost;
                        const dropCfg = eff.drop;
                        if (!machine.exhausted && dropCfg) {
                            const threshold = Number.isFinite(dropCfg.threshold) ? dropCfg.threshold : 500;
                            if (machine.net >= threshold) {
                                machine.exhausted = true;
                                const roster = Array.isArray(globals.NPCS) ? globals.NPCS : [];
                                const npc = roster.find(n => n && n.id === (eff.npcId ?? eff.machineId)) ?? null;
                                const partyState = globals.party;
                                const dropPos = npc
                                    ? { map: npc.map, x: npc.x, y: npc.y }
                                    : { map: partyState?.map ?? state.map, x: partyState?.x ?? 0, y: partyState?.y ?? 0 };
                                if (npc && typeof removeNPC === 'function')
                                    removeNPC(npc);
                                if (dropCfg.log && typeof log === 'function')
                                    log(dropCfg.log);
                                if (dropCfg.toast && typeof toast === 'function')
                                    toast(dropCfg.toast);
                                if (dropCfg.rank && typeof SpoilsCache?.create === 'function') {
                                    const cache = SpoilsCache.create(dropCfg.rank);
                                    const registered = typeof registerItem === 'function' ? registerItem(cache) : cache;
                                    globals.itemDrops?.push?.({ id: registered.id, ...dropPos, dropType: 'loot' });
                                    globalThis.EventBus?.emit?.('spoils:drop', { cache: registered, target: npc });
                                }
                            }
                        }
                        if (typeof updateHUD === 'function')
                            updateHUD();
                        break;
                    }
                    case 'modTraderGrudge': {
                        const roster = Array.isArray(globals.NPCS) ? globals.NPCS : [];
                        const trader = roster.find(n => n && (n.id === (eff.npcId ?? 'trader')));
                        const shop = (trader?.shop ?? null);
                        if (!shop)
                            break;
                        const current = Number.isFinite(shop.grudge) ? (shop.grudge ?? 0) : 0;
                        let target = Number.isFinite(eff.set) ? eff.set : current + (Number.isFinite(eff.delta) ? eff.delta : 0);
                        if (Number.isFinite(eff.min))
                            target = Math.max(eff.min, target);
                        if (Number.isFinite(eff.max))
                            target = Math.min(eff.max, target);
                        const next = Math.max(0, Math.round(Number.isFinite(target) ? target : current));
                        shop.grudge = next;
                        globalThis.Dustland?.updateTradeUI?.(shop);
                        const diff = next - current;
                        if (typeof eff.toast === 'string') {
                            if (typeof toast === 'function')
                                toast(eff.toast);
                            else if (typeof log === 'function')
                                log(eff.toast);
                        }
                        else if (typeof eff.log === 'string' && typeof log === 'function') {
                            log(eff.log);
                        }
                        else if (!eff.silent && typeof log === 'function') {
                            const name = eff.label ?? shop?.name ?? trader?.name ?? 'Trader';
                            const possessive = /s$/i.test(name) ? `${name}'` : `${name}'s`;
                            if (diff > 0)
                                log(`${possessive} grudge rises to ${next}.`);
                            else if (diff < 0)
                                log(`${possessive} grudge falls to ${next}.`);
                            else
                                log(`${possessive} grudge holds at ${next}.`);
                        }
                        break;
                    }
                    case 'buyMemoryWorm': {
                        const playerState = globals.player;
                        const cost = Number.isFinite(eff.cost) ? eff.cost : 500;
                        if (!playerState || (playerState.scrap ?? 0) < cost) {
                            if (typeof log === 'function')
                                log('Not enough scrap.');
                            break;
                        }
                        playerState.scrap = (playerState.scrap ?? 0) - cost;
                        const itemId = eff.itemId ?? 'memory_worm';
                        if (typeof globals.addToInv === 'function')
                            globals.addToInv(itemId);
                        if (typeof renderInv === 'function')
                            renderInv();
                        if (typeof updateHUD === 'function')
                            updateHUD();
                        if (typeof log === 'function')
                            log(eff.log ?? 'Purchased Memory Worm.');
                        break;
                    }
                    case 'workbenchCraft':
                        invokeWorkbench(eff.recipe);
                        break;
                    case 'activateBunker':
                        globalThis.Dustland?.fastTravel?.activateBunker?.(eff.id);
                        break;
                    case 'openWorldMap': {
                        if (typeof globalThis.openWorldMap === 'function')
                            globalThis.openWorldMap(eff.id);
                        else
                            globalThis.Dustland?.worldMap?.open?.(eff.id);
                        break;
                    }
                    case 'removeItemsByTag': {
                        const playerState = globals.player;
                        if (eff.tag && Array.isArray(playerState?.inv) && typeof removeFromInv === 'function') {
                            for (let i = playerState.inv.length - 1; i >= 0; i--) {
                                const it = playerState.inv[i];
                                if (it.tags && it.tags.map(t => t.toLowerCase()).includes(eff.tag.toLowerCase())) {
                                    const qty = Math.max(1, Number.isFinite(it?.count) ? it.count : 1);
                                    removeFromInv(i, qty);
                                }
                            }
                        }
                        break;
                    }
                    case 'replaceItem': {
                        if (eff.remove && typeof findItemIndex === 'function' && typeof removeFromInv === 'function') {
                            const idx = findItemIndex(eff.remove);
                            if (idx !== -1)
                                removeFromInv(idx);
                        }
                        if (eff.add && typeof globals.addToInv === 'function')
                            globals.addToInv(eff.add);
                        break;
                    }
                    case 'modStat': {
                        const target = ctx.actor ?? ctx.player;
                        if (target?.stats && eff.stat) {
                            const delta = typeof eff.delta === 'number' ? eff.delta : 0;
                            const current = target.stats[eff.stat] ?? 0;
                            target.stats[eff.stat] = current + delta;
                            if (eff.duration) {
                                const buffs = ctx.buffs ?? (ctx.buffs = []);
                                buffs.push({ target, stat: eff.stat, delta, remaining: eff.duration });
                            }
                            if (typeof playFX === 'function')
                                playFX('status');
                        }
                        break;
                    }
                }
            }
        },
        reset() {
            slotMachines = {};
        },
        tick(ctx = {}) {
            const list = ctx.buffs ?? [];
            for (let i = list.length - 1; i >= 0; i--) {
                const b = list[i];
                if (--b.remaining <= 0) {
                    const target = b.target;
                    if (target?.stats) {
                        const current = target.stats[b.stat] ?? 0;
                        target.stats[b.stat] = current - b.delta;
                    }
                    list.splice(i, 1);
                }
            }
        }
    };
    globalThis.Dustland = globalThis.Dustland ?? {};
    globalThis.Dustland.effects = Effects;
    globalThis.Effects = Effects;
})();

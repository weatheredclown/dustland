(function () {
    const globals = globalThis;
    const bus = globals.EventBus;
    const dustland = globals.Dustland;
    const gs = dustland?.gameState;
    if (!bus || !gs?.applyPersona)
        return;
    const btn = document.getElementById('campBtn');
    const overlay = document.getElementById('personaOverlay');
    const list = document.getElementById('personaList');
    const closeBtn = document.getElementById('closePersonaBtn');
    const fastTravelBtn = document.getElementById('campFastTravelBtn');
    const chestBtn = document.getElementById('campChestBtn');
    const chestOverlay = document.getElementById('campChestOverlay');
    const chestList = document.getElementById('campChestList');
    const chestInvList = document.getElementById('campChestInventoryList');
    const closeChestBtn = document.getElementById('closeCampChestBtn');
    const inventory = dustland?.inventory;
    const CAMP_CHEST_COST = 20000;
    let reopenPersonaAfterChest = false;
    if (btn)
        btn.addEventListener('click', () => bus.emit('camp:open'));
    if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => overlay.classList.remove('shown'));
    }
    if (fastTravelBtn && overlay) {
        fastTravelBtn.addEventListener('click', () => {
            if (fastTravelBtn.disabled)
                return;
            overlay.classList.remove('shown');
            globals.openWorldMap?.('camp');
        });
    }
    const formatScrap = (value) => {
        if (typeof value !== 'number')
            return String(value ?? '');
        try {
            return value.toLocaleString('en-US');
        }
        catch (err) {
            return String(value);
        }
    };
    const describeItem = (it) => {
        if (!it)
            return '';
        const name = it.name || it.id || 'Unknown item';
        const qty = Math.max(1, Number.isFinite(it.count) ? it.count : 1);
        return qty > 1 ? `${name} x${qty}` : name;
    };
    function renderCampChest() {
        if (!inventory || !chestList || !chestInvList)
            return;
        const chestItemsRaw = inventory.getCampChest?.() ?? [];
        const chestItems = Array.isArray(chestItemsRaw)
            ? chestItemsRaw
            : [];
        chestList.innerHTML = '';
        if (chestItems.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'camp-chest-empty';
            empty.textContent = 'Chest empty';
            chestList.appendChild(empty);
        }
        else {
            chestItems.forEach((item, idx) => {
                const row = document.createElement('div');
                row.className = 'slot camp-chest-row';
                const label = document.createElement('div');
                label.className = 'camp-chest-name';
                label.textContent = describeItem(item);
                row.appendChild(label);
                const takeBtn = document.createElement('button');
                takeBtn.className = 'btn';
                takeBtn.textContent = 'Take';
                takeBtn.addEventListener('click', () => {
                    const ok = inventory.withdrawCampChestItem?.(idx);
                    renderCampChest();
                    if (ok && typeof renderInv === 'function') {
                        renderInv();
                    }
                });
                row.appendChild(takeBtn);
                chestList.appendChild(row);
            });
        }
        const invRaw = globals.player?.inv;
        const inv = Array.isArray(invRaw) ? invRaw : [];
        chestInvList.innerHTML = '';
        if (inv.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'camp-chest-empty';
            empty.textContent = 'Inventory empty';
            chestInvList.appendChild(empty);
        }
        else {
            inv.forEach((item, idx) => {
                const row = document.createElement('div');
                row.className = 'slot camp-chest-row';
                const label = document.createElement('div');
                label.className = 'camp-chest-name';
                label.textContent = describeItem(item);
                row.appendChild(label);
                const storeBtn = document.createElement('button');
                storeBtn.className = 'btn';
                storeBtn.textContent = 'Store';
                storeBtn.addEventListener('click', () => {
                    const ok = inventory.storeCampChestItem?.(idx);
                    renderCampChest();
                    if (ok && typeof renderInv === 'function') {
                        renderInv();
                    }
                });
                row.appendChild(storeBtn);
                chestInvList.appendChild(row);
            });
        }
    }
    function closeCampChest(restorePersona) {
        if (!chestOverlay)
            return;
        chestOverlay.classList.remove('shown');
        if (restorePersona && reopenPersonaAfterChest && overlay) {
            overlay.classList.add('shown');
        }
        reopenPersonaAfterChest = false;
    }
    function openCampChest(fromPersonaOverlay) {
        if (!inventory || !chestOverlay)
            return;
        reopenPersonaAfterChest = !!fromPersonaOverlay;
        renderCampChest();
        chestOverlay.classList.add('shown');
    }
    function updateCampChestButton() {
        if (!chestBtn)
            return;
        if (!inventory) {
            chestBtn.style.display = 'none';
            return;
        }
        chestBtn.style.display = '';
        const unlocked = inventory.isCampChestUnlocked?.();
        if (unlocked) {
            chestBtn.textContent = 'Camp Chest';
            chestBtn.disabled = false;
            chestBtn.title = '';
        }
        else {
            chestBtn.textContent = `Buy Camp Chest (${formatScrap(CAMP_CHEST_COST)} Scrap)`;
            chestBtn.disabled = false;
            chestBtn.title = 'Costs scrap to set up a permanent stash.';
        }
    }
    if (closeChestBtn) {
        closeChestBtn.addEventListener('click', () => closeCampChest(true));
    }
    if (chestBtn) {
        chestBtn.addEventListener('click', () => {
            if (!inventory)
                return;
            const unlocked = inventory.isCampChestUnlocked?.();
            if (!unlocked) {
                const player = (globals.player ?? {});
                const scrap = Number.isFinite(player.scrap) ? Number(player.scrap) : 0;
                if (scrap < CAMP_CHEST_COST) {
                    globals.log?.('Not enough scrap.');
                    if (typeof globals.toast === 'function')
                        globals.toast('Not enough scrap.');
                    return;
                }
                player.scrap = scrap - CAMP_CHEST_COST;
                inventory.unlockCampChest?.();
                globals.updateHUD?.();
                globals.log?.('Camp chest assembled.');
                if (typeof globals.toast === 'function')
                    globals.toast('Camp chest assembled.');
                updateCampChestButton();
                const fromPersona = overlay?.classList.contains('shown');
                if (fromPersona)
                    overlay.classList.remove('shown');
                openCampChest(fromPersona);
                return;
            }
            const fromPersona = overlay?.classList.contains('shown');
            if (fromPersona)
                overlay.classList.remove('shown');
            openCampChest(fromPersona);
        });
    }
    if (bus && inventory) {
        bus.on('inventory:changed', () => {
            updateCampChestButton();
            if (chestOverlay?.classList.contains('shown'))
                renderCampChest();
        });
        bus.on('campChest:changed', () => {
            updateCampChestButton();
            if (chestOverlay?.classList.contains('shown'))
                renderCampChest();
        });
    }
    updateCampChestButton();
    bus.on('camp:open', () => {
        closeCampChest(false);
        updateCampChestButton();
        const pos = globals.party;
        const map = globals.state?.map || 'world';
        const zones = dustland?.zoneEffects ?? [];
        if (pos) {
            for (const z of zones) {
                if (z.if && !globals.checkFlagCondition?.(z.if))
                    continue;
                if ((z.map || 'world') !== map)
                    continue;
                if (pos.x < z.x || pos.y < z.y || pos.x >= z.x + (z.w || 0) || pos.y >= z.y + (z.h || 0))
                    continue;
                if (z.dry || (z.perStep?.hp < 0) || (z.step?.hp < 0)) {
                    globals.log?.("You can't camp here.");
                    return;
                }
            }
        }
        globals.healAll?.();
        if (fastTravelBtn) {
            const bunkers = dustland?.bunkers ?? [];
            const hasDestinations = bunkers.some(b => b?.active);
            fastTravelBtn.disabled = !hasDestinations;
            fastTravelBtn.title = hasDestinations ? '' : 'Activate a bunker to fast travel.';
        }
        if (pos) {
            for (const memberState of pos) {
                if (typeof memberState.hydration === 'number')
                    memberState.hydration = 2;
            }
        }
        globals.updateHUD?.();
        globals.log?.('You rest until healed.');
        const ensurePartyState = () => {
            const state = gs.getState?.() ?? null;
            if (!state)
                return null;
            if ((!Array.isArray(state.party) || state.party.length === 0) && Array.isArray(globals.party)) {
                gs.updateState?.((draft) => {
                    if (globals.party)
                        draft.party = globals.party;
                });
            }
            const refreshed = gs.getState?.() ?? state;
            return refreshed;
        };
        const state = ensurePartyState() ?? {};
        const member = state.party?.[0] ?? globals.party?.[0];
        if (!member?.id || !overlay || !list)
            return;
        const personas = state.personas ?? {};
        const ids = Object.keys(personas);
        const currentId = member.persona;
        list.innerHTML = '';
        if (currentId && typeof gs.clearPersona === 'function') {
            const unequip = document.createElement('button');
            unequip.className = 'btn';
            unequip.dataset.action = 'unequip';
            unequip.textContent = 'Unequip mask';
            unequip.addEventListener('click', () => {
                overlay.classList.remove('shown');
                gs.clearPersona?.(member.id);
            }, { once: true });
            list.appendChild(unequip);
        }
        if (!ids.length) {
            const msg = document.createElement('div');
            msg.className = 'muted';
            msg.textContent = 'No masks available';
            list.appendChild(msg);
        }
        else {
            ids.forEach(id => {
                const data = personas[id] ?? {};
                const card = document.createElement('div');
                card.className = 'persona-card';
                const title = document.createElement('div');
                title.className = 'persona-title';
                title.textContent = data.label || id;
                card.appendChild(title);
                if (data.portraitPrompt) {
                    const prompt = document.createElement('p');
                    prompt.className = 'persona-prompt';
                    prompt.textContent = data.portraitPrompt;
                    card.appendChild(prompt);
                }
                const mods = data.mods;
                if (mods && typeof mods === 'object') {
                    const entries = Object.entries(mods).filter(([, value]) => typeof value === 'number' && value !== 0);
                    if (entries.length) {
                        const listEl = document.createElement('ul');
                        listEl.className = 'persona-mods';
                        for (const [stat, value] of entries) {
                            const item = document.createElement('li');
                            const prefix = value > 0 ? '+' : '';
                            item.textContent = `${prefix}${value} ${stat}`;
                            listEl.appendChild(item);
                        }
                        card.appendChild(listEl);
                    }
                }
                if (currentId === id) {
                    const status = document.createElement('div');
                    status.className = 'persona-status';
                    status.textContent = 'Currently equipped';
                    card.appendChild(status);
                }
                const b = document.createElement('button');
                b.className = 'btn';
                b.dataset.personaId = id;
                if (currentId === id) {
                    b.textContent = 'Equipped';
                    b.disabled = true;
                }
                else {
                    b.textContent = 'Equip mask';
                    b.addEventListener('click', () => {
                        overlay.classList.remove('shown');
                        gs.applyPersona?.(member.id, id);
                    }, { once: true });
                }
                card.appendChild(b);
                list.appendChild(card);
            });
        }
        overlay.classList.add('shown');
    });
})();

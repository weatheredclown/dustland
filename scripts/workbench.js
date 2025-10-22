// @ts-nocheck
(function () {
    globalThis.Dustland = globalThis.Dustland || {};
    const bus = globalThis.EventBus;
    const ENHANCE_COST = 5;
    function getItemCount(id) {
        if (!id)
            return 0;
        if (typeof countItems === 'function') {
            return countItems(id) || 0;
        }
        const inv = Array.isArray(player?.inv) ? player.inv : [];
        return inv.reduce((sum, it) => sum + (it?.id === id ? Math.max(1, Number.isFinite(it?.count) ? it.count : 1) : 0), 0);
    }
    function resolveItemDefinition(id) {
        if (!id)
            return null;
        if (typeof getItem === 'function') {
            const found = getItem(id);
            if (found)
                return found;
        }
        const inv = Array.isArray(player?.inv) ? player.inv : [];
        const entry = inv.find(it => it?.id === id);
        if (!entry)
            return null;
        try {
            return JSON.parse(JSON.stringify(entry));
        }
        catch (err) {
            return { ...entry };
        }
    }
    function buildEnhancedName(baseName) {
        if (!baseName)
            return 'Enhanced Item';
        const trimmed = baseName.replace(/^Enhanced\s+/i, '').trim();
        return `Enhanced ${trimmed}`.trim();
    }
    function ensureEnhancedDefinition(base) {
        if (!base || !base.id)
            return null;
        const enhancedId = `enhanced_${base.id}`;
        if (typeof getItem === 'function') {
            const existing = getItem(enhancedId);
            if (existing)
                return existing;
        }
        const def = (() => {
            try {
                return JSON.parse(JSON.stringify(base));
            }
            catch (err) {
                return { ...base };
            }
        })();
        def.id = enhancedId;
        def.name = buildEnhancedName(base.name || base.id || 'Item');
        const baseId = base.baseId || base.id;
        if (baseId) {
            def.baseId = baseId;
        }
        def.mods = {};
        Object.entries(base.mods || {}).forEach(([key, value]) => {
            def.mods[key] = typeof value === 'number' ? value * 2 : value;
        });
        if (base.desc) {
            def.desc = /enhanced/i.test(base.desc) ? base.desc : `${base.desc} (enhanced)`;
        }
        else {
            def.desc = `${def.name} forged at the workbench.`;
        }
        if (Array.isArray(base.tags)) {
            def.tags = [...base.tags];
        }
        if (typeof base.value === 'number') {
            def.value = base.value * 2;
        }
        def.cursed = !!base.cursed;
        def.cursedKnown = !!base.cursedKnown;
        if (base.persona)
            def.persona = base.persona;
        if (base.narrative)
            def.narrative = { ...base.narrative };
        if (base.rank)
            def.rank = base.rank;
        if (base.scrap !== undefined)
            def.scrap = base.scrap;
        if (base.fuel !== undefined)
            def.fuel = base.fuel;
        if (base.use)
            def.use = { ...base.use };
        if (base.equip)
            def.equip = { ...base.equip };
        if (base.unequip)
            def.unequip = { ...base.unequip };
        if (typeof registerItem === 'function') {
            registerItem(def);
            if (typeof getItem === 'function') {
                const refreshed = getItem(enhancedId);
                if (refreshed)
                    return refreshed;
            }
        }
        return def;
    }
    const recipeRegistry = new Map();
    function normalizeRequirement(req = {}) {
        const key = req.key ?? req.id;
        if (!key)
            return null;
        const type = req.type === 'resource' ? 'resource' : 'item';
        const amount = Number.isFinite(req.amount) ? req.amount : 1;
        const label = req.label || String(key);
        return { label, key, amount, type };
    }
    function normalizeRecipe(def = {}) {
        if (!def)
            return null;
        const id = def.id ?? def.recipe ?? def.key;
        const craft = typeof def.craft === 'function' ? def.craft : null;
        if (!id || !craft)
            return null;
        const name = def.name || def.label || String(id);
        const requirements = Array.isArray(def.requirements)
            ? def.requirements.map(normalizeRequirement).filter(Boolean)
            : [];
        return { id: String(id), name, craft, requirements };
    }
    function setRecipes(list = []) {
        recipeRegistry.clear();
        list.forEach(def => {
            const norm = normalizeRecipe(def);
            if (norm)
                recipeRegistry.set(norm.id, norm);
        });
        return listRecipes();
    }
    function registerRecipe(def) {
        const norm = normalizeRecipe(def);
        if (!norm)
            return null;
        recipeRegistry.set(norm.id, norm);
        return norm;
    }
    function unregisterRecipe(id) {
        if (id == null)
            return;
        recipeRegistry.delete(String(id));
    }
    function getRecipe(id) {
        if (id == null)
            return null;
        return recipeRegistry.get(String(id)) || null;
    }
    function listRecipes() {
        return Array.from(recipeRegistry.values());
    }
    function craftRecipe(id) {
        const recipe = getRecipe(id);
        if (!recipe)
            return false;
        const result = recipe.craft();
        return result === undefined ? true : !!result;
    }
    function craftEnhancedItem(baseId) {
        const base = resolveItemDefinition(baseId);
        if (!base) {
            log('Need a valid item to enhance.');
            return;
        }
        const needed = ENHANCE_COST;
        const have = getItemCount(baseId);
        if (have < needed) {
            log(`Need ${needed} ${base.name || base.id}.`);
            return;
        }
        for (let i = 0; i < needed; i += 1) {
            const idx = typeof findItemIndex === 'function' ? findItemIndex(baseId) : -1;
            if (idx === -1) {
                log('Missing components.');
                return;
            }
            if (typeof removeFromInv === 'function') {
                removeFromInv(idx);
            }
        }
        const enhanced = ensureEnhancedDefinition(base);
        if (!enhanced) {
            log('Unable to enhance that item.');
            return;
        }
        const addTarget = enhanced.id || enhanced;
        let added = false;
        if (typeof addToInv === 'function') {
            added = addToInv(addTarget);
            if (!added && enhanced && enhanced.id) {
                added = addToInv(enhanced);
            }
        }
        if (!added) {
            log('Inventory full.');
            return;
        }
        bus?.emit('craft:enhanced', { baseId: base.id || baseId, enhancedId: enhanced.id || addTarget });
        log(`Forged ${enhanced.name || buildEnhancedName(base.name || base.id)}.`);
    }
    function openWorkbench() {
        const overlay = document.getElementById('workbenchOverlay');
        const list = document.getElementById('workbenchRecipes');
        const closeBtn = document.getElementById('closeWorkbenchBtn');
        if (!overlay || !list || !closeBtn)
            return;
        let focusables = [];
        let focusIdx = 0;
        function focusCurrent() {
            if (focusables.length)
                focusables[focusIdx].focus();
        }
        function getEnhancementRecipes() {
            const inv = Array.isArray(player?.inv) ? player.inv : [];
            const counts = {};
            inv.forEach(it => {
                if (!it || !it.id)
                    return;
                if (typeof it.type === 'string' && it.type !== 'weapon' && it.type !== 'armor')
                    return;
                if (String(it.id).startsWith('enhanced_'))
                    return;
                const id = it.id;
                counts[id] = (counts[id] || 0) + Math.max(1, Number.isFinite(it?.count) ? it.count : 1);
            });
            return Object.keys(counts)
                .filter(id => counts[id] >= ENHANCE_COST)
                .map(id => {
                const base = resolveItemDefinition(id);
                const baseName = base?.name || id;
                return {
                    name: buildEnhancedName(baseName),
                    craft: () => craftEnhancedItem(id),
                    requirements: [
                        { label: baseName, key: id, amount: ENHANCE_COST, type: 'item' }
                    ]
                };
            });
        }
        function renderRecipes() {
            list.innerHTML = '';
            focusables = [];
            const baseRecipes = listRecipes();
            const enhancementRecipes = getEnhancementRecipes();
            const recipes = [...baseRecipes, ...enhancementRecipes];
            recipes.forEach(r => {
                const row = document.createElement('div');
                row.className = 'slot';
                const info = document.createElement('div');
                const title = document.createElement('span');
                title.textContent = r.name || r.id || 'Recipe';
                info.appendChild(title);
                const reqList = document.createElement('ul');
                let craftable = true;
                (Array.isArray(r.requirements) ? r.requirements : []).forEach(req => {
                    const have = req.type === 'resource'
                        ? (player?.[req.key] || 0)
                        : getItemCount(req.key);
                    if (have < req.amount)
                        craftable = false;
                    const li = document.createElement('li');
                    li.textContent = `${req.label}: ${have}/${req.amount}`;
                    reqList.appendChild(li);
                });
                info.appendChild(reqList);
                row.appendChild(info);
                if (craftable) {
                    const btn = document.createElement('button');
                    btn.className = 'btn';
                    btn.textContent = 'Craft';
                    btn.onclick = () => {
                        if (r.id && typeof Dustland.workbench?.craft === 'function') {
                            Dustland.workbench.craft(r.id);
                        }
                        else if (typeof r.craft === 'function') {
                            r.craft();
                        }
                        renderRecipes();
                    };
                    row.appendChild(btn);
                    focusables.push(btn);
                }
                list.appendChild(row);
            });
            focusIdx = 0;
            focusCurrent();
        }
        function close() {
            overlay.classList.remove('shown');
            overlay.removeEventListener('keydown', handleKey);
        }
        function handleKey(e) {
            e.stopPropagation();
            if (e.key === 'Escape') {
                close();
                return;
            }
            if (e.key === 'ArrowDown') {
                focusIdx = (focusIdx + 1) % focusables.length;
                focusCurrent();
                e.preventDefault();
            }
            else if (e.key === 'ArrowUp') {
                focusIdx = (focusIdx - 1 + focusables.length) % focusables.length;
                focusCurrent();
                e.preventDefault();
            }
        }
        closeBtn.onclick = close;
        overlay.classList.add('shown');
        overlay.tabIndex = -1;
        overlay.addEventListener('keydown', handleKey);
        renderRecipes();
        overlay.focus();
    }
    Dustland.workbench = {
        setRecipes,
        registerRecipe,
        unregisterRecipe,
        getRecipe,
        listRecipes,
        craft: craftRecipe,
        craftEnhancedItem
    };
    Dustland.openWorkbench = openWorkbench;
})();

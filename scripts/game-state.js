(function () {
    const globals = globalThis;
    const dustland = (globals.Dustland ?? (globals.Dustland = {}));
    const getEventBus = () => globals.EventBus ?? globals.eventBus ?? dustland.eventBus;
    const state = {
        party: [],
        world: {},
        inventory: [],
        flags: {},
        clock: 0,
        quests: [],
        difficulty: 'normal',
        personas: {},
        effectPacks: {},
        npcMemory: {},
    };
    const emitStateChanged = () => {
        getEventBus()?.emit('state:changed', state);
    };
    const getState = () => state;
    const updateState = (fn) => {
        if (typeof fn === 'function') {
            fn(state);
        }
        emitStateChanged();
    };
    const getDifficulty = () => state.difficulty;
    const setDifficulty = (mode) => {
        state.difficulty = mode;
    };
    const setPersona = (id, persona) => {
        state.personas[id] = persona;
        dustland.profiles?.set(id, persona);
    };
    const getPersona = (id) => state.personas[id];
    const addEffectPack = (evt, list) => {
        if (!evt || !Array.isArray(list))
            return;
        state.effectPacks[evt] = list;
        getEventBus()?.on(evt, payload => {
            const context = payload && typeof payload === 'object'
                ? payload
                : {};
            dustland.effects?.apply?.(list, context);
        });
    };
    const loadEffectPacks = (packs) => {
        if (!packs)
            return;
        Object.entries(packs).forEach(([evt, list]) => addEffectPack(evt, list));
    };
    const rememberNPC = (id, key, value) => {
        if (!id || !key)
            return;
        const memory = state.npcMemory[id] ?? (state.npcMemory[id] = {});
        memory[key] = value;
    };
    const recallNPC = (id, key) => {
        if (!id || !key)
            return undefined;
        const memory = state.npcMemory[id];
        return memory ? memory[key] : undefined;
    };
    const forgetNPC = (id, key) => {
        if (!id)
            return;
        if (key) {
            delete state.npcMemory[id]?.[key];
        }
        else {
            delete state.npcMemory[id];
        }
    };
    const applyPersona = (memberId, personaId) => {
        const persona = state.personas[personaId];
        if (!persona)
            return;
        const member = state.party.find(m => m.id === memberId);
        if (!member)
            return;
        const prev = member.persona;
        if (prev === personaId)
            return;
        if (prev) {
            dustland.profiles?.remove?.(member, prev);
            getEventBus()?.emit('persona:unequip', { memberId, personaId: prev });
        }
        member.persona = personaId;
        dustland.profiles?.apply?.(member, personaId);
        if (typeof member.applyEquipmentStats === 'function')
            member.applyEquipmentStats();
        if (typeof member.applyCombatMods === 'function')
            member.applyCombatMods();
        getEventBus()?.emit('persona:equip', { memberId, personaId });
        if (typeof renderParty === 'function')
            renderParty();
        if (typeof updateHUD === 'function')
            updateHUD();
    };
    const clearPersona = (memberId) => {
        const member = state.party.find(m => m.id === memberId);
        if (!member)
            return;
        const prev = member.persona;
        if (!prev)
            return;
        dustland.profiles?.remove?.(member, prev);
        member.persona = undefined;
        if (typeof member.applyEquipmentStats === 'function')
            member.applyEquipmentStats();
        if (typeof member.applyCombatMods === 'function')
            member.applyCombatMods();
        getEventBus()?.emit('persona:unequip', { memberId, personaId: prev });
        if (typeof renderParty === 'function')
            renderParty();
        if (typeof updateHUD === 'function')
            updateHUD();
    };
    dustland.gameState = {
        getState,
        updateState,
        getDifficulty,
        setDifficulty,
        setPersona,
        getPersona,
        applyPersona,
        clearPersona,
        addEffectPack,
        loadEffectPacks,
        rememberNPC,
        recallNPC,
        forgetNPC,
    };
})();

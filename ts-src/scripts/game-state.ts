(function () {
  type PersonaRegistry = Record<string, DustlandPersonaTemplate>;
  type EffectPackList = unknown[];
  type EffectPackMap = Record<string, EffectPackList>;
  type NpcMemory = Record<string, Record<string, unknown>>;

  type MutableGameState = DustlandGameSnapshot & {
    party: Party;
    world: Record<string, unknown>;
    inventory: PartyItem[];
    flags: Record<string, unknown>;
    clock: number;
    quests: QuestState[];
    difficulty: string;
    personas: PersonaRegistry;
    effectPacks: EffectPackMap;
    npcMemory: NpcMemory;
  };

  const globals = globalThis as unknown as GlobalThis;
  const dustland = (globals.Dustland ??= {} as DustlandNamespace);
  const getEventBus = (): DustlandEventBus | undefined =>
    globals.EventBus ?? globals.eventBus ?? dustland.eventBus;

  const state: MutableGameState = {
    party: [] as unknown as Party,
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

  const emitStateChanged = (): void => {
    getEventBus()?.emit('state:changed', state);
  };

  const getState = (): MutableGameState => state;

  const updateState = (fn?: (draft: MutableGameState) => void): void => {
    if (typeof fn === 'function') {
      fn(state);
    }
    emitStateChanged();
  };

  const getDifficulty = (): string => state.difficulty;

  const setDifficulty = (mode: string): void => {
    state.difficulty = mode;
  };

  const setPersona = (id: string, persona: DustlandPersonaTemplate): void => {
    state.personas[id] = persona;
    dustland.profiles?.set(id, persona);
  };

  const getPersona = (id: string): DustlandPersonaTemplate | undefined => state.personas[id];

  const addEffectPack = (evt: string | undefined, list: EffectPackList | undefined): void => {
    if (!evt || !Array.isArray(list)) return;
    state.effectPacks[evt] = list;
    getEventBus()?.on(evt, payload => {
      const context =
        payload && typeof payload === 'object'
          ? (payload as Record<string, unknown>)
          : {};
      dustland.effects?.apply?.(list, context);
    });
  };

  const loadEffectPacks = (packs?: Record<string, EffectPackList>): void => {
    if (!packs) return;
    Object.entries(packs).forEach(([evt, list]) => addEffectPack(evt, list));
  };

  const rememberNPC = (id: string | undefined, key: string | undefined, value: unknown): void => {
    if (!id || !key) return;
    const memory = state.npcMemory[id] ?? (state.npcMemory[id] = {});
    memory[key] = value;
  };

  const recallNPC = (id: string | undefined, key: string | undefined): unknown => {
    if (!id || !key) return undefined;
    const memory = state.npcMemory[id];
    return memory ? memory[key] : undefined;
  };

  const forgetNPC = (id: string | undefined, key?: string): void => {
    if (!id) return;
    if (key) {
      delete state.npcMemory[id]?.[key];
    } else {
      delete state.npcMemory[id];
    }
  };

  const applyPersona = (memberId: string, personaId: string): void => {
    const persona = state.personas[personaId];
    if (!persona) return;
    const member = state.party.find(m => m.id === memberId);
    if (!member) return;
    const prev = member.persona;
    if (prev === personaId) return;
    if (prev) {
      dustland.profiles?.remove?.(member, prev);
      getEventBus()?.emit('persona:unequip', { memberId, personaId: prev });
    }
    member.persona = personaId;
    dustland.profiles?.apply?.(member, personaId);
    if (typeof member.applyEquipmentStats === 'function') member.applyEquipmentStats();
    if (typeof member.applyCombatMods === 'function') member.applyCombatMods();
    getEventBus()?.emit('persona:equip', { memberId, personaId });
    if (typeof renderParty === 'function') renderParty();
    if (typeof updateHUD === 'function') updateHUD();
  };

  const clearPersona = (memberId: string): void => {
    const member = state.party.find(m => m.id === memberId);
    if (!member) return;
    const prev = member.persona;
    if (!prev) return;
    dustland.profiles?.remove?.(member, prev);
    member.persona = undefined;
    if (typeof member.applyEquipmentStats === 'function') member.applyEquipmentStats();
    if (typeof member.applyCombatMods === 'function') member.applyCombatMods();
    getEventBus()?.emit('persona:unequip', { memberId, personaId: prev });
    if (typeof renderParty === 'function') renderParty();
    if (typeof updateHUD === 'function') updateHUD();
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

export {};

declare global {
  type WizardPrimitive = string | number | boolean | null | undefined;
  type WizardStateValue = WizardPrimitive | WizardState | WizardStateValue[];

  interface WizardState {
    [key: string]: WizardStateValue;
  }

  interface WizardStep<S extends WizardState = WizardState> {
    render: (container: HTMLElement, state: S) => void;
    validate?: (state: S) => boolean | void;
    onComplete?: (state: S) => void;
  }

  interface WizardOptions<S extends WizardState = WizardState> {
    initialState?: S;
    onComplete?: (state: S) => void;
  }

  interface WizardInstance<S extends WizardState = WizardState> {
    next: () => boolean;
    prev: () => boolean;
    goTo: (index: number) => boolean;
    getState: () => S;
    current: () => number;
  }

  type WizardFactory = <S extends WizardState = WizardState>(
    container: HTMLElement,
    steps: WizardStep<S>[],
    opts?: WizardOptions<S>
  ) => WizardInstance<S>;

  type WizardStepFactory<S extends WizardState = WizardState> = (
    ...args: unknown[]
  ) => WizardStep<S>;

  interface WizardStepsRegistry<S extends WizardState = WizardState> {
    [key: string]: WizardStepFactory<S> | undefined;
  }

  interface WizardDefinition<S extends WizardState = WizardState> {
    title: string;
    steps: WizardStep<S>[];
    commit: (state: S) => unknown;
  }

  interface StarterItemUse {
    type: string;
    amount: number;
    text: string;
  }

  interface StarterItem {
    id: string;
    name: string;
    type: string;
    use: StarterItemUse;
  }

  interface TrainerUpgrade {
    id: string;
    label: string;
    cost: number;
    type: string;
    stat?: string;
    delta?: number;
  }

  type TrainerUpgradeMap = Record<string, TrainerUpgrade[]>;

  type JsonSchema = Record<string, unknown>;

  interface DustlandEffectsApi {
    apply: (list?: unknown[], ctx?: Record<string, unknown>) => void;
  }

  interface DustlandInventoryApi {
    getCampChest?: () => unknown[];
    withdrawCampChestItem?: (index: number) => boolean | void;
    storeCampChestItem?: (index: number) => boolean | void;
    isCampChestUnlocked?: () => boolean;
    unlockCampChest?: () => void;
  }

  interface DustlandUiApi {
    show: (id: string, display?: string) => void;
    hide: (id: string) => void;
    setText: (id: string, text: string) => void;
    setValue: (id: string, value: string) => void;
    remove: (id: string) => void;
  }

  interface DustlandZoneEffect {
    if?: unknown;
    map?: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    dry?: boolean;
    perStep?: { hp?: number; [key: string]: unknown };
    step?: { hp?: number; [key: string]: unknown };
    [key: string]: unknown;
  }

  interface DustlandWeatherState {
    state: string;
    icon: string;
    desc: string;
    speedMod: number;
    encounterBias: unknown;
    [key: string]: unknown;
  }

  interface DustlandDialogChoice {
    to?: string;
    [key: string]: unknown;
  }

  interface DustlandDialogNode {
    choices?: DustlandDialogChoice[];
    [key: string]: unknown;
  }

  type ProfileStatMap = Record<string, number>;

  interface DustlandProfile {
    mods?: ProfileStatMap;
    effects?: unknown[];
    [key: string]: unknown;
  }

  interface ProfiledEntity {
    stats?: ProfileStatMap;
    _bonus?: ProfileStatMap;
    [key: string]: unknown;
  }

  interface DustlandProfilesApi {
    set: (id: string, data?: DustlandProfile) => void;
    get: (id: string) => DustlandProfile | undefined;
    apply: (target: ProfiledEntity | undefined, id: string) => void;
    remove: (target: ProfiledEntity | undefined, id: string) => void;
  }

  interface DustlandPersonaTemplate {
    id: string;
    label: string;
    portrait: string;
    portraitPrompt?: string;
    mods?: ProfileStatMap;
    [key: string]: unknown;
  }

  interface DustlandGameSnapshot {
    party?: Party;
    personas?: Record<string, DustlandPersonaTemplate>;
    [key: string]: unknown;
  }

  interface DustlandGameState {
    setPersona?: (id: string, template: DustlandPersonaTemplate) => void;
    applyPersona?: (memberId: string, personaId: string) => void;
    clearPersona?: (memberId: string) => void;
    getState?: () => DustlandGameSnapshot | undefined;
    updateState?: (updater: (state: DustlandGameSnapshot) => void) => void;
    [key: string]: unknown;
  }

  interface DustlandModuleInstance {
    postLoad?: (
      moduleData: DustlandModuleInstance,
      context?: { phase?: string; [key: string]: unknown }
    ) => void;
    start?: { map: string; x: number; y: number } | null;
    templates?: Array<{
      id?: string;
      color?: string;
      name?: string;
      desc?: string;
      combat?: Record<string, unknown>;
      [key: string]: unknown;
    }>;
    npcs?: DustlandNpc[];
    [key: string]: unknown;
  }

  interface DustlandEventBus {
    on(event: string, handler: (...args: unknown[]) => void): void;
    off(event: string, handler: (...args: unknown[]) => void): void;
    emit(event: string, payload?: unknown): void;
  }

  interface GameItemUse {
    type: string;
    amount?: number;
    duration?: number;
    stat?: string;
    text?: string;
    onUse?: (...args: unknown[]) => unknown;
  }

  interface GameItem {
    id: string;
    name: string;
    type: string;
    mods?: Record<string, number>;
    use?: GameItemUse;
    desc?: string;
    rarity?: number;
    value?: number;
    [key: string]: unknown;
  }

  type QuestStatus = 'available' | 'active' | 'completed';

  interface QuestState {
    id: string;
    status: QuestStatus;
  }

  interface Quest {
    id: string;
    name: string;
    status: QuestStatus;
    desc?: string;
    onStart?: (...args: unknown[]) => unknown;
    onComplete?: (...args: unknown[]) => unknown;
    [key: string]: unknown;
  }

  interface DustlandMapEnemy {
    name: string;
    HP?: number;
    DEF?: number;
    loot?: string;
    [key: string]: unknown;
  }

  interface DustlandMap {
    id: string;
    w: number;
    h: number;
    grid: number[][];
    entryX?: number;
    entryY?: number;
    name?: string;
    enemies?: DustlandMapEnemy[];
    [key: string]: unknown;
  }

  type DustlandCheckHandler = (...args: unknown[]) => unknown;

  interface DustlandCheck {
    stat: string;
    dc: number;
    onSuccess?: DustlandCheckHandler[];
    onFail?: DustlandCheckHandler[];
    [key: string]: unknown;
  }

  type CombatResult = 'bruise' | 'loot' | 'flee';

  interface CombatOutcome {
    result: CombatResult;
    [key: string]: unknown;
  }

  interface CombatTarget {
    HP?: number;
    DEF: number;
    loot?: GameItem;
    name?: string;
    npc?: DustlandNpc;
    [key: string]: unknown;
  }

  interface CombatParticipant {
    id?: string;
    name: string;
    hp: number;
    npc?: DustlandNpc;
    portraitSheet?: string;
    portraitLock?: boolean;
    prompt?: string;
    special?: unknown;
    [key: string]: unknown;
  }

  interface DustlandNamespace {
    starterItems?: StarterItem[];
    Wizard?: WizardFactory;
    WizardSteps?: WizardStepsRegistry;
    wizards?: Record<string, WizardDefinition>;
    effects?: DustlandEffectsApi;
    inventory?: DustlandInventoryApi;
    profiles?: DustlandProfilesApi;
    personaTemplates?: Record<string, DustlandPersonaTemplate>;
    gameState?: DustlandGameState;
    eventBus?: DustlandEventBus;
    eventFlags?: {
      watch?: (event: string, flag: string) => void;
      clear?: (flag: string) => void;
      [key: string]: unknown;
    };
    zoneEffects?: DustlandZoneEffect[];
    weather?: {
      getWeather?: () => DustlandWeatherState;
      setWeather?: (next: Partial<DustlandWeatherState>) => DustlandWeatherState;
    };
    status?: { init?: (member: PartyMember) => void };
    actions?: Record<string, unknown>;
    validateDialogTree?: (tree: Record<string, DustlandDialogNode>) => string[];
    effectPackInspector?: { load: (text: string) => void; fire: (evt: string) => void };
    BuildingWizard?: unknown;
    updateTradeUI?: (trader: unknown) => void;
    bunkers?: Array<{ id?: string; active?: boolean; [key: string]: unknown }>;
    [key: string]: unknown;
  }

  interface AckNavigationConfig {
    enabled?: boolean;
    [key: string]: unknown;
  }

  interface AckConfig {
    navigation?: AckNavigationConfig;
    [key: string]: unknown;
  }

  interface AckGlobal {
    config?: AckConfig;
    [key: string]: unknown;
  }

  type PartyFlags = Record<string, boolean | number | string | undefined>;

  type PartySpecialEntry =
    | string
    | {
        id?: string;
        name?: string;
        label?: string;
        [key: string]: unknown;
      };

  interface PartyItem extends GameItem {
    mods?: {
      [key: string]: unknown;
      adrenaline_gen_mod?: number;
      adrenaline_dmg_mod?: number;
      granted_special?: PartySpecialEntry | PartySpecialEntry[];
    };
  }

  interface PartyEquipmentSlots {
    weapon: PartyItem | null;
    armor: PartyItem | null;
    trinket: PartyItem | null;
  }

  interface PartyMember {
    id: string;
    name: string;
    role: string;
    permanent: boolean;
    portraitSheet: string | null;
    lvl: number;
    xp: number;
    skillPoints: number;
    stats: Record<string, number>;
    equip: PartyEquipmentSlots;
    maxHp: number;
    hp: number;
    ap: number;
    maxAdr: number;
    adr: number;
    _bonus: Record<string, number>;
    special: PartySpecialEntry[];
    adrGenMod: number;
    adrDmgMod: number;
    cooldowns: Record<string, number>;
    guard: number;
    statusEffects: Array<Record<string, unknown>>;
    persona?: string;
    _baseSpecial?: PartySpecialEntry[];
    quirk?: string | null;
    hydration?: number;
    [key: string]: unknown;
  }

  interface Party extends Array<PartyMember> {
    map: string;
    x: number;
    y: number;
    flags: PartyFlags;
    fallen: PartyMember[];
    _roster: PartyMember[] | null;
  }

  interface DustlandNpc {
    id?: string;
    map?: string;
    x?: number;
    y?: number;
    color?: string;
    name?: string;
    title?: string;
    tree?: Record<string, unknown>;
    quest?: Quest;
    onMemoryTape?: (recording: string | null) => void;
    [key: string]: unknown;
  }

  interface MemoryTapeItem {
    recording?: string | null;
    [key: string]: unknown;
  }

  function registerItem<T>(item: T): T;

  interface GlobalThis {
    Dustland?: DustlandNamespace;
    ACK?: AckGlobal;
    UI?: DustlandUiApi;
    TRAINER_UPGRADE_SCHEMA?: JsonSchema;
    TRAINER_UPGRADES?: TrainerUpgradeMap;
    eventBus?: DustlandEventBus;
    EventBus?: DustlandEventBus;
    party?: Party;
    player?: { scrap?: number; [key: string]: unknown };
    CURRENCY?: string;
    NPCS?: DustlandNpc[];
    DUSTLAND_MODULE?: DustlandModuleInstance;
    LOOTBOX_DEMO_MODULE?: DustlandModuleInstance;
    applyModule?: (moduleData: unknown) => void;
    loadModule?: (moduleData: unknown) => Promise<void> | void;
    setPartyPos?: (x: number, y: number) => void;
    setMap?: (map: string, label?: string) => void;
    toast?: (message: string) => void;
    updateHUD?: () => void;
    checkFlagCondition?: (condition: unknown) => boolean;
    leader?: () => unknown;
    awardXP?: (target: unknown, amount: number) => void;
    resolveItem?: (reward: unknown) => { name?: string } | null;
    addToInv?: (item: unknown) => boolean;
    dropItemNearParty?: (item: unknown) => void;
    startCombat?: (defender: CombatTarget) => Promise<CombatOutcome> | CombatOutcome;
    log?: (message: string, type?: string) => void;
    ENGINE_VERSION: string;
    WORLD_W?: number;
    WORLD_H?: number;
    clamp: (value: number, min: number, max: number) => number;
    incFlag?: (flag: string, delta?: number) => void;
    flagValue?: (flag: string) => number;
    setFlag?: (flag: string, value: number | string | boolean) => void;
    ItemGen?: {
      statRanges: Record<string, { min: number; max: number }>;
      generate(rank: string): { stats: { power: number } };
    };
    seedWorldContent?: () => void;
    startGame?: () => void;
    memoryTape?: MemoryTapeItem;
    openDialog?: (dialog: unknown) => void;
    openCombat?: (enemies: CombatParticipant[]) => Promise<CombatOutcome | null | undefined>;
    selectedMember?: number;
    tileEmoji?: Readonly<Record<number, string>>;
    emojiTile?: Readonly<Record<string, number>>;
    gridFromEmoji?: (rows: string[]) => number[][];
    gridToEmoji?: (grid: number[][]) => string[];
    getViewSize?: () => { w: number; h: number };
    showStart?: () => void;
    hideStart?: () => void;
    openCreator?: () => void;
    closeCreator?: () => void;
    resetAll?: () => void;
    moduleData?: DustlandModuleInstance | null;
    modulePickerPending?: boolean;
    perfStats?: { tiles?: number; sfx?: number; [key: string]: number | undefined };
    fxConfig?: Record<string, unknown> | null;
    DustlandSkin?: unknown;
    fogOfWarEnabled?: boolean;
    toggleAudio?: () => void;
    toggleTileChars?: () => void;
    toggleFogOfWar?: () => void;
    tileChars?: Readonly<Record<number | string, string>>;
    jitterColor?: (hex: string, x: number, y: number) => string;
    playerAdrenalineFx?: {
      intensity: number;
      scale: number;
      hueShift: number;
      saturation: number;
      brightness: number;
      glow: number;
    };
    footstepBump?: () => void;
    pickupSparkle?: (x: number, y: number) => void;
    pickupVacuum?: (fromX: number, fromY: number, toX?: number, toY?: number) => void;
    openShop?: (shop: unknown) => void;
    playFX?: (type: string) => void;
    postLoad?: (moduleData: DustlandModuleInstance) => void;
    openWorldMap?: (source?: string) => void;
    healAll?: () => void;
    params?: URLSearchParams;
    state?: { map?: string; [key: string]: unknown };
  }

  function log(message: string, type?: string): void;
  function toast(message: string): void;
  function renderParty(): void;
  function updateHUD(): void;
  function hudBadge(message: string): void;
  function hasItem(itemId: string): boolean;
  function makeNPC(
    id: string,
    map: string,
    x: number,
    y: number,
    color: string,
    name: string,
    title: string,
    desc: string,
    tree: Record<string, unknown>,
    quest?: unknown,
    processNode?: unknown,
    processChoice?: unknown,
    opts?: unknown
  ): DustlandNpc;
  function renderInv(): void;
  function calcItemValue(item: unknown, member?: unknown): number;
  function equipItem(memberIndex: number, itemIndex: number): void;
  function findItemIndex(id: string): number;
  function removeFromInv(index: number, quantity?: number): void;
  function getSpecialization(id: string): unknown;
  function getClassSpecials(id: string): unknown;
  function getQuirk(id: string): unknown;
  function renderQuests(): void;
  function applyModule(moduleData: unknown): void;
  function setPartyPos(x: number, y: number): void;
  function setMap(map: string, label?: string): void;
  function setFlag(flag: string, value: number | string | boolean): void;
  function incFlag(flag: string, delta?: number): void;
  function flagValue(flag: string): number;
}
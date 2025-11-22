import type { DustlandFeatureFlags } from './scripts/ack/server-mode-types.js';

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

  type DustlandSkinVarValue = string | number | null | undefined;

  interface DustlandSkinUi extends Record<string, Record<string, unknown> | undefined> {
    vars?: Record<string, DustlandSkinVarValue>;
    slots?: Record<string, Record<string, unknown>> | null;
  }

  interface DustlandSkin {
    id: string;
    label: string;
    cssVars?: Record<string, DustlandSkinVarValue>;
    ui?: DustlandSkinUi | null;
    tiles?: Record<string, unknown> | null;
    icons?: Record<string, unknown> | null;
    map?: Record<string, unknown> | null;
    meta?: Record<string, unknown> | null;
    [section: string]: unknown;
  }

  interface DustlandSkinFrameState {
    color: string | null;
    lineWidth: string | number | null;
  }

  interface DustlandSkinApi {
    applySkin: (input: string | DustlandSkin | null | undefined) => void;
    registerSkin: (skin: DustlandSkin | null | undefined) => DustlandSkin | null;
    registerGeneratedSkin: (name: string, input?: Record<string, unknown> | null) => Record<string, unknown> | null;
    loadGeneratedSkin: (name: string, input?: Record<string, unknown> | null) => DustlandSkin | null;
    listGeneratedSkins: () => string[];
    getGeneratedSkinConfig: (name: string) => Record<string, unknown> | null;
    getRegisteredSkin: (id: string) => DustlandSkin | null;
    getCurrentSkin: () => DustlandSkin | null;
    getTileSprite: (tileId: string | number, context?: Record<string, unknown>) => unknown;
    getItemSprite: (item: Record<string, unknown> | null | undefined, context?: Record<string, unknown>) => unknown;
    getEntitySprite: (entity: Record<string, unknown> | null | undefined) => unknown;
    getPlayerSprite: (playerInfo: Record<string, unknown> | null | undefined, context?: Record<string, unknown>) => unknown;
    getRemotePartySprite: (info: Record<string, unknown> | null | undefined) => unknown;
    getMapFrame: () => DustlandSkinFrameState | null;
    onChange: (fn: (skin: DustlandSkin | null) => void) => () => void;
    offChange: (fn: (skin: DustlandSkin | null) => void) => void;
    reset: () => void;
  }

  interface DustlandEffectsApi {
    apply: (list?: unknown[], ctx?: Record<string, unknown>) => void;
    reset?: () => void;
    tick?: (ctx?: Record<string, unknown>) => void;
  }

  interface DustlandInventoryApi {
    getCampChest?: () => unknown[];
    withdrawCampChestItem?: (index: number) => boolean | void;
    storeCampChestItem?: (index: number) => boolean | void;
    isCampChestUnlocked?: () => boolean;
    unlockCampChest?: () => void;
  }

  interface DustlandSoundSource {
    id?: string;
    x: number;
    y: number;
    map?: string;
    [key: string]: unknown;
  }

  interface DustlandTrainerUi {
    showTrainer: (id: string) => boolean;
    applyUpgrade: (trainerId: string, upgradeId: string) => boolean;
  }

  interface DustlandSpoilsCacheApi {
    ranks?: Record<string, { name?: string; desc?: string; icon?: string }>;
    create: (rank: string) => { id: string; rank?: string; [key: string]: unknown };
    pickRank: (challenge: number, rng?: () => number) => string;
    rollDrop: (challenge: number, rng?: () => number) => unknown;
    renderIcon: (rank: string, onOpen?: () => void) => HTMLElement | null;
    open: (rank: string, rng?: () => number) => unknown;
    openAll: (rank: string, rng?: () => number) => number;
    [key: string]: unknown;
  }

  interface DustlandItemDrop {
    map: string;
    x: number;
    y: number;
    id?: string;
    items?: string[];
    dropType?: 'world' | 'loot' | string;
    worldTurn?: number;
    [key: string]: unknown;
  }

  interface DustlandPortal {
    map?: string;
    x?: number;
    y?: number;
    toMap?: string;
    toX?: number;
    toY?: number;
    [key: string]: unknown;
  }

  interface DustlandBuilding {
    interiorId?: string | null;
    bunkerId?: string;
    boarded?: boolean;
    map?: string;
    x?: number;
    y?: number;
    [key: string]: unknown;
  }

  interface DustlandCoreState {
    map: string;
    mapFlags: Record<string, unknown>;
    fog: Record<string, unknown>;
    mapEntry?: { map: string; x: number; y: number } | null;
    [key: string]: unknown;
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

  interface DustlandDialogGoto {
    map?: string;
    x?: number;
    y?: number;
    target?: 'npc' | 'player';
    rel?: boolean;
    [key: string]: unknown;
  }

  interface DustlandDialogChoiceConfig {
    label?: string;
    [key: string]: unknown;
  }

  interface DustlandDialogChoice {
    id?: string;
    to?: string;
    label?: string;
    text?: string;
    q?: string;
    goto?: DustlandDialogGoto;
    reqItem?: string;
    reqSlot?: string;
    reqTag?: string;
    reqCount?: number;
    costItem?: string;
    costSlot?: string;
    costTag?: string;
    costCount?: number;
    reward?: unknown;
    join?: Record<string, unknown>;
    failure?: string;
    success?: string;
    effects?: unknown[];
    checks?: unknown[];
    check?: { stat?: string; dc?: number; [key: string]: unknown };
    once?: boolean;
    if?: unknown;
    ifOnce?: { node?: string; label?: string; used?: boolean };
    spawn?: {
      templateId: string;
      x: number;
      y: number;
      challenge?: number;
      [key: string]: unknown;
    };
    applyModule?: string;
    setFlag?: { flag: string; op?: 'set' | 'add' | 'clear'; value?: unknown };
    [key: string]: unknown;
  }

  interface DustlandDialogJumpTarget {
    to?: string;
    if?: unknown;
    [key: string]: unknown;
  }

  interface DustlandDialogNode {
    text?: string;
    checks?: Array<unknown>;
    effects?: Array<unknown>;
    next?: Array<string | DustlandDialogChoice>;
    choices?: Array<string | DustlandDialogChoice>;
    jump?: DustlandDialogJumpTarget[] | DustlandDialogJumpTarget | null;
    noLeave?: boolean;
    [key: string]: unknown;
  }

  type DustlandDialogTree = Record<string, DustlandDialogNode> & {
    locked?: DustlandDialogNode;
  };

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
    world?: Record<string, unknown>;
    inventory?: PartyItem[];
    flags?: Record<string, unknown>;
    clock?: number;
    quests?: QuestState[];
    difficulty?: string;
    effectPacks?: Record<string, unknown[]>;
    npcMemory?: Record<string, Record<string, unknown>>;
    [key: string]: unknown;
  }

  interface DustlandGameState {
    setPersona?: (id: string, template: DustlandPersonaTemplate) => void;
    getPersona?: (id: string) => DustlandPersonaTemplate | undefined;
    applyPersona?: (memberId: string, personaId: string) => void;
    clearPersona?: (memberId: string) => void;
    getState?: () => DustlandGameSnapshot | undefined;
    updateState?: (updater: (state: DustlandGameSnapshot) => void) => void;
    getDifficulty?: () => string | undefined;
    setDifficulty?: (mode: string) => void;
    addEffectPack?: (event: string, list: unknown[]) => void;
    loadEffectPacks?: (packs?: Record<string, unknown[]>) => void;
    rememberNPC?: (id: string, key: string, value: unknown) => void;
    recallNPC?: (id: string, key: string) => unknown;
    forgetNPC?: (id: string, key?: string) => void;
    [key: string]: unknown;
  }

  interface DustlandArenaVulnerability {
    items?: string | string[];
    matchDef?: number;
    missDef?: number;
    defMod?: { match?: number; miss?: number };
    successLog?: string;
    failLog?: string;
    [key: string]: unknown;
  }

  interface DustlandArenaWave {
    templateId?: string;
    count?: number;
    bankChallenge?: number;
    prompt?: string;
    announce?: string;
    toast?: string;
    vulnerability?: DustlandArenaVulnerability;
    [key: string]: unknown;
  }

  interface DustlandArenaReward {
    log?: string;
    toast?: string;
    [key: string]: unknown;
  }

  interface DustlandArenaConfig {
    map?: string;
    bankId?: string;
    waves?: DustlandArenaWave[];
    reward?: DustlandArenaReward;
    entranceDelay?: number;
    resetLog?: string;
    [key: string]: unknown;
  }

  interface DustlandStepUnlockBehavior {
    map?: string;
    x?: number;
    y?: number;
    steps?: number;
    tile?: number | string;
    log?: string;
    toast?: string;
    portal?: DustlandPortal;
    [key: string]: unknown;
  }

  type DustlandBehaviorCondition =
    | { type: 'npcExists'; npcId?: string }
    | { type: 'flag'; flag: string; value?: number; op?: '>=' | '>' | '<=' | '<' | '==' | '=' | '!=' }
    | { type?: string; [key: string]: unknown };

  interface DustlandDialogVariant {
    condition?: DustlandBehaviorCondition;
    text?: string;
    [key: string]: unknown;
  }

  interface DustlandDialogMutation {
    npcId?: string;
    nodeId?: string;
    defaultText?: string;
    variants?: DustlandDialogVariant[];
    [key: string]: unknown;
  }

  interface DustlandMemoryTapeBehavior {
    npcId?: string;
    log?: string;
    logPrefix?: string;
    [key: string]: unknown;
  }

  interface DustlandModuleBehaviors {
    stepUnlocks?: DustlandStepUnlockBehavior[] | null;
    arenas?: DustlandArenaConfig[] | null;
    memoryTapes?: DustlandMemoryTapeBehavior[] | null;
    dialogMutations?: DustlandDialogMutation[] | null;
    [key: string]: unknown;
  }

  interface DustlandBehaviorArenaState {
    wave?: number;
    cleared?: boolean;
    [key: string]: unknown;
  }

  interface DustlandEnemyBankEntry {
    templateId?: string;
    count?: number;
    challenge?: number;
    [key: string]: unknown;
  }

  type DustlandEnemyBanks = Record<string, DustlandEnemyBankEntry[]>;

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
    portals?: DustlandPortal[] | null;
    interiors?: Array<{
      id?: string;
      w?: number;
      h?: number;
      grid?: unknown;
      entryX?: number;
      entryY?: number;
      [key: string]: unknown;
    }> | null;
    props?: Record<string, unknown> | null;
    behaviors?: DustlandModuleBehaviors | null;
    effects?: Record<string, unknown>;
    [key: string]: unknown;
  }

  type OtherBasModuleInstance = DustlandModuleInstance & {
    start: { map: string; x: number; y: number };
    listing?: string;
  };

  interface PersonaEventPayload {
    memberId: string;
    personaId: string;
    [key: string]: unknown;
  }

  interface QuestCompletedPayload {
    quest: unknown;
    [key: string]: unknown;
  }

  interface QuestCheckpointPayload {
    questId?: string;
    stage?: string;
    [key: string]: unknown;
  }

  interface SpoilsDropPayload {
    cache?: unknown;
    target?: unknown;
    [key: string]: unknown;
  }

  interface SpoilsOpenedPayload {
    rank?: string | number | null | undefined;
    item?: unknown;
    [key: string]: unknown;
  }

  interface SkinChangedPayload {
    skin?: DustlandSkin | null;
    [key: string]: unknown;
  }

  interface MusicMoodPayload {
    id: string | null;
    source?: string;
    priority?: number;
    [key: string]: unknown;
  }

  interface MovementEventPayload {
    map?: string;
    x?: number;
    y?: number;
    [key: string]: unknown;
  }

  type PartySelectedPayload = PartyMember | number | null | undefined;

  interface DustlandEventPayloads {
    'state:changed': DustlandGameSnapshot;
    'persona:equip': PersonaEventPayload;
    'persona:unequip': PersonaEventPayload;
    'quest:completed': QuestCompletedPayload;
    'quest:checkpoint': QuestCheckpointPayload;
    'spoils:drop': SpoilsDropPayload;
    'spoils:opened': SpoilsOpenedPayload;
    'skin:changed': SkinChangedPayload;
    'combat:started': undefined;
    'combat:ended': { result?: CombatOutcome | string | null | undefined };
    'combat:event': { type?: string; [key: string]: unknown } | unknown;
    'combat:telemetry': unknown;
    'enemy:defeated': { target?: unknown; [key: string]: unknown } | unknown;
    'movement:player': MovementEventPayload;
    'music:mood': MusicMoodPayload;
    'party:selected': PartySelectedPayload;
    'sfx': string | { id?: string; [key: string]: unknown };
    'weather:change': DustlandWeatherState;
    [event: string]: unknown | undefined;
  }

  type DustlandEventName = Extract<keyof DustlandEventPayloads, string>;

  type DustlandEventHandler<E extends DustlandEventName = DustlandEventName> = (
    payload: DustlandEventPayloads[E]
  ) => void;

  interface DustlandEventBus {
    on<E extends DustlandEventName>(event: E, handler: DustlandEventHandler<E>): void;
    off<E extends DustlandEventName>(event: E, handler: DustlandEventHandler<E>): void;
    emit<E extends DustlandEventName>(event: E, payload?: DustlandEventPayloads[E]): void;
  }

  interface GameItemTeleportTarget {
    x: number;
    y: number;
    map?: string;
  }

  interface GameItemEquipRequirements {
    role?: string;
    roles?: string[];
    [key: string]: unknown;
  }

  interface GameItemEquip {
    minLevel?: number;
    requires?: GameItemEquipRequirements;
    teleport?: GameItemTeleportTarget;
    flag?: string;
    msg?: string;
    [key: string]: unknown;
  }

  interface GameItemUnequip {
    teleport?: GameItemTeleportTarget;
    msg?: string;
    [key: string]: unknown;
  }

  interface GameItemNarrative {
    id: string;
    prompt?: string;
    [key: string]: unknown;
  }

  interface GameItemUseContext {
    player?: PlayerState;
    party: Party;
    log?: (message: string) => void;
    toast?: (message: string) => void;
  }

  interface GameItemUse {
    type: string;
    amount?: number;
    duration?: number;
    stat?: string;
    text?: string;
    toast?: string;
    label?: string;
    ignoreDefense?: boolean;
    consume?: boolean;
    target?: string;
    effect?: string | Record<string, unknown>;
    effects?: Array<string | Record<string, unknown>>;
    onUse?: (context: GameItemUseContext) => boolean | void;
    [key: string]: unknown;
  }

  interface GameItem {
    id: string;
    name: string;
    type: string;
    stats?: Record<string, number>;
    mods?: Record<string, number>;
    use?: GameItemUse;
    desc?: string;
    rarity?: number;
    value?: number;
    tags?: string[];
    count?: number;
    maxStack?: number;
    baseId?: string;
    slot?: string;
    fuel?: number;
    equip?: GameItemEquip | null;
    unequip?: GameItemUnequip | null;
    narrative?: GameItemNarrative | null;
    cursed?: boolean;
    cursedKnown?: boolean;
    [key: string]: unknown;
  }

interface ItemGeneratorRange {
    min: number;
    max: number;
  }
  
  type ItemGeneratorRank = 'rusted' | 'sealed' | 'armored' | 'vaulted';
  
  type ItemGeneratorRandomSource = () => number;

  interface GeneratedTrinketItem extends PartyItem {
    rank: string;
    stats: Record<string, number>;
    mods: Record<string, number>;
    scrap: number;
    tags: string[];
    persona?: string;
  }

  interface ItemGenerator {
    adjectives: readonly string[];
    nouns: readonly string[];
    statRanges: Record<string, ItemGeneratorRange> &
      Record<ItemGeneratorRank, ItemGeneratorRange>;
    scrapValues: Record<string, number>;
    statKeys: readonly string[];
    calcScrap: (item: GeneratedTrinketItem) => number;
    pick: <T>(list: readonly T[], rng: ItemGeneratorRandomSource) => T;
    randRange: (min: number, max: number, rng: ItemGeneratorRandomSource) => number;
    generate: (rank?: string, rng?: ItemGeneratorRandomSource) => GeneratedTrinketItem;
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
    progress?: number;
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

  interface DustlandTileset {
    [key: string]: number | undefined;
    ROAD?: number;
    PATH?: number;
    SAND?: number;
    WATER?: number;
    BRUSH?: number;
    ROCK?: number;
    RUIN?: number;
    FLOOR?: number;
    DOOR?: number;
    WALL?: number;
  }

  interface ProceduralMapPoint {
    x: number;
    y: number;
  }

  interface ProceduralRoadSegment {
    from: number;
    to: number;
    path: ProceduralMapPoint[];
    bridges: ProceduralMapPoint[];
    cost?: number;
  }

  interface ProceduralRoadNetwork {
    anchors: ProceduralMapPoint[];
    segments: ProceduralRoadSegment[];
    crossroads: ProceduralMapPoint[];
  }

  interface ProceduralMapFeatures {
    ruins?: ProceduralMapPoint[];
    ruinHubs?: ProceduralMapPoint[];
    [key: string]: unknown;
  }

  interface ProceduralMapResult {
    tiles: number[][];
    regions: ProceduralMapPoint[];
    roads: ProceduralRoadNetwork;
    features: ProceduralMapFeatures;
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

  interface DustlandQuestDialogStage {
    text?: string;
    choice?: DustlandDialogChoiceConfig | string;
    [key: string]: unknown;
  }

  interface DustlandQuestDialogConfig {
    offer?: DustlandQuestDialogStage | string | null;
    accept?: DustlandQuestDialogStage | string | null;
    turnIn?: DustlandQuestDialogStage | string | null;
    active?: DustlandQuestDialogStage | string | null;
    completed?: DustlandQuestDialogStage | string | null;
    [key: string]: unknown;
  }

  interface DustlandNpcQuest {
    status?: QuestStatus | string;
    dialog?: DustlandQuestDialogConfig | string | null;
    item?: string;
    itemTag?: string;
    reqFlag?: string;
    count?: number;
    progress?: number;
    dialogNodes?: unknown[];
    [key: string]: unknown;
  }

  interface DustlandActionsApi {
    applyQuestReward?: (reward: unknown) => void;
    startCombat?: (enemy: CombatParticipant & { [key: string]: unknown }) => void;
    [key: string]: unknown;
  }

  interface DustlandNamespace {
    starterItems?: StarterItem[];
    Wizard?: WizardFactory;
    WizardSteps?: WizardStepsRegistry;
    wizards?: Record<string, WizardDefinition>;
    skin?: DustlandSkinApi;
    effects?: DustlandEffectsApi;
    inventory?: DustlandInventoryApi;
    profiles?: DustlandProfilesApi;
    personaTemplates?: Record<string, DustlandPersonaTemplate>;
    ItemGen?: ItemGenerator;
    gameState?: DustlandGameState;
    eventBus?: DustlandEventBus;
    movement?: {
      buffs?: unknown;
      [key: string]: unknown;
    };
    eventFlags?: {
      watch?: (event: string, flag: string) => void;
      clear?: (flag: string) => void;
      [key: string]: unknown;
    };
    zoneEffects?: DustlandZoneEffect[];
    workbench?: { [key: string]: ((...args: unknown[]) => unknown) | undefined } & {
      craft?: (recipeId: string) => void;
    };
    fastTravel?: {
      activateBunker?: (id?: string) => void;
      [key: string]: unknown;
    };
    behaviors?: {
      setup: (moduleData: DustlandModuleInstance | null | undefined) => void;
      teardown: () => void;
      [key: string]: unknown;
    };
    worldMap?: {
      open?: (source?: string) => void;
      [key: string]: unknown;
    };
    openWorkbench?: () => void;
    weather?: {
      getWeather?: () => DustlandWeatherState;
      setWeather?: (next: Partial<DustlandWeatherState>) => DustlandWeatherState;
    };
    status?: { init?: (member: PartyMember) => void };
    actions?: DustlandActionsApi;
    validateDialogTree?: (tree: Record<string, DustlandDialogNode>) => string[];
    effectPackInspector?: { load: (text: string) => void; fire: (evt: string) => void };
    BuildingWizard?: unknown;
    updateTradeUI?: (trader: unknown) => void;
    bunkers?: Array<{ id?: string; active?: boolean; [key: string]: unknown }>;
    movement?: { buffs?: unknown };
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
    use?: (GameItemUse & { onUse?: (...args: any[]) => boolean | void }) | null;
  }

  interface PartyEquipmentSlots {
    weapon: PartyItem | null;
    armor: PartyItem | null;
    trinket: PartyItem | null;
  }

  interface PlayerState {
    inv: PartyItem[];
    campChest?: PartyItem[];
    campChestUnlocked?: boolean;
    fuel?: number;
    scrap?: number;
    hp?: number;
    maxHp?: number;
    [key: string]: unknown;
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
    applyEquipmentStats?: () => void;
    applyCombatMods?: () => void;
    [key: string]: unknown;
  }

  interface Character extends PartyMember {
    xpToNext(): number;
    awardXP(amount: number): void;
    levelUp(): void;
    applyEquipmentStats(): void;
    applyCombatMods(): void;
  }

  interface Party extends Array<PartyMember> {
    map: string;
    x: number;
    y: number;
    flags: PartyFlags;
    fallen: PartyMember[];
    _roster: PartyMember[] | null;
    setMembers(members: (PartyMember | null | undefined)[] | null | undefined): number;
    addMember(member: PartyMember): boolean;
    leave(member: PartyMember): boolean;
    fall(member: PartyMember): void;
    restore(): void;
    healAll(): void;
    leader(): PartyMember | undefined;
  }

  interface DustlandNpc {
    id?: string;
    map?: string;
    x?: number;
    y?: number;
    color?: string;
    name?: string;
    title?: string;
    desc?: string;
    portraitSheet?: string;
    portraitLock?: boolean;
    locked?: boolean;
    unlockTime?: number | null;
    overrideColor?: boolean;
    tree?:
      | DustlandDialogTree
      | Record<string, unknown>
      | (() => DustlandDialogTree | Record<string, unknown> | null | undefined)
      | null;
    quest?: Quest | DustlandNpcQuest;
    combat?: {
      xp?: number;
      challenge?: number;
      HP?: number;
      count?: number;
      [key: string]: unknown;
    };
    _loop?: { path?: unknown[]; job?: unknown };
    onMemoryTape?: (recording: string | null) => void;
    [key: string]: unknown;
  }

  interface DustlandGameRuntimeState {
    map: string;
    [key: string]: unknown;
  }

  interface DustlandNpcTemplate extends DustlandNpc {
    id: string;
  }

  interface DustlandQuestProcessorResult {
    blocked?: boolean;
    message?: string;
    [key: string]: unknown;
  }

  interface DustlandEventBusApi {
    emit?: (event: string, payload?: unknown) => void;
    [key: string]: unknown;
  }

  interface DustlandGlobalHelpers {
    ensureDustland(): DustlandNamespace;
    getDustland(): DustlandNamespace | undefined;
    getEventBus(): DustlandEventBus | undefined;
    getParty(): Party | undefined;
    getPlayer(): PlayerState | undefined;
    getNpcRoster(): DustlandNpc[];
    getPersonaTemplates(): Record<string, DustlandPersonaTemplate>;
    setItemGenerator(generator: ItemGenerator): ItemGenerator;
  }

  var DustlandGlobals: DustlandGlobalHelpers;

  const Dice: {
    skill: (
      actor: PartyMember,
      stat?: string,
      bonus?: number,
      sides?: number,
      rng?: () => number
    ) => number;
  };

  const ROLL_SIDES: number;

  const log: ((message: string) => void) | undefined;

  let rng: () => number;

  const GAME_STATE: { [key: string]: number } & {
    WORLD: number;
    INTERIOR: number;
    DIALOG: number;
  };

  var EventBus: DustlandEventBus;
  var state:
    | (DustlandCoreState & {
        arenas?: Record<string, DustlandBehaviorArenaState | undefined>;
      })
    | undefined;

  interface MemoryTapeItem {
    recording?: string | null;
    [key: string]: unknown;
  }

  function registerItem<T>(item: T): T;

  interface GlobalThis {
    Dustland?: DustlandNamespace;
    DustlandSkin?: DustlandSkinApi;
    loadSkin?: (name: string, options?: Record<string, unknown> | null) => DustlandSkin | null;
    ACK?: AckGlobal;
    UI?: DustlandUiApi;
    TRAINER_UPGRADE_SCHEMA?: JsonSchema;
    TRAINER_UPGRADES?: TrainerUpgradeMap;
    eventBus?: DustlandEventBus;
    EventBus?: DustlandEventBus;
    party?: Party;
    player?: PlayerState;
    DustlandGlobals?: DustlandGlobalHelpers;
    CURRENCY?: string;
    NPCS?: DustlandNpc[];
    npcTemplates?: DustlandNpcTemplate[];
    world?: DustlandMap[];
    DUSTLAND_MODULE?: DustlandModuleInstance;
    LOOTBOX_DEMO_MODULE?: DustlandModuleInstance;
    OTHER_BAS_MODULE?: OtherBasModuleInstance;
    applyModule?: (moduleData: unknown) => void;
    loadModule?: (moduleData: unknown) => Promise<void> | void;
    setPartyPos?: (x: number, y: number) => void;
    setMap?: (map: string, label?: string) => void;
    toast?: (message: string) => void;
    updateHUD?: () => void;
    checkFlagCondition?: (condition: unknown) => boolean;
    leader?: () => PartyMember | undefined;
    awardXP?: (target: unknown, amount: number) => void;
    resolveItem?: (reward: unknown) => { name?: string } | null;
    addToInv?: (item: unknown) => boolean;
    ITEMS?: Record<string, GameItem>;
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
    queueNanoDialogForNPCs?: (nodeId?: string, reason?: string, map?: string) => void;
    textEl?: HTMLElement | null;
    choicesEl?: HTMLElement | null;
    closeDialog?: () => void;
    defaultQuestProcessor?: (
      npc: DustlandNpc | null | undefined,
      action: string
    ) => DustlandQuestProcessorResult | null | undefined;
    makeMember?: (
      id?: string,
      name?: string,
      role?: string,
      options?: Record<string, unknown>
    ) => PartyMember;
    joinParty?: (member: PartyMember) => boolean;
    removeNPC?: (npc: DustlandNpc | null | undefined) => void;
    countItems?: (idOrTag: string) => number;
    findItemIndex?: (idOrTag: string) => number;
    removeFromInv?: (index: number, quantity?: number) => void;
    hasItem?: (idOrTag: string) => boolean;
    makeNPC?: (
      id: string,
      mapId: string,
      x: number,
      y: number,
      color?: string,
      name?: string,
      title?: string,
      desc?: string,
      tree?: Record<string, unknown> | null,
      quest?: DustlandNpcQuest | null,
      dialog?: unknown,
      extra?: unknown,
      options?: Record<string, unknown>
    ) => DustlandNpc;
    setGameState?: (next: number) => void;
    trackQuestDialogNode?: (npcId: string, nodeId: string) => void;
    setPortraitDiv?: (element: HTMLElement, npc: DustlandNpc) => void;
    persistLlmNodes?: (tree: DustlandDialogTree | null | undefined) => void;
    ItemGen?: ItemGenerator;
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
    state?: (DustlandCoreState & {
      arenas?: Record<string, DustlandBehaviorArenaState | undefined>;
    }) | null;
    enemyBanks?: DustlandEnemyBanks;
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
    playerItemAOEDamage?: (
      member: PartyMember,
      damage: number,
      options: { label?: string; ignoreDefense?: boolean }
    ) => void;
    applyEquipmentStats?: (member: PartyMember) => void;
    applyCombatMods?: (member: PartyMember) => void;
    openShop?: (shop: unknown) => void;
    playFX?: (type: string) => void;
    postLoad?: (moduleData: DustlandModuleInstance) => void;
    openWorldMap?: (source?: string) => void;
    openWorkbench?: () => void;
    healAll?: () => void;
    params?: URLSearchParams;
    state?: DustlandCoreState;
    portals?: DustlandPortal[];
    buildings?: DustlandBuilding[];
    currentNPC?: DustlandNpc | null;
    TILE?: DustlandTileset;
    generateHeightField?: (
      seed: string | number,
      size: number,
      scale: number,
      falloff?: number
    ) => number[][];
    heightFieldToTiles?: (field: number[][]) => number[][];
    refineTiles?: (tiles: number[][], iterations?: number) => number[][];
    findRegionCenters?: (tiles: number[][]) => ProceduralMapPoint[];
    connectRegionCenters?: (
      tiles: number[][],
      field: number[][],
      centers: ProceduralMapPoint[] | null | undefined,
      seed?: string | number
    ) => ProceduralRoadNetwork;
    carveRoads?: (
      tiles: number[][],
      network?: ProceduralRoadNetwork | null
    ) => ProceduralRoadNetwork;
    scatterRuins?: (
      tiles: number[][],
      seed?: string | number
    ) => { tiles: number[][]; ruins: ProceduralMapPoint[]; hubs: ProceduralMapPoint[] };
    exportMap?: (data: unknown, path?: string) => Promise<void> | void;
    generateProceduralMap?: (
      seed: string | number,
      width: number,
      height: number,
      scale?: number,
      falloff?: number,
      features?: { roads?: boolean; ruins?: boolean }
    ) => ProceduralMapResult;
    TrainerUI?: DustlandTrainerUi;
    SpoilsCache?: DustlandSpoilsCacheApi;
    itemDrops?: DustlandItemDrop[];
    soundSources?: DustlandSoundSource[];
    revealHiddenNPCs?: () => void;
    Effects?: DustlandEffectsApi;
  }

  let __combatState:
    | { enemies?: Array<{ name?: string; DEF?: number; hp: number; [key: string]: unknown }>; [key: string]: unknown }
    | undefined;

  function log(message: string, type?: string): void;
  function toast(message: string): void;
  function renderParty(): void;
  function updateHUD(): void;
  function hudBadge(message: string): void;
  function hasItem(itemId: string): boolean;
  function revealHiddenNPCs(): void;
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
  function countItems(id: string): number;
  function findItemIndex(id: string): number;
  function removeFromInv(index: number, quantity?: number): void;
  function getSpecialization(id: string): unknown;
  function getClassSpecials(id: string): unknown;
  function getQuirk(id: string): unknown;
  function renderQuests(): void;
  function queueNanoDialogForNPCs(nodeId?: string, reason?: string, map?: string): void;
  function applyModule(moduleData: unknown): void;
  function setPartyPos(x: number, y: number): void;
  function setMap(map: string, label?: string): void;
  function setFlag(flag: string, value: number | string | boolean): void;
  function incFlag(flag: string, delta?: number): void;
  function flagValue(flag: string): number;
  function gridFor(map: string): number[][] | null | undefined;
  function setTile(map: string, x: number, y: number, tile: number): void;
  function getTile(map: string, x: number, y: number): number;
  function mapWH(map: string): { W: number; H: number } | null | undefined;
  function centerCamera(x: number, y: number, map?: string): void;
  function render(gameState?: unknown, dt?: unknown): void;

  type AckModuleData = Record<string, unknown> & {
    world?: number[][];
    interiors?: Array<Record<string, unknown>>;
  };

  interface AckGlobalsSnapshot {
    moduleData?: AckModuleData;
    interiors?: Record<string, any>;
    world?: number[][];
    EventBus?: DustlandEventBus;
    eventBus?: DustlandEventBus;
    TILE?: Record<string, number>;
    tileEmoji?: Record<number, string>;
    emojiTile?: Record<string, number>;
  }

  interface Window {
    DUSTLAND_FEATURES?: DustlandFeatureFlags | null;
    DUSTLAND_FIREBASE?: Record<string, unknown> | null;
    Dustland?: DustlandNamespace;
    hasItem?: (...args: unknown[]) => boolean;
  }

  interface GlobalThis {
    Dustland?: DustlandNamespace;
    hasItem?: (...args: unknown[]) => boolean;
    EventBus?: DustlandEventBus;
    eventBus?: DustlandEventBus;
    moduleData?: AckModuleData;
    interiors?: Record<string, any>;
    world?: number[][];
    TILE?: Record<string, number>;
    tileEmoji?: Record<number, string>;
    emojiTile?: Record<string, number>;
  }

  var Dustland: DustlandNamespace | undefined;
}

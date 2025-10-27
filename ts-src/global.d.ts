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

  interface DustlandZoneEffect {
    if?: unknown;
    map?: string;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
    dry?: boolean;
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

  interface DustlandGameState {
    setPersona?: (id: string, template: DustlandPersonaTemplate) => void;
    [key: string]: unknown;
  }

  interface DustlandEventBus {
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    emit?: (event: string, payload?: unknown) => void;
    [key: string]: unknown;
  }

  interface DustlandNamespace {
    starterItems?: StarterItem[];
    Wizard?: WizardFactory;
    WizardSteps?: WizardStepsRegistry;
    wizards?: Record<string, WizardDefinition>;
    effects?: DustlandEffectsApi;
    profiles?: DustlandProfilesApi;
    personaTemplates?: Record<string, DustlandPersonaTemplate>;
    gameState?: DustlandGameState;
    eventBus?: DustlandEventBus;
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

  interface PartyItem {
    id: string;
    name: string;
    type: string;
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
    map?: string;
    x?: number;
    y?: number;
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
    TRAINER_UPGRADE_SCHEMA?: JsonSchema;
    TRAINER_UPGRADES?: TrainerUpgradeMap;
    eventBus?: DustlandEventBus;
    party?: Party;
    player?: { scrap?: number; [key: string]: unknown };
    CURRENCY?: string;
    NPCS?: DustlandNpc[];
    DUSTLAND_MODULE?: { postLoad?: (moduleData: unknown) => void };
    applyModule?: (moduleData: unknown) => void;
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
    startCombat?: (defender: unknown) => unknown;
    log?: (message: string, type?: string) => void;
    ENGINE_VERSION: string;
    WORLD_W?: number;
    WORLD_H?: number;
    clamp: (value: number, min: number, max: number) => number;
    incFlag?: (flag: string, delta?: number) => void;
    flagValue?: (flag: string) => number;
    ItemGen?: {
      statRanges: Record<string, { min: number; max: number }>;
      generate(rank: string): { stats: { power: number } };
    };
    seedWorldContent?: () => void;
    startGame?: () => void;
    memoryTape?: MemoryTapeItem;
    openDialog?: (dialog: unknown) => void;
    selectedMember?: number;
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
}
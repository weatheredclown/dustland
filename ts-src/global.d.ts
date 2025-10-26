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

  interface GlobalThis {
    Dustland?: DustlandNamespace;
    ACK?: AckGlobal;
    TRAINER_UPGRADE_SCHEMA?: JsonSchema;
    TRAINER_UPGRADES?: TrainerUpgradeMap;
    EventBus?: DustlandEventBus;
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
  ): unknown;
  function renderInv(): void;
  function calcItemValue(item: unknown, member?: unknown): number;
  function equipItem(memberIndex: number, itemIndex: number): void;
  function findItemIndex(id: string): number;
  function removeFromInv(index: number, quantity?: number): void;
  function getSpecialization(id: string): unknown;
  function getClassSpecials(id: string): unknown;
  function getQuirk(id: string): unknown;
}

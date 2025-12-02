interface DustlandEventBus {
  on?: (event: string, handler: (...args: any[]) => void) => void;
  emit?: (event: string, ...args: any[]) => void;
}

interface WeatherState {
  state: string;
  icon?: string;
  desc?: string;
  speedMod?: number;
  encounterBias?: number | Record<string, number>;
  [key: string]: unknown;
}

interface DustlandNamespace {
  eventBus?: DustlandEventBus;
  currentModule?: string;
  loadedModules?: Record<string, any>;
  zoneEffects?: Array<Record<string, any>>;
  weather?: {
    getWeather?: () => WeatherState;
    setWeather?: (weather: any) => void;
  };
  worldTurns?: number;
  movement?: unknown;
  lastNonCombatKey?: string | null;
}

interface DustlandFeatures {
  serverMode?: boolean;
  [key: string]: unknown;
}

declare global {
  interface DustlandGlobals {
    player?: PlayerState;
    removeFromInv?: (index: number) => void;
    notifyInventoryChanged?: () => void;
    addToInv?: (item: GameItem) => boolean;
    dropItemNearParty?: (item: GameItem) => void;
    ItemGen?: ItemGenerator;
    EventBus?: DustlandEventBus;
    log?: (message: string) => void;
    [key: string]: unknown;
  }

  interface HTMLElement {
    [key: string]: any;
  }

  interface EventTarget {
    [key: string]: any;
  }

  interface KeyboardEvent {
    [key: string]: any;
  }

  interface Event {
    [key: string]: any;
  }

  interface PartyRoster extends Array<any> {
    x: number;
    y: number;
    map: any;
    mapEntry?: { map: string; x: number; y: number } | null;
    flags: any;
    fallen: any[];
    _roster: any;
  }

  var Dustland: DustlandNamespace | undefined;
  var EventBus: DustlandEventBus | undefined;
  var PLAYER: any;
  var ITEM_BANK: Record<string, any>;
  var Enemies: any[];
  var itemDrops: any[];
  var pathQueue: any;
  var pickupVacuum: ((...coords: number[]) => void) | undefined;
  var addToInv: ((item: any, opts?: any) => boolean) | undefined;
  var getItem: ((id: any) => any) | undefined;
  var pickupCache: ((drop: any) => boolean) | undefined;
  var getPartyInventoryCapacity: (() => number) | undefined;
  var openWorldMap: ((id?: any) => void) | undefined;
  var useItem: ((item: any, target?: any) => boolean) | undefined;
  var ITEMS: Record<string, any> | undefined;
  var log: ((message: string, type?: string) => void) | undefined;
  var toast: ((message: string, type?: string) => void) | undefined;
  var showHud: (() => void) | undefined;
  var bossesDefeated: number | undefined;
  var runCount: number | undefined;
  var DUSTLAND_FEATURES: DustlandFeatures | undefined;
  var quests: Record<string, Quest> | undefined;
  var tileEmoji: Record<number, string> | undefined;
  var emojiTile: Record<string, number> | undefined;
  var Mods: Record<string, any> | undefined;
  var TILE: Record<string, number>;
  var PLAYER_SPRITE: any;
  var NanoDialog: { enabled?: boolean; init?: () => Promise<void>; isReady?: () => boolean } | undefined;
  function bootMap(): void;

  interface Window {
    DUSTLAND_FEATURES?: DustlandFeatures;
    seedWorldContent?: () => void;
    bossTelegraphFX?: { intensity?: number; duration?: number };
    setBossTelegraphFX?: (opts?: { intensity?: number; duration?: number }) => void;
    NanoDialog?: { enabled?: boolean; init?: () => Promise<void>; isReady?: () => boolean };
    NanoPalette?: { init?: () => void; generate?: () => Promise<unknown> };
    [key: string]: any;
  }
}

export { };

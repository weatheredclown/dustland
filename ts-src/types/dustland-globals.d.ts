interface DustlandEventBus {
  on?: (event: string, handler: (...args: any[]) => void) => void;
  emit?: (event: string, ...args: any[]) => void;
}

interface DustlandNamespace {
  eventBus?: DustlandEventBus;
  currentModule?: string;
  loadedModules?: Record<string, any>;
  zoneEffects?: Array<Record<string, any>>;
  weather?: {
    getWeather?: () => unknown;
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
  var checkFlagCondition: ((condition: any) => boolean) | undefined;
  var pickupVacuum: ((...coords: number[]) => void) | undefined;
  var addToInv: ((item: any, opts?: any) => unknown) | undefined;
  var getItem: ((id: any) => any) | undefined;
  var pickupCache: ((drop: any) => boolean) | undefined;
  var getPartyInventoryCapacity: (() => number) | undefined;
  var openWorldMap: ((id?: any) => void) | undefined;
  var useItem: ((item: any, target?: any) => unknown) | undefined;
  var ITEMS: Record<string, any> | undefined;
  var log: ((message: string, type?: string) => void) | undefined;
  var toast: ((message: string, type?: string) => void) | undefined;
  var showHud: (() => void) | undefined;
  var bossesDefeated: number | undefined;
  var runCount: number | undefined;
  var DUSTLAND_FEATURES: DustlandFeatures | undefined;
  var seedWorldContent: (() => void) | undefined;
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

export {};

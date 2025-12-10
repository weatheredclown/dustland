declare global {
  interface MultiplayerPeer {
    id: string;
    status: string;
    label: string;
  }

  interface MultiplayerPresenceEvent {
    status?: string;
    role?: 'host' | 'client' | string;
    peers?: unknown;
    reason?: unknown;
    message?: unknown;
    __fromNet?: boolean;
    [key: string]: unknown;
  }

  type EngineAssert = (name: string, condition: unknown) => void;

  interface DustlandEngineGlobals extends DustlandGlobals {
    TILE?: Record<string, number>;
    fogOfWarEnabled?: boolean;
    FOG_RADIUS?: number | string;
    tileChars?: unknown;
    playerAdrenalineFx?: unknown;
    moduleTests?: ((assert: EngineAssert) => void) | undefined;
    NanoDialog?: { enabled?: boolean; init?: () => Promise<void>; isReady?: () => boolean; refreshIndicator?: () => void };
    Dustland?: (DustlandNamespace & {
      music?: { isEnabled?: () => boolean; toggleEnabled?: () => void };
      multiplayerParties?: { list?: () => MultiplayerPeer[] };
      multiplayerState?: { remoteParties?: MultiplayerPeer[] };
    }) | null;
    party?: Party;
    selectedMember?: number;
    player?: PlayerState & {
      hydration?: number;
      adrenaline?: number;
      mood?: string;
      inv: GameItem[];
      scrap: number;
      maxHp?: number;
      hp: number;
    };
    canEquip?: (member: unknown, item: unknown) => boolean;
    getEquipRestrictions?: (member: unknown, item: unknown) => unknown;
    describeRequiredRoles?: (roles: unknown) => string;
    unequipItem?: (member: unknown, slot: unknown) => unknown;
    dropItems?: (indices: number[]) => unknown;
    quests?: Record<string, Quest>;
    state?: { map?: string; mapEntry?: { x?: number; y?: number } };
    engineGlobals?: DustlandEngineGlobals;
    getEngineGlobals?: () => DustlandEngineGlobals;
    log?: (msg: string, type?: 'warn' | 'error' | string) => void;
    toast?: (msg: string) => void;
    logger?: (msg: string, type?: 'warn' | 'error' | string) => void;
    engineLog?: (msg: string, type?: 'warn' | 'error' | string) => void;
    engineToast?: (msg: string) => void;
    dialogOverlay?: HTMLElement | null;
    pickupVacuum?: (fromX: number, fromY: number, toX?: number, toY?: number) => void;
    TS?: number;
    getViewSize?: () => { w: number; h: number };
    leader?: () => PartyMember | null | undefined;
    move?: (dx: number, dy: number) => void;
    interact?: () => void;
    takeNearestItem?: () => void;
    interactAt?: (x: number, y: number) => void;
    modulePickerPending?: boolean;
    showStart?: () => void;
    openCreator?: () => void;
    fxConfig?: Record<string, unknown> | null;
    queryTile?: (x: number, y: number, map?: string) => { tile: string | number | null; entities: TileEntity[] };
    buildings?: Array<{ interiorId?: string } & Record<string, unknown>>;
    interiors?: Record<string, { grid?: unknown } & Record<string, unknown>>;
    save?: () => void;
    load?: () => void;
    clearSave?: () => void;
    resetAll?: () => void;
    closeDialog?: () => void;
    handleDialogKey?: (event: KeyboardEvent) => boolean | void;
    handleCombatKey?: (event: KeyboardEvent) => boolean | void;
    perfStats?: { tiles?: number; sfx?: number; [key: string]: number | undefined };
    CURRENCY?: string;
  }

  var engineGlobals: DustlandEngineGlobals;
  interface GlobalThis extends DustlandEngineGlobals {}
}

export {};

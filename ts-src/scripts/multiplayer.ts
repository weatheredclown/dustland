type MultiplayerEventName =
  | 'movement:player'
  | 'combat:event'
  | 'combat:started'
  | 'combat:ended'
  | 'multiplayer:presence'
  | 'module-picker:select';

type RemotePartyId = string | number;

interface RemotePartyEntry {
  id: RemotePartyId;
  map?: string;
  x?: number;
  y?: number;
  updated?: number;
}

type RemotePartySnapshot = Readonly<RemotePartyEntry>;

interface MultiplayerPeerInfo {
  id?: RemotePartyId;
  status?: string;
  label?: string;
  [key: string]: unknown;
}

interface MultiplayerMessage {
  type?: string;
  evt?: string;
  data?: Record<string, unknown> | undefined;
  [key: string]: unknown;
}

interface MultiplayerRoom {
  broadcast?: (message: MultiplayerMessage, skipId?: RemotePartyId | null | undefined) => void;
  onMessage?: (handler: (message: MultiplayerMessage, fromId?: RemotePartyId | null | undefined) => void) =>
    | (() => void)
    | void;
  onPeers?: (handler: (peers: MultiplayerPeerInfo[] | undefined) => void) => (() => void) | void;
  close?: () => void;
}

interface MultiplayerSocket {
  send?: (message: MultiplayerMessage) => void;
  onMessage?: (handler: (message: MultiplayerMessage) => void) => (() => void) | void;
  close?: () => void;
  ready?: Promise<void>;
}

type DebugModeInput = boolean | { movement?: boolean | null | undefined } | null | undefined;

interface MultiplayerOptions {
  debugMode?: DebugModeInput;
  server?: string;
  [key: string]: unknown;
}

interface MultiplayerBase {
  startHost?: (opts?: MultiplayerOptions) => Promise<MultiplayerRoom | null | undefined> | MultiplayerRoom | null | undefined;
  connect?: (opts?: MultiplayerOptions) => Promise<MultiplayerSocket | null | undefined> | MultiplayerSocket | null | undefined;
  disconnect?: (role?: string | null | undefined) => boolean | void;
}

interface MultiplayerState {
  remoteParties?: RemotePartySnapshot[];
}

interface MultiplayerPartiesApi {
  list?: () => RemotePartySnapshot[];
}

type DustlandWithMultiplayer = DustlandNamespace & {
  multiplayer?: MultiplayerBase;
  multiplayerState?: MultiplayerState;
  multiplayerParties?: MultiplayerPartiesApi;
  movement?: (DustlandNamespace['movement'] extends Record<string, unknown>
    ? DustlandNamespace['movement']
    : Record<string, unknown>) & {
      mapIdForState?: () => string | undefined;
    };
};

(function () {
  const scope = globalThis as unknown as GlobalThis;
  const dustland = (scope.Dustland ??= {} as DustlandWithMultiplayer);
  const bus = scope.EventBus;
  const base = (dustland.multiplayer ?? {}) as MultiplayerBase;
  const NET_FLAG = '__fromNet';
  const EVENTS: MultiplayerEventName[] = [
    'movement:player',
    'combat:event',
    'combat:started',
    'combat:ended',
    'multiplayer:presence',
    'module-picker:select'
  ];
  const remoteParties = new Map<RemotePartyId, RemotePartyEntry>();
  let debugMovement = false;
  let activeRole: 'host' | 'client' | null = null;
  let activeRoom: MultiplayerRoom | null = null;
  let activeSocket: MultiplayerSocket | null = null;

  function snapshotRemoteParties(): RemotePartySnapshot[] {
    return Array.from(remoteParties.values()).map(entry => ({
      id: entry.id,
      map: entry.map,
      x: entry.x,
      y: entry.y,
      updated: entry.updated
    }));
  }

  function updateRemoteState(): void {
    const list = snapshotRemoteParties();
    const mpState: MultiplayerState = dustland.multiplayerState ?? (dustland.multiplayerState = {} as MultiplayerState);
    mpState.remoteParties = list;
    const api: MultiplayerPartiesApi = dustland.multiplayerParties ?? (dustland.multiplayerParties = {} as MultiplayerPartiesApi);
    api.list = () => snapshotRemoteParties();
    bus?.emit?.('multiplayer:party-sync', list);
  }

  function setRemoteParty(id: RemotePartyId | null | undefined, info: Partial<RemotePartyEntry> = {}): void {
    if (id === null || id === undefined) return;
    const entry = remoteParties.get(id) ?? { id };
    if (typeof info.map === 'string') entry.map = info.map;
    else if (!entry.map) {
      const movementApi = dustland.movement as { mapIdForState?: () => string | undefined } | undefined;
      const mapId = movementApi?.mapIdForState?.();
      if (typeof mapId === 'string') entry.map = mapId;
    }
    if (Number.isFinite(info.x)) entry.x = info.x as number;
    if (Number.isFinite(info.y)) entry.y = info.y as number;
    entry.updated = Date.now();
    remoteParties.set(id, entry);
    updateRemoteState();
  }

  function pruneRemoteParties(ids: Array<RemotePartyId | null | undefined> | null | undefined): void {
    const keep = new Set<RemotePartyId>((ids || []).filter((value): value is RemotePartyId => typeof value === 'string' || typeof value === 'number'));
    let changed = false;
    remoteParties.forEach((_, key) => {
      if (!keep.has(key)) {
        remoteParties.delete(key);
        changed = true;
      }
    });
    if (changed) updateRemoteState();
  }

  function clearRemoteParties(): void {
    if (!remoteParties.size) {
      updateRemoteState();
      return;
    }
    remoteParties.clear();
    updateRemoteState();
  }

  updateRemoteState();

  function bindEvent<E extends DustlandEventName>(event: E, handler: DustlandEventHandler<E>): () => void {
    if (!bus?.on) return () => { };
    bus.on(event, handler);
    return () => bus?.off?.(event, handler);
  }

  bindEvent('multiplayer:party-pos', info => {
    const payload = info as { id?: RemotePartyId } | undefined;
    if (!payload?.id) return;
    setRemoteParty(payload.id, payload as Partial<RemotePartyEntry>);
  });

  bindEvent('multiplayer:presence', info => {
    const payload = info as { status?: string; role?: string } | undefined;
    if (!payload) return;
    if (payload.status === 'closed' && payload.role === 'host') {
      clearRemoteParties();
    }
  });

  function tagAndEmit(msg: MultiplayerMessage, fromId?: RemotePartyId | null): void {
    if (!msg?.evt) return;
    const payload = (msg.data ?? {}) as Record<string, unknown> & { [NET_FLAG]?: boolean };
    if (debugMovement && msg.evt === 'movement:player') {
      const info = {
        from: typeof fromId === 'string' || typeof fromId === 'number' ? fromId : 'remote peer',
        map: payload?.map,
        x: payload?.x,
        y: payload?.y
      };
      console.debug('[multiplayer] movement command received', info);
    }
    (payload as Record<string, unknown>)[NET_FLAG] = true;
    bus?.emit?.(msg.evt as DustlandEventName, payload as unknown);
  }

  function setDebugMode(mode: DebugModeInput): { movement: boolean } {
    if (mode && typeof mode === 'object') {
      debugMovement = !!mode.movement;
    } else {
      debugMovement = !!mode;
    }
    return { movement: debugMovement };
  }

  async function startHost(opts?: MultiplayerOptions): Promise<MultiplayerRoom | null | undefined> {
    setDebugMode(opts?.debugMode ?? null);
    const room = await base.startHost?.(opts);
    if (!room) return room;

    clearRemoteParties();

    if (activeRoom && activeRoom !== room) {
      try {
        activeRoom.close?.();
      } catch {
        // Ignore cleanup errors
      }
    }

    const emitPresence = (status: string, extra: Record<string, unknown> = {}): void => {
      bus?.emit?.('multiplayer:presence', Object.assign({ role: 'host', status }, extra));
    };

    const emitPeers = (peers: MultiplayerPeerInfo[] | null | undefined): void => {
      const list = Array.isArray(peers) ? peers.map(p => ({ id: p?.id, status: p?.status })) : [];
      emitPresence('peers', { peers: list });
    };

    emitPresence('started');
    let stopPeerFeed: (() => void) | null = null;

    interface SendPartyOptions {
      store?: boolean;
      skipId?: RemotePartyId | null | undefined;
    }

    const sendPartyPos = (
      id: RemotePartyId | null | undefined,
      data: Record<string, unknown> | undefined,
      opts: SendPartyOptions = {}
    ): void => {
      if (id === null || id === undefined) return;
      const payload: Record<string, unknown> & { id: RemotePartyId } = { id };
      if (typeof data?.map === 'string') payload.map = data.map;
      else {
        const movementApi = dustland.movement as { mapIdForState?: () => string | undefined } | undefined;
        const mapId = movementApi?.mapIdForState?.();
        if (typeof mapId === 'string') payload.map = mapId;
      }
      if (Number.isFinite(data?.x)) payload.x = data?.x;
      if (Number.isFinite(data?.y)) payload.y = data?.y;
      if (!('x' in payload) && !('y' in payload)) return;
      if (opts.store !== false) setRemoteParty(id, payload as Partial<RemotePartyEntry>);
      room.broadcast?.({ type: 'event', evt: 'multiplayer:party-pos', data: payload }, opts.skipId);
    };

    const removers: Array<() => void> = EVENTS.map(evt =>
      bindEvent(evt, data => {
        const payload = data as Record<string, unknown> & { [NET_FLAG]?: boolean } | undefined;
        if (evt === 'movement:player' && !payload?.[NET_FLAG]) {
          sendPartyPos('host', payload, { store: false });
        }
        if (payload?.[NET_FLAG]) return;
        room.broadcast?.({ type: 'event', evt, data: payload });
      })
    );
    const stopMessage = room.onMessage?.((msg, fromId) => {
      if (msg?.type === 'event') {
        if (msg.evt === 'movement:player' && fromId !== undefined && fromId !== null) {
          const details = Object.assign({}, msg.data, { id: fromId });
          setRemoteParty(fromId, details as Partial<RemotePartyEntry>);
          sendPartyPos(fromId, msg.data as Record<string, unknown> | undefined, { skipId: fromId });
        } else if (msg.evt === 'multiplayer:party-pos' && msg.data?.id && fromId !== undefined && fromId !== null) {
          setRemoteParty(msg.data.id as RemotePartyId, msg.data as Partial<RemotePartyEntry>);
        }
        tagAndEmit(msg, fromId);
        room.broadcast?.(msg, fromId ?? undefined);
      }
    });

    const baseOnPeers = typeof room.onPeers === 'function' ? room.onPeers.bind(room) : null;
    if (baseOnPeers) {
      stopPeerFeed = baseOnPeers(peers => {
        emitPeers(peers);
        const ids = Array.isArray(peers)
          ? peers
            .map(peer => peer?.id)
            .filter((value): value is RemotePartyId => typeof value === 'string' || typeof value === 'number')
          : [];
        pruneRemoteParties(ids);
      }) as (() => void) | null;
      room.onPeers = fn => {
        if (typeof fn !== 'function') return () => { };
        const remove = baseOnPeers(fn);
        return () => remove?.();
      };
    } else {
      emitPeers([]);
    }

    const originalClose = room.close?.bind(room);
    room.close = () => {
      removers.forEach(off => off());
      if (typeof stopMessage === 'function') stopMessage();
      stopPeerFeed?.();
      clearRemoteParties();
      emitPresence('closed');
      originalClose?.();
      if (activeRoom === room) {
        activeRoom = null;
        if (activeRole === 'host') activeRole = null;
      }
    };
    activeRole = 'host';
    activeRoom = room;
    return room;
  }

  async function connect(opts?: MultiplayerOptions): Promise<MultiplayerSocket | null | undefined> {
    setDebugMode(opts?.debugMode ?? null);
    const socket = await base.connect?.(opts);
    if (!socket) return socket;
    clearRemoteParties();
    if (activeSocket && activeSocket !== socket) {
      try {
        activeSocket.close?.();
      } catch {
        // Ignore cleanup errors
      }
    }
    const emitPresence = (status: string, extra: Record<string, unknown> = {}): void => {
      bus?.emit?.('multiplayer:presence', Object.assign({ role: 'client', status }, extra));
    };
    emitPresence('started');
    emitPresence('linking');
    const sendEvent = (evt: MultiplayerEventName, data: unknown): void => {
      const payload = data as Record<string, unknown> & { [NET_FLAG]?: boolean } | undefined;
      if (evt === 'module-picker:select') return;
      if (payload?.[NET_FLAG]) return;
      socket.send?.({ type: 'event', evt, data: payload });
    };
    const removers: Array<() => void> = EVENTS.map(evt => bindEvent(evt, data => sendEvent(evt, data)));
    const stopMessage = socket.onMessage?.(msg => {
      if (msg?.type === 'event') {
        if (msg.evt === 'multiplayer:party-pos' && msg.data?.id) {
          setRemoteParty(msg.data.id as RemotePartyId, msg.data as Partial<RemotePartyEntry>);
        }
        tagAndEmit(msg);
      } else if (msg && typeof msg === 'object') {
        dustland.gameState?.updateState?.(state => Object.assign(state, msg));
      }
    });
    if (socket?.ready?.then) {
      socket.ready
        .then(() => {
          emitPresence('linked');
        })
        .catch(err => {
          emitPresence('error', { reason: (err as Error)?.message || err });
        });
    }
    const originalClose = socket.close?.bind(socket);
    socket.close = () => {
      removers.forEach(off => off());
      if (typeof stopMessage === 'function') stopMessage();
      emitPresence('closed');
      clearRemoteParties();
      originalClose?.();
      if (activeSocket === socket) {
        activeSocket = null;
        if (activeRole === 'client') activeRole = null;
      }
    };
    activeRole = 'client';
    activeSocket = socket;
    return socket;
  }

  function disconnect(role?: string | null): boolean | void {
    if (role && role !== activeRole) {
      if (typeof base.disconnect === 'function') {
        return base.disconnect(role);
      }
      return false;
    }
    if (activeRole === 'client' && activeSocket) {
      activeSocket.close?.();
      clearRemoteParties();
      return true;
    }
    if (activeRole === 'host' && activeRoom) {
      activeRoom.close?.();
      clearRemoteParties();
      return true;
    }
    if (typeof base.disconnect === 'function') {
      return base.disconnect(role);
    }
    return false;
  }

  dustland.multiplayer = Object.assign({}, base, { startHost, connect, setDebugMode, disconnect });
})();

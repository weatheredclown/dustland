(function () {
    const scope = globalThis;
    const dustland = (scope.Dustland ?? (scope.Dustland = {}));
    const bus = scope.EventBus;
    const base = (dustland.multiplayer ?? {});
    const NET_FLAG = '__fromNet';
    const EVENTS = [
        'movement:player',
        'combat:event',
        'combat:started',
        'combat:ended',
        'multiplayer:presence',
        'module-picker:select'
    ];
    const remoteParties = new Map();
    let debugMovement = false;
    let activeRole = null;
    let activeRoom = null;
    let activeSocket = null;
    function snapshotRemoteParties() {
        return Array.from(remoteParties.values()).map(entry => ({
            id: entry.id,
            map: entry.map,
            x: entry.x,
            y: entry.y,
            updated: entry.updated
        }));
    }
    function updateRemoteState() {
        const list = snapshotRemoteParties();
        const mpState = dustland.multiplayerState ?? (dustland.multiplayerState = {});
        mpState.remoteParties = list;
        const api = dustland.multiplayerParties ?? (dustland.multiplayerParties = {});
        api.list = () => snapshotRemoteParties();
        bus?.emit?.('multiplayer:party-sync', list);
    }
    function setRemoteParty(id, info = {}) {
        if (id === null || id === undefined)
            return;
        const entry = remoteParties.get(id) ?? { id };
        if (typeof info.map === 'string')
            entry.map = info.map;
        else if (!entry.map) {
            const movementApi = dustland.movement;
            const mapId = movementApi?.mapIdForState?.();
            if (typeof mapId === 'string')
                entry.map = mapId;
        }
        if (Number.isFinite(info.x))
            entry.x = info.x;
        if (Number.isFinite(info.y))
            entry.y = info.y;
        entry.updated = Date.now();
        remoteParties.set(id, entry);
        updateRemoteState();
    }
    function pruneRemoteParties(ids) {
        const keep = new Set((ids || []).filter((value) => typeof value === 'string' || typeof value === 'number'));
        let changed = false;
        remoteParties.forEach((_, key) => {
            if (!keep.has(key)) {
                remoteParties.delete(key);
                changed = true;
            }
        });
        if (changed)
            updateRemoteState();
    }
    function clearRemoteParties() {
        if (!remoteParties.size) {
            updateRemoteState();
            return;
        }
        remoteParties.clear();
        updateRemoteState();
    }
    updateRemoteState();
    function bindEvent(event, handler) {
        if (!bus?.on)
            return () => { };
        bus.on(event, handler);
        return () => bus?.off?.(event, handler);
    }
    bindEvent('multiplayer:party-pos', info => {
        const payload = info;
        if (!payload?.id)
            return;
        setRemoteParty(payload.id, payload);
    });
    bindEvent('multiplayer:presence', info => {
        const payload = info;
        if (!payload)
            return;
        if (payload.status === 'closed' && payload.role === 'host') {
            clearRemoteParties();
        }
    });
    function tagAndEmit(msg, fromId) {
        if (!msg?.evt)
            return;
        const payload = (msg.data ?? {});
        if (debugMovement && msg.evt === 'movement:player') {
            const info = {
                from: typeof fromId === 'string' || typeof fromId === 'number' ? fromId : 'remote peer',
                map: payload?.map,
                x: payload?.x,
                y: payload?.y
            };
            console.debug('[multiplayer] movement command received', info);
        }
        payload[NET_FLAG] = true;
        bus?.emit?.(msg.evt, payload);
    }
    function setDebugMode(mode) {
        if (mode && typeof mode === 'object') {
            debugMovement = !!mode.movement;
        }
        else {
            debugMovement = !!mode;
        }
        return { movement: debugMovement };
    }
    async function startHost(opts) {
        setDebugMode(opts?.debugMode ?? null);
        const room = await base.startHost?.(opts);
        if (!room)
            return room;
        clearRemoteParties();
        if (activeRoom && activeRoom !== room) {
            try {
                activeRoom.close?.();
            }
            catch {
                // Ignore cleanup errors
            }
        }
        const emitPresence = (status, extra = {}) => {
            bus?.emit?.('multiplayer:presence', Object.assign({ role: 'host', status }, extra));
        };
        const emitPeers = (peers) => {
            const list = Array.isArray(peers) ? peers.map(p => ({ id: p?.id, status: p?.status })) : [];
            emitPresence('peers', { peers: list });
        };
        emitPresence('started');
        let stopPeerFeed = null;
        const sendPartyPos = (id, data, opts = {}) => {
            if (id === null || id === undefined)
                return;
            const payload = { id };
            if (typeof data?.map === 'string')
                payload.map = data.map;
            else {
                const movementApi = dustland.movement;
                const mapId = movementApi?.mapIdForState?.();
                if (typeof mapId === 'string')
                    payload.map = mapId;
            }
            if (Number.isFinite(data?.x))
                payload.x = data?.x;
            if (Number.isFinite(data?.y))
                payload.y = data?.y;
            if (!('x' in payload) && !('y' in payload))
                return;
            if (opts.store !== false)
                setRemoteParty(id, payload);
            room.broadcast?.({ type: 'event', evt: 'multiplayer:party-pos', data: payload }, opts.skipId);
        };
        const removers = EVENTS.map(evt => bindEvent(evt, data => {
            const payload = data;
            if (evt === 'movement:player' && !payload?.[NET_FLAG]) {
                sendPartyPos('host', payload, { store: false });
            }
            if (payload?.[NET_FLAG])
                return;
            room.broadcast?.({ type: 'event', evt, data: payload });
        }));
        const stopMessage = room.onMessage?.((msg, fromId) => {
            if (msg?.type === 'event') {
                if (msg.evt === 'movement:player' && fromId !== undefined && fromId !== null) {
                    const details = Object.assign({}, msg.data, { id: fromId });
                    setRemoteParty(fromId, details);
                    sendPartyPos(fromId, msg.data, { skipId: fromId });
                }
                else if (msg.evt === 'multiplayer:party-pos' && msg.data?.id && fromId !== undefined && fromId !== null) {
                    setRemoteParty(msg.data.id, msg.data);
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
                        .filter((value) => typeof value === 'string' || typeof value === 'number')
                    : [];
                pruneRemoteParties(ids);
            });
            room.onPeers = fn => {
                if (typeof fn !== 'function')
                    return () => { };
                const remove = baseOnPeers(fn);
                return () => remove?.();
            };
        }
        else {
            emitPeers([]);
        }
        const originalClose = room.close?.bind(room);
        room.close = () => {
            removers.forEach(off => off());
            if (typeof stopMessage === 'function')
                stopMessage();
            stopPeerFeed?.();
            clearRemoteParties();
            emitPresence('closed');
            originalClose?.();
            if (activeRoom === room) {
                activeRoom = null;
                if (activeRole === 'host')
                    activeRole = null;
            }
        };
        activeRole = 'host';
        activeRoom = room;
        return room;
    }
    async function connect(opts) {
        setDebugMode(opts?.debugMode ?? null);
        const socket = await base.connect?.(opts);
        if (!socket)
            return socket;
        clearRemoteParties();
        if (activeSocket && activeSocket !== socket) {
            try {
                activeSocket.close?.();
            }
            catch {
                // Ignore cleanup errors
            }
        }
        const emitPresence = (status, extra = {}) => {
            bus?.emit?.('multiplayer:presence', Object.assign({ role: 'client', status }, extra));
        };
        emitPresence('started');
        emitPresence('linking');
        const sendEvent = (evt, data) => {
            const payload = data;
            if (evt === 'module-picker:select')
                return;
            if (payload?.[NET_FLAG])
                return;
            socket.send?.({ type: 'event', evt, data: payload });
        };
        const removers = EVENTS.map(evt => bindEvent(evt, data => sendEvent(evt, data)));
        const stopMessage = socket.onMessage?.(msg => {
            if (msg?.type === 'event') {
                if (msg.evt === 'multiplayer:party-pos' && msg.data?.id) {
                    setRemoteParty(msg.data.id, msg.data);
                }
                tagAndEmit(msg);
            }
            else if (msg && typeof msg === 'object') {
                dustland.gameState?.updateState?.(state => Object.assign(state, msg));
            }
        });
        if (socket?.ready?.then) {
            socket.ready
                .then(() => {
                emitPresence('linked');
            })
                .catch(err => {
                emitPresence('error', { reason: err?.message || err });
            });
        }
        const originalClose = socket.close?.bind(socket);
        socket.close = () => {
            removers.forEach(off => off());
            if (typeof stopMessage === 'function')
                stopMessage();
            emitPresence('closed');
            clearRemoteParties();
            originalClose?.();
            if (activeSocket === socket) {
                activeSocket = null;
                if (activeRole === 'client')
                    activeRole = null;
            }
        };
        activeRole = 'client';
        activeSocket = socket;
        return socket;
    }
    function disconnect(role) {
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

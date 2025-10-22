// @ts-nocheck
(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;
  const base = globalThis.Dustland.multiplayer || {};
  const NET_FLAG = '__fromNet';
  const EVENTS = ['movement:player', 'combat:event', 'combat:started', 'combat:ended', 'multiplayer:presence', 'module-picker:select'];
  const remoteParties = new Map();
  let debugMovement = false;
  let activeRole = null;
  let activeRoom = null;
  let activeSocket = null;

  function snapshotRemoteParties(){
    return Array.from(remoteParties.values()).map(entry => ({
      id: entry.id,
      map: entry.map,
      x: entry.x,
      y: entry.y,
      updated: entry.updated
    }));
  }

  function updateRemoteState(){
    const list = snapshotRemoteParties();
    globalThis.Dustland = globalThis.Dustland || {};
    const mpState = globalThis.Dustland.multiplayerState || (globalThis.Dustland.multiplayerState = {});
    mpState.remoteParties = list;
    const api = globalThis.Dustland.multiplayerParties || (globalThis.Dustland.multiplayerParties = {});
    api.list = () => snapshotRemoteParties();
    bus?.emit?.('multiplayer:party-sync', list);
  }

  function setRemoteParty(id, info = {}){
    if (!id) return;
    const entry = remoteParties.get(id) || { id };
    if (typeof info.map === 'string') entry.map = info.map;
    else if (!entry.map) {
      const mapId = globalThis.Dustland?.movement?.mapIdForState?.();
      if (typeof mapId === 'string') entry.map = mapId;
    }
    if (Number.isFinite(info.x)) entry.x = info.x;
    if (Number.isFinite(info.y)) entry.y = info.y;
    entry.updated = Date.now();
    remoteParties.set(id, entry);
    updateRemoteState();
  }

  function pruneRemoteParties(ids){
    const keep = new Set((ids || []).filter(id => typeof id === 'string'));
    let changed = false;
    remoteParties.forEach((_, key) => {
      if (!keep.has(key)) {
        remoteParties.delete(key);
        changed = true;
      }
    });
    if (changed) updateRemoteState();
  }

  function clearRemoteParties(){
    if (!remoteParties.size) {
      updateRemoteState();
      return;
    }
    remoteParties.clear();
    updateRemoteState();
  }

  updateRemoteState();

  function bindEvent(evt, handler){
    if (!bus?.on) return () => {};
    bus.on(evt, handler);
    return () => bus?.off?.(evt, handler);
  }

  bindEvent('multiplayer:party-pos', info => {
    if (!info?.id) return;
    setRemoteParty(info.id, info);
  });

  bindEvent('multiplayer:presence', info => {
    if (!info) return;
    if (info.status === 'closed' && info.role === 'host') {
      clearRemoteParties();
    }
  });

  function tagAndEmit(msg, fromId){
    if (!msg?.evt) return;
    const payload = msg.data || {};
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

  function setDebugMode(mode){
    if (mode && typeof mode === 'object') {
      debugMovement = !!mode.movement;
    } else {
      debugMovement = !!mode;
    }
    return { movement: debugMovement };
  }

  async function startHost(opts){
    setDebugMode(opts?.debugMode);
    const room = await base.startHost?.(opts);
    if (!room) return room;

    clearRemoteParties();

    if (activeRoom && activeRoom !== room) {
      try { activeRoom.close?.(); } catch (err) { /* ignore */ }
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
      if (!id) return;
      const payload = {};
      if (typeof data?.map === 'string') payload.map = data.map;
      else {
        const mapId = globalThis.Dustland?.movement?.mapIdForState?.();
        if (typeof mapId === 'string') payload.map = mapId;
      }
      if (Number.isFinite(data?.x)) payload.x = data.x;
      if (Number.isFinite(data?.y)) payload.y = data.y;
      if (!('x' in payload) && !('y' in payload)) return;
      payload.id = id;
      if (opts.store !== false) setRemoteParty(id, payload);
      room.broadcast?.({ type: 'event', evt: 'multiplayer:party-pos', data: payload }, opts.skipId);
    };

    const removers = EVENTS.map(evt => bindEvent(evt, data => {
      if (evt === 'movement:player' && !data?.[NET_FLAG]) {
        sendPartyPos('host', data, { store: false });
      }
      if (data && data[NET_FLAG]) return;
      room.broadcast?.({ type: 'event', evt, data });
    }));
    const stopMessage = room.onMessage?.((msg, fromId) => {
      if (msg?.type === 'event') {
        if (msg.evt === 'movement:player' && fromId) {
          const details = Object.assign({}, msg.data, { id: fromId });
          setRemoteParty(fromId, details);
          sendPartyPos(fromId, msg.data, { skipId: fromId });
        } else if (msg.evt === 'multiplayer:party-pos' && msg.data?.id && fromId) {
          setRemoteParty(msg.data.id, msg.data);
        }
        tagAndEmit(msg, fromId);
        room.broadcast?.(msg, fromId);
      }
    });

    const baseOnPeers = typeof room.onPeers === 'function' ? room.onPeers.bind(room) : null;
    if (baseOnPeers) {
      stopPeerFeed = baseOnPeers(peers => {
        emitPeers(peers);
        const ids = Array.isArray(peers) ? peers.map(p => p?.id).filter(id => typeof id === 'string') : [];
        pruneRemoteParties(ids);
      });
      room.onPeers = fn => {
        if (typeof fn !== 'function') return () => {};
        const remove = baseOnPeers(fn);
        return () => remove?.();
      };
    } else {
      emitPeers([]);
    }

    const originalClose = room.close?.bind(room);
    room.close = () => {
      removers.forEach(off => off());
      stopMessage?.();
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

  async function connect(opts){
    setDebugMode(opts?.debugMode);
    const socket = await base.connect?.(opts);
    if (!socket) return socket;
    clearRemoteParties();
    if (activeSocket && activeSocket !== socket) {
      try { activeSocket.close?.(); } catch (err) { /* ignore */ }
    }
    const emitPresence = (status, extra = {}) => {
      bus?.emit?.('multiplayer:presence', Object.assign({ role: 'client', status }, extra));
    };
    emitPresence('started');
    emitPresence('linking');
    const sendEvent = (evt, data) => {
      if (evt === 'module-picker:select') return;
      if (data && data[NET_FLAG]) return;
      socket.send?.({ type: 'event', evt, data });
    };
    const removers = EVENTS.map(evt => bindEvent(evt, data => sendEvent(evt, data)));
    const stopMessage = socket.onMessage?.(msg => {
      if (msg?.type === 'event') {
        if (msg.evt === 'multiplayer:party-pos' && msg.data?.id) {
          setRemoteParty(msg.data.id, msg.data);
        }
        tagAndEmit(msg);
      } else if (msg && typeof msg === 'object') {
        globalThis.Dustland.gameState?.updateState?.(state => Object.assign(state, msg));
      }
    });
    if (socket?.ready?.then) {
      socket.ready.then(() => {
        emitPresence('linked');
      }).catch(err => {
        emitPresence('error', { reason: err?.message || err });
      });
    }
    const originalClose = socket.close?.bind(socket);
    socket.close = () => {
      removers.forEach(off => off());
      stopMessage?.();
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

  function disconnect(role){
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

  globalThis.Dustland.multiplayer = Object.assign({}, base, { startHost, connect, setDebugMode, disconnect });
})();

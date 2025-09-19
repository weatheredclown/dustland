(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;
  const base = globalThis.Dustland.multiplayer || {};
  const NET_FLAG = '__fromNet';
  const EVENTS = ['movement:player', 'combat:event', 'combat:started', 'combat:ended', 'multiplayer:presence'];
  let debugMovement = false;

  function bindEvent(evt, handler){
    if (!bus?.on) return () => {};
    bus.on(evt, handler);
    return () => bus?.off?.(evt, handler);
  }

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

    const emitPresence = (status, extra = {}) => {
      bus?.emit?.('multiplayer:presence', Object.assign({ role: 'host', status }, extra));
    };

    const emitPeers = (peers) => {
      const list = Array.isArray(peers) ? peers.map(p => ({ id: p?.id, status: p?.status })) : [];
      emitPresence('peers', { peers: list });
    };

    emitPresence('started');
    let stopPeerFeed = null;

    const removers = EVENTS.map(evt => bindEvent(evt, data => {
      if (data && data[NET_FLAG]) return;
      room.broadcast?.({ type: 'event', evt, data });
    }));
    const stopMessage = room.onMessage?.((msg, fromId) => {
      if (msg?.type === 'event') {
        tagAndEmit(msg, fromId);
        room.broadcast?.(msg, fromId);
      }
    });

    const baseOnPeers = typeof room.onPeers === 'function' ? room.onPeers.bind(room) : null;
    if (baseOnPeers) {
      stopPeerFeed = baseOnPeers(peers => emitPeers(peers));
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
      emitPresence('closed');
      originalClose?.();
    };
    return room;
  }

  async function connect(opts){
    setDebugMode(opts?.debugMode);
    const socket = await base.connect?.(opts);
    if (!socket) return socket;
    const emitPresence = (status, extra = {}) => {
      bus?.emit?.('multiplayer:presence', Object.assign({ role: 'client', status }, extra));
    };
    emitPresence('started');
    emitPresence('linking');
    const sendEvent = (evt, data) => {
      if (data && data[NET_FLAG]) return;
      socket.send?.({ type: 'event', evt, data });
    };
    const removers = EVENTS.map(evt => bindEvent(evt, data => sendEvent(evt, data)));
    const stopMessage = socket.onMessage?.(msg => {
      if (msg?.type === 'event') {
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
      originalClose?.();
    };
    return socket;
  }

  globalThis.Dustland.multiplayer = { startHost, connect, setDebugMode };
})();

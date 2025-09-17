(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;
  const base = globalThis.Dustland.multiplayer || {};
  const NET_FLAG = '__fromNet';
  const EVENTS = ['movement:player', 'combat:event', 'combat:started', 'combat:ended'];

  function bindEvent(evt, handler){
    if (!bus?.on) return () => {};
    bus.on(evt, handler);
    return () => bus?.off?.(evt, handler);
  }

  function tagAndEmit(msg){
    if (!msg?.evt) return;
    const payload = msg.data || {};
    payload[NET_FLAG] = true;
    bus?.emit?.(msg.evt, payload);
  }

  async function startHost(opts){
    const room = await base.startHost?.(opts);
    if (!room) return room;
    const removers = EVENTS.map(evt => bindEvent(evt, data => {
      if (data && data[NET_FLAG]) return;
      room.broadcast?.({ type: 'event', evt, data });
    }));
    const stopMessage = room.onMessage?.((msg, fromId) => {
      if (msg?.type === 'event') {
        tagAndEmit(msg);
        room.broadcast?.(msg, fromId);
      }
    });
    const originalClose = room.close?.bind(room);
    room.close = () => {
      removers.forEach(off => off());
      stopMessage?.();
      originalClose?.();
    };
    return room;
  }

  async function connect(opts){
    const socket = await base.connect?.(opts);
    if (!socket) return socket;
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
    const originalClose = socket.close?.bind(socket);
    socket.close = () => {
      removers.forEach(off => off());
      stopMessage?.();
      originalClose?.();
    };
    return socket;
  }

  globalThis.Dustland.multiplayer = { startHost, connect };
})();

// ===== Multiplayer Sync (prototype) =====
(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;
  const Multiplayer = {
    async startHost({ port = 7777 } = {}) {
      const WSS = globalThis.WebSocketServer || (await import('ws')).WebSocketServer;
      const wss = new WSS({ port });
      const broadcast = () => {
        const data = JSON.stringify(globalThis.Dustland.gameState?.getState?.() || {});
        wss.clients.forEach(c => { if (c.readyState === 1) c.send(data); });
      };
      bus?.on && bus.on('state:changed', broadcast);
      wss.on('connection', ws => {
        ws.send(JSON.stringify(globalThis.Dustland.gameState?.getState?.() || {}));
      });
      return wss;
    },
    async connect(url){
      const WS = globalThis.WebSocket || (await import('ws')).WebSocket;
      const ws = new WS(url);
      ws.onmessage = ev => {
        try {
          const data = JSON.parse(ev.data);
          globalThis.Dustland.gameState?.updateState?.(s => Object.assign(s, data));
        } catch (err) { /* ignore */ }
      };
      return ws;
    }
  };
  globalThis.Dustland.multiplayer = Multiplayer;
})();

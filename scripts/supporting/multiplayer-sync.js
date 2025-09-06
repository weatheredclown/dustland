// ===== Multiplayer Sync (prototype) =====
(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;
  const Multiplayer = {
    async startHost({ port = 7777 } = {}) {
      const WSS = globalThis.WebSocketServer || (await import('ws')).WebSocketServer;
      const wss = new WSS({ port });
      let last = {};
      const broadcast = () => {
        const state = globalThis.Dustland.gameState?.getState?.() || {};
        const diff = {};
        for (const k in state) {
          if (state[k] !== last[k]) diff[k] = state[k];
        }
        for (const k in last) {
          if (!(k in state)) diff[k] = undefined;
        }
        if (Object.keys(diff).length) {
          const data = JSON.stringify(diff);
          wss.clients.forEach(c => { if (c.readyState === 1) c.send(data); });
          last = { ...state };
        }
      };
      bus?.on && bus.on('state:changed', broadcast);
      const hb = setInterval(() => {
        wss.clients.forEach(c => {
          if (!c.isAlive) return c.terminate();
          c.isAlive = false;
          if (c.readyState === 1) c.send('{"type":"ping"}');
        });
      }, 5000);
      wss.on('connection', ws => {
        ws.isAlive = true;
        ws.on('message', msg => {
          try {
            const data = JSON.parse(msg);
            if (data.type === 'pong') ws.isAlive = true;
          } catch (err) { /* ignore */ }
        });
        ws.send(JSON.stringify(globalThis.Dustland.gameState?.getState?.() || {}));
      });
      wss.on('close', () => clearInterval(hb));
      return wss;
    },
    async connect(url){
      const WS = globalThis.WebSocket || (await import('ws')).WebSocket;
      let ws;
      const connect = () => {
        ws = new WS(url);
        let lastPing = Date.now();
        const check = setInterval(() => {
          if (Date.now() - lastPing > 10000) ws.close();
        }, 2000);
        ws.onmessage = ev => {
          try {
            const data = JSON.parse(ev.data);
            if (data.type === 'ping') {
              lastPing = Date.now();
              ws.readyState === 1 && ws.send('{"type":"pong"}');
            } else {
              globalThis.Dustland.gameState?.updateState?.(s => Object.assign(s, data));
            }
          } catch (err) { /* ignore */ }
        };
        ws.onclose = () => {
          clearInterval(check);
          setTimeout(connect, 100);
        };
      };
      connect();
      return ws;
    }
  };
  globalThis.Dustland.multiplayer = Multiplayer;
})();

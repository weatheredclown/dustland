// ===== Multiplayer Sync (prototype) =====
(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;
  const Multiplayer = {
    async startHost({ port = 7777 } = {}) {
      let WSS = globalThis.WebSocketServer;
      if (!WSS) {
        const isNode = typeof process !== 'undefined' && process.versions?.node;
        if (!isNode) {
          throw new Error('Multiplayer hosting is only supported in Node.js.');
        }
        try {
          ({ WebSocketServer: WSS } = await import('ws'));
        } catch (err) {
          throw new Error('Missing optional dependency "ws". Run `npm install ws` to enable hosting.');
        }
      }
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
      hb.unref?.();
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
      const sock = {
        _reconnect: true,
        _listeners: {},
        on(evt, fn){ (sock._listeners[evt] = sock._listeners[evt] || []).push(fn); ws.on(evt, fn); },
        send: (...a) => ws.send(...a),
        close: () => { sock._reconnect = false; ws.close(); }
      };
      const connect = () => {
        ws = new WS(url);
        Object.entries(sock._listeners).forEach(([e, fns]) => fns.forEach(fn => ws.on(e, fn)));
        let lastPing = Date.now();
        const check = setInterval(() => {
          if (Date.now() - lastPing > 10000) ws.close();
        }, 2000);
        check.unref?.();
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
          if (sock._reconnect) setTimeout(connect, 100).unref?.();
        };
      };
      connect();
      return sock;
    }
  };
  globalThis.Dustland.multiplayer = Multiplayer;
})();

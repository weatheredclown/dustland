(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;
  const base = globalThis.Dustland.multiplayer || {};
  const NET_FLAG = '__fromNet';

  async function startHost(opts){
    const wss = await base.startHost?.(opts);
    if(!wss) return wss;
    const broadcast = (obj, skip)=>{
      const data = JSON.stringify(obj);
      wss.clients.forEach(c=>{ if(c.readyState===1 && c!==skip) c.send(data); });
    };
    const relay = (evt,data)=>{ if(data && data[NET_FLAG]) return; broadcast({type:'event',evt,data}); };
    bus?.on?.('movement:player', d=>relay('movement:player',d));
    bus?.on?.('combat:event', d=>relay('combat:event',d));
    bus?.on?.('combat:started', d=>relay('combat:started',d));
    bus?.on?.('combat:ended', d=>relay('combat:ended',d));
    wss.on('connection', ws=>{
      ws.on('message', msg=>{
        try{
          const obj = JSON.parse(msg);
          if(obj?.type==='event' && obj.evt){
            obj.data = obj.data || {}; obj.data[NET_FLAG] = true;
            bus?.emit?.(obj.evt, obj.data);
            broadcast(obj, ws);
          }
        }catch{/* ignore */}
      });
    });
    return wss;
  }

  async function connect(url){
    const ws = await base.connect?.(url);
    const send = obj=> ws?.send?.(JSON.stringify(obj));
    const relay = (evt,data)=>{ if(data && data[NET_FLAG]) return; send({type:'event',evt,data}); };
    bus?.on?.('movement:player', d=>relay('movement:player',d));
    bus?.on?.('combat:event', d=>relay('combat:event',d));
    bus?.on?.('combat:started', d=>relay('combat:started',d));
    bus?.on?.('combat:ended', d=>relay('combat:ended',d));
    const orig = ws.onmessage;
    ws.onmessage = ev=>{
      try{
        const obj = JSON.parse(ev.data);
        if(obj?.type==='event' && obj.evt){
          obj.data = obj.data || {}; obj.data[NET_FLAG] = true;
          bus?.emit?.(obj.evt, obj.data);
        } else {
          globalThis.Dustland.gameState?.updateState?.(s=>Object.assign(s,obj));
        }
      }catch{
        if(typeof orig==='function') orig(ev);
      }
    };
    return ws;
  }

  globalThis.Dustland.multiplayer = { startHost, connect };
})();

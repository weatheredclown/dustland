(function(){
  const bunkers = globalThis.Dustland?.bunkers || [];
  const moduleMap = {
    alpha: { script: 'modules/world-one.module.js', global: 'WORLD_ONE_MODULE', name: 'World One', map: 'world', x: 4, y: 2 },
    beta: { script: 'modules/world-two.module.js', global: 'WORLD_TWO_MODULE', name: 'World Two', map: 'world', x: 4, y: 2 }
  };

  function ensureModule(id, cb){
    const info = moduleMap[id];
    if(!info) return;
    if(globalThis[info.global]){ cb(globalThis[info.global]); return; }
    const script = document.createElement('script');
    script.src = info.script;
    script.onload = () => cb(globalThis[info.global]);
    document.head.appendChild(script);
  }

  function open(fromId){
    const overlay = document.createElement('div');
    overlay.id = 'worldMap';
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.8)';
    overlay.style.color = '#fff';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    const list = document.createElement('div');
    bunkers.filter(b => b.active && b.id !== fromId).forEach(b => {
      const info = moduleMap[b.id] || {};
      const btn = document.createElement('button');
      btn.textContent = info.name || b.id;
      btn.style.margin = '4px';
      btn.onclick = () => travel(fromId, b.id);
      list.appendChild(btn);
    });
    const cancel = document.createElement('button');
    cancel.textContent = 'Cancel';
    cancel.style.marginTop = '8px';
    cancel.onclick = close;
    overlay.appendChild(list);
    overlay.appendChild(cancel);
    document.body.appendChild(overlay);
  }

  function close(){
    document.getElementById('worldMap')?.remove();
  }

  function travel(fromId, toId){
    if(!globalThis.Dustland?.fastTravel?.travel(fromId, toId)) return;
    ensureModule(toId, moduleData => {
      moduleData.postLoad?.(moduleData);
      applyModule(moduleData, { fullReset: false });
      const info = moduleMap[toId];
      if(info){
        setMap(info.map, info.name);
        setPartyPos(info.x, info.y);
      }
    });
    close();
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.worldMap = { open, close };
})();

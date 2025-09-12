(function(){
  const bunkers = globalThis.Dustland?.bunkers || [];
  const moduleMap = {
    alpha: { script: 'modules/world-one.module.js', global: 'WORLD_ONE_MODULE', name: 'World One', map: 'world', x: 4, y: 2 },
    beta: { script: 'modules/world-two.module.js', global: 'WORLD_TWO_MODULE', name: 'World Two', map: 'world', x: 6, y: 3 }
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
    list.style.display = 'flex';
    bunkers.filter(b => b.active && b.id !== fromId).forEach(b => {
      const info = moduleMap[b.id] || {};
      ensureModule(b.id, moduleData => {
        const thumb = renderThumb(moduleData, info);
        thumb.style.margin = '4px';
        thumb.style.cursor = 'pointer';
        thumb.title = info.name || b.id;
        thumb.onclick = () => {
          const ft = globalThis.Dustland?.fastTravel;
          const cost = ft?.fuelCost?.(fromId, b.id) || 0;
          const fuel = globalThis.player?.fuel || 0;
          const name = info.name || b.id;
          if(fuel < cost){ alert(`Need ${cost} fuel to travel.`); return; }
          if(confirm(`Travel to ${name} for ${cost} fuel?`)) travel(fromId, b.id);
        };
        list.appendChild(thumb);
      });
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
    const ft = globalThis.Dustland?.fastTravel;
    ft?.saveSlot?.(fromId);
    if(!ft?.travel(fromId, toId)) return;
    if(ft?.loadSlot?.(toId)){ close(); return; }
    ensureModule(toId, moduleData => {
      moduleData.postLoad?.(moduleData);
      applyModule(moduleData);
      const info = moduleMap[toId];
      if(info){
        setMap(info.map, info.name);
        setPartyPos(info.x, info.y);
      }
      ft?.saveSlot?.(toId);
      close();
    });
  }

  function renderThumb(moduleData, info){
    const canvas = document.createElement('canvas');
    const world = moduleData?.world;
    const scale = 1;
    if(Array.isArray(world) && world[0]){
      canvas.width = world[0].length * scale;
      canvas.height = world.length * scale;
      const ctx = canvas.getContext('2d');
      world.forEach((row, y) => row.forEach((t, x) => {
        const hasTile = t !== undefined && t !== null;
        ctx.fillStyle = hasTile ? '#6b8' : '#000';
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }));
      if(info){
        ctx.fillStyle = '#f00';
        ctx.fillRect(info.x * scale, info.y * scale, scale, scale);
      }
    }else{
      canvas.width = canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#222';
      ctx.fillRect(0,0,32,32);
      ctx.fillStyle = '#fff';
      ctx.fillText('?',12,20);
    }
    canvas.style.imageRendering = 'pixelated';
    return canvas;
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.worldMap = { open, close };
})();

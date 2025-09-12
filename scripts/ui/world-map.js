(function(){
  function ensureModule(info, cb){
    const { script, global: globalName, module: moduleName } = info || {};
    const loaded = globalThis.Dustland?.loadedModules?.[moduleName];
    if(loaded){ cb(loaded); return; }
    if(globalName && globalThis[globalName]){
      const mod = globalThis[globalName];
      (globalThis.Dustland.loadedModules ||= {})[mod.name] = mod;
      cb(mod); return;
    }
    if(script){
      const el = document.createElement('script');
      el.src = script;
      el.onload = () => {
        const mod = globalName ? globalThis[globalName] : null;
        if(mod) (globalThis.Dustland.loadedModules ||= {})[mod.name] = mod;
        cb(mod);
      };
      document.head.appendChild(el);
    } else {
      cb(null);
    }
  }

  function gatherBunkers(cb){
    const result = (globalThis.Dustland?.bunkers || []).map(b => ({ ...b }));
    const dl = globalThis.Dustland || {};
    const cur = dl.currentModule;
    const mods = dl.moduleProps?.[cur]?.fastTravelModules || [];
    let pending = mods.length;
    if(!pending){ cb(result); return; }
    mods.forEach(m => {
      ensureModule(m, moduleData => {
        if(moduleData){
          (dl.moduleProps ||= {})[moduleData.name] = { ...(moduleData.props || {}), script: m.script, global: m.global };
          (moduleData.buildings || []).forEach(b => {
            if(b.bunker){
              const id = b.bunkerId || `bunker_${b.x}_${b.y}`;
              result.push({ id, x: b.doorX, y: b.doorY, map: 'world', module: moduleData.name, script: m.script, global: m.global, name: moduleData.name, active: b.boarded !== true });
            }
          });
        }
        if(--pending === 0) cb(result);
      });
    });
  }

  function open(fromId){
    gatherBunkers(bunkers => {
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
        ensureModule(b, moduleData => {
          const thumb = renderThumb(moduleData, b);
          thumb.style.margin = '4px';
          thumb.style.cursor = 'pointer';
          thumb.title = b.name || b.id;
          thumb.onclick = () => {
            const ft = globalThis.Dustland?.fastTravel;
            const cost = ft?.fuelCost?.(fromId, b.id) || 0;
            const fuel = globalThis.player?.fuel || 0;
            const name = b.name || b.id;
            if(fuel < cost){ alert(`Need ${cost} fuel to travel.`); return; }
            if(confirm(`Travel to ${name} for ${cost} fuel?`)) travel(fromId, b);
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
    });
  }

  function close(){
    document.getElementById('worldMap')?.remove();
  }

  function travel(fromId, dest){
    const ft = globalThis.Dustland?.fastTravel;
    ft?.saveSlot?.(fromId);
    if(!ft?.travel(fromId, dest.id)) return;
    if(ft?.loadSlot?.(dest.id)){ close(); return; }
    ensureModule(dest, moduleData => {
      const cur = globalThis.Dustland?.currentModule;
      if(moduleData && dest.module !== cur){
        moduleData.postLoad?.(moduleData);
        applyModule(moduleData);
      }
      if(dest.map !== undefined){
        setMap(dest.map, dest.name);
        if(dest.x !== undefined && dest.y !== undefined) setPartyPos(dest.x, dest.y);
      }
      ft?.saveSlot?.(dest.id);
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
      if(info && info.x !== undefined && info.y !== undefined){
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

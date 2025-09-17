(function(){
  function ensureModule(info, cb){
    const { script, global: globalName, module: moduleName } = info ?? {};
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
    const result = (globalThis.Dustland?.bunkers ?? []).map(b => ({ ...b }));
    const dl = globalThis.Dustland ?? {};
    const cur = dl.currentModule;
    const mods = dl.moduleProps?.[cur]?.fastTravelModules ?? [];
    let pending = mods.length;
    if(!pending){ cb(result); return; }
    mods.forEach(m => {
      ensureModule(m, moduleData => {
        if(moduleData){
          const moduleName = moduleData.name || moduleData.seed || m.module || '';
          if(moduleName && !moduleData.name) moduleData.name = moduleName;
          if(moduleName){
            (dl.moduleProps ||= {})[moduleName] = { ...(moduleData.props ?? {}), script: m.script, global: m.global };
          }
          const ft = globalThis.Dustland?.fastTravel;
          (moduleData.buildings ?? []).forEach(b => {
            if(!b.bunker) return;
            const id = b.bunkerId ?? `bunker_${b.x}_${b.y}`;
            const doorX = typeof b.doorX === 'number' ? b.doorX : b.x + Math.floor((b.w ?? 1) / 2);
            const doorY = typeof b.doorY === 'number' ? b.doorY : b.y + (b.h ?? 1) - 1;
            const entry = {
              id,
              x: doorX,
              y: doorY,
              map: 'world',
              module: moduleName || id,
              script: m.script,
              global: m.global,
              name: moduleName || id,
              active: b.boarded !== true
            };
            const network = ft?.networkFor?.(moduleName);
            if(network) entry.network = network;
            ft?.upsertBunkers?.([entry]);
            const existing = result.find(r => r.id === id);
            if(existing){
              Object.assign(existing, entry);
            } else {
              result.push({ ...entry });
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

      const svgNS = 'http://www.w3.org/2000/svg';
      const width = 400;
      const height = 300;
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', width);
      svg.setAttribute('height', height);
      svg.style.background = '#222';
      svg.style.border = '2px solid #fff';

      const ft = globalThis.Dustland?.fastTravel;
      const origin = bunkers.find(b => b.id === fromId);
      const originNet = origin?.network ?? (origin?.module ? ft?.networkFor?.(origin.module) : 'global');
      const dests = bunkers.filter(b => {
        if(!b.active || b.id === fromId) return false;
        const destNet = b.network ?? (b.module ? ft?.networkFor?.(b.module) : 'global');
        return (originNet ?? 'global') === (destNet ?? 'global');
      });
      const pts = [];
      dests.forEach((b, i) => {
        ensureModule(b, () => {
          const x = (i + 1) / (dests.length + 1) * width;
          const y = height / 2;
          if(i){
            const p = pts[i - 1];
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', p.x);
            line.setAttribute('y1', p.y);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#888');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
          }
          const circle = document.createElementNS(svgNS, 'circle');
          circle.setAttribute('cx', x);
          circle.setAttribute('cy', y);
          circle.setAttribute('r', 8);
          circle.setAttribute('fill', '#fff');
          circle.style.cursor = 'pointer';
          circle.title = b.name ?? b.id;
          circle.onclick = () => {
            const ft = globalThis.Dustland?.fastTravel;
            const cost = ft?.fuelCost?.(fromId, b.id);
            const fuel = globalThis.player?.fuel ?? 0;
            const name = b.name ?? b.id;
            if(!Number.isFinite(cost)){
              const msg = 'Fast travel destination unavailable.';
              if(typeof log === 'function') log(msg);
              if(typeof toast === 'function') toast(msg);
              globalThis.Dustland?.eventBus?.emit?.('sfx', 'denied');
              return;
            }
            if(fuel < cost){
              const msg = `Need ${cost} fuel to travel.`;
              if(typeof log === 'function') log(msg);
              if(typeof toast === 'function') toast(msg);
              globalThis.Dustland?.eventBus?.emit?.('sfx', 'denied');
              return;
            }
            if(confirm(`Travel to ${name} for ${cost} fuel?`)) travel(fromId, b);
          };
          svg.appendChild(circle);

          const text = document.createElementNS(svgNS, 'text');
          text.setAttribute('x', x + 10);
          text.setAttribute('y', y + 4);
          text.setAttribute('fill', '#fff');
          text.textContent = b.name ?? b.id;
          svg.appendChild(text);

          pts.push({ x, y });
        });
      });

      overlay.appendChild(svg);
      const cancel = document.createElement('button');
      cancel.textContent = 'Cancel';
      cancel.style.marginTop = '8px';
      cancel.onclick = close;
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

  const dl = globalThis.Dustland = globalThis.Dustland ?? {};
  const mapApi = dl.worldMap || {};
  mapApi.open = open;
  mapApi.close = close;
  mapApi._gatherBunkers = gatherBunkers;
  dl.worldMap = mapApi;
})();

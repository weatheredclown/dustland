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

      const fuel = globalThis.player?.fuel ?? 0;
      const fuelInfo = document.createElement('div');
      fuelInfo.textContent = `Fuel available: ${fuel}`;
      fuelInfo.style.marginBottom = '12px';
      fuelInfo.style.fontSize = '0.95rem';

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
      let originNode = origin;
      if(!originNode && fromId){
        originNode = { id: fromId, name: fromId, active: true, _skipEnsure: true };
      }
      if(originNode && !originNode.module){
        originNode.module = origin?.module ?? 'global';
      }
      const nodes = dests.slice();
      if(originNode) nodes.unshift(originNode);

      const groups = new Map();
      nodes.forEach(node => {
        const key = node.module ?? 'global';
        if(!groups.has(key)) groups.set(key, []);
        groups.get(key).push(node);
      });
      const originModuleKey = originNode?.module ?? nodes[0]?.module ?? 'global';
      const moduleOrder = Array.from(groups.keys());
      moduleOrder.sort((a, b) => {
        if(a === originModuleKey) return -1;
        if(b === originModuleKey) return 1;
        return a.localeCompare(b);
      });
      const margin = 40;
      const innerWidth = width - margin * 2;
      const innerHeight = height - margin * 2;
      const coordsById = new Map();
      moduleOrder.forEach((moduleName, idx) => {
        const columnNodes = (groups.get(moduleName) || []).slice().sort((a, b) => {
          if(a.id === originNode?.id) return -1;
          if(b.id === originNode?.id) return 1;
          const aLabel = a.name ?? a.id ?? '';
          const bLabel = b.name ?? b.id ?? '';
          return aLabel.localeCompare(bLabel);
        });
        const columnCount = Math.max(1, moduleOrder.length);
        const xFraction = columnCount === 1 ? 0.5 : idx / (columnCount - 1);
        const x = margin + innerWidth * xFraction;
        columnNodes.forEach((node, rowIdx) => {
          const rowCount = Math.max(1, columnNodes.length);
          const yFraction = rowCount === 1 ? 0.5 : rowIdx / (rowCount - 1);
          const y = margin + innerHeight * yFraction;
          coordsById.set(node.id, { x, y });
        });
      });
      const originPos = originNode ? coordsById.get(originNode.id) : null;

      nodes.forEach(b => {
        const render = () => {
          const pos = coordsById.get(b.id) || { x: width / 2, y: height / 2 };
          const isOrigin = originNode && b.id === originNode.id;
          if(!isOrigin && originNode && originPos){
            const path = document.createElementNS(svgNS, 'path');
            const pathData = `M${originPos.x},${originPos.y} H${pos.x} V${pos.y}`;
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#666');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            svg.appendChild(path);
          }
          const circle = document.createElementNS(svgNS, 'circle');
          circle.setAttribute('cx', pos.x);
          circle.setAttribute('cy', pos.y);
          circle.setAttribute('r', isOrigin ? 10 : 8);
          const ftApi = globalThis.Dustland?.fastTravel;
          const estimatedCost = isOrigin ? 0 : ftApi?.fuelCost?.(fromId, b.id);
          const reachable = isOrigin || Number.isFinite(estimatedCost);
          circle.setAttribute('fill', isOrigin ? '#0ff' : (reachable ? '#fff' : '#555'));
          if(isOrigin){
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');
            circle.style.cursor = 'default';
          } else {
            circle.style.cursor = reachable ? 'pointer' : 'not-allowed';
          }
          circle.title = b.name ?? b.id;
          if(!isOrigin){
            circle.onclick = () => {
              const ft = globalThis.Dustland?.fastTravel;
              const cost = ft?.fuelCost?.(fromId, b.id);
              const fuelAvailable = globalThis.player?.fuel ?? 0;
              const name = b.name ?? b.id;
              if(!Number.isFinite(cost)){
                const msg = 'Fast travel destination unavailable.';
                if(typeof log === 'function') log(msg);
                if(typeof toast === 'function') toast(msg);
                globalThis.Dustland?.eventBus?.emit?.('sfx', 'denied');
                return;
              }
              if(fuelAvailable < cost){
                const msg = `Need ${cost} fuel to travel.`;
                if(typeof log === 'function') log(msg);
                if(typeof toast === 'function') toast(msg);
                globalThis.Dustland?.eventBus?.emit?.('sfx', 'denied');
                return;
              }
              if(confirm(`Travel to ${name} for ${cost} fuel?`)) travel(fromId, b);
            };
          }
          svg.appendChild(circle);

          const text = document.createElementNS(svgNS, 'text');
          text.setAttribute('x', pos.x + 12);
          text.setAttribute('y', pos.y + 4);
          text.setAttribute('fill', '#fff');
          text.style.fontSize = '0.875rem';
          const moduleLabel = b.module && b.module !== originNode?.module ? ` • ${b.module}` : '';
          if(isOrigin){
            text.style.fontWeight = 'bold';
            text.textContent = `Current: ${b.name ?? b.id}${moduleLabel}`;
          } else {
            const status = Number.isFinite(estimatedCost) ? `Fuel ${estimatedCost}` : 'Locked';
            text.textContent = `${b.name ?? b.id}${moduleLabel} — ${status}`;
          }
          svg.appendChild(text);
        };
        if(b?._skipEnsure){
          render();
        } else {
          ensureModule(b, render);
        }
      });

      overlay.appendChild(fuelInfo);
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

type ModuleInfo = {
  module?: string;
  script?: string;
  global?: string;
  name?: string;
  seed?: string;
  props?: Record<string, unknown>;
  buildings?: BunkerEntry[];
  postLoad?: (moduleData: ModuleInfo) => void;
} & Record<string, unknown>;

type BunkerEntry = ModuleInfo & {
  id?: string;
  bunker?: boolean;
  bunkerId?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  doorX?: number;
  doorY?: number;
  map?: string;
  name?: string;
  active?: boolean;
  network?: string;
  _skipEnsure?: boolean;
};

type DustlandFastTravel = {
  networkFor?: (moduleName?: string) => string | undefined;
  upsertBunkers?: (entries: BunkerEntry[]) => void;
  fuelCost?: (fromId: string | undefined, toId: string) => number;
  saveSlot?: (id: string | undefined) => void;
  travel?: (fromId: string | undefined, toId: string | undefined) => boolean;
  loadSlot?: (id: string | undefined) => boolean;
};

type DustlandModuleProps = {
  fastTravelModules?: ModuleInfo[];
} & Record<string, unknown>;

type WorldMapEventBus = {
  emit?: (event: string, payload?: unknown) => void;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  off?: (event: string, listener: (...args: unknown[]) => void) => void;
};

type DustlandApi = DustlandNamespace & {
  loadedModules?: Record<string, ModuleInfo>;
  moduleProps?: Record<string, DustlandModuleProps>;
  fastTravel?: DustlandFastTravel;
  eventBus?: WorldMapEventBus;
  bunkers?: BunkerEntry[];
  currentModule?: string;
  worldMap?: {
    open?: (fromId?: string) => void;
    close?: () => void;
    _gatherBunkers?: (cb: (entries: BunkerEntry[]) => void) => void;
  };
} & Record<string, unknown>;

type WorldMapDustlandGlobal = typeof globalThis & {
  Dustland?: DustlandApi;
  log?: (message: string) => void;
  toast?: (message: string) => void;
};

(function(){
  const global = globalThis as WorldMapDustlandGlobal & Record<string, unknown>;
  const dl: DustlandApi = (global.Dustland ??= {} as DustlandApi);

  function ensureModule(info: ModuleInfo | null | undefined, cb: (mod: ModuleInfo | null) => void){
    const { script, global: globalName, module: moduleName } = info ?? {};
    const loaded = moduleName ? dl.loadedModules?.[moduleName] : undefined;
    if(loaded){ cb(loaded); return; }
    if(globalName){
      const mod = (global as Record<string, ModuleInfo | undefined>)[globalName] ?? null;
      if(mod){
        const key = mod.name ?? moduleName ?? globalName;
        (dl.loadedModules ??= {})[key] = mod;
        cb(mod);
        return;
      }
    }
    if(script){
      const el = document.createElement('script');
      el.src = script;
      el.onload = () => {
        const mod = globalName ? (global as Record<string, ModuleInfo | undefined>)[globalName] ?? null : null;
        if(mod){
          const key = mod.name ?? moduleName ?? globalName;
          (dl.loadedModules ??= {})[key] = mod;
        }
        cb(mod);
      };
      document.head.appendChild(el);
    } else {
      cb(null);
    }
  }

  function gatherBunkers(cb: (entries: BunkerEntry[]) => void){
    const result = (dl.bunkers ?? []).map(b => ({ ...b }));
    const cur = dl.currentModule;
    const mods = dl.moduleProps?.[cur ?? '']?.fastTravelModules ?? [];
    let pending = mods.length;
    if(!pending){ cb(result); return; }
    mods.forEach(m => {
      ensureModule(m, moduleData => {
        if(moduleData){
          const moduleName = (moduleData.name || moduleData.seed || m.module || '') as string;
          if(moduleName && !moduleData.name) moduleData.name = moduleName;
          if(moduleName){
            (dl.moduleProps ??= {} as Record<string, DustlandModuleProps>)[moduleName] = {
              ...(moduleData.props ?? {}),
              script: m?.script,
              global: m?.global
            };
          }
          const ft = dl.fastTravel;
          (moduleData.buildings ?? []).forEach(b => {
            if(!b?.bunker) return;
            const id = b.bunkerId ?? (b.x != null && b.y != null ? `bunker_${b.x}_${b.y}` : undefined);
            if(!id) return;
            const doorX = typeof b.doorX === 'number' ? b.doorX : (typeof b.x === 'number' ? b.x + Math.floor((b.w ?? 1) / 2) : 0);
            const doorY = typeof b.doorY === 'number' ? b.doorY : (typeof b.y === 'number' ? b.y + (b.h ?? 1) - 1 : 0);
            const entry: BunkerEntry = {
              id,
              x: doorX,
              y: doorY,
              map: 'world',
              module: moduleName || id,
              script: m?.script,
              global: m?.global,
              name: moduleName || id,
              active: b.boarded !== true
            };
            const network = ft?.networkFor?.(moduleName);
            if(network) entry.network = network;
            ft?.upsertBunkers?.([entry]);
            const existing = result.find(r => r.id === id);
            if(existing){
              const wasActive = existing.active === true;
              Object.assign(existing, entry);
              if(wasActive) existing.active = true;
            } else {
              result.push({ ...entry });
            }
          });
        }
        if(--pending === 0) cb(result);
      });
    });
  }

  function open(fromId?: string){
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

      const fuel = (global.player as { fuel?: number } | undefined)?.fuel ?? 0;
      const fuelInfo = document.createElement('div');
      fuelInfo.textContent = `Fuel available: ${fuel}`;
      fuelInfo.style.marginBottom = '12px';
      fuelInfo.style.fontSize = '0.95rem';

      const svgNS = 'http://www.w3.org/2000/svg';
      const width = 400;
      const height = 300;
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', String(width));
      svg.setAttribute('height', String(height));
      svg.style.background = '#222';
      svg.style.border = '2px solid #fff';

      const ft = dl.fastTravel;
      const origin = bunkers.find(b => b.id === fromId);
      const originNet = origin?.network ?? (origin?.module ? ft?.networkFor?.(origin.module) : 'global');
      const dests = bunkers.filter(b => {
        if(!b?.active || b.id === fromId) return false;
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

      const groups = new Map<string, BunkerEntry[]>();
      nodes.forEach(node => {
        const key = node.module ?? 'global';
        if(!groups.has(key)) groups.set(key, []);
        groups.get(key)?.push(node);
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
      const coordsById = new Map<string, { x: number; y: number }>();
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
          if(node.id) coordsById.set(node.id, { x, y });
        });
      });
      const originPos = originNode?.id ? coordsById.get(originNode.id) ?? null : null;

      nodes.forEach(b => {
        const render = () => {
          const pos = (b.id ? coordsById.get(b.id) : null) || { x: width / 2, y: height / 2 };
          const isOrigin = Boolean(originNode && b.id === originNode.id);
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
          circle.setAttribute('cx', String(pos.x));
          circle.setAttribute('cy', String(pos.y));
          const radius = isOrigin ? 10 : 8;
          circle.setAttribute('r', String(radius));
          (circle as unknown as { r?: number }).r = radius;
          const ftApi = dl.fastTravel;
          const estimatedCost = isOrigin ? 0 : (b.id ? ftApi?.fuelCost?.(fromId, b.id) : undefined);
          const reachable = isOrigin || Number.isFinite(estimatedCost);
          circle.setAttribute('fill', isOrigin ? '#0ff' : (reachable ? '#fff' : '#555'));
          if(isOrigin){
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '2');
            circle.style.cursor = 'default';
          } else {
            circle.style.cursor = reachable ? 'pointer' : 'not-allowed';
          }
          circle.setAttribute('title', b.name ?? b.id ?? '');
          if(!isOrigin){
            circle.onclick = () => {
              const ftApiInner = dl.fastTravel;
              const cost = b.id ? ftApiInner?.fuelCost?.(fromId, b.id) : undefined;
              const fuelAvailable = (global.player as { fuel?: number } | undefined)?.fuel ?? 0;
              const name = b.name ?? b.id ?? 'Unknown';
              if(!Number.isFinite(cost)){
                const msg = 'Fast travel destination unavailable.';
                const logger = global.log;
                const toaster = global.toast;
                if(typeof logger === 'function') logger(msg);
                if(typeof toaster === 'function') toaster(msg);
                dl.eventBus?.emit?.('sfx', 'denied');
                return;
              }
              if(fuelAvailable < cost){
                const msg = `Need ${cost} fuel to travel.`;
                const logger = global.log;
                const toaster = global.toast;
                if(typeof logger === 'function') logger(msg);
                if(typeof toaster === 'function') toaster(msg);
                dl.eventBus?.emit?.('sfx', 'denied');
                return;
              }
              if(b.id && confirm(`Travel to ${name} for ${cost} fuel?`)) travel(fromId, b);
            };
          }
          svg.appendChild(circle);

          const text = document.createElementNS(svgNS, 'text');
          text.setAttribute('x', String(pos.x + 12));
          text.setAttribute('y', String(pos.y + 4));
          text.setAttribute('fill', '#fff');
          text.style.fontSize = '0.875rem';
          const moduleLabel = b.module && b.module !== originNode?.module ? ` • ${b.module}` : '';
          if(isOrigin){
            text.style.fontWeight = 'bold';
            text.textContent = `Current: ${b.name ?? b.id ?? ''}${moduleLabel}`;
          } else {
            const status = Number.isFinite(estimatedCost) ? `Fuel ${estimatedCost}` : 'Locked';
            text.textContent = `${b.name ?? b.id ?? ''}${moduleLabel} — ${status}`;
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

  function travel(fromId: string | undefined, dest: BunkerEntry){
    if(!dest.id) return;
    const ft = dl.fastTravel;
    ft?.saveSlot?.(fromId);
    if(!ft?.travel?.(fromId, dest.id)) return;
    if(ft?.loadSlot?.(dest.id)){ close(); return; }
    ensureModule(dest, moduleData => {
      const cur = globalThis.Dustland?.currentModule;
      if(moduleData && dest.module !== cur){
        moduleData.postLoad?.(moduleData);
        applyModule(moduleData);
      }
      if(dest.map !== undefined){
        setMap(dest.map, dest.name);
        if(typeof dest.x === 'number' && typeof dest.y === 'number') setPartyPos(dest.x, dest.y);
      }
      ft?.saveSlot?.(dest.id);
      close();
    });
  }

  const mapApi = dl.worldMap || {};
  mapApi.open = open;
  mapApi.close = close;
  mapApi._gatherBunkers = gatherBunkers;
  dl.worldMap = mapApi;
})();

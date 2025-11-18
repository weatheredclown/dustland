type FastTravelEventBus = {
  emit?: (event: string, payload?: unknown) => void;
};

type FastTravelModuleProps = {
  bunkerTravelScope?: string | null;
};

type FastTravelLoadedModule = {
  name?: string;
  seed?: string | number | null;
};

type FastTravelBunker = {
  id: string;
  x?: number;
  y?: number;
  active?: boolean;
  network?: string;
  module?: string;
};

type FastTravelBunkerInput = Partial<FastTravelBunker> & { id?: string | number | null };

type FastTravelPlayerState = {
  fuel?: number;
  inv?: Array<{ id?: string | null } | null | undefined>;
};

type FastTravelPartyState = {
  x?: number;
  y?: number;
};

type FastTravelDustlandRuntime = {
  eventBus?: FastTravelEventBus;
  bunkers?: FastTravelBunker[];
  moduleProps?: Record<string, FastTravelModuleProps | undefined>;
  loadedModules?: Record<string, FastTravelLoadedModule | undefined>;
  fastTravel?: unknown;
  worldMap?: { open?: (id?: string) => void };
};

type GlobalScope = typeof globalThis & {
  Dustland?: FastTravelDustlandRuntime;
  EventBus?: FastTravelEventBus;
  hasItem?: (id: string) => boolean;
  log?: (message: string) => void;
  save?: () => void;
  load?: () => void;
  player?: FastTravelPlayerState;
  party?: FastTravelPartyState;
  openWorldMap?: (id?: string) => void;
};

(function(){
  const globalScope = globalThis as GlobalScope;
  const dl = (globalScope.Dustland ||= {});
  const bus = dl.eventBus ?? globalScope.EventBus;
  const bunkers: FastTravelBunker[] = dl.bunkers ?? (dl.bunkers = [] as FastTravelBunker[]);
  const BASE_COST = 1;
  const FUEL_PER_TILE = 1;
  const CAMP_NODE_ID = 'camp';
  const saveKey = (id: string) => `dustland_slot_${id}`;

  function moduleKey(moduleName?: string){
    const runtime = globalScope.Dustland ?? {};
    if(moduleName) return moduleName;
    const key = moduleName ?? 'undefined';
    const loaded = runtime.loadedModules?.[key];
    if(loaded?.name) return loaded.name;
    if(loaded?.seed != null) return String(loaded.seed);
    return 'module';
  }

  function networkFor(moduleName?: string){
    const runtime = globalScope.Dustland ?? {};
    const props = runtime.moduleProps?.[moduleName ?? ''] ?? {};
    const scope = props.bunkerTravelScope || 'global';
    if(scope === 'module'){
      const key = moduleKey(moduleName);
      return `module:${key}`;
    }
    return scope || 'global';
  }

  function normalize(entry: FastTravelBunkerInput | null | undefined){
    if(!entry) return null;
    const { id, ...rest } = entry;
    if (id == null) {
      return null;
    }
    const normalized: FastTravelBunker = {
      ...rest,
      id: String(id),
    };
    if(!normalized.network){
      const net = networkFor(normalized.module);
      if(net) normalized.network = net;
    }
    if(!normalized.module && typeof normalized.module !== 'string'){
      normalized.module = undefined;
    }
    return normalized;
  }

  function hasTravelPass(){
    const hasItemFn = globalScope.hasItem;
    if(typeof hasItemFn === 'function' && hasItemFn('travel_pass')) return true;
    const inv = globalScope.player?.inv;
    if(Array.isArray(inv)){
      return inv.some(it => it && it.id === 'travel_pass');
    }
    return false;
  }

  function distance(a: FastTravelBunker, b: FastTravelBunker){
    const ax = a.x ?? 0;
    const ay = a.y ?? 0;
    const bx = b.x ?? 0;
    const by = b.y ?? 0;
    return Math.abs(ax - bx) + Math.abs(ay - by);
  }

  function fuelCost(fromId: string, toId: string){
    const from = bunkers.find(b => b.id === fromId);
    const to = bunkers.find(b => b.id === toId);
    const fromIsCamp = fromId === CAMP_NODE_ID;
    if((!from && !fromIsCamp) || !to) return Infinity;
    const fromNet = fromIsCamp ? 'global' : (from.network ?? 'global');
    const toNet = to.network ?? 'global';
    if(fromNet !== toNet) return Infinity;
    if(hasTravelPass()) return 0;
    const dist = fromIsCamp ? 0 : distance(from!, to);
    return BASE_COST + dist * FUEL_PER_TILE;
  }

  function travel(fromId: string, toId: string){
    const from = bunkers.find(b => b.id === fromId);
    const to = bunkers.find(b => b.id === toId);
    const fromIsCamp = fromId === CAMP_NODE_ID;
    if((!from && !fromIsCamp) || !to || !to.active) return false;
    if(from && !from.active) return false;
    const fromNet = fromIsCamp ? 'global' : (from.network ?? 'global');
    const toNet = to.network ?? 'global';
    if(fromNet !== toNet) return false;
    const cost = fuelCost(fromId, toId);
    const player = (globalScope.player ||= {});
    player.fuel = player.fuel || 0;
    if(!Number.isFinite(cost)){
      if(typeof globalScope.log === 'function') globalScope.log('Fast travel destination unavailable.');
      return false;
    }
    if(player.fuel < cost){
      if(typeof globalScope.log === 'function') globalScope.log('Not enough fuel.');
      return false;
    }
    bus?.emit('travel:start', { fromId, toId, cost });
    player.fuel -= cost;
    const party = globalScope.party;
    if(party){
      party.x = to.x;
      party.y = to.y;
    }
    bus?.emit('travel:end', { fromId, toId, result: 'ok' });
    return true;
  }

  function upsertBunkers(list: FastTravelBunkerInput[] | null | undefined){
    if(!Array.isArray(list) || !list.length) return bunkers;
    list.forEach(entry => {
      const normalized = normalize(entry);
      if(!normalized || !normalized.id) return;
      const existing = bunkers.find(b => b.id === normalized.id);
      if(existing){
        Object.assign(existing, normalized);
      } else {
        bunkers.push(normalized);
      }
    });
    return bunkers;
  }

  function saveSlot(id: string){
    const saveFn = globalScope.save;
    const storage = globalScope.localStorage;
    if(!id || typeof saveFn !== 'function' || !storage) return;
    saveFn();
    const data = storage.getItem('dustland_crt');
    if(data) storage.setItem(saveKey(id), data);
  }

  function loadSlot(id: string){
    const loadFn = globalScope.load;
    const storage = globalScope.localStorage;
    if(!id || typeof loadFn !== 'function' || !storage) return false;
    const data = storage.getItem(saveKey(id));
    if(!data) return false;
    storage.setItem('dustland_crt', data);
    loadFn();
    return true;
  }

  function activateBunker(id: string){
    const bunker = bunkers.find(b => b.id === id);
    if (bunker) {
      bunker.active = true;
      if (typeof globalScope.log === 'function') globalScope.log(`Bunker ${id} activated.`);
    }
  }

  globalScope.Dustland = dl;
  dl.fastTravel = { fuelCost, travel, activateBunker, saveSlot, loadSlot, upsertBunkers, networkFor };
  globalScope.openWorldMap = globalScope.openWorldMap || function(id){
    dl.worldMap?.open?.(id);
  };
})();

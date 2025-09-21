(function(){
  const dl = globalThis.Dustland = globalThis.Dustland || {};
  const bus = dl.eventBus || globalThis.EventBus;
  const bunkers = dl.bunkers || (dl.bunkers = []);
  const BASE_COST = 1;
  const FUEL_PER_TILE = 1;
  const saveKey = id => `dustland_slot_${id}`;

  function moduleKey(moduleName){
    const dl = globalThis.Dustland ?? {};
    if(moduleName) return moduleName;
    const loaded = dl.loadedModules?.[moduleName];
    if(loaded?.name) return loaded.name;
    if(loaded?.seed != null) return String(loaded.seed);
    return 'module';
  }

  function networkFor(moduleName){
    const dl = globalThis.Dustland ?? {};
    const props = dl.moduleProps?.[moduleName] ?? {};
    const scope = props.bunkerTravelScope || 'global';
    if(scope === 'module'){
      const key = moduleKey(moduleName);
      return `module:${key}`;
    }
    return scope || 'global';
  }

  function normalize(entry){
    if(!entry) return null;
    const normalized = { ...entry };
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
    if(typeof hasItem === 'function' && hasItem('travel_pass')) return true;
    const inv = globalThis.player?.inv;
    if(Array.isArray(inv)){
      return inv.some(it => it && it.id === 'travel_pass');
    }
    return false;
  }

  function distance(a, b){
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  function fuelCost(fromId, toId){
    const from = bunkers.find(b => b.id === fromId);
    const to = bunkers.find(b => b.id === toId);
    if(!from || !to) return Infinity;
    const fromNet = from.network ?? 'global';
    const toNet = to.network ?? 'global';
    if(fromNet !== toNet) return Infinity;
    if(hasTravelPass()) return 0;
    return BASE_COST + distance(from, to) * FUEL_PER_TILE;
  }

  function travel(fromId, toId){
    const from = bunkers.find(b => b.id === fromId);
    const to = bunkers.find(b => b.id === toId);
    if(!from || !to || !from.active || !to.active) return false;
    const fromNet = from.network ?? 'global';
    const toNet = to.network ?? 'global';
    if(fromNet !== toNet) return false;
    const cost = fuelCost(fromId, toId);
    const player = globalThis.player || {};
    player.fuel = player.fuel || 0;
    if(!Number.isFinite(cost)){
      if(typeof log === 'function') log('Fast travel destination unavailable.');
      return false;
    }
    if(player.fuel < cost){
      if(typeof log === 'function') log('Not enough fuel.');
      return false;
    }
    bus?.emit('travel:start', { fromId, toId, cost });
    player.fuel -= cost;
    const party = globalThis.party;
    if(party){
      party.x = to.x;
      party.y = to.y;
    }
    bus?.emit('travel:end', { fromId, toId, result: 'ok' });
    return true;
  }

  function upsertBunkers(list){
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

  function saveSlot(id){
    if(!id || typeof save !== 'function' || !globalThis.localStorage) return;
    save();
    const data = localStorage.getItem('dustland_crt');
    if(data) localStorage.setItem(saveKey(id), data);
  }

  function loadSlot(id){
    if(!id || typeof load !== 'function' || !globalThis.localStorage) return false;
    const data = localStorage.getItem(saveKey(id));
    if(!data) return false;
    localStorage.setItem('dustland_crt', data);
    load();
    return true;
  }

  function activateBunker(id){
    const bunker = bunkers.find(b => b.id === id);
    if (bunker) {
      bunker.active = true;
      if (typeof log === 'function') log(`Bunker ${id} activated.`);
    }
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.fastTravel = { fuelCost, travel, activateBunker , saveSlot, loadSlot, upsertBunkers, networkFor };
  globalThis.openWorldMap = globalThis.openWorldMap || function(id){
    globalThis.Dustland?.worldMap?.open?.(id);
  };
})();

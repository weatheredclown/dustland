(function(){
  const bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;
  const bunkers = globalThis.Dustland?.bunkers || [];
  const BASE_COST = 1;
  const FUEL_PER_TILE = 1;
  const saveKey = id => `dustland_slot_${id}`;

  function distance(a, b){
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  function fuelCost(fromId, toId){
    const from = bunkers.find(b => b.id === fromId);
    const to = bunkers.find(b => b.id === toId);
    if(!from || !to) return Infinity;
    return BASE_COST + distance(from, to) * FUEL_PER_TILE;
  }

  function travel(fromId, toId){
    const from = bunkers.find(b => b.id === fromId);
    const to = bunkers.find(b => b.id === toId);
    if(!from || !to || !from.active || !to.active) return false;
    const cost = fuelCost(fromId, toId);
    const player = globalThis.player || {};
    player.fuel = player.fuel || 0;
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
  globalThis.Dustland.fastTravel = { fuelCost, travel, activateBunker , saveSlot, loadSlot};
  globalThis.openWorldMap = globalThis.openWorldMap || function(id){
    globalThis.Dustland?.worldMap?.open?.(id);
  };
})();

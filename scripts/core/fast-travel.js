(function(){
  const bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;
  const bunkers = globalThis.Dustland?.bunkers || [];
  const FUEL_RATE = 1; // fuel cells per tile

  function distance(a, b){
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx*dx + dy*dy);
  }

  function fuelCost(fromId, toId){
    const from = bunkers.find(b => b.id === fromId);
    const to = bunkers.find(b => b.id === toId);
    if(!from || !to) return Infinity;
    return Math.ceil(distance(from, to) * FUEL_RATE);
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
    bus?.emit('travel:start', { from: fromId, to: toId, cost });
    player.fuel -= cost;
    const party = globalThis.party;
    if(party){
      party.x = to.x;
      party.y = to.y;
    }
    bus?.emit('travel:end', { from: fromId, to: toId, cost });
    return true;
  }

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.fastTravel = { fuelCost, travel };
})();

(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;

  function craftSignalBeacon(){
    const scrapCost = 5;
    const fuelCost = 50;
    if ((player.scrap || 0) < scrapCost){
      log('Need 5 scrap.');
      return;
    }
    if ((player.fuel || 0) < fuelCost){
      log('Need 50 fuel.');
      return;
    }
    player.scrap -= scrapCost;
    player.fuel -= fuelCost;
    addToInv('signal_beacon');
    bus?.emit('craft:signal-beacon');
    log('Crafted a signal beacon.');
  }

  function craftSolarTarp(){
    const scrapCost = 3;
    if ((player.scrap || 0) < scrapCost){
      log('Need 3 scrap.');
      return;
    }
    if (!hasItem('cloth')){
      log('Need cloth.');
      return;
    }
    player.scrap -= scrapCost;
    const idx = findItemIndex('cloth');
    if (idx >= 0) removeFromInv(idx);
    addToInv('solar_tarp');
    bus?.emit('craft:solar-tarp');
    log('Crafted a solar panel tarp.');
  }

  function craftBandage(){
    if (!hasItem('plant_fiber')){
      log('Need plant fiber.');
      return;
    }
    const idx = findItemIndex('plant_fiber');
    if (idx >= 0) removeFromInv(idx);
    addToInv('bandage');
    bus?.emit('craft:bandage');
    log('Crafted a bandage.');
  }

  Dustland.workbench = { craftSignalBeacon, craftSolarTarp, craftBandage };
})();

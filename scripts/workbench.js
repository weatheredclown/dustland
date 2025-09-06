(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;

  function craftSignalBeacon(){
    const scrapCost = 5;
    if ((player.scrap || 0) < scrapCost){
      log('Need 5 scrap.');
      return;
    }
    if (!hasItem('power_cell')){
      log('Need a power cell.');
      return;
    }
    player.scrap -= scrapCost;
    const idx = findItemIndex('power_cell');
    if (idx >= 0) removeFromInv(idx);
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

  Dustland.workbench = { craftSignalBeacon, craftSolarTarp };
})();

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

  Dustland.workbench = { craftSignalBeacon };
})();

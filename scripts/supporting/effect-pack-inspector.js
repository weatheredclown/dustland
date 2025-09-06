(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;
  let packs = {};

  function load(text){
    try {
      packs = JSON.parse(text) || {};
    } catch(e){
      log?.('Invalid effect pack');
      packs = {};
    }
  }

  function fire(evt){
    const list = packs[evt];
    if (list) {
      Dustland.effects?.apply(list);
      bus?.emit('effect-pack:fire', { evt });
    }
  }

  Dustland.effectPackInspector = { load, fire };
})();

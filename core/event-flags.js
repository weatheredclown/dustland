globalThis.Dustland = globalThis.Dustland || {};
(function(){
  const bus = globalThis.Dustland.eventBus;
  function watchEventFlag(evt, flag){
    if(!evt || !flag || !bus?.on) return;
    bus.on(evt, () => incFlag?.(flag));
  }
  function clearFlag(flag){
    if(!flag) return;
    const v = typeof flagValue === 'function' ? flagValue(flag) : 0;
    if(v) incFlag?.(flag, -v);
    if(party?.flags) delete party.flags[flag];
  }
  globalThis.Dustland.eventFlags = { watchEventFlag, clearFlag };
})();

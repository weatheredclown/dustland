(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  function watch(evt, flag){
    const bus = globalThis.Dustland.eventBus;
    if(!evt || !flag || !bus?.on) return;
    bus.on(evt, () => incFlag?.(flag));
  }
  function clear(flag){
    if(!flag) return;
    const v = typeof flagValue === 'function' ? flagValue(flag) : 0;
    if(v) incFlag?.(flag, -v);
    if(party?.flags) delete party.flags[flag];
  }
  globalThis.Dustland.eventFlags = { watch, clear };
})();

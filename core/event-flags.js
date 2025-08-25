(function(){
  function watchEventFlag(evt, flag){
    if(!evt || !flag || !globalThis.EventBus?.on) return;
    globalThis.EventBus.on(evt, () => incFlag?.(flag));
  }
  function clearFlag(flag){
    if(!flag) return;
    const v = typeof flagValue === 'function' ? flagValue(flag) : 0;
    if(v) incFlag?.(flag, -v);
    if(party?.flags) delete party.flags[flag];
  }
  Object.assign(globalThis, { watchEventFlag, clearFlag });
})();

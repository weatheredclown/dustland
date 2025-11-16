(function(){
  type PartyWithFlags = {
    flags?: Record<string, number>;
  };

  (globalThis as any).Dustland = (globalThis as any).Dustland || {};
  function watch(evt: string | undefined, flag: string | undefined){
    const bus = (globalThis as any).Dustland.eventBus;
    if(!evt || !flag || !bus?.on) return;
    bus.on(evt, () => incFlag?.(flag));
  }
  function clear(flag: string | undefined){
    if(!flag) return;
    const v = typeof flagValue === 'function' ? flagValue(flag) : 0;
    if(v) incFlag?.(flag, -v);
    const party = (globalThis as { party?: PartyWithFlags }).party;
    if(party?.flags) delete party.flags[flag];
  }
  (globalThis as any).Dustland.eventFlags = { watch, clear };
})();

(function(){
  var bus = (globalThis.Dustland && globalThis.Dustland.eventBus) || globalThis.EventBus;
  function init(member){
    if(typeof member.hydration !== 'number') member.hydration = 2;
  }
  bus?.on?.('hydration:tick', () => {
    const party = globalThis.party;
    if(!Array.isArray(party)) return;
    const zones = globalThis.Dustland?.zoneEffects || [];
    const map = party.map || 'world';
    const x = party.x;
    const y = party.y;
    let dry = false;
    for(const z of zones){
      if(z.if && !globalThis.checkFlagCondition?.(z.if)) continue;
      if((z.map||'world')!==map) continue;
      if(x<z.x || y<z.y || x>=z.x+(z.w||0) || y>=z.y+(z.h||0)) continue;
      if(z.dry){ dry = true; break; }
    }
    if(!dry) return;
    let changed = false;
    for(const m of party){
      if(typeof m.hydration === 'number' && m.hydration > 0){
        m.hydration = Math.max(0, m.hydration - 1);
        changed = true;
      }
    }
    if(changed) globalThis.updateHUD?.();
  });

  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.status = { init };
})();

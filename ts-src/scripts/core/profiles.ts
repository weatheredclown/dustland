// @ts-nocheck
// ===== Profiles =====
(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const profiles = {};
  function set(id, data){ if(id) profiles[id] = data || {}; }
  function get(id){ return profiles[id]; }
  function apply(target, id){
    const p = profiles[id];
    if(!p || !target) return;
    if(p.mods){
      target._bonus = target._bonus || {};
      for(const stat in p.mods){
        target._bonus[stat] = (target._bonus[stat] || 0) + p.mods[stat];
        target.stats && (target.stats[stat] = (target.stats[stat]||0) + p.mods[stat]);
      }
    }
    if(p.effects && globalThis.Dustland.effects){
      globalThis.Dustland.effects.apply(p.effects, { actor: target });
    }
  }
  function remove(target, id){
    const p = profiles[id];
    if(!p || !target || !p.mods) return;
    for(const stat in p.mods){
      if(target.stats) target.stats[stat] = (target.stats[stat]||0) - p.mods[stat];
      if(target._bonus) target._bonus[stat] = (target._bonus[stat]||0) - p.mods[stat];
    }
  }
  Dustland.profiles = { set, get, apply, remove };
})();

// ===== Profiles =====
(function(){
  if(!(globalThis as any).Dustland) (globalThis as any).Dustland = {};
  const dustland = (globalThis as any).Dustland;
  const registry: Record<string, DustlandProfile> = {};

  function set(id: string, data: DustlandProfile = {}): void {
    if(!id) return;
    registry[id] = data;
  }

  function get(id: string): DustlandProfile | undefined {
    if(!id) return undefined;
    return registry[id];
  }

  function apply(target: ProfiledEntity | undefined, id: string): void {
    if(!target) return;
    const profile = get(id);
    if(!profile) return;

    if(profile.mods){
      if(!target._bonus) target._bonus = {};
      const bonus = target._bonus;
      for(const [stat, delta] of Object.entries(profile.mods)){
        if(typeof delta !== 'number') continue;
        bonus[stat] = (bonus[stat] ?? 0) + delta;
        if(target.stats) target.stats[stat] = (target.stats[stat] ?? 0) + delta;
      }
    }

    if(profile.effects && dustland.effects?.apply){
      dustland.effects.apply(profile.effects, { actor: target });
    }
  }

  function remove(target: ProfiledEntity | undefined, id: string): void {
    if(!target) return;
    const profile = get(id);
    if(!profile?.mods) return;

    for(const [stat, delta] of Object.entries(profile.mods)){
      if(typeof delta !== 'number') continue;
      if(target.stats) target.stats[stat] = (target.stats[stat] ?? 0) - delta;
      if(target._bonus) target._bonus[stat] = (target._bonus[stat] ?? 0) - delta;
    }
  }

  dustland.profiles = { set, get, apply, remove };
})();

(function(){
  registerItem({
    id: 'pipe_blade',
    name: 'Pipe Blade',
    type: 'weapon',
    slot: 'weapon',
    mods: { ATK: 2, ADR: 12 }
  });
  registerItem({
    id: 'stun_baton',
    name: 'Stun Baton',
    type: 'weapon',
    slot: 'weapon',
    mods: { ATK: 1, ADR: 15, adrenaline_gen_mod: 1.2 }
  });
  registerItem({
    id: 'leather_jacket',
    name: 'Leather Jacket',
    type: 'armor',
    slot: 'armor',
    mods: { DEF: 1 }
  });
  registerItem({
    id: 'scavenger_rig',
    name: 'Scavenger Rig',
    type: 'armor',
    slot: 'armor',
    mods: { DEF: 1, adrenaline_gen_mod: 1.1 }
  });
  registerItem({
    id: 'juggernaut_plate',
    name: 'Juggernaut Plate',
    type: 'armor',
    slot: 'armor',
    mods: { DEF: 3, adrenaline_gen_mod: 0.9 }
  });
})();

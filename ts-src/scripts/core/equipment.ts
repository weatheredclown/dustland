// @ts-nocheck
(function(){
  registerItem({
    id: 'pipe_blade',
    name: 'Pipe Blade',
    type: 'weapon',
    mods: { ATK: 2, ADR: 12 }
  });
  registerItem({
    id: 'stun_baton',
    name: 'Stun Baton',
    type: 'weapon',
    mods: { ATK: 1, ADR: 15, adrenaline_gen_mod: 1.2, adrenaline_dmg_mod: 1.2 }
  });
  registerItem({
    id: 'leather_jacket',
    name: 'Leather Jacket',
    type: 'armor',
    mods: { DEF: 1 }
  });
  registerItem({
    id: 'scavenger_rig',
    name: 'Scavenger Rig',
    type: 'armor',
    mods: { DEF: 1, adrenaline_gen_mod: 1.1 }
  });
  registerItem({
    id: 'juggernaut_plate',
    name: 'Juggernaut Plate',
    type: 'armor',
    mods: { DEF: 3, adrenaline_gen_mod: 0.9 }
  });
  registerItem({
    id: 'suction_relay',
    name: 'Suction Relay',
    type: 'trinket',
    desc: 'Leader-only trinket that vacuums nearby loot into the party.',
    tags: ['loot_vacuum']
  });
})();

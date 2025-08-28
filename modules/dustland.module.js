function seedWorldContent() {}

const DUSTLAND_MODULE = (() => {
  const midY = Math.floor(WORLD_H / 2);
  function pullSlots(cost, payouts) {
    if (player.scrap < cost) {
      log('Not enough scrap.');
      return;
    }
    player.scrap -= cost;
    const reward = payouts[Math.floor(rng() * payouts.length)];
    if (reward > 0) {
      player.scrap += reward;
      log(`The machine rattles and spits out ${reward} scrap.`);
    } else {
      log('The machine coughs and eats your scrap.');
    }
    updateHUD?.();
  }
  const slotInterior = (() => {
    const w = 7, h = 7;
    const grid = Array.from({ length: h }, (_, y) =>
      Array.from({ length: w }, (_, x) => {
        const edge = y === 0 || y === h - 1 || x === 0 || x === w - 1;
        return edge ? TILE.WALL : TILE.FLOOR;
      })
    );
    grid[h - 1][Math.floor(w / 2)] = TILE.DOOR;
    return { id: 'slot_shack', w, h, grid, entryX: Math.floor(w / 2), entryY: h - 2 };
  })();
  const makeHall = () => {
    const HALL_W = 30, HALL_H = 22;
    const grid = Array.from({ length: HALL_H }, (_, y) =>
      Array.from({ length: HALL_W }, (_, x) => {
        const edge = y === 0 || y === HALL_H - 1 || x === 0 || x === HALL_W - 1;
        return edge ? TILE.WALL : TILE.FLOOR;
      })
    );
    for (let x = 2; x < HALL_W - 2; x++) {
      grid[6][x] = TILE.WALL;
      grid[12][x] = TILE.WALL;
    }
    grid[6][5] = TILE.DOOR;
    grid[6][24] = TILE.DOOR;
    grid[12][15] = TILE.DOOR;
    grid[1][15] = TILE.WALL;
    return { id: 'hall', w: HALL_W, h: HALL_H, grid, entryX: 15, entryY: 18 };
  };
  const hall = makeHall();

  function buyMemoryWorm() {
    if (player.scrap < 500) {
      log('Not enough scrap.');
      return;
    }
    player.scrap -= 500;
    addToInv('memory_worm');
    renderInv?.(); updateHUD?.();
    log('Purchased Memory Worm.');
  }

  const events = [
    { map: 'hall', x: hall.entryX - 1, y: hall.entryY, events:[{ when:'enter', effect:'toast', msg:'You smell rot.' }] }
  ];

  // Zones apply effects per step; top rows harbor a damaging nanite swarm
  const zones = [
    { map: 'world', x: 0, y: 0, w: typeof WORLD_W === 'number' ? WORLD_W : 120, h: 5, perStep: { hp: -1, msg: 'Nanite swarm!' }, negate: 'mask' }
  ];

  const encounters = {
    world: [
      { name: 'Rotwalker', HP: 6, DEF: 1, loot: 'water_flask', maxDist: 24 },
      { name: 'Scavenger', HP: 5, DEF: 0, loot: 'raider_knife', maxDist: 36 },
      { name: 'Sand Titan', HP: 20, DEF: 4, loot: 'artifact_blade', challenge: 9, minDist: 30 },
      { name: 'Dune Reaper', HP: 75, DEF: 7, loot: 'artifact_blade', challenge: 32, minDist: 40, special: { cue: 'lashes the wind with scythes!', dmg: 10 } },
      { name: 'Sand Colossus', HP: 80, DEF: 8, loot: 'artifact_blade', challenge: 36, minDist: 44, requires: 'artifact_blade', special: { cue: 'shakes the desert!', dmg: 12 } }
    ]
  };

  const items = [
    { id: 'rusted_key', name: 'Rusted Key', type: 'quest', tags: ['key'] },
    { id: 'toolkit', name: 'Toolkit', type: 'quest', tags: ['tool'] },
    { map: 'world', x: 8, y: midY, id: 'pipe_rifle', name: 'Pipe Rifle', type: 'weapon', slot: 'weapon', mods: { ATK: 2, ADR: 15 } },
    { map: 'world', x: 10, y: midY, id: 'leather_jacket', name: 'Leather Jacket', type: 'armor', slot: 'armor', mods: { DEF: 1 } },
    { map: 'world', x: 12, y: midY, id: 'lucky_bottlecap', name: 'Lucky Bottlecap', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } },
    { map: 'world', x: 28, y: midY - 4, id: 'crowbar', name: 'Crowbar', type: 'weapon', slot: 'weapon', mods: { ATK: 1, ADR: 10 } },
    { map: 'world', x: 35, y: midY + 6, id: 'rebar_club', name: 'Rebar Club', type: 'weapon', slot: 'weapon', mods: { ATK: 1, ADR: 10 } },
    { map: 'world', x: 52, y: midY - 3, id: 'kevlar_scrap_vest', name: 'Kevlar Scrap Vest', type: 'armor', slot: 'armor', mods: { DEF: 2 } },
    { map: 'world', x: 67, y: midY + 5, id: 'goggles', name: 'Goggles', type: 'trinket', slot: 'trinket', mods: { PER: 1 } },
    { map: 'world', x: 83, y: midY - 2, id: 'wrench', name: 'Wrench', type: 'trinket', slot: 'trinket', mods: { INT: 1 } },
    { map: 'world', x: 95, y: midY + 2, id: 'lucky_rabbit_foot', name: 'Lucky Rabbit Foot', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } },
    { map: 'world', x: 32, y: midY + 2, id: 'water_flask', name: 'Water Flask', type: 'consumable', use: { type: 'heal', amount: 3 } },
    { map: 'world', x: 80, y: midY - 3, id: 'medkit', name: 'Medkit', type: 'consumable', use: { type: 'heal', amount: 5 } },
    { map: 'world', x: 18, y: midY - 2, id: 'valve', name: 'Valve', type: 'quest' },
    { map: 'world', x: 26, y: midY + 3, id: 'lost_satchel', name: 'Lost Satchel', type: 'quest' },
    { map: 'world', x: 60, y: midY - 1, id: 'rust_idol', name: 'Rust Idol', type: 'quest', tags: ['idol'] },
    { id: 'raider_knife', name: 'Raider Knife', type: 'weapon', slot: 'weapon', mods: { ATK: 1, ADR: 10 } },
    { map: 'world', x: 110, y: midY + 4, id: 'artifact_blade', name: 'Artifact Blade', type: 'weapon', slot: 'weapon', mods: { ATK: 5, ADR: 20 } }
  ];

  const quests = [
    { id: 'q_hall_key', title: 'Find the Rusted Key', desc: 'Search the hall for a Rusted Key to unlock the exit.', item: 'rusted_key' },
    { id: 'q_waterpump', title: 'Water for the Pump', desc: 'Find a Valve and help Nila restart the pump.', item: 'valve', reward: { id: 'rusted_badge', name: 'Rusted Badge', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } }, xp: 4 },
    { id: 'q_recruit_grin', title: 'Recruit Grin', desc: 'Convince or pay Grin to join.' },
    { id: 'q_postal', title: 'Lost Parcel', desc: 'Find and return the Lost Satchel to Ivo.', item: 'lost_satchel', reward: { id: 'brass_stamp', name: 'Brass Stamp', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } }, xp: 4 },
    { id: 'q_tower', title: 'Dead Air', desc: 'Repair the radio tower console (Toolkit helps).', item: 'toolkit', reward: { id: 'tuner_charm', name: 'Tuner Charm', type: 'trinket', slot: 'trinket', mods: { PER: 1 } }, xp: 5 },
    { id: 'q_idol', title: 'Rust Idol', desc: 'Recover the Rust Idol from roadside ruins.', item: 'rust_idol', reward: { id: 'pilgrim_thread', name: 'Pilgrim Thread', type: 'trinket', slot: 'trinket', mods: { CHA: 1 } }, xp: 5 },
    { id: 'q_toll', title: 'Toll-Booth Etiquette', desc: 'You met the Duchess on the road.', xp: 2 }
  ];

  const npcs = [
    {
      id: 'dust_storm_entrance',
      map: 'world',
      x: 10,
      y: 10,
      color: '#f5d442',
      name: 'Strange Vortex',
      title: 'A swirling vortex of dust and sand.',
      desc: 'You feel a strange pull towards it.',
      portraitSheet: 'assets/portraits/dustland-module/strange_vortex_4.png',
      tree: {
        start: {
          text: 'A swirling vortex of dust and sand blocks your path.',
          choices: [
            { label: '(Enter the vortex)', to: 'enter' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        enter: {
          text: 'You are pulled into the vortex.',
          choices: [
            { label: '(Continue)', to: 'bye', goto: { map: 'dust_storm', x: 10, y: 18 } }
          ]
        }
      }
    },
    {
      id: 'exitdoor',
      map: 'hall',
      x: hall.entryX,
      y: hall.entryY - 1,
      color: '#a9f59f',
      name: 'Caretaker Kesh',
      title: 'Hall Steward',
      desc: "Weary caretaker guarding the hall's chained exit.",
      portraitSheet: 'assets/portraits/kesh_4.png',
      questId: 'q_hall_key',
      tree: {
        start: {
          text: 'Caretaker Kesh eyes the chained exit.',
          choices: [
            { label: '(Search for key)', to: 'accept', q: 'accept' },
            { label: '(Use Rusted Key)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'Try the crates. This hall sheltered survivors once. Don’t scuff the floor.', choices: [ { label: '(Okay)', to: 'bye' } ] },
        do_turnin: {
          text: 'Kesh unlocks the chain. “Off you go.”',
          choices: [ { label: '(Continue)', to: 'bye', goto: { map: 'world', x: 2, y: midY } } ]
        }
      },
      processNode(node) {
        if (node === 'start') {
          const monsterAlive = NPCS.some(n => n.id === 'hall_rotwalker');
          this.tree.start.text = monsterAlive
            ? 'Caretaker Kesh eyes the chained exit. "There\'s a rotwalker at the top of the hall. Killing it would be a good test."'
            : 'Caretaker Kesh eyes the chained exit.';
        }
      }
    },
    {
      id: 'keycrate',
      map: 'hall',
      x: hall.entryX + 2,
      y: hall.entryY,
      color: '#9ef7a0',
      name: 'Dusty Crate',
      title: '',
      desc: 'A dusty crate that might hide something useful.',
      portraitSheet: 'assets/portraits/crate_4.png',
      portraitLock: false,
      tree: {
        start: {
          text: 'A dusty crate rests here.',
          choices: [
            { label: '(Open)', to: 'open', once: true },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        open: {
          text: 'Inside you find a Rusted Key.',
          choices: [ { label: '(Take Rusted Key)', to: 'empty', reward: 'rusted_key' } ]
        },
        empty: { text: 'An empty crate.', choices: [ { label: '(Leave)', to: 'bye' } ] }
      }
    },
    {
      id: 'hallflavor',
      map: 'hall',
      x: hall.entryX - 4,
      y: hall.entryY - 1,
      color: '#b8ffb6',
      name: 'Lone Drifter',
      title: 'Mutters',
      desc: 'A drifter muttering to themselves.',
      portraitSheet: 'assets/portraits/drifter_4.png',
      tree: { start: { text: '"Dust gets in everything."', choices: [ { label: '(Nod)', to: 'bye' } ] } }
    },
    {
      id: 'hall_rotwalker',
      map: 'hall',
      x: hall.entryX,
      y: 2,
      color: '#f88',
      name: 'Rotwalker',
      title: 'Test Monster',
      desc: 'A shambler posted here for practice.',
      portraitSheet: 'assets/portraits/dustland-module/rotwalker_4.png',
      tree: { start: { text: 'A rotwalker lurches at you.' } },
      combat: { HP: 6, ATK: 1, loot: 'water_flask', auto: true }
    },
    {
      id: 'road_sign',
      map: 'world',
      x: 6,
      y: midY,
      color: '#caffc6',
      name: 'Worn Sign',
      title: 'Warning',
      desc: 'Faded letters warn travelers.',
      portraitSheet: 'assets/portraits/dustland-module/worn_sign_4.png',
      tree: { start: { text: 'Rust storms east. Shelter west.', choices: [ { label: '(Leave)', to: 'bye' } ] } }
    },
    {
      id: 'pump',
      map: 'world',
      x: 14,
      y: midY - 1,
      color: '#9ef7a0',
      name: 'Nila the Pump-Keeper',
      title: 'Parched Farmer',
      desc: 'Sunburnt hands, hopeful eyes. Smells faintly of mud.',
      portraitSheet: 'assets/portraits/mara_4.png',
      questId: 'q_waterpump',
      tree: {
        start: {
          text: [
            'I can hear the pump wheeze. Need a Valve to breathe again.',
            'Pump’s choking on sand. Only a Valve will save it.'
          ],
          choices: [
            { label: '(Accept) I will find a Valve.', to: 'accept', q: 'accept' },
            { label: '(Hand Over Valve)', to: 'turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'Bless. Try the roadside ruins.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        turnin: { text: 'Let me see...', choices: [ { label: '(Give Valve)', to: 'do_turnin' } ] },
        do_turnin: { text: 'It fits! Water again. Take this.', choices: [ { label: '(Continue)', to: 'bye' } ] }
      }
    },
    {
      id: 'grin',
      map: 'world',
      x: 22,
      y: midY,
      color: '#caffc6',
      name: 'Grin',
      title: 'Scav-for-Hire',
      desc: 'Lean scav with a crowbar and half a smile.',
      portraitSheet: 'assets/portraits/grin_4.png',
      questId: 'q_recruit_grin',
      tree: {
        start: {
          text: [
            'Got two hands and a crowbar. You got a plan?',
            'Crowbar’s itching for work. You hiring?'
          ],
          choices: [
            { label: '(Recruit) Join me.', to: 'rec', ifOnce: { node: 'rec', label: '(CHA) Talk up the score' } },
            { label: '(Recruit) Got a trinket?', to: 'rec_fail', ifOnce: { node: 'rec', label: '(CHA) Talk up the score', used: true } },
            { label: '(Chat)', to: 'chat' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        chat: {
          text: [
            'Keep to the road. The sand eats soles and souls.',
            'Stay off the dunes. Sand chews boots.'
          ],
          choices: [ { label: '(Nod)', to: 'bye' } ]
        },
        rec: {
          text: 'Convince me. Or pay me.',
          choices: [
            {
              label: '(CHA) Talk up the score',
              check: { stat: 'CHA', dc: DC.TALK },
              success: 'Grin smirks: "Alright."',
              failure: 'Grin shrugs: "Not buying it."',
              join: { id: 'grin', name: 'Grin', role: 'Scavenger' },
              once: true
            },
            {
              label: '(Pay) Give 1 trinket as hire bonus',
              costSlot: 'trinket',
              success: 'Deal.',
              failure: 'You have no trinket to pay with.',
              join: { id: 'grin', name: 'Grin', role: 'Scavenger' }
            },
            { label: '(Back)', to: 'start' }
          ]
        },
        rec_fail: {
          text: 'Charm didn\'t work. Got a trinket?',
          choices: [
            {
              label: '(Pay) Give 1 trinket as hire bonus',
              costSlot: 'trinket',
              success: 'Deal.',
              failure: 'You have no trinket to pay with.',
              join: { id: 'grin', name: 'Grin', role: 'Scavenger' }
            },
            { label: '(Back)', to: 'start' }
          ]
        }
      }
    },
    {
      id: 'post',
      map: 'world',
      x: 30,
      y: midY + 1,
      color: '#b8ffb6',
      name: 'Postmaster Ivo',
      title: 'Courier of Dust',
      desc: 'Dusty courier seeking a lost parcel.',
      portraitSheet: 'assets/portraits/ivo_4.png',
      questId: 'q_postal',
      tree: {
        start: {
          text: 'Lost a courier bag on the road. Grey canvas. Reward if found.',
          choices: [
            { label: '(Accept) I will look.', to: 'accept', q: 'accept' },
            { label: '(Turn in Satchel)', to: 'turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'Much obliged.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        turnin: { text: 'You got it?', choices: [ { label: '(Give Lost Satchel)', to: 'do_turnin' } ] },
        do_turnin: {
          text: 'Mail moves again. Take this stamp. Worth more than water.',
          choices: [ { label: '(Ok)', to: 'bye' } ]
        }
      }
    },
    {
      id: 'tower',
      map: 'world',
      x: 48,
      y: midY - 2,
      color: '#a9f59f',
      name: 'Rella',
      title: 'Radio Tech',
      desc: 'Tower technician with grease-stained hands.',
      portraitSheet: 'assets/portraits/rella_4.png',
      questId: 'q_tower',
      tree: {
        start: {
          text: 'Tower’s console fried. If you got a Toolkit and brains, lend both.',
          choices: [
            { label: '(Accept) I will help.', to: 'accept', q: 'accept' },
            {
              label: '(Repair) INT check with Toolkit',
              check: { stat: 'INT', dc: DC.REPAIR },
              success: 'Static fades. The tower hums.',
              failure: 'You cross a wire and pop a fuse.',
              q: 'turnin'
            },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'I owe you static and thanks.', choices: [ { label: '(Ok)', to: 'bye' } ] }
      }
    },
    {
      id: 'hermit',
      map: 'world',
      x: 68,
      y: midY + 2,
      color: '#9abf9a',
      name: 'The Shifting Hermit',
      title: 'Pilgrim',
      desc: 'A cloaked hermit murmuring about rusted idols.',
      portraitSheet: 'assets/portraits/pilgrim_4.png',
      questId: 'q_idol',
      tree: {
        start: {
          text: 'Something rust-holy sits in the ruins. Bring the Idol.',
          choices: [
            { label: '(Accept)', to: 'accept', q: 'accept' },
            { label: '(Offer Rust Idol)', to: 'turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'The sand will guide or bury you.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        turnin: { text: 'Do you carry grace?', choices: [ { label: '(Give Idol)', to: 'do_turnin' } ] },
        do_turnin: { text: 'The idol warms. You are seen.', choices: [ { label: '(Ok)', to: 'bye' } ] }
      }
    },
    {
      id: 'duchess',
      map: 'world',
      x: 40,
      y: midY,
      color: '#a9f59f',
      name: 'Scrap Duchess',
      title: 'Toll-Queen',
      desc: 'A crown of bottlecaps; eyes like razors.',
      portraitSheet: 'assets/portraits/scrap_4.png',
      questId: 'q_toll',
      tree: {
        start: {
          text: ['Road tax or road rash.', 'Coins or cuts. Your pick.'],
          choices: [
            { label: '(Pay) Nod and pass', to: 'pay', q: 'turnin' },
            { label: '(Refuse)', to: 'ref', q: 'turnin' },
            { label: '(Rumors)', to: 'rumors' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        pay: { text: 'Wise. Move along.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        ref: { text: 'Brave. Or foolish.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        rumors: { text: 'Radio crackles from the north; idol whispers from the south.', choices: [ { label: '(Thanks)', to: 'bye' } ] }
      }
    },
    {
      id: 'hidden_hermit',
      hidden: true,
      map: 'world',
      x: 20,
      y: midY + 2,
      color: '#b8ffb6',
      name: 'Hidden Hermit',
      title: 'Lurker',
      desc: 'A hermit steps out when you return.',
      portraitSheet: 'assets/portraits/dustland-module/hidden_hermit_4.png',
      tree: { start: { text: 'Didn\'t expect company twice.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      reveal: { flag: `visits@world@20,${midY + 2}`, op: '>=', value: 2 }
    },
    {
      id: 'raider',
      map: 'world',
      x: 56,
      y: midY - 1,
      color: '#f88',
      name: 'Road Raider',
      title: 'Bandit',
      desc: 'Scarred scav looking for trouble.',
      portraitSheet: 'assets/portraits/raider_4.png',
      portraitLock: false,
      tree: {
        start: {
          text: 'A raider blocks the path, eyeing your gear.',
          choices: [
            {
              label: '(Talk) Stand down',
              check: { stat: 'CHA', dc: DC.TALK },
              success: 'He grunts and lets you pass.',
              failure: 'He tightens his grip.',
              to: 'bye'
            },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      },
      combat: { DEF: 5, loot: 'raider_knife' }
    },
    {
      id: 'trader',
      map: 'world',
      x: 34,
      y: midY - 1,
      color: '#caffc6',
      name: 'Cass the Trader',
      title: 'Shopkeep',
      desc: 'A roving merchant weighing your wares.',
      portraitSheet: 'assets/portraits/cass_4.png',
      tree: {
        start: {
          text: 'Got goods to sell? I pay in scrap.',
          choices: [
            { label: 'Browse goods', to: 'buy' },
            { label: '(Sell items)', to: 'sell' },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      },
      shop: true
    },
    {
      id: 'tess_patrol',
      map: 'world',
      x: 14,
      y: midY - 1,
      color: '#9ef7a0',
      name: 'Tess the Scout',
      title: 'Water Runner',
      desc: 'She checks the pump then the far ridge.',
      portraitSheet: 'assets/portraits/dustland-module/tess_4.png',
      tree: { start: { text: 'Tess strides past on her rounds.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      loop: [ { x: 14, y: midY - 1 }, { x: 80, y: midY + 4 } ]
    },
    {
      id: 'scrap_mutt',
      map: 'world',
      x: 18,
      y: midY - 2,
      color: '#d88',
      name: 'Scrap Mutt',
      title: 'Mangy Hound',
      desc: 'A feral mutt snarling over junk.',
      portraitSheet: 'assets/portraits/dustland-module/scrap_mutt_4.png',
      tree: { start: { text: 'The mutt bares its teeth.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      combat: { HP: 5, ATK: 1, loot: 'water_flask', auto: true }
    },
    {
      id: 'scavenger_rat',
      map: 'world',
      x: 32,
      y: midY + 3,
      color: '#c66',
      name: 'Scavenger Rat',
      title: 'Vermin',
      desc: 'A giant rat rooting through scraps.',
      tree: { start: { text: 'It hisses.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      combat: { HP: 4, ATK: 1, loot: 'water_flask', auto: true }
    },
    {
      id: 'rust_bandit',
      map: 'world',
      x: 44,
      y: midY - 3,
      color: '#f88',
      name: 'Rust Bandit',
      title: 'Scav Raider',
      desc: 'A bandit prowling for easy loot.',
      tree: { start: { text: 'The bandit sizes you up.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      combat: { HP: 6, ATK: 1, loot: 'raider_knife', auto: true }
    },
    {
      id: 'feral_nomad',
      map: 'world',
      x: 68,
      y: midY + 2,
      color: '#f77',
      name: 'Feral Nomad',
      title: 'Mad Drifter',
      desc: 'A wild-eyed drifter muttering to himself.',
      tree: { start: { text: 'He lunges without warning.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      combat: { HP: 6, ATK: 2, loot: 'medkit', auto: true }
    },
    {
      id: 'waste_ghoul',
      map: 'world',
      x: 82,
      y: midY - 4,
      color: '#aa8',
      name: 'Waste Ghoul',
      title: 'Rotwalker',
      desc: 'A decayed wanderer hungry for flesh.',
      tree: { start: { text: 'It shambles toward you.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      combat: { HP: 7, ATK: 2, loot: 'goggles', auto: true }
    },
    {
      id: 'iron_brute',
      map: 'world',
      x: 120,
      y: midY - 8,
      color: '#f33',
      name: 'Iron Brute',
      title: 'Challenge',
      desc: 'A hulking brute plated in scrap.',
      tree: { start: { text: 'The brute roars.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      loop: [
        { x: 120, y: midY - 8 },
        { x: 124, y: midY - 8 },
        { x: 124, y: midY - 12 },
        { x: 120, y: midY - 12 }
      ],
      combat: { HP: 15, ATK: 3, DEF: 2, loot: 'raider_knife', auto: true }
    },
    {
      id: 'stalker_patrol',
      map: 'world',
      x: 90,
      y: midY + 2,
      color: '#f55',
      name: 'Grit Stalker',
      title: 'Wasteland Hunter',
      desc: 'A ruthless drifter prowling for prey.',
      portraitSheet: 'assets/portraits/portrait_1079.png',
      portraitLock: false,
      tree: { start: { text: 'The stalker circles the wastes.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      loop: [
        { x: 90, y: midY + 2 },
        { x: 110, y: midY + 2 },
        { x: 110, y: midY - 6 },
        { x: 90, y: midY - 6 }
      ],
      combat: { HP: 7, ATK: 2, DEF: 1, loot: 'raider_knife', auto: true }
    },
    {
      id: 'trainer_power',
      map: 'world',
      x: 6,
      y: midY - 1,
      color: '#ffcc99',
      name: 'Brakk',
      title: 'Power Trainer',
      desc: 'A former arena champ teaching raw strength.',
      tree: {
        start: {
          text: 'Brakk cracks his knuckles.',
          choices: [
            { label: '(Upgrade Skills)', to: 'train', effects: [() => TrainerUI.showTrainer('power')] },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        train: {
          text: 'Push your limits.',
          choices: [
            { label: '(Back)', to: 'start' }
          ]
        }
      }
    },
    {
      id: 'trainer_endurance',
      map: 'world',
      x: 6,
      y: midY + 1,
      color: '#99ccff',
      name: 'Rusty',
      title: 'Endurance Trainer',
      desc: 'A grizzled scavenger preaching survival.',
      portraitSheet: 'assets/portraits/dustland-module/rusty_4.png',
      tree: {
        start: {
          text: 'Rusty studies your stance.',
          choices: [
            { label: '(Upgrade Skills)', to: 'train', effects: [() => TrainerUI.showTrainer('endurance')] },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        train: {
          text: 'Breathe deep and endure.',
          choices: [
            { label: '(Back)', to: 'start' }
          ]
        }
      }
    },
    {
      id: 'trainer_tricks',
      map: 'world',
      x: 6,
      y: midY + 3,
      color: '#cc99ff',
      name: 'Mira',
      title: 'Tricks Trainer',
      desc: 'A nimble tinkerer teaching odd moves.',
      portraitSheet: 'assets/portraits/dustland-module/mira_4.png',
      tree: {
        start: {
          text: 'Mira twirls a coin.',
          choices: [
            { label: '(Upgrade Skills)', to: 'train', effects: [() => TrainerUI.showTrainer('tricks')] },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        train: {
          text: 'Learn a new trick.',
          choices: [
            { label: '(Back)', to: 'start' }
          ]
        }
      }
    },
    {
      id: 'respec_vendor',
      map: 'world',
      x: 94,
      y: midY + 5,
      color: '#ffee99',
      name: 'Nora',
      title: 'Worm Seller',
      desc: 'She trades memory worms for scrap.',
      portraitSheet: 'assets/portraits/dustland-module/nora_4.png',
      tree: {
        start: {
          text: 'Fresh worms for fading sins.',
          choices: [
            { label: `Buy Memory Worm (500 ${CURRENCY})`, to: 'buy' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        buy: {
          text: 'One bite resets the mind.',
          choices: [
            { label: '(Buy)', to: 'start', effects: [buyMemoryWorm] },
            { label: '(Back)', to: 'start' }
          ]
        }
      }
    },
    {
      id: 'slots',
      map: 'slot_shack',
      x: 3,
      y: 2,
      color: '#d4af37',
      name: 'One-Armed Bandit',
      title: 'Slot Machine',
      desc: 'It wheezes, eager for scrap.',
      portraitSheet: 'assets/portraits/crate_4.png',
      tree: {
        start: {
          text: 'Lights sputter behind cracked glass.',
          choices: [
            { label: '(1 scrap)', to: 'start', effects: [() => pullSlots(1, [0, 1, 2])] },
            { label: '(5 scrap)', to: 'start', effects: [() => pullSlots(5, [0, 3, 5, 6, 10])] },
            { label: '(25 scrap)', to: 'start', effects: [() => pullSlots(25, [0, 10, 25, 35, 50])] },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      }
    },
    {
      id: 'scrap_behemoth',
      map: 'world',
      x: 120,
      y: midY,
      color: '#f33',
      name: 'Scrap Behemoth',
      title: 'Wastes Boss',
      desc: 'A towering mass of twisted metal.',
      portraitSheet: 'assets/portraits/portrait_1084.png',
      portraitLock: false,
      tree: { start: { text: 'The behemoth looms.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      combat: { HP: 30, ATK: 3, DEF: 2, loot: 'raider_knife', boss: true, special: { cue: 'crackles with energy!', dmg: 5, delay: 1000 } }
    }
  ];

  return {
    seed: Date.now(),
    start: { map: 'hall', x: hall.entryX, y: hall.entryY },
    items,
    quests,
    npcs,
    events,
    zones,
    encounters,
    interiors: [hall, slotInterior],
    buildings: [{ x: 40, y: midY - 2, w: 3, h: 3, interiorId: 'slot_shack', boarded: false }]
  };
})();

startGame = function () {
  const { start: s } = applyModule(DUSTLAND_MODULE) || {};
  const loc = s || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setMap(loc.map, loc.map === 'world' ? 'Wastes' : 'Test Hall');
  setPartyPos(loc.x, loc.y);
  renderInv();
  renderQuests();
  renderParty();
  updateHUD();
};


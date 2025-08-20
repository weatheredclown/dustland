function seedWorldContent() {}

const DUSTLAND_MODULE = (() => {
  const midY = Math.floor(WORLD_H / 2);
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

  const items = [
    { id: 'rusted_key', name: 'Rusted Key', type: 'quest', tags: ['key'] },
    { id: 'toolkit', name: 'Toolkit', type: 'quest', tags: ['tool'] },
    { map: 'world', x: 8, y: midY, id: 'pipe_rifle', name: 'Pipe Rifle', type: 'weapon', slot: 'weapon', mods: { ATK: 2 } },
    { map: 'world', x: 10, y: midY, id: 'leather_jacket', name: 'Leather Jacket', type: 'armor', slot: 'armor', mods: { DEF: 1 } },
    { map: 'world', x: 12, y: midY, id: 'lucky_bottlecap', name: 'Lucky Bottlecap', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } },
    { map: 'world', x: 28, y: midY - 4, id: 'crowbar', name: 'Crowbar', type: 'weapon', slot: 'weapon', mods: { ATK: 1 } },
    { map: 'world', x: 35, y: midY + 6, id: 'rebar_club', name: 'Rebar Club', type: 'weapon', slot: 'weapon', mods: { ATK: 1 } },
    { map: 'world', x: 52, y: midY - 3, id: 'kevlar_scrap_vest', name: 'Kevlar Scrap Vest', type: 'armor', slot: 'armor', mods: { DEF: 2 } },
    { map: 'world', x: 67, y: midY + 5, id: 'goggles', name: 'Goggles', type: 'trinket', slot: 'trinket', mods: { PER: 1 } },
    { map: 'world', x: 83, y: midY - 2, id: 'wrench', name: 'Wrench', type: 'trinket', slot: 'trinket', mods: { INT: 1 } },
    { map: 'world', x: 95, y: midY + 2, id: 'lucky_rabbit_foot', name: 'Lucky Rabbit Foot', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } },
    { map: 'world', x: 32, y: midY + 2, id: 'water_flask', name: 'Water Flask', type: 'consumable', use: { type: 'heal', amount: 3 } },
    { map: 'world', x: 80, y: midY - 3, id: 'medkit', name: 'Medkit', type: 'consumable', use: { type: 'heal', amount: 5 } },
    { map: 'world', x: 18, y: midY - 2, id: 'valve', name: 'Valve', type: 'quest' },
    { map: 'world', x: 26, y: midY + 3, id: 'lost_satchel', name: 'Lost Satchel', type: 'quest' },
    { map: 'world', x: 60, y: midY - 1, id: 'rust_idol', name: 'Rust Idol', type: 'quest', tags: ['idol'] }
  ];

  const quests = [
    { id: 'q_hall_key', title: 'Find the Rusted Key', desc: 'Search the hall for a Rusted Key to unlock the exit.', item: 'rusted_key' },
    { id: 'q_waterpump', title: 'Water for the Pump', desc: 'Find a Valve and help Mara restart the pump.', item: 'valve', reward: { id: 'rusted_badge', name: 'Rusted Badge', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } }, xp: 4 },
    { id: 'q_recruit_grin', title: 'Recruit Grin', desc: 'Convince or pay Grin to join.' },
    { id: 'q_postal', title: 'Lost Parcel', desc: 'Find and return the Lost Satchel to Ivo.', item: 'lost_satchel', reward: { id: 'brass_stamp', name: 'Brass Stamp', type: 'trinket', slot: 'trinket', mods: { LCK: 1 } }, xp: 4 },
    { id: 'q_tower', title: 'Dead Air', desc: 'Repair the radio tower console (Toolkit helps).', item: 'toolkit', reward: { id: 'tuner_charm', name: 'Tuner Charm', type: 'trinket', slot: 'trinket', mods: { PER: 1 } }, xp: 5 },
    { id: 'q_idol', title: 'Rust Idol', desc: 'Recover the Rust Idol from roadside ruins.', item: 'rust_idol', reward: { id: 'pilgrim_thread', name: 'Pilgrim Thread', type: 'trinket', slot: 'trinket', mods: { CHA: 1 } }, xp: 5 },
    { id: 'q_toll', title: 'Toll-Booth Etiquette', desc: 'You met the Duchess on the road.', xp: 2 }
  ];

  const npcs = [
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
        accept: { text: 'Try the crates. And don’t scuff the floor.', choices: [ { label: '(Okay)', to: 'bye' } ] },
        do_turnin: {
          text: 'Kesh unlocks the chain. “Off you go.”',
          choices: [ { label: '(Continue)', to: 'bye', goto: { map: 'world', x: 2, y: midY } } ]
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
      id: 'pump',
      map: 'world',
      x: 14,
      y: midY - 1,
      color: '#9ef7a0',
      name: 'Mara the Pump-Keeper',
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
            { label: '(Recruit) Join me.', to: 'accept', q: 'accept' },
            { label: '(Chat)', to: 'chat' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: '', choices: [ { label: '(Continue)', to: 'rec' } ] },
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
              q: 'turnin'
            },
            {
              label: '(Pay) Give 1 trinket as hire bonus',
              costSlot: 'trinket',
              success: 'Deal.',
              failure: 'You have no trinket to pay with.',
              join: { id: 'grin', name: 'Grin', role: 'Scavenger' },
              q: 'turnin'
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
            { label: '(Leave)', to: 'bye' }
          ]
        },
        pay: { text: 'Wise. Move along.', choices: [ { label: '(Ok)', to: 'bye' } ] },
        ref: { text: 'Brave. Or foolish.', choices: [ { label: '(Ok)', to: 'bye' } ] }
      }
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
      combat: { DEF: 5, loot: { id: 'raider_knife', name: 'Raider Knife', type: 'weapon', slot: 'weapon', mods: { ATK: 1 } } }
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
      tree: { start: { text: 'Got goods to sell? I pay in scrap.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      shop: true
    }
  ];

  return {
    seed: Date.now(),
    start: { map: 'hall', x: hall.entryX, y: hall.entryY },
    items,
    quests,
    npcs,
    interiors: [hall],
    buildings: []
  };
})();

const _startGame = startGame;
startGame = function () {
  startWorld();
  applyModule(DUSTLAND_MODULE);
  const s = DUSTLAND_MODULE.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setPartyPos(s.x, s.y);
  setMap(s.map, s.map === 'world' ? 'Wastes' : 'Test Hall');
  renderInv();
  renderQuests();
  renderParty();
  updateHUD();
};


function seedWorldContent() {}

const OFFICE_MODULE = (() => {
  const FLOOR_W = 20,
    // Expanded height to make room for an exterior elevator area
    FLOOR_H = 24;
  const midX = Math.floor(FLOOR_W / 2);

  const WORLD_MID = Math.floor(WORLD_W / 2),
    WORLD_MIDY = Math.floor(WORLD_H / 2);

  function genForestWorld(seed = Date.now()) {
    setRNGSeed(seed);
    world = Array.from({ length: WORLD_H }, () =>
      Array.from({ length: WORLD_W }, (_, x) =>
        x === WORLD_MID ? TILE.WATER : TILE.BRUSH
      )
    );
    setTile('world', WORLD_MID, WORLD_MIDY, TILE.ROAD);
    interiors = {};
    if (creatorMap.grid && creatorMap.grid.length) interiors['creator'] = creatorMap;
    buildings.length = 0;
    const hut = placeHut(WORLD_MID + 3, WORLD_MIDY - 2, { interiorId: 'castle' });
    return { castleId: hut?.interiorId };
  }

  function baseGrid() {
    return Array.from({ length: FLOOR_H }, (_, y) =>
      Array.from({ length: FLOOR_W }, (_, x) =>
        y === 0 ||
        y === FLOOR_H - 1 ||
        x === 0 ||
        x === FLOOR_W - 1 ||
        y === 4
          ? TILE.WALL
          : TILE.FLOOR
      )
    );
  }

  function addElevator(grid) {
    // Wider elevator placed outside the main office rectangle
    for (let y = 1; y <= 4; y++) {
      grid[y][midX - 2] = TILE.WALL;
      grid[y][midX + 2] = TILE.WALL;
    }
    for (let y = 1; y < 4; y++) {
      grid[y][midX - 1] = TILE.FLOOR;
      grid[y][midX] = TILE.FLOOR; // NPC spot and elevator floor
      grid[y][midX + 1] = TILE.FLOOR;
    }
    grid[4][midX - 1] = TILE.DOOR;
    grid[4][midX] = TILE.DOOR;
    grid[4][midX + 1] = TILE.DOOR;
  }

  function makeFloor1() {
    const grid = baseGrid();
    addElevator(grid);
    // four pillars
    [6, FLOOR_W - 7].forEach((x) =>
      [10, FLOOR_H - 7].forEach((y) => (grid[y][x] = TILE.WALL))
    );
    // front desk
    for (let x = 3; x < FLOOR_W - 3; x++) {
      if (x !== midX) grid[FLOOR_H - 5][x] = TILE.WALL;
    }
    return { id: 'floor1', w: FLOOR_W, h: FLOOR_H, grid, entryX: midX, entryY: 2 };
  }

  function makeFloor2() {
    const grid = baseGrid();
    addElevator(grid);
    // cubicle walls
    [4, 8, 12, 16].forEach((x, i) => {
      for (let y = 8; y < FLOOR_H - 4; y++) {
        if (y === (i % 2 === 0 ? 14 : 18)) continue; // door gaps
        grid[y][x] = TILE.WALL;
      }
    });
    return { id: 'floor2', w: FLOOR_W, h: FLOOR_H, grid, entryX: midX, entryY: 2 };
  }

  function makeFloor3() {
    const grid = baseGrid();
    addElevator(grid);
    // central conference room
    for (let y = 9; y <= FLOOR_H - 6; y++) {
      for (let x = 5; x <= FLOOR_W - 6; x++) {
        const edge =
          y === 9 || y === FLOOR_H - 6 || x === 5 || x === FLOOR_W - 6;
        if (edge) grid[y][x] = TILE.WALL;
      }
    }
    grid[FLOOR_H - 6][midX] = TILE.DOOR;
    return { id: 'floor3', w: FLOOR_W, h: FLOOR_H, grid, entryX: midX, entryY: 2 };
  }

  function makeCastle() {
    const W = 30,
      H = 30;
    const grid = Array.from({ length: H }, () =>
      Array.from({ length: W }, () => TILE.WALL)
    );
    function shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }
    function carve(x, y) {
      grid[y][x] = TILE.FLOOR;
      shuffle(
        [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1]
        ]
      ).forEach(([dx, dy]) => {
        const nx = x + dx * 2,
          ny = y + dy * 2;
        if (
          nx > 0 &&
          ny > 0 &&
          nx < W - 1 &&
          ny < H - 1 &&
          grid[ny][nx] === TILE.WALL
        ) {
          grid[y + dy][x + dx] = TILE.FLOOR;
          carve(nx, ny);
        }
      });
    }
    carve(1, 1);
    grid[1][1] = TILE.DOOR;
    return { id: 'castle', w: W, h: H, grid, entryX: 1, entryY: 1 };
  }

  const floor1 = makeFloor1();
  const floor2 = makeFloor2();
  const floor3 = makeFloor3();
  const castle = makeCastle();

  const elevatorNPCs = ['floor1', 'floor2', 'floor3'].map((map) => ({
    id: `elevator_${map}`,
    map,
    x: midX,
    // Centered inside the larger elevator
    y: 2,
    color: '#a9f59f',
    name: 'Elevator Buttons',
    desc: 'A panel to select floors.',
    tree: {
      start: {
        text: 'Select floor:',
        choices: [
          { label: 'Lobby', to: 'bye', goto: { map: 'floor1', x: midX, y: 2 } },
          { label: 'Workspace', to: 'bye', goto: { map: 'floor2', x: midX, y: 2 } },
          {
            label: 'Executive Suite',
            to: 'bye',
            goto: { map: 'floor3', x: midX, y: 2 },
            reqItem: 'access_card',
            failure: 'Requires Access Card.'
          }
        ]
      }
    }
  }));

  const npcs = [
    ...elevatorNPCs,
    {
      id: 'security',
      map: 'floor1',
      x: midX - 3,
      y: FLOOR_H - 6,
      color: '#ffb6b6',
      name: 'Security Guard',
      desc: 'A sharp-eyed guard watches the lobby.',
      tree: {
        start: {
          text: 'Access to the third floor requires a card.',
          choices: [
            {
              label: '(Persuade for card)',
              check: { stat: 'CHA', dc: DC.TALK },
              success: 'He sighs and hands over a spare card.',
              failure: 'Rules are rules.',
              reward: 'access_card',
              once: true
            },
            { label: '(Leave)', to: 'bye' }
          ]
        }
      }
    },
    {
      id: 'worker1',
      map: 'floor2',
      x: 6,
      y: 10,
      color: '#b8ffb6',
      name: 'Office Worker',
      desc: 'Busy typing at their desk.',
      tree: { start: { text: 'Too busy to chat.', choices: [ { label: '(Leave)', to: 'bye' } ] } }
    },
    {
      id: 'worker2',
      map: 'floor2',
      x: FLOOR_W - 7,
      y: 18,
      color: '#b8ffb6',
      name: 'Office Worker',
      desc: 'On a long conference call.',
      tree: { start: { text: 'Shh, on a call...', choices: [ { label: '(Leave quietly)', to: 'bye' } ] } }
    },
    {
      id: 'friend1',
      map: 'floor3',
      x: 6,
      y: FLOOR_H - 7,
      color: '#caffc6',
      name: 'Coworker Jen',
      desc: 'Your friend scrolling through code.',
      questId: 'q_card',
      tree: {
        start: {
          text: 'Ready for the sim once you get the card.',
          choices: [
            { label: '(Where do I get one?)', to: 'accept', q: 'accept' },
            { label: '(I have the card)', to: 'do_turnin', q: 'turnin' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'Security downstairs hoards spares.', choices: [ { label: '(Thanks)', to: 'bye' } ] },
        do_turnin: {
          text: 'Jen hands you a battered VR headset.',
          choices: [ { label: '(Continue)', to: 'bye' } ]
        }
      }
    },
    {
      id: 'friend2',
      map: 'floor3',
      x: FLOOR_W - 7,
      y: FLOOR_H - 8,
      color: '#caffc6',
      name: 'Coworker Luis',
      desc: 'Testing a new patch.',
      tree: {
        start: {
          text: 'See you in the forest.',
          choices: [ { label: '(Laugh)', to: 'bye' } ]
        }
      }
    },
    {
      id: 'toll',
      map: 'world',
      x: WORLD_MID,
      y: WORLD_MIDY,
      color: '#a9f59f',
      name: 'Toll Keeper',
      desc: 'Blocks the only bridge across the river.',
      questId: 'q_toll',
      tree: {
        start: {
          text: 'Pay a trinket to cross.',
          choices: [
            {
              label: '(Accept quest)',
              to: 'accept',
              q: 'accept'
            },
            {
              label: '(Pay)',
              to: 'do_turnin',
              q: 'turnin',
              costSlot: 'trinket',
              success: '',
              failure: 'You have no trinket.'
            },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        accept: { text: 'Bring me a trinket and you may cross.', choices: [ { label: '(Leave)', to: 'bye' } ] },
        do_turnin: {
          text: 'The toll keeper steps aside.',
          choices: [
            {
              label: '(Continue)',
              to: 'bye'
            }
          ]
        }
      }
    },
    {
      id: 'fae_prince',
      map: 'world',
      x: WORLD_MID + 9,
      y: WORLD_MIDY - 2,
      color: '#caffc6',
      name: 'Fae Prince',
      desc: 'An ethereal figure with an enigmatic smile.',
      tree: {
        start: {
          text: 'Welcome, wanderer. Is this real or dream?',
          choices: [
            { label: '(Ask)', to: 'ask' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        ask: {
          text: 'He only laughs and vanishes into mist.',
          choices: [ { label: '(Contemplate)', to: 'bye' } ]
        }
      }
    },
    {
      id: 'vending',
      map: 'floor2',
      x: midX,
      y: 6,
      color: '#a9f59f',
      name: 'Vending Machine',
      desc: 'It flashes "TRADE".',
      shop: true,
      tree: { start: { text: 'The machine hums softly.', choices: [ { label: '(Leave)', to: 'bye' } ] } }
    },
    {
      id: 'rogue_janitor',
      map: 'floor1',
      x: 3,
      y: 6,
      color: '#f88',
      name: 'Rogue Janitor',
      desc: 'Wields a dripping mop.',
      tree: { start: { text: 'He blocks your path.', choices: [ { label: '(Leave)', to: 'bye' } ] } },
      combat: { DEF: 3, loot: { id: 'rusty_mop', name: 'Rusty Mop', type: 'weapon', slot: 'weapon', mods: { ATK: 1 } } }
    }
  ];

  return {
    seed: Date.now(),
    worldGen: genForestWorld,
    start: { map: 'floor1', x: midX, y: FLOOR_H - 2 },
    mapLabels: {
      world: 'Forest',
      floor1: 'Lobby',
      floor2: 'Workspace',
      floor3: 'Executive Suite',
      castle: 'Castle'
    },
      items: [
        { id: 'access_card', name: 'Access Card', type: 'quest', tags: ['pass'] },
        {
          id: 'cursed_vr_helmet',
          name: 'Cursed VR Helmet',
          type: 'armor',
          slot: 'armor',
          cursed: true,
          equip: {
            teleport: { map: 'world', x: 2, y: WORLD_MIDY },
            msg: 'You step into the forest.'
          }
        },
        {
          map: 'world',
          x: WORLD_MID - 2,
          y: WORLD_MIDY,
          id: 'river_trinket',
          name: 'River Trinket',
          type: 'trinket',
          slot: 'trinket',
          mods: { LCK: 1 }
        }
      ],
      quests: [
        {
          id: 'q_card',
          title: 'Access Granted',
          desc: 'Convince security to lend you an access card and join Jen in the sim.',
          reward: 'cursed_vr_helmet'
        },
        {
          id: 'q_toll',
          title: 'Bridge Tax',
          desc: 'Pay the Toll Keeper with a trinket.',
          moveTo: { x: WORLD_MID + 2, y: WORLD_MIDY }
        }
      ],
    npcs,
    interiors: [floor1, floor2, floor3, castle]
  };
})();

const _startGame = startGame;
startGame = function () {
  if (OFFICE_MODULE.worldGen) {
    const { castleId } = OFFICE_MODULE.worldGen();
    applyModule(OFFICE_MODULE);
    const charm = registerItem({
      id: 'forest_charm',
      name: 'Forest Charm',
      type: 'trinket',
      slot: 'trinket',
      mods: { LCK: 1 }
    });
    if (castleId && interiors[castleId]) {
      const interior = interiors[castleId];
      const ix = Math.floor(interior.w / 2);
      const iy = Math.floor(interior.h / 2);
      itemDrops.push({ id: charm.id, map: castleId, x: ix, y: iy });
    }
    const s = OFFICE_MODULE.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
    player.x = s.x;
    player.y = s.y;
    setMap(s.map);
    renderInv();
    renderQuests();
    renderParty();
    updateHUD();
    log(s.map === 'world' ? 'You step into the forest.' : 'You arrive at the office.');
  } else {
    _startGame();
    applyModule(OFFICE_MODULE);
  }
};

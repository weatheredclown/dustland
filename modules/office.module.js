function seedWorldContent() {}

const OFFICE_MODULE = (() => {
  const FLOOR_W = 20,
    // Expanded height to make room for an exterior elevator area
    FLOOR_H = 24;
  const midX = Math.floor(FLOOR_W / 2);

  // VR Forest dimensions
  const FOREST_W = 20,
    FOREST_H = 15,
    FOREST_MID = Math.floor(FOREST_W / 2),
    FOREST_MIDY = Math.floor(FOREST_H / 2);

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

  function makeForest() {
    const grid = Array.from({ length: FOREST_H }, (_, y) =>
      Array.from({ length: FOREST_W }, (_, x) => {
        if (y === 0 || y === FOREST_H - 1 || x === 0 || x === FOREST_W - 1)
          return TILE.WALL;
        if (x === FOREST_MID) return TILE.WATER;
        return TILE.FLOOR;
      })
    );
    // bridge over the river
    grid[FOREST_MIDY][FOREST_MID] = TILE.FLOOR;
    return {
      id: 'forest',
      w: FOREST_W,
      h: FOREST_H,
      grid,
      entryX: 2,
      entryY: FOREST_MIDY
    };
  }

  const floor1 = makeFloor1();
  const floor2 = makeFloor2();
  const floor3 = makeFloor3();
  const forest = makeForest();

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
            costItem: 'Access Card',
            reward: 'Access Card',
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
            { label: '(Ask for Access Card)', to: 'give', once: true },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        give: {
          text: 'He lends you a spare card.',
          choices: [
            { label: '(Take Access Card)', to: 'bye', reward: 'Access Card' }
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
      tree: {
        start: {
          text: 'Ready for the sim once you get the card.',
          choices: [ { label: '(Nod)', to: 'bye' } ]
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
      map: 'forest',
      x: FOREST_MID,
      y: FOREST_MIDY,
      color: '#a9f59f',
      name: 'Toll Keeper',
      desc: 'Blocks the only bridge across the river.',
      tree: {
        start: {
          text: 'Pay a trinket to cross.',
          choices: [
            { label: '(Pay)', to: 'paid', costSlot: 'trinket', success: '', failure: 'You have no trinket.' },
            { label: '(Leave)', to: 'bye' }
          ]
        },
        paid: {
          text: 'The toll keeper steps aside.',
          choices: [
            { label: '(Continue)', to: 'bye', effects: [() => removeNPC(currentNPC)] }
          ]
        }
      }
    },
    {
      id: 'fae_prince',
      map: 'forest',
      x: FOREST_W - 3,
      y: FOREST_MIDY - 2,
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
    }
  ];

  return {
    seed: Date.now(),
    start: { map: 'floor1', x: midX, y: FLOOR_H - 2 },
    items: [
      {
        map: 'floor3',
        x: midX,
        y: 6,
        name: 'Cursed VR Helmet',
        slot: 'armor',
        cursed: true,
        equip: { teleport: { map: 'forest', x: 2, y: FOREST_MIDY } }
      }
    ],
    quests: [],
    npcs,
    interiors: [floor1, floor2, floor3, forest],
    buildings: []
  };
})();

const _startGame = startGame;
startGame = function () {
  startWorld();
  applyModule(OFFICE_MODULE);
  const s = OFFICE_MODULE.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setMap(s.map);
  player.x = s.x;
  player.y = s.y;
  centerCamera(player.x, player.y, s.map);
  renderInv();
  renderQuests();
  renderParty();
  updateHUD();
};

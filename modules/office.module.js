function seedWorldContent() {}

const OFFICE_MODULE = (() => {
  const FLOOR_W = 20,
    // Expanded height to make room for an exterior elevator area
    FLOOR_H = 24;
  const midX = Math.floor(FLOOR_W / 2);

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

  const floor1 = makeFloor1();
  const floor2 = makeFloor2();
  const floor3 = makeFloor3();

  const npcs = ['floor1', 'floor2', 'floor3'].map((map) => ({
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
          { label: 'Executive Suite', to: 'bye', goto: { map: 'floor3', x: midX, y: 2 } }
        ]
      }
    }
  }));

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
        equip: { teleport: { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) } }
      }
    ],
    quests: [],
    npcs,
    interiors: [floor1, floor2, floor3],
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

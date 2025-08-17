function seedWorldContent() {}

const OFFICE_MODULE = (() => {
  const FLOOR_W = 10,
    FLOOR_H = 10;
  const midX = Math.floor(FLOOR_W / 2);

  function makeFloor(id) {
    const grid = Array.from({ length: FLOOR_H }, (_, y) =>
      Array.from({ length: FLOOR_W }, (_, x) => {
        const edge = y === 0 || y === FLOOR_H - 1 || x === 0 || x === FLOOR_W - 1;
        return edge ? TILE.WALL : TILE.FLOOR;
      })
    );
    // elevator walls and door
    grid[1][midX - 1] = TILE.WALL;
    grid[1][midX + 1] = TILE.WALL;
    grid[2][midX - 1] = TILE.WALL;
    grid[2][midX + 1] = TILE.WALL;
    grid[3][midX - 1] = TILE.WALL;
    grid[3][midX + 1] = TILE.WALL;
    grid[1][midX] = TILE.FLOOR; // NPC spot
    grid[2][midX] = TILE.FLOOR;
    grid[3][midX] = TILE.DOOR;
    return { id, w: FLOOR_W, h: FLOOR_H, grid, entryX: midX, entryY: 2 };
  }

  const floor1 = makeFloor('floor1');
  const floor2 = makeFloor('floor2');
  const floor3 = makeFloor('floor3');

  const npcs = ['floor1', 'floor2', 'floor3'].map((map) => ({
    id: `elevator_${map}`,
    map,
    x: midX,
    y: 1,
    color: '#a9f59f',
    name: 'Elevator Buttons',
    desc: 'A panel to select floors.',
    tree: {
      start: {
        text: 'Select floor:',
        choices: [
          { label: 'Floor 1', to: 'bye', goto: { map: 'floor1', x: midX, y: 2 } },
          { label: 'Floor 2', to: 'bye', goto: { map: 'floor2', x: midX, y: 2 } },
          { label: 'Floor 3', to: 'bye', goto: { map: 'floor3', x: midX, y: 2 } }
        ]
      }
    }
  }));

  return {
    seed: Date.now(),
    start: { map: 'floor1', x: midX, y: FLOOR_H - 2 },
    items: [],
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
  setMap(s.map, s.map === 'world' ? 'Wastes' : 'Office');
  player.x = s.x;
  player.y = s.y;
  centerCamera(player.x, player.y, s.map);
  renderInv();
  renderQuests();
  renderParty();
  updateHUD();
};

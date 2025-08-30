function seedWorldContent() {}

const DATA = `{
  "seed": "jax-repair",
  "name": "jax-repair",
  "items": [],
  "quests": [],
  "npcs": [],
  "interiors": [
    {
      "id": "repair_bay",
      "w": 7,
      "h": 7,
      "grid": [
        "🧱🧱🧱🧱🧱🧱🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🚪🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🏝🏝🏝🏝🏝🧱",
        "🧱🧱🧱🧱🧱🧱🧱"
      ],
      "entryX": 3,
      "entryY": 5
    }
  ],
  "events": [],
  "portals": [],
  "buildings": [],
  "start": { "map": "repair_bay", "x": 3, "y": 5 }
}`;

function postLoad(module) {}

globalThis.JAX_REPAIR = JSON.parse(DATA);
globalThis.JAX_REPAIR.postLoad = postLoad;

startGame = function () {
  applyModule(JAX_REPAIR);
  const s = JAX_REPAIR.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Repair Bay');
  refreshUI();
  log('The generator sputters! Hold off the attack while Jax repairs it.');
  let time = 5;
  const timer = setInterval(() => {
    time--;
    if (time <= 0) {
      clearInterval(timer);
      log('Repair complete!');
    } else {
      log(time + '...');
    }
  }, 1000);
};

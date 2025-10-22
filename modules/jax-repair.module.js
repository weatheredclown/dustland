// @ts-nocheck
function seedWorldContent() { }
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
function postLoad(module) { }
globalThis.JAX_REPAIR = JSON.parse(DATA);
globalThis.JAX_REPAIR.postLoad = postLoad;
startGame = function () {
    applyModule(JAX_REPAIR);
    const s = JAX_REPAIR.start;
    setPartyPos(s.x, s.y);
    setMap(s.map, 'Repair Bay');
    log('The generator sputters! Hold off the attack while Jax repairs it.');
    const meter = document.createElement('div');
    meter.id = 'generator-meter';
    meter.style.position = 'absolute';
    meter.style.left = '10px';
    meter.style.bottom = '10px';
    meter.style.width = '120px';
    meter.style.height = '12px';
    meter.style.background = '#400';
    const fill = document.createElement('div');
    fill.style.height = '100%';
    fill.style.background = '#f00';
    meter.appendChild(fill);
    document.body.appendChild(meter);
    const max = 5;
    let time = max;
    function update() {
        const ratio = time / max;
        fill.style.width = (ratio * 100) + '%';
        if (ratio < 0.4)
            fill.style.background = '#ff0';
        if (ratio < 0.2)
            fill.style.background = '#f00';
    }
    update();
    const timer = setInterval(() => {
        time--;
        update();
        if (time <= 0) {
            clearInterval(timer);
            meter.remove();
            log('Repair complete!');
        }
        else {
            log(time + '...');
        }
    }, 1000);
};

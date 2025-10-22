// @ts-nocheck
const MODULE_FILE = 'modules/dustland.module.js';
let moduleReady;
function loadDustland() {
    moduleReady = new Promise(resolve => {
        const s = document.createElement('script');
        s.src = `${MODULE_FILE}?_=${Date.now()}`;
        s.onload = () => resolve();
        document.head.appendChild(s);
    });
}
loadDustland();
seedWorldContent = () => { };
startGame = async function () {
    await moduleReady;
    applyModule(DUSTLAND_MODULE);
    DUSTLAND_MODULE.postLoad?.(DUSTLAND_MODULE);
    // Spawn the party near the southwest broadcast door.
    const entry = { map: 'world', x: 5, y: 80 };
    setPartyPos(entry.x, entry.y);
    setMap(entry.map, 'Wastes');
    toast('Head north to the broadcast listening post.');
};

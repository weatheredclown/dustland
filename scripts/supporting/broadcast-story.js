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
globalThis.seedWorldContent = () => { };
globalThis.startGame = async function startBroadcastStory() {
    await moduleReady;
    const globals = globalThis;
    const moduleData = globals.DUSTLAND_MODULE;
    if (!moduleData)
        return;
    globals.applyModule?.(moduleData);
    moduleData.postLoad?.(moduleData);
    // Spawn the party near the southwest broadcast door.
    const entry = { map: 'world', x: 5, y: 80 };
    globals.setPartyPos?.(entry.x, entry.y);
    globals.setMap?.(entry.map, 'Wastes');
    globals.toast?.('Head north to the broadcast listening post.');
};

const MODULE_FILE = 'modules/dustland.module.js';

let moduleReady: Promise<void>;
function loadDustland(){
  moduleReady = new Promise<void>(resolve => {
    const s = document.createElement('script');
    s.src = `${MODULE_FILE}?_=${Date.now()}`;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}
loadDustland();

globalThis.seedWorldContent = () => {};

globalThis.startGame = async function startBroadcastStory(): Promise<void> {
  await moduleReady;
  const globals = globalThis as {
    applyModule?: (moduleData: unknown) => void;
    DUSTLAND_MODULE?: { postLoad?: (moduleData: unknown) => void };
    setPartyPos?: (x: number, y: number) => void;
    setMap?: (map: string, label?: string) => void;
    toast?: (message: string) => void;
  };
  const moduleData = globals.DUSTLAND_MODULE;
  if (!moduleData) return;
  globals.applyModule?.(moduleData);
  moduleData.postLoad?.(moduleData);
  // Spawn the party near the southwest broadcast door.
  const entry = { map: 'world', x: 5, y: 80 };
  globals.setPartyPos?.(entry.x, entry.y);
  globals.setMap?.(entry.map, 'Wastes');
  globals.toast?.('Head north to the broadcast listening post.');
};

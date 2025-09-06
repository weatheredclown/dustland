const BROADCAST_FILES = [
  'modules/broadcast-fragment-1.module.js',
  'modules/broadcast-fragment-2.module.js',
  'modules/broadcast-fragment-3.module.js',
  'modules/mara-puzzle.module.js'
];

let fragmentsReady;
function loadFragments(){
  fragmentsReady = new Promise(resolve => {
    let loaded = 0;
    BROADCAST_FILES.forEach(src => {
      const s = document.createElement('script');
      s.src = `${src}?_=${Date.now()}`;
      s.onload = () => {
        loaded++;
        if(loaded === BROADCAST_FILES.length) resolve();
      };
      document.head.appendChild(s);
    });
  });
}
loadFragments();

seedWorldContent = () => {};

startGame = async function(){
  await fragmentsReady;
  applyModule(BROADCAST_FRAGMENT_1);
  const map = BROADCAST_FRAGMENT_1.startMap || 'world';
  const pt = BROADCAST_FRAGMENT_1.startPoint || { x: 2, y: Math.floor(WORLD_H/2) };
  setPartyPos(pt.x, pt.y);
  setMap(map, map === 'world' ? 'Wastes' : map);
};

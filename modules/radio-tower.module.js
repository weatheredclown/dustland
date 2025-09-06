const DATA = `{
  "name": "Radio Tower",
  "start": { "map": "tower", "x": 1, "y": 1 },
  "interiors": [
    { "id": "tower", "w": 3, "h": 4, "grid": [
"🧱🧱🧱",
"🧱⬜🧱",
"🧱⬜🧱",
"🧱🧱🧱"
], "entryX": 1, "entryY": 1 }
  ],
  "events": [
    { "map": "tower", "x": 1, "y": 1, "events": [ { "when": "enter", "effect": "openRadio" } ] }
  ]
}`;

function postLoad(mod){
  mod.effects = mod.effects || {};
  mod.effects.openRadio = () => openRadioPuzzle();
}

globalThis.RADIO_TOWER = JSON.parse(DATA);
globalThis.RADIO_TOWER.postLoad = postLoad;

startGame = function(){
  applyModule(RADIO_TOWER);
  const s = RADIO_TOWER.start;
  setPartyPos(s.x, s.y);
  setMap(s.map, 'Radio Tower');
  log('The array hums with faint static.');
};

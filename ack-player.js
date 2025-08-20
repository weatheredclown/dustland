// ACK Module Player (ESM)
// Loads a module JSON and starts the game using its data.

import { applyModule, setPartyPos, setMap, WORLD_H, openCreator } from './dustland-core.js';
import './core/party.js';
import './core/inventory.js';
import './core/effects.js';
import './core/movement.js';
import './core/dialog.js';
import './core/combat.js';
import './dustland-nano.js';

// Prevent the engine from auto-starting the creator or start menu
window.showStart = () => {};
const realOpenCreator = openCreator;
window.openCreator = () => {};

let renderInv, renderQuests, renderParty, updateHUD, log;
const enginePromise = import('./dustland-engine.js').then(mod => {
  ({ renderInv, renderQuests, renderParty, updateHUD, log } = mod);
});

let moduleData = null;
const PLAYTEST_KEY = 'ack_playtest';
const loader = document.getElementById('moduleLoader');
const fileInput = document.getElementById('modFile');
const loadBtn = document.getElementById('modLoadBtn');

const playData = localStorage.getItem(PLAYTEST_KEY);
if (playData) {
  try {
    moduleData = JSON.parse(playData);
    localStorage.removeItem(PLAYTEST_KEY);
    loader.style.display = 'none';
    window.openCreator = realOpenCreator;
    realOpenCreator();
  } catch (e) {
    localStorage.removeItem(PLAYTEST_KEY);
  }
}

loadBtn.onclick = () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      moduleData = JSON.parse(reader.result);
      loader.style.display = 'none';
      window.openCreator = realOpenCreator;
      realOpenCreator();
    } catch (err) {
      alert('Invalid module:' + err);
    }
  };
  reader.readAsText(file);
};

// After party creation, start the loaded module
window.startGame = async function () {
  await enginePromise;
  if (moduleData) applyModule(moduleData);
  const start = moduleData && moduleData.start ? moduleData.start : { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setPartyPos(start.x, start.y);
  setMap(start.map || 'world', 'Module');
  renderInv();
  renderQuests();
  renderParty();
  updateHUD();
  log('Adventure begins.');
};


// ACK Module Player (ESM)
// Loads a module JSON and starts the game using its data.

// use globals from core and engine

// Prevent the engine from auto-starting the creator or start menu
window.showStart = () => {};
const realOpenCreator = openCreator;
window.openCreator = () => {};


let moduleData = null;
const PLAYTEST_KEY = 'ack_playtest';
const loader = document.getElementById('moduleLoader');
const urlInput = document.getElementById('modUrl');
const urlBtn = document.getElementById('modUrlBtn');
const fileInput = document.getElementById('modFile');
const fileBtn = document.getElementById('modFileBtn');

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

const autoUrl = params.get('module');
if (!moduleData && autoUrl) {
  urlInput.value = autoUrl;
  fetch(autoUrl)
    .then((r) => r.json())
    .then((data) => loadModule(data))
    .catch((err) => alert('Invalid module:' + err));
}

async function loadModule(data) {
  moduleData = data;
  loader.style.display = 'none';
  window.openCreator = realOpenCreator;
  realOpenCreator();
}

urlBtn.onclick = async () => {
  const url = urlInput.value.trim();
  if (!url) return;
  try {
    const res = await fetch(url);
    const data = await res.json();
    await loadModule(data);
  } catch (err) {
    alert('Invalid module:' + err);
  }
};

fileBtn.onclick = () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      loadModule(JSON.parse(reader.result));
    } catch (err) {
      alert('Invalid module:' + err);
    }
  };
  reader.readAsText(file);
};

// After party creation, start the loaded module
window.startGame = async function () {
  if (moduleData) applyModule(moduleData);
  else applyModule({});
  const start = moduleData && moduleData.start ? moduleData.start : { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  setPartyPos(start.x, start.y);
  setMap(start.map || 'world', 'Module');
  refreshUI();
  log('Adventure begins.');
};


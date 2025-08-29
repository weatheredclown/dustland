// ACK Module Player (ESM)
// Loads a module JSON and starts the game using its data.

// use globals from core and engine

// Prevent the engine from auto-starting the creator or start menu
window.showStart = () => {};
let realOpenCreator = null;
function captureOpenCreator() {
  if (typeof window.openCreator === 'function') {
    realOpenCreator = window.openCreator;
    window.openCreator = () => {};
  } else {
    setTimeout(captureOpenCreator, 0);
  }
}
captureOpenCreator();


let moduleData = null;
const PLAYTEST_KEY = 'ack_playtest';
const loaderId = 'moduleLoader';
const urlInput = document.getElementById('modUrl');
const urlBtn = document.getElementById('modUrlBtn');
const fileInput = document.getElementById('modFile');
const fileBtn = document.getElementById('modFileBtn');

const playData = localStorage.getItem(PLAYTEST_KEY);
if (playData) {
  try {
    moduleData = JSON.parse(playData);
    localStorage.removeItem(PLAYTEST_KEY);
    UI.hide(loaderId);
    if (realOpenCreator) {
      window.openCreator = realOpenCreator;
      realOpenCreator();
    }
  } catch (e) {
    localStorage.removeItem(PLAYTEST_KEY);
  }
}

const autoUrl = params.get('module');
if (!moduleData && autoUrl) {
  UI.setValue('modUrl', autoUrl);
  fetch(autoUrl)
    .then((r) => r.json())
    .then((data) => loadModule(data))
    .catch((err) => alert('Invalid module:' + err));
}

async function loadModule(data) {
  moduleData = data;
  if (typeof moduleData.module === 'string') {
    try {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = moduleData.module;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      const base = moduleData.module.match(/([^/]+)\.module\.js$/)?.[1] || '';
      const guesses = [];
      if (moduleData.moduleVar) guesses.push(moduleData.moduleVar);
      if (base) {
        const upper = base.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
        guesses.push(upper + '_MODULE', upper);
      }
      let modObj = null;
      for (const name of guesses) {
        if (globalThis[name]) { modObj = globalThis[name]; break; }
      }
      const hook = modObj?.postLoad || globalThis.postLoad;
      if (typeof hook === 'function') {
        try { hook(moduleData); }
        catch (err) { console.error('postLoad error', err); }
      }
    } catch (err) {
      console.error('module script error', err);
    }
    delete moduleData.module;
    delete moduleData.moduleVar;
  }
  UI.hide(loaderId);
  if (realOpenCreator) {
    window.openCreator = realOpenCreator;
    realOpenCreator();
  }
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


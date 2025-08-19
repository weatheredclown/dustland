// ACK Module Player
// Loads a module JSON and starts the game using its data.

let moduleData = null;
const PLAYTEST_KEY = 'ack_playtest';
const loader = document.getElementById('moduleLoader');
const fileInput = document.getElementById('modFile');
const loadBtn = document.getElementById('modLoadBtn');

const playData = localStorage.getItem(PLAYTEST_KEY);
if(playData){
  try{
    moduleData = JSON.parse(playData);
    localStorage.removeItem(PLAYTEST_KEY);
    loader.style.display='none';
    window.openCreator = window._realOpenCreator;
    openCreator();
  }catch(e){
    localStorage.removeItem(PLAYTEST_KEY);
  }
}

loadBtn.onclick = () => {
  const file = fileInput.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      moduleData = JSON.parse(reader.result);
      loader.style.display = 'none';
      window.openCreator = window._realOpenCreator;
      openCreator();
    } catch(err){
      alert('Invalid module:' +  err);
    }
  };
  reader.readAsText(file);
};

// After party creation, start the loaded module
window.startGame = function(){
  if(moduleData) applyModule(moduleData);
  const start=moduleData && moduleData.start ? moduleData.start : {map:'world',x:2,y:Math.floor(WORLD_H/2)};
  player.x = start.x;
  player.y = start.y;
  setMap(start.map||'world', 'Module');
  renderInv(); renderQuests(); renderParty(); updateHUD();
  log('Adventure begins.');
};

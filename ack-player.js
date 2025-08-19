// ACK Module Player
// Loads a module JSON and starts the game using its data.

let moduleData = null;
const loader = document.getElementById('moduleLoader');
const fileInput = document.getElementById('modFile');
const loadBtn = document.getElementById('modLoadBtn');

const playData = localStorage.getItem('ack_playtest');
if(playData){
  try{
    moduleData = JSON.parse(playData);
    localStorage.removeItem('ack_playtest');
    loader.style.display='none';
    window.openCreator = window._realOpenCreator;
    openCreator();
  }catch(e){
    localStorage.removeItem('ack_playtest');
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
  setPlayerPos(start.x, start.y);
  setMap(start.map||'world', 'Module');
  renderInv(); renderQuests(); renderParty(); updateHUD();
  log('Adventure begins.');
};

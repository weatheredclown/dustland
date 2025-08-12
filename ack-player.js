// ACK Module Player
// Loads a module JSON and starts the game using its data.

let moduleData = null;
const loader = document.getElementById('moduleLoader');
const fileInput = document.getElementById('modFile');
const loadBtn = document.getElementById('modLoadBtn');

function applyModule(data){
  setRNGSeed(data.seed || Date.now());
  world = data.world || world;
  buildings = data.buildings || [];
  buildings.forEach(b=>{
    if(!interiors[b.interiorId]){
      const id = makeInteriorRoom();
      b.interiorId = id;
    }
  });
  itemDrops.length = 0;
  (data.items||[]).forEach(it=>{
    itemDrops.push({map:'world', x:it.x, y:it.y, name:it.name, slot:it.slot, mods:it.mods});
  });
  Object.keys(quests).forEach(k=> delete quests[k]);
  (data.quests||[]).forEach(q=>{
    quests[q.id] = new Quest(q.id, q.title, q.desc);
  });
  NPCS.length = 0;
  (data.npcs||[]).forEach(n=>{
    const tree = { start:{ text:n.dialog||'', choices:[{label:'(Leave)', to:'bye'}] } };
    const npc = makeNPC(n.id, 'world', n.x, n.y, n.color||'#9ef7a0', n.name||n.id, '', '', tree);
    NPCS.push(npc);
  });
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
      alert('Invalid module');
    }
  };
  reader.readAsText(file);
};

// After party creation, start the loaded module
window.startGame = function(){
  if(moduleData) applyModule(moduleData);
  setMap('world', 'Module');
  player.x = 2;
  player.y = Math.floor(WORLD_H/2);
  centerCamera(player.x, player.y, 'world');
  renderInv(); renderQuests(); renderParty(); updateHUD();
  log('Adventure begins.');
};

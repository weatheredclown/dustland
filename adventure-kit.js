// Adventure Construction Kit
// Provides basic tools to build Dustland modules.

// Ensure world generation doesn't pull default content
window.seedWorldContent = () => {};

const colors = {0:'#1e271d',1:'#2c342c',2:'#1573ff',3:'#203320',4:'#394b39',5:'#304326',6:'#4d5f4d',7:'#233223',8:'#8bd98d',9:'#000'};
const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

const moduleData = { seed: Date.now(), npcs: [], items: [], quests: [], buildings: [] };

function drawWorld(){
  const W = WORLD_W, H = WORLD_H;
  const sx = canvas.width / W;
  const sy = canvas.height / H;
  for(let y=0;y<H;y++){
    for(let x=0;x<W;x++){
      const t = world[y][x];
      ctx.fillStyle = colors[t] || '#000';
      ctx.fillRect(x*sx, y*sy, sx, sy);
    }
  }
  // Draw NPC markers
  moduleData.npcs.forEach(n=>{
    ctx.fillStyle = n.color || '#fff';
    ctx.fillRect(n.x*sx, n.y*sy, sx, sy);
  });
}

function regenWorld(){
  moduleData.seed = Date.now();
  genWorld(moduleData.seed);
  moduleData.buildings = [...buildings];
  drawWorld();
}

// --- NPCs ---
function addNPC(){
  const id=document.getElementById('npcId').value.trim();
  const name=document.getElementById('npcName').value.trim();
  const color=document.getElementById('npcColor').value.trim()||'#fff';
  const x=parseInt(document.getElementById('npcX').value,10)||0;
  const y=parseInt(document.getElementById('npcY').value,10)||0;
  const dialog=document.getElementById('npcDialog').value.trim();
  moduleData.npcs.push({id,name,color,x,y,dialog});
  renderNPCList();
  drawWorld();
}
function renderNPCList(){
  const list=document.getElementById('npcList');
  list.innerHTML=moduleData.npcs.map(n=>`<div>${n.id} @(${n.x},${n.y})</div>`).join('');
}

// --- Items ---
function addItem(){
  const name=document.getElementById('itemName').value.trim();
  const x=parseInt(document.getElementById('itemX').value,10)||0;
  const y=parseInt(document.getElementById('itemY').value,10)||0;
  moduleData.items.push({name,x,y});
  renderItemList();
}
function renderItemList(){
  const list=document.getElementById('itemList');
  list.innerHTML=moduleData.items.map(it=>`<div>${it.name} @(${it.x},${it.y})</div>`).join('');
}

// --- Buildings ---
function addBuilding(){
  const x=parseInt(document.getElementById('bldgX').value,10)||0;
  const y=parseInt(document.getElementById('bldgY').value,10)||0;
  placeHut(x,y);
  moduleData.buildings = [...buildings];
  renderBldgList();
  drawWorld();
}
function renderBldgList(){
  const list=document.getElementById('bldgList');
  list.innerHTML=moduleData.buildings.map(b=>`<div>Hut @(${b.x},${b.y})</div>`).join('');
}

// --- Quests ---
function addQuest(){
  const id=document.getElementById('questId').value.trim();
  const title=document.getElementById('questTitle').value.trim();
  const desc=document.getElementById('questDesc').value.trim();
  moduleData.quests.push({id,title,desc});
  renderQuestList();
}
function renderQuestList(){
  const list=document.getElementById('questList');
  list.innerHTML=moduleData.quests.map(q=>`<div>${q.id}: ${q.title}</div>`).join('');
}

function saveModule(){
  const data={...moduleData, world, buildings};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='adventure-module.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById('regen').onclick=regenWorld;
document.getElementById('addNPC').onclick=addNPC;
document.getElementById('addItem').onclick=addItem;
document.getElementById('addBldg').onclick=addBuilding;
document.getElementById('addQuest').onclick=addQuest;
document.getElementById('save').onclick=saveModule;

regenWorld();

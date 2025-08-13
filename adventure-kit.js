// Adventure Construction Kit
// Provides basic tools to build Dustland modules.

// Ensure world generation doesn't pull default content
window.seedWorldContent = () => {};

const colors = {0:'#1e271d',1:'#2c342c',2:'#1573ff',3:'#203320',4:'#394b39',5:'#304326',6:'#4d5f4d',7:'#233223',8:'#8bd98d',9:'#000'};
const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

let dragTarget=null, settingStart=false;

const moduleData = { seed: Date.now(), npcs: [], items: [], quests: [], buildings: [], start:{map:'world',x:2,y:Math.floor(WORLD_H/2)} };
const STAT_OPTS=['ATK','DEF','LCK','INT','PER','CHA'];
let editNPCIdx=-1, editItemIdx=-1, editQuestIdx=-1, editBldgIdx=-1;

function nextId(prefix, arr){
  let i=1; while(arr.some(o=>o.id===prefix+i)) i++; return prefix+i;
}

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
  moduleData.npcs.filter(n=> n.map==='world').forEach(n=>{
    ctx.fillStyle = n.color || '#fff';
    ctx.fillRect(n.x*sx, n.y*sy, sx, sy);
  });
  // Draw Item markers
  moduleData.items.filter(it=> it.map==='world').forEach(it=>{
    ctx.strokeStyle = '#ff0';
    ctx.strokeRect(it.x*sx+1, it.y*sy+1, sx-2, sy-2);
  });
  if(moduleData.start && moduleData.start.map==='world'){
    ctx.strokeStyle = '#f00';
    ctx.strokeRect(moduleData.start.x*sx+1, moduleData.start.y*sy+1, sx-2, sy-2);
  }
}

function regenWorld(){
  moduleData.seed = Date.now();
  genWorld(moduleData.seed);
  moduleData.buildings = [...buildings];
  drawWorld();
}

function modRow(stat='ATK', val=1){
  const div=document.createElement('div');
  const sel=document.createElement('select');
  sel.className='modStat';
  sel.innerHTML=STAT_OPTS.map(s=>`<option value="${s}"${s===stat?' selected':''}>${s}</option>`).join('');
  const inp=document.createElement('input');
  inp.type='number'; inp.className='modVal'; inp.value=val;
  div.appendChild(sel); div.appendChild(inp);
  document.getElementById('modBuilder').appendChild(div);
}
function collectMods(){
  const mods={};
  document.querySelectorAll('#modBuilder > div').forEach(div=>{
    const stat=div.querySelector('.modStat').value;
    const val=parseInt(div.querySelector('.modVal').value,10);
    if(stat && val) mods[stat]=val;
  });
  return mods;
}
function loadMods(mods){
  const mb=document.getElementById('modBuilder');
  mb.innerHTML='';
  Object.entries(mods||{}).forEach(([s,v])=>modRow(s,v));
}

function renderDialogPreview(){
  const prev=document.getElementById('dialogPreview');
  let tree=null;
  const txt=document.getElementById('npcTree').value.trim();
  if(txt){ try{ tree=JSON.parse(txt); }catch(e){ tree=null; } }
  if(!tree){ prev.innerHTML=''; return; }
  function show(id){
    const node=tree[id]; if(!node) return;
    prev.innerHTML=`<div>${node.text||''}</div>`+(node.choices||[]).map(c=>`<button class="btn" data-to="${c.to}" style="margin-top:4px">${c.label}</button>`).join('');
    Array.from(prev.querySelectorAll('button')).forEach(btn=>btn.onclick=()=>show(btn.dataset.to));
  }
  show('start');
}

function generateQuestTree(){
  const quest=document.getElementById('npcQuest').value.trim();
  if(!quest) return;
  const dialog=document.getElementById('npcDialog').value.trim();
  const accept=document.getElementById('npcAccept').value.trim();
  const turnin=document.getElementById('npcTurnin').value.trim();
  const tree={
    start:{text:dialog,choices:[{label:'Accept quest',to:'accept',q:'accept'},{label:'Turn in',to:'do_turnin',q:'turnin'},{label:'(Leave)',to:'bye'}]},
    accept:{text:accept||'Good luck.',choices:[{label:'(Leave)',to:'bye'}]},
    do_turnin:{text:turnin||'Thanks for helping.',choices:[{label:'(Leave)',to:'bye'}]}
  };
  document.getElementById('npcTree').value=JSON.stringify(tree,null,2);
  renderDialogPreview();
}

// --- NPCs ---
function applyCombatTree(tree){
  tree.start = tree.start || {text:'', choices:[]};
  if(!tree.start.choices.some(c=>c.to==='do_fight'))
    tree.start.choices.unshift({label:'(Fight)', to:'do_fight'});
  tree.do_fight = tree.do_fight || {text:'', choices:[{label:'(Continue)', to:'bye'}]};
}
function removeCombatTree(tree){
  if(tree.start && Array.isArray(tree.start.choices))
    tree.start.choices = tree.start.choices.filter(c=>c.to!=='do_fight');
  delete tree.do_fight;
}
function applyShopTree(tree){
  tree.start = tree.start || {text:'', choices:[]};
  if(!tree.start.choices.some(c=>c.to==='sell'))
    tree.start.choices.push({label:'(Sell items)', to:'sell'});
  tree.sell = tree.sell || {text:'What are you selling?', choices:[]};
}
function removeShopTree(tree){
  if(tree.start && Array.isArray(tree.start.choices))
    tree.start.choices = tree.start.choices.filter(c=>c.to!=='sell');
  delete tree.sell;
}
function addNPC(){
  const id=document.getElementById('npcId').value.trim();
  const name=document.getElementById('npcName').value.trim();
  const color=document.getElementById('npcColor').value.trim()||'#fff';
  const map=document.getElementById('npcMap').value.trim()||'world';
  const x=parseInt(document.getElementById('npcX').value,10)||0;
  const y=parseInt(document.getElementById('npcY').value,10)||0;
  const dialog=document.getElementById('npcDialog').value.trim();
  const questId=document.getElementById('npcQuest').value.trim();
  const accept=document.getElementById('npcAccept').value.trim();
  const turnin=document.getElementById('npcTurnin').value.trim();
  const combat=document.getElementById('npcCombat').checked;
  const shop=document.getElementById('npcShop').checked;
  let tree=null;
  const treeTxt=document.getElementById('npcTree').value.trim();
  if(treeTxt){ try{ tree=JSON.parse(treeTxt); }catch(e){ tree=null; } }
  if(!tree){
    if(questId){
      tree={
        start:{text:dialog,choices:[{label:'Accept quest',to:'accept',q:'accept'},{label:'Turn in',to:'do_turnin',q:'turnin'},{label:'(Leave)',to:'bye'}]},
        accept:{text:accept||'Good luck.',choices:[{label:'(Leave)',to:'bye'}]},
        do_turnin:{text:turnin||'Thanks for helping.',choices:[{label:'(Leave)',to:'bye'}]}
      };
    } else {
      tree={start:{text:dialog,choices:[{label:'(Leave)',to:'bye'}]}};
    }
  }
  if(combat) applyCombatTree(tree); else removeCombatTree(tree);
  if(shop) applyShopTree(tree); else removeShopTree(tree);
  document.getElementById('npcTree').value=JSON.stringify(tree,null,2);
  renderDialogPreview();

  const npc={id,name,color,map,x,y,tree,questId};
  if(combat) npc.combat = {DEF:5};
  if(shop) npc.shop = true;
  if(editNPCIdx>=0){
    moduleData.npcs[editNPCIdx]=npc;
  } else {
    moduleData.npcs.push(npc);
  }
  editNPCIdx=-1;
  document.getElementById('addNPC').textContent='Add NPC';
  document.getElementById('delNPC').style.display='none';
  renderNPCList();
  document.getElementById('npcId').value=nextId('npc',moduleData.npcs);
  document.getElementById('npcCombat').checked=false;
  document.getElementById('npcShop').checked=false;
  drawWorld();
  renderDialogPreview();
}
function editNPC(i){
  const n=moduleData.npcs[i];
  editNPCIdx=i;
  document.getElementById('npcId').value=n.id;
  document.getElementById('npcName').value=n.name;
  document.getElementById('npcColor').value=n.color;
  document.getElementById('npcMap').value=n.map;
  document.getElementById('npcX').value=n.x;
  document.getElementById('npcY').value=n.y;
  document.getElementById('npcDialog').value=n.tree?.start?.text||'';
  document.getElementById('npcQuest').value=n.questId||'';
  document.getElementById('npcAccept').value=n.tree?.accept?.text||'Good luck.';
  document.getElementById('npcTurnin').value=n.tree?.do_turnin?.text||'Thanks for helping.';
  document.getElementById('npcTree').value=JSON.stringify(n.tree,null,2);
   document.getElementById('npcCombat').checked=!!n.combat;
   document.getElementById('npcShop').checked=!!n.shop;
  document.getElementById('addNPC').textContent='Update NPC';
  document.getElementById('delNPC').style.display='block';
  renderDialogPreview();
}
function renderNPCList(){
  const list=document.getElementById('npcList');
  list.innerHTML=moduleData.npcs.map((n,i)=>`<div data-idx="${i}">${n.id} @${n.map} (${n.x},${n.y})${n.questId?` [${n.questId}]`:''}</div>`).join('');
  Array.from(list.children).forEach(div=>div.onclick=()=>editNPC(parseInt(div.dataset.idx,10)));
  updateQuestOptions();
}

function deleteNPC(){
  if(editNPCIdx<0) return;
  moduleData.npcs.splice(editNPCIdx,1);
  editNPCIdx=-1;
  document.getElementById('addNPC').textContent='Add NPC';
  document.getElementById('delNPC').style.display='none';
  renderNPCList();
  drawWorld();
  document.getElementById('npcId').value=nextId('npc',moduleData.npcs);
  renderDialogPreview();
}

// --- Items ---
function addItem(){
  const name=document.getElementById('itemName').value.trim();
  const map=document.getElementById('itemMap').value.trim()||'world';
  const x=parseInt(document.getElementById('itemX').value,10)||0;
  const y=parseInt(document.getElementById('itemY').value,10)||0;
  const slot=document.getElementById('itemSlot').value||null;
  const mods=collectMods();
  const value=parseInt(document.getElementById('itemValue').value,10)||0;
  let use=null;
  try{ use=JSON.parse(document.getElementById('itemUse').value||'null'); }catch(e){ use=null; }
  const item={name,map,x,y,slot,mods,value,use};
  if(editItemIdx>=0){
    moduleData.items[editItemIdx]=item;
  } else {
    moduleData.items.push(item);
  }
  editItemIdx=-1;
  document.getElementById('addItem').textContent='Add Item';
  document.getElementById('delItem').style.display='none';
  loadMods({});
  renderItemList();
  drawWorld();
}
function editItem(i){
  const it=moduleData.items[i];
  editItemIdx=i;
  document.getElementById('itemName').value=it.name;
  document.getElementById('itemMap').value=it.map;
  document.getElementById('itemX').value=it.x;
  document.getElementById('itemY').value=it.y;
  document.getElementById('itemSlot').value=it.slot||'';
  loadMods(it.mods);
  document.getElementById('itemValue').value=it.value||0;
  document.getElementById('itemUse').value=it.use?JSON.stringify(it.use,null,2):'';
  document.getElementById('addItem').textContent='Update Item';
  document.getElementById('delItem').style.display='block';
}
function renderItemList(){
  const list=document.getElementById('itemList');
  list.innerHTML=moduleData.items.map((it,i)=>`<div data-idx="${i}">${it.name} @${it.map} (${it.x},${it.y})</div>`).join('');
  Array.from(list.children).forEach(div=>div.onclick=()=>editItem(parseInt(div.dataset.idx,10)));
}

function deleteItem(){
  if(editItemIdx<0) return;
  moduleData.items.splice(editItemIdx,1);
  editItemIdx=-1;
  document.getElementById('addItem').textContent='Add Item';
  document.getElementById('delItem').style.display='none';
  loadMods({});
  renderItemList();
  drawWorld();
}

// --- Buildings ---
function addBuilding(){
  const x=parseInt(document.getElementById('bldgX').value,10)||0;
  const y=parseInt(document.getElementById('bldgY').value,10)||0;
  const b=placeHut(x,y);
  moduleData.buildings.push(b);
  renderBldgList();
  drawWorld();
  editBldgIdx=-1;
  document.getElementById('delBldg').style.display='none';
}
function renderBldgList(){
  const list=document.getElementById('bldgList');
  list.innerHTML=moduleData.buildings.map((b,i)=>`<div data-idx="${i}">Hut @(${b.x},${b.y})</div>`).join('');
  Array.from(list.children).forEach(div=>div.onclick=()=>editBldg(parseInt(div.dataset.idx,10)));
}

function editBldg(i){
  const b=moduleData.buildings[i];
  editBldgIdx=i;
  document.getElementById('bldgX').value=b.x;
  document.getElementById('bldgY').value=b.y;
  document.getElementById('delBldg').style.display='block';
}

function removeBuilding(b){
  if(b.under){
    for(let yy=0; yy<b.h; yy++){ for(let xx=0; xx<b.w; xx++){ setTile('world',b.x+xx,b.y+yy,b.under[yy][xx]); }}
  } else {
    for(let yy=0; yy<b.h; yy++){ for(let xx=0; xx<b.w; xx++){ setTile('world',b.x+xx,b.y+yy,TILE.SAND); }}
  }
  const idx=buildings.indexOf(b); if(idx>=0) buildings.splice(idx,1);
}
function moveBuilding(b,x,y){
  const idx=moduleData.buildings.indexOf(b);
  removeBuilding(b);
  const nb=placeHut(x,y);
  moduleData.buildings[idx]=nb;
  editBldgIdx=idx;
  return nb;
}

function deleteBldg(){
  if(editBldgIdx<0) return;
  const b=moduleData.buildings[editBldgIdx];
  removeBuilding(b);
  moduleData.buildings.splice(editBldgIdx,1);
  editBldgIdx=-1;
  document.getElementById('delBldg').style.display='none';
  renderBldgList();
  drawWorld();
}

// --- Quests ---
function addQuest(){
  const id=document.getElementById('questId').value.trim();
  const title=document.getElementById('questTitle').value.trim();
  const desc=document.getElementById('questDesc').value.trim();
  const item=document.getElementById('questItem').value.trim();
  const reward=document.getElementById('questReward').value.trim();
  const xp=parseInt(document.getElementById('questXP').value,10)||0;
  const quest={id,title,desc,item:item||undefined,reward:reward||undefined,xp};
  if(editQuestIdx>=0){
    moduleData.quests[editQuestIdx]=quest;
  } else {
    moduleData.quests.push(quest);
  }
  const npcId=document.getElementById('questNPC').value.trim();
  if(npcId){
    const npc=moduleData.npcs.find(n=>n.id===npcId);
    if(npc) npc.questId=id;
  }
  editQuestIdx=-1;
  document.getElementById('addQuest').textContent='Add Quest';
  document.getElementById('delQuest').style.display='none';
  renderQuestList();
  renderNPCList();
  document.getElementById('questId').value=nextId('quest',moduleData.quests);
}
function renderQuestList(){
  const list=document.getElementById('questList');
  list.innerHTML=moduleData.quests.map((q,i)=>`<div data-idx="${i}">${q.id}: ${q.title}</div>`).join('');
  Array.from(list.children).forEach(div=>div.onclick=()=>editQuest(parseInt(div.dataset.idx,10)));
  updateQuestOptions();
}
function editQuest(i){
  const q=moduleData.quests[i];
  editQuestIdx=i;
  document.getElementById('questId').value=q.id;
  document.getElementById('questTitle').value=q.title;
  document.getElementById('questDesc').value=q.desc;
  document.getElementById('questItem').value=q.item||'';
  document.getElementById('questReward').value=q.reward||'';
  document.getElementById('questXP').value=q.xp||0;
  const npc = moduleData.npcs.find(n=>n.questId===q.id);
  document.getElementById('questNPC').value=npc?npc.id:'';
  document.getElementById('addQuest').textContent='Update Quest';
  document.getElementById('delQuest').style.display='block';
}
function updateQuestOptions(){
  const sel=document.getElementById('npcQuest');
  const cur=sel.value;
  sel.innerHTML='<option value="">(none)</option>'+moduleData.quests.map(q=>`<option value="${q.id}">${q.title}</option>`).join('');
  sel.value=cur;
  const npcSel=document.getElementById('questNPC');
  if(npcSel){
    const npcCur=npcSel.value;
    npcSel.innerHTML='<option value="">(none)</option>'+moduleData.npcs.map(n=>`<option value="${n.id}">${n.id}</option>`).join('');
    npcSel.value=npcCur;
  }
}

function deleteQuest(){
  if(editQuestIdx<0) return;
  const q=moduleData.quests[editQuestIdx];
  moduleData.npcs.forEach(n=>{ if(n.questId===q.id) n.questId=''; });
  moduleData.quests.splice(editQuestIdx,1);
  editQuestIdx=-1;
  document.getElementById('addQuest').textContent='Add Quest';
  document.getElementById('delQuest').style.display='none';
  renderQuestList();
  renderNPCList();
  updateQuestOptions();
  document.getElementById('questId').value=nextId('quest',moduleData.quests);
}

function saveModule(){
  const bldgs=buildings.map(({under,...rest})=>rest);
  const data={...moduleData, world, buildings:bldgs};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='adventure-module.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function playtestModule(){
  const bldgs=buildings.map(({under,...rest})=>rest);
  const data={...moduleData, world, buildings:bldgs};
  localStorage.setItem('ack_playtest', JSON.stringify(data));
  window.open('ack-player.html#play','_blank');
}

document.getElementById('regen').onclick=regenWorld;
document.getElementById('addNPC').onclick=addNPC;
document.getElementById('addItem').onclick=addItem;
document.getElementById('addBldg').onclick=addBuilding;
document.getElementById('addQuest').onclick=addQuest;
document.getElementById('delNPC').onclick=deleteNPC;
document.getElementById('delItem').onclick=deleteItem;
document.getElementById('delBldg').onclick=deleteBldg;
document.getElementById('delQuest').onclick=deleteQuest;
document.getElementById('addMod').onclick=()=>modRow();
document.getElementById('save').onclick=saveModule;
document.getElementById('setStart').onclick=()=>{settingStart=true;};
document.getElementById('playtest').onclick=playtestModule;
document.getElementById('npcTree').addEventListener('input',renderDialogPreview);
['npcDialog','npcAccept','npcTurnin','npcQuest'].forEach(id=>{
  document.getElementById(id).addEventListener(id==='npcQuest'?'change':'input',()=>{
    if(document.getElementById('npcQuest').value) generateQuestTree(); else renderDialogPreview();
  });
});

// --- Map interactions ---
function canvasPos(ev){
  const rect=canvas.getBoundingClientRect();
  const sx=canvas.width/WORLD_W, sy=canvas.height/WORLD_H;
  const x=clamp(Math.floor((ev.clientX-rect.left)/sx),0,WORLD_W-1);
  const y=clamp(Math.floor((ev.clientY-rect.top)/sy),0,WORLD_H-1);
  return {x,y};
}
canvas.addEventListener('mousedown',ev=>{
  const {x,y}=canvasPos(ev);
  if(settingStart){ moduleData.start={map:'world',x,y}; settingStart=false; drawWorld(); return; }
  dragTarget = moduleData.npcs.find(n=>n.map==='world'&&n.x===x&&n.y===y);
  if(dragTarget){ dragTarget._type='npc'; return; }
  dragTarget = moduleData.items.find(it=>it.map==='world'&&it.x===x&&it.y===y);
  if(dragTarget){ dragTarget._type='item'; return; }
  dragTarget = moduleData.buildings.find(b=> x>=b.x && x<b.x+b.w && y>=b.y && y<b.y+b.h);
  if(dragTarget){
    dragTarget._type='bldg';
    document.getElementById('bldgX').value=dragTarget.x;
    document.getElementById('bldgY').value=dragTarget.y;
    editBldgIdx=moduleData.buildings.indexOf(dragTarget);
    document.getElementById('delBldg').style.display='block';
    return;
  }
  document.getElementById('npcX').value=x; document.getElementById('npcY').value=y;
  document.getElementById('itemX').value=x; document.getElementById('itemY').value=y;
  document.getElementById('bldgX').value=x; document.getElementById('bldgY').value=y;
  drawWorld();
});
canvas.addEventListener('mousemove',ev=>{
  if(!dragTarget) return;
  const {x,y}=canvasPos(ev);
  if(dragTarget._type==='bldg'){
    dragTarget=moveBuilding(dragTarget,x,y); dragTarget._type='bldg';
    renderBldgList();
    document.getElementById('bldgX').value=x; document.getElementById('bldgY').value=y;
    document.getElementById('delBldg').style.display='block';
  } else {
    dragTarget.x=x; dragTarget.y=y;
    if(dragTarget._type==='npc'){
      renderNPCList();
      document.getElementById('npcX').value=x; document.getElementById('npcY').value=y;
    } else {
      renderItemList();
      document.getElementById('itemX').value=x; document.getElementById('itemY').value=y;
    }
  }
  drawWorld();
});
['mouseup','mouseleave'].forEach(ev=>canvas.addEventListener(ev,()=>{ if(dragTarget) delete dragTarget._type; dragTarget=null; }));

regenWorld();
loadMods({});
document.getElementById('npcId').value=nextId('npc',moduleData.npcs);
document.getElementById('questId').value=nextId('quest',moduleData.quests);
renderDialogPreview();

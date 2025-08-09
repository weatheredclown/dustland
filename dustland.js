  (function(){
  // ===== Core helpers =====
  const rand = (n)=> Math.floor(Math.random()*n);
  const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));
  const logEl = document.getElementById('log');
  function log(msg){ const p=document.createElement('div'); p.textContent=msg; logEl.prepend(p); }

  // ===== Tiles =====
  const TILE = { SAND:0, ROCK:1, WATER:2, BRUSH:3, ROAD:4, RUIN:5, WALL:6, FLOOR:7, DOOR:8, BUILDING:9 };
  const walkable = {0:true,1:true,2:false,3:true,4:true,5:true,6:false,7:true,8:true,9:false};
  const colors = {0:'#1e271d',1:'#2c342c',2:'#1573ff',3:'#203320',4:'#394b39',5:'#304326',6:'#4d5f4d',7:'#233223',8:'#8bd98d',9:'#000000'};

  // ===== World sizes =====
  const VIEW_W=40, VIEW_H=30, TS=16;
  const WORLD_W=120, WORLD_H=90;

  // ===== Camera & CRT draw with ghosting =====
  const disp = document.getElementById('game');
  const dctx = disp.getContext('2d');
  const scene = document.createElement('canvas'); scene.width=disp.width; scene.height=disp.height; const sctx=scene.getContext('2d');
  const prev = document.createElement('canvas'); prev.width=disp.width; prev.height=disp.height; const pctx=prev.getContext('2d');

  // Font init (prevents invisible glyphs on some canvases)
  sctx.font = '12px ui-monospace';

  let camX=0, camY=0, showMini=true;

  function draw(){
    drawScene(sctx);
    dctx.globalAlpha=0.10; dctx.drawImage(prev, 1, 0);
    dctx.globalAlpha=1.0; dctx.drawImage(scene, 0, 0);
    pctx.clearRect(0,0,prev.width,prev.height); pctx.drawImage(scene,0,0);
    requestAnimationFrame(draw);
  }

  // ===== Game state =====
  let world=[], interiors={}, buildings=[];
  const state = { map:'hall' }; // default to hall so we always have a map
  const player = { x:2, y:2, hp:10, ap:2, flags:{}, inv:[] };

  // ===== Party / stats =====
  const party = [];
  const baseStats = ()=> ({STR:4, AGI:4, INT:4, PER:4, LCK:4, CHA:4});
  function makeMember(id, name, role){ return { id, name, role, lvl:1, xp:0, stats: baseStats(), equip: { weapon:null, armor:null, trinket:null }, hp: 10, ap: 2, map:'hall', x:player.x, y:player.y }; }
  function addPartyMember(member){ party.push(member); applyEquipmentStats(member); renderParty(); updateHUD(); log(member.name+" joins the party."); }
  function statLine(s){ return `STR ${s.STR}  AGI ${s.AGI}  INT ${s.INT}  PER ${s.PER}  LCK ${s.LCK}  CHA ${s.CHA}`; }
  function xpToNext(lvl){ return 10*lvl; }
  function awardXP(who, amt){ who.xp += amt; log(`${who.name} gains ${amt} XP.`); while(who.xp >= xpToNext(who.lvl)){ who.xp -= xpToNext(who.lvl); who.lvl++; levelUp(who); } renderParty(); }
  function levelUp(who){ const inc = {STR:0,AGI:0,INT:0,PER:0,LCK:0,CHA:0}; if(/Gunslinger|Wanderer|Raider/.test(who.role)){ inc.STR++; inc.AGI++; } else if(/Scavenger|Cogwitch|Mechanic/.test(who.role)){ inc.INT++; inc.PER++; } else { inc.CHA++; inc.LCK++; } for(const k in inc){ who.stats[k]+=inc[k]; } who.hp += 2; if(who.lvl%2===0) who.ap += 1; log(`${who.name} leveled up to ${who.lvl}! (+HP, stats)`); }

  // ===== Inventory / equipment =====
  const itemDrops=[]; // {map,x,y,name,slot,mods}
  function addToInv(item){ if(typeof item==='string') item={name:item}; player.inv.push(item); renderInv(); }
  let selectedMember = 0;
  function equipItem(memberIndex, invIndex){ const m=party[memberIndex]; const it=player.inv[invIndex]; if(!m||!it||!it.slot){ log('Cannot equip that.'); return; } const slot = it.slot; const prevEq = m.equip[slot]; if(prevEq) player.inv.push(prevEq); m.equip[slot]=it; player.inv.splice(invIndex,1); applyEquipmentStats(m); renderInv(); renderParty(); log(`${m.name} equips ${it.name}.`); }
  function applyEquipmentStats(m){ m._bonus = {ATK:0, DEF:0, LCK:0}; for(const k of ['weapon','armor','trinket']){ const it=m.equip[k]; if(it&&it.mods){ for(const stat in it.mods){ m._bonus[stat]=(m._bonus[stat]||0)+it.mods[stat]; } } } }

  // ===== Helpers =====
  function getLeader(){ return party[selectedMember] || party[0]; }
  function mapIdForState(){ return state.map==='creator' ? 'hall' : state.map; }
  function mapWH(){ if(state.map==='world') return {W:WORLD_W,H:WORLD_H}; if(state.map==='hall' || state.map==='creator'){ return {W:hall.w||VIEW_W,H:hall.h||VIEW_H}; } const I=interiors[state.map]; return {W:(I&&I.w)||VIEW_W,H:(I&&I.h)||VIEW_H}; }
  function currentGrid(){
    if(state.map==='world') return world;
    const isCreator = (state.map==='creator');
    if(state.map==='hall' || isCreator){
      if(!hall.grid || hall.grid.length===0) genHall();
      return hall.grid;
    }
    const I=interiors[state.map];
    if(I && I.grid) return I.grid;
    if(!hall.grid || hall.grid.length===0) genHall();
    return hall.grid;
  }
  function occupiedAt(x,y){
    const map=mapIdForState();
    if(NPCS.some(n=> n.map===map && n.x===x && n.y===y)) return true;
    if(itemDrops.some(it=> it.map===map && it.x===x && it.y===y)) return true;
    return false;
  }
  // Find nearest free, walkable, unoccupied (and not water on world)
  function findFreeDropTile(map,x,y){
    const dims = (map==='world'? {W:WORLD_W,H:WORLD_H} : (map==='hall'? {W:hall.w,H:hall.h} : (interiors[map]||{w:VIEW_W,h:VIEW_H})));
    const W=dims.W||dims.w, H=dims.H||dims.h;
    const grid = (map==='world'? world : (map==='hall'? hall.grid : interiors[map].grid));
    const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    const seen=new Set([x+','+y]);
    const q=[[x,y]];
    while(q.length){
      const [cx,cy]=q.shift();
      if(cx>=0&&cy>=0&&cx<W&&cy<H){
        const t=grid[cy][cx];
        if(walkable[t] && !occupiedAt(cx,cy) && !(map==='world' && t===TILE.WATER)){
          return {x:cx,y:cy};
        }
      }
      for(const [dx,dy] of dirs){
        const nx=cx+dx, ny=cy+dy, k=nx+','+ny;
        if(nx>=0&&ny>=0&&nx<W&&ny<H&&!seen.has(k)){ seen.add(k); q.push([nx,ny]); }
      }
    }
    return {x,y};
  }

  // ===== Quests / NPC =====
  const quests = {};
  function addQuest(id, title, desc){ if(!quests[id]){ quests[id]={title, desc, status:'active'}; renderQuests(); log('Quest added: '+title); } }
  function completeQuest(id){ const q=quests[id]; if(q && q.status!=='completed'){ q.status='completed'; renderQuests(); log('Quest completed: '+q.title); party.forEach(p=> awardXP(p,5)); } }
  function makeNPC(id, map, x, y, color, name, title, tree){ return {id,map,x,y,color,name,title,tree}; }
  function resolveNode(tree, nodeId){ const n = tree[nodeId]; const choices = n.choices||[]; return {...n, choices}; }
  const NPCS=[];

  // ===== WORLD GEN =====
  const HALL_W=30, HALL_H=22; const HALL_ID='hall';
  function genWorld(seed=Date.now()){
    world = Array.from({length:WORLD_H},(_,y)=> Array.from({length:WORLD_W},(_,x)=>{
      const v=(Math.sin((x+seed%977)*.37)+Math.cos((y+seed%911)*.29)+Math.sin((x+y)*.11))*0.5;
      if(v> .62) return TILE.ROCK; if(v<-0.62) return TILE.WATER; if(v> .18) return TILE.BRUSH; return TILE.SAND;
    }));
    for(let x=0;x<WORLD_W;x++){ const ry= clamp(Math.floor(WORLD_H/2 + Math.sin(x*0.22)*6), 2, WORLD_H-3); world[ry][x]=TILE.ROAD; if(world[ry-1]) world[ry-1][x]=TILE.ROAD; }
    for(let i=0;i<120;i++){ const rx=rand(WORLD_W), ry=rand(WORLD_H); if(world[ry][rx]!==TILE.WATER) world[ry][rx]=TILE.RUIN; }
    buildings.length=0; for(let i=0;i<10;i++){ let x=8+rand(WORLD_W-16), y=6+rand(WORLD_H-12); if(world[y][x]===TILE.WATER){ const p=findNearestLand(x,y); x=p.x; y=p.y; } placeHut(x,y);}    
  }
  function isWater(x,y){ return world[y] && world[y][x]===TILE.WATER; }
  function findNearestLand(sx,sy){ const q=[[sx,sy]], seen=new Set([sx+","+sy]); const dirs=[[1,0],[-1,0],[0,1],[0,-1]]; while(q.length){ const [x,y]=q.shift(); if(!isWater(x,y)) return {x,y}; for(const [dx,dy] of dirs){ const nx=x+dx, ny=y+dy; const k=nx+","+ny; if(nx>=0&&ny>=0&&nx<WORLD_W&&ny<WORLD_H&&!seen.has(k)){ seen.add(k); q.push([nx,ny]); } } } return {x:sx,y:sy}; }
  function makeInteriorRoom(){ const id = 'room_'+Math.random().toString(36).slice(2,8); const w=12, h=9; const g=Array.from({length:h},(_,y)=> Array.from({length:w},(_,x)=>{ const edge= y===0||y===h-1||x===0||x===w-1; return edge? TILE.WALL : TILE.FLOOR; })); const ex=Math.floor(w/2), ey=h-1; g[ey][ex]=TILE.DOOR; interiors[id] = {w,h,grid:g, entryX:ex, entryY:h-2}; return id; }
  function placeHut(x,y){
    const w=6,h=5;
    for(let yy=0; yy<h; yy++){ for(let xx=0; xx<w; xx++){ const gx=x+xx, gy=y+yy; world[gy][gx]=TILE.BUILDING; }}
    const doorX=x+Math.floor(w/2), doorY=y+h-1; world[doorY][doorX]=TILE.DOOR; // decorative in world
    const interiorId=makeInteriorRoom(); buildings.push({x,y,w,h,doorX,doorY,interiorId});
  }

  // ===== HALL =====
  const hall = { w:HALL_W, h:HALL_H, grid:[], entryX:15, entryY:18 };
  function genHall(){
    hall.grid = Array.from({length:HALL_H},(_,y)=> Array.from({length:HALL_W},(_,x)=>{ const edge = y===0||y===HALL_H-1||x===0||x===HALL_W-1; return edge? TILE.WALL : TILE.FLOOR; }));
    for(let x=2;x<HALL_W-2;x++){ hall.grid[6][x]=TILE.WALL; hall.grid[12][x]=TILE.WALL; }
    hall.grid[6][5]=TILE.DOOR; hall.grid[6][24]=TILE.DOOR; hall.grid[12][15]=TILE.DOOR;
    hall.grid[1][15]=TILE.DOOR;
    interiors[HALL_ID]=hall;
    NPCS.length=0;
    NPCS.push(makeNPC('dummy',HALL_ID, 8,4,'#caffc6','Training Dummy','Punchable',{ start:{text:'A burlap dummy stuffed with straw. Written on the chest: "Hit me to learn."',choices:[{label:'(Train) Throw a punch',to:'hit'}]}, hit:{text:'You practice stance and swing.',choices:[{label:'(Continue)',to:'bye'}]} }));
    NPCS.push(makeNPC('mouthdoor',HALL_ID, 15,6,'#a9f59f','Mouth Door','Backtalker',{ start:{text:'The door mutters: "Password? Or flattery."',choices:[{label:'(Persuade) Compliment the hinges',to:'check'}]}, check:{text:'Roll against CHA...',choices:[{label:'(Roll)',to:'roll'}]}, roll:{text:'The door thinks.',choices:[{label:'(Ok)',to:'bye'}]} }));
    NPCS.push(makeNPC('crate',HALL_ID, 22,10,'#9ef7a0','Locked Crate','Tempts Fingers',{ start:{text:'A dented crate hums softly.',choices:[{label:'(Pick Lock)',to:'pick'},{label:'(Kick It)',to:'kick'}]}, pick:{text:'You kneel with a bent nail...',choices:[{label:'(Roll)',to:'rollpick'}]}, kick:{text:'You wind up a boot...',choices:[{label:'(Roll)',to:'rollkick'}]}, rollpick:{text:'Click?',choices:[{label:'(Open)',to:'bye'}]}, rollkick:{text:'Thud?',choices:[{label:'(Open?)',to:'bye'}]} }));
    NPCS.push(makeNPC('echo',HALL_ID, 4,15,'#b8ffb6','Echoed Stranger','Whispers',{ start:{text:'"You will find a valve, but not where you think."',choices:[{label:'(Listen)',to:'bye'}]} }));
  }

  // ===== Camera =====
  function centerCamera(x,y,map){
    let W,H;
    if(map==='world'){ W=WORLD_W; H=WORLD_H; }
    else if(map==='hall' || map==='creator' || !interiors[map]){ W=hall.w||VIEW_W; H=hall.h||VIEW_H; }
    else { const I=interiors[map]; W=(I&&I.w)||VIEW_W; H=(I&&I.h)||VIEW_H; }
    camX = clamp(x - Math.floor(VIEW_W/2), 0, Math.max(0, (W||VIEW_W) - VIEW_W));
    camY = clamp(y - Math.floor(VIEW_H/2), 0, Math.max(0, (H||VIEW_H) - VIEW_H));
  }

  // ===== Drawing (tiles -> items -> NPCs -> player) =====
  function drawScene(ctx){
    ctx.fillStyle='#000'; ctx.fillRect(0,0,disp.width,disp.height);
    const grid=currentGrid(); const {W,H}=mapWH();
    for(let vy=0; vy<VIEW_H; vy++){
      for(let vx=0; vx<VIEW_W; vx++){
        const gx=camX+vx, gy=camY+vy; if(gx<0||gy<0||gx>=W||gy>=H) continue;
        const t=grid[gy][gx]; ctx.fillStyle=colors[t]; ctx.fillRect(vx*TS,vy*TS,TS,TS);
        if(t===TILE.DOOR){ ctx.strokeStyle='#9ef7a0'; ctx.strokeRect(vx*TS+5,vy*TS+5,TS-10,TS-10); }
      }
    }
    const activeMap = (state.map==='creator'?'hall':state.map);
    // Items first
    for(const it of itemDrops){
      if(it.map!==activeMap) continue;
      if(it.x>=camX&&it.y>=camY&&it.x<camX+VIEW_W&&it.y<camY+VIEW_H){
        const vx=(it.x-camX)*TS, vy=(it.y-camY)*TS;
        ctx.fillStyle='#c8ffbf'; ctx.fillRect(vx+4,vy+4,TS-8,TS-8);
      }
    }
    // NPCs next
    for(const n of NPCS){
      if(n.map!==activeMap) continue;
      if(n.x>=camX&&n.y>=camY&&n.x<camX+VIEW_W&&n.y<camY+VIEW_H){
        const vx=(n.x-camX)*TS, vy=(n.y-camY)*TS;
        ctx.fillStyle=n.color; ctx.fillRect(vx,vy,TS,TS);
        ctx.fillStyle='#000'; ctx.fillText('!',vx+5,vy+12);
      }
    }
    // Player last
    const px=(player.x-camX)*TS, py=(player.y-camY)*TS; ctx.fillStyle='#d9ffbe'; ctx.fillRect(px,py,TS,TS); ctx.fillStyle='#000'; ctx.fillText('@',px+4,py+12);
    ctx.strokeStyle='#2a3b2a'; ctx.strokeRect(0.5,0.5,VIEW_W*TS-1,VIEW_H*TS-1);
  }

  // ===== Interaction =====
  function canWalk(x,y){
    if(state.map==='creator') return false;
    const grid=currentGrid(); const {W,H}=mapWH();
    if(!(x>=0&&y>=0&&x<W&&y<H)) return false;
    if(!walkable[grid[y][x]]) return false;
    if(occupiedAt(x,y)) return false;
    return true;
  }
  function move(dx,dy){ if(state.map==='creator') return; const nx=player.x+dx, ny=player.y+dy; if(canWalk(nx,ny)){ player.x=nx; player.y=ny; centerCamera(player.x,player.y,state.map); updateHUD(); }}
  function adjacentNPC(){ const map=mapIdForState(); for(const n of NPCS){ if(n.map!==map) continue; if(Math.abs(n.x-player.x)+Math.abs(n.y-player.y)===1) return n; } return null; }
  function takeNearestItem(){
    const map=mapIdForState();
    const dirs=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
    for(const [dx,dy] of dirs){
      const tx=player.x+dx, ty=player.y+dy;
      const idx=itemDrops.findIndex(it=> it.map===map && it.x===tx && it.y===ty);
      if(idx>-1){ const it=itemDrops[idx]; addToInv(it); itemDrops.splice(idx,1); log('Took '+it.name+'.'); updateHUD(); return true; }
    }
    return false;
  }
  function interact(){
    if(state.map==='creator') return false;
    const n=adjacentNPC(); if(n){ openDialog(n); return true; }
    const grid=currentGrid(); const t=grid[player.y][player.x];
    if(t===TILE.DOOR){
      if(state.map==='hall' && player.y===1 && player.x===15){ startRealWorld(); return true; }
      if(state.map==='world'){ log('The doorway is boarded up from the outside.'); return true; } // not enterable from world
      if(state.map!=='world' && state.map!=='hall'){ // coming from interior
        const b=buildings.find(b=> b.interiorId===state.map);
        if(b){ state.map='world'; player.x=b.doorX; player.y=b.doorY-1; document.getElementById('mapname').textContent='Wastes'; log('You step back outside.'); centerCamera(player.x,player.y,state.map); updateHUD(); return true; }
      }
    }
    if(takeNearestItem()) return true;
    log('Nothing interesting.');
    return false;
  }

  // ===== Dialog =====
  const overlay=document.getElementById('overlay'); const choicesEl=document.getElementById('choices'); const textEl=document.getElementById('dialogText'); const nameEl=document.getElementById('npcName'); const titleEl=document.getElementById('npcTitle'); const portEl=document.getElementById('port'); let currentNPC=null, currentNode='start';
  function openDialog(npc, node='start'){ currentNPC=npc; currentNode=node; nameEl.textContent=npc.name; titleEl.textContent=npc.title; portEl.style.background=npc.color; renderDialog(); overlay.classList.add('shown'); }
  function closeDialog(){ overlay.classList.remove('shown'); currentNPC=null; choicesEl.innerHTML=''; }
  function setContinueOnly(){ choicesEl.innerHTML=''; const cont=document.createElement('div'); cont.className='choice'; cont.textContent='(Continue)'; cont.onclick=()=>{ closeDialog(); }; choicesEl.appendChild(cont); }
  function renderDialog(){
    const node=resolveNode(currentNPC.tree,currentNode);
    textEl.textContent=node.text; choicesEl.innerHTML='';
    const handleSpecial = (c)=>{
      if(currentNPC.id==='mouthdoor' && c.to==='roll'){
        const leader=(party[selectedMember]||party[0]); const dc=8; const roll=rand(12)+1 + Math.floor((leader?.stats?.CHA||0)/2);
        textEl.textContent = `You rolled ${roll} vs DC ${dc}. ${roll>=dc? 'The door purrs open.': 'The door snorts and stays shut.'}`;
        if(roll>=dc){ awardXP(leader,2); }
        setContinueOnly(); return true;
      }
      if(currentNPC.id==='crate' && (c.to==='rollpick'||c.to==='rollkick')){
        const leader=(party[selectedMember]||party[0]); let roll=0, dc=9;
        if(c.to==='rollpick'){ roll=rand(12)+1 + Math.floor(((leader?.stats?.AGI||0)+(leader?.stats?.PER||0))/3); }
        else { roll=rand(12)+1 + Math.floor((leader?.stats?.STR||0)/2); }
        textEl.textContent=`You rolled ${roll} vs DC ${dc}. ${roll>=dc? 'It pops!':'Nope.'}`;
        if(roll>=dc){
          const loot=[{name:'Scrap',slot:null},{name:'Lucky Bottlecap',slot:'trinket',mods:{LCK:+1}},{name:'Pipe Rifle',slot:'weapon',mods:{ATK:+2}}][rand(3)];
          const map=mapIdForState();
          const spot=findFreeDropTile(map, player.x, player.y);
          itemDrops.push({map, x:spot.x, y:spot.y, name:loot.name, slot:loot.slot, mods:loot.mods});
          awardXP(leader,2);
          log(`Loot popped out: ${loot.name}`);
        }
        setContinueOnly(); return true;
      }
      return false;
    };
    for(const c of (node.choices||[])){
      const div=document.createElement('div'); div.className='choice'; div.textContent=c.label;
      div.onclick=()=>{ currentNode=c.to||'bye'; if(handleSpecial(c)) return; if(currentNode==='bye'){ closeDialog(); } else { renderDialog(); } };
      choicesEl.appendChild(div);
    }
  }

  // ===== HUD & Tabs =====
  function updateHUD(){ document.getElementById('hp').textContent=player.hp; document.getElementById('ap').textContent=player.ap; }
  function showTab(which){ const inv=document.getElementById('inv'), partyEl=document.getElementById('party'), q=document.getElementById('quests'); const tInv=document.getElementById('tabInv'), tP=document.getElementById('tabParty'), tQ=document.getElementById('tabQuests'); inv.style.display=(which==='inv'?'grid':'none'); partyEl.style.display=(which==='party'?'grid':'none'); q.style.display=(which==='quests'?'grid':'none'); for(const el of [tInv,tP,tQ]) el.classList.remove('active'); if(which==='inv') tInv.classList.add('active'); if(which==='party') tP.classList.add('active'); if(which==='quests') tQ.classList.add('active'); }
  document.getElementById('tabInv').onclick=()=>showTab('inv'); document.getElementById('tabParty').onclick=()=>showTab('party'); document.getElementById('tabQuests').onclick=()=>showTab('quests');

  // ===== Save/Load & Start =====
  function save(){ const data={world, player, state, NPCS, buildings, interiors, itemDrops, quests, party}; localStorage.setItem('dustland_crt', JSON.stringify(data)); log('Game saved.'); }
  function load(){ const j=localStorage.getItem('dustland_crt'); if(!j){ log('No save.'); return; } const d=JSON.parse(j); world=d.world; Object.assign(player,d.player); Object.assign(state,d.state); NPCS.length=0; d.NPCS.forEach(n=> NPCS.push(n)); buildings.length=0; d.buildings.forEach(b=> buildings.push(b)); interiors={}; Object.keys(d.interiors).forEach(k=> interiors[k]=d.interiors[k]); itemDrops.length=0; d.itemDrops.forEach(i=> itemDrops.push(i)); Object.keys(quests).forEach(k=> delete quests[k]); Object.keys(d.quests||{}).forEach(k=> quests[k]=d.quests[k]); party.length=0; (d.party||[]).forEach(m=> party.push(m)); document.getElementById('mapname').textContent= state.map==='world'? 'Wastes' : (state.map==='hall'?'Test Hall':'Interior'); centerCamera(player.x,player.y,state.map); renderInv(); renderQuests(); renderParty(); updateHUD(); log('Game loaded.'); }

  const startEl = document.getElementById('start');
  const startContinue = document.getElementById('startContinue');
  const startNew = document.getElementById('startNew');
  function showStart(){ startEl.style.display='flex'; }
  function hideStart(){ startEl.style.display='none'; }
  startContinue.onclick=()=>{ load(); hideStart(); };
  startNew.onclick=()=>{ hideStart(); resetAll(); };

  function resetAll(){ party.length=0; player.inv=[]; player.flags={}; state.map='hall'; openCreator(); log('Reset. Back to character creation.'); }

  // ===== Character Creator =====
  const creator=document.getElementById('creator'); const ccStepEl=document.getElementById('ccStep'); const ccRight=document.getElementById('ccRight'); const ccHint=document.getElementById('ccHint'); const ccBack=document.getElementById('ccBack'); const ccNext=document.getElementById('ccNext'); const ccPortrait=document.getElementById('ccPortrait'); const ccStart=document.getElementById('ccStart'); const ccLoad=document.getElementById('ccLoad');
  const portraits=['@','&','#','%','*']; let portraitIndex=0;
  const specializations={ 'Scavenger':{desc:'Finds better loot from ruins; starts with crowbar.', gear:[{name:'Crowbar',slot:'weapon',mods:{ATK:+1}}]}, 'Gunslinger':{desc:'Higher chance to win quick fights; starts with pipe rifle.', gear:[{name:'Pipe Rifle',slot:'weapon',mods:{ATK:+2}}]}, 'Snakeoil Preacher':{desc:'Can sway naive foes; +1 CHA trinket.', gear:[{name:'Tin Sun',slot:'trinket',mods:{LCK:+1}}]}, 'Cogwitch':{desc:'Tinker checks succeed more often; starts with toolkit.', gear:[{name:'Toolkit',slot:'trinket',mods:{INT:+1}}]} };
  const quirks={ 'Lucky Lint':{desc:'+1 LCK. Occasionally avoid mishaps.'}, 'Dust Allergy':{desc:'Random sneezes in dialog (harmless, funny).'}, 'Desert Prophet':{desc:'Rare visions add hints.'} };
  const hiddenOrigins={ 'Rustborn':{desc:'You survived a machine womb. +1 PER, weird dialog tags.'} };

  let step=1; let building=null; let built=[];

  function openCreator(){
    if(!hall.grid || hall.grid.length===0) genHall();
    state.map='hall';
    creator.style.display='flex';
    step=1;
    building={ id:'pc'+(built.length+1), name:'', role:'Wanderer', stats:baseStats(), quirk:null, spec:null, origin:null };
    player.x=hall.entryX; player.y=hall.entryY; centerCamera(player.x,player.y,'hall');
    renderStep();
    document.getElementById('mapname').textContent='Creator';
  }
  function closeCreator(){ creator.style.display='none'; }
  function updateCreatorButtons(){ ccStart.disabled = (built.length===0 && !building?.name); }

  function renderStep(){
    ccStepEl.textContent=step; ccBack.disabled = (step===1);
    ccNext.textContent = (step===5? 'Finish Member' : 'Next');
    const r=ccRight; r.innerHTML='';
    if(step===1){
      ccHint.textContent='Pick a name and portrait.';
      r.innerHTML=`<div class='field'><label>Name</label><input id='nm' value='${building.name||''}' class='slot' style='padding:6px;background:#0c0f0c;color:var(--ink);border:1px solid #2b382b;border-radius:6px'></div><div class='row' style='margin-top:8px'><span class='pill' id='prevP'>&lt;</span><span class='pill'>Portrait</span><span class='pill' id='nextP'>&gt;</span></div>`;
      document.getElementById('prevP').onclick=()=>{ portraitIndex=(portraitIndex+portraits.length-1)%portraits.length; ccPortrait.textContent=portraits[portraitIndex]; };
      document.getElementById('nextP').onclick=()=>{ portraitIndex=(portraitIndex+1)%portraits.length; ccPortrait.textContent=portraits[portraitIndex]; };
      const nm=document.getElementById('nm'); nm.oninput=()=>{ building.name=nm.value; updateCreatorButtons(); };
    }
    if(step===2){
      ccHint.textContent='Distribute 6 points among stats.';
      r.innerHTML=`<div class='grid'>${Object.keys(building.stats).map(k=>`<div class='field'><label>${k}</label><div class='range'><button data-k='${k}' data-d='-1'>−</button><div id='v_${k}' class='pill'>${building.stats[k]}</div><button data-k='${k}' data-d='1'>+</button></div></div>`).join('')}</div><div class='small'>Points left: <span id='pts'></span></div>`;
      let pool=6; const base=baseStats(); for(const k in base){ pool -= (building.stats[k]-base[k]); }
      const ptsEl=document.getElementById('pts'); function upd(){ ptsEl.textContent=pool; for(const k in building.stats){ document.getElementById('v_'+k).textContent=building.stats[k]; } } upd();
      r.querySelectorAll('button').forEach(b=> b.onclick=()=>{ const k=b.dataset.k, d=parseInt(b.dataset.d,10); if(d>0 && pool<=0) return; if(d<0 && building.stats[k]<=1) return; building.stats[k]+=d; pool-=d; upd(); });
    }
    if(step===3){
      ccHint.textContent='Choose a specialization.';
      r.innerHTML='<div class="grid">'+Object.entries(specializations).map(([k,v])=>`<div class='pill ${building.spec===k?'sel':''}' data-k='${k}' title='${v.desc}'>${k}</div>`).join('')+'</div>';
      r.querySelectorAll('.pill').forEach(p=> p.onclick=()=>{ r.querySelectorAll('.pill').forEach(z=>z.classList.remove('sel')); p.classList.add('sel'); building.spec=p.dataset.k; });
    }
    if(step===4){
      ccHint.textContent='Pick a quirk.';
      r.innerHTML='<div class="grid">'+Object.entries(quirks).map(([k,v])=>`<div class='pill ${building.quirk===k?'sel':''}' data-k='${k}' title='${v.desc}'>${k}</div>`).join('')+'</div>';
      r.querySelectorAll('.pill').forEach(p=> p.onclick=()=>{ r.querySelectorAll('.pill').forEach(z=>z.classList.remove('sel')); p.classList.add('sel'); building.quirk=p.dataset.k; });
    }
    if(step===5){
      ccHint.textContent='A weird surge passes through the lights...';
      const roll=rand(100); const got= roll<12; building.origin = got? 'Rustborn': building.origin||null;
      r.innerHTML = `<div class='field'><div>Hidden Origin Check: ${got?'<b>RUSTBORN</b> unlocked! (+1 PER)':'No anomalies detected (this time).'}</div><div class='small'>Secrets unlock more often if you explore in future runs.</div></div>`;
      if(got){ building.stats.PER+=1; }
    }
    updateCreatorButtons();
  }

  function finalizeCurrentMember(){
    if(!building) return null;
    if(!building.name || !building.name.trim()) building.name = 'Drifter '+(built.length+1);
    const m=makeMember(building.id, building.name, building.spec||'Wanderer');
    m.stats=building.stats; m.origin=building.origin; m.quirk=building.quirk;
    addPartyMember(m);
    const spec = specializations[building.spec]; if(spec){ spec.gear.forEach(g=> addToInv(g)); }
    built.push(m);
    return m;
  }

  ccBack.onclick=()=>{ if(step>1) { step--; renderStep(); } };
  ccNext.onclick=()=>{ if(step<5){ step++; renderStep(); } else { finalizeCurrentMember(); building={ id:'pc'+(built.length+1), name:'', role:'Wanderer', stats:baseStats(), quirk:null, spec:null, origin:null }; step=1; renderStep(); log('Member added. You can add up to 2 more, or press Start Now.'); } };
  ccStart.onclick=()=>{ if(built.length===0){ finalizeCurrentMember(); } closeCreator(); startTestHall(); };
  ccLoad.onclick=()=>{ load(); closeCreator(); };

  function startTestHall(){ state.map='hall'; document.getElementById('mapname').textContent='Test Hall'; genHall(); player.x=hall.entryX; player.y=hall.entryY; centerCamera(player.x,player.y,state.map); updateHUD(); showTab('party'); log('Welcome to the Test Hall. Try the stations, then exit at the top door.'); }
  function startRealWorld(){ genWorld(); document.getElementById('mapname').textContent='Wastes'; player.x=2; player.y=Math.floor(WORLD_H/2); state.map='world'; centerCamera(player.x,player.y,'world'); updateHUD(); log('You step into the wastes.'); seedWorldDropsAndNPCs(); }

  // ===== Seed world content =====
  function placeItemSafe(map,x,y,item){
    if(map==='world' && world[y] && world[y][x]===TILE.WATER){ const p=findNearestLand(x,y); x=p.x; y=p.y; }
    const spot=findFreeDropTile(map,x,y);
    itemDrops.push({map,x:spot.x,y:spot.y,...item});
  }
  function seedWorldDropsAndNPCs(){
    placeItemSafe('world', 8, Math.floor(WORLD_H/2), {name:'Pipe Rifle', slot:'weapon', mods:{ATK:+2}});
    placeItemSafe('world', 10, Math.floor(WORLD_H/2), {name:'Leather Jacket', slot:'armor', mods:{DEF:+1}});
    placeItemSafe('world', 12, Math.floor(WORLD_H/2), {name:'Lucky Bottlecap', slot:'trinket', mods:{LCK:+1}});
    NPCS.push(makeNPC('duchess','world', 20, Math.floor(WORLD_H/2), '#a9f59f','Scrap Duchess','Toll-Queen',{start:{text:'Road tax or road rash.',choices:[{label:'(Nod)',to:'bye'}]}}));
  }

  // ===== Renderers =====
  function renderInv(){ const inv=document.getElementById('inv'); inv.innerHTML=''; if(player.inv.length===0){ inv.innerHTML='<div class="slot muted">(empty)</div>'; return; } player.inv.forEach((it,idx)=>{ const d=document.createElement('div'); d.className='slot clickable'; d.textContent= it.name + (it.slot?` [${it.slot}]`: ''); d.onclick=()=> equipItem(selectedMember, idx); inv.appendChild(d); }); }
  function renderQuests(){ const q=document.getElementById('quests'); q.innerHTML=''; const ids=Object.keys(quests); if(ids.length===0){ q.innerHTML='<div class="q muted">(no quests)</div>'; return; } ids.forEach(id=>{ const v=quests[id]; const div=document.createElement('div'); div.className='q'; div.innerHTML=`<div><b>${v.title}</b></div><div class="small">${v.desc}</div><div class="status">${v.status}</div>`; q.appendChild(div); }); }
  function renderParty(){ const p=document.getElementById('party'); p.innerHTML=''; if(party.length===0){ p.innerHTML='<div class="pcard muted">(no party members yet)</div>'; return; } party.forEach((m,i)=>{ const c=document.createElement('div'); c.className='pcard'; const bonus=m._bonus||{}; c.innerHTML = `<div class='row'><b>${m.name}</b> — ${m.role} (Lv ${m.lvl})</div><div class='row small'>${statLine(m.stats)}</div><div class='row'>HP ${m.hp}  AP ${m.ap}  ATK ${(bonus.ATK||0)}  DEF ${(bonus.DEF||0)}  LCK ${(bonus.LCK||0)}</div><div class='row small'>WPN: ${m.equip.weapon?m.equip.weapon.name:'—'}  ARM: ${m.equip.armor?m.equip.armor.name:'—'}  TRK: ${m.equip.trinket?m.equip.trinket.name:'—'}</div><div class='row small'>XP ${m.xp}/${xpToNext(m.lvl)}</div><div class='row'><label><input type='radio' name='selMember' ${i===selectedMember?'checked':''}> Selected</label></div>`; c.querySelector('input').onchange=()=>{ selectedMember=i; }; p.appendChild(c); }); }

  // ===== Minimal Unit Tests (#test) =====
  function assert(name, cond){ const msg = (cond? '✅ ':'❌ ') + name; log(msg); if(!cond) console.error('Test failed:', name); }
  function runTests(){
    genHall(); assert('Hall size', hall.w===HALL_W && hall.h===HALL_H);
    openCreator(); assert('Creator visible', creator.style.display==='flex');
    step=2; renderStep(); assert('Stat + buttons exist', ccRight.querySelectorAll('button[data-d="1"]').length>0);
    assert('Cannot walk into hall wall', canWalk(0,0)===false);

    genWorld(); const hutsOK = buildings.length>0 && buildings.every(b=> b.interiorId && interiors[b.interiorId] && interiors[b.interiorId].grid); assert('Huts have interiors', hutsOK);

    state.map='hall'; player.x=hall.entryX; player.y=hall.entryY;
    const beforeCount=itemDrops.length;
    const spot=findFreeDropTile('hall', player.x, player.y);
    itemDrops.push({map:'hall',x:spot.x,y:spot.y,name:'TestDrop'});
    assert('Drop not on player tile', !(spot.x===player.x && spot.y===player.y));
    assert('Item blocks movement', canWalk(spot.x,spot.y)===false);
    const took = takeNearestItem(); assert('Take with T/E works', took===true && itemDrops.length===beforeCount);
  }

  // ===== Input =====
  document.getElementById('saveBtn').onclick=()=>save();
  document.getElementById('loadBtn').onclick=()=>{ load(); };
  document.getElementById('resetBtn').onclick=()=>resetAll();
  window.addEventListener('keydown',(e)=>{ if(overlay.classList.contains('shown')){ if(e.key==='Escape') closeDialog(); return; } switch(e.key){ case 'ArrowUp': case 'w': case 'W': move(0,-1); break; case 'ArrowDown': case 's': case 'S': move(0,1); break; case 'ArrowLeft': case 'a': case 'A': move(-1,0); break; case 'ArrowRight': case 'd': case 'D': move(1,0); break; case 'e': case 'E': case ' ': interact(); break; case 't': case 'T': takeNearestItem(); break; case 'i': case 'I': showTab('inv'); break; case 'p': case 'P': showTab('party'); break; case 'q': if(!e.ctrlKey && !e.metaKey){ showTab('quests'); e.preventDefault(); } break; case 'm': case 'M': showMini=!showMini; break; }});

  // ===== Boot =====
  genHall();                              // ensure a grid exists before first frame
  state.map='hall';
  player.x=hall.entryX; player.y=hall.entryY; centerCamera(player.x,player.y,'hall');
  requestAnimationFrame(draw);
  document.getElementById('mapname').textContent='Test Hall';
  log('v0.6.7 — Stable boot; items/NPCs visible; E/T to take; selected member rolls.');

  if(location.hash.includes('test')){ runTests(); }
  else {
    if(localStorage.getItem('dustland_crt')){ document.getElementById('start').style.display='flex'; }
    else { openCreator(); }
  }

  })();


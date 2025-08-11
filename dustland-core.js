  /**
   * @typedef {Object} Item
   * @property {string} name
   * @property {string} [slot]
   * @property {Object<string, number>} [mods]
   * @property {{type:string, amount?:number}} [use]
   * @property {string} [desc]
   * @property {number} [rarity]
   * @property {number} [value]
   */

  /**
   * @typedef {Object} QuestState
   * @property {string} id
   * @property {'available'|'active'|'complete'} status
   */

  /**
   * @typedef {Object} NPC
   * @property {string} id
   * @property {string} map
   * @property {number} x
   * @property {number} y
   * @property {string} color
   * @property {string} name
   * @property {string} title
   * @property {Object<string, any>} tree
   * @property {Quest} [quest]
   */

  // ===== Core helpers =====
  const ROLL_SIDES = 12;
  const DC = { TALK:8, REPAIR:9 };

  let worldSeed = Date.now();
  function createRNG(seed){
    return function(){
      seed |= 0;
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  let rng = createRNG(worldSeed);
  function setRNGSeed(seed){ worldSeed = seed >>> 0; rng = createRNG(worldSeed); }
  const rand = (n)=> Math.floor(rng()*n);
  const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));

  class Dice {
    static roll(sides=ROLL_SIDES){ return Math.floor(Math.random()*sides)+1; }
    static skill(character, stat, add=0, sides=ROLL_SIDES){
      const base = (character?.stats?.[stat] || 0);
      return Dice.roll(sides) + Math.floor(base/2) + add;
    }
  }

  // ===== Tiles =====
  const TILE = { SAND:0, ROCK:1, WATER:2, BRUSH:3, ROAD:4, RUIN:5, WALL:6, FLOOR:7, DOOR:8, BUILDING:9 };
  const walkable = {0:true,1:true,2:false,3:true,4:true,5:true,6:false,7:true,8:true,9:false};

  // ===== World sizes =====
  const VIEW_W=40, VIEW_H=30, TS=16;
  const WORLD_W=120, WORLD_H=90;

// ===== Game state =====
let world = [], interiors = {}, buildings = [];
const state = { map:'hall' }; // default to hall so we always have a map
const player = { x:2, y:2, hp:10, ap:2, flags:{}, inv:[] };
let doorPulseUntil = 0;

// ===== Party / stats =====
const baseStats = ()=> ({STR:4, AGI:4, INT:4, PER:4, LCK:4, CHA:4});

class Character {
  constructor(id, name, role){
    this.id=id; this.name=name; this.role=role;
    this.lvl=1; this.xp=0;
    this.stats=baseStats();
    this.equip={weapon:null, armor:null, trinket:null};
    this.maxHp=10;              // polished: track max HP
    this.hp=this.maxHp;
    this.ap=2;
    this.map='hall'; this.x=player.x; this.y=player.y;
    this._bonus={ATK:0, DEF:0, LCK:0};
  }
  xpToNext(){ return 10*this.lvl; }
  awardXP(amt){
    this.xp += amt;
    log(`${this.name} gains ${amt} XP.`);
    while(this.xp >= this.xpToNext()){
      this.xp -= this.xpToNext();
      this.lvl++;
      this.levelUp();
    }
    renderParty();
  }
  levelUp(){
    const inc = {STR:0,AGI:0,INT:0,PER:0,LCK:0,CHA:0};
    if(/Gunslinger|Wanderer|Raider/.test(this.role)){ inc.STR++; inc.AGI++; }
    else if(/Scavenger|Cogwitch|Mechanic/.test(this.role)){ inc.INT++; inc.PER++; }
    else { inc.CHA++; inc.LCK++; }
    for(const k in inc){ this.stats[k]+=inc[k]; }
    this.maxHp += 2;                            // polished: grow max HP
    this.hp = Math.min(this.hp + 2, this.maxHp);
    if(this.lvl%2===0){
      this.ap += 1;
      if(typeof hudBadge==='function') hudBadge('AP +1'); // feedback hooks
      if(typeof sfxTick==='function') sfxTick();
    }
    log(`${this.name} leveled up to ${this.lvl}! (+HP, stats)`);
  }
  applyEquipmentStats(){
    this._bonus = {ATK:0, DEF:0, LCK:0};
    for(const k of ['weapon','armor','trinket']){
      const it=this.equip[k];
      if(it&&it.mods){
        for(const stat in it.mods){
          this._bonus[stat]=(this._bonus[stat]||0)+it.mods[stat];
        }
      }
    }
  }
}

class Party extends Array {
  addMember(member){
    this.push(member);
    member.applyEquipmentStats();
    renderParty(); updateHUD();
    log(member.name+" joins the party.");
  }
  leader(){ return this[selectedMember] || this[0]; }
}

const party = new Party();

function makeMember(id, name, role){ return new Character(id, name, role); }
function addPartyMember(member){ party.addMember(member); }
function statLine(s){ return `STR ${s.STR}  AGI ${s.AGI}  INT ${s.INT}  PER ${s.PER}  LCK ${s.LCK}  CHA ${s.CHA}`; }
function xpToNext(lvl){ return 10*lvl; }
function awardXP(who, amt){ who.awardXP(amt); }
function applyEquipmentStats(m){ m.applyEquipmentStats(); }

// ===== Inventory / equipment =====
const itemDrops=[]; // {map,x,y,name,slot,mods,...}

function addToInv(item){
  if(typeof item==='string') item={name:item};
  player.inv.push(item);
  renderInv();
  if (window.NanoDialog) {
    NPCS.filter(n=> n.map === (state.map==='creator'?'hall':state.map))
        .forEach(n=> NanoDialog.queueForNPC(n, 'start', 'inventory change'));
  }
}

let selectedMember = 0;

// polished: equip shows feedback and returns previous gear
function equipItem(memberIndex, invIndex){
  const m=party[memberIndex]; const it=player.inv[invIndex];
  if(!m||!it||!it.slot){ log('Cannot equip that.'); return; }
  const slot = it.slot;
  const prevEq = m.equip[slot];
  if(prevEq) player.inv.push(prevEq);
  m.equip[slot]=it;
  player.inv.splice(invIndex,1);
  applyEquipmentStats(m);
  renderInv(); renderParty();
  log(`${m.name} equips ${it.name}.`);
  if(typeof toast==='function') toast(`${m.name} equips ${it.name}`);
  if(typeof sfxTick==='function') sfxTick();
}

// Normalizer ensures future fields exist (stable shape for UI/tooltips)
function normalizeItem(it){
  if(!it) return null;
  return {
    name: it.name || 'Unknown',
    slot: it.slot || null,
    mods: it.mods || {},
    use: it.use || null,       // e.g. {type:'heal', amount:4, onUse?}
    rarity: it.rarity || 'common',
    value: it.value ?? 0,
    desc: it.desc || '',
  };
}

function useItem(invIndex){
  const it = player.inv[invIndex];
  if(!it || !it.use){
    log('Cannot use that.');
    return false;
  }
  // Built-in: heal (clamped to maxHp)
  if(it.use.type==='heal'){
    const who = (party[selectedMember]||party[0]);
    if(!who){ log('No party member to heal.'); return false; }
    const before = who.hp;
    who.hp = Math.min(who.hp + it.use.amount, who.maxHp);
    const healed = who.hp - before;
    log(`${who.name} drinks ${it.name} (+${healed} HP).`);
    if (typeof toast === 'function') toast(`${who.name} +${healed} HP`);
    if (typeof sfxTick === 'function') sfxTick();
    player.inv.splice(invIndex,1);
    renderInv(); renderParty(); updateHUD();
    if (window.NanoDialog) {
      NPCS.filter(n=> n.map === (state.map==='creator'?'hall':state.map))
          .forEach(n=> NanoDialog.queueForNPC(n, 'start', 'inventory change'));
    }
    return true;
  }
  // Custom onUse hook
  if(typeof it.use.onUse === 'function'){
    const ok = it.use.onUse({player, party, log, toast});
    if(ok!==false){
      player.inv.splice(invIndex,1);
      renderInv(); renderParty(); updateHUD();
      if (window.NanoDialog) {
        NPCS.filter(n=> n.map === (state.map==='creator'?'hall':state.map))
            .forEach(n=> NanoDialog.queueForNPC(n, 'start', 'inventory change'));
      }
    }
    return !!ok;
  }
  log('Nothing happens...');
  return false;
}

// Wrap addToInv so items get normalized
const _origAddToInv = addToInv;
addToInv = function(item){
  if(typeof item==='string') item={name:item};
  _origAddToInv(normalizeItem(item));
};

  // ===== Helpers =====
  function mapIdForState(){ return state.map==='creator' ? 'hall' : state.map; }
  function mapWH(map=state.map){
    if(map==='world') return {W:WORLD_W,H:WORLD_H};
    if(map==='hall' || map==='creator') return {W:hall.w||VIEW_W,H:hall.h||VIEW_H};
    const I=interiors[map];
    return {W:(I&&I.w)||VIEW_W,H:(I&&I.h)||VIEW_H};
  }
  function gridFor(map){
    if(map==='world') return world;
    if(map==='hall') return hall.grid;
    return interiors[map] && interiors[map].grid;
  }
  function getTile(map,x,y){
    const g=gridFor(map); if(!g) return null;
    if(y<0||x<0||y>=g.length||x>=g[0].length) return null;
    return g[y][x];
  }
  function setTile(map,x,y,t){
    const g=gridFor(map); if(!g) return false;
    if(y<0||x<0||y>=g.length||x>=g[0].length) return false;
    g[y][x]=t; return true;
  }
  function currentGrid(){
    return gridFor(mapIdForState());
  }
  function occupiedAt(x,y){
    const map=mapIdForState();
    if(NPCS.some(n=> n.map===map && n.x===x && n.y===y)) return true;
    if(itemDrops.some(it=> it.map===map && it.x===x && it.y===y)) return true;
    return false;
  }
  // Find nearest free, walkable, unoccupied (and not water on world)
  function findFreeDropTile(map,x,y){
    const {W,H}=mapWH(map);
    const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    const seen=new Set([x+','+y]);
    const q=[[x,y]];
    while(q.length){
      const [cx,cy]=q.shift();
      if(cx>=0&&cy>=0&&cx<W&&cy<H){
        const t=getTile(map,cx,cy);
        if(t!==null && walkable[t] && !occupiedAt(cx,cy) && !(map==='world' && t===TILE.WATER)){
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
  class Quest {
    constructor(id, title, desc, meta={}){
      this.id=id; this.title=title; this.desc=desc;
      // Quests start as 'available' until the player accepts them
      this.status='available';
      Object.assign(this, meta);
    }
    complete(){
      if(this.status!=='completed'){
        this.status='completed';
        renderQuests();
        log('Quest completed: '+this.title);
        if (typeof toast === 'function') toast(`QUEST COMPLETE: ${this.title}`);
        party.forEach(p=> awardXP(p,5));
        if (window.NanoDialog) {
          NPCS.filter(n=> n.map === (state.map==='creator'?'hall':state.map))
              .forEach(n=> NanoDialog.queueForNPC(n, 'start', 'quest update'));
        }
      }
    }
  }

  class QuestLog {
    constructor(){ this.quests={}; }
    add(quest){
      if(!this.quests[quest.id]){
        quest.status = 'active';
        this.quests[quest.id]=quest;
        renderQuests();
        log('Quest added: '+quest.title);
        if (window.NanoDialog) {
          NPCS.filter(n=> n.map === (state.map==='creator'?'hall':state.map))
              .forEach(n=> NanoDialog.queueForNPC(n, 'start', 'quest update'));
        }
      }
    }
    complete(id){
      const q=this.quests[id];
      if(q) q.complete();
    }
  }

  const questLog = new QuestLog();
  const quests = questLog.quests;
  const NPC_DESCS = {}; // id -> description
  function setNPCDesc(id, desc){ NPC_DESCS[id]=desc; }
  function addQuest(id, title, desc, meta){ questLog.add(new Quest(id, title, desc, meta)); }
  function completeQuest(id){ questLog.complete(id); }

  function defaultQuestProcessor(npc, nodeId){
    const meta = npc.quest;
    if(!meta) return;
    if(nodeId==='accept' && meta.status==='available'){
      questLog.add(meta);
    }
    if(nodeId==='do_turnin' && meta.status==='active'){
      if(!meta.item || hasItem(meta.item)){
        if(meta.item){ removeItemByName(meta.item); renderInv(); }
        questLog.complete(meta.id);
        if(meta.reward){ addToInv(meta.reward); }
        if(meta.xp){ awardXP(leader(), meta.xp); }
        if(meta.moveTo){ npc.x=meta.moveTo.x; npc.y=meta.moveTo.y; }
      } else {
        textEl.textContent=`You don’t have ${meta.item}.`;
      }
    }
  }

  class NPC {
    constructor({id,map,x,y,color,name,title,tree,quest=null,processNode=null,processChoice=null}){
      Object.assign(this,{id,map,x,y,color,name,title,tree,quest});
      if(quest && processNode){
        this.processNode=(node)=>{ defaultQuestProcessor(this,node); processNode.call(this,node); };
      } else if(quest){
        this.processNode=(node)=> defaultQuestProcessor(this,node);
      } else if(processNode){
        this.processNode=processNode;
      }
      if(processChoice) this.processChoice=processChoice;
    }
  }
  function makeNPC(id, map, x, y, color, name, title, tree, quest, processNode, processChoice){
    return new NPC({id,map,x,y,color,name,title,tree,quest,processNode,processChoice});
  }
  function resolveNode(tree, nodeId){ const n = tree[nodeId]; const choices = n.choices||[]; return {...n, choices}; }
  const NPCS=[];
  const usedNanoChoices = new Set();

  // ===== WORLD GEN =====
  const HALL_W=30, HALL_H=22; const HALL_ID='hall';
  function genWorld(seed=Date.now()){
    setRNGSeed(seed);
    world = Array.from({length:WORLD_H},(_,y)=> Array.from({length:WORLD_W},(_,x)=>{
      const v=(Math.sin((x+seed%977)*.37)+Math.cos((y+seed%911)*.29)+Math.sin((x+y)*.11))*0.5;
      if(v> .62) return TILE.ROCK; if(v<-0.62) return TILE.WATER; if(v> .18) return TILE.BRUSH; return TILE.SAND;
    }));
    for(let x=0;x<WORLD_W;x++){ const ry= clamp(Math.floor(WORLD_H/2 + Math.sin(x*0.22)*6), 2, WORLD_H-3); setTile('world', x, ry, TILE.ROAD); setTile('world', x, ry-1, TILE.ROAD); }
    for(let i=0;i<120;i++){ const rx=rand(WORLD_W), ry=rand(WORLD_H); if(getTile('world',rx,ry)!==TILE.WATER) setTile('world',rx,ry,TILE.RUIN); }
    buildings.length=0; for(let i=0;i<10;i++){ let x=8+rand(WORLD_W-16), y=6+rand(WORLD_H-12); if(getTile('world',x,y)===TILE.WATER){ const p=findNearestLand(x,y); x=p.x; y=p.y; } placeHut(x,y);}
    seedWorldContent();
  }
  function isWater(x,y){ return getTile('world',x,y)===TILE.WATER; }
  function findNearestLand(sx,sy){ const q=[[sx,sy]], seen=new Set([sx+","+sy]); const dirs=[[1,0],[-1,0],[0,1],[0,-1]]; while(q.length){ const [x,y]=q.shift(); if(!isWater(x,y)) return {x,y}; for(const [dx,dy] of dirs){ const nx=x+dx, ny=y+dy; const k=nx+","+ny; if(nx>=0&&ny>=0&&nx<WORLD_W&&ny<WORLD_H&&!seen.has(k)){ seen.add(k); q.push([nx,ny]); } } } return {x:sx,y:sy}; }
  function makeInteriorRoom(){ const id = 'room_'+rng().toString(36).slice(2,8); const w=12, h=9; const g=Array.from({length:h},(_,y)=> Array.from({length:w},(_,x)=>{ const edge= y===0||y===h-1||x===0||x===w-1; return edge? TILE.WALL : TILE.FLOOR; })); const ex=Math.floor(w/2), ey=h-1; g[ey][ex]=TILE.DOOR; interiors[id] = {w,h,grid:g, entryX:ex, entryY:h-2}; return id; }
  function placeHut(x,y){
    const w=6,h=5;
    for(let yy=0; yy<h; yy++){ for(let xx=0; xx<w; xx++){ setTile('world',x+xx,y+yy,TILE.BUILDING); }}
    const doorX=x+Math.floor(w/2), doorY=y+h-1; setTile('world',doorX,doorY,TILE.DOOR); // decorative in world
    const interiorId=makeInteriorRoom();
    const boarded = rng() < 0.3;
    buildings.push({x,y,w,h,doorX,doorY,interiorId,boarded});
  }

  // ===== HALL =====
  const hall = { w:HALL_W, h:HALL_H, grid:[], entryX:15, entryY:18 };
  function genHall(){
    hall.grid = Array.from({length:HALL_H},(_,y)=> Array.from({length:HALL_W},(_,x)=>{ const edge = y===0||y===HALL_H-1||x===0||x===HALL_W-1; return edge? TILE.WALL : TILE.FLOOR; }));
    for(let x=2;x<HALL_W-2;x++){ hall.grid[6][x]=TILE.WALL; hall.grid[12][x]=TILE.WALL; }
    hall.grid[6][5]=TILE.DOOR; hall.grid[6][24]=TILE.DOOR; hall.grid[12][15]=TILE.DOOR;
    hall.grid[1][15]=TILE.DOOR;
    interiors[HALL_ID]=hall;
    doorPulseUntil = Date.now() + 60000;
    NPCS.length=0;
    const doorNPC = npc_ExitDoor(hall.entryX, 2);
    NPCS.push(doorNPC);
    const crateNPC = npc_KeyCrate(hall.entryX+2, hall.entryY);
    NPCS.push(crateNPC);
    NPCS.push(npc_HallDrifter(hall.entryX-4, hall.entryY-1));
    player.x=hall.entryX; player.y=hall.entryY; centerCamera(player.x,player.y,'hall');
  }

  // ===== Interaction =====
  function canWalk(x,y){
    if(state.map==='creator') return false;
    const map=mapIdForState();
    const t=getTile(map,x,y);
    if(t===null) return false;
    if(!walkable[t]) return false;
    if(occupiedAt(x,y)) return false;
    return true;
  }
  function move(dx,dy){ if(state.map==='creator') return; const nx=player.x+dx, ny=player.y+dy; if(canWalk(nx,ny)){ player.x=nx; player.y=ny; centerCamera(player.x,player.y,state.map); updateHUD(); }}
  function adjacentNPC(){ const map=mapIdForState(); for(const n of NPCS){ if(n.map!==map) continue; if(Math.abs(n.x-player.x)+Math.abs(n.y-player.y)===1) return n; } return null; }
  function takeNearestItem(){
    const map=mapIdForState();
    // current tile first for snappier pickups
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
    const t=getTile(mapIdForState(), player.x, player.y);
    if(t===TILE.DOOR){
      if(state.map==='world'){
        const b=buildings.find(b=> b.doorX===player.x && b.doorY===player.y);
        if(!b){ log('No entrance here.'); return true; }
        if(b.boarded){
          log('The doorway is boarded up from the outside.');
          return true;
        }
        state.map=b.interiorId;
        const I=interiors[state.map];
        if(I){ player.x=I.entryX; player.y=I.entryY; }
        document.getElementById('mapname').textContent='Interior';
        log('You step inside.');
        centerCamera(player.x,player.y,state.map);
        updateHUD();
        return true;
      }
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
  function openDialog(npc, node='start'){ currentNPC=npc; currentNode=node; nameEl.textContent=npc.name; titleEl.textContent=npc.title; portEl.style.background=npc.color; const desc = NPC_DESCS[npc.id]; if (desc) {
    const small = document.createElement('div');
    small.className = 'small';
    small.textContent = desc;
    const hdr = titleEl.parentElement;
    [...hdr.querySelectorAll('.small.npcdesc')].forEach(n=>n.remove());
    small.classList.add('npcdesc');
    hdr.appendChild(small);
  }
  renderDialog(); overlay.classList.add('shown'); if (window.NanoDialog) NanoDialog.queueForNPC(currentNPC, currentNode, 'open'); }
  function closeDialog(){ overlay.classList.remove('shown'); currentNPC=null; choicesEl.innerHTML=''; }
  function setContinueOnly(){ choicesEl.innerHTML=''; const cont=document.createElement('div'); cont.className='choice'; cont.textContent='(Continue)'; cont.onclick=()=>{ closeDialog(); }; choicesEl.appendChild(cont); }
  function renderDialog(){
    const node=resolveNode(currentNPC.tree,currentNode);
    // --- Nano lines merge (if any) ---
    try {
      const extra = (window.NanoDialog && NanoDialog.linesFor(currentNPC.id, currentNode)) || [];
      if (extra.length) {
        if (Array.isArray(node.text)) node.text = node.text.concat(extra);
        else node.text = [node.text].concat(extra);
      }
    } catch(_) {}
    // Support arrays of lines (rotate to avoid repetition)
    const key = currentNPC.id + '::' + currentNode;
    window.__npcLineIx = window.__npcLineIx || {};
    if (Array.isArray(node.text)) {
      const ix = (window.__npcLineIx[key]||0) % node.text.length;
      textEl.textContent = node.text[ix];
      window.__npcLineIx[key] = ix + 1;
    } else {
      textEl.textContent = node.text;
    }
    choicesEl.innerHTML='';
    const extras = (window.NanoDialog && NanoDialog.choicesFor(currentNPC.id, currentNode)) || [];
    let nodeChoices = (node.choices||[]).slice();
    for(const ex of extras){
      const k = `${currentNPC.id}::${currentNode}::${ex.label}`;
      if(!usedNanoChoices.has(k)) nodeChoices.push({...ex, nano:true, key:k});
    }
    if(currentNPC.quest){
      const meta=currentNPC.quest;
      nodeChoices = nodeChoices.filter(c=>{
        if(c.q==='accept' && meta.status!=='available') return false;
        if(c.q==='turnin' && (meta.status!=='active' || (meta.item && !hasItem(meta.item)))) return false;
        return true;
      });
    }
    const handleSpecial = (c)=>{
      if(c.nano){
        const roll = skillRoll(c.stat);
        textEl.textContent = `You rolled ${roll} vs DC ${c.dc}.`;
        if(roll >= c.dc){
          if(/^xp\s*\d+/i.test(c.reward)){
            const amt=parseInt(c.reward.replace(/[^0-9]/g,''),10)||0;
            awardXP(leader(), amt);
            textEl.textContent += ` Reward: ${amt} XP.`;
          } else if(c.reward && c.reward.toLowerCase()!=='none'){
            addToInv({name:c.reward});
            textEl.textContent += ` You receive ${c.reward}.`;
          } else {
            textEl.textContent += ' Success.';
          }
        } else {
          textEl.textContent += ' Failed.';
        }
        usedNanoChoices.add(c.key);
        setContinueOnly();
        return true;
      }
      if(currentNPC && typeof currentNPC.processChoice==='function'){
        return currentNPC.processChoice(c)===true;
      }
      return false;
    };
    for(const c of nodeChoices){
      const div=document.createElement('div'); div.className='choice'; div.textContent=c.label;
      div.onclick=()=>{ currentNode=c.to||'bye'; if(handleSpecial(c)) return; if(currentNode==='bye'){ closeDialog(); } else { renderDialog(); } };
      choicesEl.appendChild(div);
    }
    if(currentNPC && typeof currentNPC.processNode==='function'){
      currentNPC.processNode(currentNode);
    }
  }

  // ===== Save/Load & Start =====
  function save(){
    const npcData = NPCS.map(({id,map,x,y,quest})=>({id,map,x,y,quest:quest?{id:quest.id,status:quest.status}:null}));
    const questData = {};
    Object.keys(quests).forEach(k=>{
      const q=quests[k];
      questData[k]={title:q.title,desc:q.desc,status:q.status};
    });
    const partyData = party.map(p=>({id:p.id,name:p.name,role:p.role,lvl:p.lvl,xp:p.xp,stats:p.stats,equip:p.equip,hp:p.hp,ap:p.ap,map:p.map,x:p.x,y:p.y}));
    const data={worldSeed, world, player, state, buildings, interiors, itemDrops, npcs:npcData, quests:questData, party:partyData};
    localStorage.setItem('dustland_crt', JSON.stringify(data));
    log('Game saved.');
  }
  function load(){
    const j=localStorage.getItem('dustland_crt');
    if(!j){ log('No save.'); return; }
    const d=JSON.parse(j);
    worldSeed = d.worldSeed || Date.now();
    setRNGSeed(worldSeed);
    if(d.world){ world=d.world; }
    else { genWorld(worldSeed); }
    Object.assign(player,d.player);
    Object.assign(state,d.state);
    buildings.length=0; (d.buildings||[]).forEach(b=> buildings.push(b));
    interiors={}; Object.keys(d.interiors||{}).forEach(k=> interiors[k]=d.interiors[k]);
    itemDrops.length=0; (d.itemDrops||[]).forEach(i=> itemDrops.push(i));
    Object.keys(quests).forEach(k=> delete quests[k]);
    Object.keys(d.quests||{}).forEach(id=>{
      const qd=d.quests[id];
      const q=new Quest(id,qd.title,qd.desc); q.status=qd.status; quests[id]=q;
    });
    NPCS.length=0;
    (d.npcs||[]).forEach(n=>{
      const f=NPC_FACTORY[n.id];
      if(f){
        const npc=f(n.x,n.y);
        npc.map=n.map;
        if(n.quest){
          if(quests[n.quest.id]) npc.quest=quests[n.quest.id];
          else if(npc.quest) npc.quest.status=n.quest.status;
        }
        NPCS.push(npc);
      }
    });
    party.length=0;
    (d.party||[]).forEach(m=>{
      const mem=new Character(m.id,m.name,m.role);
      Object.assign(mem,m);
      mem.applyEquipmentStats();
      party.push(mem);
    });
    document.getElementById('mapname').textContent=
      state.map==='world'? 'Wastes' : (state.map==='hall'?'Test Hall':'Interior');
    centerCamera(player.x,player.y,state.map);
    renderInv(); renderQuests(); renderParty(); updateHUD();
    log('Game loaded.');
  }

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
    genHall();
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
  ccStart.onclick=()=>{ if(built.length===0){ finalizeCurrentMember(); } closeCreator(); startHall(); };
  ccLoad.onclick=()=>{ load(); closeCreator(); };

  function startHall(){
    document.getElementById('mapname').textContent='Test Hall';
    state.map='hall';
    centerCamera(player.x,player.y,'hall');
    renderInv(); renderQuests(); renderParty(); updateHUD();
  }

  function startRealWorld(){
    const seed = Date.now();
    genWorld(seed);
    document.getElementById('mapname').textContent='Wastes';
    player.x=2; player.y=Math.floor(WORLD_H/2);
    state.map='world';
    centerCamera(player.x,player.y,'world');
    renderInv(); renderQuests(); renderParty(); updateHUD();
    log('You step into the wastes.');
  }
  // Content pack moved to dustland-content.js

Object.assign(window, {Dice, Character, Party, Quest, NPC, questLog});

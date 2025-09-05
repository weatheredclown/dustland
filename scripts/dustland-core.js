const { on } = globalThis.EventBus;

/**
 * @typedef {Object} Item
 * @property {string} name
 * @property {string} type
 * @property {Object<string, number>} [mods]
 * @property {{type:string, amount?:number, onUse?:Function}} [use]
 * @property {string} [desc]
 * @property {number} [rarity]
 * @property {number} [value]
 */

/**
 * @typedef {Object} QuestState
 * @property {string} id
 * @property {'available'|'active'|'completed'} status
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

/**
 * @typedef {Object} Quest
 * @property {string} id
 * @property {string} name
 * @property {'available'|'active'|'completed'} status
 * @property {string} [desc]
 * @property {Function} [onStart]
 * @property {Function} [onComplete]
 */

/**
 * @typedef {Object} Map
 * @property {string} id
 * @property {number} w
 * @property {number} h
 * @property {number[][]} grid
 * @property {number} [entryX]
 * @property {number} [entryY]
 * @property {string} [name]
 * @property {{name:string,HP?:number,DEF?:number,loot?:string}[]} [enemies]
 */

/**
 * @typedef {Object} Check
 * @property {string} stat
 * @property {number} dc
 * @property {Function[]} [onSuccess]
 * @property {Function[]} [onFail]
 */

// ===== Core helpers =====
const ROLL_SIDES = 12;
const DC = Object.freeze({ TALK:8, REPAIR:9 });
const CURRENCY = 'Scrap';

// Placeholder; actual content provided by modules (e.g. Dustland)
function seedWorldContent(){}

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
function nextId(prefix, arr) {
  let i = 1; while (arr.some(o => o.id === prefix + i)) i++; return prefix + i;
}
const clamp = (v,a,b)=> {
  if(a > b){ [a,b] = [b,a]; }
  return Math.max(a, Math.min(b, v));
};

function refreshUI(){
  renderInv?.();
  renderQuests?.();
  renderParty?.();
  updateHUD?.();
}

class Dice {
  static skill(character, stat, add=0, sides=ROLL_SIDES, rng=Math.random){
    const base = (character?.stats?.[stat] || 0);
    const roll = Math.floor(rng()*sides)+1;
    return roll + Math.floor(base/2) + add;
  }
}

// ===== Combat =====
/**
 * Launch the menu-based combat interface. In non-browser environments the
 * player automatically flees. Nearby combat-enabled NPCs within two tiles
 * will join the defender.
 * @param {{HP?:number,DEF:number,loot?:Item,name?:string,npc?:NPC}} defender
 * @returns {Promise<{result:'bruise'|'loot'|'flee'}>}
 */
async function startCombat(defender){
  const attacker = party.leader?.() || null;
  if(typeof openCombat !== 'function' || typeof document === 'undefined'){
    return { result:'flee' };
  }

  const toEnemy = (def) => {
    const { HP, portraitSheet, npc, name, ...rest } = def || {};
    return {
      ...rest,
      id: def.id || def.name,
      name: name || npc?.name || 'Enemy',
      hp: def.hp ?? HP ?? 5,
      npc,
      portraitSheet: portraitSheet || npc?.portraitSheet,
      special: rest.special
    };
  };

  const enemies = [];
  const copies = Math.max(1, defender.count || 1);
  for(let i=0; i<copies; i++) enemies.push(toEnemy(defender));
  const px = party.x, py = party.y, map = party.map || state.map;
  for (const n of (typeof NPCS !== 'undefined' ? NPCS : [])) {
    if (!n.combat) continue;
    if (n.map !== map) continue;
    const dist = Math.abs(n.x - px) + Math.abs(n.y - py);
    if (dist <= 2 && (!defender?.npc || n !== defender.npc)) {
      enemies.push(toEnemy({ ...n.combat, npc: n, name: n.name, portraitSheet: n.portraitSheet }));
    }
  }

  const result = await openCombat(enemies);

  if(result && result.result !== 'flee'){
    const avgLvl = party.reduce((s,m)=>s+(m.lvl||1),0)/(party.length||1);
    let xp = 0;
    for(const e of enemies){
      const str = e.challenge || e.hp || 1;
      xp += Math.max(1, Math.ceil(str/avgLvl));
    }
    party.forEach(m => awardXP(m, xp));
  }

  if(attacker){
    attacker.ap = Math.max(0,(attacker.ap||0)-1);
    player.ap = attacker.ap;
    player.hp = attacker.hp;
  }
  refreshUI();
  return result;
}

// ===== Tiles =====
const TILE = Object.freeze({ SAND:0, ROCK:1, WATER:2, BRUSH:3, ROAD:4, RUIN:5, WALL:6, FLOOR:7, DOOR:8, BUILDING:9 });
const walkable = Object.freeze({0:true,1:true,2:false,3:true,4:true,5:true,6:false,7:true,8:true,9:false});

const tileEmoji = Object.freeze({
  0:'\u{1F3DD}', // 🏝
  1:'\u{1FAA8}', // 🪨
  2:'\u{1F30A}', // 🌊
  3:'\u{1F33F}', // 🌿
  4:'\u{1F6E3}', // 🛣
  5:'\u{1F3DA}', // 🏚
  6:'\u{1F9F1}', // 🧱
  7:'\u{2B1C}', // ⬜
  8:'\u{1F6AA}', // 🚪
  9:'\u{1F3E0}'  // 🏠
});
const emojiTile = Object.freeze(Object.fromEntries(Object.entries(tileEmoji).map(([k,v])=>[v,+k])));

function gridFromEmoji(rows){
  return rows.map(r=> Array.from(r).map(ch=> emojiTile[ch] ?? 0));
}
function gridToEmoji(grid){
  return grid.map(r=> r.map(t=> tileEmoji[t] || '').join(''));
}

globalThis.tileEmoji = tileEmoji;
globalThis.emojiTile = emojiTile;
globalThis.gridFromEmoji = gridFromEmoji;
globalThis.gridToEmoji = gridToEmoji;

const mapNameEl = document.getElementById('mapname');
const mapLabels = { world: 'Wastes', creator: 'Creator' };
function mapLabel(id){
  return mapLabels[id] || 'Interior';
}
function setMap(id,label){
  state.map=id;
  party.map = id;
  state.mapEntry = null;
  if (mapNameEl) {
    mapNameEl.textContent = label || mapLabel(id);
  }
  if(typeof centerCamera==='function') centerCamera(party.x,party.y,state.map);
  if(id==='world') setGameState(GAME_STATE.WORLD);
  else if(id==='creator') setGameState(GAME_STATE.CREATOR);
  else setGameState(GAME_STATE.INTERIOR);
}
function isWalkable(tile){ return !!walkable[tile]; }

// ===== World sizes =====
const VIEW_W=40, VIEW_H=30, TS=16;
const WORLD_W=120, WORLD_H=90;

function getViewSize(){
  const iw = typeof window !== 'undefined' ? window.innerWidth : VIEW_W * TS;
  const ih = typeof window !== 'undefined' ? window.innerHeight : VIEW_H * TS;
  return {
    w: Math.min(VIEW_W, Math.floor(iw / TS)),
    h: Math.min(VIEW_H, Math.floor(ih / TS))
  };
}
globalThis.getViewSize = getViewSize;

// ===== Game state =====
let world = [], interiors = {}, buildings = [], portals = [], npcTemplates = [];
const tileEvents = [];
const zoneEffects = [];
const enemyBanks = {};
function registerTileEvents(list){ (list||[]).forEach(e => tileEvents.push(e)); }
function registerZoneEffects(list){ (list||[]).forEach(z => zoneEffects.push(z)); }
const state = { map:'world', mapFlags: {} }; // default map
const player = { hp:10, ap:2, inv:[], scrap:0 };
if (typeof registerItem === 'function') {
  registerItem({
    id: 'memory_worm',
    name: 'Memory Worm',
    type: 'token',
    desc: 'Resets a character\'s spent skill points.'
  });
}
function setPartyPos(x, y){
  if(typeof x === 'number') party.x = x;
  if(typeof y === 'number') party.y = y;
  if(!state.mapEntry || state.mapEntry.map !== state.map){
    state.mapEntry = { map: state.map, x: party.x, y: party.y };
  }
  incFlag(`visits@${state.map}@${party.x},${party.y}`);
}
const worldFlags = {};
const hiddenNPCs = [];
const GAME_STATE = Object.freeze({
  TITLE: 'title',
  CREATOR: 'creator',
  WORLD: 'world',
  INTERIOR: 'interior',
  DIALOG: 'dialog',
  MENU: 'menu'
});
let gameState = GAME_STATE.TITLE;
function setGameState(next){ gameState = next; }
let doorPulseUntil = 0;
let lastInteract = 0;

// Simple map used during character creation
const creatorMap = { w:30, h:22, grid:[], entryX:15, entryY:10 };
function genCreatorMap(){
  creatorMap.grid = Array.from({length:creatorMap.h},(_,y)=> Array.from({length:creatorMap.w},(_,x)=>{
    const edge = y===0||y===creatorMap.h-1||x===0||x===creatorMap.w-1; return edge? TILE.WALL : TILE.FLOOR;
  }));
  interiors['creator'] = creatorMap;
}


function flagValue(flag){
  if (worldFlags[flag]) return worldFlags[flag].count;
  return party.flags?.[flag] ? 1 : 0;
}

function checkFlagCondition(cond){
  if(!cond) return true;
  const v = flagValue(cond.flag);
  const val = cond.value ?? 0;
  switch(cond.op){
    case '>=': return v >= val;
    case '>': return v > val;
    case '<=': return v <= val;
    case '<': return v < val;
    case '!=': return v !== val;
    case '=':
    case '==': return v === val;
  }
  return false;
}

function revealHiddenNPCs(){
  for(let i=hiddenNPCs.length-1;i>=0;i--){
    const n=hiddenNPCs[i];
    if(checkFlagCondition(n.reveal)){
      let quest=null;
      if(n.questId && quests[n.questId]) quest=quests[n.questId];
      const opts={};
      if(n.combat) opts.combat=n.combat;
      if(n.shop) opts.shop=n.shop;
      if(n.portraitSheet) opts.portraitSheet=n.portraitSheet;
      if(n.portraitLock===false) opts.portraitLock=false;
      if(n.symbol) opts.symbol=n.symbol;
      if(n.door) opts.door=n.door;
      if(typeof n.locked==='boolean') opts.locked=n.locked;
      const npc=makeNPC(n.id, n.map||'world', n.x, n.y, n.color, n.name||n.id, n.title||'', n.desc||'', n.tree, quest, null, null, opts);
      if (Array.isArray(n.loop)) npc.loop = n.loop;
      if (typeof NPCS !== 'undefined') NPCS.push(npc);
      hiddenNPCs.splice(i,1);
    }
  }
}

function setFlag(flag, value) {
  const entry = worldFlags[flag] || (worldFlags[flag] = { count: 0, time: 0 });
  entry.count = value;
  entry.time = Date.now();
  revealHiddenNPCs();
}

function incFlag(flag, amt=1){
  const entry = worldFlags[flag] || (worldFlags[flag] = {count:0, time:0});
  entry.count += amt;
  entry.time = Date.now();
  revealHiddenNPCs();
  return entry.count;
}

// ===== Module application =====
function applyModule(data = {}, options = {}) {
  const { fullReset = true } = options;
  let moduleData = data || {};

  if (fullReset) {
    const seed = moduleData.seed || Date.now();
    setRNGSeed(seed);

    // Clear core collections
    Object.keys(interiors).forEach(k => delete interiors[k]);
    buildings.length = 0;
    portals.length = 0;
    tileEvents.length = 0;
    itemDrops.length = 0;
    if (typeof ITEMS !== 'undefined') Object.keys(ITEMS).forEach(k => delete ITEMS[k]);
    if (typeof quests !== 'undefined') Object.keys(quests).forEach(k => delete quests[k]);
    if (typeof NPCS !== 'undefined') NPCS.length = 0;
    hiddenNPCs.length = 0;
    npcTemplates.length = 0;
    Object.keys(enemyBanks).forEach(k => delete enemyBanks[k]);

    // Generate terrain based on config
    let generated = false;
    if (moduleData.worldGen) {
      let gen = moduleData.worldGen;
      if (typeof gen === 'string') gen = globalThis[gen];
      if (typeof gen === 'function') {
        const extra = gen(seed, moduleData) || {};
        moduleData = { ...moduleData, ...extra };
        generated = true;
      }
    }
    if (moduleData.world) {
      world.length = 0;
      const grid = Array.isArray(moduleData.world[0]) ? moduleData.world : gridFromEmoji(moduleData.world);
      grid.forEach(row => world.push([...row]));
      generated = true;
    }
    if (!generated) {
      const genOpts = moduleData.buildings ? { buildings: [] } : {};
      genWorld(seed, genOpts);
    }
  }

  // Interiors
  (moduleData.interiors || []).forEach(I => {
    const { id, grid, ...rest } = I;
    const g = grid && typeof grid[0] === 'string' ? gridFromEmoji(grid) : grid;
    interiors[id] = { ...rest, grid: g };
  });

  // Buildings
  if (moduleData.buildings) {
    moduleData.buildings.forEach(b => {
      if (!buildings.some(eb => eb.x === b.x && eb.y === b.y)) {
        placeHut(b.x, b.y, b);
      }
    });
  }

  // Portals, events, and encounters
  if (moduleData.portals) portals.push(...moduleData.portals);
  if (moduleData.events) registerTileEvents(moduleData.events);
  if (moduleData.zones) registerZoneEffects(moduleData.zones);
  if (moduleData.templates) npcTemplates.push(...moduleData.templates);
  if (moduleData.encounters) {
    Object.entries(moduleData.encounters).forEach(([map, list]) => {
      enemyBanks[map] = list.map(e => ({ ...e }));
    });
  }

  // Effect packs
  if (moduleData.effectPacks && globalThis.Dustland?.gameState?.loadEffectPacks) {
    globalThis.Dustland.gameState.loadEffectPacks(moduleData.effectPacks);
  }

  // Items
  if (typeof ITEMS !== 'undefined' && moduleData.items) {
    moduleData.items.forEach(it => {
      const { map, x, y, ...def } = it;
      const registered = registerItem(def);
      if (map !== undefined && x !== undefined && y !== undefined) {
        itemDrops.push({ id: registered.id, map: map || 'world', x, y });
      }
    });
  }

  // Quests
  if (typeof quests !== 'undefined' && moduleData.quests) {
    moduleData.quests.forEach(q => {
      quests[q.id] = new Quest(q.id, q.title, q.desc, { item: q.item, reward: q.reward, xp: q.xp, moveTo: q.moveTo });
    });
  }

  // NPCs
  (moduleData.npcs || []).forEach(n => {
    if (n.hidden && n.reveal) { hiddenNPCs.push(n); return; }
    let tree = n.tree;
    if (typeof tree === 'string') { try { tree = JSON.parse(tree); } catch (e) { tree = null; } }
    if (!tree) {
      tree = { start: { text: n.dialog || '', choices: [{ label: '(Leave)', to: 'bye' }] } };
    }
    let quest = null;
    if (n.questId && quests[n.questId]) quest = quests[n.questId];
    const opts = {};
    if (n.combat) opts.combat = n.combat;
    if (n.shop) opts.shop = n.shop;
    if (n.portraitSheet) opts.portraitSheet = n.portraitSheet;
    if (n.portraitLock === false) opts.portraitLock = false;
    if (n.symbol) opts.symbol = n.symbol;
    if (n.door) opts.door = n.door;
    if (typeof n.locked === 'boolean') opts.locked = n.locked;
    const npc = makeNPC(n.id, n.map || 'world', n.x, n.y, n.color, n.name || n.id, n.title || '', n.desc || '', tree, quest, null, null, opts);
    if (Array.isArray(n.loop)) npc.loop = n.loop;
    if (typeof NPCS !== 'undefined') NPCS.push(npc);
  });
  revealHiddenNPCs();
  const moduleName = moduleData.name || moduleData.id || 'module';
  if (typeof log === 'function') log(`${moduleName} loaded successfully.`);
  else console.log(`${moduleName} loaded successfully.`);
  if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
    const CE = document.defaultView?.CustomEvent || globalThis.CustomEvent;
    const Ev = document.defaultView?.Event || globalThis.Event;
    const evt = typeof CE === 'function' ? new CE('moduleLoaded', { detail: { name: moduleName } }) : new Ev('moduleLoaded');
    document.dispatchEvent(evt);
  }
  return moduleData;
}

// ===== WORLD GEN =====
function genWorld(seed=Date.now(), data={}){
  setRNGSeed(seed);
  // Preserve the world array reference for consumers by clearing then repopulating
  world.length = 0;
  for(let y=0; y<WORLD_H; y++){
    const row = [];
    for(let x=0; x<WORLD_W; x++){
      const v=(Math.sin((x+seed%977)*.37)+Math.cos((y+seed%911)*.29)+Math.sin((x+y)*.11))*0.5;
      if(v> .62) row.push(TILE.ROCK);
      else if(v<-0.62) row.push(TILE.WATER);
      else if(v> .18) row.push(TILE.BRUSH);
      else row.push(TILE.SAND);
    }
    world.push(row);
  }
  for(let x=0;x<WORLD_W;x++){
    const ry= clamp(Math.floor(WORLD_H/2 + Math.sin(x*0.22)*6), 2, WORLD_H-3);
    setTile('world', x, ry, TILE.ROAD);
    setTile('world', x, ry-1, TILE.ROAD);
  }
  for(let i=0;i<120;i++){
    const rx=rand(WORLD_W), ry=rand(WORLD_H);
    if(getTile('world',rx,ry)!==TILE.WATER) setTile('world',rx,ry,TILE.RUIN);
  }
  Object.keys(interiors).forEach(k => delete interiors[k]);
  if(creatorMap.grid && creatorMap.grid.length) interiors['creator']=creatorMap;
  (data.interiors||[]).forEach(I=>{ const {id,...rest}=I; interiors[id]={...rest}; });
  buildings.length = 0;
  if (data.buildings) {
    data.buildings.forEach(b => placeHut(b.x, b.y, b));
  } else {
    for (let i = 0; i < 10; i++) {
      let x = 8 + rand(WORLD_W - 16), y = 6 + rand(WORLD_H - 12);
      if (getTile('world', x, y) === TILE.WATER) { const p = findNearestLand(x, y); x = p.x; y = p.y; }
      placeHut(x, y);
    }
  }
  portals.length=0;
  if(data.portals && data.portals.length){
    data.portals.forEach(p=> portals.push(p));
  }
  seedWorldContent();
}
function isWater(x,y){ return getTile('world',x,y)===TILE.WATER; }
function findNearestLand(sx,sy){
  const q=[[sx,sy]], seen=new Set([sx+","+sy]); const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  while(q.length){
    const [x,y]=q.shift();
    if(!isWater(x,y)) return {x,y};
    for(const [dx,dy] of dirs){
      const nx=x+dx, ny=y+dy; const k=nx+","+ny;
      if(nx>=0&&ny>=0&&nx<WORLD_W&&ny<WORLD_H&&!seen.has(k)){ seen.add(k); q.push([nx,ny]); }
    }
  }
  return {x:sx,y:sy};
}
function makeInteriorRoom(id,w=12,h=9){
  id = id || ('room_'+rng().toString(36).slice(2,8));
  const g=Array.from({length:h},(_,y)=> Array.from({length:w},(_,x)=>{
    const edge= y===0||y===h-1||x===0||x===w-1; return edge? TILE.WALL : TILE.FLOOR;
  }));
  const ex=Math.floor(w/2), ey=h-1; g[ey][ex]=TILE.DOOR;
  interiors[id] = {w,h,grid:g, entryX:ex, entryY:h-2};
  return id;
}
function placeHut(x,y,b={}){
  let grid=b.grid;
  let w,h,doorX,doorY;
  if(grid){
    h=grid.length; w=grid[0].length;
    for(let yy=0; yy<h; yy++){ for(let xx=0; xx<w; xx++){
      const tile=grid[yy][xx];
      if(tile===TILE.DOOR){ doorX=x+xx; doorY=y+yy; }
    }}
    if(doorX==null){ doorX=x+Math.floor(w/2); doorY=y+h-1; }
  }else{
    w=b.w||6; h=b.h||5;
    grid=Array.from({length:h},(_,yy)=>Array.from({length:w},(_,xx)=>TILE.BUILDING));
    const relX = b.doorX!=null ? b.doorX - x : Math.floor(w/2);
    const relY = b.doorY!=null ? b.doorY - y : h-1;
    if(relY>=0&&relY<h&&relX>=0&&relX<w) grid[relY][relX]=TILE.DOOR;
    doorX=x+relX; doorY=y+relY;
  }
  const under=Array.from({length:h},(_,yy)=>Array.from({length:w},(_,xx)=>getTile('world',x+xx,y+yy)));
  for(let yy=0; yy<h; yy++){
    for(let xx=0; xx<w; xx++){
      const t=grid[yy][xx];
      if(t===TILE.DOOR){ setTile('world',x+xx,y+yy,TILE.DOOR); }
      else if(t===TILE.BUILDING){ setTile('world',x+xx,y+yy,TILE.BUILDING); }
    }
  }
  let interiorId, boarded;
  interiorId = b.interiorId || makeInteriorRoom();
  if(b.interiorId && !interiors[b.interiorId]) makeInteriorRoom(b.interiorId);
  boarded = b.boarded!==undefined ? b.boarded : rng()<0.3;
  const nb={x,y,w,h,doorX,doorY,interiorId,boarded,under,grid};
  buildings.push(nb);
  return nb;
}

// ===== Save/Load & Start =====
function save(){
  const npcData = (typeof NPCS !== 'undefined' ? NPCS : []).map(n=>({
    id:n.id,
    map:n.map,
    x:n.x,
    y:n.y,
    color:n.color,
    name:n.name,
    title:n.title,
    desc:n.desc,
    tree:n.tree,
    combat:n.combat,
    shop:n.shop,
    quest:n.quest?{id:n.quest.id,status:n.quest.status}:null,
    loop:n.loop,
    portraitSheet:n.portraitSheet,
    portraitLock:n.portraitLock,
    symbol:n.symbol
  }));
  const questData = {};
  Object.keys(quests).forEach(k=>{
    const q=quests[k];
    questData[k]={title:q.title,desc:q.desc,status:q.status};
  });
  const partyData = Array.from(party, p => ({
    id:p.id,name:p.name,role:p.role,lvl:p.lvl,xp:p.xp,skillPoints:p.skillPoints,stats:p.stats,equip:p.equip,hp:p.hp,ap:p.ap,map:p.map,x:p.x,y:p.y,maxHp:p.maxHp,portraitSheet:p.portraitSheet
  }));
  const data={worldSeed, world, player, state, buildings, interiors, itemDrops, npcs:npcData, quests:questData, party:partyData};
  localStorage.setItem('dustland_crt', JSON.stringify(data));
  log('Game saved.');
  if (typeof toast === 'function') toast('Game saved.');
}
function load(){
  const j=localStorage.getItem('dustland_crt');
  if(!j){ log('No save.'); return; }
  const d=JSON.parse(j);
  worldSeed = d.worldSeed || Date.now();
  setRNGSeed(worldSeed);
  if(d.world){ world=d.world; } else { genWorld(worldSeed); }
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

  const npcFactory = createNpcFactory(d.npcs || []);
  if (typeof NPCS !== 'undefined') NPCS.length = 0;
  (d.npcs||[]).forEach(n=>{
    const f=npcFactory[n.id];
    if(f){
      const npc=f(n.x,n.y);
      npc.map=n.map;
      if (Array.isArray(n.loop)) npc.loop = n.loop;
      if(n.quest){
        if(quests[n.quest.id]) npc.quest=quests[n.quest.id];
        else if(npc.quest) npc.quest.status=n.quest.status;
      }
      if (typeof NPCS !== 'undefined') NPCS.push(npc);
    }
  });
  party.length=0;
  (d.party||[]).forEach(m=>{
    const mem=new Character(m.id,m.name,m.role);
    Object.assign(mem,m);
    mem.skillPoints = m.skillPoints || 0;
    mem.applyEquipmentStats();
    party.push(mem);
  });
  setMap(state.map);
  refreshUI();
  log('Game loaded.');
  if (typeof toast === 'function') toast('Game loaded.');
}

const startEl = document.getElementById('start');
const startContinue = document.getElementById('startContinue');
const startNew = document.getElementById('startNew');
function showStart(){ if (startEl) {startEl.style.display='flex'; setGameState(GAME_STATE.MENU); } }
function hideStart(){
  startEl.style.display='none';
  const back = state.map==='world'
    ? GAME_STATE.WORLD
    : (state.map==='creator' ? GAME_STATE.CREATOR : GAME_STATE.INTERIOR);
  setGameState(back);
}
if (startContinue) startContinue.onclick = () => { load(); hideStart(); };
if (startNew) startNew.onclick = () => { hideStart(); resetAll(); };

function resetAll(){
  party.length=0; player.inv=[]; party.flags={}; player.scrap=0;
  Object.keys(worldFlags).forEach(k => delete worldFlags[k]);
  state.map='creator'; openCreator();
  log('Reset. Back to character creation.');
  if (typeof toast === 'function') toast('Game reset.');
}
Object.assign(globalThis, { showStart, hideStart, openCreator, closeCreator, resetAll });

// ===== Character Creator =====
const creator=document.getElementById('creator');
const ccStepEl=document.getElementById('ccStep');
const ccRight=document.getElementById('ccRight');
const ccHint=document.getElementById('ccHint');
const ccBack=document.getElementById('ccBack');
const ccNext=document.getElementById('ccNext');
const ccPortrait=document.getElementById('ccPortrait');
const ccStart=document.getElementById('ccStart');
const ccLoad=document.getElementById('ccLoad');
if(ccNext) ccNext.classList.add('btn--primary');
// Pre-generated character portraits available for player selection
const portraits = Array.from({ length: 90 }, (_, i) => `assets/portraits/portrait_${1000 + i}.png`);
let portraitIndex = 0;
function setCreatorPortrait(){
  const img = portraits[portraitIndex];
  if(ccPortrait){
    ccPortrait.style.backgroundImage = `url(${img})`;
    ccPortrait.style.backgroundSize = '100% 100%';
    ccPortrait.style.backgroundPosition = 'center';
    ccPortrait.textContent = '';
  }
  if(building) building.portraitSheet = img;
}
const specializations={
  'Scavenger':{
    desc:'Finds better loot from ruins; +1 PER and starts with crowbar.',
    stats:{PER:+1},
    gear:[{id:'crowbar',name:'Crowbar',type:'weapon',mods:{ATK:+1}}]
  },
  'Gunslinger':{
    desc:'Draws fast with +1 AGI and starts with pipe rifle.',
    stats:{AGI:+1},
    gear:[{id:'pipe_rifle',name:'Pipe Rifle',type:'weapon',mods:{ATK:+2}}]
  },
  'Snakeoil Preacher':{
    desc:'Silver tongue grants +1 CHA and a lucky Tin Sun trinket.',
    stats:{CHA:+1},
    gear:[{id:'tin_sun',name:'Tin Sun',type:'trinket',mods:{LCK:+1}}]
  },
  'Cogwitch':{
    desc:'Tinker checks succeed more often; +1 INT and a trusty toolkit.',
    stats:{INT:+1},
    gear:[{id:'toolkit',name:'Toolkit',type:'trinket',mods:{INT:+1}}]
  }
};
const classSpecials={
  Scavenger:['POWER_STRIKE'],
  Gunslinger:['STUN_GRENADE'],
  'Snakeoil Preacher':['FIRST_AID'],
  Cogwitch:['ADRENAL_SURGE'],
  Wanderer:['GUARD_UP']
};
const quirks={
  'Lucky Lint':{
    desc:'+1 LCK and start with a Lucky Coin.',
    stats:{LCK:+1},
    gear:[{id:'lucky_coin',name:'Lucky Coin',type:'trinket',mods:{LCK:+1}}]
  },
  'Brutal Past':{
    desc:'+1 STR and spiked knuckles for rough fights.',
    stats:{STR:+1},
    gear:[{id:'spiked_knuckles',name:'Spiked Knuckles',type:'weapon',mods:{ATK:+1}}]
  },
  'Desert Prophet':{
    desc:'+1 PER and a prophecy scroll that sharpens INT.',
    stats:{PER:+1},
    gear:[{id:'prophecy_scroll',name:'Prophecy Scroll',type:'trinket',mods:{INT:+1}}]
  }
};
const hiddenOrigins={ 'Rustborn':{desc:'You survived a machine womb. +1 PER, weird dialog tags.'} };
const statInfo={
  STR:{name:'Strength',benefit:'helps with DC checks'},
  AGI:{name:'Agility',benefit:'speeds up movement'},
  INT:{name:'Intelligence',benefit:'helps with DC checks'},
  PER:{name:'Perception',benefit:'helps with DC checks'},
  LCK:{name:'Luck',benefit:'boosts damage and healing'},
  CHA:{name:'Charisma',benefit:'helps with DC checks'}
};

// Pool of placeholder names to auto-fill the creator
function defaultDrifterName(n){ return 'Drifter '+n; }
const randomNames=['Ash','Rex','Nova','Jax','Mara', 'Zed','Iris','Knox','Luna','Kai','Gil'];
function randomName(){
  const used=new Set(built.map(m=>m.name));
  const avail=randomNames.filter(n=>!used.has(n));
  return avail.length? avail[Math.floor(Math.random()*avail.length)] : defaultDrifterName(built.length+1);
}
function newBuilding(){
  portraitIndex = Math.floor(Math.random()*portraits.length);
  return { id:'pc'+(built.length+1), name:randomName(), role:'Wanderer', stats:baseStats(), quirk:null, spec:null, origin:null, portraitSheet: portraits[portraitIndex] };
}

let step=1; let building=null; let built=[];
function openCreator(){
  if(!creator) return; // Gracefully skip when creator UI is absent
  if(!creatorMap.grid || creatorMap.grid.length===0) genCreatorMap();
  setPartyPos(creatorMap.entryX, creatorMap.entryY);
  setMap('creator','Creator');
  creator.style.display='flex';
  step=1;
  building=newBuilding();
  renderStep();
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
    document.getElementById('prevP').onclick=()=>{ portraitIndex=(portraitIndex+portraits.length-1)%portraits.length; setCreatorPortrait(); };
    document.getElementById('nextP').onclick=()=>{ portraitIndex=(portraitIndex+1)%portraits.length; setCreatorPortrait(); };
    const nm=document.getElementById('nm'); nm.oninput=()=>{ building.name=nm.value; updateCreatorButtons(); };
    setCreatorPortrait();
  }
  if(step===2){
    ccHint.textContent='Distribute 6 points among stats.';
    r.innerHTML=`<div class='grid'>${Object.keys(building.stats).map(k=>{const info=statInfo[k]||{name:k,benefit:'helps with DC checks'};return `<div class='field'><label title='${info.name}: ${info.benefit}'>${k}</label><div class='range'><button data-k='${k}' data-d='-1'>−</button><div id='v_${k}' class='pill'>${building.stats[k]}</div><button data-k='${k}' data-d='1'>+</button></div></div>`;}).join('')}</div><div class='small'>Points left: <span id='pts'></span></div>`;
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
  ccNext?.focus?.();
}

function finalizeCurrentMember(){
  if(!building) return null;
  if(!building.name || !building.name.trim()) building.name = defaultDrifterName(built.length+1);
  const m=makeMember(building.id, building.name, building.spec||'Wanderer', {permanent:true, portraitSheet: building.portraitSheet});
  m.stats=building.stats; m.origin=building.origin; m.quirk=building.quirk;
  m.special = classSpecials[building.spec||'Wanderer'] || [];
  const spec = specializations[building.spec];
  const specEquipIds=[];
  if(spec){
    if(spec.stats){ for(const k in spec.stats){ m.stats[k]=(m.stats[k]||0)+spec.stats[k]; } }
  if(spec.gear){ spec.gear.forEach(g=>{ addToInv(g); if(['weapon','armor','trinket'].includes(g.type)) specEquipIds.push(g.id); }); }
  }
  const quirk=quirks[building.quirk];
  if(quirk){
    if(quirk.stats){ for(const k in quirk.stats){ m.stats[k]=(m.stats[k]||0)+quirk.stats[k]; } }
    if(quirk.gear){ quirk.gear.forEach(g=> addToInv(g)); }
  }
  joinParty(m);
  const idx=party.indexOf(m);
  specEquipIds.forEach(id=>{
    const invIdx=player.inv.findIndex(it=>it.id===id);
    if(invIdx!==-1) equipItem(idx, invIdx);
  });
  built.push(m);
  building = null;
  return m;
}

function watchModuleLoad(){
  let loaded = false;
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('moduleLoaded', () => { loaded = true; }, { once: true });
    setTimeout(() => {
      if (!loaded) toast?.('Something went wrong loading the module. Check console.');
    }, 500);
  }
}

function beginGame(){
  watchModuleLoad();
  startGame();
  refreshUI();
}

if  (ccBack) ccBack.onclick=()=>{ if(step>1) { step--; renderStep(); } };
if (ccNext) ccNext.onclick=()=>{
  if(step<5){
    step++;
    renderStep();
  } else {
    finalizeCurrentMember();
    if(built.length>=3){
      closeCreator();
      beginGame();
    } else {
      building=newBuilding();
      step=1;
      renderStep();
      log('Member added. You can add up to '+(3-built.length)+' more, or press Start Now.');
    }
  }
};
if (ccStart) ccStart.onclick=()=>{ if(built.length===0){ finalizeCurrentMember(); } closeCreator(); beginGame(); };
if (ccLoad) ccLoad.onclick=()=>{ load(); closeCreator(); };
if (creator?.addEventListener) creator.addEventListener('keydown', e => {
  if(e.key==='Enter'){
    e.preventDefault();
    if(ccNext?.click) ccNext.click(); else ccNext?.onclick?.();
  }
});

function startGame(){
  // No default module; callers should apply their own module data.
}

on('inventory:changed', () => {
  refreshUI();
  queueNanoDialogForNPCs?.('start', 'inventory change');
});

on('item:picked', (it) => {
  log?.(`Picked up ${it.name}`);
});

on('mentor:bark', (evt) => {
  if(evt?.text) toast?.(evt.text);
  if(evt?.sound) EventBus.emit('sfx', evt.sound);
});

// Content pack moved to modules/dustland.module.js


const coreExports = {
  ROLL_SIDES,
  DC,
  clamp,
  nextId,
  createRNG,
  Dice,
  refreshUI,
  startCombat,
  TILE,
  walkable,
  mapLabels,
  mapLabel,
  setMap,
  isWalkable,
  VIEW_W,
  VIEW_H,
  TS,
  WORLD_W,
  WORLD_H,
  world,
  interiors,
  buildings,
  portals,
  tileEvents,
  enemyBanks,
  registerTileEvents,
  registerZoneEffects,
  state,
  player,
  GAME_STATE,
  setGameState,
  setPartyPos,
  doorPulseUntil,
  lastInteract,
  creatorMap,
  genCreatorMap,
  applyModule,
  genWorld,
  isWater,
  findNearestLand,
  makeInteriorRoom,
  placeHut,
  startGame,
  setRNGSeed,
  worldFlags,
  setFlag,
  incFlag,
  flagValue,
  checkFlagCondition,
  showStart,
  hideStart,
  openCreator,
  closeCreator,
  resetAll
};

Object.assign(coreExports, { getGameState: () => gameState });
globalThis.Dustland = globalThis.Dustland || {};
globalThis.Dustland.zoneEffects = zoneEffects;
Object.assign(globalThis.Dustland, coreExports);
Object.assign(globalThis, coreExports);

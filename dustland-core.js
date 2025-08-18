/**
 * @typedef {Object} Item
 * @property {string} name
 * @property {string} [slot]
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
 * @typedef {Object} Check
 * @property {string} stat
 * @property {number} dc
 * @property {Function[]} [onSuccess]
 * @property {Function[]} [onFail]
 */

// ===== Core helpers =====
const ROLL_SIDES = 12;
const DC = { TALK:8, REPAIR:9 };
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
const clamp = (v,a,b)=> Math.max(a, Math.min(b, v));

class Dice {
  static roll(sides=ROLL_SIDES){ return Math.floor(Math.random()*sides)+1; }
  static skill(character, stat, add=0, sides=ROLL_SIDES, rng=Math.random){
    const base = (character?.stats?.[stat] || 0);
    const roll = Math.floor(rng()*sides)+1;
    return roll + Math.floor(base/2) + add;
  }
}

// ===== Combat =====
/**
 * Quick combat resolver. Uses party leader's ATK + LCK vs defender's DEF.
 * @param {{DEF:number, loot?:Item}} defender
 * @returns {{result:'bruise'|'loot'|'flee', roll:number, dc:number}}
 */
function quickCombat(defender){
  const attacker = party.leader?.() || null;
  const dc = defender?.DEF || 0;
  if(!attacker) return { result:'flee', roll:0, dc };

  const atk = attacker._bonus?.ATK || 0;
  const lck = (attacker.stats?.LCK || 0) + (attacker._bonus?.LCK || 0);
  const roll = Dice.roll() + atk + lck;

  let result = 'flee';
  if (roll > dc) result = 'loot';
  else if (roll < dc) result = 'bruise';

  // Spend AP and apply outcome
  attacker.ap = Math.max(0, (attacker.ap||0) - 1);

  if(result==='bruise'){
    attacker.hp = Math.max(0, (attacker.hp||0) - 1);
    if(typeof toast==='function') toast('Bruised! -1 HP');
  } else if(result==='loot'){
    if(defender.loot) addToInv(defender.loot);
    if(typeof toast==='function') toast(`Looted ${defender.loot ? defender.loot.name : ''}`);
  } else {
    if(typeof toast==='function') toast('You flee.');
  }

  // Mirror player summary to HUD if you use player.hp/ap there
  player.hp = attacker.hp; player.ap = attacker.ap;
  renderInv?.(); renderParty?.(); updateHUD?.();
  return { result, roll, dc };
}

// ===== Tiles =====
const TILE = { SAND:0, ROCK:1, WATER:2, BRUSH:3, ROAD:4, RUIN:5, WALL:6, FLOOR:7, DOOR:8, BUILDING:9 };
const walkable = {0:true,1:true,2:false,3:true,4:true,5:true,6:false,7:true,8:true,9:false};
const mapNameEl = document.getElementById('mapname');
const mapLabels = { world: 'Wastes', creator: 'Creator' };
function mapLabel(id){
  return mapLabels[id] || 'Interior';
}
function setMap(id,label){
  state.map=id;
  mapNameEl.textContent = label || mapLabel(id);
  if(typeof centerCamera==='function') centerCamera(player.x,player.y,state.map);
  if(id==='world') setGameState(GAME_STATE.WORLD);
  else if(id==='creator') setGameState(GAME_STATE.CREATOR);
  else setGameState(GAME_STATE.INTERIOR);
}
function isWalkable(tile){ return !!walkable[tile]; }

// ===== World sizes =====
const VIEW_W=40, VIEW_H=30, TS=16;
const WORLD_W=120, WORLD_H=90;

// ===== Game state =====
let world = [], interiors = {}, buildings = [], portals = [];
const state = { map:'world' }; // default map
const player = { x:2, y:2, hp:10, ap:2, flags:{}, inv:[], scrap:0 };
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

// ===== Party / stats =====
const baseStats = ()=> ({STR:4, AGI:4, INT:4, PER:4, LCK:4, CHA:4});

class Character {
  constructor(id, name, role){
    this.id=id; this.name=name; this.role=role;
    this.lvl=1; this.xp=0;
    this.stats=baseStats();
    this.equip={weapon:null, armor:null, trinket:null};
    this.maxHp=10;
    this.hp=this.maxHp;
    this.ap=2;
    this.map=state.map; this.x=player.x; this.y=player.y;
    this._bonus={ATK:0, DEF:0, LCK:0};
  }
  xpToNext(){ return 10*this.lvl; }
  awardXP(amt){
    this.xp += amt;
    log(`${this.name} gains ${amt} XP.`);
    if(typeof toast==='function') toast(`${this.name} +${amt} XP`);
    if(typeof sfxTick==='function') sfxTick();
    while(this.xp >= this.xpToNext()){
      this.xp -= this.xpToNext();
      this.lvl++;
      this.levelUp();
    }
    renderParty(); updateHUD();
  }
  levelUp(){
    const inc = {STR:0,AGI:0,INT:0,PER:0,LCK:0,CHA:0};
    if(/Gunslinger|Wanderer|Raider/.test(this.role)){ inc.STR++; inc.AGI++; }
    else if(/Scavenger|Cogwitch|Mechanic/.test(this.role)){ inc.INT++; inc.PER++; }
    else { inc.CHA++; inc.LCK++; }
    for(const k in inc){ this.stats[k]+=inc[k]; }
    this.maxHp += 2;
    this.hp = Math.min(this.hp + 2, this.maxHp);
    if(this.lvl%2===0){
      this.ap += 1;
      if(typeof hudBadge==='function') hudBadge('AP +1');
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
function leader(){ return party.leader(); } // handy globally

// ===== Inventory / equipment =====
const ITEMS = {}; // item definitions by id
const itemDrops = []; // {map,x,y,id}
function cloneItem(it){
  return {
    ...it,
    mods: { ...it.mods },
    tags: [...it.tags],
    use: it.use ? JSON.parse(JSON.stringify(it.use)) : null,
    equip: it.equip ? JSON.parse(JSON.stringify(it.equip)) : null
  };
}
function registerItem(item){
  const norm = normalizeItem(item);
  if(!norm.id) throw new Error('Item must have id');
  ITEMS[norm.id] = norm;
  return norm;
}
function getItem(id){
  const it = ITEMS[id];
  return it ? cloneItem(it) : null;
}
function addToInv(item){
  let base = null;
  if(typeof item === 'string'){
    base = getItem(item);
  } else if(item && item.id){
    base = ITEMS[item.id] || registerItem(item);
    base = cloneItem(base);
  }
  if(!base) throw new Error('Unknown item');
  player.inv.push(base);
  renderInv();
  if (window.NanoDialog) {
    NPCS.filter(n=> n.map === state.map)
        .forEach(n=> NanoDialog.queueForNPC(n, 'start', 'inventory change'));
  }
}
function removeFromInv(invIndex){
  player.inv.splice(invIndex,1);
  renderInv();
  if (window.NanoDialog) {
    NPCS.filter(n=> n.map === state.map)
        .forEach(n=> NanoDialog.queueForNPC(n, 'start', 'inventory change'));
  }
}
let selectedMember = 0;

function equipItem(memberIndex, invIndex){
  const m=party[memberIndex]; const it=player.inv[invIndex];
  if(!m||!it||!it.slot){ log('Cannot equip that.'); return; }
  const slot = it.slot;
  const prevEq = m.equip[slot];
  if(prevEq){
    if(prevEq.cursed){
      prevEq.cursedKnown = true;
      renderInv(); renderParty(); updateHUD();
      log(`${prevEq.name} is cursed and cannot be removed.`);
      return;
    }
    player.inv.push(prevEq);
  }
  m.equip[slot]=it;
  player.inv.splice(invIndex,1);
  applyEquipmentStats(m);
  renderInv(); renderParty(); updateHUD();
  log(`${m.name} equips ${it.name}.`);
  if(typeof toast==='function') toast(`${m.name} equips ${it.name}`);
  if(typeof sfxTick==='function') sfxTick();
  if(it.equip && it.equip.teleport){
    const t=it.equip.teleport;
    if(typeof t.x==='number') player.x=t.x;
    if(typeof t.y==='number') player.y=t.y;
    if(t.map) setMap(t.map);
    updateHUD();
  }
  if(it.equip && it.equip.msg){
    log(it.equip.msg);
  }
}

function unequipItem(memberIndex, slot){
  const m=party[memberIndex];
  if(!m) return;
  const it=m.equip[slot];
  if(!it){ log('Nothing to unequip.'); return; }
  if(it.cursed){
    it.cursedKnown = true;
    renderInv(); renderParty(); updateHUD();
    log(`${it.name} is cursed and won't come off!`);
    return;
  }
  m.equip[slot]=null;
  player.inv.push(it);
  applyEquipmentStats(m);
  renderInv(); renderParty(); updateHUD();
  log(`${m.name} unequips ${it.name}.`);
  if(typeof toast==='function') toast(`${m.name} unequips ${it.name}`);
  if(typeof sfxTick==='function') sfxTick();
}

function normalizeItem(it){
  if(!it) return null;
  return {
    id: it.id || '',
    name: it.name || 'Unknown',
    type: it.type || 'misc',
    tags: Array.isArray(it.tags) ? it.tags.map(t=>t.toLowerCase()) : [],
    slot: it.slot || null,
    mods: it.mods ? { ...it.mods } : {},
    use: it.use || null,
    equip: it.equip || null,
    cursed: !!it.cursed,
    cursedKnown: !!it.cursedKnown,
    rarity: it.rarity || 'common',
    value: Math.max(1, it.value ?? 0),
    desc: it.desc || '',
  };
}

function findItemIndex(idOrTag){
  const tag = typeof idOrTag === 'string' ? idOrTag.toLowerCase() : '';
  return player.inv.findIndex(it => it.id === idOrTag || it.tags.map(t=>t.toLowerCase()).includes(tag));
}
function hasItem(idOrTag){ return findItemIndex(idOrTag) !== -1; }

function useItem(invIndex){
  const it = player.inv[invIndex];
  if(!it || !it.use){
    log('Cannot use that.');
    return false;
  }
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
      NPCS.filter(n=> n.map === state.map)
          .forEach(n=> NanoDialog.queueForNPC(n, 'start', 'inventory change'));
    }
    return true;
  }
  if(typeof it.use.onUse === 'function'){
    const ok = it.use.onUse({player, party, log, toast});
    if(ok!==false){
      player.inv.splice(invIndex,1);
      renderInv(); renderParty(); updateHUD();
      if(typeof toast==='function') toast(`Used ${it.name}`);
      if(typeof sfxTick==='function') sfxTick();
      if (window.NanoDialog) {
        NPCS.filter(n=> n.map === state.map)
            .forEach(n=> NanoDialog.queueForNPC(n, 'start', 'inventory change'));
      }
    }
    return !!ok;
  }
  log('Nothing happens...');
  return false;
}

// ===== Helpers =====
function mapIdForState(){ return state.map; }
function mapWH(map=state.map){
  if(map==='world') return {W:WORLD_W,H:WORLD_H};
  if(map==='creator') return {W:creatorMap.w||VIEW_W,H:creatorMap.h||VIEW_H};
  const I=interiors[map];
  return {W:(I&&I.w)||VIEW_W,H:(I&&I.h)||VIEW_H};
}
function gridFor(map){
  if(map==='world') return world;
  if(map==='creator') return creatorMap.grid;
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
function currentGrid(){ return gridFor(mapIdForState()); }
function queryTile(x,y,map=mapIdForState()){
  const tile=getTile(map,x,y);
  if(tile===null) return {tile:null, walkable:false, entities:[], items:[]};
  const entities=NPCS.filter(n=> n.map===map && n.x===x && n.y===y);
  const items=itemDrops.filter(it=> it.map===map && it.x===x && it.y===y);
  const walkableFlag=!!(walkable[tile] && entities.length===0 && items.length===0);
  return {tile, walkable:walkableFlag, entities, items};
}
// Find nearest free, walkable, unoccupied (and not water on world)
function findFreeDropTile(map,x,y){
  const {W,H}=mapWH(map);
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  const seen=new Set([x+','+y]);
  const q=[[x,y,0]];
  const MAX_RAD=50;
  while(q.length){
    const [cx,cy,d]=q.shift();
    if(d>MAX_RAD) break;
    if(cx>=0&&cy>=0&&cx<W&&cy<H){
      const info=queryTile(cx,cy,map);
      if(info.walkable) return {x:cx,y:cy};
    }
    for(const [dx,dy] of dirs){
      const nx=cx+dx, ny=cy+dy, nd=d+1, k=nx+','+ny;
      if(nx>=0&&ny>=0&&nx<W&&ny<H&&!seen.has(k) && nd<=MAX_RAD){ seen.add(k); q.push([nx,ny,nd]); }
    }
  }
  return {x,y};
}

// ===== Quests / NPC =====
class Quest {
  constructor(id, title, desc, meta={}){
    this.id=id; this.title=title; this.desc=desc;
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
        NPCS.filter(n=> n.map === state.map)
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
        NPCS.filter(n=> n.map === state.map)
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
function addQuest(id, title, desc, meta){ questLog.add(new Quest(id, title, desc, meta)); }
function completeQuest(id){ questLog.complete(id); }

// minimal core helpers so defaultQuestProcessor works even without content helpers loaded yet
function defaultQuestProcessor(npc, nodeId){
  const meta = npc.quest;
  if(!meta) return;
  if(nodeId==='accept'){
    if(meta.status==='available') questLog.add(meta);
  } else if(nodeId==='do_turnin'){
    if(meta.status==='available') questLog.add(meta);
    if(meta.status==='active'){
      if(!meta.item || hasItem(meta.item)){
        if(meta.item){ const i = findItemIndex(meta.item); if(i>-1) removeFromInv(i); }
        questLog.complete(meta.id);
        if(meta.reward){ addToInv(meta.reward); }
        if(meta.xp){ awardXP(leader(), meta.xp); }
        if(meta.moveTo){ npc.x=meta.moveTo.x; npc.y=meta.moveTo.y; }
      } else {
        const def = ITEMS[meta.item];
        textEl.textContent=`You don’t have ${def?def.name:meta.item}.`;
      }
    }
  }
}

class NPC {
  constructor({id,map,x,y,color,name,title,desc,tree,quest=null,processNode=null,processChoice=null,combat=null,shop=false}){
    Object.assign(this,{id,map,x,y,color,name,title,desc,tree,quest,combat,shop});
    const capNode = (node)=>{
      if(this.combat && node==='do_fight'){
        const {DEF=0, loot} = this.combat;
        const res = quickCombat({DEF, loot});
        const msg = res.result==='loot' ? 'The foe collapses.' :
                    res.result==='bruise' ? 'A sharp blow leaves a bruise.' :
                    'You back away.';
        textEl.textContent = `Roll: ${res.roll} vs DEF ${res.dc}. ${msg}`;
        if(res.result==='loot') removeNPC(this);
      } else if(this.shop && node==='sell'){
        const items = player.inv.map((it,idx)=>({label:`Sell ${it.name} (${Math.max(1, it.value || 0)} ${CURRENCY})`, to:'sell', sellIndex:idx}));
        this.tree.sell.text = items.length? 'What are you selling?' : 'Nothing to sell.';
        items.push({label:'(Back)', to:'start'});
        this.tree.sell.choices = items;
      }
    };
    const capChoice = (c)=>{
      if(this.shop && typeof c.sellIndex==='number'){
        const it = player.inv.splice(c.sellIndex,1)[0];
        const val = Math.max(1, it.value || 0);
        player.scrap += val;
        renderInv(); updateHUD();
        textEl.textContent = `Sold ${it.name} for ${val} ${CURRENCY}.`;
        dialogState.node='sell';
        renderDialog();
        return true;
      }
      return false;
    };
    const userPN = processNode;
    this.processNode = (node)=>{
      if(quest) defaultQuestProcessor(this,node);
      capNode(node);
      if(userPN) userPN.call(this,node);
    };
    const userPC = processChoice;
    if(userPC){
      this.processChoice = (c)=>{ if(capChoice(c)) return; return userPC.call(this,c); };
    } else {
      this.processChoice = (c)=>{ capChoice(c); };
    }
  }
}
function makeNPC(id, map, x, y, color, name, title, desc, tree, quest, processNode, processChoice, opts){
  if(opts?.combat){
    tree = tree || {};
    tree.start = tree.start || {text:'', choices:[]};
    tree.start.choices.unshift({label:'(Fight)', to:'do_fight'});
    tree.do_fight = tree.do_fight || {text:'', choices:[{label:'(Continue)', to:'bye'}]};
  }
  if(opts?.shop){
    tree = tree || {};
    tree.start = tree.start || {text:'', choices:[]};
    tree.start.choices.push({label:'(Sell items)', to:'sell'});
    tree.sell = tree.sell || {text:'What are you selling?', choices:[]};
  }
  return new NPC({id,map,x,y,color,name,title,desc,tree,quest,processNode,processChoice, ...(opts||{})});
}
function resolveNode(tree, nodeId){ const n = tree[nodeId]; const choices = n.choices||[]; return {...n, choices}; }
const NPCS=[];
function removeNPC(npc){
  const idx = NPCS.indexOf(npc);
  if(idx > -1) NPCS.splice(idx,1);
}
const usedOnceChoices = new Set();

// ===== Module application =====
function applyModule(data){
  setRNGSeed(data.seed || Date.now());
  if(data.world){
    world = data.world;
    interiors = {};
    buildings = data.buildings || [];
    portals = data.portals || [];
  }
  (data.interiors||[]).forEach(I=>{ const {id,...rest}=I; interiors[id]={...rest}; });
  if(!data.world){
    if(data.buildings && data.buildings.length){ buildings = data.buildings; }
    if(data.portals && data.portals.length){ portals = data.portals; }
  }
  if(data.mapLabels){ Object.assign(mapLabels, data.mapLabels); }
  buildings.forEach(b=>{ if(!interiors[b.interiorId]){ makeInteriorRoom(b.interiorId); } });
  itemDrops.length = 0;
  Object.keys(ITEMS).forEach(k=> delete ITEMS[k]);
  (data.items||[]).forEach(it=>{
    const {map, x, y, ...def} = it;
    const registered = registerItem(def);
    if(map!==undefined && x!==undefined && y!==undefined){
      itemDrops.push({id: registered.id, map: map||'world', x, y});
    }
  });
  Object.keys(quests).forEach(k=> delete quests[k]);
  (data.quests||[]).forEach(q=>{
    quests[q.id] = new Quest(q.id, q.title, q.desc, {item:q.item, reward:q.reward, xp:q.xp});
  });
  NPCS.length = 0;
  (data.npcs||[]).forEach(n=>{
    let tree=n.tree;
    if(typeof tree==='string'){ try{ tree=JSON.parse(tree); }catch(e){ tree=null; } }
    if(!tree){
      tree = { start:{ text:n.dialog||'', choices:[{label:'(Leave)', to:'bye'}] } };
    }
    let quest=null;
    if(n.questId && quests[n.questId]) quest=quests[n.questId];
    const opts = {};
    if(n.combat) opts.combat = n.combat;
    if(n.shop) opts.shop = n.shop;
    const npc = makeNPC(n.id, n.map||'world', n.x, n.y, n.color||'#9ef7a0', n.name||n.id, n.title||'', n.desc||'', tree, quest, null, null, opts);
    NPCS.push(npc);
  });
}

// ===== WORLD GEN =====
function genWorld(seed=Date.now(), data={}){
  setRNGSeed(seed);
  world = Array.from({length:WORLD_H},(_,y)=> Array.from({length:WORLD_W},(_,x)=>{
    const v=(Math.sin((x+seed%977)*.37)+Math.cos((y+seed%911)*.29)+Math.sin((x+y)*.11))*0.5;
    if(v> .62) return TILE.ROCK; if(v<-0.62) return TILE.WATER; if(v> .18) return TILE.BRUSH; return TILE.SAND;
  }));
  for(let x=0;x<WORLD_W;x++){
    const ry= clamp(Math.floor(WORLD_H/2 + Math.sin(x*0.22)*6), 2, WORLD_H-3);
    setTile('world', x, ry, TILE.ROAD);
    setTile('world', x, ry-1, TILE.ROAD);
  }
  for(let i=0;i<120;i++){
    const rx=rand(WORLD_W), ry=rand(WORLD_H);
    if(getTile('world',rx,ry)!==TILE.WATER) setTile('world',rx,ry,TILE.RUIN);
  }
  interiors = {};
  if(creatorMap.grid && creatorMap.grid.length) interiors['creator']=creatorMap;
  (data.interiors||[]).forEach(I=>{ const {id,...rest}=I; interiors[id]={...rest}; });
  buildings.length=0;
  if(data.buildings && data.buildings.length){
    data.buildings.forEach(b=> placeHut(b.x, b.y, b));
  } else {
    for(let i=0;i<10;i++){
      let x=8+rand(WORLD_W-16), y=6+rand(WORLD_H-12);
      if(getTile('world',x,y)===TILE.WATER){ const p=findNearestLand(x,y); x=p.x; y=p.y; }
      placeHut(x,y);
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
function makeInteriorRoom(id){
  id = id || ('room_'+rng().toString(36).slice(2,8));
  const w=12, h=9;
  const g=Array.from({length:h},(_,y)=> Array.from({length:w},(_,x)=>{
    const edge= y===0||y===h-1||x===0||x===w-1; return edge? TILE.WALL : TILE.FLOOR;
  }));
  const ex=Math.floor(w/2), ey=h-1; g[ey][ex]=TILE.DOOR;
  interiors[id] = {w,h,grid:g, entryX:ex, entryY:h-2};
  return id;
}
function placeHut(x,y,b){
  const w=6,h=5;
  const under=Array.from({length:h},(_,yy)=>Array.from({length:w},(_,xx)=>getTile('world',x+xx,y+yy)));
  for(let yy=0; yy<h; yy++){ for(let xx=0; xx<w; xx++){ setTile('world',x+xx,y+yy,TILE.BUILDING); }}
  const doorX=x+Math.floor(w/2), doorY=y+h-1; setTile('world',doorX,doorY,TILE.DOOR);
  let interiorId, boarded;
  if(b){
    interiorId = b.interiorId || makeInteriorRoom();
    if(b.interiorId && !interiors[b.interiorId]) makeInteriorRoom(b.interiorId);
    boarded = b.boarded || false;
  } else {
    interiorId = makeInteriorRoom();
    boarded = rng() < 0.3;
  }
  const nb={x,y,w,h,doorX,doorY,interiorId,boarded,under};
  buildings.push(nb);
  return nb;
}

// ===== Interaction =====
function canWalk(x,y){
  if(state.map==='creator') return false;
  return queryTile(x,y).walkable;
}
function move(dx,dy){
  if(state.map==='creator') return;
  const nx=player.x+dx, ny=player.y+dy;
  if(canWalk(nx,ny)){
    player.x=nx; player.y=ny;
    centerCamera(player.x,player.y,state.map); updateHUD();
  }
}
function adjacentNPC(){
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of dirs){
    const info=queryTile(player.x+dx,player.y+dy);
    if(info.entities.length) return info.entities[0];
  }
  return null;
}
function takeNearestItem(){
  const dirs=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of dirs){
    const info=queryTile(player.x+dx,player.y+dy);
    if(info.items.length){
      const it=info.items[0];
      const idx=itemDrops.indexOf(it);
      if(idx>-1) itemDrops.splice(idx,1);
      const def = ITEMS[it.id];
      addToInv(it.id);
      log('Took '+(def?def.name:it.id)+'.'); updateHUD();
      return true;
    }
  }
  return false;
}
function interactAt(x,y){
  if(state.map==='creator') return false;
  const dist=Math.abs(player.x-x)+Math.abs(player.y-y);
  if(dist>1) return false;
  const info=queryTile(x,y);
  if(info.entities.length){ openDialog(info.entities[0]); return true; }
  if(info.items.length){
    const it=info.items[0];
    const idx=itemDrops.indexOf(it);
    if(idx>-1) itemDrops.splice(idx,1);
    const def = ITEMS[it.id];
    addToInv(it.id); log('Took '+(def?def.name:it.id)+'.'); updateHUD();
    return true;
  }
  if(x===player.x && y===player.y && info.tile===TILE.DOOR){
    if(state.map==='world'){
      const b=buildings.find(b=> b.doorX===x && b.doorY===y);
      if(!b){ log('No entrance here.'); return true; }
      if(b.boarded){ log('The doorway is boarded up from the outside.'); return true; }
      const I=interiors[b.interiorId];
      if(I){ player.x=I.entryX; player.y=I.entryY; }
      setMap(b.interiorId,'Interior');
      log('You step inside.'); updateHUD(); return true;
    }
    if(state.map!=='world'){
      const p=portals.find(p=> p.map===state.map && p.x===x && p.y===y);
      if(p){
        const target=p.toMap;
        const I=interiors[target];
        player.x = (typeof p.toX==='number') ? p.toX : (I?I.entryX:0);
        player.y = (typeof p.toY==='number') ? p.toY : (I?I.entryY:0);
        setMap(target);
        log(p.desc || 'You move through the doorway.');
        updateHUD(); return true;
      }
      const b=buildings.find(b=> b.interiorId===state.map);
      if(b){ player.x=b.doorX; player.y=b.doorY-1; setMap('world'); log('You step back outside.'); updateHUD(); return true; }
    }
  }
  return false;
}
function interact(){
  if(Date.now()-lastInteract < 200) return false;
  lastInteract = Date.now();
  const dirs=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of dirs){
    if(interactAt(player.x+dx,player.y+dy)) return true;
  }
  log('Nothing interesting.');
  return false;
}

// Grouped systems expose focused gameplay concerns
const movementSystem = { canWalk, move };
const collisionSystem = { queryTile, canWalk };
const interactionSystem = { adjacentNPC, takeNearestItem, interact, interactAt };
Object.assign(window, { movementSystem, collisionSystem, interactionSystem, queryTile, interactAt });

// ===== Dialog =====
const overlay=document.getElementById('overlay');
const choicesEl=document.getElementById('choices');
const textEl=document.getElementById('dialogText');
const nameEl=document.getElementById('npcName');
const titleEl=document.getElementById('npcTitle');
const portEl=document.getElementById('port');
let currentNPC=null;
const dialogState={ tree:null, node:null };

function normalizeDialogTree(tree){
  const out={};
  for(const id in tree){
    const n=tree[id];
    const next=(n.next||n.choices||[]).map(c=>{
      if(typeof c==='string') return {id:c,label=c};
      const {to,id:cid,label,text,checks=[],effects=[],...rest}=c;
      return {id:to||cid,label:label||text||'(Continue)',checks,effects,...rest};
    });
    out[id]={text:n.text||'',checks:n.checks||[],effects:n.effects||[],next};
  }
  return out;
}

function runEffects(effects){
  for(const fn of effects||[]){ if(typeof fn==='function') fn({player,party,state}); }
}

/**
 * Resolve a stat check against a DC and run effects.
 * @param {Check} check
 * @param {Character} [actor=leader()]
 * @param {Function} [rng=Math.random]
 * @returns {{success:boolean, roll:number, dc:number, stat:string}}
 */
function resolveCheck(check, actor=leader(), rng=Math.random){
  const roll = Dice.skill(actor, check.stat, 0, ROLL_SIDES, rng);
  const dc = check.dc || 0;
  const success = roll >= dc;
  log?.(`Check ${check.stat} rolled ${roll} vs DC ${dc}: ${success?'success':'fail'}`);
  runEffects(success ? check.onSuccess : check.onFail);
  return { success, roll, dc, stat: check.stat };
}

function applyReward(reward){
  if(!reward) return;
  if(typeof reward==='string' && /^xp\s*\d+/i.test(reward)){
    const amt=parseInt(reward.replace(/[^0-9]/g,''),10)||0;
    awardXP(leader(), amt);
    if(typeof toast==='function') toast(`+${amt} XP`);
  } else {
    addToInv(reward);
    const id = typeof reward === 'string' ? reward : reward.id;
    const def = ITEMS[id] || (typeof reward === 'object' ? reward : null);
    if(typeof toast==='function') toast(`Received ${def?.name || id}`);
  }
}

function processQuestFlag(c){
  if(!currentNPC?.quest || !c?.q) return;
  if(c.q==='accept') defaultQuestProcessor(currentNPC,'accept');
  if(c.q==='turnin') defaultQuestProcessor(currentNPC,'do_turnin');
}

function joinParty(join){
  if(!join) return;
  const m=makeMember(join.id, join.name, join.role);
  addPartyMember(m);
  removeNPC(currentNPC);
}

function handleGoto(g){
  if(!g) return;
  if(g.map==='world'){
    startWorld();
    if(typeof g.x==='number') player.x=g.x;
    if(typeof g.y==='number') player.y=g.y;
    setMap('world');
  }else{
    if(typeof g.x==='number') player.x=g.x;
    if(typeof g.y==='number') player.y=g.y;
    if(g.map) setMap(g.map); else if(typeof centerCamera==='function') centerCamera(player.x,player.y,state.map);
  }
  updateHUD?.();
}

function advanceDialog(stateObj, choiceIdx){
  const node=stateObj.tree[stateObj.node];
  const choice=node.next[choiceIdx];
  if(!choice){ stateObj.node=null; return {next:null, text:null, close:true}; }

  // pre-check effects (e.g., condition gates)
  runEffects(choice.checks);

  const res={next:null, text:null, close:false};
  const finalize=(text)=>{ res.text=text||null; res.close=true; stateObj.node=null; return res; };

  // Required item/slot without consumption
  if(choice.reqItem || choice.reqSlot){
    const idx = choice.reqItem
      ? findItemIndex(choice.reqItem)
      : player.inv.findIndex(it => it.slot === choice.reqSlot);
    if(idx === -1){
      return finalize(choice.failure || 'You lack the required item.');
    }
    applyReward(choice.reward);
    joinParty(choice.join);
    processQuestFlag(choice);
    runEffects(choice.effects);
    if(choice.goto){
      handleGoto(choice.goto);
      res.close=true;
      stateObj.node=null;
      return res;
    }
    return finalize(choice.success || '');
  }

  // Item/slot costs
  if(choice.costItem || choice.costSlot){
    const idx = choice.costItem ? findItemIndex(choice.costItem)
                                : player.inv.findIndex(it=> it.slot===choice.costSlot);
    if(idx === -1){
      return finalize(choice.failure || 'You lack the required item.');
    }
    removeFromInv(idx);
    applyReward(choice.reward);
    joinParty(choice.join);
    processQuestFlag(choice);
    runEffects(choice.effects);
    if(choice.goto){
      handleGoto(choice.goto);
      res.close=true;
      stateObj.node=null;
      return res;
    }
    return finalize(choice.success || '');
  }

  // Stat roll gates
  if(choice.check){
    const { success, roll, dc } = resolveCheck(choice.check, leader());
    if(success){
      applyReward(choice.reward);
      joinParty(choice.join);
      processQuestFlag(choice);
    }
    runEffects(choice.effects);
    const msg = (success?choice.success:choice.failure)||'';
    return finalize(msg + ` (Roll ${roll} vs DC ${dc}).`);
  }

  // Direct response
  if(choice.response){
    processQuestFlag(choice);
    runEffects(choice.effects);
    return finalize(choice.response);
  }

  // Reward/join without roll
  if(choice.reward || choice.join){
    applyReward(choice.reward);
    joinParty(choice.join);
    processQuestFlag(choice);
    runEffects(choice.effects);
    return finalize(choice.success || '');
  }

  // Map moves
  if(choice.goto){
    handleGoto(choice.goto);
    processQuestFlag(choice);
    runEffects(choice.effects);
    res.close=true;
    stateObj.node=null;
    return res;
  }

  // Default: move to another node
  processQuestFlag(choice);
  runEffects(choice.effects);
  stateObj.node=choice.id||null;
  res.next=stateObj.node;
  if(!res.next) res.close=true;
  return res;
}

// Portrait selection from a 2x2 sheet or fallback color
function setPortrait(portEl, npc){
  if(!npc.portraitSheet){
    portEl.style.backgroundImage = '';
    portEl.style.background = npc.color || '#274227';
    return;
  }
  const frame = Math.floor(Math.random() * 4); // 0..3
  const col = frame % 2;         // 0 or 1
  const row = Math.floor(frame/2); // 0 or 1
  const posX = col === 0 ? '0%'   : '100%';
  const posY = row === 0 ? '0%'   : '100%';
  portEl.style.background = 'transparent';
  portEl.style.backgroundImage = `url(${npc.portraitSheet})`;
  portEl.style.backgroundSize = '200% 200%';
  portEl.style.backgroundPosition = `${posX} ${posY}`;
}

function openDialog(npc, node='start'){
  currentNPC=npc;
  dialogState.tree=normalizeDialogTree(npc.tree||{});
  dialogState.node=node;
  nameEl.textContent=npc.name;
  titleEl.textContent=npc.title;

  setPortrait(portEl, npc);

  // Optional subtitle/desc adornment
  const desc = npc.desc;
  if(desc){
    const small=document.createElement('div');
    small.className='small npcdesc';
    small.textContent=desc;
    const hdr=titleEl.parentElement;
    [...hdr.querySelectorAll('.small.npcdesc')].forEach(n=>n.remove());
    hdr.appendChild(small);
  }

  renderDialog();
  overlay.classList.add('shown');
  setGameState(GAME_STATE.DIALOG);
}

function closeDialog(){
  overlay.classList.remove('shown');
  currentNPC=null;
  dialogState.tree=null;
  dialogState.node=null;
  choicesEl.innerHTML='';
  const back= state.map==='world'?GAME_STATE.WORLD:GAME_STATE.INTERIOR;
  setGameState(back);
}

function renderDialog(){
  if(!dialogState.tree) return;
  const node=dialogState.tree[dialogState.node];
  if(!node){ closeDialog(); return; }

  runEffects(node.checks);
  runEffects(node.effects);

  textEl.textContent=node.text;
  choicesEl.innerHTML='';

  if(!node.next || node.next.length===0){
    const cont=document.createElement('div');
    cont.className='choice';
    cont.textContent='(Continue)';
    cont.onclick=()=> closeDialog();
    choicesEl.appendChild(cont);
    return;
  }

  // Start with all choices, then apply filters
  let choices=node.next.map((opt,idx)=>({opt,idx}));

  // Quest choice visibility (accept/turnin)
  if(currentNPC?.quest){
    const meta=currentNPC.quest;
    choices=choices.filter(({opt})=>{
      if(opt.q==='accept' && meta.status!=='available') return false;
      if(opt.q==='turnin' && (meta.status==='completed' || (meta.item && !hasItem(meta.item)))) return false;
      return true;
    });
  }

  // Once-only choices
  choices=choices.filter(({opt})=>{
    if(!opt.once) return true;
    const key=`${currentNPC.id}::${dialogState.node}::${opt.label}`;
    return !usedOnceChoices.has(key);
  });

  // Render choices
  choices.forEach(({opt,idx})=>{
    const div=document.createElement('div');
    div.className='choice';
    div.textContent=opt.label||'(Continue)';
    div.onclick=()=>{
      const key=`${currentNPC.id}::${dialogState.node}::${opt.label}`;
      if(opt.once) usedOnceChoices.add(key);

      const result=advanceDialog(dialogState,idx);
      if(result && result.text!==null){
        textEl.textContent=result.text;
        choicesEl.innerHTML='';
        const cont=document.createElement('div');
        cont.className='choice';
        cont.textContent='(Continue)';
        cont.onclick=()=>{ if(result.close) closeDialog(); else { dialogState.node=result.next; renderDialog(); } };
        choicesEl.appendChild(cont);
      } else {
        if(result && result.close) closeDialog();
        else renderDialog();
      }
    };
    choicesEl.appendChild(div);
  });
}

// ===== Save/Load & Start =====
function save(){
  const npcData = NPCS.map(({id,map,x,y,quest})=>({id,map,x,y,quest:quest?{id:quest.id,status:quest.status}:null}));
  const questData = {};
  Object.keys(quests).forEach(k=>{
    const q=quests[k];
    questData[k]={title:q.title,desc:q.desc,status:q.status};
  });
  const partyData = party.map(p=>({
    id:p.id,name:p.name,role:p.role,lvl:p.lvl,xp:p.xp,stats:p.stats,equip:p.equip,hp:p.hp,ap:p.ap,map:p.map,x:p.x,y:p.y,maxHp:p.maxHp
  }));
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
  setMap(state.map);
  renderInv(); renderQuests(); renderParty(); updateHUD();
  log('Game loaded.');
}

const startEl = document.getElementById('start');
const startContinue = document.getElementById('startContinue');
const startNew = document.getElementById('startNew');
function showStart(){ startEl.style.display='flex'; setGameState(GAME_STATE.MENU); }
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
  party.length=0; player.inv=[]; player.flags={}; player.scrap=0;
  state.map='creator'; openCreator();
  log('Reset. Back to character creation.');
}

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
const portraits=['@','&','#','%','*']; let portraitIndex=0;
const specializations={
  'Scavenger':{desc:'Finds better loot from ruins; starts with crowbar.', gear:[{name:'Crowbar',slot:'weapon',mods:{ATK:+1}}]},
  'Gunslinger':{desc:'Higher chance to win quick fights; starts with pipe rifle.', gear:[{name:'Pipe Rifle',slot:'weapon',mods:{ATK:+2}}]},
  'Snakeoil Preacher':{desc:'Can sway naive foes; +1 CHA trinket.', gear:[{name:'Tin Sun',slot:'trinket',mods:{LCK:+1}}]},
  'Cogwitch':{desc:'Tinker checks succeed more often; starts with toolkit.', gear:[{name:'Toolkit',slot:'trinket',mods:{INT:+1}}]}
};
const quirks={
  'Lucky Lint':{desc:'+1 LCK. Occasionally avoid mishaps.'},
  'Dust Allergy':{desc:'Random sneezes in dialog (harmless, funny).'},
  'Desert Prophet':{desc:'Rare visions add hints.'}
};
const hiddenOrigins={ 'Rustborn':{desc:'You survived a machine womb. +1 PER, weird dialog tags.'} };

let step=1; let building=null; let built=[];
function openCreator(){
  if(!creatorMap.grid || creatorMap.grid.length===0) genCreatorMap();
  player.x=creatorMap.entryX; player.y=creatorMap.entryY;
  setMap('creator','Creator');
  creator.style.display='flex';
  step=1;
  building={ id:'pc'+(built.length+1), name:'', role:'Wanderer', stats:baseStats(), quirk:null, spec:null, origin:null };
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

if  (ccBack) ccBack.onclick=()=>{ if(step>1) { step--; renderStep(); } };
if (ccNext) ccNext.onclick=()=>{ if(step<5){ step++; renderStep(); } else { finalizeCurrentMember(); building={ id:'pc'+(built.length+1), name:'', role:'Wanderer', stats:baseStats(), quirk:null, spec:null, origin:null }; step=1; renderStep(); log('Member added. You can add up to 2 more, or press Start Now.'); } };
if (ccStart) ccStart.onclick=()=>{ if(built.length===0){ finalizeCurrentMember(); } closeCreator(); startGame(); };
if (ccLoad) ccLoad.onclick=()=>{ load(); closeCreator(); };

function startGame(){
  startWorld();
}

function startWorld(){
  const seed = Date.now();
  genWorld(seed);
  player.x=2; player.y=Math.floor(WORLD_H/2);
  setMap('world','Wastes');
  renderInv(); renderQuests(); renderParty(); updateHUD();
  log('You step into the wastes.');
}

// Content pack moved to modules/dustland.module.js

Object.assign(window, {Dice, Character, Party, Quest, NPC, questLog, quickCombat, removeNPC, makeNPC, resolveCheck});

// Export a few helpers for Node-based tests without affecting the browser build
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addToInv,
    advanceDialog,
    applyModule,
    canWalk,
    Character,
    clamp,
    createRNG,
    Dice,
    equipItem,
    findFreeDropTile,
    GAME_STATE,
    getGameState: () => gameState,
    itemDrops,
    move,
    normalizeItem,
    interactAt,
    registerItem,
    queryTile,
    NPCS,
    openDialog,
    party,
    portals,
    player,
    ITEMS,
    mapLabels,
    takeNearestItem,
    resolveCheck,
    setGameState,
    setLeader: (idx)=>{ selectedMember = idx; },
    state,
    unequipItem
  };
}

const { Effects } = globalThis;

// active temporary stat modifiers
const buffs = [];              // 2c342c / 313831
const tileColors = {0:'#1e271d',1:'#313831',2:'#1573ff',3:'#203320',4:'#777777',5:'#304326',6:'#4d5f4d',7:'#233223',8:'#8bd98d',9:'#000000'};// 2B382B / 203320
let moveDelay = 0;

function hexToHsv(hex) {
    // 1. Convert Hex to RGB
    let r = 0, g = 0, b = 0;
    // Handle #RRGGBB format
    if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
    } 
    // Handle #RGB format (shorthand)
    else if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else {
        // Invalid hex format
        return null; 
    }

    // Normalize RGB values to a 0-1 range
    r /= 255;
    g /= 255;
    b /= 255;

    // 2. Convert RGB to HSV
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, v = max;

    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0; // achromatic
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Return HSV values, typically hue in [0, 360], saturation and value in [0, 100]
    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

function tileDelay(t, map=state.map){
  if(t===TILE.ROAD) return 0;
  if(map!=='world') return 100;
  const col=tileColors[t];
  if(!col) return 200;
  const brightness = hexToHsv(col)[2];
  const maxBright=26;
  const minBright=15;
  const pct = clamp(((brightness - minBright) / (maxBright - minBright)) * 100, 0, 100);
  const minDelay=100, maxDelay=500;
  const delay = minDelay + (pct/100)*(maxDelay-minDelay);
  return delay;
}

function calcMoveDelay(tile, actor, map=state.map){
  const base = tileDelay(tile, map);
  const agi = (actor?.stats?.AGI || 0) + (actor?._bonus?.AGI || 0);
  const adjusted = base - agi * 10;
  return adjusted > 0 ? adjusted : 0;
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

function onEnter(map,x,y,ctx){
  const t = tileEvents.find(e => (e.map || 'world') === map && e.x === x && e.y === y);
  if (!t) {
    const wasInDustStorm = state.mapFlags && state.mapFlags.dustStorm;
    if (wasInDustStorm) {
      Effects.apply([{ effect: 'dustStorm', active: false }]);
      if(state.mapFlags) state.mapFlags.dustStorm = false;
    }
    return;
  }
  const list = (t.events || []).filter(ev => ev.when === 'enter');
  if(list.length) Effects.apply(list, ctx);

  const hasDustStorm = list.some(e => e.effect === 'dustStorm');
  if(state.mapFlags) state.mapFlags.dustStorm = hasDustStorm;
  if (!hasDustStorm) {
    Effects.apply([{ effect: 'dustStorm', active: false }]);
  }
}

// ===== Interaction =====
function canWalk(x,y){
  if(state.map==='creator') return false;
  return queryTile(x,y).walkable;
}
function move(dx,dy){
  if(state.map==='creator') return;
  if(typeof navigator!=='undefined' && moveDelay > 0) return;
  const nx=party.x+dx, ny=party.y+dy;
  if(canWalk(nx,ny)){
    const actor = typeof leader==='function'? leader(): null;
    moveDelay = calcMoveDelay(getTile(state.map, party.x, party.y), actor);
    return new Promise(resolve => {
      setTimeout(() => {
        Effects.tick({buffs});
        if(actor){
          actor.hp = Math.min(actor.hp + 1, actor.maxHp);
          player.hp = actor.hp;
        }
        setPartyPos(nx, ny);
        if(typeof footstepBump==='function') footstepBump();
        onEnter(state.map, nx, ny, { player, party, state, actor, buffs });
        centerCamera(party.x,party.y,state.map); updateHUD();
        checkAggro();
        EventBus.emit('sfx','step');
        // NPCs advance along paths after the player steps
        if(typeof tickPathAI==='function') tickPathAI();
        moveDelay = 0;
        resolve();
      }, moveDelay);
    });
  } else {
    EventBus.emit('sfx','denied');
  }
}

function checkAggro(){
  if(typeof document !== 'undefined' && document.getElementById('combatOverlay')?.classList?.contains?.('shown')) return;
  for(const n of NPCS){
    if(!n.combat || !n.combat.auto) continue;
    if(n.map!==state.map) continue;
    const d = Math.abs(n.x - party.x) + Math.abs(n.y - party.y);
    if(d<=3){
      Actions.startCombat({ ...n.combat, npc:n, name:n.name });
      break;
    }
  }
}
function adjacentNPC(){
  const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of dirs){
    const info=queryTile(party.x+dx,party.y+dy);
    if(info.entities.length) return info.entities[0];
  }
  return null;
}
function takeNearestItem(){
  const dirs=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of dirs){
    const info=queryTile(party.x+dx,party.y+dy);
    if(info.items.length){
      const it=info.items[0];
      const idx=itemDrops.indexOf(it);
      if(idx>-1) itemDrops.splice(idx,1);
      const def = ITEMS[it.id];
      addToInv(getItem(it.id));
      log('Took '+(def?def.name:it.id)+'.'); updateHUD();
      if(typeof pickupSparkle==='function') pickupSparkle(party.x+dx,party.y+dy);
      EventBus.emit('sfx','pickup');
      return true;
    }
  }
  return false;
}
function interactAt(x,y){
  if(state.map==='creator') return false;
  const dist=Math.abs(party.x-x)+Math.abs(party.y-y);
  if(dist>1) return false;
  const info=queryTile(x,y);
  if(info.entities.length){
    openDialog(info.entities[0]);
    EventBus.emit('sfx','confirm');
    return true;
  }
    if(info.items.length){
      const it=info.items[0];
      const idx=itemDrops.indexOf(it);
      if(idx>-1) itemDrops.splice(idx,1);
      const def = ITEMS[it.id];
      addToInv(getItem(it.id));
      log('Took '+(def?def.name:it.id)+'.'); updateHUD();
      if(typeof pickupSparkle==='function') pickupSparkle(x,y);
      EventBus.emit('sfx','pickup');
      return true;
    }
  if(x===party.x && y===party.y && info.tile===TILE.DOOR){
    if(state.map==='world'){
      const b=buildings.find(b=> b.doorX===x && b.doorY===y);
      if(!b){ log('No entrance here.'); EventBus.emit('sfx','denied'); return true; }
      if(b.boarded){ log('The doorway is boarded up from the outside.'); EventBus.emit('sfx','denied'); return true; }
      const I=interiors[b.interiorId];
      if(I){ setPartyPos(I.entryX, I.entryY); }
      setMap(b.interiorId,'Interior');
      log('You step inside.'); updateHUD();
      EventBus.emit('sfx','confirm');
      return true;
    }
    if(state.map!=='world'){
      const p=portals.find(p=> p.map===state.map && p.x===x && p.y===y);
      if(p){
        const target=p.toMap;
        const I=interiors[target];
        const px = (typeof p.toX==='number') ? p.toX : (I?I.entryX:0);
        const py = (typeof p.toY==='number') ? p.toY : (I?I.entryY:0);
        setPartyPos(px, py);
        setMap(target);
        log(p.desc || 'You move through the doorway.');
        updateHUD();
        EventBus.emit('sfx','confirm');
        return true;
      }
      const b=buildings.find(b=> b.interiorId===state.map);
      if(b){
        setPartyPos(b.doorX, b.doorY-1);
        setMap('world');
        log('You step back outside.');
        updateHUD();
        EventBus.emit('sfx','confirm');
        return true;
      }
    }
  }
  return false;
}
function interact(){
  if(Date.now()-lastInteract < 200) return false;
  lastInteract = Date.now();
  const dirs=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];
  for(const [dx,dy] of dirs){
    if(interactAt(party.x+dx,party.y+dy)) return true;
  }
  log('Nothing interesting.');
  EventBus.emit('sfx','denied');
  return false;
}

const movementSystem = { canWalk, move };
const collisionSystem = { queryTile, canWalk };
const interactionSystem = { adjacentNPC, takeNearestItem, interact, interactAt };
Object.assign(globalThis, {
  movementSystem,
  collisionSystem,
  interactionSystem,
  queryTile,
  interactAt,
  findFreeDropTile,
  mapWH,
  mapIdForState,
  canWalk,
  move,
  takeNearestItem,
  onEnter,
  buffs,
  calcMoveDelay,
  getMoveDelay: () => moveDelay
});

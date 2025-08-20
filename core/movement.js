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

// ===== Interaction =====
function canWalk(x,y){
  if(state.map==='creator') return false;
  return queryTile(x,y).walkable;
}
function move(dx,dy){
  if(state.map==='creator') return;
  const nx=party.x+dx, ny=party.y+dy;
  if(canWalk(nx,ny)){
    setPartyPos(nx, ny);
    centerCamera(party.x,party.y,state.map); updateHUD();
    checkAggro();
  }
}

function checkAggro(){
  if(typeof document !== 'undefined' && document.getElementById('combatOverlay')?.classList?.contains?.('shown')) return;
  for(const n of NPCS){
    if(!n.combat || !n.combat.auto) continue;
    if(n.map!==state.map) continue;
    const d = Math.abs(n.x - party.x) + Math.abs(n.y - party.y);
    if(d<=3){
      startCombat({ ...n.combat, npc:n, name:n.name });
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
      addToInv(it.id);
      log('Took '+(def?def.name:it.id)+'.'); updateHUD();
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
  if(info.entities.length){ openDialog(info.entities[0]); return true; }
  if(info.items.length){
    const it=info.items[0];
    const idx=itemDrops.indexOf(it);
    if(idx>-1) itemDrops.splice(idx,1);
    const def = ITEMS[it.id];
    addToInv(it.id); log('Took '+(def?def.name:it.id)+'.'); updateHUD();
    return true;
  }
  if(x===party.x && y===party.y && info.tile===TILE.DOOR){
    if(state.map==='world'){
      const b=buildings.find(b=> b.doorX===x && b.doorY===y);
      if(!b){ log('No entrance here.'); return true; }
      if(b.boarded){ log('The doorway is boarded up from the outside.'); return true; }
      const I=interiors[b.interiorId];
      if(I){ setPartyPos(I.entryX, I.entryY); }
      setMap(b.interiorId,'Interior');
      log('You step inside.'); updateHUD(); return true;
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
        updateHUD(); return true;
      }
      const b=buildings.find(b=> b.interiorId===state.map);
      if(b){ setPartyPos(b.doorX, b.doorY-1); setMap('world'); log('You step back outside.'); updateHUD(); return true; }
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
  return false;
}

const movementSystem = { canWalk, move };
const collisionSystem = { queryTile, canWalk };
const interactionSystem = { adjacentNPC, takeNearestItem, interact, interactAt };
Object.assign(globalThis, { movementSystem, collisionSystem, interactionSystem, queryTile, interactAt, findFreeDropTile, canWalk, move, takeNearestItem });

if (typeof module !== 'undefined' && module.exports){
  module.exports = { mapIdForState, mapWH, gridFor, getTile, setTile, currentGrid, queryTile, findFreeDropTile, canWalk, move, adjacentNPC, takeNearestItem, interactAt, interact, movementSystem, collisionSystem, interactionSystem };
}

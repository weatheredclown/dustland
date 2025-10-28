interface Point { x: number; y: number; }

interface TileEntity {
  id?: string | number;
  door?: boolean;
  locked?: boolean;
}

interface PathJob {
  map: string;
  start: Point;
  goal: Point;
  key: string;
  ignoreId?: string | number | null;
}

interface NPCState {
  id?: string | number;
  map: string;
  x: number;
  y: number;
  loop?: Point[];
  _loop?: { idx: number; path: Point[]; job: string | null };
  _lastMove?: number;
  door?: boolean;
  locked?: boolean;
}

// dustland-path.js
// Simple A* pathfinding with async queue for Dustland
(function(){
  const globalScope = globalThis as typeof globalThis & {
    perfStats?: { path: number; ai: number };
    Dustland?: Record<string, unknown>;
    NPC_MOVE_DELAY?: number;
    walkable?: Record<string, boolean>;
    NPCS?: NPCState[];
    party?: { x: number; y: number };
  };
  console.log('[Path] Script loaded');
  const MAX_CACHE = 256;
  const state: {
    queue: PathJob[];
    busy: boolean;
    cache: Map<string, Point[]>;
    order: string[];
  } = { queue: [], busy:false, cache:new Map(), order: [] };

  function queue(map: string, start: Point, goal: Point, ignoreId?: string | number | null){
    const key = `${map}@${start.x},${start.y}->${goal.x},${goal.y}`;
    if(state.cache.has(key) || state.queue.find(j=>j.key===key)) return key;
    state.queue.push({map,start,goal,key,ignoreId});
    process();
    return key;
  }

  function pathFor(key: string){
    return state.cache.get(key) || null;
  }

  function process(){
    if(state.busy || !state.queue.length) return;
    state.busy=true;
    const job=state.queue.shift();
    if(!job){
      state.busy=false;
      return;
    }
    setTimeout(()=>{
      const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const p=aStar(job.map, job.start, job.goal, job.ignoreId);
      if(globalScope.perfStats) globalScope.perfStats.path += ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
      if(state.cache.size >= MAX_CACHE){
        const oldest=state.order.shift();
        if(oldest) state.cache.delete(oldest);
      }
      state.cache.set(job.key, p);
      state.order.push(job.key);
      state.busy=false;
      process();
    },0);
  }

  function aStar(map: string, start: Point, goal: Point, ignoreId?: string | number | null){
    const open: Point[]=[{x:start.x,y:start.y}];
    const came: Record<string, string | undefined>={};
    const g: Record<string, number>={};
    const f: Record<string, number>={};
    const startKey=key(start.x,start.y);
    g[startKey]=0;
    f[startKey]=heuristic(start,goal);
    while(open.length){
      open.sort((a,b)=>f[key(a.x,a.y)]-f[key(b.x,b.y)]);
      const current=open.shift();
      if(!current) break;
      const ck=key(current.x,current.y);
      if(current.x===goal.x && current.y===goal.y){
        return reconstruct(came, ck);
      }
      for(const nb of neighbors(current.x,current.y,map,ignoreId)){
        const nk=key(nb.x,nb.y);
        const tentative=g[ck]+1;
        if(tentative < (g[nk]??Infinity)){
          came[nk]=ck;
          g[nk]=tentative;
          f[nk]=tentative+heuristic(nb,goal);
          if(!open.find(p=>p.x===nb.x && p.y===nb.y)) open.push(nb);
        }
      }
    }
    return [];
  }

  function neighbors(x: number,y: number,map: string,ignoreId?: string | number | null){
    const dirs: Array<[number,number]>=[[1,0],[-1,0],[0,1],[0,-1]];
    const out: Point[]=[];
    for(const [dx,dy] of dirs){
      const nx=x+dx, ny=y+dy;
      if(isWalkableAt(map,nx,ny,ignoreId)) out.push({x:nx,y:ny});
    }
    return out;
  }

  function isWalkableAt(map: string,x: number,y: number,ignoreId?: string | number | null){
    const info=queryTile(x,y,map) as unknown as { tile: string | number | null; entities: TileEntity[] };
    if(info.tile===null) return false;
    const tiles = globalScope.walkable;
    if(tiles && !tiles[String(info.tile)]) return false;
    // treat unlocked doors as non-blocking
    return info.entities.every(e=> e.id===ignoreId || (e.door && !e.locked));
  }

  function heuristic(a: Point,b: Point){
    return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
  }

  function reconstruct(came: Record<string, string | undefined>, endKey: string){
    const path: Point[]=[];
    let k=endKey;
    while(k){
      const [x,y]=k.split(',').map(Number);
      path.push({x,y});
      k=came[k];
    }
    return path.reverse();
  }

  function key(x: number,y: number){ return x+','+y; }

  const npcMoveDelay = globalScope.NPC_MOVE_DELAY ?? 200; // min ms between NPC patrol steps

  // Step NPCs along their waypoint loops. Invoked after player moves.
  function tickPathAI(){
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    const now = Date.now();
    const npcs = Array.isArray(globalScope.NPCS) ? (globalScope.NPCS as NPCState[]) : [];
    const partyState = globalScope.party;
    for(const n of npcs){
      const pts=n.loop;
      if(!Array.isArray(pts) || pts.length<2) continue;
      n._loop = n._loop || { idx:1, path:[], job:null };
      if(n._lastMove && now - n._lastMove < npcMoveDelay) continue;
      const st=n._loop;
      const near=partyState && Math.abs(n.x-partyState.x)+Math.abs(n.y-partyState.y) <= 2;
      if(near) continue;
      if(st.path.length){
        const step=st.path.shift();
        if(step){ n.x=step.x; n.y=step.y; n._lastMove=now; }
        if(!st.path.length){
          st.idx=(st.idx+1)%pts.length;
          const target=pts[st.idx];
          // queue the next leg so patrols loop without pausing at endpoints
          st.job=queue(n.map,{x:n.x,y:n.y},target,n.id);
        }
        continue;
      }
      if(st.job){
        const p=pathFor(st.job);
        if(p){
          st.path=p.slice(1);
          st.job=null;
          if(st.path.length){
            const step=st.path.shift();
            if(step){ n.x=step.x; n.y=step.y; n._lastMove=now; }
            if(!st.path.length){
              st.idx=(st.idx+1)%pts.length;
              const target=pts[st.idx];
              // queue the next leg so patrols loop without pausing at endpoints
              st.job=queue(n.map,{x:n.x,y:n.y},target,n.id);
            }
          } else {
            st.idx=(st.idx+1)%pts.length;
            const target=pts[st.idx];
            st.job=queue(n.map,{x:n.x,y:n.y},target,n.id);
          }
        }
        continue;
      }
      const target=pts[st.idx];
      st.job=queue(n.map,{x:n.x,y:n.y},target,n.id);
    }
    if(globalScope.perfStats) globalScope.perfStats.ai += ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - t0;
  }
  globalScope.Dustland = globalScope.Dustland || {};
  (globalScope.Dustland as Record<string, unknown>).path = { queue, pathFor, tickPathAI, MAX_CACHE };
})();

// dustland-path.js
// Simple A* pathfinding with async queue for Dustland
(function(){
  console.log('[Path] Script loaded');
  const state = { queue: [], busy:false, cache:new Map() };

  function queue(map, start, goal, ignoreId){
    const key = `${map}@${start.x},${start.y}->${goal.x},${goal.y}`;
    if(state.cache.has(key) || state.queue.find(j=>j.key===key)) return key;
    state.queue.push({map,start,goal,key,ignoreId});
    process();
    return key;
  }

  function pathFor(key){
    return state.cache.get(key) || null;
  }

  function process(){
    if(state.busy || !state.queue.length) return;
    state.busy=true;
    const job=state.queue.shift();
    setTimeout(()=>{
      const p=aStar(job.map, job.start, job.goal, job.ignoreId);
      state.cache.set(job.key, p);
      state.busy=false;
      process();
    },0);
  }

  function aStar(map, start, goal, ignoreId){
    const open=[{x:start.x,y:start.y}];
    const came={};
    const g={};
    const f={};
    const startKey=key(start.x,start.y);
    g[startKey]=0;
    f[startKey]=heuristic(start,goal);
    while(open.length){
      open.sort((a,b)=>f[key(a.x,a.y)]-f[key(b.x,b.y)]);
      const current=open.shift();
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

  function neighbors(x,y,map,ignoreId){
    const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
    const out=[];
    for(const [dx,dy] of dirs){
      const nx=x+dx, ny=y+dy;
      if(isWalkableAt(map,nx,ny,ignoreId)) out.push({x:nx,y:ny});
    }
    return out;
  }

  function isWalkableAt(map,x,y,ignoreId){
    const info=queryTile(x,y,map);
    if(info.tile===null) return false;
    if(!walkable[info.tile]) return false;
    return info.entities.every(e=>e.id===ignoreId);
  }

  function heuristic(a,b){
    return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
  }

  function reconstruct(came, endKey){
    const path=[];
    let k=endKey;
    while(k){
      const [x,y]=k.split(',').map(Number);
      path.push({x,y});
      k=came[k];
    }
    return path.reverse();
  }

  function key(x,y){ return x+','+y; }

  const NPC_MOVE_DELAY = globalThis.NPC_MOVE_DELAY || 200; // min ms between NPC patrol steps

  // Step NPCs along their waypoint loops. Invoked after player moves.
  function tickPathAI(){
    const now = Date.now();
    for(const n of (typeof NPCS !== 'undefined' ? NPCS : [])){
      const pts=n.loop;
      if(!Array.isArray(pts) || pts.length<2) continue;
      n._loop = n._loop || { idx:1, path:[], job:null };
      if(n._lastMove && now - n._lastMove < NPC_MOVE_DELAY) continue;
      const st=n._loop;
      const near=party && Math.abs(n.x-party.x)+Math.abs(n.y-party.y) <= 2;
      if(near) continue;
      if(st.path.length){
        const step=st.path.shift();
        if(step){ n.x=step.x; n.y=step.y; n._lastMove=now; }
        if(!st.path.length){ st.idx=(st.idx+1)%pts.length; }
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
            if(!st.path.length){ st.idx=(st.idx+1)%pts.length; }
          }
        }
        continue;
      }
      const target=pts[st.idx];
      st.job=queue(n.map,{x:n.x,y:n.y},target,n.id);
    }
  }
  globalThis.Dustland = globalThis.Dustland || {};
  globalThis.Dustland.path = { queue, pathFor, tickPathAI };
})();

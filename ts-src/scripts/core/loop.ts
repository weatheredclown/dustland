// @ts-nocheck
(function(){
  function nextLoopPoint(prev, npc){
    if(!prev) return { x:npc.x, y:npc.y };
    const maxDist = 10;
    let x = prev.x + 1;
    let y = prev.y;
    if (typeof WORLD_W === 'number' && x >= WORLD_W) x = prev.x - 1;
    x = clamp(x, prev.x - maxDist, prev.x + maxDist);
    y = clamp(y, prev.y - maxDist, prev.y + maxDist);
    if (typeof WORLD_W === 'number') x = clamp(x, 0, WORLD_W - 1);
    if (typeof WORLD_H === 'number') y = clamp(y, 0, WORLD_H - 1);
    return { x, y };
  }
  Object.assign(globalThis, { nextLoopPoint });
})();

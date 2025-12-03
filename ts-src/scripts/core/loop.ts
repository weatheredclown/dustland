(function(){
  type LoopPoint = { x: number; y: number };

  function nextLoopPoint(prev: LoopPoint | undefined, npc: LoopPoint){
    type LoopGlobals = typeof globalThis & {
      WORLD_W?: number;
      WORLD_H?: number;
      clamp: (value: number, min: number, max: number) => number;
    };
    const globals = globalThis as LoopGlobals;
    if(!prev) return { x:npc.x, y:npc.y };
    const maxDist = 10;
    let x = prev.x + 1;
    let y = prev.y;
    if (typeof globals.WORLD_W === 'number' && x >= globals.WORLD_W) x = prev.x - 1;
    x = globals.clamp(x, prev.x - maxDist, prev.x + maxDist);
    y = globals.clamp(y, prev.y - maxDist, prev.y + maxDist);
    if (typeof globals.WORLD_W === 'number') x = globals.clamp(x, 0, globals.WORLD_W - 1);
    if (typeof globals.WORLD_H === 'number') y = globals.clamp(y, 0, globals.WORLD_H - 1);
    return { x, y };
  }
  Object.assign(globalThis, { nextLoopPoint });
})();

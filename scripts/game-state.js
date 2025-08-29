(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const state = { party: [], world: {}, inventory: [], flags: {}, clock: 0, quests: [] };
  function getState(){ return state; }
  function updateState(fn){ if (typeof fn === 'function') fn(state); }
  Dustland.gameState = { getState, updateState };
})();

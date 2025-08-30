(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const state = { party: [], world: {}, inventory: [], flags: {}, clock: 0, quests: [], difficulty: 'normal' };
  function getState(){ return state; }
  function updateState(fn){ if (typeof fn === 'function') fn(state); }
  function getDifficulty(){ return state.difficulty; }
  function setDifficulty(mode){ state.difficulty = mode; }
  Dustland.gameState = { getState, updateState, getDifficulty, setDifficulty };
})();

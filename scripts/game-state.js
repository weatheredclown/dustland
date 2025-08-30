(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const state = { party: [], world: {}, inventory: [], flags: {}, clock: 0, quests: [], difficulty: 'normal', personas: {} };
  function getState(){ return state; }
  function updateState(fn){ if (typeof fn === 'function') fn(state); }
  function getDifficulty(){ return state.difficulty; }
  function setDifficulty(mode){ state.difficulty = mode; }
  function setPersona(id, persona){ state.personas[id] = persona; }
  function getPersona(id){ return state.personas[id]; }
  Dustland.gameState = { getState, updateState, getDifficulty, setDifficulty, setPersona, getPersona };
})();

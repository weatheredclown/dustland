(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const state = { party: [], world: {}, inventory: [], flags: {}, clock: 0, quests: [], difficulty: 'normal', personas: {} };
  function getState(){ return state; }
  function updateState(fn){ if (typeof fn === 'function') fn(state); }
  function getDifficulty(){ return state.difficulty; }
  function setDifficulty(mode){ state.difficulty = mode; }
  function setPersona(id, persona){ state.personas[id] = persona; }
  function getPersona(id){ return state.personas[id]; }
  function applyPersona(memberId, personaId){
    const persona = state.personas[personaId];
    if (!persona) return;
    const member = state.party.find(m => m.id === memberId);
    if (!member) return;
    const prev = member.persona;
    if (prev && prev !== personaId) globalThis.EventBus?.emit('persona:unequip', { memberId, personaId: prev });
    member.persona = personaId;
    if (typeof member.applyEquipmentStats === 'function') member.applyEquipmentStats();
    if (typeof member.applyCombatMods === 'function') member.applyCombatMods();
    globalThis.EventBus?.emit('persona:equip', { memberId, personaId });
    if (typeof renderParty === 'function') renderParty();
    if (typeof updateHUD === 'function') updateHUD();
  }
  Dustland.gameState = { getState, updateState, getDifficulty, setDifficulty, setPersona, getPersona, applyPersona };
})();

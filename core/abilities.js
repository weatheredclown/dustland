(function(){
  const Abilities = {};

  function defineAbility(id, data = {}){
    const ability = {
      id,
      type: data.type || 'active',
      cost: data.cost || 0,
      prereq: {
        level: data.prereq && data.prereq.level || 0,
        abilities: data.prereq && data.prereq.abilities || []
      },
      effect: data.effect || {}
    };
    Abilities[id] = ability;
    return ability;
  }

  Object.assign(globalThis, { Abilities, defineAbility });
})();

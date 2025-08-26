(function(){
  const Abilities = {};
  const Specials = {};

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

  function defineSpecial(id, data = {}){
    const special = {
      id,
      adrenaline_cost: data.adrenaline_cost || 0,
      target_type: data.target_type || 'single',
      effect: data.effect || {},
      wind_up_time: data.wind_up_time || 0
    };
    Specials[id] = special;
    return special;
  }

  Object.assign(globalThis, { Abilities, defineAbility, Specials, defineSpecial });
})();

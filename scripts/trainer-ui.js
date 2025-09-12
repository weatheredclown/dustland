(function(){
  function loadTrainerData(){
    return globalThis.TRAINER_UPGRADES || {};
  }

  async function showTrainer(id, memberIndex = 0){
    const data = loadTrainerData();
    const upgrades = data[id] || [];
    const overlay = document.getElementById('trainerOverlay');
    if(!overlay) return null;
    const choices = overlay.querySelector('#trainerChoices');
    const leaderEl = overlay.querySelector('#trainerLeader');
    const pointsEl = overlay.querySelector('#trainerPoints');
    const closeBtn = overlay.querySelector('#closeTrainerBtn');
    const member = globalThis.party?.[memberIndex];
    const lead = typeof leader === 'function' ? leader() : null;

    if(leaderEl) leaderEl.textContent = lead ? `Leader: ${lead.name}` : '';
    if(pointsEl) pointsEl.textContent = `Skill Points: ${lead?.skillPoints || 0}`;
    if(closeBtn) closeBtn.onclick = hideTrainer;

    choices.innerHTML = '';
    upgrades.forEach(up => {
      const btn = document.createElement('div');
      btn.className = 'choice';
      if(member){
        const base = up.stat === 'HP' ? member.maxHp : (member.stats[up.stat] || 0);
        const after = base + (up.delta || 0);
        btn.textContent = `${up.label} (Cost:${up.cost}) ${base}\u2192${after}`;
      }else{
        btn.textContent = `${up.label} (Cost:${up.cost})`;
      }
      btn.addEventListener('click', () => {
        applyUpgrade(id, up.id, memberIndex);
      });
      choices.appendChild(btn);
    });

    function handleKey(e){
      if(e.key === 'Escape'){ hideTrainer(); }
    }
    overlay.classList.add('shown');
    overlay.tabIndex = -1;
    overlay.addEventListener('keydown', handleKey);
    overlay._handleKey = handleKey;
    overlay.focus();
    return overlay;
  }

  function applyUpgrade(trainerId, upgradeId, memberIndex){
    const data = loadTrainerData();
    const up = (data?.[trainerId] || []).find(u => u.id === upgradeId);
    if(!up) return false;
    if(up.type === 'stat'){
      const ok = trainStat(up.stat, memberIndex);
      if(ok) showTrainer(trainerId, memberIndex);
      return ok;
    }
    return false;
  }

  function hideTrainer(){
    const overlay = document.getElementById('trainerOverlay');
    if(!overlay) return;
    overlay.classList.remove('shown');
    if(overlay._handleKey){
      overlay.removeEventListener('keydown', overlay._handleKey);
      delete overlay._handleKey;
    }
  }

  globalThis.TrainerUI = { showTrainer, applyUpgrade, hideTrainer };
})();


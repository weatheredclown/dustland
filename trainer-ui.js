(function(){
  async function loadTrainerData(){
    if(loadTrainerData.cache) return loadTrainerData.cache;
    const res = await fetch('data/skills/trainer-upgrades.json');
    const data = await res.json();
    loadTrainerData.cache = data;
    return data;
  }

  async function showTrainer(id, memberIndex){
    const data = await loadTrainerData();
    const upgrades = data[id] || [];
    let box = document.getElementById('trainer_ui');
    if(!box){
      box = document.createElement('div');
      box.id = 'trainer_ui';
    }
    box.innerHTML = '';
    upgrades.forEach(up => {
      const btn = document.createElement('button');
      btn.textContent = `${up.label} (Cost:${up.cost})`;
      btn.addEventListener('click', () => {
        applyUpgrade(id, up.id, memberIndex);
      });
      box.appendChild(btn);
    });
    document.body.appendChild(box);
    return box;
  }

  function applyUpgrade(trainerId, upgradeId, memberIndex){
    const data = loadTrainerData.cache;
    const up = (data?.[trainerId] || []).find(u => u.id === upgradeId);
    if(!up) return false;
    if(up.type === 'stat'){
      return trainStat(up.stat, memberIndex);
    }
    return false;
  }

  function hideTrainer(){
    const el = document.getElementById('trainer_ui');
    el?.remove();
  }

  globalThis.TrainerUI = { showTrainer, applyUpgrade, hideTrainer };
})();

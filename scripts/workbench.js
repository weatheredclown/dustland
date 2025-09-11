(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;

  function craftSignalBeacon(){
    const scrapCost = 5;
    const fuelCost = 50;
    if ((player.scrap || 0) < scrapCost){
      log('Need 5 scrap.');
      return;
    }
    if ((player.fuel || 0) < fuelCost){
      log('Need 50 fuel.');
      return;
    }
    player.scrap -= scrapCost;
    player.fuel -= fuelCost;
    addToInv('signal_beacon');
    bus?.emit('craft:signal-beacon');
    log('Crafted a signal beacon.');
  }

  function craftSolarTarp(){
    const scrapCost = 3;
    if ((player.scrap || 0) < scrapCost){
      log('Need 3 scrap.');
      return;
    }
    if (!hasItem('cloth')){
      log('Need cloth.');
      return;
    }
    player.scrap -= scrapCost;
    const idx = findItemIndex('cloth');
    if (idx >= 0) removeFromInv(idx);
    addToInv('solar_tarp');
    bus?.emit('craft:solar-tarp');
    log('Crafted a solar panel tarp.');
  }

  function craftBandage(){
    if (!hasItem('plant_fiber')){
      log('Need plant fiber.');
      return;
    }
    const idx = findItemIndex('plant_fiber');
    if (idx >= 0) removeFromInv(idx);
    addToInv('bandage');
    bus?.emit('craft:bandage');
    log('Crafted a bandage.');
  }

  function openWorkbench(){
    const overlay = document.getElementById('workbenchOverlay');
    const list = document.getElementById('workbenchRecipes');
    const closeBtn = document.getElementById('closeWorkbenchBtn');
    if (!overlay || !list || !closeBtn) return;

    let focusables = [];
    let focusIdx = 0;

    function focusCurrent(){
      if (focusables.length) focusables[focusIdx].focus();
    }

    function renderRecipes(){
      list.innerHTML = '';
      focusables = [];
      const recipes = [
        {
          name: 'Signal Beacon',
          craft: craftSignalBeacon,
          missing(){
            const m = [];
            if ((player.scrap || 0) < 5) m.push('5 scrap');
            if ((player.fuel || 0) < 50) m.push('50 fuel');
            return m;
          }
        },
        {
          name: 'Solar Panel Tarp',
          craft: craftSolarTarp,
          missing(){
            const m = [];
            if ((player.scrap || 0) < 3) m.push('3 scrap');
            if (!hasItem('cloth')) m.push('cloth');
            return m;
          }
        },
        {
          name: 'Bandage',
          craft: craftBandage,
          missing(){
            const m = [];
            if (!hasItem('plant_fiber')) m.push('plant fiber');
            return m;
          }
        }
      ];

      recipes.forEach(r => {
        const row = document.createElement('div');
        row.className = 'slot';
        const miss = r.missing();
        if (miss.length === 0){
          row.innerHTML = `<span>${r.name}</span><button class="btn">Craft</button>`;
          const btn = row.querySelector('button');
          btn.onclick = () => { r.craft(); renderRecipes(); };
          list.appendChild(row);
          focusables.push(btn);
        } else {
          row.innerHTML = `<span>${r.name} - need ${miss.join(', ')}</span>`;
          list.appendChild(row);
        }
      });
      focusIdx = 0;
      focusCurrent();
    }

    function close(){
      overlay.classList.remove('shown');
      overlay.removeEventListener('keydown', handleKey);
    }

    function handleKey(e){
      e.stopPropagation();
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'ArrowDown') {
        focusIdx = (focusIdx + 1) % focusables.length;
        focusCurrent();
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        focusIdx = (focusIdx - 1 + focusables.length) % focusables.length;
        focusCurrent();
        e.preventDefault();
      }
    }

    closeBtn.onclick = close;
    overlay.classList.add('shown');
    overlay.tabIndex = -1;
    overlay.addEventListener('keydown', handleKey);
    renderRecipes();
    overlay.focus();
  }

  Dustland.workbench = { craftSignalBeacon, craftSolarTarp, craftBandage };
  Dustland.openWorkbench = openWorkbench;
})();

(function () {
  const bus = globalThis.EventBus;
  const gs = globalThis.Dustland?.gameState;
  if (!bus || !gs?.applyPersona) return;
  const btn = document.getElementById('campBtn');
  const overlay = document.getElementById('personaOverlay');
  const list = document.getElementById('personaList');
  const closeBtn = document.getElementById('closePersonaBtn');
  const fastTravelBtn = document.getElementById('campFastTravelBtn');
  if (btn) btn.addEventListener('click', () => bus.emit('camp:open'));
  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('shown'));
  }
  if (fastTravelBtn && overlay) {
    fastTravelBtn.addEventListener('click', () => {
      if (fastTravelBtn.disabled) return;
      overlay.classList.remove('shown');
      globalThis.openWorldMap?.('camp');
    });
  }
  bus.on('camp:open', () => {
    const pos = globalThis.party;
    const map = globalThis.state?.map || 'world';
    const zones = globalThis.Dustland?.zoneEffects || [];
    if (pos) {
      for (const z of zones) {
        if(z.if && !globalThis.checkFlagCondition?.(z.if)) continue;
        if ((z.map || 'world') !== map) continue;
        if (pos.x < z.x || pos.y < z.y || pos.x >= z.x + (z.w || 0) || pos.y >= z.y + (z.h || 0)) continue;
        if (z.dry || (z.perStep?.hp < 0) || (z.step?.hp < 0)) {
          globalThis.log?.("You can't camp here.");
          return;
        }
      }
    }
    globalThis.healAll?.();
    if (fastTravelBtn) {
      const bunkers = globalThis.Dustland?.bunkers ?? [];
      const hasDestinations = bunkers.some(b => b?.active);
      fastTravelBtn.disabled = !hasDestinations;
      fastTravelBtn.title = hasDestinations ? '' : 'Activate a bunker to fast travel.';
    }
    if (Array.isArray(pos)) {
      for (const m of pos) {
        if (typeof m.hydration === 'number') m.hydration = 2;
      }
    }
    globalThis.updateHUD?.();
    globalThis.log?.('You rest until healed.');
    const ensurePartyState = () => {
      const state = gs.getState?.();
      if (!state) return null;
      if ((!Array.isArray(state.party) || !state.party.length) && Array.isArray(globalThis.party)) {
        gs.updateState?.(s => { s.party = globalThis.party; });
      }
      return gs.getState?.() || state;
    };
    const state = ensurePartyState() || {};
    const member = state.party?.[0] ?? globalThis.party?.[0];
    if (!member?.id || !overlay || !list) return;
    const personas = state.personas || {};
    const ids = Object.keys(personas);
    const currentId = member.persona;
    list.innerHTML = '';
    if (currentId && typeof gs.clearPersona === 'function') {
      const unequip = document.createElement('button');
      unequip.className = 'btn';
      unequip.dataset.action = 'unequip';
      unequip.textContent = 'Unequip mask';
      unequip.addEventListener('click', () => {
        overlay.classList.remove('shown');
        gs.clearPersona(member.id);
      }, { once: true });
      list.appendChild(unequip);
    }
    if (!ids.length) {
      const msg = document.createElement('div');
      msg.className = 'muted';
      msg.textContent = 'No masks available';
      list.appendChild(msg);
    } else {
      ids.forEach(id => {
        const data = personas[id] || {};
        const card = document.createElement('div');
        card.className = 'persona-card';
        const title = document.createElement('div');
        title.className = 'persona-title';
        title.textContent = data.label || id;
        card.appendChild(title);
        if (data.portraitPrompt) {
          const prompt = document.createElement('p');
          prompt.className = 'persona-prompt';
          prompt.textContent = data.portraitPrompt;
          card.appendChild(prompt);
        }
        const mods = data.mods;
        if (mods && typeof mods === 'object') {
          const entries = Object.entries(mods).filter(([, value]) => typeof value === 'number' && value !== 0);
          if (entries.length) {
            const listEl = document.createElement('ul');
            listEl.className = 'persona-mods';
            for (const [stat, value] of entries) {
              const item = document.createElement('li');
              const prefix = value > 0 ? '+' : '';
              item.textContent = `${prefix}${value} ${stat}`;
              listEl.appendChild(item);
            }
            card.appendChild(listEl);
          }
        }
        if (currentId === id) {
          const status = document.createElement('div');
          status.className = 'persona-status';
          status.textContent = 'Currently equipped';
          card.appendChild(status);
        }
        const b = document.createElement('button');
        b.className = 'btn';
        b.dataset.personaId = id;
        if (currentId === id) {
          b.textContent = 'Equipped';
          b.disabled = true;
        } else {
          b.textContent = 'Equip mask';
          b.addEventListener('click', () => {
            overlay.classList.remove('shown');
            gs.applyPersona(member.id, id);
          }, { once: true });
        }
        card.appendChild(b);
        list.appendChild(card);
      });
    }
    overlay.classList.add('shown');
  });
})();

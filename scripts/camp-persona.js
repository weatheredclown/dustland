(function () {
  const bus = globalThis.EventBus;
  const gs = globalThis.Dustland?.gameState;
  if (!bus || !gs?.applyPersona) return;
  const btn = document.getElementById('campBtn');
  if (btn) btn.addEventListener('click', () => bus.emit('camp:open'));
  bus.on('camp:open', () => {
    const state = gs.getState?.() || {};
    const member = state.party && state.party[0];
    if (!member) return;
    const ids = Object.keys(state.personas || {});
    if (!ids.length) return;
    const choice = prompt(`Equip persona for ${member.name}`, ids.join(','));
    if (choice && state.personas[choice]) gs.applyPersona(member.id, choice);
  });
})();

(function () {
  const bus = globalThis.EventBus;
  const gs = globalThis.Dustland?.gameState;
  if (!bus || !gs?.applyPersona) return;
  const btn = document.getElementById('campBtn');
  if (btn) btn.addEventListener('click', () => bus.emit('camp:open'));
  bus.on('camp:open', () => {
    const pos = globalThis.party;
    const map = globalThis.state?.map || 'world';
    const zones = globalThis.Dustland?.zoneEffects || [];
    if (pos) {
      for (const z of zones) {
        if ((z.map || 'world') !== map) continue;
        if (pos.x < z.x || pos.y < z.y || pos.x >= z.x + (z.w || 0) || pos.y >= z.y + (z.h || 0)) continue;
        if (z.dry || (z.perStep?.hp < 0) || (z.step?.hp < 0)) {
          globalThis.log?.("You can't camp here.");
          return;
        }
      }
    }
    globalThis.healAll?.();
    if (Array.isArray(pos)) {
      for (const m of pos) {
        if (typeof m.hydration === 'number') m.hydration = 2;
      }
    }
    globalThis.updateHUD?.();
    globalThis.log?.('You rest until healed.');
    const state = gs.getState?.() || {};
    const member = state.party && state.party[0];
    if (!member) return;
    const ids = Object.keys(state.personas || {});
    if (!ids.length) return;
    const choice = prompt(`Equip persona for ${member.name}`, ids.join(','));
    if (choice && state.personas[choice]) gs.applyPersona(member.id, choice);
  });
})();

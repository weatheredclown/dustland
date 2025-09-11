(function(){
  if(!globalThis.Dustland) globalThis.Dustland = {};
  const gs = globalThis.Dustland.gameState;
  const bus = globalThis.EventBus;
  if(!gs?.setPersona || !bus?.on) return;
  const templates = {
    'mara.masked': { id: 'mara.masked', label: 'Masked Mara', portrait: 'assets/portraits/hidden_hermit_4.png', mods: { AGI: 1 } },
    'jax.patchwork': { id: 'jax.patchwork', label: 'Patchwork Jax', portrait: 'assets/portraits/iron_brute_4.png', mods: { STR: 1 } },
    'nyx.veiled': { id: 'nyx.veiled', label: 'Veiled Nyx', portrait: 'assets/portraits/nora_4.png', mods: { INT: 1 } }
  };
  globalThis.Dustland.personaTemplates = templates;
  bus.on('item:picked', it => {
    const tags = Array.isArray(it?.tags) ? it.tags.map(t => t.toLowerCase()) : [];
    if(!tags.includes('mask')) return;
    const pid = it.persona;
    const p = templates[pid];
    if(pid && p) gs.setPersona(pid, p);
  });
})();

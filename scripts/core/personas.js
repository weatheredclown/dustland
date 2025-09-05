(function(){
  if(!globalThis.Dustland) globalThis.Dustland = {};
  const setPersona = globalThis.Dustland.gameState?.setPersona;
  if(typeof setPersona !== 'function') return;
  const personas = [
    { id: 'mara.masked', label: 'Masked Mara', portrait: 'assets/portraits/hidden_hermit_4.png', mods: { AGI: 1 } },
    { id: 'jax.patchwork', label: 'Patchwork Jax', portrait: 'assets/portraits/iron_brute_4.png', mods: { STR: 1 } },
    { id: 'nyx.veiled', label: 'Veiled Nyx', portrait: 'assets/portraits/nora_4.png', mods: { INT: 1 } }
  ];
  personas.forEach(p => setPersona(p.id, p));
})();

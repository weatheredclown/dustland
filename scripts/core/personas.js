(function(){
  if(!globalThis.Dustland) globalThis.Dustland = {};
  const gs = globalThis.Dustland.gameState;
  const bus = globalThis.EventBus;
  if(!gs?.setPersona || !bus?.on) return;
  const templates = {
    'mara.masked': {
      id: 'mara.masked',
      label: 'Masked Mara',
      portrait: 'assets/portraits/dustland-module/hidden_hermit_4.png',
      portraitPrompt: 'Cinematic digital painting of Mara, a weathered navigator in scavenged desert armor, wearing a cracked porcelain mask with thin gold inlay, warm campfire lighting, windswept hair, determined expression, post-apocalyptic wasteland backdrop.',
      mods: { AGI: 1 }
    },
    'jax.patchwork': {
      id: 'jax.patchwork',
      label: 'Patchwork Jax',
      portrait: 'assets/portraits/dustland-module/iron_brute_4.png',
      portraitPrompt: 'Gritty concept art portrait of Jax, a muscular scavenger with a patchwork mask welded from mismatched metal plates, neon welding glow reflections, improvised armor straps, cybernetic arm details, ruined factory background, dramatic rim lighting.',
      mods: { STR: 1 }
    },
    'nyx.veiled': {
      id: 'nyx.veiled',
      label: 'Veiled Nyx',
      portrait: 'assets/portraits/dustland-module/nora_4.png',
      portraitPrompt: 'Moody illustration of Nyx, a lithe mystic draped in layered dusk-blue robes, translucent veil mask stitched with glowing threads, bioluminescent tattoos, twilight storm clouds behind her, soft moonlit highlights, enigmatic calm expression.',
      mods: { INT: 1 }
    }
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

(function () {
  if (!globalThis.Dustland) globalThis.Dustland = {};
  const dustland = globalThis.Dustland;
  const gs = dustland.gameState;
  const bus = dustland.eventBus || globalThis.EventBus;
  if (typeof gs?.setPersona !== 'function') return;
  if (typeof bus?.on !== 'function') return;

  const templates: Record<string, DustlandPersonaTemplate> = {
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

  dustland.personaTemplates = templates;

  interface PersonaItemPayload {
    tags?: string[];
    persona?: string;
  }

  bus.on('item:picked', (payload: unknown) => {
    const item = payload as PersonaItemPayload | undefined;
    const tags = Array.isArray(item?.tags)
      ? item.tags
        .map(tag => (typeof tag === 'string' ? tag.toLowerCase() : ''))
        .filter(Boolean)
      : [];
    if (!tags.includes('mask')) return;

    const personaId = typeof item?.persona === 'string' ? item.persona : undefined;
    if (!personaId) return;

    const template = templates[personaId];
    if (template) gs.setPersona(personaId, template);
  });
})();

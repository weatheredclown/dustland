// Injects inline SVG <symbol> defs for player/NPC glyphs.
// Plain JS, global export: ensureSpriteDefsInjected()
// No fetches; embeds the sprite content directly.

declare global {
  interface Window {
    ensureSpriteDefsInjected?: () => void;
  }
}

(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  function ensureSpriteDefsInjected(): void {
    const existing = document.getElementById('svg-sprite-defs');
    if (existing) return;
    const container = document.createElement('div');
    container.id = 'svg-sprite-defs';
    container.setAttribute('aria-hidden', 'true');
    container.style.position = 'absolute';
    container.style.width = '0';
    container.style.height = '0';
    container.style.overflow = 'hidden';
    container.innerHTML = spriteMarkup;
    (document.body ?? document.documentElement).appendChild(container);
  }

  // Embedded copy of assets/glyphs/sprites.svg
  const spriteMarkup = /* html */ `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs>
    <style>
      .line{fill:none;stroke:#222;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .silhouette{fill:#5e5ce6}
      .teal{fill:#66c2a5}
      .purple{fill:#9b59b6}
      .gold{fill:#f4c542}
      .steel{fill:#7f8c8d}
      .shadow{fill:#2c3e50;opacity:.15}
    </style>
  </defs>
  <symbol id="glyph-player" viewBox="0 0 32 32">
    <ellipse cx="16" cy="24" rx="8" ry="3" class="shadow"/>
    <circle cx="16" cy="7" r="3.5" class="gold"/>
    <path d="M10 12 L22 12 L20 20 L12 20 Z" class="teal"/>
    <path d="M12 12 L19 20" class="line"/>
    <path d="M10 13 L7 16 M22 13 L25 16" class="line"/>
    <path d="M14 20 L12 27 M18 20 L20 27" class="line"/>
  </symbol>
  <symbol id="glyph-npc" viewBox="0 0 32 32">
    <ellipse cx="16" cy="24" rx="8" ry="3" class="shadow"/>
    <circle cx="16" cy="7" r="3.5" class="gold"/>
    <path d="M10 12 L22 12 L21 20 L11 20 Z" class="purple"/>
    <path d="M10 13 L7 16 M22 13 L25 16" class="line"/>
    <path d="M14 20 L13 27 M18 20 L19 27" class="line"/>
  </symbol>
  <symbol id="glyph-npc-merchant" viewBox="0 0 32 32">
    <ellipse cx="16" cy="24" rx="8" ry="3" class="shadow"/>
    <circle cx="16" cy="7" r="3.5" class="gold"/>
    <path d="M10 12 L22 12 L21 20 L11 20 Z" class="purple"/>
    <path d="M10 13 L7 16 M22 13 L25 16" class="line"/>
    <path d="M14 20 L13 27 M18 20 L19 27" class="line"/>
    <circle cx="24.5" cy="19" r="2.2" class="gold"/>
    <path d="M24.5 16 L24.5 18.2" class="line"/>
  </symbol>
  <symbol id="glyph-npc-guard" viewBox="0 0 32 32">
    <ellipse cx="16" cy="24" rx="8" ry="3" class="shadow"/>
    <circle cx="16" cy="7" r="3.5" class="gold"/>
    <path d="M10 12 L22 12 L21 20 L11 20 Z" class="purple"/>
    <path d="M10 13 L7 16 M22 13 L25 16" class="line"/>
    <path d="M14 20 L13 27 M18 20 L19 27" class="line"/>
    <path d="M7 17 L10 16 L12 18 L10 22 L7 21 Z" class="steel"/>
    <path d="M7 17 L10 16 L12 18 L10 22 L7 21 Z" class="line"/>
  </symbol>
  <symbol id="glyph-npc-villager" viewBox="0 0 32 32">
    <ellipse cx="16" cy="24" rx="8" ry="3" class="shadow"/>
    <circle cx="16" cy="7.5" r="3.3" class="gold"/>
    <path d="M12.5 6.5 Q16 4.5 19.5 6.5 L20.5 7.5 Q17.2 6 12.5 6.5 Z" class="steel"/>
    <path d="M13 8 L19 8" class="line"/>
    <path d="M10 12 L22 12 L21 20 L11 20 Z" class="purple"/>
    <path d="M10 13 L7 16 M22 13 L25 16" class="line"/>
    <path d="M14 20 L13 27 M18 20 L19 27" class="line"/>
  </symbol>
  <symbol id="glyph-player-24" viewBox="0 0 24 24">
    <ellipse cx="12" cy="18" rx="6" ry="2.5" class="shadow"/>
    <circle cx="12" cy="5.5" r="2.8" class="gold"/>
    <path d="M7.5 9 L16.5 9 L15.2 15 L8.8 15 Z" class="teal"/>
    <path d="M8 9 L13.5 15" class="line"/>
    <path d="M7.5 10 L5.5 12.5 M16.5 10 L18.5 12.5" class="line"/>
    <path d="M10 15 L8.8 20.5 M14 15 L15.2 20.5" class="line"/>
  </symbol>
</svg>`;

  window.ensureSpriteDefsInjected = ensureSpriteDefsInjected;
})();

export {};

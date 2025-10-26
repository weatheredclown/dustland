// Glyph helpers for Dustland entities.
// Plain JS globals: window.dustlandGlyphs

interface GlyphEntityLike {
  role?: string | null;
  type?: string | null;
}

type GlyphFacing = string | null | undefined;

interface DustlandGlyphsApi {
  glyphIdForEntity(entity?: GlyphEntityLike | null): string;
  createGlyphNode(entity: GlyphEntityLike | null | undefined, size: number): SVGSVGElement;
  updateGlyphTransform(node: SVGSVGElement, x: number, y: number, size: number, facing?: GlyphFacing): void;
}

interface Window {
  dustlandGlyphs: DustlandGlyphsApi;
}

(function () {
  function glyphIdForEntity(entity?: GlyphEntityLike | null): string {
    const role = entity?.role ?? entity?.type ?? 'npc';
    if (role === 'player') return 'glyph-player';
    if (role === 'merchant') return 'glyph-npc-merchant';
    if (role === 'guard') return 'glyph-npc-guard';
    if (role === 'villager') return 'glyph-npc-villager';
    return 'glyph-npc';
  }

  function createGlyphNode(entity: GlyphEntityLike | null | undefined, size: number): SVGSVGElement {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.style.position = 'absolute';
    svg.style.imageRendering = 'pixelated';

    const use = document.createElementNS(ns, 'use');
    // href in the SVG namespace (modern browsers). xlink is deprecated, but we keep it for broad compat.
    const glyphId = `#${glyphIdForEntity(entity)}`;
    use.setAttribute('href', glyphId);
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', glyphId);
    svg.appendChild(use);
    return svg;
  }

  function updateGlyphTransform(
    node: SVGSVGElement,
    x: number,
    y: number,
    size: number,
    facing?: GlyphFacing
  ): void {
    const tx = Math.round(x * size);
    const ty = Math.round(y * size);
    const flipped = facing === 'W' || facing === 'left';
    node.style.transformOrigin = 'center';
    node.style.transform = `translate(${tx}px,${ty}px)${flipped ? ' scaleX(-1)' : ''}`;
  }

  const dustlandGlyphs: DustlandGlyphsApi = {
    glyphIdForEntity,
    createGlyphNode,
    updateGlyphTransform
  };

  const globalScope = globalThis as typeof globalThis & { dustlandGlyphs?: DustlandGlyphsApi };
  globalScope.dustlandGlyphs = dustlandGlyphs;
})();


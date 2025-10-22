// @ts-nocheck
// Glyph helpers for Dustland entities.
// Plain JS globals: window.dustlandGlyphs

(function () {
  function glyphIdForEntity(entity) {
    var role = (entity?.role ?? entity?.type ?? 'npc');
    if (role === 'player') return 'glyph-player';
    if (role === 'merchant') return 'glyph-npc-merchant';
    if (role === 'guard') return 'glyph-npc-guard';
    if (role === 'villager') return 'glyph-npc-villager';
    return 'glyph-npc';
  }

  function createGlyphNode(entity, size) {
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.style.position = 'absolute';
    svg.style.imageRendering = 'pixelated';
    var use = document.createElementNS(ns, 'use');
    // href in the SVG namespace (modern browsers). xlink is deprecated, but we keep it for broad compat.
    use.setAttribute('href', '#' + glyphIdForEntity(entity));
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + glyphIdForEntity(entity));
    svg.appendChild(use);
    return svg;
  }

  function updateGlyphTransform(node, x, y, size, facing) {
    var tx = Math.round(x * size);
    var ty = Math.round(y * size);
    var flipped = (facing === 'W' || facing === 'left');
    node.style.transformOrigin = 'center';
    node.style.transform = 'translate(' + tx + 'px,' + ty + 'px)' + (flipped ? ' scaleX(-1)' : '');
  }

  window.dustlandGlyphs = {
    glyphIdForEntity: glyphIdForEntity,
    createGlyphNode: createGlyphNode,
    updateGlyphTransform: updateGlyphTransform
  };
})();


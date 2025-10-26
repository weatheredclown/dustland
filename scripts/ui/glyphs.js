// Glyph helpers for Dustland entities.
// Plain JS globals: window.dustlandGlyphs
(function () {
    function glyphIdForEntity(entity) {
        const role = entity?.role ?? entity?.type ?? 'npc';
        if (role === 'player')
            return 'glyph-player';
        if (role === 'merchant')
            return 'glyph-npc-merchant';
        if (role === 'guard')
            return 'glyph-npc-guard';
        if (role === 'villager')
            return 'glyph-npc-villager';
        return 'glyph-npc';
    }
    function createGlyphNode(entity, size) {
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
    function updateGlyphTransform(node, x, y, size, facing) {
        const tx = Math.round(x * size);
        const ty = Math.round(y * size);
        const flipped = facing === 'W' || facing === 'left';
        node.style.transformOrigin = 'center';
        node.style.transform = `translate(${tx}px,${ty}px)${flipped ? ' scaleX(-1)' : ''}`;
    }
    const dustlandGlyphs = {
        glyphIdForEntity,
        createGlyphNode,
        updateGlyphTransform
    };
    const globalScope = globalThis;
    globalScope.dustlandGlyphs = dustlandGlyphs;
})();

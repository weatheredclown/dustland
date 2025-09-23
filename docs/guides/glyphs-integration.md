# Glyphs Integration Guide

This wires the 90s-inspired SVG glyphs into Dustland without any runtime fetches and keeps to plain JavaScript + globals.

## Files
- `assets/glyphs/sprites.svg` — symbol sprite sheet (reference only)
- `scripts/supporting/svg-sprite.js` — injects inline `<symbol>` defs at boot
- `scripts/ui/glyphs.js` — helpers to create and position glyph nodes

## Include at boot
Add these `<script>` tags before your engine initializes:

```html
<script src="scripts/supporting/svg-sprite.js"></script>
<script src="scripts/ui/glyphs.js"></script>
<script>ensureSpriteDefsInjected();</script>
```

## Render entities
Use the global `dustlandGlyphs` helper to create and position nodes.

```js
// on entity spawn
var size = window.TILE_SIZE ?? 32;
var node = window.dustlandGlyphs.createGlyphNode(entity, size);
node.dataset.eid = entity.id;
entity.domNode = node;
document.getElementById('entities-layer').appendChild(node);
window.dustlandGlyphs.updateGlyphTransform(node, entity.x, entity.y, size, entity.facing);

// on move / facing change
window.dustlandGlyphs.updateGlyphTransform(entity.domNode, entity.x, entity.y, size, entity.facing);

// on despawn
entity.domNode?.remove();
entity.domNode = null;
```

## Role → glyph mapping
`glyphIdForEntity(entity)` uses `entity.role ?? entity.type` to pick:
- `player` → `glyph-player`
- `merchant` → `glyph-npc-merchant`
- `guard` → `glyph-npc-guard`
- `villager` → `glyph-npc-villager`
- default → `glyph-npc`

## Notes
- You can recolor via overriding `.teal`, `.purple`, `.gold`, `.steel` classes in CSS.
- All glyphs use `viewBox="0 0 32 32"` and scale cleanly to your tile size.

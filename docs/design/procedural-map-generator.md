# Procedural Map Generator

*By Priya "Gizmo" Sharma*
*Date: 2025-09-04*
*Status: Draft*

> **Gizmo:** Clean pipelines make happy wastelanders. Let's build a map generator that's as modular as the rest of our toolkit.

## Summary

Seeded 2D map generator that layers noise and region growth to draw terrain, water, roads, and ruins with our existing tile palette. The generator outputs plain JSON the engine can load directly and exposes tuning knobs—seed, scale, and optional radial falloff—through the Adventure Kit so designers can iterate without leaving the editor.

## Goals

- Deterministic output from a seed for reproducible worlds.
- Modular stages that can be swapped or tuned independently.
- Plain JavaScript implementation with globals and no build step.
- Configurable via parameters; no external authoring required.
- Fast enough to generate a small map (<1s) in browser or Node.
- Uses only current tiles (terrain, water, road, ruins); no new biomes.

## Non-Goals

- Infinite or streaming worlds.
- True 3D terrain or complex physics.
- Networked synchronization of generated maps.

## Algorithm Overview

1. **Height field** – Generate a Simplex-noise height map, optionally subtracting a radial falloff to bias edges toward water, then convert elevations into water, sand, brush, or rock tiles.
2. **Tile refinement** – Grow land regions and smooth stray cells with cellular automata.
3. **Road graph** – Connect region centers with a minimum spanning tree; jitter paths with midpoint displacement or a random-walk carve. If only one land region exists, split the map into quadrants to seed multiple centers so roads still appear on contiguous terrain.
4. **Ruin placement** – Scatter ruin tiles using Poisson-disk sampling and eligibility rules.
5. **Export** – Emit a JSON tile map plus road and feature metadata.

## Data Flow

```
seed → height field → tiles → regions → roads → ruins → map data
```

- **Inputs:** seed, config (size, scale, radial falloff, thresholds, feature toggles).
- **Outputs:** tile grid, region list, road list, feature list.

## Research Notes

Insights pulled from accessible community tutorials and open-source repos:

- **Amit Patel's mapgen2** – uses Poisson-disc sampling and Voronoi meshes for organic coastlines.
- **Shubhayu15's Pygame maze demo** – shows seed-based recursive backtracking for deterministic path layouts.
- **Martin O'Leary's terrain code** – demonstrates fantasy map generation with D3-driven rendering.
- **Azgaar's Fantasy Map Generator** – open-source web app showcasing layered Voronoi-based worlds.

## Integration

- An Adventure Kit module's `postLoad` registers a `generateMap` action so the editor's **Generate** button calls it directly, replacing the current map without loading `map.json`.
- The Adventure Kit UI exposes seed, size, radial falloff, and feature toggles so teams can reroll maps on the fly.
- Modules persist their seed and config so rerolls reproduce the same layout.
- Test helpers can inject a fixed seed to validate outputs.
- Results apply directly to the in-memory map; exporting to `map.json` is optional for saved assets.

## Implementation Tasks

### Height Field
- [x] Implement `generateHeightField(seed, size, scale, falloff = 0)` using Simplex noise.
- [x] Optionally apply a radial falloff (0–1) to push shoreline tiles toward water.
- [x] Convert heights into water, sand, brush, or rock tiles based on thresholds.

### Tile Refinement
- [x] Smooth stray cells and grow land regions with cellular automata.

### Road Graph
- [x] Connect region centers with a minimum spanning tree.
- [x] Carve jittered paths via midpoint displacement or random walk and convert to road tiles.
- [x] When only one land region is detected, subdivide it into quadrants so roads generate even on fully connected land.

### Ruin Placement
- [x] Use Poisson-disk sampling to scatter ruin tiles while honoring spacing and terrain rules.

### Export
- [x] Serialize tile grid, regions, roads, and features to `map.json`.

### Adventure Kit
- [ ] Hook generator into a module `postLoad` and extend the existing **Generate** button to call it.
- [ ] Surface seed, size, radial falloff, and feature toggles in the Adventure Kit UI.
- [ ] Persist seed and config so rerolls reproduce the same map.
- [ ] Add a **Regenerate** button that rebuilds the map without refreshing.
- [ ] Write tests to ensure deterministic regeneration through the kit.

## Risks & Mitigations

- **Repetition from poor seeds:** expose reseed option; allow seed overrides.
- **Slow generation on low-end devices:** keep algorithms O(n) over grid; avoid recursion.
- **Disconnected regions:** run post-process check; add bridging roads if needed.

## Open Questions

- Should we support save/load of entire map seeds for sharing?
- Do we need finer control over ruin density or additional biomes?

## References

- Amit Patel's mapgen2 – https://github.com/amitp/mapgen2
- Shubhayu15's Procedural-Map-2D-Generation-using-PYGAME – https://github.com/Shubhayu15/Procedural-Map-2D-Generation-using-PYGAME
- Martin O'Leary's terrain – https://github.com/mewo2/terrain
- Azgaar's Fantasy Map Generator – https://github.com/Azgaar/Fantasy-Map-Generator

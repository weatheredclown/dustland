# Procedural Map Generator

*By Priya "Gizmo" Sharma*
*Date: 2025-09-04*
*Status: Draft*

> **Gizmo:** Clean pipelines make happy wastelanders. Let's build a map generator that's as modular as the rest of our toolkit.

## Summary

Seeded 2D map generator that layers noise and region growth to draw terrain, water, roads, walls, and ruins with our existing tile palette. The generator outputs plain JSON the engine can load directly.

## Goals

- Deterministic output from a seed for reproducible worlds.
- Modular stages that can be swapped or tuned independently.
- Plain JavaScript implementation with globals and no build step.
- Configurable via parameters; no external authoring required.
- Fast enough to generate a small map (<1s) in browser or Node.
- Uses only current tiles (terrain, water, road, wall, ruins); no new biomes.

## Non-Goals

- Infinite or streaming worlds.
- True 3D terrain or complex physics.
- Networked synchronization of generated maps.

## Algorithm Overview

1. **Height field** – Generate a Simplex-noise height map blended with a radial falloff mask to bound the play area and mark water tiles.
2. **Tile refinement** – Grow land regions and smooth stray cells with cellular automata; mark walls along region edges.
3. **Road graph** – Connect region centers with a minimum spanning tree; jitter paths with midpoint displacement or a random-walk carve.
4. **Ruin placement** – Scatter ruin tiles using Poisson-disk sampling and eligibility rules.
5. **Export** – Emit a JSON tile map plus road and feature metadata.

## Data Flow

```
seed → height field → tiles → regions → roads → ruins → map.json
```

- **Inputs:** seed, config (size, thresholds, feature toggles).
- **Outputs:** tile grid, region list, road list, feature list.

## Research Notes

Insights pulled from accessible community tutorials and open-source repos:

- **Amit Patel's mapgen2** – uses Poisson-disc sampling and Voronoi meshes for organic coastlines.
- **Shubhayu15's Pygame maze demo** – shows seed-based recursive backtracking for deterministic path layouts.
- **Martin O'Leary's terrain code** – demonstrates fantasy map generation with D3-driven rendering.
- **Azgaar's Fantasy Map Generator** – open-source web app showcasing layered Voronoi-based worlds.

## Integration

- Call `generateMap(seed, config)` during startup; the engine reads the returned `map.json`.
- Optional parameters adjust noise scale and feature counts.
- Test helpers can inject a fixed seed to validate outputs.

## Risks & Mitigations

- **Repetition from poor seeds:** expose reseed option; allow seed overrides.
- **Slow generation on low-end devices:** keep algorithms O(n) over grid; avoid recursion.
- **Disconnected regions:** run post-process check; add bridging roads if needed.

## Open Questions

- Should we support save/load of entire map seeds for sharing?
- Do we need finer control over wall vs. ruin density?

## References

- Amit Patel's mapgen2 – https://github.com/amitp/mapgen2
- Shubhayu15's Procedural-Map-2D-Generation-using-PYGAME – https://github.com/Shubhayu15/Procedural-Map-2D-Generation-using-PYGAME
- Martin O'Leary's terrain – https://github.com/mewo2/terrain
- Azgaar's Fantasy Map Generator – https://github.com/Azgaar/Fantasy-Map-Generator

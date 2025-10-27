# Game Loop Control Flow

Dustland's runtime uses the `draw` function in `ts-src/scripts/dustland-engine.ts` to drive the animation loop. The sequence below summarizes how control advances through the loop and its rendering pipeline.

## Runtime stages

1. **Boot:** `bootMap()` prepares the initial grid and the engine schedules the first frame via `requestAnimationFrame(draw)`.【F:ts-src/scripts/dustland-engine.ts†L3706-L3708】
2. **Frame update (`draw`):** Each animation frame verifies that the display canvas is ready, refreshes adrenaline-driven player effects, calculates frame delta time, renders the world into the scene buffer, composites the active and previous canvases according to FX settings, triggers ambient wind-chime audio for nearby sources, and finally requests the next frame.【F:ts-src/scripts/dustland-engine.ts†L1453-L1481】【F:ts-src/scripts/dustland-engine.ts†L2102-L2117】
3. **Rendering pipeline (`render`):** Rendering resolves the active map and view dimensions, gathers entities and drops, splits them into below/above layers, iterates the `renderOrder` sequence to draw tiles, loot, portals, characters, and remote parties, then applies transient effects like loot vacuum trails, sparkles, fog of war, and the HUD frame before returning control to the main loop.【F:ts-src/scripts/dustland-engine.ts†L1592-L1850】【F:ts-src/scripts/dustland-engine.ts†L1853-L1924】

## Diagram

```mermaid
flowchart TD
  Boot[Boot sequence<br/>bootMap(); requestAnimationFrame(draw)]
  DrawStart[draw(t) called]
  Ready{Display width ≥ 16?}
  Pulse[pulseAdrenaline(t)]
  Delta[Compute dt; render(state, dt)]
  Composite[Composite scene & prev canvases<br/>apply fx + copy buffers]
  Audio[Play ambient sources on current map]
  Next[requestAnimationFrame(draw)]
  Halt[Return; wait for canvas sizing]

  Boot --> DrawStart --> Ready
  Ready -->|No| Halt
  Ready -->|Yes| Pulse --> Delta --> Composite --> Audio --> Next --> DrawStart
```

If the display canvas is narrower than 16 pixels the loop returns immediately, preventing new frames from being queued until the canvas is resized and another `requestAnimationFrame(draw)` call is issued.【F:ts-src/scripts/dustland-engine.ts†L1454-L1456】

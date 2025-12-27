# Custom Tile Assets & Painting
*Author: Priya "Gizmo" Sharma — tools engineer obsessed with clean pipelines and happy teammates.*

We want the Adventure Kit (ACK) to cover three player-facing requests at once: skin the palette with curated sprites, paint individual tiles with custom art, and let NPCs/items show bespoke tiles. This proposal merges the behaviors from PRs #1553, #1555, and #1556 into a single, storage-safe flow that never embeds base64 blobs inside module JSON.

## Implementation Status
**Complete (Implemented)**
- **Schema:** `CustomAssetMeta` and `TileOverride` types defined. `ModuleData` extended with `customAssets` and `tileOverrides`.
- **Engine:** `dustland-engine.ts` render loop updated to draw layered tile overrides with transparency support.
- **Editor:** `adventure-kit.ts` "Paint" tab implemented for uploading assets and painting them onto the map.
- **NPCs/Items:** `tileSprite` field added to NPC and Item editors, resolving to custom assets.

## Goals
- Let creators skin palette tiles globally, per-map, or per-scope (world vs. interiors) using sprite URLs.
- Support per-tile painting with uploaded art while keeping module files lean and cacheable.
- Provide uploads for NPC and item tiles that reuse the same asset manager, preview UX, and cache.
- Keep rendering deterministic: palette skins, NPC/item overrides, and per-tile paints must compose without flicker or version drift.

## Non-goals
- In-editor bitmap editing; we only upload and place finished PNGs/WebPs.
- Runtime HTTP downloads from arbitrary origins. Assets must be pre-hosted or uploaded into the project asset store during editing.

## Asset Storage & Referencing
- **Asset manager:** Add `assets/custom/` (local) or a configured bucket path for uploaded art. Each upload writes a hashed filename (`<moduleId>/<sha256>-<slug>.png`) and small manifest entry containing MIME, pixel size, and checksum.
- **References, not blobs:** Module JSON stores stable asset IDs (e.g., `customAssets[id] = { url, width, height, checksum }`). No base64 strings are persisted inside modules; the ACK copies files into the asset store and rewrites references on save.
- **Cache & eviction:** Runtime keeps an LRU of decoded images keyed by asset ID. When a module unloads, referenced assets are evicted unless still in use by another loaded module.
- **Validation:** Reject uploads above 1 MB or >1024 × 1024 px. Enforce PNG/WebP only. Manifest validation runs in the module CLI tools and ACK save pipeline.

## Schema Changes
- **Module:**
  - `customAssets: Record<string, CustomAssetMeta>` — manifest of uploaded art (module scope, de-duplicated by checksum). `CustomAssetMeta` holds `url`, `width`, `height`, `checksum`, `uploadedBy`, `uploadedAt`.
  - `tileGraphics` (from #1556) remains for palette skins: `world`, `interiors`, and optional per-map overrides map palette indices to sprite URLs/asset IDs.
  - `tileOverrides: Record<zoneId, Record<coordKey, TileOverride>>` — per-tile paints. `coordKey` is `"x,y,floor?"`. `TileOverride` has `assetId`, `opacity?`, and optional `tint?` for future tinting.
- **NPCs/items:** Add `tileSprite` to both NPC and item definitions. This field accepts either a sprite URL or a `customAssetId` referencing `customAssets`.
- **Schema enforcement:** Update JSON schema and docs to validate the new fields and ensure overrides reference assets that exist in `customAssets`.

## Editor UX (ACK)
- **Tile Graphics panel (palette skins):** Keep the #1556 panel but add a source toggle: paste URL or upload file. Upload uses the asset manager and writes `tileGraphics` entries to point at the new asset IDs. Show a swatch, pixel size, and checksum badge for reuse.
- **Per-tile Paint mode:**
  - New **Paint** tab under Assets: pick an uploaded tile (or upload inline), choose scope (world/interior/map), and paint onto the grid. Clicking a painted tile lets you swap or clear the override.
  - Brush respects collision: disallow painting on water/wall by default unless a "force" toggle is enabled for admins.
  - Undo/redo integrates with existing ACK history so paint mistakes roll back cleanly.
- **NPC/Item forms:** Replace `tileImage` data-URL fields (from #1555) with the shared upload + preview widget. The widget writes `tileSprite` to the entity, referencing a `customAssetId` or URL.
- **Asset library drawer:** Global list of uploaded assets with reuse buttons and delete (with refcount guard). Highlight assets currently used by overrides or sprites.

## Rendering Rules
- **Order of precedence:** For any tile draw: `tileOverrides` (per coordinate) > NPC/item `tileSprite` > `tileGraphics` palette skin > default atlas.
- **Caching:** The render pipeline requests resolved URLs from the asset manager, caches `ImageBitmap` per asset ID, and invalidates on module unload. Rendering falls back gracefully if an asset fails checksum or dimensions.
- **Interiors vs. world:** Overrides and palette skins are scoped separately to avoid leaking interior art onto the overworld. Per-map overrides inherit from global unless explicitly cleared.

## Save/Load & Compatibility
- **Module save:** ACK writes the manifest, copies files into the asset store, and rewrites any temp data-URLs to asset IDs before saving module JSON.
- **Runtime load:** Engine loads `customAssets` manifest first, primes caches, then applies `tileGraphics`, `tileOverrides`, and NPC/item sprites.
- **Backfill:** Existing modules without `customAssets` remain valid. If legacy `tileImage` data URLs are detected, the importer saves them as new assets and rewrites references on load.
- **Versioning:** Bump schema/engine minor version; avoid downgrades (no #1555 regression). Add migrations to remove in-module blobs when re-saving.
- **Firestore:** Asset store should support remote targets with signed URLs
- **Memory-Bound:** Cap the number of unique per-tile overrides per map to keep memory bounded (2,000 per zone)

## Tooling & Tests
- **CLI support:** Extend `scripts/module-tools` with commands to list/upload/remove assets, apply per-tile paints by coord, and audit missing/unused assets.
- **Presubmit checks:** Lint ensures `tileOverrides` reference valid coordinates and assets; size checks prevent oversized uploads. Add a test that loading a module with palette skins, per-tile paints, and NPC/item sprites renders without fetches after first load.
- **Docs:** Update Adventure Kit guide and module schema docs with examples for `customAssets`, `tileGraphics`, `tileOverrides`, and `tileSprite` usage.

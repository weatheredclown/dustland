# Dustland CRT Skin Asset Specification

*Author: Priya "Gizmo" Sharma — tools engineer keeping the UI pipelines humming.*

This document describes the art assets required to deliver a full visual skin for the Dustland CRT interface. Sizes below are minimum working resolutions; feel free to deliver higher resolution source files (2x or 4x) to support future scaling. Unless noted otherwise, assets should be provided with transparent backgrounds (PNG) and designed so they can be tinted or recolored in-engine.

## UI Structure

| Asset | Minimum Resolution | Notes |
| --- | --- | --- |
| Primary panel backdrop | 512 × 512 | Tileable texture applied to the main right-hand information panel. Include subtle edge lighting; avoid prominent seams. |
| Panel header overlay | 512 × 160 | Horizontal strip for panel headers (title area). Provide alpha for rounded corners and trim. |
| Panel body wallpaper | 512 × 512 | Soft fill for the interior of panels (behind sections). Keep contrast low so content remains legible. |
| Collapsible section background | 512 × 512 | Tileable card texture used for every section container (log, vitals, controls, etc.). Design with neutral center and slightly brighter border. |
| Section header badge | 256 × 96 | Optional flourish behind section titles. Include left-aligned accent that can accommodate uppercase text. |
| Signal log feed card | 512 × 512 | Background for the scrolling signal log. Allow for darker corners and subtle scanlines to imply depth. |
| Control tile card | 256 × 256 | Background for each control hint tile (WASD, etc.). Include a faint border and metallic highlights. |
| Tab idle state | 200 × 80 | Rounded tab background for inactive tabs. Provide separate active state (see below). |
| Tab active state | 200 × 80 | Highlighted treatment for the current tab. Keep label area centered and bright. |
| Button (default) | 240 × 80 | Primary button face with neutral state. Supply layered file so hover/pressed variations can be derived or deliver separate textures. |
| Button (hover) | 240 × 80 | Brighter version used when the button is highlighted. |
| Button (pressed) | 240 × 80 | Darkened/indented variant for active clicks. |
| Pill toggle button | 200 × 72 | Capsule-style control used for small toggles (previous/next, collapse). |
| Panel toggle chip | 96 × 96 | Small square used for the slide-out panel toggle (“☰”). Include glowing rim to make it obvious on dark backgrounds. |

## HUD & Status

| Asset | Minimum Resolution | Notes |
| --- | --- | --- |
| HUD badge background | 220 × 140 | Card backing for HP/Adrenaline/Scrap readouts. Design for stacked text. |
| HUD bar fill | 256 × 32 | Gradient or texture used inside the progress bars (HP/ADR). Provide variant for low-health pulse if desired. |
| HUD bar ghost fill | 256 × 32 | Faded “recent damage” overlay that trails behind the primary fill. |
| Weather badge | 200 × 80 | Capsule highlight for weather alerts above the vitals panel. |
| Status icon glyphs | 32 × 32 each | Optional small icons for status row (poisoned, buffed, etc.). Supply a set in monochrome for tinting. |

## Inventory & Cards

| Asset | Minimum Resolution | Notes |
| --- | --- | --- |
| Inventory slot frame | 320 × 160 | Frame for each inventory entry. Include corner flourishes and lightly textured background. |
| Quest card background | 360 × 220 | Used for quest entries; design with space for icon on left and text on right. |
| Party card background | 360 × 220 | Tileable background for party member cards in the Party tab. |
| Slot highlight (better item) | 320 × 160 | Green glow overlay when item is an upgrade. Provide as semi-transparent PNG. |
| Slot highlight (level locked) | 320 × 160 | Reddish overlay indicating lockout. |

## Windows & Overlays

| Asset | Minimum Resolution | Notes |
| --- | --- | --- |
| Modal window backdrop | 640 × 480 | Base texture applied to pop-up windows (Settings, Debug, Start, Module Loader). Deliver as 9-slice friendly asset with generous padding. |
| Modal header bar | 640 × 120 | Header strip for modal windows. Include accent line for separation. |
| Modal body fill | 640 × 480 | Subtle background for window interiors to distinguish from panel wallpaper. |
| Dialog window background | 720 × 520 | Custom shell for NPC dialog overlay. Provide matching header and body variants if needed. |
| Dialog portrait frame | 96 × 96 | Frame around NPC portraits; include inner bevel. |
| Dialog choice button | 560 × 120 | Background for selectable dialogue options (idle and hover/selected states). |
| Overlay vignette | 1920 × 1080 | Screen-wide transparent overlay to tint the world when modals are open. |
| Combat window background | 720 × 540 | Shell for the combat overlay, including outer frame and interior gradient. |
| Combat command card | 320 × 160 | Background behind combat command prompts. |
| Persona window background | 360 × 480 | Texture for persona selector panel. |
| Camp chest panel | 360 × 480 | Background for camp chest inventory panes (two panels). |
| Workbench panel | 360 × 480 | Crafting window background. |
| Shop panel (buy/sell) | 400 × 520 | Panels for the shop inventory lists. |
| Shop header strip | 640 × 120 | Header area containing shop name/scrap/timer. |

## Map & World

| Asset | Minimum Resolution | Notes |
| --- | --- | --- |
| Tile atlas | 512 × 512 minimum (64 × 64 per tile) | Provide sprites for each world tile (sand, rock, water, brush, road, ruin, wall, floor, door, building). Layout as a grid; tiles will be scaled down to 16 × 16 in-game. |
| Door highlight overlay | 64 × 64 | Optional additive overlay to draw on top of door tiles. |
| Map frame corners | 128 × 128 | Optional ornaments for the outer frame of the gameplay viewport. |
| Map frame edge | 16 × 128 | Tileable edge texture used for left/right/top/bottom borders. |

## Character & Item Icons

| Asset | Minimum Resolution | Notes |
| --- | --- | --- |
| Player icon – default | 128 × 128 | Sprite drawn at party leader position. Design to read clearly at 16 × 16 when downscaled. |
| Player icon – adrenaline | 128 × 128 | Alternate variant used when adrenaline effects trigger. |
| NPC friendly icon | 128 × 128 | Base sprite for neutral/friendly NPCs. |
| NPC hostile icon | 128 × 128 | Sprite for hostile NPCs. Consider palette swap from friendly version. |
| NPC quest giver icon | 128 × 128 | Distinctive look to highlight quest-giver characters. |
| Trainer icon | 128 × 128 | Specialty icon for skill trainers. |
| Shopkeeper icon | 128 × 128 | Unique accent for merchants. |
| Remote party icon | 128 × 128 | Ghostly silhouette representing multiplayer teammates. Include alpha for translucency. |
| Loot drop icon | 96 × 96 | Graphic for loot piles. |
| World item icon | 96 × 96 | General pickup item sprite (single item). |
| Stack/multi-drop icon | 96 × 96 | Cluster representation for multiple items in one tile. |
| Inventory item glyph set | 96 × 96 each | Optional category icons (weapon, armor, consumable, quest, junk). |

## Text & Labels

| Asset | Minimum Resolution | Notes |
| --- | --- | --- |
| Panel title accent | 480 × 120 | Underline or emblem to sit behind main panel titles. |
| Section title accent | 320 × 100 | Decorative underline for section titles. |
| HUD label chips | 200 × 80 | Background for HP/ADR labels. |
| Weather text treatment | 200 × 80 | Optional art for weather badge text. |
| Button label overlay | 240 × 80 | Emissive overlay to apply on button text. |

## Recommended Delivery

* **Format:** Layered PSD/AFDesign working files plus flattened PNG exports for the engine. PNGs should keep alpha channels intact.
* **Color palette:** Lean into dusty CRT greens and ambers by default, but design assets so tinting is possible. Avoid hard-coded text colors; text is rendered separately.
* **Padding:** Leave at least 12px safe padding around UI card edges so text and icons do not collide with decorative borders.
* **Tiling:** For backgrounds marked as tileable, ensure edges match seamlessly when repeated.
* **Nine-slice readiness:** Panels and modals are stretched; design corners with 24px (minimum) detail-safe zones.

Assets will be referenced through the new `DustlandSkin` manager. Provide a manifest (JSON or JS object) mapping each asset to its use so the skin integrator can wire the textures into the engine.

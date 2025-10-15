# Dustland Skin Prompt Feasibility Audit

## Scope
This audit reviews the prompts defined in the sample skin style plan to identify assets that a baseline Stable Diffusion 3.5 run is unlikely to render in an engine-ready state without additional controls or post-production work.

## Infeasible assets
| Slot | Dimensions | Prompt summary | Why the prompt is infeasible |
| --- | --- | --- | --- |
| `tile_atlas` | 512×512 | Requests a sprite sheet composed of individual 64×64 terrain tiles (sand, rock, water, brush, road, ruin, wall, floor, door, building). | Stable Diffusion models struggle to honor strict grid layouts; cells bleed together, seams misalign, and required tiles are often missing or duplicated. A single diffusion pass rarely yields the ten clean tiles the engine expects. |
| `status_icon_glyphs` | 256×32 | Asks for a row of small monochrome status icons. | The aspect ratio implies eight tightly packed 32×32 glyphs. Diffusion tends to blend adjacent icons, distort silhouettes, and lose monochrome contrast at that scale, making individual glyphs unreadable after downscaling. |
| `inventory_glyph_set` | 480×96 | Calls for a set of glyphs for weapon, armor, consumable, quest, and junk categories. | Similar to the status row, the prompt relies on a single render to deliver five category icons with recognizable metaphors. Diffusion frequently merges elements or inserts text, so multiple separate generations (one per icon) are required to hit the mark. |

## Recommendations
* Break multi-sprite requests (`tile_atlas`, glyph rows) into per-tile/per-icon prompts so each render can be guided, reviewed, and upscaled independently.
* Consider ControlNet grid guides or vector overpainting pipelines if we must keep sprite sheets in a single pass; otherwise, prefer assembling atlases manually from individually validated tiles.

# ComfyUI batch workflow for Dustland game art

This guide explains how to install the Dustland custom nodes for ComfyUI and
use the accompanying workflow to batch-generate in-game art directly from a
JSON specification.

## What the workflow does

The workflow pairs two custom nodes:

- **Dustland Game Asset JSON Loader** parses a JSON document describing each
  asset you want to render. Every record may contain its own prompt, negative
  prompt, output filename, sampler, scheduler, resolution, CFG scale, steps,
  and seed. Defaults can be supplied in the node UI for any field that is not
  specified per asset.
- **Dustland Game Asset Batch Renderer** feeds each normalized asset into the
  standard Stable Diffusion sampling path and saves every image using the
  provided `name` field as the filename prefix. A preview of the first render
  is wired to ComfyUI's `PreviewImage` node so you can confirm the batch
  started successfully.

By combining these nodes you can take the JSON exported by the Dustland
adventure builder (or any AI planning pass) and generate all art for a module
in one run.

## Files in this repository

| File | Purpose |
| --- | --- |
| `scripts/comfyui/game_asset_batch_nodes.py` | Custom ComfyUI nodes that power the workflow. Copy this file into your ComfyUI `custom_nodes` directory. |
| `docs/examples/comfyui-game-asset-workflow.json` | A ready-to-import workflow that wires the custom nodes together. |
| `docs/examples/game_asset_batch.json` | Sample asset description demonstrating the JSON schema. |

## JSON schema

Each asset entry may include the following fields:

| Field | Required | Description |
| --- | --- | --- |
| `name` | No | Filename prefix. Defaults to `asset_###` when omitted. |
| `prompt` | Yes | Positive text prompt used for CLIP encoding. |
| `negative_prompt` | No | Asset-specific negative prompt. |
| `width` / `height` | No | Resolution in pixels. Falls back to the loader defaults. |
| `steps` | No | Number of sampling steps. |
| `cfg_scale` | No | CFG scale value. |
| `sampler` | No | Name of the sampler (for example `euler`, `dpmpp_2m`). |
| `scheduler` | No | Scheduler to use (for example `normal`, `karras`). |
| `seed` | No | Seed value; random when omitted. |

Place the JSON file inside ComfyUI's `input` directory or paste its contents
into the loader node. The sample in [`docs/examples/game_asset_batch.json`](../examples/game_asset_batch.json)
contains two assets you can experiment with immediately.

## Installation and usage

1. Copy `game_asset_batch_nodes.py` into your ComfyUI installation under
   `custom_nodes/dustland_game_assets/` (or another folder of your choice).
   Restart ComfyUI so it discovers the new nodes.
2. Download `comfyui-game-asset-workflow.json` and import it through the
   ComfyUI sidebar (`Load` → `Workflow`).
3. Place your asset JSON file inside ComfyUI's `input` directory. Update the
   **JSON Loader** node's `json_source` field to either the filename or paste
   the JSON directly.
4. Select your preferred base checkpoint on the **Checkpoint Loader** node.
5. (Optional) Enter a base negative prompt and adjust the preview limit on the
   **Batch Renderer** node.
6. Queue the workflow. ComfyUI will iterate every entry, render it, and save
   each image using the provided filename prefix. The renderer's second output
   lists all filenames saved during the run.

## Tips

- Combine the base negative prompt with asset-level negatives for consistent
  style control.
- To create pixel-art sprites, choose checkpoints or LoRAs trained for pixel
  aesthetics and set the resolution to multiples of your target tile size.
- Because assets may have different dimensions, the preview only shows the
  first image rendered. Review the saved files for the complete batch.
- When running very large batches, use ComfyUI's queue controls to pause or
  resume without reloading the JSON.

With this workflow, any JSON-driven content plan can quickly become a full set
of module-ready graphics.

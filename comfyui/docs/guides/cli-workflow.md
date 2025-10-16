# CLI Workflow for Skin Generation

This guide explains how to use the command-line interface (CLI) to generate a complete set of UI skin assets for Dustland. This is the recommended method for generating skins, as the ComfyUI web interface is not designed to handle the batch processing required for this task.

## Overview

The skin generation process uses a Python script, `comfyui/scripts/run-skin-workflow.py`, to execute a ComfyUI workflow template (`.json`) with a skin style plan (`.json`). The script programmatically loads the workflow, injects the style plan, and then queues the prompt to the ComfyUI server. The script then waits for the server to finish generating all the images.

## Prerequisites

- **ComfyUI Server**: You must have a ComfyUI server running and accessible. By default, the script assumes the server is at `http://127.0.0.1:8188`.
- **Python Dependencies**: You need to have the required Python libraries installed. You can install them with pip:
  ```bash
  pip install websocket-client
  ```
- **Custom Nodes**: The Dustland custom nodes must be installed in your ComfyUI `custom_nodes` directory. You can do this by running the `comfyui/scripts/install-comfyui-nodes.sh` script from the root of this repository.

## Usage

You can run the script from the root of the repository as follows:

```bash
python comfyui/scripts/run-skin-workflow.py <path_to_style_plan.json>
```

The workflow template is optional. If you omit it, the script uses its built-in single-asset workflow that mirrors the template shipped with this repository. To provide a custom template, pass it as the first positional argument:

```bash
python comfyui/scripts/run-skin-workflow.py <path_to_workflow.json> <path_to_style_plan.json>
```

### Arguments

- `workflow_file`: (Optional) The path to the ComfyUI workflow JSON file. An example is provided at `comfyui/examples/comfyui-skin-style-workflow.json`.
- `style_plan_file`: The path to the skin style plan JSON file. An example is provided at `comfyui/examples/skin_style_plan.json`.
- `--host`: (Optional) The hostname of the ComfyUI server. Defaults to `127.0.0.1`.
- `--port`: (Optional) The port number of the ComfyUI server. Defaults to `8188`.
- `--force-regen`: (Optional) Regenerate PNGs even if they already exist on disk. By default the CLI now skips any assets that
  are already present so you can incrementally fill in missing renders without wasting compute time.

### Example

To run the example workflow with the example style plan, use the following command:

```bash
python comfyui/scripts/run-skin-workflow.py comfyui/examples/comfyui-skin-style-workflow.json comfyui/examples/skin_style_plan.json
```

The script will then connect to the ComfyUI server, queue the prompt, and print progress messages to the console. When each asset finishes rendering, the CLI downloads the resulting PNG into the directory provided by `--output-dir` (default `ComfyUI/output`).

The generator now renders UI textures at a super-sampled resolution before downscaling to the target `width`/`height`. Plan
fields such as `render_scale`, `min_render_size`, and `max_render_size` control this oversampling step and appear in the CLI
output so you can confirm which assets are rendered above their final size.【F:comfyui/scripts/run-skin-workflow.py†L538-L632】

> **Automatic slot discovery**: the CLI now scans the repository for `data-skin-slot` attributes before the run. Any new UI slots
> automatically add placeholder entries to the generation plan so fresh Dustland builds pick up new background or overlay assets
> without manual bookkeeping. You can still provide explicit overrides in your style plan JSON to customise prompts, sizes, or
> filenames for specific slots.

## Previewing the skin inside Dustland

The CLI now prints the relative skin directories alongside a helper call to `Dustland.skin.loadGeneratedSkin()`. Previewing a render no longer requires manifest files or script tags. Instead:

1. Double-click `dustland.html` to open it directly in your browser.
2. Open **Settings**, type the style ID reported by the CLI (for example `emerald-grid`), then press **Enter** or click **Load Skin**.
3. Alternatively, paste one of the console snippets the CLI prints. Each snippet simply points the skin manager at your output directory:

   ```js
   Dustland.skin.loadGeneratedSkin('emerald-grid', {
     baseDir: 'ComfyUI/output',
     styleDir: 'emerald-grid'
   });
   // Shortcut helper when using the default output path:
   loadSkin('emerald-grid');
   ```

Generated PNGs are grouped under `ComfyUI/output/<style-id>/`. The CLI writes each slot as `<slot-name>.png`, so the game can look up terrain and UI art by combining the selected skin ID with the expected filename (for example `emerald-grid/tile_sand.png`). No additional manifest files are required—the in-game Tile Preview resolves the same filenames you would ship with the skin.

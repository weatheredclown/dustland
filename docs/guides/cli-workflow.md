# CLI Workflow for Skin Generation

This guide explains how to use the command-line interface (CLI) to generate a complete set of UI skin assets for Dustland. This is the recommended method for generating skins, as the ComfyUI web interface is not designed to handle the batch processing required for this task.

## Overview

The skin generation process uses a Python script, `scripts/run-skin-workflow.py`, to execute a ComfyUI workflow template (`.json`) with a skin style plan (`.json`). The script programmatically loads the workflow, injects the style plan, and then queues the prompt to the ComfyUI server. The script then waits for the server to finish generating all the images.

## Prerequisites

- **ComfyUI Server**: You must have a ComfyUI server running and accessible. By default, the script assumes the server is at `http://127.0.0.1:8188`.
- **Python Dependencies**: You need to have the required Python libraries installed. You can install them with pip:
  ```bash
  pip install websocket-client
  ```
- **Custom Nodes**: The Dustland custom nodes must be installed in your ComfyUI `custom_nodes` directory. You can do this by running the `scripts/supporting/install-comfyui-nodes.sh` script from the root of this repository.

## Usage

You can run the script from the root of the repository as follows:

```bash
python scripts/run-skin-workflow.py <path_to_workflow.json> <path_to_style_plan.json>
```

### Arguments

- `workflow_file`: The path to the ComfyUI workflow JSON file. An example is provided at `docs/examples/comfyui-skin-style-workflow.json`.
- `style_plan_file`: The path to the skin style plan JSON file. An example is provided at `docs/examples/skin_style_plan.json`.
- `--host`: (Optional) The hostname of the ComfyUI server. Defaults to `127.0.0.1`.
- `--port`: (Optional) The port number of the ComfyUI server. Defaults to `8188`.

### Example

To run the example workflow with the example style plan, use the following command:

```bash
python scripts/run-skin-workflow.py docs/examples/comfyui-skin-style-workflow.json docs/examples/skin_style_plan.json
```

The script will then connect to the ComfyUI server, queue the prompt, and print progress messages to the console. Once the process is complete, the generated images and skin manifests will be available in your ComfyUI `output` directory.

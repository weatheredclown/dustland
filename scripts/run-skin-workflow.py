#!/usr/bin/env python3

"""CLI tool to run the Dustland skin style generation workflow with ComfyUI.

This script loads a workflow template, injects a skin style plan, and then
repeatedly queues prompts to generate all assets defined in the plan. This is
necessary because the ComfyUI web UI does not natively support iterating over
the list of assets produced by the `SkinStyleJSONLoader` node.

Usage:
  python scripts/run-skin-workflow.py <style_plan.json> [--host <host>] [--port <port>]

Example:
  python scripts/run-skin-workflow.py docs/examples/skin_style_plan.json
"""

from __future__ import annotations

import argparse
import json
import random
import sys
import urllib.request
import urllib.parse
import uuid
import websocket
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple


# --- Logic repurposed from the SkinStyleJSONLoader custom node ---

@dataclass
class SkinAssetPrompt:
  """Description of a single skin asset variant to generate."""
  name: str
  prompt: str
  negative_prompt: str
  width: int
  height: int
  steps: int
  cfg_scale: float
  sampler: str
  scheduler: str
  seed: int
  slot: str
  style_id: str
  metadata: Dict[str, Any] = field(default_factory=dict)


class _SafeFormatDict(dict):
  """Dictionary that leaves unknown placeholders intact when formatting."""
  def __missing__(self, key: str) -> str:
    return "{" + key + "}"


class SkinStylePromptGenerator:
  """Expand a Dustland skin template into prompts for every requested style."""

  def _parse_style_overrides(self, overrides: str) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    for raw_line in overrides.splitlines():
      line = raw_line.strip()
      if not line or line.startswith("#"):
        continue
      parts = [part.strip() for part in line.split("|")]
      if not parts[0]:
        continue
      prompt = parts[1] if len(parts) > 1 else ""
      negative = parts[2] if len(parts) > 2 else ""
      results.append({
          "id": parts[0],
          "prompt": prompt,
          "negative_prompt": negative,
      })
    return results

  def _ensure_styles(self, data: Dict[str, Any], overrides: str) -> List[Dict[str, Any]]:
    manual = self._parse_style_overrides(overrides)
    if manual:
      return manual
    styles = data.get("styles")
    if not styles:
      base_prompt = data.get("style_prompt") or data.get("prompt") or ""
      styles = [{"id": "default", "label": "Default", "prompt": base_prompt}]
    normalized: List[Dict[str, Any]] = []
    for entry in styles:
      if not isinstance(entry, dict):
        continue
      style_id = str(entry.get("id") or entry.get("name") or entry.get("label") or "style")
      normalized.append({
          **entry,
          "id": style_id,
          "label": entry.get("label") or entry.get("name") or style_id,
          "prompt": entry.get("prompt") or "",
      })
    if not normalized:
      raise ValueError("No styles were defined in the template or overrides")
    return normalized

  def _slugify(self, value: str) -> str:
    cleaned = [ch.lower() if ch.isalnum() else "-" for ch in value]
    slug = "".join(cleaned)
    while "--" in slug:
      slug = slug.replace("--", "-")
    slug = slug.strip("-")
    return slug or "style"

  def _segmentize(self, value: Any) -> List[str]:
    if value is None:
      return []
    if isinstance(value, str):
      stripped = value.strip()
      return [stripped] if stripped else []
    if isinstance(value, (list, tuple)):
      results: List[str] = []
      for item in value:
        if item is None:
          continue
        text = str(item).strip()
        if text:
          results.append(text)
      return results
    return []

  def _format(self, template: str, context: Dict[str, Any]) -> str:
    if not template:
      return ""
    try:
      return template.format_map(_SafeFormatDict(context)).strip()
    except Exception as exc:
      raise ValueError(f"Failed to format template '{template}' with context {context}") from exc

  def _gather_prompt_segments(self, source: Dict[str, Any], context: Dict[str, Any]) -> List[str]:
    segments: List[str] = []
    for key, value in source.items():
      if "prompt" not in key:
        continue
      if key.lower().startswith("negative"):
        continue
      for segment in self._segmentize(value):
        formatted = self._format(segment, context)
        if formatted:
          segments.append(formatted)
    return segments

  def _collect_prompts(
      self,
      data: Dict[str, Any],
      style: Dict[str, Any],
      asset: Dict[str, Any],
      context: Dict[str, Any],
  ) -> Tuple[str, str]:
    positive_segments: List[str] = []
    negative_segments: List[str] = []

    for source in (data, style, asset):
      positive_segments.extend(self._gather_prompt_segments(source, context))
      negative_value = source.get("negative_prompt") or source.get("negativePrompt")
      if negative_value:
        formatted = self._format(str(negative_value), context)
        if formatted:
          negative_segments.append(formatted)

    positive = ", ".join(dict.fromkeys(seg for seg in positive_segments if seg))
    negative = "\n".join(dict.fromkeys(seg for seg in negative_segments if seg))
    return positive, negative

  def _build_context(
      self,
      data: Dict[str, Any],
      style: Dict[str, Any],
      asset: Dict[str, Any],
      style_index: int,
      asset_index: int,
      width: int,
      height: int,
  ) -> Dict[str, Any]:
    slot = str(asset.get("slot") or asset.get("id") or asset.get("name") or f"asset_{asset_index:03d}")
    style_label = style.get("label") or style.get("name") or style.get("id")
    context: Dict[str, Any] = {
        "style_id": style["id"],
        "style_name": style_label,
        "style_prompt": style.get("prompt", ""),
        "style_palette": style.get("palette", ""),
        "style_index": style_index,
        "slot": slot,
        "slot_title": asset.get("title") or asset.get("label") or slot.replace("_", " ").title(),
        "slot_index": asset_index,
        "width": width,
        "height": height,
    }
    for key, value in data.items():
      if isinstance(value, (str, int, float)):
        context[f"global_{key}"] = value
    for key, value in style.items():
      if isinstance(value, (str, int, float)):
        context[f"style_{key}"] = value
    for key, value in asset.items():
      if isinstance(value, (str, int, float)):
        context[f"asset_{key}"] = value
    return context

  def _resolve_dimension(self, asset: Dict[str, Any], defaults: Dict[str, Any], key: str, fallback: int) -> int:
    if key in asset and asset[key] is not None:
      return int(asset[key])
    alt_key = "width" if key == "width" else "height"
    if alt_key in asset and asset[alt_key] is not None:
      return int(asset[alt_key])
    if key in defaults and defaults[key] is not None:
      return int(defaults[key])
    return int(fallback)

  def _resolve_numeric(self, asset: Dict[str, Any], style: Dict[str, Any], defaults: Dict[str, Any], key: str, fallback: Any):
    for source in (asset, style, defaults):
      if key in source and source[key] is not None:
        return source[key]
    return fallback

  def _resolve_seed(
      self,
      asset: Dict[str, Any],
      style: Dict[str, Any],
      defaults: Dict[str, Any],
      style_index: int,
      asset_index: int,
  ) -> int:
    seed_value = None
    for source in (asset, style, defaults):
      if source is None:
        continue
      if "seed" in source and source["seed"] is not None:
        seed_value = source["seed"]
        break
    if seed_value is None and style.get("seed_offset") is not None and defaults.get("seed") is not None:
      seed_value = int(defaults["seed"]) + int(style["seed_offset"])
    if seed_value is None and asset.get("seed_offset") is not None and defaults.get("seed") is not None:
      seed_value = int(defaults["seed"]) + int(asset["seed_offset"])
    if seed_value is None:
      seed_value = random.randint(0, 2**32 - 1)
    else:
      seed_value = int(seed_value)
    return seed_value + style_index * 101 + asset_index

  def generate(
      self,
      style_plan_source: str,
      styles_override: str = "",
      manifest_filename_prefix: str = "skin_manifest",
      output_dir: Path = Path("ComfyUI/output"),
      fallback_width: int = 1024,
      fallback_height: int = 1024,
      fallback_steps: int = 30,
      fallback_cfg: float = 7.0,
      fallback_sampler: str = "dpmpp_2m",
      fallback_scheduler: str = "karras",
  ) -> Tuple[List[SkinAssetPrompt], str]:

    raw = json.loads(style_plan_source)
    if not isinstance(raw, dict):
      raise TypeError("Skin template JSON must be an object")

    styles = self._ensure_styles(raw, styles_override)
    assets = raw.get("assets")
    if not assets or not isinstance(assets, Iterable):
      raise ValueError("Skin template must include an 'assets' array")

    defaults = {
        "width": raw.get("width") or raw.get("default_width"),
        "height": raw.get("height") or raw.get("default_height"),
        "steps": raw.get("steps") or raw.get("default_steps"),
        "cfg_scale": raw.get("cfg_scale") or raw.get("cfg"),
        "sampler": raw.get("sampler"),
        "scheduler": raw.get("scheduler"),
        "seed": raw.get("seed"),
    }

    prompts: List[SkinAssetPrompt] = []
    summary_lines: List[str] = []

    for style_index, style in enumerate(styles):
      style_id = style["id"]
      for asset_index, asset in enumerate(assets):
        if not isinstance(asset, dict):
          continue
        width = self._resolve_dimension(asset, defaults, "width", fallback_width)
        height = self._resolve_dimension(asset, defaults, "height", fallback_height)
        context = self._build_context(raw, style, asset, style_index, asset_index, width, height)
        prompt, negative_prompt = self._collect_prompts(raw, style, asset, context)
        if not prompt:
          raise ValueError(f"Asset '{asset.get('slot')}' for style '{style_id}' produced an empty prompt")

        steps = int(self._resolve_numeric(asset, style, defaults, "steps", fallback_steps))
        cfg_scale = float(self._resolve_numeric(asset, style, defaults, "cfg_scale", fallback_cfg))
        sampler = str(self._resolve_numeric(asset, style, defaults, "sampler", fallback_sampler))
        scheduler = str(self._resolve_numeric(asset, style, defaults, "scheduler", fallback_scheduler))
        seed = self._resolve_seed(asset, style, defaults, style_index, asset_index)
        slot = context["slot"]
        filename_template = asset.get("filename") or "{style_id}_{slot}"
        name = self._format(str(filename_template), context)
        name = self._slugify(name)
        metadata = {
            "slot": slot,
            "style_id": style_id,
            "style_name": context.get("style_name"),
            "width": width,
            "height": height,
        }
        prompts.append(SkinAssetPrompt(
            name=name,
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            steps=steps,
            cfg_scale=cfg_scale,
            sampler=sampler,
            scheduler=scheduler,
            seed=seed,
            slot=slot,
            style_id=style_id,
            metadata=metadata,
        ))
        summary_lines.append(f"{style_id}: {slot} → {name} ({width}×{height})")

    summary = "\n".join(summary_lines)

    prompts_by_style = {}
    for p in prompts:
        if p.style_id not in prompts_by_style:
            prompts_by_style[p.style_id] = []
        prompts_by_style[p.style_id].append(p)

    manifest_paths = []
    output_dir.mkdir(parents=True, exist_ok=True)
    for style_id, style_prompts in prompts_by_style.items():
        manifest = {p.slot: f"{p.name}.png" for p in style_prompts}
        manifest_filename = f"{manifest_filename_prefix}_{style_id}.json"
        manifest_path = output_dir / manifest_filename
        manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        manifest_paths.append(str(manifest_path))

    summary += "\n\nSaved manifests:\n" + "\n".join(manifest_paths)

    return (prompts, summary)


# --- ComfyUI API interaction ---

def queue_prompt(prompt: dict, host: str, port: int, client_id: str):
    """Send a prompt to the ComfyUI server."""
    url = f"http://{host}:{port}/prompt"
    headers = {"Content-Type": "application/json"}
    data = json.dumps({"prompt": prompt, "client_id": client_id}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req) as response:
        return json.loads(response.read())

def get_history(prompt_id: str, host: str, port: int):
    """Get the history for a given prompt ID."""
    url = f"http://{host}:{port}/history/{prompt_id}"
    with urllib.request.urlopen(url) as response:
        return json.loads(response.read())

# --- Main script ---

def get_single_asset_workflow() -> dict:
    # Basic Text-to-Image workflow using KSampler
    return {
      "3": {
        "class_type": "KSampler",
        "inputs": {
          "model": ["4", 0],
          "positive": ["5", 0],
          "negative": ["6", 0],
          "latent_image": ["7", 0],
          "seed": 0,
          "steps": 30,
          "cfg": 7.5,
          "sampler_name": "dpmpp_2m",
          "scheduler": "karras",
          "denoise": 1
        }
      },
      "4": {
        "class_type": "CheckpointLoaderSimple",
        "inputs": { "ckpt_name": "v1-5-pruned-emaonly-fp16.safetensors" }
      },
      "5": {
        "class_type": "CLIPTextEncode",
        "inputs": { "clip": ["4", 1], "text": "a cute cat" }
      },
      "6": {
        "class_type": "CLIPTextEncode",
        "inputs": { "clip": ["4", 1], "text": "bad art, lowres" }
      },
      "7": {
        "class_type": "EmptyLatentImage",
        "inputs": { "width": 512, "height": 512, "batch_size": 1 }
      },
      "8": {
        "class_type": "VAEDecode",
        "inputs": { "samples": ["3", 0], "vae": ["4", 2] }
      },
      "9": {
        "class_type": "SaveImage",
        "inputs": { "images": ["8", 0], "filename_prefix": "cat" }
      }
    }


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(description="Run a Dustland skin style workflow.")
    parser.add_argument("style_plan_file", type=Path, help="Path to the skin style plan JSON file.")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="ComfyUI server host.")
    parser.add_argument("--port", type=int, default=8188, help="ComfyUI server port.")
    parser.add_argument("--output-dir", type=Path, default=Path("ComfyUI/output"), help="Directory to save manifests.")
    parser.add_argument("--checkpoint", type=str, default="v1-5-pruned-emaonly-fp16.safetensors", help="Name of the checkpoint file to use.")
    args = parser.parse_args()

    if not args.style_plan_file.exists():
        print(f"Error: Style plan file not found at {args.style_plan_file}", file=sys.stderr)
        sys.exit(1)

    client_id = str(uuid.uuid4())
    ws = websocket.WebSocket()
    try:
        ws.connect(f"ws://{args.host}:{args.port}/ws?clientId={client_id}")
    except ConnectionRefusedError:
        print(f"Error: Connection refused. Is ComfyUI running at http://{args.host}:{args.port}?", file=sys.stderr)
        sys.exit(1)

    print(f"Connected to ComfyUI server at ws://{args.host}:{args.port} with client ID {client_id}")

    style_plan_content = args.style_plan_file.read_text(encoding='utf-8')

    generator = SkinStylePromptGenerator()
    prompts, summary = generator.generate(style_plan_source=style_plan_content, output_dir=args.output_dir)

    print("--- Generation Plan ---")
    print(summary)
    print("-----------------------")

    workflow_template = get_single_asset_workflow()

    for asset_prompt in prompts:
        wf = json.loads(json.dumps(workflow_template)) # Deep copy

        # Populate the workflow template with the asset data
        wf["4"]["inputs"]["ckpt_name"] = args.checkpoint
        wf["5"]["inputs"]["text"] = asset_prompt.prompt
        wf["6"]["inputs"]["text"] = asset_prompt.negative_prompt
        wf["7"]["inputs"]["width"] = asset_prompt.width
        wf["7"]["inputs"]["height"] = asset_prompt.height
        wf["3"]["inputs"]["seed"] = asset_prompt.seed
        wf["3"]["inputs"]["steps"] = asset_prompt.steps
        wf["3"]["inputs"]["cfg"] = asset_prompt.cfg_scale
        wf["3"]["inputs"]["sampler_name"] = asset_prompt.sampler
        wf["3"]["inputs"]["scheduler"] = asset_prompt.scheduler
        wf["9"]["inputs"]["filename_prefix"] = asset_prompt.name

        prompt_id = queue_prompt(wf, args.host, args.port, client_id)['prompt_id']
        print(f"\nQueued prompt for asset '{asset_prompt.name}' ({asset_prompt.width}x{asset_prompt.height}) with ID: {prompt_id}")

        while True:
            out = ws.recv()
            if isinstance(out, str):
                message = json.loads(out)
                if message['type'] == 'executing':
                    data = message['data']
                    if data['node'] is None and data['prompt_id'] == prompt_id:
                        print(f"Finished generating asset '{asset_prompt.name}'.")
                        break
                    # Optional: print progress
                    # else:
                    #     print(f"Executing node: {data['node']}")

    ws.close()
    print("\nAll assets generated successfully. Script finished.")


if __name__ == "__main__":
    main()

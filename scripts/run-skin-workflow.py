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
import urllib.error
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

  def _deep_merge_dicts(self, base: Dict[str, Any], overlay: Dict[str, Any]) -> Dict[str, Any]:
    merged: Dict[str, Any] = dict(base)
    for key, value in overlay.items():
      if key not in merged:
        merged[key] = value
        continue
      existing = merged[key]
      if isinstance(existing, dict) and isinstance(value, dict):
        merged[key] = self._deep_merge_dicts(existing, value)
      elif isinstance(existing, list) and isinstance(value, list):
        merged[key] = existing + value
      else:
        merged[key] = value
    return merged

  def _merge_template_entries(self, entries: Iterable[Dict[str, Any]]) -> Dict[str, Any]:
    merged: Dict[str, Any] = {}
    for entry in entries:
      merged = self._deep_merge_dicts(merged, entry)
    return merged

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
    cleaned = []
    for ch in value:
      if ch.isalnum() or ch in {"-", "_"}:
        cleaned.append(ch.lower())
      else:
        cleaned.append("-")
    slug = "".join(cleaned)
    while "--" in slug:
      slug = slug.replace("--", "-")
    slug = slug.strip("-")
    return slug or "style"

  def _slugify_path(self, value: str) -> str:
    parts = []
    for segment in str(value).split("/"):
      segment = segment.strip()
      if not segment:
        continue
      slug = self._slugify(segment)
      if slug:
        parts.append(slug)
    return "/".join(parts)

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
    if isinstance(raw, list):
      object_entries = [item for item in raw if isinstance(item, dict)]
      if not object_entries:
        raise TypeError("Skin template JSON must be an object; received an array without objects")
      raw = self._merge_template_entries(object_entries)
    if not isinstance(raw, dict):
      raise TypeError(f"Skin template JSON must be an object; received {type(raw).__name__}")

    styles = self._ensure_styles(raw, styles_override)
    assets = raw.get("assets")
    if not assets or not isinstance(assets, Iterable):
      raise ValueError("Skin template must include an 'assets' array")

    defaults = {
        "width": raw.get("width") or raw.get("default_width") or fallback_width,
        "height": raw.get("height") or raw.get("default_height") or fallback_height,
        "steps": raw.get("steps") or raw.get("default_steps") or fallback_steps,
        "cfg_scale": raw.get("cfg_scale") or raw.get("cfg") or fallback_cfg,
        "sampler": raw.get("sampler") or fallback_sampler,
        "scheduler": raw.get("scheduler") or fallback_scheduler,
        "seed": raw.get("seed"),
    }

    prompts: List[SkinAssetPrompt] = []
    summary_lines: List[str] = []

    manifest_prefix = str(raw.get("manifest_filename_prefix") or manifest_filename_prefix)

    style_directories: Dict[str, str] = {}

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
        style_dir = style_directories.setdefault(style_id, self._slugify(str(style.get("directory") or style_id)))

        filename_template = asset.get("filename")
        if filename_template:
          raw_name = self._format(str(filename_template), context) or slot
        else:
          raw_name = slot
        stem = self._slugify_path(raw_name)
        if not stem:
          stem = self._slugify(slot) or slot
        if not stem.startswith(style_dir + "/"):
          stem = f"{style_dir}/{stem}"
        file_stem = stem.split("/")[-1]
        name = stem
        metadata = {
            "slot": slot,
            "style_id": style_id,
            "style_name": context.get("style_name"),
            "width": width,
            "height": height,
        }
        metadata["manifest_filename"] = f"{style_dir}/{manifest_prefix}_{style_id}.json"
        metadata["style_directory"] = style_dir
        metadata["file_stem"] = file_stem
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
        style_dir = style_directories.get(style_id) or self._slugify(style_id)
        manifest_dir = (output_dir / style_dir)
        manifest_dir.mkdir(parents=True, exist_ok=True)
        manifest = {}
        for p in style_prompts:
            file_stem = p.metadata.get("file_stem") if isinstance(p.metadata, dict) else None
            if not file_stem:
                file_stem = Path(p.name).name
            manifest[p.slot] = f"{style_dir}/{file_stem}.png"
        manifest_filename = f"{manifest_prefix}_{style_id}.json"
        manifest_path = manifest_dir / manifest_filename
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


def _download_image(
    *,
    host: str,
    port: int,
    filename: str,
    subfolder: str,
    image_type: str,
    destination: Path,
) -> Path:
  query = urllib.parse.urlencode({
      "filename": filename,
      "subfolder": subfolder or "",
      "type": image_type or "output",
  })
  url = f"http://{host}:{port}/view?{query}"
  with urllib.request.urlopen(url) as response:
    data = response.read()
  destination.parent.mkdir(parents=True, exist_ok=True)
  destination.write_bytes(data)
  return destination


def download_images_for_prompt(
    prompt_id: str,
    asset_prompt: SkinAssetPrompt,
    host: str,
    port: int,
    output_dir: Path,
) -> List[Path]:
  try:
    history = get_history(prompt_id, host, port)
  except urllib.error.URLError as exc:
    print(f"Warning: Failed to fetch history for prompt {prompt_id}: {exc}")
    return []

  prompt_history = history.get(prompt_id) or {}
  outputs = prompt_history.get("outputs", {})
  saved_paths: List[Path] = []

  for node_output in outputs.values():
    images = node_output.get("images")
    if not images:
      continue
    if not isinstance(images, list):
      continue
    for index, image in enumerate(images):
      if not isinstance(image, dict):
        continue
      filename = image.get("filename")
      if not filename:
        continue
      subfolder = image.get("subfolder", "")
      image_type = image.get("type", "output")
      ext = Path(filename).suffix or ".png"
      suffix = "" if len(images) == 1 else f"_{index + 1:02d}"
      destination = output_dir / f"{asset_prompt.name}{suffix}{ext}"
      try:
        saved_path = _download_image(
            host=host,
            port=port,
            filename=filename,
            subfolder=subfolder,
            image_type=image_type,
            destination=destination,
        )
      except urllib.error.URLError as exc:
        print(f"Warning: Failed to download image '{filename}' for prompt {prompt_id}: {exc}")
        continue
      saved_paths.append(saved_path)

  return saved_paths

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
    parser.add_argument(
        "workflow_file",
        type=Path,
        nargs="?",
        help="Optional path to the ComfyUI workflow JSON file. Defaults to the built-in template.",
    )
    parser.add_argument(
        "style_plan_file",
        type=Path,
        nargs="?",
        help="Path to the skin style plan JSON file.",
    )
    parser.add_argument("--host", type=str, default="127.0.0.1", help="ComfyUI server host.")
    parser.add_argument("--port", type=int, default=8188, help="ComfyUI server port.")
    parser.add_argument("--output-dir", type=Path, default=Path("ComfyUI/output"), help="Directory to save manifests.")
    parser.add_argument("--checkpoint", type=str, default="v1-5-pruned-emaonly-fp16.safetensors", help="Name of the checkpoint file to use.")
    args = parser.parse_args()

    if args.style_plan_file is None:
        if args.workflow_file is None:
            parser.error("the following arguments are required: style_plan_file")
        args.style_plan_file = args.workflow_file
        args.workflow_file = None

    if not args.style_plan_file.exists():
        print(f"Error: Style plan file not found at {args.style_plan_file}", file=sys.stderr)
        sys.exit(1)

    if args.workflow_file and not args.workflow_file.exists():
        print(f"Error: Workflow file not found at {args.workflow_file}", file=sys.stderr)
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

    manifest_files: Dict[str, str] = {}
    style_dirs: Dict[str, str] = {}
    for prompt in prompts:
        metadata = prompt.metadata if isinstance(prompt.metadata, dict) else {}
        manifest_name = metadata.get("manifest_filename")
        if manifest_name and prompt.style_id not in manifest_files:
            manifest_files[prompt.style_id] = manifest_name
        style_dir = metadata.get("style_directory")
        if style_dir and prompt.style_id not in style_dirs:
            style_dirs[prompt.style_id] = style_dir

    if args.workflow_file:
        try:
            workflow_template = json.loads(args.workflow_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            print(f"Error: Failed to parse workflow JSON at {args.workflow_file}: {exc}", file=sys.stderr)
            sys.exit(1)
    else:
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

        downloaded = []
        while True:
            out = ws.recv()
            if isinstance(out, str):
                message = json.loads(out)
                if message['type'] == 'executing':
                    data = message['data']
                    if data['node'] is None and data['prompt_id'] == prompt_id:
                        if not downloaded:
                            downloaded = download_images_for_prompt(prompt_id, asset_prompt, args.host, args.port, args.output_dir)
                            for path in downloaded:
                                print(f"Saved image to {path}")
                            if not downloaded:
                                print("Warning: No images were downloaded for this asset. Check the SaveImage node configuration.")
                        print(f"Finished generating asset '{asset_prompt.name}'.")
                        break
                    # Optional: print progress
                    # else:
                    #     print(f"Executing node: {data['node']}")

    ws.close()
    print("\nAll assets generated successfully. Script finished.")

    if style_dirs:
        repo_root = Path.cwd().resolve()
        output_dir = args.output_dir.resolve()
        try:
            base_dir_rel = output_dir.relative_to(repo_root)
            base_dir_str = base_dir_rel.as_posix()
        except ValueError:
            base_dir_str = output_dir.as_posix()

        print("\nPreview tip:")
        print("  1. Open dustland.html directly in your browser (double-click works).")
        print("  2. Open Settings, enter one of these style IDs, then press Enter or click Load Skin:")
        for style_id in sorted(style_dirs):
            print(f"     • {style_id}")
        print("  3. Or run one of these in the developer console:")
        for style_id in sorted(style_dirs):
            print(f"\n     // {style_id}")
            print(f"     Dustland.skin.loadGeneratedSkin('{style_id}', {{ baseDir: '{base_dir_str}' }});")
            print(f"     // loadSkin('{style_id}') works as a shortcut.")
            manifest_name = manifest_files.get(style_id)
            if manifest_name:
                manifest_path = (args.output_dir / manifest_name).resolve()
                try:
                    manifest_rel = manifest_path.relative_to(repo_root)
                    manifest_hint = manifest_rel.as_posix()
                except ValueError:
                    manifest_hint = manifest_path.as_posix()
                print(f"     // Manifest: {manifest_hint}")


if __name__ == "__main__":
    main()

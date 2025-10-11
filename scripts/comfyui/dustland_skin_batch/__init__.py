"""Custom ComfyUI nodes for generating Dustland UI skins across multiple styles.

This loader expands a skin template JSON file into a batch of prompts that can
be rendered with the existing `Dustland Game Asset Batch Renderer`. Each style
variant can inject its own palette notes, lighting directions, or negative
prompts while reusing the shared asset definitions from the template.
"""

from __future__ import annotations

import json
import random
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

import folder_paths


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


class SkinStyleJSONLoader:
  """Expand a Dustland skin template into prompts for every requested style."""

  CATEGORY = "Dustland/Skins"
  RETURN_TYPES = ("GAME_ASSET_LIST", "STRING")
  RETURN_NAMES = ("assets", "summary")
  FUNCTION = "load"

  @classmethod
  def INPUT_TYPES(cls):
    return {
        "required": {
            "json_source": (
                "STRING",
                {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Paste JSON or provide a relative path under input/",
                },
            ),
            "styles_override": (
                "STRING",
                {
                    "multiline": True,
                    "default": "",
                    "placeholder": "Optional overrides: style_id | prompt | negative",
                },
            ),
            "fallback_width": (
                "INT",
                {"default": 1024, "min": 64, "max": 4096, "step": 8},
            ),
            "fallback_height": (
                "INT",
                {"default": 1024, "min": 64, "max": 4096, "step": 8},
            ),
            "fallback_steps": (
                "INT",
                {"default": 30, "min": 1, "max": 200},
            ),
            "fallback_cfg": (
                "FLOAT",
                {"default": 7.0, "min": 0.0, "max": 30.0, "step": 0.1},
            ),
            "fallback_sampler": (
                "STRING",
                {"default": "dpmpp_2m"},
            ),
            "fallback_scheduler": (
                "STRING",
                {"default": "karras"},
            ),
        }
    }

  def _read_json(self, json_source: str) -> Any:
    text = json_source.strip()
    if not text:
      text = "skin_style_plan.json"
    if text.startswith("{") or text.startswith("["):
      return json.loads(text)
    search_path = folder_paths.get_full_path("input", text)
    candidate = Path(search_path) if search_path else Path(text).expanduser()
    if not candidate.exists():
      script_dir = Path(__file__).parent
      node_candidate = script_dir / Path(text).name
      if node_candidate.exists():
        candidate = node_candidate
    if not candidate.exists():
      raise FileNotFoundError(f"Could not find JSON file at {text}")
    return json.loads(candidate.read_text(encoding="utf-8"))

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

  def load(
      self,
      json_source: str,
      styles_override: str,
      fallback_width: int,
      fallback_height: int,
      fallback_steps: int,
      fallback_cfg: float,
      fallback_sampler: str,
      fallback_scheduler: str,
  ):
    raw = self._read_json(json_source)
    if not isinstance(raw, dict):
      raise TypeError("Skin template JSON must be an object")

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
    return (prompts, summary)


NODE_CLASS_MAPPINGS = {
    "SkinStyleJSONLoader": SkinStyleJSONLoader,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "SkinStyleJSONLoader": "Dustland Skin Style JSON Loader",
}

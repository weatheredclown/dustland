#!/usr/bin/env python3

"""CLI tool to run the Dustland skin style generation workflow with ComfyUI.

This script loads a workflow template, injects a skin style plan, and then
repeatedly queues prompts to generate all assets defined in the plan. This is
necessary because the ComfyUI web UI does not natively support iterating over
the list of assets produced by the `SkinStyleJSONLoader` node.

Usage:
  python comfyui/scripts/run-skin-workflow.py <style_plan.json> [--host <host>] [--port <port>]

Example:
  python comfyui/scripts/run-skin-workflow.py comfyui/examples/skin_style_plan.json
"""

from __future__ import annotations

import argparse
import json
import re
import os
import random
import sys
import urllib.request
import urllib.parse
import urllib.error
import uuid
import websocket
from collections import OrderedDict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple


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

  _SLOT_ATTR_RE = re.compile(r"data-skin-slot\s*=\s*['\"]([^'\"]+)['\"]", re.IGNORECASE)
  _ATTR_RE = re.compile(r"([^\s=<]+)\s*=\s*(['\"])(.*?)\2", re.IGNORECASE | re.DOTALL)
  _DEFAULT_SLOT_PROMPT = "Dustland CRT UI skin slot"
  _TILE_SLOT_RE = re.compile(r"^tile[-_:]?(.+)$", re.IGNORECASE)

  def __init__(self) -> None:
    script_path = Path(__file__).resolve()
    repo_root = next(
        (candidate for candidate in script_path.parents if (candidate / "package.json").exists()),
        script_path.parents[2],
    )
    self._repo_root = repo_root

  def _iter_repo_files(self, root: Path) -> Iterable[Path]:
    skip_dirs = {".git", "node_modules", "__pycache__", "ComfyUI", ".venv"}
    for dirpath, dirnames, filenames in os.walk(root):
      dirnames[:] = [d for d in dirnames if d not in skip_dirs and not d.startswith('.')]
      for name in filenames:
        path = Path(dirpath, name)
        if path.suffix.lower() in {".html", ".htm", ".js"}:
          yield path

  def _discover_skin_slots(self) -> List[Dict[str, Any]]:
    slots: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()
    for path in self._iter_repo_files(self._repo_root):
      try:
        text = path.read_text(encoding="utf-8")
      except (OSError, UnicodeDecodeError):
        continue
      for match in self._SLOT_ATTR_RE.finditer(text):
        slot = match.group(1).strip()
        if not slot:
          continue
        entry = slots.setdefault(slot, {"slot": slot})
        tag_start = text.rfind("<", 0, match.start())
        tag_end = text.find(">", match.end())
        tag_text = text[tag_start:tag_end + 1] if tag_start != -1 and tag_end != -1 else ""
        if tag_text:
          for attr, _, raw_value in self._ATTR_RE.findall(tag_text):
            value = raw_value.strip()
            if not value:
              continue
            attr_lower = attr.lower()
            if attr_lower == "data-skin-label":
              labels = entry.setdefault("slot_labels", [])
              if value not in labels:
                labels.append(value)
            elif attr_lower == "aria-label":
              aria = entry.setdefault("aria_labels", [])
              if value not in aria:
                aria.append(value)
            elif attr_lower == "data-skin-description" and not entry.get("description"):
              entry["description"] = value
            elif attr_lower == "data-skin-title" and value:
              entry["title"] = value
        if not entry.get("title"):
          entry["title"] = self._humanize_slot(slot)
    results: List[Dict[str, Any]] = []
    for entry in slots.values():
      labels = entry.get("slot_labels") or []
      if labels and not entry.get("slot_label"):
        entry["slot_label"] = labels[0]
      if entry.get("slot_label") and not entry.get("slot_label_title"):
        entry["slot_label_title"] = self._humanize_label(entry["slot_label"])
      aria_labels = entry.get("aria_labels") or []
      if aria_labels and not entry.get("slot_aria_label"):
        entry["slot_aria_label"] = aria_labels[0]
      results.append(entry)
    return results

  def _humanize_slot(self, slot: str) -> str:
    text = slot.replace('-', ' ').replace('_', ' ')
    text = re.sub(r"\s+", " ", text).strip()
    return text.title() if text else slot

  def _humanize_label(self, label: str) -> str:
    return self._humanize_slot(label)

  def _auto_slot_assets(self) -> List[Dict[str, Any]]:
    assets: List[Dict[str, Any]] = []
    for info in self._discover_skin_slots():
      slot = info.get("slot")
      if not slot:
        continue
      title = info.get("title") or self._humanize_slot(slot)
      prompt_base = f"{self._DEFAULT_SLOT_PROMPT}: {title or slot}"
      suffix_parts: List[str] = []
      if info.get("slot_label_title"):
        suffix_parts.append(info["slot_label_title"])
      if info.get("description") and info["description"] not in {title}:
        suffix_parts.append(info["description"])
      if info.get("slot_aria_label"):
        suffix_parts.append(info["slot_aria_label"])
      suffix_text = ""
      if suffix_parts:
        suffix_text = ", ".join(dict.fromkeys(suffix_parts))
      prompt = prompt_base if not suffix_text else f"{prompt_base} — {suffix_text}"
      asset: Dict[str, Any] = {
          "slot": slot,
          "title": title or slot,
          "prompt": prompt,
      }
      if info.get("slot_label"):
        asset["slot_label"] = info["slot_label"]
      if info.get("slot_labels"):
        asset["slot_labels"] = info["slot_labels"]
      if info.get("slot_aria_label"):
        asset["slot_aria_label"] = info["slot_aria_label"]
      if info.get("aria_labels"):
        asset["aria_labels"] = info["aria_labels"]
      if info.get("description"):
        asset["description"] = info["description"]
      assets.append(asset)
    return assets

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

  def _infer_tile_stem(self, slot: str) -> Optional[str]:
    if not slot:
      return None
    match = self._TILE_SLOT_RE.match(slot.strip())
    if not match:
      return None
    slug = match.group(1).strip()
    if not slug:
      return None
    sanitized = re.sub(r"[^a-z0-9]+", "_", slug, flags=re.IGNORECASE).strip("_")
    if not sanitized:
      return None
    return f"{sanitized.lower()}_tile"

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
    slot_label_value = asset.get("slot_label") or asset.get("label")
    if slot_label_value:
      context["slot_label"] = slot_label_value
      context["slot_label_title"] = self._humanize_label(str(slot_label_value))
    aria_labels = asset.get("aria_labels")
    primary_aria_label = None
    if isinstance(aria_labels, (list, tuple)):
      for value in aria_labels:
        text = str(value).strip()
        if text:
          primary_aria_label = text
          break
    elif isinstance(aria_labels, str):
      primary_aria_label = aria_labels.strip()
    if primary_aria_label:
      context["slot_aria_label"] = primary_aria_label
    slot_description = asset.get("description") or asset.get("slot_description")
    if not slot_description and primary_aria_label:
      slot_description = primary_aria_label
    if not slot_description and context.get("slot_label_title"):
      slot_description = f"{context['slot_title']} ({context['slot_label_title']})"
    if not slot_description:
      slot_description = context["slot_title"]
    context["slot_description"] = slot_description
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

  def _classify_asset_kind(self, slot: str, width: int, height: int) -> str:
    slot_lower = (slot or "").lower()
    max_dim = max(width, height)
    min_dim = min(width, height)

    icon_keywords = ("icon", "chip", "badge", "toggle", "pill", "button")
    background_keywords = ("background", "wallpaper", "panel", "header", "card")

    if max_dim <= 128 or any(keyword in slot_lower for keyword in icon_keywords):
      return "icon"
    if min_dim >= 512 or any(keyword in slot_lower for keyword in background_keywords):
      return "background"
    return "mid"

  def _apply_quality_presets(
      self,
      *,
      slot: str,
      width: int,
      height: int,
      steps: int,
      cfg_scale: float,
      sampler: str,
      scheduler: str,
  ) -> Tuple[int, float, str, str]:
    """Nudge sampling defaults toward crisp UI art."""

    kind = self._classify_asset_kind(slot, width, height)

    sampler_normalized = (sampler or "").strip().lower()
    scheduler_normalized = (scheduler or "").strip().lower()

    if sampler_normalized in {"", "euler", "euler_a", "dpmpp_2m"}:
      sampler = "dpmpp_2m_sde"
    elif sampler_normalized == "heun":
      sampler = "dpmpp_2m_sde"

    if scheduler_normalized in {"", "normal", "exponential", "lms"}:
      scheduler = "karras"

    max_dim = max(width, height)

    if kind == "icon":
      steps = max(steps, 36)
      cfg_scale = min(max(cfg_scale, 5.5), 7.5)
    elif kind == "background":
      steps = max(steps, 40 if max_dim >= 768 else 36)
      cfg_scale = min(max(cfg_scale, 6.0), 8.5)
    else:
      steps = max(steps, 34)
      cfg_scale = min(max(cfg_scale, 5.8), 8.0)

    return steps, cfg_scale, sampler, scheduler

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
    auto_assets = self._auto_slot_assets()
    assets_input = raw.get("assets")
    asset_entries: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()
    if isinstance(assets_input, Iterable):
      for asset in assets_input:
        if not isinstance(asset, dict):
          continue
        slot_name = str(asset.get("slot") or asset.get("id") or asset.get("name") or "").strip()
        if not slot_name:
          continue
        normalized = dict(asset)
        normalized["slot"] = slot_name
        asset_entries[slot_name] = normalized
    if not asset_entries:
      raise ValueError("Skin template must include an 'assets' array")
    for asset in auto_assets:
      slot_name = asset.get("slot")
      if not slot_name or slot_name in asset_entries:
        continue
      asset_entries[slot_name] = asset
    assets = list(asset_entries.values())

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

        slot = context["slot"]
        steps = int(self._resolve_numeric(asset, style, defaults, "steps", fallback_steps))
        cfg_scale = float(self._resolve_numeric(asset, style, defaults, "cfg_scale", fallback_cfg))
        sampler = str(self._resolve_numeric(asset, style, defaults, "sampler", fallback_sampler))
        scheduler = str(self._resolve_numeric(asset, style, defaults, "scheduler", fallback_scheduler))
        steps, cfg_scale, sampler, scheduler = self._apply_quality_presets(
            slot=slot,
            width=width,
            height=height,
            steps=steps,
            cfg_scale=cfg_scale,
            sampler=sampler,
            scheduler=scheduler,
        )
        seed = self._resolve_seed(asset, style, defaults, style_index, asset_index)
        style_dir = style_directories.setdefault(style_id, self._slugify(str(style.get("directory") or style_id)))

        filename_template = asset.get("filename")
        if filename_template:
          raw_name = self._format(str(filename_template), context) or slot
        else:
          raw_name = slot
        tile_stem = None if filename_template else self._infer_tile_stem(slot)
        if tile_stem:
          stem = f"{style_dir}/{tile_stem}"
        else:
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
        if context.get("slot_description"):
          metadata["description"] = context["slot_description"]
        for meta_key in ("slot_label", "slot_label_title", "slot_aria_label"):
          if context.get(meta_key):
            metadata[meta_key] = context[meta_key]
        slot_labels = asset.get("slot_labels")
        if isinstance(slot_labels, (list, tuple)):
          metadata["slot_labels"] = [str(v).strip() for v in slot_labels if str(v).strip()]
        elif isinstance(slot_labels, str) and slot_labels.strip():
          metadata["slot_labels"] = [slot_labels.strip()]
        aria_labels = asset.get("aria_labels")
        if isinstance(aria_labels, (list, tuple)):
          metadata["aria_labels"] = [str(v).strip() for v in aria_labels if str(v).strip()]
        elif isinstance(aria_labels, str) and aria_labels.strip():
          metadata["aria_labels"] = [aria_labels.strip()]
        metadata["style_directory"] = style_dir
        metadata["file_stem"] = file_stem
        metadata["relative_path"] = f"{style_dir}/{file_stem}.png"
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

    output_dir.mkdir(parents=True, exist_ok=True)
    asset_directories: List[str] = []
    for style_id in prompts_by_style:
        style_dir = style_directories.get(style_id) or self._slugify(style_id)
        target_dir = (output_dir / style_dir)
        target_dir.mkdir(parents=True, exist_ok=True)
        asset_directories.append(target_dir.as_posix())

    if asset_directories:
        summary += "\n\nAsset directories:\n" + "\n".join(asset_directories)

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

def _print_prompt_block(title: str, text: str) -> None:
  """Pretty-print a positive or negative prompt section."""
  print(f"  {title}:")
  clean = (text or "").strip()
  if not clean:
    print("    (empty)")
    return
  for line in clean.splitlines():
    print(f"    {line}")


def _describe_asset_prompt(asset_prompt: SkinAssetPrompt) -> None:
  """Emit a human-readable summary of the full prompt being queued."""
  print(
      f"Queued prompt for asset '{asset_prompt.name}' ({asset_prompt.width}x{asset_prompt.height}) "
      f"style='{asset_prompt.style_id}' seed={asset_prompt.seed} steps={asset_prompt.steps} "
      f"cfg={asset_prompt.cfg_scale} sampler='{asset_prompt.sampler}' scheduler='{asset_prompt.scheduler}'"
  )
  _print_prompt_block("Positive prompt", asset_prompt.prompt)
  _print_prompt_block("Negative prompt", asset_prompt.negative_prompt)

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


class WorkflowConfigurationError(RuntimeError):
  """Raised when a ComfyUI workflow template is missing required nodes."""


def _as_node_id(node_id: Any) -> Optional[str]:
  if node_id is None:
    return None
  if isinstance(node_id, str):
    return node_id
  if isinstance(node_id, (int, float)):
    return str(int(node_id))
  return str(node_id)


def _iter_linked_node_ids(value: Any) -> Iterable[str]:
  if isinstance(value, list):
    if value and isinstance(value[0], (str, int, float)):
      linked = _as_node_id(value[0])
      if linked is not None:
        yield linked
    for item in value:
      if isinstance(item, (list, dict)):
        yield from _iter_linked_node_ids(item)
  elif isinstance(value, dict):
    for item in value.values():
      yield from _iter_linked_node_ids(item)


def _linked_node_id(value: Any) -> Optional[str]:
  for node_id in _iter_linked_node_ids(value):
    return node_id
  return None


def _node_depends_on(workflow: Dict[str, Dict[str, Any]], start_id: str, target_id: str, visited: Optional[Set[str]] = None) -> bool:
  start_id = _as_node_id(start_id) or ""
  target_id = _as_node_id(target_id) or ""
  if not start_id or not target_id:
    return False
  if start_id == target_id:
    return True
  if visited is None:
    visited = set()
  if start_id in visited:
    return False
  visited.add(start_id)
  node = workflow.get(start_id)
  if not isinstance(node, dict):
    return False
  inputs = node.get("inputs", {})
  for linked in _iter_linked_node_ids(inputs):
    if _node_depends_on(workflow, linked, target_id, visited):
      return True
  return False


def _find_primary_sampler_node(workflow: Dict[str, Dict[str, Any]]) -> Optional[str]:
  for node_id, node in workflow.items():
    if not isinstance(node, dict):
      continue
    class_type = node.get("class_type")
    if isinstance(class_type, str) and class_type.lower().startswith("ksampler"):
      return _as_node_id(node_id)
  return None


def _find_connected_save_image_node(workflow: Dict[str, Dict[str, Any]], sampler_id: str) -> Optional[str]:
  for node_id, node in workflow.items():
    if not isinstance(node, dict):
      continue
    if node.get("class_type") == "SaveImage":
      node_id_str = _as_node_id(node_id)
      if node_id_str and _node_depends_on(workflow, node_id_str, sampler_id):
        return node_id_str
  return None


def _ensure_inputs(node: Dict[str, Any]) -> Dict[str, Any]:
  inputs = node.get("inputs")
  if not isinstance(inputs, dict):
    inputs = {}
    node["inputs"] = inputs
  return inputs


def apply_asset_prompt_to_workflow(workflow: Dict[str, Dict[str, Any]], asset_prompt: SkinAssetPrompt, checkpoint_name: str) -> List[str]:
  sampler_id = _find_primary_sampler_node(workflow)
  if not sampler_id:
    raise WorkflowConfigurationError("Unable to find a KSampler node in the workflow template.")

  warnings: List[str] = []
  sampler_node = workflow[sampler_id]
  sampler_inputs = _ensure_inputs(sampler_node)

  sampler_inputs["seed"] = asset_prompt.seed
  sampler_inputs["steps"] = asset_prompt.steps
  sampler_inputs["cfg"] = asset_prompt.cfg_scale
  sampler_inputs["sampler_name"] = asset_prompt.sampler
  sampler_inputs["scheduler"] = asset_prompt.scheduler

  model_node_id = _linked_node_id(sampler_inputs.get("model"))
  if model_node_id:
    model_node = workflow.get(model_node_id)
    if model_node:
      model_inputs = _ensure_inputs(model_node)
      model_inputs["ckpt_name"] = checkpoint_name
    else:
      warnings.append(f"Model node '{model_node_id}' referenced by the sampler was not found in the workflow.")
  else:
    warnings.append("Sampler node does not reference a checkpoint loader; checkpoint override skipped.")

  positive_node_id = _linked_node_id(sampler_inputs.get("positive"))
  if not positive_node_id:
    raise WorkflowConfigurationError("Sampler node is missing a 'positive' input reference.")
  positive_node = workflow.get(positive_node_id)
  if not positive_node:
    raise WorkflowConfigurationError(f"Positive prompt node '{positive_node_id}' referenced by the sampler is missing from the workflow.")
  positive_inputs = _ensure_inputs(positive_node)
  positive_inputs["text"] = asset_prompt.prompt

  negative_node_id = _linked_node_id(sampler_inputs.get("negative"))
  if not negative_node_id:
    raise WorkflowConfigurationError("Sampler node is missing a 'negative' input reference.")
  negative_node = workflow.get(negative_node_id)
  if not negative_node:
    raise WorkflowConfigurationError(f"Negative prompt node '{negative_node_id}' referenced by the sampler is missing from the workflow.")
  negative_inputs = _ensure_inputs(negative_node)
  negative_inputs["text"] = asset_prompt.negative_prompt

  latent_node_id = _linked_node_id(sampler_inputs.get("latent_image"))
  if latent_node_id:
    latent_node = workflow.get(latent_node_id)
    if latent_node:
      latent_inputs = _ensure_inputs(latent_node)
      latent_inputs["width"] = asset_prompt.width
      latent_inputs["height"] = asset_prompt.height
    else:
      warnings.append(f"Latent image node '{latent_node_id}' referenced by the sampler is missing from the workflow; size overrides skipped.")
  else:
    warnings.append("Sampler node is missing a latent image reference; size overrides skipped.")

  save_node_id = _find_connected_save_image_node(workflow, sampler_id)
  if save_node_id:
    save_node = workflow[save_node_id]
    save_inputs = _ensure_inputs(save_node)
    save_inputs["filename_prefix"] = asset_prompt.name
  else:
    warnings.append("Unable to locate a SaveImage node connected to the sampler; generated files may use default names.")

  return warnings


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


def _normalize_workflow_template(data: Any) -> Dict[str, Dict[str, Any]]:
  """Convert a ComfyUI workflow export into the prompt dictionary format.

  The CLI historically operated on the simplified dictionary structure used
  by the `/prompt` API. Recent JSON exports from the ComfyUI UI wrap nodes in
  a `{"nodes": [...]}` payload. This helper preserves backwards
  compatibility by accepting either form and normalizing the structure.
  """

  if isinstance(data, dict):
    if all(
        isinstance(node, dict) and "class_type" in node
        for node in data.values()
    ):
      # Already in prompt dictionary format.
      return {str(node_id): dict(node) for node_id, node in data.items()}

    nodes = data.get("nodes")
    links = data.get("links") or []
    if isinstance(nodes, list):
      link_sources: Dict[int, Tuple[str, int]] = {}

      def _coerce_int(value: Any) -> Optional[int]:
        if isinstance(value, bool):
          return int(value)
        if isinstance(value, (int, float)):
          return int(value)
        if isinstance(value, str):
          text = value.strip()
          if not text:
            return None
          try:
            return int(text)
          except ValueError:
            return None
        return None

      if isinstance(links, list):
        for entry in links:
          if not isinstance(entry, list) or len(entry) < 5:
            continue
          link_id, source_node, source_slot = entry[0], entry[1], entry[2]
          link_id_int = _coerce_int(link_id)
          source_slot_int = _coerce_int(source_slot)
          source_node_id = _as_node_id(source_node)
          if link_id_int is None or source_node_id is None or source_slot_int is None:
            continue
          link_sources[link_id_int] = (source_node_id, source_slot_int)

      normalised: Dict[str, Dict[str, Any]] = {}
      for node in nodes:
        if not isinstance(node, dict):
          continue
        node_id = node.get("id")
        class_type = node.get("type") or node.get("class_type")
        if node_id is None or class_type is None:
          continue

        inputs: Dict[str, Any] = {}
        widget_values = list(node.get("widgets_values") or [])
        widget_iter = iter(widget_values)

        for input_entry in node.get("inputs") or []:
          if not isinstance(input_entry, dict):
            continue
          name = input_entry.get("name")
          if not name:
            continue
          link_id = input_entry.get("link")
          link_id_int = _coerce_int(link_id)
          if link_id_int is not None:
            source = link_sources.get(link_id_int)
            if source is not None:
              inputs[name] = [source[0], source[1]]
            continue

          if "value" in input_entry:
            inputs[name] = input_entry["value"]
            continue

          # Widgets are serialised in the same order as the inputs in
          # ComfyUI's JSON export. Pull the next value if available.
          try:
            widget_value = next(widget_iter)
          except StopIteration:
            widget_value = None
          inputs[name] = widget_value

        normalised[str(node_id)] = {
            "class_type": str(class_type),
            "inputs": inputs,
        }

      if normalised:
        return normalised

  raise TypeError("Workflow JSON must be a prompt dictionary or a nodes export")


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
    parser.add_argument("--output-dir", type=Path, default=Path("ComfyUI/output"), help="Directory to save rendered PNGs.")
    parser.add_argument("--checkpoint", type=str, default="v1-5-pruned-emaonly-fp16.safetensors", help="Name of the checkpoint file to use.")
    parser.add_argument("--force-regen", action="store_true", help="Regenerate assets even when the target PNG already exists.")
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

    style_dirs: Dict[str, str] = {}
    for prompt in prompts:
        metadata = prompt.metadata if isinstance(prompt.metadata, dict) else {}
        style_dir = metadata.get("style_directory")
        if style_dir and prompt.style_id not in style_dirs:
            style_dirs[prompt.style_id] = style_dir

    if args.workflow_file:
        try:
            raw_workflow = json.loads(args.workflow_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            print(f"Error: Failed to parse workflow JSON at {args.workflow_file}: {exc}", file=sys.stderr)
            sys.exit(1)
        try:
            workflow_template = _normalize_workflow_template(raw_workflow)
        except TypeError as exc:
            print(f"Error: {exc}", file=sys.stderr)
            sys.exit(1)
    else:
        workflow_template = get_single_asset_workflow()

    sampler_id = _find_primary_sampler_node(workflow_template)
    if not sampler_id:
        has_batch_renderer = any(
            isinstance(node, dict) and node.get("class_type") == "GameAssetBatchRenderer"
            for node in workflow_template.values()
        )
        reason = "GameAssetBatchRenderer" if has_batch_renderer else "a KSampler"
        print(
            f"Warning: Workflow template is missing {reason}; using built-in single-asset workflow instead.",
            file=sys.stderr,
        )
        workflow_template = get_single_asset_workflow()

    for asset_prompt in prompts:
        metadata = asset_prompt.metadata if isinstance(asset_prompt.metadata, dict) else {}
        relative_path = metadata.get("relative_path")
        expected_path = None
        if relative_path:
            expected_path = args.output_dir / Path(relative_path)
        else:
            expected_path = args.output_dir / f"{asset_prompt.name}.png"
        if expected_path and not args.force_regen and expected_path.exists():
            print(f"\nSkipping asset '{asset_prompt.name}' (already exists at {expected_path}). Use --force-regen to regenerate.")
            continue
        wf = json.loads(json.dumps(workflow_template)) # Deep copy
        try:
          warnings = apply_asset_prompt_to_workflow(wf, asset_prompt, args.checkpoint)
        except WorkflowConfigurationError as exc:
          print(f"Error: {exc}", file=sys.stderr)
          sys.exit(1)
        for warning in warnings:
          print(f"Warning: {warning}")

        prompt_id = queue_prompt(wf, args.host, args.port, client_id)['prompt_id']
        print("\n--- Prompt Details ---")
        _describe_asset_prompt(asset_prompt)
        print(f"  Prompt ID: {prompt_id}")

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
            style_dir = style_dirs.get(style_id) or style_id
            args_list = {"baseDir": base_dir_str, "styleDir": style_dir}
            snippet = json.dumps(args_list, indent=2)
            indented = "\n".join(f"       {line}" for line in snippet.splitlines())
            print(f"     Dustland.skin.loadGeneratedSkin('{style_id}', {{")
            print(indented)
            print("     });")
            if base_dir_str.rstrip('/') == 'ComfyUI/output' and style_dir == style_id:
                print(f"     // loadSkin('{style_id}') works when you keep the default output path.")
            else:
                print(f"     // Update baseDir/styleDir if you move the renders.")


if __name__ == "__main__":
    main()

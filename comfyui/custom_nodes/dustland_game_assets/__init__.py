"""Custom ComfyUI nodes for generating game art batches from JSON prompts.

These nodes allow Dustland creators to feed a JSON description of assets into
ComfyUI and automatically render each item with its own prompt, resolution,
seed, and filename.  Copy this file into your ComfyUI installation under
``custom_nodes`` to make the nodes available in the UI.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List
import random

import comfy.sd
import folder_paths
import nodes
import torch
import torch.nn.functional as F
import inspect


def _round_to_multiple(value: float, multiple: int = 8) -> int:
  if multiple <= 0:
    return max(1, int(round(value)))
  return max(multiple, int(math.ceil(float(value) / multiple) * multiple))


def _interpolate_kwargs() -> dict:
  params = inspect.signature(F.interpolate).parameters
  kwargs = {"mode": "bicubic", "align_corners": False}
  if "antialias" in params:
    kwargs["antialias"] = True
  return kwargs


_INTERPOLATE_KWARGS = _interpolate_kwargs()


@dataclass
class GameAssetPrompt:
  """Description of a single asset to generate."""

  name: str
  prompt: str
  negative_prompt: str
  width: int
  height: int
  target_width: int
  target_height: int
  render_scale: float
  steps: int
  cfg_scale: float
  sampler: str
  scheduler: str
  seed: int


class GameAssetJSONLoader:
  """Parse JSON describing a batch of game asset prompts."""

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
            "fallback_width": (
                "INT",
                {"default": 512, "min": 64, "max": 2048, "step": 8},
            ),
            "fallback_height": (
                "INT",
                {"default": 512, "min": 64, "max": 2048, "step": 8},
            ),
            "fallback_steps": (
                "INT",
                {"default": 30, "min": 1, "max": 150},
            ),
            "fallback_cfg": (
                "FLOAT",
                {"default": 7.0, "min": 0.0, "max": 30.0, "step": 0.1},
            ),
            "fallback_sampler": (
                "STRING",
                {"default": "euler"},
            ),
            "fallback_scheduler": (
                "STRING",
                {"default": "normal"},
            ),
        }
    }

  RETURN_TYPES = ("GAME_ASSET_LIST",)
  FUNCTION = "load"
  CATEGORY = "Dustland/Game Assets"

  def _read_json(self, json_source: str) -> Any:
    text = json_source.strip()
    if not text:
      raise ValueError("JSON source is empty")
    if text.startswith("{") or text.startswith("["):
      return json.loads(text)
    search_path = folder_paths.get_full_path("input", text)
    if search_path is None:
      candidate = Path(text).expanduser()
    else:
      candidate = Path(search_path)
    if not candidate.exists():
      raise FileNotFoundError(f"Could not find JSON file at {candidate}")
    return json.loads(candidate.read_text(encoding="utf-8"))

  def _normalize_asset(
      self,
      raw: Dict[str, Any],
      index: int,
      defaults: Dict[str, Any],
  ) -> GameAssetPrompt:
    try:
      prompt = raw["prompt"].strip()
    except KeyError as exc:
      raise KeyError(f"Asset #{index + 1} is missing a 'prompt'") from exc
    name = raw.get("name") or raw.get("filename") or f"asset_{index:03d}"
    negative_prompt = raw.get("negative_prompt") or raw.get("negativePrompt") or ""
    target_width = int(raw.get("width", defaults["width"]))
    target_height = int(raw.get("height", defaults["height"]))
    render_width, render_height, render_scale = self._resolve_render_dimensions(
        raw,
        target_width,
        target_height,
        defaults,
    )
    steps = int(raw.get("steps", defaults["steps"]))
    cfg_scale = float(raw.get("cfg_scale", raw.get("cfgScale", defaults["cfg"])))
    sampler = str(raw.get("sampler", defaults["sampler"]))
    scheduler = str(raw.get("scheduler", defaults["scheduler"]))
    seed_value = raw.get("seed")
    seed = int(seed_value if seed_value is not None else random.randint(0, 2**32 - 1))
    return GameAssetPrompt(
        name=name,
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=render_width,
        height=render_height,
        target_width=target_width,
        target_height=target_height,
        render_scale=render_scale,
        steps=steps,
        cfg_scale=cfg_scale,
        sampler=sampler,
        scheduler=scheduler,
        seed=seed,
    )

  def _resolve_render_dimensions(
      self,
      raw: Dict[str, Any],
      base_width: int,
      base_height: int,
      defaults: Dict[str, Any],
  ) -> tuple[int, int, float]:
    render_width = raw.get("render_width")
    render_height = raw.get("render_height")
    render_scale = float(raw.get("render_scale", defaults["render_scale"]) or 1.0)
    min_render = raw.get("min_render_size", defaults["min_render_size"]) or 0
    max_render = raw.get("max_render_size", defaults["max_render_size"]) or 0
    render_multiple = int(raw.get("render_multiple", defaults["render_multiple"]) or 8)

    if render_width is None and render_height is None:
      render_width = base_width * render_scale
      render_height = base_height * render_scale
    else:
      render_width = float(render_width or base_width)
      render_height = float(render_height or base_height)

    render_width, render_height = self._constrain_render_dimensions(
        float(render_width),
        float(render_height),
        base_width,
        base_height,
        float(min_render) if min_render else 0.0,
        float(max_render) if max_render else 0.0,
        render_multiple,
    )
    scale = 1.0
    if base_width > 0 and base_height > 0:
      scale = max(render_width / base_width, render_height / base_height)
    return render_width, render_height, max(scale, 1.0)

  def _constrain_render_dimensions(
      self,
      render_width: float,
      render_height: float,
      base_width: int,
      base_height: int,
      min_render: float,
      max_render: float,
      render_multiple: int,
  ) -> tuple[int, int]:
    render_width = max(float(base_width), float(render_width))
    render_height = max(float(base_height), float(render_height))
    longest = max(render_width, render_height)
    if min_render and longest < min_render:
      scale = float(min_render) / longest
      render_width *= scale
      render_height *= scale
      longest = max(render_width, render_height)
    if max_render and longest > max_render:
      scale = float(max_render) / longest
      render_width *= scale
      render_height *= scale
    render_width = _round_to_multiple(render_width, render_multiple)
    render_height = _round_to_multiple(render_height, render_multiple)
    render_width = max(base_width, int(render_width))
    render_height = max(base_height, int(render_height))
    return render_width, render_height

  def load(
      self,
      json_source: str,
      fallback_width: int,
      fallback_height: int,
      fallback_steps: int,
      fallback_cfg: float,
      fallback_sampler: str,
      fallback_scheduler: str,
  ):
    data = self._read_json(json_source)
    if isinstance(data, dict):
      assets = [data]
    elif isinstance(data, list):
      assets = list(data)
    else:
      raise TypeError("JSON root must be an object or an array")

    template_defaults = data if isinstance(data, dict) else {}
    defaults = {
        "width": fallback_width,
        "height": fallback_height,
        "steps": fallback_steps,
        "cfg": fallback_cfg,
        "sampler": fallback_sampler,
        "scheduler": fallback_scheduler,
        "render_scale": float(template_defaults.get("render_scale", 1.0) or 1.0),
        "min_render_size": template_defaults.get("min_render_size", 0),
        "max_render_size": template_defaults.get("max_render_size", 0),
        "render_multiple": int(template_defaults.get("render_multiple", 8) or 8),
    }

    normalized = [self._normalize_asset(asset, idx, defaults) for idx, asset in enumerate(assets)]
    return (normalized,)


class GameAssetBatchRenderer:
  """Render each JSON entry through the standard Stable Diffusion pipeline."""

  @classmethod
  def INPUT_TYPES(cls):
    return {
        "required": {
            "model": ("MODEL",),
            "clip": ("CLIP",),
            "vae": ("VAE",),
            "assets": ("GAME_ASSET_LIST",),
            "base_negative_prompt": (
                "STRING",
                {"multiline": True, "default": ""},
            ),
            "batch_preview_limit": (
                "INT",
                {"default": 4, "min": 1, "max": 32},
            ),
        }
    }

  RETURN_TYPES = ("IMAGE", "STRING")
  RETURN_NAMES = ("preview", "filenames")
  FUNCTION = "render"
  CATEGORY = "Dustland/Game Assets"

  def _get_conditioning(self, clip: comfy.sd.CLIP, prompt: str):
    text_encoder = nodes.CLIPTextEncode()
    cond, = text_encoder.encode(clip, prompt)
    return cond

  def _decode_latent(self, vae, latent):
    decoder = nodes.VAEDecode()
    image, = decoder.decode(vae, latent)
    return image

  def _build_latent(self, width: int, height: int):
    latent_builder = nodes.EmptyLatentImage()
    latent, = latent_builder.generate(width, height, 1)
    return latent

  def _resize_image(self, image: torch.Tensor, width: int, height: int) -> torch.Tensor:
    if not isinstance(image, torch.Tensor):
      return image
    if image.ndim != 4:
      return image
    _, current_height, current_width, _ = image.shape
    if current_width == width and current_height == height:
      return image
    tensor = image.permute(0, 3, 1, 2)
    resized = F.interpolate(tensor, size=(height, width), **_INTERPOLATE_KWARGS)
    return resized.permute(0, 2, 3, 1)

  def render(
      self,
      model,
      clip,
      vae,
      assets: Iterable[GameAssetPrompt],
      base_negative_prompt: str,
      batch_preview_limit: int,
  ):
    images: List[torch.Tensor] = []
    filenames: List[str] = []
    saver = nodes.SaveImage()

    for index, asset in enumerate(assets):
      positive = self._get_conditioning(clip, asset.prompt)
      negative_prompt = "\n".join(filter(None, [base_negative_prompt.strip(), asset.negative_prompt.strip()]))
      negative = self._get_conditioning(clip, negative_prompt) if negative_prompt else self._get_conditioning(clip, "")

      latent = self._build_latent(asset.width, asset.height)
      sampler = nodes.common_ksampler
      latent_out = sampler(
          model=model,
          seed=asset.seed,
          steps=asset.steps,
          cfg=asset.cfg_scale,
          sampler_name=asset.sampler,
          scheduler=asset.scheduler,
          positive=positive,
          negative=negative,
          latent=latent,
      )[0]

      image = self._decode_latent(vae, latent_out)
      image = self._resize_image(image, asset.target_width, asset.target_height)
      save_results = saver.save_images(image, filename_prefix=asset.name)
      filenames.extend(result["filename"] for result in save_results["ui"]["images"])

      if len(images) < batch_preview_limit:
        images.append(image)

    if not images:
      raise RuntimeError("No images were generated from the provided JSON")

    preview = images[0]
    joined_names = "\n".join(filenames)
    return (preview, joined_names)


NODE_CLASS_MAPPINGS = {
    "GameAssetJSONLoader": GameAssetJSONLoader,
    "GameAssetBatchRenderer": GameAssetBatchRenderer,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "GameAssetJSONLoader": "Dustland Game Asset JSON Loader",
    "GameAssetBatchRenderer": "Dustland Game Asset Batch Renderer",
}

"""Custom ComfyUI nodes for generating game art batches from JSON prompts.

These nodes allow Dustland creators to feed a JSON description of assets into
ComfyUI and automatically render each item with its own prompt, resolution,
seed, and filename.  Copy this file into your ComfyUI installation under
``custom_nodes`` to make the nodes available in the UI.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List

import comfy.sd
import comfy.utils
import folder_paths
import nodes
import torch


@dataclass
class GameAssetPrompt:
  """Description of a single asset to generate."""

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
    width = int(raw.get("width", defaults["width"]))
    height = int(raw.get("height", defaults["height"]))
    steps = int(raw.get("steps", defaults["steps"]))
    cfg_scale = float(raw.get("cfg_scale", raw.get("cfgScale", defaults["cfg"])))
    sampler = str(raw.get("sampler", defaults["sampler"]))
    scheduler = str(raw.get("scheduler", defaults["scheduler"]))
    seed_value = raw.get("seed")
    seed = int(seed_value if seed_value is not None else comfy.utils.random_seed())
    return GameAssetPrompt(
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
    )

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

    defaults = {
        "width": fallback_width,
        "height": fallback_height,
        "steps": fallback_steps,
        "cfg": fallback_cfg,
        "sampler": fallback_sampler,
        "scheduler": fallback_scheduler,
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
      save_results = saver.save_images(image, filename_prefix=asset.name)
      filenames.extend(result["filename"] for result in save_results)

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

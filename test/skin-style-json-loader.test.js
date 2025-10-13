import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

test('SkinStyleJSONLoader merges template fragments in arrays', () => {
  const pythonScript = String.raw`
import json
import pathlib
import sys
import tempfile
import types

tmpdir = tempfile.TemporaryDirectory()
sys.modules['folder_paths'] = types.SimpleNamespace(
    get_full_path=lambda category, name: None,
    get_output_directory=lambda: tmpdir.name,
)

from scripts.comfyui.dustland_skin_batch import SkinStyleJSONLoader

loader = SkinStyleJSONLoader()
json_source = json.dumps([
    {
        "base_prompt": "base prompt",
        "styles": [{"id": "alpha", "prompt": "primary look"}]
    },
    {
        "assets": [
            {
                "slot": "panel_background",
                "title": "Panel backdrop",
                "prompt": "panel texture",
                "width": 64,
                "height": 64
            }
        ]
    }
])
prompts, summary = loader.load(json_source, "", "manifest", 64, 64, 10, 7.0, "sampler", "scheduler")
assert len(prompts) == 1, prompts
prompt = prompts[0]
assert prompt.slot == "panel_background"
manifest_path = pathlib.Path(tmpdir.name) / "manifest_alpha.json"
assert manifest_path.exists(), manifest_path
manifest = json.loads(manifest_path.read_text())
assert manifest["panel_background"] == f"{prompt.name}.png"
print("success")
tmpdir.cleanup()
`;

  const result = execFileSync('python3', ['-'], {
    cwd: repoRoot,
    input: pythonScript,
    encoding: 'utf8',
  });

  assert.match(result, /success/);
});

test('run-skin-workflow generator matches loader merge semantics', () => {
  const pythonScript = String.raw`
import importlib.util
import json
import pathlib
import tempfile
import types
import sys
import typing

tmpdir = tempfile.TemporaryDirectory()
sys.modules['websocket'] = types.SimpleNamespace(WebSocket=type('WebSocket', (), {}))
sys.modules['typing'] = typing
script_path = pathlib.Path('scripts/run-skin-workflow.py')
spec = importlib.util.spec_from_file_location('run_skin_workflow', script_path)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)

generator = module.SkinStylePromptGenerator()
template = json.dumps([
    {
        "styles": [{"id": "alpha", "prompt": "look"}]
    },
    {
        "assets": [
            {
                "slot": "panel",
                "prompt": "panel texture",
                "width": 128,
                "height": 128
            }
        ],
        "manifest_filename_prefix": "custom"
    }
])

prompts, summary = generator.generate(
    style_plan_source=template,
    manifest_filename_prefix='ignored',
    output_dir=pathlib.Path(tmpdir.name),
    fallback_width=64,
    fallback_height=64,
    fallback_steps=12,
    fallback_cfg=6.5,
    fallback_sampler='sampler',
    fallback_scheduler='scheduler',
)

assert len(prompts) == 1, prompts
prompt = prompts[0]
assert prompt.width == 128 and prompt.height == 128
manifest_path = pathlib.Path(tmpdir.name) / 'custom_alpha.json'
assert manifest_path.exists(), manifest_path
print('success')
tmpdir.cleanup()
`;

  const result = execFileSync('python3', ['-'], {
    cwd: repoRoot,
    input: pythonScript,
    encoding: 'utf8',
  });

  assert.match(result, /success/);
});

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

from comfyui.custom_nodes.dustland_skin_batch import SkinStyleJSONLoader

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
manifest_path = pathlib.Path(tmpdir.name) / "alpha" / "manifest_alpha.json"
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
script_path = pathlib.Path('comfyui/scripts/run-skin-workflow.py')
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

assert len(prompts) >= 1, prompts
target = next((p for p in prompts if p.slot == 'panel'), None)
assert target is not None, prompts
assert target.width == 128 and target.height == 128
manifest_path = pathlib.Path(tmpdir.name) / 'alpha' / 'custom_alpha.json'
assert manifest_path.exists(), manifest_path
manifest = json.loads(manifest_path.read_text())
assert manifest['panel'] == f"alpha/{target.metadata['file_stem']}.png"
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

test('run-skin-workflow auto slots expose label-driven descriptions', () => {
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
script_path = pathlib.Path('comfyui/scripts/run-skin-workflow.py')
spec = importlib.util.spec_from_file_location('run_skin_workflow', script_path)
module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = module
spec.loader.exec_module(module)

generator = module.SkinStylePromptGenerator()
template = json.dumps({
    "styles": [{"id": "alpha"}],
    "assets": [
        {
            "slot": "panel_background",
            "prompt": "panel texture",
            "width": 64,
            "height": 64
        }
    ]
})

prompts, summary = generator.generate(
    style_plan_source=template,
    manifest_filename_prefix='autogen',
    output_dir=pathlib.Path(tmpdir.name),
    fallback_width=64,
    fallback_height=64,
    fallback_steps=10,
    fallback_cfg=6.5,
    fallback_sampler='sampler',
    fallback_scheduler='scheduler',
)

target = next((p for p in prompts if p.slot == 'controls-toggle'), None)
assert target is not None, 'controls-toggle slot not discovered'
metadata = target.metadata or {}
assert metadata.get('description'), metadata
assert 'Controls Toggle' in metadata['description']
assert metadata.get('slot_label_title') == 'Button Label', metadata
assert 'button-label' in metadata.get('slot_labels', []), metadata
assert 'Button Label' in target.prompt, target.prompt
print(metadata['description'])
tmpdir.cleanup()
`;

  const result = execFileSync('python3', ['-'], {
    cwd: repoRoot,
    input: pythonScript,
    encoding: 'utf8',
  });

  assert.match(result, /Controls Toggle/);
});

test('SkinStyleJSONLoader accepts plain asset arrays', () => {
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

from comfyui.custom_nodes.dustland_skin_batch import SkinStyleJSONLoader

loader = SkinStyleJSONLoader()
json_source = json.dumps([
    {
        "name": "ui_button_start",
        "prompt": "pixel start button",
        "negative_prompt": "blurry",
        "width": 512,
        "height": 256
    },
    {
        "name": "enemy_drone",
        "prompt": "hostile drone sprite",
        "width": 640,
        "height": 640
    }
])

prompts, summary = loader.load(json_source, "", "manifest", 256, 256, 20, 6.5, "sampler", "scheduler")
assert len(prompts) == 2, prompts
assert all(p.style_id == 'default' for p in prompts)
names = {p.name for p in prompts}
assert 'default/ui_button_start' in names
assert 'default/enemy_drone' in names
slots = {p.slot for p in prompts}
assert 'ui_button_start' in slots
assert 'enemy_drone' in slots

manifest_path = pathlib.Path(tmpdir.name) / 'default' / 'manifest_default.json'
assert manifest_path.exists(), manifest_path

tmpdir.cleanup()
`;

  const result = execFileSync('python3', ['-'], {
    cwd: repoRoot,
    input: pythonScript,
    encoding: 'utf8',
  });

  assert.strictEqual(result.trim(), '');
});

  test('SkinStyleJSONLoader loads the documented game asset batch example', () => {
    const examplePath = path.join(repoRoot, 'comfyui/examples/game_asset_batch.json');
  const escapedPath = examplePath.replace(/\\/g, '\\\\');
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

from comfyui.custom_nodes.dustland_skin_batch import SkinStyleJSONLoader

loader = SkinStyleJSONLoader()
json_source = r'${escapedPath}'
prompts, summary = loader.load(json_source, "", "manifest", 256, 256, 30, 7.0, "sampler", "scheduler")
assert len(prompts) == 2, prompts
first, second = prompts
assert first.slot == 'ui_button_start'
assert first.width == 512 and first.height == 512
assert first.steps == 28 and abs(first.cfg_scale - 6.5) < 1e-6
assert first.sampler == 'euler' and first.scheduler == 'normal'
assert second.slot == 'enemy_drone'
assert second.width == 640 and second.height == 640
manifest_path = pathlib.Path(tmpdir.name) / 'default' / 'manifest_default.json'
assert manifest_path.exists(), manifest_path
manifest = json.loads(manifest_path.read_text())
assert manifest['ui_button_start'].endswith('/ui_button_start.png')
assert manifest['enemy_drone'].endswith('/enemy_drone.png')
assert 'Saved manifests:' in summary
print('success')
tmpdir.cleanup()
`;

  const result = execFileSync('python3', ['-'], {
    cwd: repoRoot,
    input: pythonScript,
    encoding: 'utf8',
  });

  assert.strictEqual(result.trim(), 'success');
});

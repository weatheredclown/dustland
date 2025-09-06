import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function runScript(args, cwd){
  execFileSync('node', [path.join(repoRoot, 'scripts', 'module-json.js'), ...args], { cwd });
}

test('module-json export/import round trip', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'modjson-'));
  try {
    const moduleFile = path.join(tmp, 'sample.module.js');
    const jsonFile = path.join(tmp, 'data', 'modules', 'sample.json');
    const original = { hello: 'world', portraitSheet: 'assets/portraits/custom.png', prompt: 'rusted bot', world: [[0,1],[2,3]] };
    const moduleContent = `const DATA = \`\n${JSON.stringify(original, null, 2)}\n\`;\nexport function postLoad() {}`;
    fs.writeFileSync(moduleFile, moduleContent);
    runScript(['export', moduleFile], tmp);
    const exported = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    assert.strictEqual(exported.module, moduleFile);
    assert.strictEqual(exported.name, 'sample-module');
    const { name } = exported;
    assert.strictEqual(exported.portraitSheet, 'assets/portraits/custom.png');
    assert.strictEqual(exported.prompt, 'rusted bot');
    assert.deepStrictEqual(exported.world, ['🏝🪨', '🌊🌿']);
    delete exported.module;
    delete exported.name;
    assert.deepStrictEqual(exported, { ...original, world: ['🏝🪨', '🌊🌿'] });
    exported.hello = 'mars';
    exported.module = moduleFile;
    exported.name = name;
    fs.writeFileSync(jsonFile, JSON.stringify(exported, null, 2));
    runScript(['import', moduleFile], tmp);
    const updated = fs.readFileSync(moduleFile, 'utf8');
    const match = updated.match(/const DATA = `([\s\S]*?)`;/);
    assert(match);
    const obj = JSON.parse(match[1]);
    assert.strictEqual(obj.hello, 'mars');
    assert.strictEqual(obj.portraitSheet, 'assets/portraits/custom.png');
    assert.strictEqual(obj.prompt, 'rusted bot');
    assert.deepStrictEqual(obj.world, [[0,1],[2,3]]);
    assert.strictEqual(obj.module, undefined);
    assert.strictEqual(obj.name, 'sample-module');
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

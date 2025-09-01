import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const modulesDir = path.join('modules');
const dataDir = path.join('data', 'modules');
const moduleFile = path.join(modulesDir, 'tmp-test.module.js');
const jsonFile = path.join(dataDir, 'tmp-test.json');
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function runScript(args, cwd){
  execFileSync('node', [path.join(repoRoot, 'scripts', 'module-json.js'), ...args], { cwd });
}

test('module-json export/import round trip', () => {
  const original = { hello: 'world', portraitSheet: 'assets/portraits/custom.png' };
  const moduleContent = `const DATA = \`\n${JSON.stringify(original, null, 2)}\n\`;\nexport function postLoad() {}`;
  fs.writeFileSync(moduleFile, moduleContent);
  try {
    execSync(`node scripts/module-json.js export ${moduleFile}`);
    const exported = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    assert.strictEqual(exported.module, moduleFile);
    assert.strictEqual(exported.name, 'tmp-test-module');
    const { name } = exported;
    assert.strictEqual(exported.portraitSheet, 'assets/portraits/custom.png');
    delete exported.module;
    delete exported.name;
    assert.deepStrictEqual(exported, original);
    exported.hello = 'mars';
    exported.module = moduleFile;
    exported.name = name;
    fs.writeFileSync(jsonFile, JSON.stringify(exported, null, 2));
    execSync(`node scripts/module-json.js import ${moduleFile}`);
    const updated = fs.readFileSync(moduleFile, 'utf8');
    const match = updated.match(/const DATA = `([\s\S]*?)`;/);
    assert(match);
    const obj = JSON.parse(match[1]);
    assert.strictEqual(obj.hello, 'mars');
    assert.strictEqual(obj.portraitSheet, 'assets/portraits/custom.png');
    assert.strictEqual(obj.module, undefined);
    assert.strictEqual(obj.name, 'tmp-test-module');
  } finally {
    fs.rmSync(moduleFile, { force: true });
    fs.rmSync(jsonFile, { force: true });
  }
});

test('module-json export/import round trip in temp workspace', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'modjson-'));
  try {
    const tmpModule = path.join(tmp, 'sample.module.js');
    const initial = 'const DATA = `\n{\n  "msg": "hello"\n}`;';
    fs.writeFileSync(tmpModule, initial);
    runScript(['export', tmpModule], tmp);
    const outJson = path.join(tmp, 'data', 'modules', 'sample.json');
    const exported = JSON.parse(fs.readFileSync(outJson, 'utf8'));
    assert.strictEqual(exported.msg, 'hello');
    exported.msg = 'world';
    fs.writeFileSync(outJson, JSON.stringify(exported, null, 2));
    runScript(['import', tmpModule], tmp);
    const updated = fs.readFileSync(tmpModule, 'utf8');
    assert.ok(updated.includes('"msg": "world"'));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

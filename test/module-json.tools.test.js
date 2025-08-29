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
    const initial = 'const DATA = `\n{\n  "msg": "hello"\n}`;';
    fs.writeFileSync(moduleFile, initial);
    runScript(['export', moduleFile], tmp);
    const jsonFile = path.join(tmp, 'data', 'modules', 'sample.json');
    const exported = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    assert.strictEqual(exported.msg, 'hello');
    exported.msg = 'world';
    fs.writeFileSync(jsonFile, JSON.stringify(exported, null, 2));
    runScript(['import', moduleFile], tmp);
    const updated = fs.readFileSync(moduleFile, 'utf8');
    assert.ok(updated.includes('"msg": "world"'));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

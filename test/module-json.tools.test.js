import assert from 'node:assert';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const modulesDir = path.join('modules');
const dataDir = path.join('data', 'modules');
const moduleFile = path.join(modulesDir, 'tmp-test.module.js');
const jsonFile = path.join(dataDir, 'tmp-test.json');

test('module-json export/import round trip', () => {
  const original = { hello: 'world' };
  const moduleContent = `const DATA = \`\n${JSON.stringify(original, null, 2)}\n\`;\nexport function postLoad() {}`;
  fs.writeFileSync(moduleFile, moduleContent);
  try {
    execSync(`node scripts/module-json.js export ${moduleFile}`);
    const exported = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
    assert.strictEqual(exported.module, moduleFile);
    delete exported.module;
    assert.deepStrictEqual(exported, original);
    exported.hello = 'mars';
    exported.module = moduleFile;
    fs.writeFileSync(jsonFile, JSON.stringify(exported, null, 2));
    execSync(`node scripts/module-json.js import ${moduleFile}`);
    const updated = fs.readFileSync(moduleFile, 'utf8');
    const match = updated.match(/const DATA = `([\s\S]*?)`;/);
    assert(match);
    const obj = JSON.parse(match[1]);
    assert.strictEqual(obj.hello, 'mars');
    assert.strictEqual(obj.module, undefined);
  } finally {
    fs.rmSync(moduleFile, { force: true });
    fs.rmSync(jsonFile, { force: true });
  }
});

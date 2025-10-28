import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {analyzeBuild, mapOutputPath} from '../scripts/supporting/build-health.js';

function createProjectRoot() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'dustland-build-health-'));
}

test('mapOutputPath resolves known destinations', () => {
  const root = '/tmp/project';
  const scripts = mapOutputPath(root, 'scripts/example.ts');
  assert.ok(scripts?.endsWith('scripts/example.js'));

  const components = mapOutputPath(root, 'components/panel/view.ts');
  assert.ok(components?.endsWith('components/panel/view.js'));

  const modules = mapOutputPath(root, 'modules/demo/module.ts');
  assert.ok(modules?.endsWith('modules/demo/module.js'));

  const musicDemo = mapOutputPath(root, 'music-demo.ts');
  assert.ok(musicDemo?.endsWith('music-demo.js'));

  assert.equal(mapOutputPath(root, 'scripts/types.d.ts'), null);
});

test('analyzeBuild flags missing, stale, and unmatched outputs', () => {
  const projectRoot = createProjectRoot();
  const srcScriptsDir = path.join(projectRoot, 'ts-src/scripts');
  fs.mkdirSync(srcScriptsDir, {recursive: true});
  const srcFile = path.join(srcScriptsDir, 'sample.ts');
  fs.writeFileSync(srcFile, 'export const sample = 1;\n');

  const unmatchedDir = path.join(projectRoot, 'ts-src/custom');
  fs.mkdirSync(unmatchedDir, {recursive: true});
  const unmatchedFile = path.join(unmatchedDir, 'extra.ts');
  fs.writeFileSync(unmatchedFile, 'export const extra = 1;\n');

  let analysis = analyzeBuild(projectRoot);
  assert.equal(analysis.total, 2);
  assert.equal(analysis.checked, 1);
  assert.equal(analysis.missing.length, 1);
  assert.equal(analysis.missing[0].dest, 'scripts/sample.js');
  assert.deepEqual(analysis.unmatched, ['custom/extra.ts']);

  fs.unlinkSync(unmatchedFile);
  analysis = analyzeBuild(projectRoot);
  assert.equal(analysis.total, 1);
  assert.equal(analysis.checked, 1);
  assert.equal(analysis.unmatched.length, 0);
  assert.equal(analysis.missing.length, 1);

  const outputFile = path.join(projectRoot, 'scripts/sample.js');
  fs.mkdirSync(path.dirname(outputFile), {recursive: true});
  fs.writeFileSync(outputFile, 'export const sample = 1;\n');
  const past = new Date(Date.now() - 10_000);
  fs.utimesSync(outputFile, past, past);

  analysis = analyzeBuild(projectRoot);
  assert.equal(analysis.missing.length, 0);
  assert.equal(analysis.stale.length, 1);
  assert.equal(analysis.stale[0].dest, 'scripts/sample.js');

  const future = new Date(Date.now() + 10_000);
  fs.utimesSync(outputFile, future, future);

  analysis = analyzeBuild(projectRoot);
  assert.equal(analysis.missing.length, 0);
  assert.equal(analysis.stale.length, 0);
  assert.equal(analysis.checked, 1);
});

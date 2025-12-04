import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const tsSrcDir = path.join(repoRoot, 'ts-src');

async function collectTypeScriptFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectTypeScriptFiles(entryPath);
    }
    return entry.name.endsWith('.ts') ? [entryPath] : [];
  }));
  return files.flat();
}

test('TypeScript sources stay free of @ts-nocheck', async () => {
  const files = await collectTypeScriptFiles(tsSrcDir);
  const offenders = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    if (!content.includes('@ts-nocheck')) {
      continue;
    }

    const relativePath = path.relative(repoRoot, filePath);
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (line.includes('@ts-nocheck')) {
        offenders.push(`${relativePath}:${index + 1}`);
      }
    });
  }

  const message = offenders.length === 0
    ? 'All TypeScript files are free of @ts-nocheck headers.'
    : `@ts-nocheck headers found in:\n - ${offenders.join('\n - ')}`;

  assert.equal(offenders.length, 0, message);
});

import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tsSourceDir = path.join(rootDir, 'ts-src');
const buildDir = path.join(rootDir, 'build');

async function collectTsFiles(dir) {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectTsFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(entryPath);
    }
  }
  return files;
}

async function removePreviousOutputs(tsFiles) {
  for (const tsFile of tsFiles) {
    const relative = path.relative(tsSourceDir, tsFile);
    const outputRelative = relative.replace(/\.ts$/u, '.js');
    const outputPath = path.join(rootDir, outputRelative);
    await fs.rm(outputPath, {force: true});
  }
}

async function copyFromBuild(srcDir, destDir) {
  const entries = await fs.readdir(srcDir, {withFileTypes: true});
  await fs.mkdir(destDir, {recursive: true});
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyFromBuild(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.mkdir(path.dirname(destPath), {recursive: true});
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function removeBuildDirectory() {
  await fs.rm(buildDir, {recursive: true, force: true});
}

async function main() {
  const buildExists = await fs.access(buildDir).then(() => true).catch(() => false);
  if (!buildExists) {
    throw new Error('TypeScript build output not found. Run "tsc" before syncing.');
  }
  const tsFiles = await collectTsFiles(tsSourceDir);
  await removePreviousOutputs(tsFiles);
  await copyFromBuild(buildDir, rootDir);
  await removeBuildDirectory();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

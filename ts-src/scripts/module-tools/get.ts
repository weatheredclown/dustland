import process from 'node:process';

import { readModule, getByPath, type ModuleDocument, type JsonValue } from './utils.js';

const [file, path] = process.argv.slice(2);
if (!file) {
  console.error('Usage: node scripts/module-tools/get.js <moduleFile> [path]');
  process.exit(1);
}
const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const value: JsonValue | undefined = getByPath(data, path);
console.log(JSON.stringify(value, null, 2));

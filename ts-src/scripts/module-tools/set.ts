import process from 'node:process';

import { readModule, setByPath, parseValue, type ModuleDocument } from './utils.js';

const [file, path, value] = process.argv.slice(2);
if (!file || !path || value === undefined) {
  console.error('Usage: node scripts/module-tools/set.js <moduleFile> <path> <value>');
  process.exit(1);
}
const mod = readModule<ModuleDocument>(file);
const data = mod.data;
setByPath(data, path, parseValue(value));
mod.write(data);

import process from 'node:process';

import { readModule, getByPath, removeIndex, type ModuleDocument, type ModuleEntity } from './utils.js';

const [file, indexStr] = process.argv.slice(2);
if (!file || indexStr === undefined) {
  console.error('Usage: node scripts/module-tools/delete-building.js <moduleFile> <index>');
  process.exit(1);
}
const index = Number(indexStr);
const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const buildingsValue = getByPath(data, 'buildings');
if (!Array.isArray(buildingsValue) || buildingsValue[index] === undefined) {
  console.error('Building not found');
  process.exit(1);
}
removeIndex<ModuleEntity>(buildingsValue as ModuleEntity[], index);
mod.write(data);

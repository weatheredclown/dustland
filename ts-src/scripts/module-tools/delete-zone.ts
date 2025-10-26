/// <reference types="node" />
import { readModule, getByPath, removeIndex, type ModuleDocument, type ModuleEntity } from './utils.js';

const [file, indexStr] = process.argv.slice(2);
if (!file || indexStr === undefined) {
  console.error('Usage: node scripts/module-tools/delete-zone.js <moduleFile> <index>');
  process.exit(1);
}
const index = Number(indexStr);
const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const zonesValue = getByPath(data, 'zones');
if (!Array.isArray(zonesValue) || !zonesValue[index]) {
  console.error('Zone not found');
  process.exit(1);
}
removeIndex<ModuleEntity>(zonesValue as ModuleEntity[], index);
mod.write(data);

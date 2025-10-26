/// <reference types="node" />
import { readModule, getByPath, setByPath, parseValue, type ModuleDocument, type ModuleEntity } from './utils.js';

const [file, indexStr, path, value] = process.argv.slice(2);
if (!file || indexStr === undefined || !path || value === undefined) {
  console.error('Usage: node scripts/module-tools/edit-zone.js <moduleFile> <index> <path> <value>');
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
const zones = zonesValue as ModuleEntity[];
setByPath(zones[index], path, parseValue(value));
mod.write(data);

/// <reference types="node" />
import { readModule, getByPath, setByPath, parseValue, type ModuleDocument, type ModuleEntity } from './utils.js';

const [file, indexStr, path, value] = process.argv.slice(2);
if (!file || indexStr === undefined || !path || value === undefined) {
  console.error('Usage: node scripts/module-tools/edit-building.js <moduleFile> <index> <path> <value>');
  process.exit(1);
}
const index = Number(indexStr);
const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const buildingsValue = getByPath(data, 'buildings');
if (!Array.isArray(buildingsValue) || !buildingsValue[index]) {
  console.error('Building not found');
  process.exit(1);
}
const buildings = buildingsValue as ModuleEntity[];
setByPath(buildings[index], path, parseValue(value));
mod.write(data);

import process from 'node:process';

import { readModule, appendByPath, ensureArray, parseKeyValueArgs, type ModuleDocument, type ModuleEntity } from './utils.js';
import { validate } from './schema.js';

const [file, ...fields] = process.argv.slice(2);
if (!file || fields.length === 0) {
  console.error('Usage: node scripts/module-tools/add-building.js <moduleFile> key=value [key=value ...]');
  process.exit(1);
}
const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const building: ModuleEntity = parseKeyValueArgs(fields);
validate('building', building);
ensureArray(data, 'buildings');
appendByPath(data, 'buildings', building);
mod.write(data);

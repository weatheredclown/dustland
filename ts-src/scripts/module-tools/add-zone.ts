/// <reference types="node" />
import { readModule, appendByPath, ensureArray, parseKeyValueArgs, type ModuleDocument, type ModuleEntity } from './utils.js';
import { validate } from './schema.js';

const [file, ...fields] = process.argv.slice(2);
if (!file || fields.length === 0) {
  console.error('Usage: node scripts/module-tools/add-zone.js <moduleFile> key=value [key=value ...]');
  process.exit(1);
}
const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const zone: ModuleEntity = parseKeyValueArgs(fields);
validate('zone', zone);
ensureArray(data, 'zones');
appendByPath(data, 'zones', zone);
mod.write(data);

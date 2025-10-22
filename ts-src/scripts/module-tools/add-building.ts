// @ts-nocheck
import { readModule, appendByPath, ensureArray, parseKeyValueArgs } from './utils.js';
import { validate } from './schema.js';

const [file, ...fields] = process.argv.slice(2);
if (!file || fields.length === 0) {
  console.error('Usage: node scripts/module-tools/add-building.js <moduleFile> key=value [key=value ...]');
  process.exit(1);
}
const mod = readModule(file);
const building = parseKeyValueArgs(fields);
validate('building', building);
ensureArray(mod.data, 'buildings');
appendByPath(mod.data, 'buildings', building);
mod.write(mod.data);

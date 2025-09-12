import { readModule, appendByPath, ensureArray, parseKeyValueArgs } from './utils.js';
import { validate } from './schema.js';

const [file, ...fields] = process.argv.slice(2);
if (!file || fields.length === 0) {
  console.error('Usage: node scripts/module-tools/add-zone.js <moduleFile> key=value [key=value ...]');
  process.exit(1);
}
const mod = readModule(file);
const zone = parseKeyValueArgs(fields);
validate('zone', zone);
ensureArray(mod.data, 'zones');
appendByPath(mod.data, 'zones', zone);
mod.write(mod.data);

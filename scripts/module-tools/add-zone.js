import { readModule, appendByPath, ensureArray } from './utils.js';
import { validate } from './schema.js';

const [file, zStr] = process.argv.slice(2);
if (!file || !zStr) {
  console.error('Usage: node scripts/module-tools/add-zone.js <moduleFile> <zoneJson>');
  process.exit(1);
}
const mod = readModule(file);
const zone = JSON.parse(zStr);
validate('zone', zone);
ensureArray(mod.data, 'zones');
appendByPath(mod.data, 'zones', zone);
mod.write(mod.data);

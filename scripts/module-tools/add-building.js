import { readModule, appendByPath, ensureArray } from './utils.js';
import { validate } from './schema.js';

const [file, bStr] = process.argv.slice(2);
if (!file || !bStr) {
  console.error('Usage: node scripts/module-tools/add-building.js <moduleFile> <buildingJson>');
  process.exit(1);
}
const mod = readModule(file);
const building = JSON.parse(bStr);
validate('building', building);
ensureArray(mod.data, 'buildings');
appendByPath(mod.data, 'buildings', building);
mod.write(mod.data);

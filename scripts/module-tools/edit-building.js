import { readModule, getByPath, setByPath, parseValue } from './utils.js';

const [file, indexStr, path, value] = process.argv.slice(2);
if (!file || indexStr === undefined || !path || value === undefined) {
  console.error('Usage: node scripts/module-tools/edit-building.js <moduleFile> <index> <path> <value>');
  process.exit(1);
}
const index = Number(indexStr);
const mod = readModule(file);
const buildings = getByPath(mod.data, 'buildings') || [];
if (!buildings[index]) {
  console.error('Building not found');
  process.exit(1);
}
setByPath(buildings[index], path, parseValue(value));
mod.write(mod.data);

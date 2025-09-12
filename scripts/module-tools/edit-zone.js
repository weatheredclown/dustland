import { readModule, getByPath, setByPath } from './utils.js';

const [file, indexStr, path, value] = process.argv.slice(2);
if (!file || indexStr === undefined || !path || value === undefined) {
  console.error('Usage: node scripts/module-tools/edit-zone.js <moduleFile> <index> <path> <jsonValue>');
  process.exit(1);
}
const index = Number(indexStr);
const mod = readModule(file);
const zones = getByPath(mod.data, 'zones') || [];
if (!zones[index]) {
  console.error('Zone not found');
  process.exit(1);
}
setByPath(zones[index], path, JSON.parse(value));
mod.write(mod.data);

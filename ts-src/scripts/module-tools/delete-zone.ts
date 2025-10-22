// @ts-nocheck
import { readModule, getByPath, removeIndex } from './utils.js';

const [file, indexStr] = process.argv.slice(2);
if (!file || indexStr === undefined) {
  console.error('Usage: node scripts/module-tools/delete-zone.js <moduleFile> <index>');
  process.exit(1);
}
const index = Number(indexStr);
const mod = readModule(file);
const zones = getByPath(mod.data, 'zones') || [];
if (!zones[index]) {
  console.error('Zone not found');
  process.exit(1);
}
removeIndex(zones, index);
mod.write(mod.data);

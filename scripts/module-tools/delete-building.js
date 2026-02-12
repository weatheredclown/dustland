import process from 'process';
import { readModule, getByPath, removeIndex } from './utils.js';
const [file, indexStr] = process.argv.slice(2);
if (!file || indexStr === undefined) {
    console.error('Usage: node scripts/module-tools/delete-building.js <moduleFile> <index>');
    process.exit(1);
}
const index = Number(indexStr);
const mod = readModule(file);
const data = mod.data;
const buildings = getByPath(data, 'buildings');
if (!Array.isArray(buildings) || buildings[index] === undefined) {
    console.error('Building not found');
    process.exit(1);
}
removeIndex(buildings, index);
mod.write(data);

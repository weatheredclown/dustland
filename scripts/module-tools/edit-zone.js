/// <reference types="node" />
import { readModule, getByPath, setByPath, parseValue } from './utils.js';
const [file, indexStr, path, value] = process.argv.slice(2);
if (!file || indexStr === undefined || !path || value === undefined) {
    console.error('Usage: node scripts/module-tools/edit-zone.js <moduleFile> <index> <path> <value>');
    process.exit(1);
}
const index = Number(indexStr);
const mod = readModule(file);
const data = mod.data;
const zones = getByPath(data, 'zones') || [];
if (!zones[index]) {
    console.error('Zone not found');
    process.exit(1);
}
setByPath(zones[index], path, parseValue(value));
mod.write(data);

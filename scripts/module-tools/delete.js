// @ts-nocheck
import { readModule, getByPath } from './utils.js';
const [file, path] = process.argv.slice(2);
if (!file || !path) {
    console.error('Usage: node scripts/module-tools/delete.js <moduleFile> <path>');
    process.exit(1);
}
const mod = readModule(file);
const parts = path.split('.');
const key = parts.pop();
const parentPath = parts.join('.');
const parent = parentPath ? getByPath(mod.data, parentPath) : mod.data;
if (parent == null) {
    console.error('Parent path not found');
    process.exit(1);
}
if (Array.isArray(parent)) {
    const index = Number(key);
    if (!Number.isInteger(index)) {
        console.error('Array index must be a number');
        process.exit(1);
    }
    if (index < 0 || index >= parent.length) {
        console.error('Array index out of range');
        process.exit(1);
    }
    parent.splice(index, 1);
}
else {
    delete parent[key];
}
mod.write(mod.data);

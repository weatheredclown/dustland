// @ts-nocheck
import { readModule, getByPath } from './utils.js';
const [file, path] = process.argv.slice(2);
if (!file) {
    console.error('Usage: node scripts/module-tools/get.js <moduleFile> [path]');
    process.exit(1);
}
const mod = readModule(file);
const value = getByPath(mod.data, path);
console.log(JSON.stringify(value, null, 2));

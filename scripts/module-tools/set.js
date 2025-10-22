// @ts-nocheck
import { readModule, setByPath, parseValue } from './utils.js';
const [file, path, value] = process.argv.slice(2);
if (!file || !path || value === undefined) {
    console.error('Usage: node scripts/module-tools/set.js <moduleFile> <path> <value>');
    process.exit(1);
}
const mod = readModule(file);
setByPath(mod.data, path, parseValue(value));
mod.write(mod.data);

/// <reference types="node" />
import { readModule, appendByPath, parseValue, parseKeyValueArgs } from './utils.js';
const [file, path, ...values] = process.argv.slice(2);
if (!file || !path || values.length === 0) {
    console.error('Usage: node scripts/module-tools/append.js <moduleFile> <path> <value|key=value...>');
    process.exit(1);
}
const mod = readModule(file);
const data = mod.data;
let val;
if (values.length === 1 && !values[0].includes('=')) {
    val = parseValue(values[0]);
}
else {
    val = parseKeyValueArgs(values);
}
appendByPath(data, path, val);
mod.write(data);

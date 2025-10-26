/// <reference types="node" />
import { readModule, getByPath, type ModuleDocument, type JsonObject } from './utils.js';

const [file, path] = process.argv.slice(2);
if (!file || !path) {
  console.error('Usage: node scripts/module-tools/delete.js <moduleFile> <path>');
  process.exit(1);
}

const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const parts = path.split('.');
const key = parts.pop();
const parentPath = parts.join('.');
const parent = parentPath ? getByPath(data, parentPath) : data;
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
} else {
  delete (parent as JsonObject)[key as keyof JsonObject];
}

mod.write(data);

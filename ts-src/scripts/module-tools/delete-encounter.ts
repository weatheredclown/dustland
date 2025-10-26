/// <reference types="node" />
import { readModule, type ModuleDocument, type JsonObject } from './utils.js';

const [file, map] = process.argv.slice(2);
if (!file || !map) {
  console.error('Usage: node scripts/module-tools/delete-encounter.js <moduleFile> <mapId>');
  process.exit(1);
}

const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const encounters = (data.encounters as JsonObject | undefined) || {};
if (!encounters || typeof encounters !== 'object' || Array.isArray(encounters)) {
  console.error('Module has no encounters to modify.');
  process.exit(1);
}

if (!(map in encounters)) {
  console.error(`Encounter list for ${map} not found.`);
  process.exit(1);
}

delete encounters[map];
if (Object.keys(encounters).length === 0) {
  delete data.encounters;
}

mod.write(data);

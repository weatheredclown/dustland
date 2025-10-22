// @ts-nocheck
import { readModule } from './utils.js';

const [file, map] = process.argv.slice(2);
if (!file || !map) {
  console.error('Usage: node scripts/module-tools/delete-encounter.js <moduleFile> <mapId>');
  process.exit(1);
}

const mod = readModule(file);
const { encounters } = mod.data;
if (!encounters || typeof encounters !== 'object') {
  console.error('Module has no encounters to modify.');
  process.exit(1);
}

if (!(map in encounters)) {
  console.error(`Encounter list for ${map} not found.`);
  process.exit(1);
}

delete encounters[map];
if (Object.keys(encounters).length === 0) {
  delete mod.data.encounters;
}

mod.write(mod.data);

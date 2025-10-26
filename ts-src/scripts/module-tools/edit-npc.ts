/// <reference types="node" />
import { readModule, getByPath, setByPath, findIndexById, parseValue, type ModuleDocument, type ModuleEntity } from './utils.js';

const [file, id, path, value] = process.argv.slice(2);
if (!file || !id || !path || value === undefined) {
  console.error('Usage: node scripts/module-tools/edit-npc.js <moduleFile> <npcId> <path> <value>');
  process.exit(1);
}
const mod = readModule<ModuleDocument>(file);
const data = mod.data;
const npcs = (getByPath(data, 'npcs') as ModuleEntity[]) || [];
const idx = findIndexById(npcs, id);
if (idx === -1) {
  console.error('NPC not found');
  process.exit(1);
}
setByPath(npcs[idx], path, parseValue(value));
mod.write(data);

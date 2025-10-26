/// <reference types="node" />
import { readModule, getByPath, setByPath, findIndexById, parseValue } from './utils.js';

const [file, id, path, value] = process.argv.slice(2);
if (!file || !id || !path || value === undefined) {
  console.error('Usage: node scripts/module-tools/edit-npc.js <moduleFile> <npcId> <path> <value>');
  process.exit(1);
}
const mod = readModule(file);
const data = mod.data as Record<string, unknown>;
const npcs = (getByPath(data, 'npcs') as { id?: string }[]) || [];
const idx = findIndexById(npcs, id);
if (idx === -1) {
  console.error('NPC not found');
  process.exit(1);
}
setByPath(npcs[idx] as Record<string, unknown>, path, parseValue(value));
mod.write(data);

import { readModule, getByPath, setByPath, findIndexById } from './utils.js';

const [file, id, path, value] = process.argv.slice(2);
if (!file || !id || !path || value === undefined) {
  console.error('Usage: node scripts/module-tools/edit-npc.js <moduleFile> <npcId> <path> <jsonValue>');
  process.exit(1);
}
const mod = readModule(file);
const npcs = getByPath(mod.data, 'npcs') || [];
const idx = findIndexById(npcs, id);
if (idx === -1) {
  console.error('NPC not found');
  process.exit(1);
}
setByPath(npcs[idx], path, JSON.parse(value));
mod.write(mod.data);

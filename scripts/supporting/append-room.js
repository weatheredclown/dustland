import fs from 'node:fs';
import path from 'node:path';

if (process.argv.length < 5) {
  console.log('Usage: node scripts/supporting/append-room.js <file> <roomId> <targetRoom>');
  process.exit(1);
}

const [file, id, target] = process.argv.slice(2);
const filePath = path.resolve(file);
const mod = JSON.parse(fs.readFileSync(filePath, 'utf8'));

mod.interiors = mod.interiors || [];
mod.portals = mod.portals || [];

mod.interiors.push({
  id,
  w: 4,
  h: 4,
  grid: ['🧱🧱🧱🧱', '🧱🚪🧱🧱', '🧱🧱🧱🧱', '🧱🧱🧱🧱'],
  entryX: 1,
  entryY: 1
});

mod.portals.push({ map: target, x: 1, y: 1, toMap: id, toX: 1, toY: 1 });
mod.portals.push({ map: id, x: 1, y: 1, toMap: target, toX: 1, toY: 1 });

fs.writeFileSync(filePath, JSON.stringify(mod, null, 2));
console.log(`Appended room ${id} linked with ${target}`);

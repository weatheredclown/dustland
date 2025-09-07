import fs from 'node:fs';
import path from 'node:path';

if (process.argv.length < 5) {
  console.log('Usage: node scripts/supporting/append-room.js <file> <roomId> <targetRoom>');
  console.log('   or: node scripts/supporting/append-room.js <file> <roomId> <layout> [north] [east] [south] [west]');
  process.exit(1);
}

const args = process.argv.slice(2);
const file = args[0];
const id = args[1];
const filePath = path.resolve(file);
const mod = JSON.parse(fs.readFileSync(filePath, 'utf8'));

mod.interiors = mod.interiors || [];
mod.portals = mod.portals || [];

function clearExisting() {
  mod.interiors = mod.interiors.filter(r => r.id !== id);
  mod.portals = mod.portals.filter(p => p.map !== id && p.toMap !== id);
}

if (args.length === 3) {
  const target = args[2];
  clearExisting();
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
  process.exit(0);
}

const layout = args[2];
const north = args[3];
const east = args[4];
const south = args[5];
const west = args[6];

const rows = layout.split(',');
const h = rows.length;
const w = rows[0].length;
const grid = rows.map(r => r.split('').map(c => c === 'x' ? '🧱' : c === 'p' ? '🚪' : '🏝').join(''));

clearExisting();
mod.interiors.push({ id, w, h, grid, entryX: 1, entryY: 1 });

const exits = { north: [], east: [], south: [], west: [] };
rows.forEach((row, y) => {
  row.split('').forEach((c, x) => {
    if (c !== 'p') return;
    if (y === 0) exits.north.push({ x, y });
    else if (y === h - 1) exits.south.push({ x, y });
    else if (x === 0) exits.west.push({ x, y });
    else if (x === w - 1) exits.east.push({ x, y });
  });
});

function addPortal(dir, target) {
  if (!target) return;
  exits[dir].forEach(({ x, y }) => {
    mod.portals.push({ map: id, x, y, toMap: target, toX: 1, toY: 1 });
    mod.portals.push({ map: target, x: 1, y: 1, toMap: id, toX: x, toY: y });
  });
}

addPortal('north', north);
addPortal('east', east);
addPortal('south', south);
addPortal('west', west);

fs.writeFileSync(filePath, JSON.stringify(mod, null, 2));
console.log(`Inserted room ${id}`);

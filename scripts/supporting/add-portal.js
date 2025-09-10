import fs from 'node:fs';

function usage() {
  console.log('Usage: node scripts/supporting/add-portal.js <file> <map> <dir> <target>');
  console.log('Directions: N, E, S, W, U, D');
  process.exit(1);
}

const [file, map, dir, target] = process.argv.slice(2);
if (!file || !map || !dir || !target) usage();

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const dirs = ['N','E','S','W','U','D'];
const d = dir.toUpperCase();
if (!dirs.includes(d)) {
  console.error('Invalid direction');
  process.exit(1);
}

const coords = { N:[2,0], E:[4,2], S:[2,4], W:[0,2], U:[2,1], D:[2,3] };
const opposite = { N:'S', S:'N', E:'W', W:'E', U:'D', D:'U' };

const a = data.interiors.find(r => r.id === map);
const b = data.interiors.find(r => r.id === target);
if (!a || !b) {
  console.error('Map or target not found');
  process.exit(1);
}

function setDoor(room, direction) {
  const [x,y] = coords[direction];
  const grid = room.grid.map(row => Array.from(row));
  grid[y][x] = '🚪';
  room.grid = grid.map(r => r.join(''));
}

setDoor(a, d);
setDoor(b, opposite[d]);

const [x,y] = coords[d];
const [tx,ty] = coords[opposite[d]];

data.portals = data.portals || [];
// remove existing same portal if exists
const isSame = p => p.map === map && p.x === x && p.y === y && p.toMap === target;
data.portals = data.portals.filter(p => !(isSame(p) || (p.map === target && p.x === tx && p.y === ty && p.toMap === map)));

data.portals.push({ map, x, y, toMap: target, toX: tx, toY: ty });
data.portals.push({ map: target, x: tx, y: ty, toMap: map, toX: x, toY: y });

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log(`Linked ${map} ${d} <-> ${target}`);

import fs from 'node:fs';
function usage() {
    console.log('Usage: node scripts/supporting/add-portal.js <file> <map> <dir> <target>');
    console.log('Directions: N, E, S, W, U, D');
    process.exit(1);
}
const args = process.argv.slice(2);
if (args.length < 4)
    usage();
const [filePath, map, dir, target] = args;
const rawData = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(rawData);
if (!Array.isArray(data.interiors)) {
    console.error('Module file is missing an interiors array.');
    process.exit(1);
}
const direction = dir.toUpperCase();
const directions = ['N', 'E', 'S', 'W', 'U', 'D'];
if (!directions.includes(direction)) {
    console.error('Invalid direction');
    process.exit(1);
}
const coords = {
    N: [2, 0],
    E: [4, 2],
    S: [2, 4],
    W: [0, 2],
    U: [2, 1],
    D: [2, 3],
};
const opposite = {
    N: 'S',
    S: 'N',
    E: 'W',
    W: 'E',
    U: 'D',
    D: 'U',
};
const interiors = data.interiors;
const source = interiors.find(room => room.id === map);
const destination = interiors.find(room => room.id === target);
if (!source || !destination) {
    console.error('Map or target not found');
    process.exit(1);
}
function setDoor(room, dirKey) {
    const [x, y] = coords[dirKey];
    const grid = room.grid.map(row => Array.from(row));
    grid[y][x] = '🚪';
    room.grid = grid.map(row => row.join(''));
}
setDoor(source, direction);
setDoor(destination, opposite[direction]);
const [x, y] = coords[direction];
const [targetX, targetY] = coords[opposite[direction]];
const portals = Array.isArray(data.portals) ? data.portals : [];
const isSame = (portal) => portal.map === map && portal.x === x && portal.y === y && portal.toMap === target;
const filtered = portals.filter(portal => !(isSame(portal) ||
    (portal.map === target &&
        portal.x === targetX &&
        portal.y === targetY &&
        portal.toMap === map)));
filtered.push({ map, x, y, toMap: target, toX: targetX, toY: targetY });
filtered.push({ map: target, x: targetX, y: targetY, toMap: map, toX: x, toY: y });
data.portals = filtered;
fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`Linked ${map} ${direction} <-> ${target}`);

import fs from 'node:fs';
import path from 'node:path';
if (process.argv.length < 4) {
    console.log('Usage: node scripts/supporting/append-room.js <file> <roomId> [dir:target ...]');
    console.log('Directions: N, E, S, W, U (up), D (down)');
    process.exit(1);
}
const args = process.argv.slice(2);
const file = args[0];
const id = args[1];
const filePath = path.resolve(file);
const moduleFile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
moduleFile.interiors = moduleFile.interiors ?? [];
moduleFile.portals = moduleFile.portals ?? [];
const ensuredModuleFile = moduleFile;
function clearExisting() {
    ensuredModuleFile.interiors = ensuredModuleFile.interiors.filter(r => r.id !== id);
    ensuredModuleFile.portals = ensuredModuleFile.portals.filter(p => p.map !== id && p.toMap !== id);
}
const links = {};
for (const arg of args.slice(2)) {
    if (!arg)
        continue;
    const [dir, target] = arg.split(':');
    if (!dir || !target)
        continue;
    const direction = dir.toUpperCase();
    links[direction] = target;
}
clearExisting();
const w = 5;
const h = 5;
const grid = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => y === 0 || y === h - 1 || x === 0 || x === w - 1 ? '🧱' : '⬜'));
if (links.N)
    grid[0][2] = '🚪';
if (links.E)
    grid[2][4] = '🚪';
if (links.S)
    grid[4][2] = '🚪';
if (links.W)
    grid[2][0] = '🚪';
if (links.U)
    grid[1][2] = 'U';
if (links.D)
    grid[3][2] = 'D';
ensuredModuleFile.interiors.push({ id, w, h, grid: grid.map(r => r.join('')), entryX: 2, entryY: 2 });
const coords = {
    N: [2, 0],
    E: [4, 2],
    S: [2, 4],
    W: [0, 2],
    U: [2, 1],
    D: [2, 3]
};
const opposite = { N: 'S', S: 'N', E: 'W', W: 'E', U: 'D', D: 'U' };
for (const direction of Object.keys(links)) {
    const target = links[direction];
    if (!target)
        continue;
    const [x, y] = coords[direction];
    const [tx, ty] = coords[opposite[direction]];
    ensuredModuleFile.portals.push({ map: id, x, y, toMap: target, toX: tx, toY: ty });
    ensuredModuleFile.portals.push({ map: target, x: tx, y: ty, toMap: id, toX: x, toY: y });
}
fs.writeFileSync(filePath, JSON.stringify(ensuredModuleFile, null, 2));
console.log(`Inserted room ${id}`);

/// <reference types="node" />
import fs from 'node:fs';
import path from 'node:path';
const moduleFile = process.argv[2];
if (!moduleFile) {
    console.error('Usage: node scripts/supporting/placement-check.js <module-file>');
    process.exit(1);
}
const text = fs.readFileSync(moduleFile, 'utf8');
let json = text;
if (path.extname(moduleFile) === '.js') {
    const match = text.match(/const DATA = `([\s\S]*?)`;/);
    if (!match) {
        console.error('DATA string not found in module');
        process.exit(1);
    }
    json = match[1];
}
const data = JSON.parse(json);
const grids = {};
(data.interiors || []).forEach(int => {
    grids[int.id] = int.grid;
});
const interiorIds = new Set(Object.keys(grids));
function tileAt(map, x, y) {
    const grid = grids[map];
    if (!grid)
        return null;
    const row = grid[y];
    if (!row)
        return null;
    const cells = Array.from(row);
    return cells[x] || null;
}
let errors = 0;
function check(kind, obj) {
    if (typeof obj.x !== 'number' || typeof obj.y !== 'number')
        return;
    if (!obj.map)
        return;
    const tile = tileAt(obj.map, obj.x, obj.y);
    if (interiorIds.has(obj.map) && tile == null) {
        console.error(`${kind} ${obj.id || '?'} is outside ${obj.map} at (${obj.x},${obj.y})`);
        errors++;
        return;
    }
    if (tile === '🧱' || tile === '🌊') {
        console.error(`${kind} ${obj.id || '?'} is on ${tile} at ${obj.map} (${obj.x},${obj.y})`);
        errors++;
    }
}
(data.items || []).forEach(i => check('item', i));
(data.npcs || []).forEach(n => check('npc', n));
process.exit(errors ? 1 : 0);

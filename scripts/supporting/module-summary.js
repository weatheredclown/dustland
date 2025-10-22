// @ts-nocheck
import fs from 'fs';
import { fileURLToPath } from 'url';
function loadModule(path) {
    const text = fs.readFileSync(path, 'utf8');
    const match = text.match(/const DATA = `([\s\S]*?)`;/);
    if (!match) {
        throw new Error('No DATA string found');
    }
    return JSON.parse(match[1]);
}
function summarize(mod) {
    const lines = [];
    lines.push(`seed: ${mod.seed}`);
    if (mod.start) {
        lines.push(`start: ${mod.start.map} (${mod.start.x},${mod.start.y})`);
    }
    if (Array.isArray(mod.items)) {
        lines.push(`items: ${mod.items.length}`);
        const names = mod.items.map(i => i.name || i.id);
        if (names.length) {
            lines.push(`  ${names.join(', ')}`);
        }
    }
    if (Array.isArray(mod.quests)) {
        lines.push(`quests: ${mod.quests.length}`);
        const titles = mod.quests.map(q => q.title || q.id);
        if (titles.length) {
            lines.push(`  ${titles.join(', ')}`);
        }
    }
    if (Array.isArray(mod.npcs)) {
        lines.push(`npcs: ${mod.npcs.length}`);
        mod.npcs.forEach(n => {
            const nodes = n.tree ? Object.keys(n.tree).length : 0;
            lines.push(`  ${n.name || n.id} (${nodes})`);
        });
    }
    if (Array.isArray(mod.events)) {
        lines.push(`events: ${mod.events.length}`);
    }
    if (Array.isArray(mod.zones)) {
        lines.push(`zones: ${mod.zones.length}`);
    }
    if (Array.isArray(mod.buildings)) {
        lines.push(`buildings: ${mod.buildings.length}`);
    }
    if (Array.isArray(mod.portals)) {
        lines.push(`portals: ${mod.portals.length}`);
    }
    if (Array.isArray(mod.interiors)) {
        lines.push(`interiors: ${mod.interiors.length}`);
    }
    return lines.join('\n');
}
export { loadModule, summarize };
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
    const modPath = process.argv[2];
    if (!modPath) {
        console.error('Usage: node module-summary.js <module-file>');
        process.exit(1);
    }
    const mod = loadModule(modPath);
    console.log(summarize(mod));
}

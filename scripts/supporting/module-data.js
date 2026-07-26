import fs from 'node:fs';
import path from 'node:path';
const DATA_BLOCK_RE = /const (?:[A-Z0-9_]+_)?DATA = `([\s\S]*?)`;/;
export function toPosixPath(value) {
    return value.replace(/\\/g, '/');
}
/** Pull the raw JSON text out of a module file's inlined DATA block. */
export function extractModuleData(text) {
    const match = text.match(DATA_BLOCK_RE);
    return match ? match[1] : null;
}
/** Parse the module data baked into a .module.js file. */
export function readModuleData(file) {
    const text = fs.readFileSync(file, 'utf8');
    const dataStr = extractModuleData(text);
    if (!dataStr)
        return null;
    return JSON.parse(dataStr);
}
/**
 * Every module data source in the project: the DATA blocks baked into
 * modules/*.module.js (the checked-in state, since file: pages cannot fetch
 * local JSON) plus standalone *.module.json files in modules/ and the root.
 */
export function listModuleSources(projectRoot) {
    const sources = [];
    const modulesDir = path.join(projectRoot, 'modules');
    if (fs.existsSync(modulesDir)) {
        for (const name of fs.readdirSync(modulesDir)) {
            const file = path.join(modulesDir, name);
            if (name.endsWith('.module.js')) {
                const data = readModuleData(file);
                if (data)
                    sources.push({ file: toPosixPath(path.relative(projectRoot, file)), data });
            }
            else if (name.endsWith('.module.json')) {
                const data = JSON.parse(fs.readFileSync(file, 'utf8'));
                sources.push({ file: toPosixPath(path.relative(projectRoot, file)), data });
            }
        }
    }
    for (const name of fs.readdirSync(projectRoot)) {
        if (!name.endsWith('.module.json'))
            continue;
        const file = path.join(projectRoot, name);
        if (!fs.statSync(file).isFile())
            continue;
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        sources.push({ file: toPosixPath(name), data });
    }
    return sources;
}

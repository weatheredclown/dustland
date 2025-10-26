import fs from 'node:fs';
function ensureStartNode(tree) {
    var _a;
    if (!tree.start) {
        tree.start = { text: '', choices: [] };
    }
    (_a = tree.start).choices ?? (_a.choices = []);
    return tree.start;
}
export function attachDialogBranch(npc, label, tree) {
    if (!npc.tree) {
        npc.tree = { start: { text: '', choices: [] } };
    }
    const dialogTree = npc.tree;
    if (!dialogTree) {
        throw new Error('Dialog tree was not initialized');
    }
    const startNode = ensureStartNode(dialogTree);
    const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const prefix = `${base}_${Date.now().toString(36)}`;
    const idMap = {};
    for (const key of Object.keys(tree)) {
        idMap[key] = `${prefix}_${key}`;
    }
    for (const [key, node] of Object.entries(tree)) {
        const newId = idMap[key];
        if (!newId) {
            continue;
        }
        const newNode = JSON.parse(JSON.stringify(node));
        if (Array.isArray(newNode.choices)) {
            for (const choice of newNode.choices) {
                if (choice.to && idMap[choice.to]) {
                    choice.to = idMap[choice.to];
                }
            }
        }
        dialogTree[newId] = newNode;
    }
    const startId = idMap.start;
    if (!startId) {
        throw new Error('Branch tree is missing a start node');
    }
    startNode.choices.push({ label, to: startId });
    return idMap;
}
export function loadModule(path) {
    const text = fs.readFileSync(path, 'utf8');
    const match = text.match(/const DATA = `([\s\S]*?)`;/);
    if (!match || match[1] === undefined) {
        throw new Error('DATA block not found');
    }
    const obj = JSON.parse(match[1]);
    return { obj, text, match };
}
export function saveModule(path, mod) {
    const clean = JSON.stringify(mod.obj, null, 2);
    const newText = mod.text.replace(/const DATA = `[\s\S]*?`;/, `const DATA = \`\n${clean}\n\`;`);
    fs.writeFileSync(path, newText);
}

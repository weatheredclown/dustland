// @ts-nocheck
import fs from 'node:fs';

export function attachDialogBranch(npc, label, tree){
  npc.tree = npc.tree || {};
  npc.tree.start = npc.tree.start || { text: '', choices: [] };
  const startNode = npc.tree.start;
  startNode.choices = startNode.choices || [];
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  const prefix = `${base}_${Date.now().toString(36)}`;
  const idMap = {};
  for (const key of Object.keys(tree)) idMap[key] = `${prefix}_${key}`;
  for (const [key, node] of Object.entries(tree)){
    const newNode = JSON.parse(JSON.stringify(node));
    if (Array.isArray(newNode.choices)){
      for (const choice of newNode.choices){
        if (choice.to && idMap[choice.to]) choice.to = idMap[choice.to];
      }
    }
    npc.tree[idMap[key]] = newNode;
  }
  startNode.choices.push({ label, to: idMap.start });
  return idMap;
}

export function loadModule(path){
  const text = fs.readFileSync(path, 'utf8');
  const match = text.match(/const DATA = `([\s\S]*?)`;/);
  if (!match) throw new Error('DATA block not found');
  const obj = JSON.parse(match[1]);
  return { obj, text, match };
}

export function saveModule(path, mod){
  const clean = JSON.stringify(mod.obj, null, 2);
  const newText = mod.text.replace(/const DATA = `[\s\S]*?`;/, `const DATA = \`\n${clean}\n\`;`);
  fs.writeFileSync(path, newText);
}

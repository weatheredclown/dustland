import fs from 'node:fs';

export interface DialogChoice {
  label: string;
  to?: string;
  [key: string]: unknown;
}

export interface DialogNode {
  text: string;
  choices?: DialogChoice[];
  [key: string]: unknown;
}

export type DialogTree = Record<string, DialogNode> & {
  start: DialogNode;
};

export interface DialogNpc {
  tree?: DialogTree;
}

export interface ModuleData<T = unknown> {
  obj: T;
  text: string;
  match: RegExpMatchArray;
}

function ensureStartNode(tree: DialogTree): DialogNode & { choices: DialogChoice[] } {
  if (!tree.start) {
    tree.start = { text: '', choices: [] };
  }
  tree.start.choices ??= [];
  return tree.start as DialogNode & { choices: DialogChoice[] };
}

export function attachDialogBranch(
  npc: DialogNpc,
  label: string,
  tree: DialogTree
): Record<string, string> {
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
  const idMap: Record<string, string> = {};
  for (const key of Object.keys(tree)) {
    idMap[key] = `${prefix}_${key}`;
  }
  for (const [key, node] of Object.entries(tree)) {
    const newId = idMap[key];
    if (!newId) {
      continue;
    }
    const newNode = JSON.parse(JSON.stringify(node)) as DialogNode;
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

export function loadModule<T = unknown>(path: string): ModuleData<T> {
  const text = fs.readFileSync(path, 'utf8');
  const match = text.match(/const DATA = `([\s\S]*?)`;/);
  if (!match || match[1] === undefined) {
    throw new Error('DATA block not found');
  }
  const obj = JSON.parse(match[1]) as T;
  return { obj, text, match };
}

export function saveModule<T>(path: string, mod: ModuleData<T>): void {
  const clean = JSON.stringify(mod.obj, null, 2);
  const newText = mod.text.replace(
    /const DATA = `[\s\S]*?`;/,
    `const DATA = \`\n${clean}\n\`;`
  );
  fs.writeFileSync(path, newText);
}

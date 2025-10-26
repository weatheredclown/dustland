import fs from 'node:fs';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;
type JsonArray = JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

type ModuleEntity = JsonObject;

interface ModuleDocument extends JsonObject {
  seed?: string;
  name?: string;
  start?: JsonObject;
  items?: ModuleEntity[];
  quests?: ModuleEntity[];
  npcs?: ModuleEntity[];
  events?: ModuleEntity[];
  portals?: ModuleEntity[];
  interiors?: ModuleEntity[];
  buildings?: ModuleEntity[];
  zones?: ModuleEntity[];
  templates?: ModuleEntity[];
  encounters?: JsonObject;
}

type ModuleData<TData extends JsonValue> = {
  data: TData;
  write: (data: TData) => void;
};

function readModule<TData extends JsonValue = ModuleDocument>(file: string): ModuleData<TData> {
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.json')) {
    return {
      data: JSON.parse(text) as TData,
      write(data: TData) {
        fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
      }
    };
  }
  const token = 'const DATA = `';
  const start = text.indexOf(token);
  if (start === -1) throw new Error('DATA block not found');
  const jsonStart = start + token.length;
  let jsonEnd = -1;
  let suffixStart = -1;
  let searchFrom = jsonStart;
  while (jsonEnd === -1 && searchFrom < text.length) {
    const tick = text.indexOf('`', searchFrom);
    if (tick === -1) break;
    let cursor = tick + 1;
    while (cursor < text.length && /\s/.test(text[cursor])) cursor += 1;
    if (text[cursor] === ';') {
      jsonEnd = tick;
      suffixStart = tick;
      break;
    }
    searchFrom = tick + 1;
  }
  if (jsonEnd === -1) throw new Error('DATA block end not found');
  const prefix = text.slice(0, jsonStart);
  const suffix = text.slice(suffixStart);
  const jsonText = text.slice(jsonStart, jsonEnd);
  return {
    data: JSON.parse(jsonText) as TData,
    write(data: TData) {
      const newJson = '\n' + JSON.stringify(data, null, 2) + '\n';
      fs.writeFileSync(file, prefix + newJson + suffix);
    }
  };
}

function getByPath<T extends JsonValue>(obj: T, path: string | undefined): JsonValue | undefined {
  if (!path) return obj;
  return path.split('.').reduce<JsonValue | undefined>((o, k) => {
    if (o == null || typeof o !== 'object') return undefined;
    if (Array.isArray(o)) {
      const index = Number(k);
      return Number.isInteger(index) ? o[index] : undefined;
    }
    return (o as JsonObject)[k];
  }, obj);
}

function setByPath(obj: JsonObject | JsonArray, path: string, value: JsonValue): void {
  const parts = path.split('.');
  let cur: JsonObject | JsonArray = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (Array.isArray(cur)) {
      const index = Number(key);
      if (!Number.isInteger(index)) {
        throw new Error(`Invalid array index: ${key}`);
      }
      if (cur[index] === undefined) {
        cur[index] = isNaN(Number(parts[i + 1])) ? {} : [];
      }
      cur = cur[index] as JsonObject | JsonArray;
    } else {
      const existing = cur[key];
      if (existing === undefined) {
        cur[key] = isNaN(Number(parts[i + 1])) ? {} : [];
      }
      cur = (cur[key] as JsonObject | JsonArray);
    }
  }
  if (Array.isArray(cur)) {
    const index = Number(parts[parts.length - 1]);
    if (!Number.isInteger(index)) {
      throw new Error(`Invalid array index: ${parts[parts.length - 1]}`);
    }
    cur[index] = value;
  } else {
    (cur as JsonObject)[parts[parts.length - 1]] = value;
  }
}

function appendByPath(obj: JsonObject, path: string, value: JsonValue): void {
  const target = getByPath(obj, path);
  if (!Array.isArray(target)) throw new Error('Target is not an array');
  target.push(value);
}

function ensureArray(obj: JsonObject, path: string): void {
  if (!Array.isArray(getByPath(obj, path))) {
    setByPath(obj, path, []);
  }
}

function findIndexById<T extends { id?: string }>(arr: T[], id: string): number {
  return arr.findIndex(e => e.id === id);
}

function removeIndex<T>(arr: T[], index: number): void {
  if (index < 0 || index >= arr.length) throw new Error('Index out of range');
  arr.splice(index, 1);
}

function parseValue(str: string): JsonValue {
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null') return null;
  const trimmed = str.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed) as JsonValue;
    } catch (err) {
      // fall through to other parsing attempts
    }
  }
  const num = Number(str);
  if (!isNaN(num)) return num;
  return str;
}

function parseKeyValueArgs(args: string[]): JsonObject {
  const obj: JsonObject = {};
  for (const arg of args) {
    const eq = arg.indexOf('=');
    if (eq === -1) continue;
    const key = arg.slice(0, eq);
    const val = arg.slice(eq + 1);
    setByPath(obj, key, parseValue(val));
  }
  return obj;
}

export {
  readModule,
  getByPath,
  setByPath,
  appendByPath,
  ensureArray,
  findIndexById,
  removeIndex,
  parseValue,
  parseKeyValueArgs
};

export type {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  ModuleEntity,
  ModuleDocument,
  ModuleData
};

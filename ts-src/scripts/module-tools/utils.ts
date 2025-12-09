import fs from 'node:fs';
import path from 'node:path';

type ModuleData = {
  data: unknown;
  write: (data: unknown) => void;
};

function resolveModuleFile(file: string): string {
  const absolute = path.resolve(file);
  if (file.endsWith('.js')) {
    const relative = path.relative(process.cwd(), absolute);
    const tsInSource = path.resolve(process.cwd(), 'ts-src', relative.replace(/\.js$/, '.ts'));
    const tsAlongside = absolute.replace(/\.js$/, '.ts');
    if (fs.existsSync(tsInSource)) return tsInSource;
    if (fs.existsSync(tsAlongside)) return tsAlongside;
  }
  if (fs.existsSync(absolute)) return absolute;
  throw new Error(`Module file not found: ${file}`);
}

function readModule(file: string): ModuleData {
  const resolvedFile = resolveModuleFile(file);
  const text = fs.readFileSync(resolvedFile, 'utf8');
  if (file.endsWith('.json')) {
    return {
      data: JSON.parse(text),
      write(data: unknown) {
        fs.writeFileSync(resolvedFile, JSON.stringify(data, null, 2) + '\n');
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
      data: JSON.parse(jsonText),
      write(data: unknown) {
        const newJson = '\n' + JSON.stringify(data, null, 2) + '\n';
        fs.writeFileSync(resolvedFile, prefix + newJson + suffix);
      }
    };
  }

function getByPath<T>(obj: T, path: string | undefined): unknown {
  if (!path) return obj;
  return path.split('.').reduce<unknown>((o, k) => {
    if (o == null) return undefined;
    if (typeof o !== 'object') return undefined;
    return (o as Record<string, unknown>)[k];
  }, obj as unknown);
}

function setByPath(obj: Record<string, unknown> | unknown[], path: string, value: unknown): void {
  const parts = path.split('.');
  let cur: Record<string, unknown> | unknown[] = obj;
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
      cur = cur[index] as Record<string, unknown> | unknown[];
    } else {
      if (cur[key] === undefined) {
        cur[key] = isNaN(Number(parts[i + 1])) ? {} : [];
      }
      cur = cur[key] as Record<string, unknown> | unknown[];
    }
  }
  if (Array.isArray(cur)) {
    const index = Number(parts[parts.length - 1]);
    if (!Number.isInteger(index)) {
      throw new Error(`Invalid array index: ${parts[parts.length - 1]}`);
    }
    cur[index] = value;
  } else {
    cur[parts[parts.length - 1]] = value;
  }
}

function appendByPath(obj: Record<string, unknown>, path: string, value: unknown): void {
  const target = getByPath(obj, path);
  if (!Array.isArray(target)) throw new Error('Target is not an array');
  target.push(value);
}

function ensureArray(obj: Record<string, unknown>, path: string): void {
  if (!Array.isArray(getByPath(obj, path))) {
    setByPath(obj, path, []);
  }
}

function findIndexById<T extends { id?: string }>(arr: T[], id: string): number {
  return arr.findIndex(e => e.id === id);
}

function removeIndex(arr: unknown[], index: number): void {
  if (index < 0 || index >= arr.length) throw new Error('Index out of range');
  arr.splice(index, 1);
}

function parseValue(str: unknown): unknown {
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null') return null;
  const trimmed = typeof str === 'string' ? str.trim() : str;
  if (typeof trimmed === 'string' && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      // fall through to other parsing attempts
    }
  }
  const num = Number(str);
  if (!isNaN(num)) return num;
  return str;
}

function parseKeyValueArgs(args: string[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
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

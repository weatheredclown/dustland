import fs from 'node:fs';
function readModule(file) {
    const text = fs.readFileSync(file, 'utf8');
    if (file.endsWith('.json')) {
        return {
            data: JSON.parse(text),
            write(data) {
                fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
            }
        };
    }
    const token = 'const DATA = `';
    const start = text.indexOf(token);
    if (start === -1)
        throw new Error('DATA block not found');
    const jsonStart = start + token.length;
    let jsonEnd = -1;
    let suffixStart = -1;
    let searchFrom = jsonStart;
    while (jsonEnd === -1 && searchFrom < text.length) {
        const tick = text.indexOf('`', searchFrom);
        if (tick === -1)
            break;
        let cursor = tick + 1;
        while (cursor < text.length && /\s/.test(text[cursor]))
            cursor += 1;
        if (text[cursor] === ';') {
            jsonEnd = tick;
            suffixStart = tick;
            break;
        }
        searchFrom = tick + 1;
    }
    if (jsonEnd === -1)
        throw new Error('DATA block end not found');
    const prefix = text.slice(0, jsonStart);
    const suffix = text.slice(suffixStart);
    const jsonText = text.slice(jsonStart, jsonEnd);
    return {
        data: JSON.parse(jsonText),
        write(data) {
            const newJson = '\n' + JSON.stringify(data, null, 2) + '\n';
            fs.writeFileSync(file, prefix + newJson + suffix);
        }
    };
}
function getByPath(obj, path) {
    if (!path)
        return obj;
    return path.split('.').reduce((o, k) => {
        if (o == null)
            return undefined;
        if (typeof o !== 'object')
            return undefined;
        return o[k];
    }, obj);
}
function setByPath(obj, path, value) {
    const parts = path.split('.');
    let cur = obj;
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
            cur = cur[index];
        }
        else {
            if (cur[key] === undefined) {
                cur[key] = isNaN(Number(parts[i + 1])) ? {} : [];
            }
            cur = cur[key];
        }
    }
    if (Array.isArray(cur)) {
        const index = Number(parts[parts.length - 1]);
        if (!Number.isInteger(index)) {
            throw new Error(`Invalid array index: ${parts[parts.length - 1]}`);
        }
        cur[index] = value;
    }
    else {
        cur[parts[parts.length - 1]] = value;
    }
}
function appendByPath(obj, path, value) {
    const target = getByPath(obj, path);
    if (!Array.isArray(target))
        throw new Error('Target is not an array');
    target.push(value);
}
function ensureArray(obj, path) {
    if (!Array.isArray(getByPath(obj, path))) {
        setByPath(obj, path, []);
    }
}
function findIndexById(arr, id) {
    return arr.findIndex(e => e.id === id);
}
function removeIndex(arr, index) {
    if (index < 0 || index >= arr.length)
        throw new Error('Index out of range');
    arr.splice(index, 1);
}
function parseValue(str) {
    if (str === 'true')
        return true;
    if (str === 'false')
        return false;
    if (str === 'null')
        return null;
    const trimmed = typeof str === 'string' ? str.trim() : str;
    if (typeof trimmed === 'string' && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
        try {
            return JSON.parse(trimmed);
        }
        catch (err) {
            // fall through to other parsing attempts
        }
    }
    const num = Number(str);
    if (!isNaN(num))
        return num;
    return str;
}
function parseKeyValueArgs(args) {
    const obj = {};
    for (const arg of args) {
        const eq = arg.indexOf('=');
        if (eq === -1)
            continue;
        const key = arg.slice(0, eq);
        const val = arg.slice(eq + 1);
        setByPath(obj, key, parseValue(val));
    }
    return obj;
}
export { readModule, getByPath, setByPath, appendByPath, ensureArray, findIndexById, removeIndex, parseValue, parseKeyValueArgs };

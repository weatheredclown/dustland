// Adventure Construction Kit
// Provides basic tools to build Dustland modules.
// Ensure world generation doesn't pull default content
window.seedWorldContent = () => { };
window.DUSTLAND_FEATURES = window.DUSTLAND_FEATURES ?? {};
const hasFirebaseConfig = typeof window.DUSTLAND_FIREBASE === 'object' && window.DUSTLAND_FIREBASE !== null;
if (typeof window.DUSTLAND_FEATURES.serverMode !== 'boolean' && hasFirebaseConfig) {
    window.DUSTLAND_FEATURES.serverMode = true;
}
const PLAYTEST_KEY = 'ack_playtest';
const akColors = {
    0: '#1e271d',
    1: '#2c342c',
    2: '#1573ff',
    3: '#203320',
    4: '#777777',
    5: '#304326',
    6: '#4d5f4d',
    7: '#233223',
    8: '#8bd98d',
    9: '#000'
};
const tileNames = {
    [TILE.SAND]: 'Sand',
    [TILE.ROCK]: 'Rock',
    [TILE.WATER]: 'Water',
    [TILE.BRUSH]: 'Brush',
    [TILE.ROAD]: 'Road',
    [TILE.RUIN]: 'Ruin',
    [TILE.WALL]: 'Wall'
};
const walkableTiles = {
    0: true,
    1: true,
    2: false,
    3: true,
    4: true,
    5: true,
    6: false,
    7: true,
    8: true,
    9: false
};
const stampNames = {
    hill: 'Hill',
    cross: 'Cross Roads',
    compound: 'Walled Compound',
    pond: 'Pond & River'
};
const hillEmoji = [
    "🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🪨🪨🪨🪨🪨🪨🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🪨🪨🪨🪨🪨🪨🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🪨🪨🪨🪨🪨🪨🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🪨🪨🪨🪨🪨🪨🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🪨🪨🪨🪨🪨🪨🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🪨🪨🪨🪨🪨🪨🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🪨🪨🪨🪨🪨🪨🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🏝🏝🏝",
    "🏝🏝🏝🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝"
];
function makeHill() {
    return gridFromEmoji(hillEmoji);
}
const crossEmoji = [
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣",
    "🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝"
];
function makeCross() {
    return gridFromEmoji(crossEmoji);
}
const compoundEmoji = [
    "🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🏝🧱",
    "🧱🧱🧱🧱🧱🧱🧱🛣🛣🧱🧱🧱🧱🧱🧱🧱"
];
function makeCompound() {
    return gridFromEmoji(compoundEmoji);
}
const pondEmoji = [
    "🌿🌿🌿🌿🌿🌿🌿🌊🌊🌿🌿🌿🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌿🌿🌿🌊🌊🌿🌿🌿🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌿🌿🌿🌊🌊🌿🌿🌿🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌿🌿🌿🌊🌊🌿🌿🌿🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌊🌊🌊🌊🌊🌊🌊🌊🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌊🌊🌊🌊🌊🌊🌊🌊🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌊🌊🌊🌊🌊🌊🌊🌊🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌊🌊🌊🌊🌊🌊🌊🌊🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌊🌊🌊🌊🌊🌊🌊🌊🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌊🌊🌊🌊🌊🌊🌊🌊🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌊🌊🌊🌊🌊🌊🌊🌊🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌊🌊🌊🌊🌊🌊🌊🌊🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿",
    "🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿🌿"
];
function makePond() {
    return gridFromEmoji(pondEmoji);
}
const worldStampEmoji = { hill: hillEmoji, cross: crossEmoji, compound: compoundEmoji, pond: pondEmoji };
window.worldStampEmoji = worldStampEmoji;
const worldStamps = { hill: makeHill(), cross: makeCross(), compound: makeCompound(), pond: makePond() };
window.worldStamps = worldStamps;
const canvas = document.getElementById('map');
if (!canvas) {
    throw new Error('Adventure Kit map canvas missing');
}
const ctx = canvas.getContext('2d');
if (!ctx) {
    throw new Error('Adventure Kit map canvas context unavailable');
}
function getCanvasScale(rect = canvas.getBoundingClientRect()) {
    const scaleX = rect.width / canvas.width || 1;
    const scaleY = rect.height / canvas.height || 1;
    return { scaleX, scaleY };
}
let dragTarget = null, settingStart = false, hoverTarget = null, didDrag = false, dragOffsetX = 0, dragOffsetY = 0;
let placingType = null, placingPos = null, placingCb = null;
let hoverTile = null;
var coordTarget = null;
function setCoordTarget(v) { coordTarget = v; }
globalThis.setCoordTarget = setCoordTarget;
let npcOriginal = null;
let npcDirty = false;
let npcNoticeTimer = 0;
let npcMapMode = false;
let npcLastCoords = null;
const npcSectionRefs = new Map();
let worldZoom = 1, panX = 0, panY = 0;
let panning = false, panStartX = 0, panStartY = 0, panMouseX = 0, panMouseY = 0, panScaleX = 1, panScaleY = 1;
const baseTileW = canvas.width / WORLD_W;
const baseTileH = canvas.height / WORLD_H;
let problemRefs = [];
let spawnHeat = false;
var spawnHeatMap = null;
var spawnHeatMax = 0;
let mapActionTimer = null;
function focusMap(x, y) {
    if (currentMap !== 'world')
        return;
    const viewW = WORLD_W / worldZoom;
    const viewH = WORLD_H / worldZoom;
    const maxPanX = WORLD_W - viewW;
    const maxPanY = WORLD_H - viewH;
    panX = clamp(x - viewW / 2, 0, maxPanX);
    panY = clamp(y - viewH / 2, 0, maxPanY);
}
globalThis.focusMap = focusMap;
function getTileAt(mapName, x, y) {
    if (mapName === 'world') {
        return world?.[y]?.[x];
    }
    const interior = moduleData.interiors.find(i => i.id === mapName);
    return interior?.grid?.[y]?.[x];
}
function isTileWalkable(mapName, x, y) {
    const tile = getTileAt(mapName, x, y);
    if (tile == null)
        return false;
    if (mapName === 'world')
        return !!walkableTiles[tile];
    if (tile === TILE.WALL || tile === TILE.WATER)
        return false;
    return true;
}
function setMapActionBanner(message, type = 'info', autoHideMs = 0) {
    const banner = document.getElementById('mapActionBanner');
    if (!banner)
        return;
    if (mapActionTimer) {
        clearTimeout(mapActionTimer);
        mapActionTimer = null;
    }
    banner.textContent = message || '';
    banner.style.display = message ? 'block' : 'none';
    banner.classList.remove('error', 'success');
    if (type === 'error')
        banner.classList.add('error');
    else if (type === 'success')
        banner.classList.add('success');
    if (message && autoHideMs > 0) {
        mapActionTimer = setTimeout(() => {
            banner.style.display = 'none';
            banner.classList.remove('error', 'success');
            banner.textContent = '';
            mapActionTimer = null;
        }, autoHideMs);
    }
}
function getWallGap(length, enabled) {
    if (!enabled || length <= 0)
        return null;
    const size = Math.min(2, length);
    const start = Math.floor((length - size) / 2);
    return { start, end: start + size };
}
function gapContains(index, gap) {
    return !!gap && index >= gap.start && index < gap.end;
}
function renderZoneWalls(targetCtx, zone, pxoff, pyoff, sx, sy) {
    if (!zone || !targetCtx)
        return;
    const width = Math.max(1, Math.round(Number(zone.w) || 0));
    const height = Math.max(1, Math.round(Number(zone.h) || 0));
    if (!Number.isFinite(width) || !Number.isFinite(height))
        return;
    const baseX = Number(zone.x) || 0;
    const baseY = Number(zone.y) || 0;
    const zx = (baseX - pxoff) * sx;
    const zy = (baseY - pyoff) * sy;
    const entrances = typeof zone.entrances === 'object' && zone.entrances ? zone.entrances : {};
    const northGap = getWallGap(width, entrances.north);
    const southGap = getWallGap(width, entrances.south);
    const westGap = getWallGap(height, entrances.west);
    const eastGap = getWallGap(height, entrances.east);
    targetCtx.save();
    targetCtx.fillStyle = akColors[TILE.WALL] || '#4d5f4d';
    for (let i = 0; i < width; i++) {
        if (gapContains(i, northGap) || (height === 1 && gapContains(i, southGap)))
            continue;
        targetCtx.fillRect(zx + i * sx, zy, sx, sy);
    }
    if (height > 1) {
        const by = zy + (height - 1) * sy;
        for (let i = 0; i < width; i++) {
            if (gapContains(i, southGap))
                continue;
            targetCtx.fillRect(zx + i * sx, by, sx, sy);
        }
    }
    for (let i = 0; i < height; i++) {
        if (gapContains(i, westGap) || (width === 1 && gapContains(i, eastGap)))
            continue;
        targetCtx.fillRect(zx, zy + i * sy, sx, sy);
    }
    if (width > 1) {
        const rx = zx + (width - 1) * sx;
        for (let i = 0; i < height; i++) {
            if (gapContains(i, eastGap))
                continue;
            targetCtx.fillRect(rx, zy + i * sy, sx, sy);
        }
    }
    targetCtx.restore();
}
function computeSpawnHeat() {
    const W = WORLD_W, H = WORLD_H;
    const grid = Array.from({ length: H }, () => Array(W).fill(Infinity));
    const q = [];
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            if (world[y][x] === TILE.ROAD) {
                grid[y][x] = 0;
                q.push([x, y]);
            }
        }
    }
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let head = 0;
    while (head < q.length) {
        const [x, y] = q[head++];
        const d = grid[y][x] + 1;
        for (const [dx, dy] of dirs) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && ny >= 0 && nx < W && ny < H && grid[ny][nx] > d) {
                grid[ny][nx] = d;
                q.push([nx, ny]);
            }
        }
    }
    spawnHeatMap = grid;
    spawnHeatMax = 0;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            const v = grid[y][x];
            if (v !== Infinity && v > spawnHeatMax)
                spawnHeatMax = v;
        }
    }
}
let loopHover = null;
const loopPlus = document.createElement('button');
loopPlus.type = 'button';
loopPlus.textContent = '+';
loopPlus.className = 'pill';
loopPlus.setAttribute('aria-label', 'Add loop point');
loopPlus.style.position = 'absolute';
loopPlus.style.display = 'none';
document.body.appendChild(loopPlus);
const loopMinus = document.createElement('button');
loopMinus.type = 'button';
loopMinus.textContent = '-';
loopMinus.className = 'pill';
loopMinus.setAttribute('aria-label', 'Remove loop point');
loopMinus.style.position = 'absolute';
loopMinus.style.display = 'none';
document.body.appendChild(loopMinus);
function positionLoopControls() {
    if (!loopHover)
        return;
    const rect = canvas.getBoundingClientRect();
    const { scaleX, scaleY } = getCanvasScale(rect);
    const sx = baseTileW * worldZoom * scaleX;
    const sy = baseTileH * worldZoom * scaleY;
    const px = rect.left + (loopHover.x - panX) * sx;
    const py = rect.top + (loopHover.y - panY) * sy;
    loopPlus.style.left = px + 'px';
    loopPlus.style.top = py - 24 + 'px';
    loopMinus.style.left = px + 24 + 'px';
    loopMinus.style.top = py - 24 + 'px';
}
function showLoopControls(sel) {
    if (sel) {
        loopHover = sel;
        positionLoopControls();
        loopPlus.style.display = 'block';
        loopMinus.style.display = sel.idx > 0 ? 'block' : 'none';
    }
    else {
        loopHover = null;
        loopPlus.style.display = 'none';
        loopMinus.style.display = 'none';
    }
}
loopPlus.addEventListener('click', () => {
    if (!selectedObj || selectedObj.type !== 'npc' || !loopHover)
        return;
    const npc = selectedObj.obj;
    npc.loop = npc.loop || [{ x: npc.x, y: npc.y }];
    const newIdx = loopHover.idx + 1;
    const pos = nextLoopPoint(npc.loop[loopHover.idx], npc);
    npc.loop.splice(newIdx, 0, pos);
    renderLoopFields(npc.loop);
    drawWorld();
    // Keep NPC selected and highlight the new point for easy dragging
    showLoopControls({ idx: newIdx, x: pos.x, y: pos.y });
});
loopMinus.addEventListener('click', () => {
    if (!selectedObj || selectedObj.type !== 'npc' || !loopHover)
        return;
    if (loopHover.idx <= 0)
        return;
    const npc = selectedObj.obj;
    npc.loop.splice(loopHover.idx, 1);
    renderLoopFields(npc.loop);
    drawWorld();
    showLoopControls(null);
});
const moduleData = globalThis.moduleData ?? (globalThis.moduleData = { seed: Date.now(), name: 'adventure-module', npcs: [], items: [], quests: [], buildings: [], interiors: [], portals: [], events: [], zones: [], encounters: [], templates: [], personas: {}, start: { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) }, module: undefined, moduleVar: undefined, props: {}, behaviors: {} });
const STAT_OPTS = ['ATK', 'DEF', 'LCK', 'INT', 'PER', 'CHA'];
const MOD_TYPES = ['ATK', 'DEF', 'LCK', 'INT', 'PER', 'CHA', 'STR', 'AGI', 'ADR', 'adrenaline_gen_mod', 'adrenaline_dmg_mod', 'spread'];
const PRESET_TAGS = ['key', 'pass', 'tool', 'idol', 'signal_fragment', 'mask'];
const SIMPLE_DIALOG_NODES = new Set(['start', 'locked', 'accept', 'turnin', 'do_turnin', 'do_fight', 'train', 'bye']);
const customTags = new Set();
globalThis.treeData = globalThis.treeData || {};
function allTags() {
    return PRESET_TAGS.concat([...customTags]).sort();
}
function updateTagOptions() {
    const dl = document.getElementById('tagOptions');
    if (!dl)
        return;
    dl.innerHTML = allTags().map(t => `<option value="${t}"></option>`).join('');
}
function isComplexDialogTree(tree) {
    if (!tree || typeof tree !== 'object')
        return false;
    if (tree.imports && Object.keys(tree.imports).length)
        return true;
    const keys = Object.keys(tree).filter(k => k !== 'imports');
    if (!keys.length)
        return false;
    for (const key of keys) {
        if (!SIMPLE_DIALOG_NODES.has(key))
            return true;
    }
    const start = tree.start;
    if (!start)
        return false;
    const choices = Array.isArray(start.choices) ? start.choices : [];
    for (const choice of choices) {
        if (!choice)
            continue;
        const to = choice.to;
        if (to && to !== 'bye' && !SIMPLE_DIALOG_NODES.has(to))
            return true;
        if (Array.isArray(choice.effects) && choice.effects.length)
            return true;
        if (choice.q || choice.quest || choice.reqItem || choice.reqTag || choice.reqSlot || choice.costItem || choice.costTag || choice.costSlot || choice.reward || choice.stat || choice.goto || choice.join || choice.once || choice.spawn || choice.setFlag) {
            return true;
        }
    }
    return false;
}
function updateDialogFieldVisibility(tree) {
    const dialogEl = document.getElementById('npcDialog');
    if (!dialogEl)
        return;
    const wrap = dialogEl.parentElement;
    const hint = document.getElementById('npcDialogHint');
    let current = tree;
    if (!current) {
        const txt = document.getElementById('npcTree')?.value?.trim();
        if (txt) {
            try {
                current = JSON.parse(txt);
            }
            catch (e) {
                current = {};
            }
        }
        else {
            current = {};
        }
    }
    const complex = isComplexDialogTree(current);
    if (wrap?.style)
        wrap.style.display = complex ? 'none' : 'block';
    if (hint?.style)
        hint.style.display = complex ? 'block' : 'none';
    if (complex)
        dialogEl.value = current?.start?.text || '';
}
function collectKnownTags(tags = []) {
    tags.forEach(t => {
        if (t && !PRESET_TAGS.includes(t))
            customTags.add(t);
    });
}
function initTags() {
    customTags.clear();
    (moduleData.items || []).forEach(it => collectKnownTags(it.tags || []));
    updateTagOptions();
}
initTags();
let editNPCIdx = -1, editItemIdx = -1, editQuestIdx = -1, editBldgIdx = -1, editInteriorIdx = -1, editEventIdx = -1, editPortalIdx = -1, editZoneIdx = -1, editArenaIdx = -1, editEncounterIdx = -1, editTemplateIdx = -1;
let currentTree = {};
globalThis.treeData = currentTree;
function getTreeData() {
    return currentTree ?? {};
}
function setTreeData(tree) {
    currentTree = tree ?? {};
    globalThis.treeData = currentTree;
    const treeEl = document.getElementById('npcTree');
    if (treeEl)
        treeEl.value = JSON.stringify(tree, null, 2);
    if (editNPCIdx >= 0)
        moduleData.npcs[editNPCIdx].tree = tree;
    if (typeof updateDialogFieldVisibility === 'function')
        updateDialogFieldVisibility(tree);
}
globalThis.getTreeData = getTreeData;
globalThis.setTreeData = setTreeData;
globalThis.treeData = currentTree;
let selectedObj = null;
const mapSelect = document.getElementById('mapSelect');
let currentMap = 'world';
function updateMapSelect(selected = 'world') {
    if (!mapSelect)
        return;
    const maps = ['world', ...moduleData.interiors.map(I => I.id)];
    mapSelect.innerHTML = maps.map(m => `<option value="${m}">${m}</option>`).join('');
    mapSelect.value = selected;
}
function showMap(map) {
    currentMap = map;
    if (mapSelect && mapSelect.value !== map)
        mapSelect.value = map;
    let idx = -1;
    if (map === 'world') {
        editInteriorIdx = -1;
    }
    else {
        idx = moduleData.interiors.findIndex(I => I.id === map);
        if (idx >= 0) {
            editInterior(idx);
            if (typeof window !== 'undefined' && typeof window.showEditorTab === 'function')
                window.showEditorTab('interiors');
        }
        else {
            editInteriorIdx = -1;
        }
    }
    worldZoom = map === 'world' ? worldZoom : 1;
    panX = map === 'world' ? panX : 0;
    panY = map === 'world' ? panY : 0;
    drawWorld();
    if (idx >= 0)
        drawInterior();
}
if (mapSelect)
    mapSelect.addEventListener('change', e => showMap(e.target.value));
const intCanvas = document.getElementById('intCanvas');
const intCtx = intCanvas.getContext('2d');
const intPalette = document.getElementById('intPalette');
let intPaint = TILE.WALL;
let intPainting = false;
const bldgCanvas = (typeof document !== 'undefined' && typeof document.getElementById === 'function') ? document.getElementById('bldgCanvas') : null;
const bldgCtx = bldgCanvas && typeof bldgCanvas.getContext === 'function' ? bldgCanvas.getContext('2d') : null;
const bldgPalette = document.getElementById('bldgPalette');
let bldgPaint = TILE.BUILDING;
let bldgPainting = false;
let bldgGrid = [];
const worldPalette = document.getElementById('worldPalette');
const paletteLabel = document.getElementById('paletteLabel');
let worldPaint = null;
let worldStamp = null;
let worldPainting = false;
let activeTab = 'npc';
let paintMode = 'tile';
let paintAssetId = '';
let paintOpacity = 1.0;
let didPaint = false, didInteriorPaint = false;
const assetImageCache = new Map();
function getCachedAsset(url) {
    if (assetImageCache.has(url))
        return assetImageCache.get(url);
    const img = new Image();
    img.src = url;
    img.onload = () => drawWorld();
    assetImageCache.set(url, img);
    return img;
}
function renderCustomAssetList() {
    const list = document.getElementById('customAssetsList');
    if (!list)
        return;
    list.innerHTML = '';
    const assets = moduleData.customAssets || {};
    if (Object.keys(assets).length === 0) {
        list.innerHTML = '<div class="muted">(no custom assets)</div>';
        return;
    }
    Object.entries(assets).forEach(([id, meta]) => {
        const div = document.createElement('div');
        div.className = 'asset-row';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '8px';
        div.style.marginBottom = '4px';
        const img = document.createElement('img');
        img.src = meta.url;
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.objectFit = 'contain';
        img.style.border = '1px solid #444';
        const span = document.createElement('span');
        span.textContent = id;
        span.style.flex = '1';
        span.style.overflow = 'hidden';
        span.style.textOverflow = 'ellipsis';
        const useBtn = document.createElement('button');
        useBtn.className = 'btn small';
        useBtn.textContent = 'Use';
        useBtn.onclick = () => {
            paintAssetId = id;
            const assetIdEl = document.getElementById('paintAssetId');
            if (assetIdEl)
                assetIdEl.value = id;
            paintMode = 'asset';
            const modeEl = document.getElementById('paintMode');
            if (modeEl)
                modeEl.value = 'asset';
            const wrap = document.getElementById('paintAssetWrap');
            if (wrap)
                wrap.style.display = 'block';
        };
        const delBtn = document.createElement('button');
        delBtn.className = 'btn small';
        delBtn.textContent = 'x';
        delBtn.setAttribute('aria-label', `Delete asset ${id}`);
        delBtn.onclick = () => {
            if (confirm(`Delete asset ${id}?`)) {
                delete moduleData.customAssets[id];
                renderCustomAssetList();
            }
        };
        div.appendChild(img);
        div.appendChild(span);
        div.appendChild(useBtn);
        div.appendChild(delBtn);
        list.appendChild(div);
    });
}
function createCustomAssetFromFile(file) {
    return new Promise(resolve => {
        if (file.size > 1024 * 1024) {
            alert('File too large (max 1MB)');
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.onload = evt => {
            const dataUrl = typeof evt?.target?.result === 'string' ? evt.target.result : null;
            if (!dataUrl) {
                resolve(null);
                return;
            }
            const img = new Image();
            img.onload = () => {
                if (img.width > 1024 || img.height > 1024) {
                    alert('Image dimensions too large (max 1024x1024)');
                    resolve(null);
                    return;
                }
                const assetId = `asset_${Date.now()}`;
                moduleData.customAssets = moduleData.customAssets || {};
                moduleData.customAssets[assetId] = {
                    url: dataUrl,
                    width: img.width,
                    height: img.height,
                    uploadedAt: Date.now()
                };
                renderCustomAssetList();
                resolve(assetId);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    });
}
function updateTileSpritePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!preview)
        return;
    preview.innerHTML = '';
    const id = input?.value.trim();
    if (!id) {
        preview.textContent = 'No tile sprite';
        return;
    }
    const meta = moduleData.customAssets?.[id];
    if (meta?.url) {
        const img = document.createElement('img');
        img.src = meta.url;
        img.alt = id;
        img.style.width = '32px';
        img.style.height = '32px';
        img.style.objectFit = 'contain';
        img.style.border = '1px solid #444';
        img.style.background = '#000';
        img.title = id;
        preview.appendChild(img);
    }
    else {
        preview.textContent = 'Asset not found';
    }
}
function attachTileSpriteUpload(uploadInputId, targetInputId, previewId, onApplied) {
    const uploadEl = document.getElementById(uploadInputId);
    if (!uploadEl)
        return;
    uploadEl.addEventListener('change', async (e) => {
        const input = e.target;
        const file = input?.files?.[0];
        if (!file)
            return;
        const assetId = await createCustomAssetFromFile(file);
        if (assetId) {
            const target = document.getElementById(targetInputId);
            if (target) {
                target.value = assetId;
                target.dispatchEvent(new Event('input', { bubbles: true }));
                target.dispatchEvent(new Event('change', { bubbles: true }));
            }
            updateTileSpritePreview(targetInputId, previewId);
            if (onApplied)
                onApplied();
        }
        if (input)
            input.value = '';
    });
}
const noiseToggle = document.getElementById('noiseToggle');
const brushSizeSlider = document.getElementById('brushSize');
const brushSizeLabel = document.getElementById('brushSizeLabel');
let worldPaintNoise = true;
let brushSize = 1;
if (noiseToggle) {
    noiseToggle.addEventListener('click', () => {
        worldPaintNoise = !worldPaintNoise;
        noiseToggle.textContent = `Noise: ${worldPaintNoise ? 'On' : 'Off'}`;
    });
    noiseToggle.textContent = 'Noise: On';
}
if (brushSizeSlider) {
    if (brushSizeLabel)
        brushSizeLabel.textContent = brushSizeSlider.value;
    brushSizeSlider.addEventListener('input', () => {
        brushSize = parseInt(brushSizeSlider.value, 10);
        if (brushSizeLabel)
            brushSizeLabel.textContent = brushSizeSlider.value;
    });
}
function addTerrainFeature(x, y, tile) {
    if (!setTile('world', x, y, tile))
        return;
    if (!worldPaintNoise)
        return;
    for (let dy = -brushSize; dy <= brushSize; dy++) {
        for (let dx = -brushSize; dx <= brushSize; dx++) {
            if (dx || dy) {
                if (Math.random() < 0.3)
                    setTile('world', x + dx, y + dy, tile);
            }
        }
    }
}
window.addTerrainFeature = addTerrainFeature;
function stampWorld(x, y, stamp) {
    for (let yy = 0; yy < stamp.length; yy++) {
        for (let xx = 0; xx < stamp[yy].length; xx++) {
            setTile('world', x + xx, y + yy, stamp[yy][xx]);
        }
    }
}
window.stampWorld = stampWorld;
function getEditorNpcColor(n) {
    if (n.overrideColor && n.color)
        return n.color;
    if (n.trainer)
        return '#ffcc99';
    if (n.shop)
        return '#ffee99';
    if (n.inanimate)
        return '#d4af37';
    if (n.questId || n.quests)
        return '#cc99ff';
    if (n.combat?.auto)
        return '#f00';
    if ((n.combat && !n.tree) || n.attackOnSight)
        return '#f88';
    return '#9ef7a0';
}
function getEditorNpcSymbol(n) {
    if (n.symbol)
        return n.symbol;
    if (n.inanimate)
        return '?';
    if (n.questId || n.quests)
        return '★';
    return '!';
}
function drawWorld() {
    const map = currentMap;
    let W = WORLD_W, H = WORLD_H;
    let sx = baseTileW * worldZoom, sy = baseTileH * worldZoom;
    const pulse = 2 + Math.sin(Date.now() / 300) * 2;
    let grid = world;
    const mapOverrides = moduleData.tileOverrides?.[map];
    const customAssets = moduleData.customAssets || {};
    if (map !== 'world') {
        const I = moduleData.interiors.find(i => i.id === map);
        if (!I || !Array.isArray(I.grid))
            return;
        W = I.w;
        H = I.h;
        grid = I.grid;
        sx = canvas.width / W * worldZoom;
        sy = canvas.height / H * worldZoom;
    }
    if (map === 'world' && spawnHeat)
        computeSpawnHeat();
    const selectingNpc = npcMapMode && map === currentMap;
    const selectingStart = settingStart && map === 'world';
    const highlightSelection = selectingNpc || selectingStart;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < H; y++) {
        const py = (y - (map === 'world' ? panY : 0)) * sy;
        if (py + sy < 0 || py >= canvas.height)
            continue;
        const row = grid[y];
        if (!row)
            continue;
        for (let x = 0; x < W; x++) {
            const px = (x - (map === 'world' ? panX : 0)) * sx;
            if (px + sx < 0 || px >= canvas.width)
                continue;
            const t = row[x];
            if (map === 'world') {
                ctx.fillStyle = akColors[t] || '#000';
            }
            else {
                ctx.fillStyle = t === TILE.WALL ? '#444' : t === TILE.DOOR ? '#8bd98d' : '#222';
            }
            ctx.fillRect(px, py, sx, sy);
            if (map === 'world' && spawnHeat && spawnHeatMap && spawnHeatMax > 0) {
                const d = spawnHeatMap[y][x];
                if (d && d !== Infinity) {
                    const a = Math.min(1, d / spawnHeatMax) * 0.5;
                    ctx.fillStyle = 'rgba(255,0,0,' + a + ')';
                    ctx.fillRect(px, py, sx, sy);
                }
            }
            if (mapOverrides) {
                const override = mapOverrides[`${x},${y}`];
                if (override?.assetId) {
                    const meta = customAssets[override.assetId];
                    const img = meta?.url ? getCachedAsset(meta.url) : null;
                    if (img?.complete) {
                        if (override.opacity !== undefined)
                            ctx.globalAlpha = override.opacity;
                        ctx.drawImage(img, px, py, sx, sy);
                        if (override.opacity !== undefined)
                            ctx.globalAlpha = 1;
                    }
                }
            }
            if (highlightSelection) {
                const walkable = isTileWalkable(map, x, y);
                ctx.save();
                ctx.fillStyle = walkable ? 'rgba(120, 200, 140, 0.18)' : 'rgba(210, 70, 70, 0.22)';
                ctx.fillRect(px, py, sx, sy);
                ctx.restore();
            }
        }
    }
    const pxoff = map === 'world' ? panX : 0;
    const pyoff = map === 'world' ? panY : 0;
    if (hoverTile) {
        const hx = hoverTile.x;
        const hy = hoverTile.y;
        const hxpx = (hx - pxoff) * sx;
        const hypy = (hy - pyoff) * sy;
        if (hxpx + sx >= 0 && hypy + sy >= 0 && hxpx <= canvas.width && hypy <= canvas.height) {
            if (highlightSelection) {
                const valid = isTileWalkable(map, hx, hy);
                ctx.save();
                ctx.globalAlpha = 0.2;
                ctx.fillStyle = valid ? '#9ef7a0' : '#f66';
                ctx.fillRect(hxpx, hypy, sx, sy);
                ctx.globalAlpha = 1;
                ctx.strokeStyle = valid ? '#9ef7a0' : '#f66';
                ctx.lineWidth = 2;
                if (typeof ctx.setLineDash === 'function') {
                    ctx.setLineDash([4, 4]);
                }
                ctx.strokeRect(hxpx + 1, hypy + 1, sx - 2, sy - 2);
                if (typeof ctx.setLineDash === 'function') {
                    ctx.setLineDash([]);
                }
                ctx.restore();
            }
            else if (map === 'world' && worldStamp) {
                ctx.save();
                ctx.globalAlpha = 0.5;
                for (let yy = 0; yy < worldStamp.length; yy++) {
                    for (let xx = 0; xx < worldStamp[yy].length; xx++) {
                        const tx = hoverTile.x + xx;
                        const ty = hoverTile.y + yy;
                        if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H)
                            continue;
                        ctx.fillStyle = akColors[worldStamp[yy][xx]] || '#000';
                        ctx.fillRect((tx - panX) * sx, (ty - panY) * sy, sx, sy);
                    }
                }
                ctx.restore();
            }
            else if (map === 'world') {
                ctx.save();
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect((hoverTile.x - panX) * sx, (hoverTile.y - panY) * sy, sx, sy);
                ctx.restore();
            }
        }
    }
    moduleData.npcs.filter(n => n.map === map).forEach(n => {
        const hovering = hoverTarget && hoverTarget.type === 'npc' && hoverTarget.obj === n;
        const px = (n.x - pxoff) * sx;
        const py = (n.y - pyoff) * sy;
        if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height)
            return;
        ctx.save();
        ctx.fillStyle = hovering ? '#fff' : getEditorNpcColor(n);
        if (hovering) {
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 8;
        }
        ctx.fillRect(px, py, sx, sy);
        ctx.fillStyle = '#000';
        ctx.fillText(getEditorNpcSymbol(n), px + 4, py + 12);
        if (hovering) {
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(px, py, sx, sy);
        }
        ctx.restore();
    });
    if (map === 'world' && selectedObj && selectedObj.type === 'npc' && selectedObj.obj.loop) {
        const pts = selectedObj.obj.loop;
        ctx.save();
        ctx.strokeStyle = '#0f0';
        if (typeof ctx.setLineDash === 'function')
            ctx.setLineDash([4, 4]);
        ctx.beginPath();
        pts.forEach((p, i) => {
            const px = (p.x - panX) * sx + sx / 2;
            const py = (p.y - panY) * sy + sy / 2;
            if (i === 0)
                ctx.moveTo(px, py);
            else
                ctx.lineTo(px, py);
        });
        ctx.stroke();
        if (typeof ctx.setLineDash === 'function')
            ctx.setLineDash([]);
        pts.forEach(p => {
            ctx.strokeStyle = '#0f0';
            ctx.strokeRect((p.x - panX) * sx, (p.y - panY) * sy, sx, sy);
        });
        ctx.restore();
        positionLoopControls();
    }
    moduleData.items.filter(it => it.map === map).forEach(it => {
        const hovering = hoverTarget && hoverTarget.type === 'item' && hoverTarget.obj === it;
        const px = (it.x - pxoff) * sx;
        const py = (it.y - pyoff) * sy;
        if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height)
            return;
        ctx.save();
        ctx.strokeStyle = hovering ? '#fff' : '#ff0';
        if (hovering) {
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 8;
            ctx.lineWidth = 2;
        }
        ctx.strokeRect(px + 1, py + 1, sx - 2, sy - 2);
        ctx.restore();
    });
    moduleData.portals.filter(p => p.map === map).forEach(p => {
        const hovering = hoverTarget && hoverTarget.type === 'portal' && hoverTarget.obj === p;
        const px = (p.x - pxoff) * sx;
        const py = (p.y - pyoff) * sy;
        if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height)
            return;
        ctx.save();
        ctx.strokeStyle = '#f0f';
        if (hovering) {
            ctx.shadowColor = '#f0f';
            ctx.shadowBlur = 8;
            ctx.lineWidth = 2;
        }
        ctx.strokeRect(px + 2, py + 2, sx - 4, sy - 4);
        ctx.restore();
    });
    moduleData.events.filter(ev => ev.map === map).forEach(ev => {
        const hovering = hoverTarget && hoverTarget.type === 'event' && hoverTarget.obj === ev;
        const px = (ev.x - pxoff) * sx;
        const py = (ev.y - pyoff) * sy;
        if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height)
            return;
        ctx.save();
        ctx.fillStyle = '#0ff';
        if (hovering) {
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 8;
        }
        ctx.fillRect(px + sx / 4, py + sy / 4, sx / 2, sy / 2);
        ctx.restore();
    });
    moduleData.zones.filter(z => z.map === map).forEach(z => {
        const zx = (z.x - pxoff) * sx;
        const zy = (z.y - pyoff) * sy;
        const zw = z.w * sx;
        const zh = z.h * sy;
        if (zx + zw < 0 || zy + zh < 0 || zx > canvas.width || zy > canvas.height)
            return;
        const hovering = hoverTarget && hoverTarget.type === 'zone' && hoverTarget.obj === z;
        const selected = selectedObj && selectedObj.type === 'zone' && selectedObj.obj === z;
        if (z.walled) {
            renderZoneWalls(ctx, z, pxoff, pyoff, sx, sy);
        }
        ctx.save();
        ctx.strokeStyle = '#fa0';
        if (hovering) {
            ctx.shadowColor = '#fa0';
            ctx.shadowBlur = 8;
        }
        if (hovering || selected)
            ctx.lineWidth = 2;
        ctx.strokeRect(zx, zy, zw, zh);
        if (selected) {
            const hs = Math.max(6, Math.min(sx, sy));
            ctx.fillStyle = '#fa0';
            ctx.fillRect(zx - hs / 2, zy - hs / 2, hs, hs);
            ctx.fillRect(zx + zw - hs / 2, zy + zh - hs / 2, hs, hs);
        }
        ctx.restore();
    });
    if (map === 'world' && hoverTarget && hoverTarget.type === 'bldg') {
        const b = hoverTarget.obj;
        ctx.save();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 8;
        ctx.strokeRect((b.x - panX) * sx, (b.y - panY) * sy, b.w * sx, b.h * sy);
        ctx.restore();
    }
    if (map === 'world' && moduleData.start && moduleData.start.map === 'world') {
        ctx.save();
        ctx.strokeStyle = '#f00';
        ctx.lineWidth = pulse;
        ctx.strokeRect((moduleData.start.x - panX) * sx + 1, (moduleData.start.y - panY) * sy + 1, sx - 2, sy - 2);
        ctx.restore();
    }
    if (selectedObj && selectedObj.obj && selectedObj.obj.map === map) {
        const o = selectedObj.obj;
        ctx.save();
        ctx.lineWidth = pulse;
        if (selectedObj.type === 'npc') {
            ctx.strokeStyle = getEditorNpcColor(o);
            ctx.strokeRect((o.x - pxoff) * sx + 1, (o.y - pyoff) * sy + 1, sx - 2, sy - 2);
        }
        else if (selectedObj.type === 'item') {
            ctx.strokeStyle = '#ff0';
            ctx.strokeRect((o.x - pxoff) * sx + 1, (o.y - pyoff) * sy + 1, sx - 2, sy - 2);
        }
        else if (selectedObj.type === 'bldg' && map === 'world') {
            ctx.strokeStyle = '#fff';
            ctx.strokeRect((o.x - panX) * sx, (o.y - panY) * sy, o.w * sx, o.h * sy);
        }
        else if (selectedObj.type === 'event') {
            ctx.strokeStyle = '#0ff';
            ctx.strokeRect((o.x - pxoff) * sx + 1, (o.y - pyoff) * sy + 1, sx - 2, sy - 2);
        }
        else if (selectedObj.type === 'portal') {
            ctx.strokeStyle = '#f0f';
            ctx.strokeRect((o.x - pxoff) * sx + 2, (o.y - pyoff) * sy + 2, sx - 4, sy - 4);
        }
        ctx.restore();
    }
    if (placingType && placingPos) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        const px = (placingPos.x - pxoff) * sx;
        const py = (placingPos.y - pyoff) * sy;
        if (placingType === 'npc') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(px, py, sx, sy);
        }
        else if (placingType === 'item') {
            ctx.strokeStyle = '#ff0';
            ctx.strokeRect(px + 1, py + 1, sx - 2, sy - 2);
        }
        else if (placingType === 'bldg' && map === 'world') {
            const bw = bldgGrid[0]?.length || 0;
            const bh = bldgGrid.length || 0;
            for (let yy = 0; yy < bh; yy++) {
                for (let xx = 0; xx < bw; xx++) {
                    const t = bldgGrid[yy][xx];
                    if (t) {
                        ctx.fillStyle = t === TILE.DOOR ? '#8bd98d' : '#fff';
                        ctx.fillRect((placingPos.x + xx - panX) * sx, (placingPos.y + yy - panY) * sy, sx, sy);
                    }
                }
            }
        }
        ctx.restore();
    }
    renderProblems();
}
function drawInterior() {
    if (editInteriorIdx < 0)
        return;
    const I = moduleData.interiors[editInteriorIdx];
    if (!I || !Array.isArray(I.grid))
        return;
    const sx = intCanvas.width / I.w;
    const sy = intCanvas.height / I.h;
    intCtx.clearRect(0, 0, intCanvas.width, intCanvas.height);
    for (let y = 0; y < I.h; y++) {
        const row = I.grid[y];
        if (!row)
            continue;
        for (let x = 0; x < I.w; x++) {
            const t = row[x];
            intCtx.fillStyle = t === TILE.WALL ? '#444' : t === TILE.DOOR ? '#8bd98d' : '#222';
            intCtx.fillRect(x * sx, y * sy, sx, sy);
        }
    }
    moduleData.npcs.filter(n => n.map === I.id).forEach(n => {
        intCtx.fillStyle = getEditorNpcColor(n);
        intCtx.fillRect(n.x * sx, n.y * sy, sx, sy);
        intCtx.fillStyle = '#000';
        intCtx.fillText(getEditorNpcSymbol(n), n.x * sx + 4, n.y * sy + 12);
    });
    moduleData.items.filter(it => it.map === I.id).forEach(it => {
        intCtx.strokeStyle = '#ff0';
        intCtx.strokeRect(it.x * sx + 1, it.y * sy + 1, sx - 2, sy - 2);
    });
    if (selectedObj && selectedObj.obj.map === I.id) {
        const o = selectedObj.obj;
        intCtx.save();
        intCtx.lineWidth = 2;
        intCtx.strokeStyle = selectedObj.type === 'npc' ? getEditorNpcColor(o) : '#ff0';
        intCtx.strokeRect(o.x * sx + 1, o.y * sy + 1, sx - 2, sy - 2);
        intCtx.restore();
    }
}
function interiorCanvasPos(e) {
    const I = moduleData.interiors[editInteriorIdx];
    const rect = intCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (intCanvas.width / I.w));
    const y = Math.floor((e.clientY - rect.top) / (intCanvas.height / I.h));
    return { x, y };
}
function applyInteriorBrush(I, x, y, tile) {
    if (!I || !Array.isArray(I.grid))
        return false;
    const radius = Math.max(0, (brushSize || 1) - 1);
    let changed = false;
    for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
            if (tile === TILE.DOOR && (dx || dy))
                continue;
            const tx = x + dx;
            const ty = y + dy;
            if (tx < 0 || ty < 0 || tx >= I.w || ty >= I.h)
                continue;
            const row = I.grid[ty] || (I.grid[ty] = Array(I.w).fill(TILE.FLOOR));
            if (row[tx] !== tile) {
                row[tx] = tile;
                changed = true;
            }
        }
    }
    if (tile === TILE.DOOR) {
        I.entryX = x;
        I.entryY = Math.max(0, y - 1);
    }
    return changed;
}
function paintInterior(e) {
    if (editInteriorIdx < 0 || !intPainting)
        return;
    const I = moduleData.interiors[editInteriorIdx];
    const { x, y } = interiorCanvasPos(e);
    if (x < 0 || y < 0 || x >= I.w || y >= I.h)
        return;
    const painted = applyInteriorBrush(I, x, y, intPaint);
    if (painted || intPaint === TILE.DOOR) {
        didInteriorPaint = true;
        delete I._origGrid;
        drawInterior();
    }
}
intCanvas.addEventListener('mousedown', e => {
    e.stopPropagation();
    e.preventDefault();
    if (editInteriorIdx < 0)
        return;
    const I = moduleData.interiors[editInteriorIdx];
    const { x, y } = interiorCanvasPos(e);
    if (coordTarget) {
        document.getElementById(coordTarget.x).value = x;
        document.getElementById(coordTarget.y).value = y;
        if (coordTarget.map)
            populateMapDropdown(document.getElementById(coordTarget.map), I.id);
        coordTarget = null;
        drawInterior();
        return;
    }
    if (placingType) {
        if (placingType === 'npc') {
            populateMapDropdown(document.getElementById('npcMap'), I.id);
            document.getElementById('npcX').value = x;
            document.getElementById('npcY').value = y;
            if (placingCb)
                placingCb();
        }
        else if (placingType === 'item') {
            populateMapDropdown(document.getElementById('itemMap'), I.id);
            document.getElementById('itemX').value = x;
            document.getElementById('itemY').value = y;
            if (placingCb)
                placingCb();
            document.getElementById('cancelItem').style.display = 'none';
        }
        placingType = null;
        placingPos = null;
        placingCb = null;
        drawInterior();
        return;
    }
    const overNpc = moduleData.npcs.some(n => n.map === I.id && n.x === x && n.y === y);
    const overItem = moduleData.items.some(it => it.map === I.id && it.x === x && it.y === y);
    if (!coordTarget && !placingType && (overNpc || overItem)) {
        return;
    }
    intPainting = true;
    paintInterior(e);
});
intCanvas.addEventListener('mousemove', e => { if (intPainting)
    paintInterior(e); });
intCanvas.addEventListener('mouseup', () => { intPainting = false; });
intCanvas.addEventListener('mouseleave', () => { intPainting = false; didInteriorPaint = false; });
intCanvas.addEventListener('click', e => {
    if (editInteriorIdx < 0)
        return;
    if (didInteriorPaint) {
        didInteriorPaint = false;
        return;
    }
    const I = moduleData.interiors[editInteriorIdx];
    const { x, y } = interiorCanvasPos(e);
    if (x < 0 || y < 0 || x >= I.w || y >= I.h) {
        didInteriorPaint = false;
        return;
    }
    let idx = moduleData.npcs.findIndex(n => n.map === I.id && n.x === x && n.y === y);
    if (idx >= 0) {
        if (window.showEditorTab)
            window.showEditorTab('npc');
        editNPC(idx);
        didInteriorPaint = false;
        return;
    }
    idx = moduleData.items.findIndex(it => it.map === I.id && it.x === x && it.y === y);
    if (idx >= 0) {
        if (window.showEditorTab)
            window.showEditorTab('items');
        editItem(idx);
    }
    didInteriorPaint = false;
});
intPalette.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        intPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const t = btn.dataset.tile;
        intPaint = t === 'W' ? TILE.WALL : t === 'D' ? TILE.DOOR : TILE.FLOOR;
    });
});
intPalette.querySelector('button')?.classList.add('active');
function showInteriorEditor(show) {
    document.getElementById('intEditor').style.display = show ? 'block' : 'none';
}
function renderInteriorList() {
    const list = document.getElementById('intList');
    if (moduleData.interiors.length === 0) {
        list.innerHTML = renderEmptyState('No interiors created yet.');
    }
    else {
        const ints = moduleData.interiors.map((I, i) => ({ I, i })).sort((a, b) => a.I.id.localeCompare(b.I.id));
        list.innerHTML = ints.map(({ I, i }) => `<button type="button" class="list-item-btn" data-idx="${i}">${I.label || I.id}</button>`).join('');
        Array.from(list.children).forEach(btn => btn.onclick = () => editInterior(parseInt(btn.dataset.idx, 10)));
    }
    updateInteriorOptions();
    refreshChoiceDropdowns();
    updateMapSelect(mapSelect ? mapSelect.value : 'world');
}
function startNewInterior() {
    const w = parseInt(document.getElementById('intW').value, 10) || 12;
    const h = parseInt(document.getElementById('intH').value, 10) || 9;
    const id = makeInteriorRoom(undefined, w, h);
    const I = interiors[id];
    I.id = id;
    moduleData.interiors.push(I);
    renderInteriorList();
    editInterior(moduleData.interiors.length - 1);
}
function editInterior(i) {
    const I = moduleData.interiors[i];
    editInteriorIdx = i;
    document.getElementById('intId').value = I.id;
    document.getElementById('intLabel').value = I.label || '';
    document.getElementById('intW').value = I.w;
    document.getElementById('intH').value = I.h;
    showInteriorEditor(true);
    document.getElementById('delInterior').style.display = 'block';
    drawInterior();
}
function resizeInterior() {
    if (editInteriorIdx < 0)
        return;
    const I = moduleData.interiors[editInteriorIdx];
    const w = parseInt(document.getElementById('intW').value, 10) || I.w;
    const h = parseInt(document.getElementById('intH').value, 10) || I.h;
    const ng = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => {
        if (y < I.h && x < I.w && I.grid[y])
            return I.grid[y][x];
        const edge = y === 0 || y === h - 1 || x === 0 || x === w - 1;
        return edge ? TILE.WALL : TILE.FLOOR;
    }));
    I.w = w;
    I.h = h;
    I.grid = ng;
    delete I._origGrid;
    drawInterior();
}
document.getElementById('intW').addEventListener('change', resizeInterior);
document.getElementById('intH').addEventListener('change', resizeInterior);
document.getElementById('intLabel').addEventListener('input', e => {
    if (editInteriorIdx < 0)
        return;
    const I = moduleData.interiors[editInteriorIdx];
    const v = e.target.value.trim();
    if (v)
        I.label = v;
    else
        delete I.label;
    const div = document.querySelector(`#intList div[data-idx="${editInteriorIdx}"]`);
    if (div)
        div.textContent = I.label || I.id;
    updateInteriorOptions();
    refreshChoiceDropdowns();
});
function deleteInterior() {
    if (editInteriorIdx < 0)
        return;
    const I = moduleData.interiors[editInteriorIdx];
    delete interiors[I.id];
    moduleData.interiors.splice(editInteriorIdx, 1);
    editInteriorIdx = -1;
    showInteriorEditor(false);
    renderInteriorList();
}
function closeInteriorEditor() {
    editInteriorIdx = -1;
    document.getElementById('delInterior').style.display = 'none';
    showInteriorEditor(false);
}
function updateInteriorOptions() {
    const sel = document.getElementById('bldgInterior');
    if (!sel)
        return;
    sel.innerHTML = '<option value=""></option>' + moduleData.interiors.map(I => `<option value="${I.id}">${I.id}</option>`).join('');
}
function confirmDialog(msg, onYes) {
    const modal = document.getElementById('confirmModal');
    if (!modal) {
        if (confirm(msg))
            onYes();
        return;
    }
    document.getElementById('confirmText').textContent = msg;
    modal.classList.add('shown');
    const yes = document.getElementById('confirmYes');
    const no = document.getElementById('confirmNo');
    if (!yes || !no)
        return;
    const prev = document.activeElement;
    const triggerClick = (btn) => {
        if (!btn)
            return;
        const clickEvent = typeof MouseEvent !== 'undefined'
            ? new MouseEvent('click')
            : { preventDefault: () => undefined };
        if (btn.onclick)
            btn.onclick(clickEvent);
        else
            btn.click?.();
    };
    yes.focus();
    const tgt = document.addEventListener ? document : document.body;
    const onKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault?.();
            triggerClick(yes);
        }
        else if (e.key === 'Escape') {
            e.preventDefault?.();
            triggerClick(no);
        }
    };
    const cleanup = () => {
        modal.classList.remove('shown');
        yes.onclick = null;
        no.onclick = null;
        tgt.removeEventListener?.('keydown', onKey);
        prev?.focus?.();
    };
    yes.onclick = () => { cleanup(); onYes(); };
    no.onclick = cleanup;
    tgt.addEventListener?.('keydown', onKey);
}
const listFilterApplyFns = new Map();
const listFilterResetMarkers = new WeakSet();
function renderEmptyState(message) {
    return `<div class="list-empty-state muted" style="padding: 4px;">${message}</div>`;
}
function setupListFilter(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    if (!input || !list)
        return;
    const apply = () => {
        const term = input.value.toLowerCase();
        Array.from(list.children).forEach(ch => {
            if (ch.classList.contains('list-empty-state'))
                return;
            ch.style.display = ch.textContent.toLowerCase().includes(term) ? '' : 'none';
        });
    };
    listFilterApplyFns.set(inputId, apply);
    input.addEventListener('input', apply);
    if (typeof MutationObserver !== 'undefined') {
        new MutationObserver(apply).observe(list, { childList: true });
    }
    if (!listFilterResetMarkers.has(input)) {
        const resetBtn = document.createElement('button');
        resetBtn.type = 'button';
        resetBtn.className = 'btn filter-reset';
        resetBtn.textContent = 'Reset Filter';
        resetBtn.addEventListener('click', () => resetListFilter(inputId, { focus: true }));
        if (typeof input.insertAdjacentElement === 'function') {
            input.insertAdjacentElement('afterend', resetBtn);
        }
        else if (input.parentNode) {
            input.parentNode.insertBefore(resetBtn, input.nextSibling);
        }
        listFilterResetMarkers.add(input);
        if (typeof input.setAttribute === 'function') {
            input.setAttribute('data-reset-attached', '1');
        }
        else if (input.dataset) {
            input.dataset.resetAttached = '1';
        }
    }
    apply();
}
function resetListFilter(inputId, options = {}) {
    const input = document.getElementById(inputId);
    if (!input)
        return;
    const { focus = false } = options;
    const apply = listFilterApplyFns.get(inputId);
    if (input.value) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    else if (apply) {
        apply();
    }
    if (focus)
        input.focus();
}
function regenWorld() {
    moduleData.seed = Date.now();
    genWorld(moduleData.seed, { buildings: [] });
    moduleData.buildings = [];
    moduleData.interiors = [];
    moduleData.events = [];
    moduleData.portals = [];
    moduleData.zones = [];
    moduleData.templates = [];
    for (const id in interiors) {
        if (id === 'creator')
            continue;
        const I = interiors[id];
        I.id = id;
        moduleData.interiors.push(I);
    }
    renderInteriorList();
    renderBldgList();
    renderEventList();
    renderPortalList();
    renderZoneList();
    renderEncounterList();
    renderTemplateList();
    renderArenaList();
    drawWorld();
}
function generateProceduralWorld(regen) {
    confirmDialog(regen ? 'Regenerate the world map?' : 'Replace the world map?', () => {
        moduleData.procGen = moduleData.procGen || {};
        if (!regen) {
            const seedVal = parseInt(document.getElementById('procSeed').value, 10);
            moduleData.procGen.seed = Number.isFinite(seedVal) ? seedVal : Date.now();
            moduleData.procGen.falloff = parseFloat(document.getElementById('procFalloff').value) || 0;
            moduleData.procGen.roads = document.getElementById('procRoads').checked;
            moduleData.procGen.ruins = document.getElementById('procRuins').checked;
        }
        const cfg = moduleData.procGen;
        const map = generateProceduralMap(cfg.seed, WORLD_W, WORLD_H, 4, cfg.falloff, { roads: cfg.roads, ruins: cfg.ruins });
        world.length = 0;
        for (let y = 0; y < WORLD_H; y++) {
            world.push(map.tiles[y]);
        }
        initTags();
        renderNPCList();
        renderItemList();
        renderQuestList();
        renderBldgList();
        renderInteriorList();
        renderEventList();
        renderPortalList();
        renderZoneList();
        renderEncounterList();
        renderTemplateList();
        renderArenaList();
        drawWorld();
    });
}
globalThis.generateProceduralWorld = generateProceduralWorld;
function clearWorld() {
    confirmDialog('Clear the world map?', () => {
        for (let y = 0; y < WORLD_H; y++) {
            for (let x = 0; x < WORLD_W; x++) {
                setTile('world', x, y, TILE.SAND);
            }
        }
        moduleData.npcs = [];
        moduleData.items = [];
        moduleData.quests = [];
        moduleData.buildings = [];
        moduleData.interiors = [];
        moduleData.portals = [];
        moduleData.events = [];
        moduleData.zones = [];
        moduleData.encounters = [];
        moduleData.templates = [];
        moduleData.personas = {};
        initTags();
        buildings.length = 0;
        portals.length = 0;
        globalThis.interiors = {};
        interiors = globalThis.interiors;
        renderNPCList();
        renderItemList();
        renderQuestList();
        renderBldgList();
        renderInteriorList();
        renderEventList();
        renderPortalList();
        renderZoneList();
        renderEncounterList();
        renderTemplateList();
        renderArenaList();
        drawWorld();
    });
}
function collectMods(containerId = 'modBuilder') {
    const wrap = document.getElementById(containerId);
    if (!wrap)
        return {};
    const mods = {};
    wrap.querySelectorAll('label').forEach(label => {
        const chk = label.querySelector('input[type="checkbox"]');
        const mod = chk?.getAttribute('data-mod');
        if (!chk || !mod)
            return;
        if (chk.checked) {
            const val = parseInt(label.querySelector('.modVal').value, 10);
            if (!isNaN(val))
                mods[mod] = val;
        }
    });
    return mods;
}
function loadMods(mods = {}, containerId = 'modBuilder') {
    const mb = document.getElementById(containerId);
    if (!mb)
        return;
    mb.innerHTML = '';
    MOD_TYPES.forEach(m => {
        const label = document.createElement('label');
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.gap = '4px';
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.setAttribute('data-mod', m);
        const span = document.createElement('span');
        span.textContent = m;
        const inp = document.createElement('input');
        inp.type = 'number';
        inp.className = 'modVal';
        inp.style.width = '60px';
        inp.disabled = true;
        chk.onchange = () => { inp.disabled = !chk.checked; };
        label.appendChild(chk);
        label.appendChild(span);
        label.appendChild(inp);
        mb.appendChild(label);
        if (typeof mods[m] === 'number') {
            chk.checked = true;
            inp.disabled = false;
            inp.value = String(mods[m]);
        }
    });
}
function renderDialogPreview() {
    const prev = document.getElementById('dialogPreview');
    let tree = null;
    const txt = document.getElementById('npcTree').value.trim();
    if (txt) {
        try {
            tree = JSON.parse(txt);
        }
        catch (e) {
            tree = null;
        }
    }
    // Inject preview + spoof controls once
    if (prev && !document.getElementById('dlgPreviewControls')) {
        const ctl = document.createElement('div');
        ctl.id = 'dlgPreviewControls';
        ctl.style.marginBottom = '6px';
        ctl.innerHTML = `<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      <input id="spoofFlags" placeholder="flag=a, other=2" style="flex:1 1 200px"/>
      <button class="btn" type="button" id="playDlg">Play In-Game</button>
      <button class="btn" type="button" id="stopDlg">Stop</button>
    </div>
    <div id="spoofImports" class="small" style="margin-top:6px"></div>`;
        prev.parentElement.insertBefore(ctl, prev);
        document.getElementById('playDlg').onclick = () => playInGameWithSpoof();
        document.getElementById('stopDlg').onclick = () => stopSpoofPlayback();
    }
    // Render imports spoof panel (lightweight)
    const importsEl = document.getElementById('spoofImports');
    if (importsEl) {
        let imports = (tree && tree.imports) || null;
        if (!imports && tree)
            imports = generateImportsShallow(tree);
        const flags = (imports && imports.flags) || [];
        const items = (imports && imports.items) || [];
        let html = '';
        if (flags.length) {
            html += '<div><b>Flags</b> ' + flags.map(f => `<label style="margin-right:6px">${f}<input type="number" data-flag="${f}" value="1" min="0" style="width:56px;margin-left:4px"/></label>`).join('') + '</div>';
        }
        if (items.length) {
            html += '<div style="margin-top:4px"><b>Items</b> ' + items.map(it => `<label style="margin-right:6px">${it}<input type="number" data-item="${it}" value="1" min="0" style="width:56px;margin-left:4px"/></label>`).join('') + '</div>';
        }
        importsEl.innerHTML = html || '<span class="muted">(no imports)</span>';
    }
    if (!tree || !tree.start) {
        prev.innerHTML = '';
        return;
    }
    function show(id) {
        const node = tree[id];
        if (!node)
            return;
        const html = (node.choices || [])
            .map(c => `<button class="btn" data-to="${c.to || ''}" style="margin-top:4px">${c.label}</button>`)
            .join('');
        prev.innerHTML = `<div>${node.text || ''}</div>` + html;
        Array.from(prev.querySelectorAll('button')).forEach(btn => btn.onclick = () => {
            const t = btn.dataset.to;
            if (t)
                show(t);
        });
    }
    show('start');
}
// Shallow imports generator (editor-only)
function generateImportsShallow(tree) {
    const flags = new Set();
    const items = new Set();
    Object.entries(tree || {}).forEach(([id, node]) => {
        if (id === 'imports')
            return;
        const choices = (node && node.choices) || [];
        choices.forEach(c => {
            if (c.if && c.if.flag)
                flags.add(c.if.flag);
            if (c.setFlag && c.setFlag.flag)
                flags.add(c.setFlag.flag);
            if (c.reqItem)
                items.add(c.reqItem);
            if (c.costItem)
                items.add(c.costItem);
            if (c.reward && typeof c.reward === 'string' && !/^xp|scrap/i.test(c.reward))
                items.add(c.reward);
        });
    });
    return { flags: [...flags], items: [...items], events: [], queries: [] };
}
let _origFlagValue = null;
let _origCloseDialog = null;
let _origHasItem = null;
let _origCountItems = null;
function parseSpoofFlags(input) {
    const out = {};
    (input || '').split(',').forEach(pair => {
        const [k, v] = pair.split('=').map(s => (s || '').trim());
        if (!k)
            return;
        const num = v === '' ? 1 : (isNaN(Number(v)) ? 1 : Number(v));
        out[k] = num;
    });
    return out;
}
function buildSpoofFlagsFromPanel() {
    const panel = document.getElementById('spoofImports');
    if (!panel)
        return null;
    const inputs = panel.querySelectorAll('input[data-flag]');
    if (!inputs.length)
        return null;
    const out = {};
    inputs.forEach(inp => { const v = parseInt(inp.value, 10); out[inp.dataset.flag] = Number.isNaN(v) ? 1 : v; });
    return out;
}
function buildSpoofItemsFromPanel() {
    const panel = document.getElementById('spoofImports');
    if (!panel)
        return null;
    const inputs = panel.querySelectorAll('input[data-item]');
    if (!inputs.length)
        return null;
    const out = {};
    inputs.forEach(inp => { const v = parseInt(inp.value, 10); out[inp.dataset.item] = Number.isNaN(v) ? 1 : v; });
    return out;
}
function startSpoofPlayback(tree, flags, items, locked = false) {
    if (!_origFlagValue)
        _origFlagValue = globalThis.flagValue;
    if (!_origCloseDialog)
        _origCloseDialog = globalThis.closeDialog;
    if (!_origHasItem)
        _origHasItem = globalThis.hasItem;
    if (!_origCountItems)
        _origCountItems = globalThis.countItems;
    globalThis.flagValue = function (flag) {
        if (Object.prototype.hasOwnProperty.call(flags || {}, flag))
            return flags[flag] || 0;
        return _origFlagValue(flag);
    };
    const itemCounts = items || {};
    globalThis.hasItem = function (idOrTag) {
        if (typeof idOrTag === 'string' && Object.prototype.hasOwnProperty.call(itemCounts, idOrTag))
            return (itemCounts[idOrTag] || 0) > 0;
        return _origHasItem(idOrTag);
    };
    globalThis.countItems = function (idOrTag) {
        if (typeof idOrTag === 'string' && Object.prototype.hasOwnProperty.call(itemCounts, idOrTag))
            return itemCounts[idOrTag] || 0;
        return _origCountItems(idOrTag);
    };
    globalThis.closeDialog = function () {
        stopSpoofPlayback();
        _origCloseDialog();
    };
    const npc = { id: 'ack_preview', map: state.map, x: party.x, y: party.y, name: 'Preview', title: '', desc: '', tree };
    if (locked && tree && tree.locked)
        npc.locked = true;
    openDialog(npc, 'start');
}
function stopSpoofPlayback() {
    if (_origFlagValue) {
        globalThis.flagValue = _origFlagValue;
        _origFlagValue = null;
    }
    if (_origCloseDialog) {
        globalThis.closeDialog = _origCloseDialog;
        _origCloseDialog = null;
    }
    if (_origHasItem) {
        globalThis.hasItem = _origHasItem;
        _origHasItem = null;
    }
    if (_origCountItems) {
        globalThis.countItems = _origCountItems;
        _origCountItems = null;
    }
}
function playInGameWithSpoof() {
    // Use imports panel values if present, else freeform field
    const txt = document.getElementById('npcTree').value.trim();
    if (!txt)
        return;
    let tree = null;
    try {
        tree = JSON.parse(txt);
    }
    catch (e) {
        alert('Invalid tree JSON');
        return;
    }
    const flags = buildSpoofFlagsFromPanel() || parseSpoofFlags(document.getElementById('spoofFlags').value);
    const items = buildSpoofItemsFromPanel() || {};
    const locked = document.getElementById('npcLocked')?.checked;
    startSpoofPlayback(tree, flags, items, locked);
}
const ADV_HTML = {
    reward: `<label>Reward<select class="choiceRewardType"><option value=""></option><option value="xp">XP</option><option value="scrap">Scrap</option><option value="item">Item</option></select>
        <input type="number" class="choiceRewardXP" style="display:none"/>
        <input type="number" class="choiceRewardScrap" style="display:none"/>
        <select class="choiceRewardItem" style="display:none"></select></label>`,
    stat: `<label>Stat<select class="choiceStat"></select></label>
      <label>DC<input type="number" class="choiceDC"/><span class="small">Target number for stat check.</span></label>
      <label>Success<input class="choiceSuccess"/><span class="small">Shown if check passes.</span></label>
      <label>Failure<input class="choiceFailure"/><span class="small">Shown if check fails.</span></label>`,
    cost: `<label>Cost Item<select class="choiceCostItem"></select></label>
      <label>Cost Slot<select class="choiceCostSlot"></select></label>
      <label>Cost Tag<input class="choiceCostTag" list="tagOptions"/></label>`,
    req: `<label>Req Item<select class="choiceReqItem"></select></label>
      <label>Req Slot<select class="choiceReqSlot"></select></label>
      <label>Req Tag<input class="choiceReqTag" list="tagOptions"/></label>`,
    join: `<fieldset class="choiceSubGroup"><legend>Join</legend>
        <label>ID<select class="choiceJoinId"></select></label>
        <label>Name<input class="choiceJoinName"/><span class="small">Name shown after joining.</span></label>
        <label>Role<select class="choiceJoinRole"></select></label>
      </fieldset>`,
    goto: `<fieldset class="choiceSubGroup"><legend>Goto</legend>
        <label>Target<select class="choiceGotoTarget"><option value="player">Player</option><option value="npc">NPC</option></select></label>
        <label>Map<select class="choiceGotoMap"></select></label>
        <label>X<input type="number" class="choiceGotoX"/><span class="small">X coordinate.</span></label>
        <label>Y<input type="number" class="choiceGotoY"/><span class="small">Y coordinate.</span></label>
        <label class="inline"><input type="checkbox" class="choiceGotoRel"/> relative</label>
      </fieldset>`,
    doors: `<label>Board Door<select class="choiceBoard"></select></label>
      <label>Unboard Door<select class="choiceUnboard"></select></label>`,
    npcLock: `<label>Lock NPC<select class="choiceLockNPC"></select></label>
      <label>Unlock NPC<select class="choiceUnlockNPC"></select></label>
      <label>Lock Duration(ms)<input type="number" class="choiceLockDuration"/></label>`,
    npcColor: `<label>NPC<select class="choiceColorNPC"></select></label>
      <label>Color<input type="color" class="choiceNPCColor"/></label>`,
    flagEff: `<fieldset class="choiceSubGroup"><legend>Flag Effect</legend>
        <label>Flag Name<input class="choiceSetFlagName" list="choiceFlagList"/></label>
        <label>Operation<select class="choiceSetFlagOp"><option value="set">Set</option><option value="add">Add</option><option value="clear">Clear</option></select></label>
        <label>Value<input type="number" class="choiceSetFlagValue"/></label>
      </fieldset>`,
    spawn: `<fieldset class="choiceSubGroup"><legend>Spawn NPC</legend>
        <label>Template<select class="choiceSpawnTemplate"></select></label>
        <label>X<input type="number" class="choiceSpawnX"/></label>
        <label>Y<input type="number" class="choiceSpawnY"/></label>
      </fieldset>`,
    quest: `<label>Quest<select class="choiceQ"><option value=""></option><option value="accept">accept</option><option value="turnin">turnin</option></select></label>`,
    once: `<label class="onceWrap"><input type="checkbox" class="choiceOnce"/> once</label>`,
    ifOnce: `<fieldset class="choiceSubGroup"><legend>If Once</legend>
        <label>Node<input class="choiceIfOnceNode"/></label>
        <label>Label<input class="choiceIfOnceLabel"/></label>
        <label class="inline"><input type="checkbox" class="choiceIfOnceUsed"/> used</label>
      </fieldset>`,
    condition: `<label>Flag<input class="choiceFlag" list="choiceFlagList"/></label>
      <label>Op<select class="choiceOp"><option value=">=">&gt;=</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value="<">&lt;</option><option value="==">=</option><option value="!=">!=</option></select></label>
      <label>Value<input type="number" class="choiceVal" value="1"/></label>`
};
function addChoiceRow(container, ch = {}) {
    const { label = '', to = '', reward = '', stat = '', dc = '', success = '', failure = '', once = false, costItem = '', costSlot = '', costTag = '', reqItem = '', reqSlot = '', reqTag = '', join = null, q = '', setFlag = null, spawn = null } = ch || {};
    const cond = ch && ch.if ? ch.if : null;
    const ifOnce = ch && ch.ifOnce ? ch.ifOnce : null;
    const ifOnceNode = ifOnce?.node || '';
    const ifOnceLabel = ifOnce?.label || '';
    const ifOnceUsed = ifOnce?.used ? true : false;
    const flag = cond?.flag || '';
    const op = cond?.op || '>=';
    const val = cond?.value != null ? cond.value : 1;
    const joinId = join?.id || '', joinName = join?.name || '', joinRole = join?.role || '';
    const goto = ch.goto || {};
    const gotoMap = goto.map || '', gotoX = goto.x != null ? goto.x : '', gotoY = goto.y != null ? goto.y : '';
    const gotoTarget = goto.target === 'npc' ? 'npc' : 'player';
    const gotoRel = !!goto.rel;
    const isXP = typeof reward === 'string' && /^xp\s*\d+/i.test(reward);
    const xpVal = isXP ? parseInt(reward.replace(/[^0-9]/g, ''), 10) : '';
    const isScrap = typeof reward === 'string' && /^scrap\s*\d+/i.test(reward);
    const scrapVal = isScrap ? parseInt(reward.replace(/[^0-9]/g, ''), 10) : '';
    const isItem = reward && !isXP && !isScrap;
    const itemVal = isItem ? reward : '';
    const effs = Array.isArray(ch.effects) ? ch.effects : [];
    const knownEffectTypes = ['boardDoor', 'unboardDoor', 'lockNPC', 'unlockNPC', 'npcColor'];
    const extraEffects = effs.filter(e => !knownEffectTypes.includes(e?.effect));
    const boardEff = effs.find(e => e.effect === 'boardDoor');
    const unboardEff = effs.find(e => e.effect === 'unboardDoor');
    const boardId = boardEff ? boardEff.interiorId || '' : '';
    const unboardId = unboardEff ? unboardEff.interiorId || '' : '';
    const lockEff = effs.find(e => e.effect === 'lockNPC');
    const unlockEff = effs.find(e => e.effect === 'unlockNPC');
    const lockId = lockEff ? lockEff.npcId || '' : '';
    const lockDur = lockEff && typeof lockEff.duration === 'number' ? lockEff.duration : '';
    const unlockId = unlockEff ? unlockEff.npcId || '' : '';
    const colorEff = effs.find(e => e.effect === 'npcColor');
    const colorNpc = colorEff ? colorEff.npcId || '' : '';
    const colorHex = colorEff ? colorEff.color || '' : '';
    const setFlagName = setFlag?.flag || '';
    const setFlagOp = setFlag?.op || 'set';
    const setFlagVal = setFlag?.value ?? '';
    const spawnTemplate = spawn?.templateId || '';
    const spawnX = spawn?.x ?? '';
    const spawnY = spawn?.y ?? '';
    const row = document.createElement('div');
    const rowDataset = row.dataset;
    if (extraEffects.length)
        rowDataset.extraEffects = JSON.stringify(extraEffects);
    else
        delete rowDataset.extraEffects;
    row.innerHTML = `<label>Label<input class="choiceLabel" value="${label}"/></label>
    <label>To<select class="choiceTo"></select></label>
    <button class="btn delChoice" type="button" aria-label="Delete choice">x</button>
    <details class="choiceAdv"><summary>Advanced</summary>
      <div class="advOptions"></div>
      <div style="margin-top:4px"><select class="advSelect">
        <option value="">Add...</option>
        <option value="reward">Reward</option>
        <option value="stat">Stat Check</option>
        <option value="cost">Cost</option>
        <option value="req">Require</option>
        <option value="join">Join NPC</option>
        <option value="goto">Goto</option>
        <option value="doors">Doors</option>
        <option value="npcLock">NPC Lock</option>
        <option value="npcColor">NPC Color</option>
        <option value="flagEff">Flag Effect</option>
        <option value="spawn">Spawn NPC</option>
        <option value="quest">Quest Tag</option>
        <option value="once">Once</option>
        <option value="ifOnce">If Once</option>
        <option value="condition">Flag Condition</option>
      </select>
      <button class="btn advAddBtn" type="button">Add</button></div>
    </details>`;
    container.appendChild(row);
    populateChoiceDropdown(row.querySelector('.choiceTo'), to);
    function addAdv(type) {
        const opts = row.querySelector('.advOptions');
        if (opts.querySelector(`[data-adv="${type}"]`))
            return;
        const div = document.createElement('div');
        div.dataset.adv = type;
        div.innerHTML = ADV_HTML[type] || '';
        const del = document.createElement('button');
        del.className = 'btn delAdv';
        del.type = 'button';
        del.textContent = 'x';
        del.setAttribute('aria-label', 'Delete condition');
        del.addEventListener('click', () => { div.remove(); refreshChoiceDropdowns(); updateTreeData(); });
        div.prepend(del);
        opts.appendChild(div);
        refreshChoiceDropdowns();
        div.querySelectorAll('input,textarea,select').forEach(el => el.addEventListener('input', updateTreeData));
        div.querySelectorAll('select').forEach(el => el.addEventListener('change', updateTreeData));
        div.querySelectorAll('input[type=checkbox]').forEach(el => el.addEventListener('change', updateTreeData));
        if (type === 'reward') {
            const rewardTypeSel = div.querySelector('.choiceRewardType');
            const rewardXP = div.querySelector('.choiceRewardXP');
            const rewardScrap = div.querySelector('.choiceRewardScrap');
            const rewardItem = div.querySelector('.choiceRewardItem');
            rewardTypeSel.addEventListener('change', () => {
                rewardXP.style.display = rewardTypeSel.value === 'xp' ? 'inline-block' : 'none';
                rewardScrap.style.display = rewardTypeSel.value === 'scrap' ? 'inline-block' : 'none';
                rewardItem.style.display = rewardTypeSel.value === 'item' ? 'inline-block' : 'none';
                updateTreeData();
            });
        }
        if (type === 'join') {
            const joinSel = div.querySelector('.choiceJoinId');
            joinSel.addEventListener('change', () => {
                const npc = moduleData.npcs.find(n => n.id === joinSel.value);
                const nameEl = div.querySelector('.choiceJoinName');
                if (npc && !nameEl.value)
                    nameEl.value = npc.name;
                updateTreeData();
            });
        }
    }
    const advBtn = row.querySelector('.advAddBtn');
    advBtn.addEventListener('click', () => {
        const sel = row.querySelector('.advSelect');
        const type = sel.value;
        if (type) {
            addAdv(type);
            sel.value = '';
        }
    });
    let rewardTypeSel;
    if (reward) {
        addAdv('reward');
        rewardTypeSel = row.querySelector('.choiceRewardType');
        const xp = row.querySelector('.choiceRewardXP');
        const sc = row.querySelector('.choiceRewardScrap');
        const ri = row.querySelector('.choiceRewardItem');
        if (rewardTypeSel)
            rewardTypeSel.value = isXP ? 'xp' : isScrap ? 'scrap' : 'item';
        if (xp)
            xp.value = xpVal;
        if (sc)
            sc.value = scrapVal;
        if (ri)
            (ri.dataset || (ri.dataset = {})).sel = itemVal;
    }
    if (stat || dc || success || failure) {
        addAdv('stat');
        if (stat)
            row.querySelector('.choiceStat').value = stat;
        if (dc !== '')
            row.querySelector('.choiceDC').value = dc;
        if (success)
            row.querySelector('.choiceSuccess').value = success;
        if (failure)
            row.querySelector('.choiceFailure').value = failure;
    }
    if (costItem || costSlot || costTag) {
        addAdv('cost');
        if (costItem) {
            const el = row.querySelector('.choiceCostItem');
            if (el)
                (el.dataset || (el.dataset = {})).sel = costItem;
        }
        if (costSlot) {
            const el = row.querySelector('.choiceCostSlot');
            if (el)
                (el.dataset || (el.dataset = {})).sel = costSlot;
        }
        if (costTag)
            row.querySelector('.choiceCostTag').value = costTag;
    }
    if (reqItem || reqSlot || reqTag) {
        addAdv('req');
        if (reqItem) {
            const el = row.querySelector('.choiceReqItem');
            if (el)
                (el.dataset || (el.dataset = {})).sel = reqItem;
        }
        if (reqSlot) {
            const el = row.querySelector('.choiceReqSlot');
            if (el)
                (el.dataset || (el.dataset = {})).sel = reqSlot;
        }
        if (reqTag)
            row.querySelector('.choiceReqTag').value = reqTag;
    }
    if (joinId || joinName || joinRole) {
        addAdv('join');
        if (joinId)
            row.querySelector('.choiceJoinId').value = joinId;
        if (joinName)
            row.querySelector('.choiceJoinName').value = joinName;
        if (joinRole)
            row.querySelector('.choiceJoinRole').value = joinRole;
    }
    if (gotoMap || gotoX !== '' || gotoY !== '' || gotoTarget === 'npc' || gotoRel) {
        addAdv('goto');
        row.querySelector('.choiceGotoTarget').value = gotoTarget;
        if (gotoMap)
            row.querySelector('.choiceGotoMap').value = gotoMap;
        if (gotoX !== '')
            row.querySelector('.choiceGotoX').value = gotoX;
        if (gotoY !== '')
            row.querySelector('.choiceGotoY').value = gotoY;
        if (gotoRel)
            row.querySelector('.choiceGotoRel').checked = true;
    }
    if (boardId || unboardId) {
        addAdv('doors');
        if (boardId)
            row.querySelector('.choiceBoard').value = boardId;
        if (unboardId)
            row.querySelector('.choiceUnboard').value = unboardId;
    }
    if (lockId || unlockId || lockDur !== '') {
        addAdv('npcLock');
        if (lockId) {
            const el = row.querySelector('.choiceLockNPC');
            if (el)
                (el.dataset || (el.dataset = {})).sel = lockId;
        }
        if (unlockId) {
            const el = row.querySelector('.choiceUnlockNPC');
            if (el)
                (el.dataset || (el.dataset = {})).sel = unlockId;
        }
        if (lockDur !== '')
            row.querySelector('.choiceLockDuration').value = lockDur;
    }
    if (colorNpc || colorHex) {
        addAdv('npcColor');
        if (colorNpc) {
            const el = row.querySelector('.choiceColorNPC');
            if (el)
                (el.dataset || (el.dataset = {})).sel = colorNpc;
        }
        if (colorHex)
            row.querySelector('.choiceNPCColor').value = colorHex;
    }
    if (setFlagName) {
        addAdv('flagEff');
        row.querySelector('.choiceSetFlagName').value = setFlagName;
        row.querySelector('.choiceSetFlagOp').value = setFlagOp;
        if (setFlagVal !== '')
            row.querySelector('.choiceSetFlagValue').value = setFlagVal;
    }
    if (spawnTemplate) {
        addAdv('spawn');
        row.querySelector('.choiceSpawnTemplate').value = spawnTemplate;
        if (spawnX !== '')
            row.querySelector('.choiceSpawnX').value = spawnX;
        if (spawnY !== '')
            row.querySelector('.choiceSpawnY').value = spawnY;
    }
    if (q) {
        addAdv('quest');
        row.querySelector('.choiceQ').value = q;
    }
    if (once) {
        addAdv('once');
        row.querySelector('.choiceOnce').checked = true;
    }
    if (ifOnceNode || ifOnceLabel || ifOnceUsed) {
        addAdv('ifOnce');
        row.querySelector('.choiceIfOnceNode').value = ifOnceNode;
        row.querySelector('.choiceIfOnceLabel').value = ifOnceLabel;
        if (ifOnceUsed)
            row.querySelector('.choiceIfOnceUsed').checked = true;
    }
    if (flag) {
        addAdv('condition');
        row.querySelector('.choiceFlag').value = flag;
        row.querySelector('.choiceOp').value = op;
        row.querySelector('.choiceVal').value = val;
    }
    const toSel = row.querySelector('.choiceTo');
    toSel.addEventListener('change', () => { if (toSel.value === '[new]')
        updateTreeData(); });
    row.querySelectorAll('input,textarea,select').forEach(el => el.addEventListener('input', updateTreeData));
    row.querySelectorAll('select').forEach(el => el.addEventListener('change', updateTreeData));
    row.querySelectorAll('input[type=checkbox]').forEach(el => el.addEventListener('change', updateTreeData));
    row.querySelector('.delChoice').addEventListener('click', () => { row.remove(); updateTreeData(); });
    refreshChoiceDropdowns();
    if (reward && rewardTypeSel)
        rewardTypeSel.dispatchEvent(new Event('change'));
}
function populateChoiceDropdown(sel, selected = '') {
    const keys = Object.keys(getTreeData()).filter(k => k !== 'imports');
    sel.innerHTML = '<option value=""></option><option value="[new]">[new]</option>' + keys.map(k => `<option value="${k}">${k}</option>`).join('');
    if (selected && !keys.includes(selected)) {
        sel.innerHTML += `<option value="${selected}" selected>${selected}</option>`;
    }
    else {
        sel.value = selected;
    }
}
function populateStatDropdown(sel, selected = '') {
    const stats = ['', 'STR', 'AGI', 'INT', 'PER', 'LCK', 'CHA'];
    sel.innerHTML = stats.map(s => `<option value="${s}">${s}</option>`).join('');
    sel.value = selected;
}
function populateSlotDropdown(sel, selected = '') {
    const slots = ['', 'weapon', 'armor', 'trinket'];
    sel.innerHTML = slots.map(s => `<option value="${s}">${s}</option>`).join('');
    sel.value = selected;
}
function populateTypeDropdown(sel, selected = '') {
    const types = ['', 'weapon', 'armor', 'trinket', 'consumable', 'quest', 'misc'];
    sel.innerHTML = types.map(t => `<option value="${t}">${t}</option>`).join('');
    sel.value = selected;
}
function populateItemDropdown(sel, selected = '') {
    const selectedId = typeof selected === 'string' ? selected.trim() : '';
    const ids = Array.isArray(moduleData?.items)
        ? moduleData.items
            .map(it => typeof it?.id === 'string' ? it.id : '')
            .filter(Boolean)
        : [];
    const uniqueIds = new Set(ids);
    if (selectedId)
        uniqueIds.add(selectedId);
    const sortedIds = Array.from(uniqueIds).sort((a, b) => a.localeCompare(b));
    sel.innerHTML = '<option value=""></option>' + sortedIds.map(id => `<option value="${id}">${id}</option>`).join('');
    sel.value = selectedId;
}
function populateNPCDropdown(sel, selected = '') {
    sel.innerHTML = '<option value="">Select NPC…</option>' + moduleData.npcs.map(n => `<option value="${n.id}">${n.id}</option>`).join('');
    sel.value = selected;
}
function populateRoleDropdown(sel, selected = '') {
    const roles = ['', 'Wanderer', 'Scavenger', 'Gunslinger', 'Snakeoil Preacher', 'Cogwitch'];
    sel.innerHTML = roles.map(r => `<option value="${r}">${r}</option>`).join('');
    sel.value = selected;
}
function populateMapDropdown(sel, selected = '') {
    const maps = ['world', ...moduleData.interiors.map(I => I.id)];
    sel.innerHTML = '<option value=""></option>' + maps.map(m => `<option value="${m}">${m}</option>`).join('');
    sel.value = selected;
}
function populateInteriorDropdown(sel, selected = '') {
    const ints = moduleData.interiors.map(i => i.id);
    sel.innerHTML = '<option value=""></option>' + ints.map(i => `<option value="${i}">${i}</option>`).join('');
    sel.value = selected;
}
function populateTemplateDropdown(sel, selected = '') {
    sel.innerHTML = '<option value=""></option>' + moduleData.templates.map(t => `<option value="${t.id}">${t.id}</option>`).join('');
    sel.value = selected;
}
function refreshChoiceDropdowns() {
    document.querySelectorAll('.choiceTo').forEach(sel => populateChoiceDropdown(sel, sel.value));
    document.querySelectorAll('.choiceStat').forEach(sel => populateStatDropdown(sel, sel.value));
    document.querySelectorAll('.choiceCostSlot').forEach(sel => populateSlotDropdown(sel, sel.dataset.sel || sel.value));
    document.querySelectorAll('.choiceReqSlot').forEach(sel => populateSlotDropdown(sel, sel.dataset.sel || sel.value));
    document.querySelectorAll('.choiceCostItem').forEach(sel => populateItemDropdown(sel, sel.dataset.sel || sel.value));
    document.querySelectorAll('.choiceReqItem').forEach(sel => populateItemDropdown(sel, sel.dataset.sel || sel.value));
    document.querySelectorAll('.choiceJoinId').forEach(sel => populateNPCDropdown(sel, sel.value));
    document.querySelectorAll('.choiceJoinRole').forEach(sel => populateRoleDropdown(sel, sel.value));
    document.querySelectorAll('.choiceGotoMap').forEach(sel => populateMapDropdown(sel, sel.value));
    document.querySelectorAll('.choiceRewardItem').forEach(sel => populateItemDropdown(sel, sel.dataset.sel || sel.value));
    document.querySelectorAll('.choiceBoard').forEach(sel => populateInteriorDropdown(sel, sel.value));
    document.querySelectorAll('.choiceUnboard').forEach(sel => populateInteriorDropdown(sel, sel.value));
    document.querySelectorAll('.choiceLockNPC').forEach(sel => populateNPCDropdown(sel, sel.dataset.sel || sel.value));
    document.querySelectorAll('.choiceUnlockNPC').forEach(sel => populateNPCDropdown(sel, sel.dataset.sel || sel.value));
    document.querySelectorAll('.choiceColorNPC').forEach(sel => populateNPCDropdown(sel, sel.dataset.sel || sel.value));
    document.querySelectorAll('.choiceSpawnTemplate').forEach(sel => populateTemplateDropdown(sel, sel.value));
    document.querySelectorAll('.arenaWaveTemplate').forEach(sel => populateTemplateDropdown(sel, sel.value));
    document.querySelectorAll('.lootItemSelect').forEach(sel => populateItemDropdown(sel, sel.value));
    const encTemplate = document.getElementById('encTemplate');
    if (encTemplate)
        populateTemplateDropdown(encTemplate, encTemplate.value);
}
function renderTreeEditor() {
    const wrap = document.getElementById('treeEditor');
    if (!wrap)
        return;
    wrap.innerHTML = '';
    Object.entries(getTreeData()).forEach(([id, node]) => {
        if (id === 'imports')
            return;
        const div = document.createElement('div');
        div.className = 'node';
        div.innerHTML = `<div class="nodeHeader"><button class="btn toggle" type="button" aria-label="Toggle node">-</button><label>Node ID<input class="nodeId" value="${id}"></label><button class="btn delNode" type="button" title="Delete node" aria-label="Delete node">&#128465;</button></div><div class="nodeBody"><label>Dialog Text<textarea class="nodeText" rows="2">${node.text || ''}</textarea></label><fieldset class="choiceGroup"><legend>Choices</legend><div class="choices"></div><button class="btn addChoice" type="button">Add Choice</button></fieldset></div>`;
        const choicesDiv = div.querySelector('.choices');
        if (!choicesDiv)
            return;
        (node.choices || []).forEach(ch => addChoiceRow(choicesDiv, ch));
        const addChoiceBtn = div.querySelector('.addChoice');
        if (addChoiceBtn)
            addChoiceBtn.onclick = () => addChoiceRow(choicesDiv);
        const toggleBtn = div.querySelector('.toggle');
        toggleBtn.addEventListener('click', () => {
            div.classList.toggle('collapsed');
            toggleBtn.textContent = div.classList.contains('collapsed') ? '+' : '-';
            updateTreeData();
        });
        const delBtn = div.querySelector('.delNode');
        delBtn.addEventListener('click', () => {
            confirmDialog('Delete this node?', () => {
                div.remove();
                updateTreeData();
            });
        });
        wrap.appendChild(div);
    });
    wrap.querySelectorAll('input,textarea,select').forEach(el => el.addEventListener('input', updateTreeData));
    wrap.querySelectorAll('select').forEach(el => el.addEventListener('change', updateTreeData));
    wrap.querySelectorAll('input[type=checkbox]').forEach(el => el.addEventListener('change', updateTreeData));
    refreshChoiceDropdowns();
}
function updateTreeData() {
    const wrap = document.getElementById('treeEditor');
    const newTree = {};
    const nodeRefs = {};
    const oldTree = getTreeData();
    const choiceRefs = [];
    // Build tree from editor UI. Preserve collapsed nodes by keeping previous snapshot.
    wrap.querySelectorAll('.node').forEach(nodeEl => {
        const id = nodeEl.querySelector('.nodeId').value.trim();
        if (!id)
            return;
        nodeRefs[id] = nodeEl;
        // If collapsed, keep previous data for this node (don’t overwrite)
        if (nodeEl.classList.contains('collapsed')) {
            if (oldTree[id])
                newTree[id] = oldTree[id];
            return;
        }
        const text = nodeEl.querySelector('.nodeText').value;
        const choices = [];
        nodeEl.querySelectorAll('.choices > div').forEach(chEl => {
            const label = chEl.querySelector('.choiceLabel').value.trim();
            const toEl = chEl.querySelector('.choiceTo');
            let to = toEl.value.trim();
            const rewardType = chEl.querySelector('.choiceRewardType')?.value || '';
            const xpTxt = chEl.querySelector('.choiceRewardXP')?.value.trim() || '';
            const scrapTxt = chEl.querySelector('.choiceRewardScrap')?.value.trim() || '';
            const itemReward = chEl.querySelector('.choiceRewardItem')?.value.trim() || '';
            let reward = '';
            if (rewardType === 'xp' && xpTxt)
                reward = `XP ${parseInt(xpTxt, 10)}`;
            else if (rewardType === 'scrap' && scrapTxt)
                reward = `SCRAP ${parseInt(scrapTxt, 10)}`;
            else if ((rewardType === 'item' || (!rewardType && itemReward)) && itemReward)
                reward = itemReward;
            const stat = chEl.querySelector('.choiceStat')?.value.trim() || '';
            const dcTxt = chEl.querySelector('.choiceDC')?.value.trim() || '';
            const dc = dcTxt ? parseInt(dcTxt, 10) : undefined;
            const success = chEl.querySelector('.choiceSuccess')?.value.trim() || '';
            const failure = chEl.querySelector('.choiceFailure')?.value.trim() || '';
            const costItemSel = chEl.querySelector('.choiceCostItem');
            const costItem = costItemSel ? (costItemSel.value || costItemSel.dataset?.sel || '').trim() : '';
            const costSlot = chEl.querySelector('.choiceCostSlot')?.value.trim() || '';
            const costTag = chEl.querySelector('.choiceCostTag')?.value.trim() || '';
            const reqItemSel = chEl.querySelector('.choiceReqItem');
            const reqItem = reqItemSel ? (reqItemSel.value || reqItemSel.dataset?.sel || '').trim() : '';
            const reqSlot = chEl.querySelector('.choiceReqSlot')?.value.trim() || '';
            const reqTag = chEl.querySelector('.choiceReqTag')?.value.trim() || '';
            const joinId = chEl.querySelector('.choiceJoinId')?.value.trim() || '';
            const joinName = chEl.querySelector('.choiceJoinName')?.value.trim() || '';
            const joinRole = chEl.querySelector('.choiceJoinRole')?.value.trim() || '';
            const gotoMap = chEl.querySelector('.choiceGotoMap')?.value.trim() || '';
            const gotoXTxt = chEl.querySelector('.choiceGotoX')?.value.trim() || '';
            const gotoYTxt = chEl.querySelector('.choiceGotoY')?.value.trim() || '';
            const gotoTarget = chEl.querySelector('.choiceGotoTarget')?.value || 'player';
            const gotoRel = chEl.querySelector('.choiceGotoRel')?.checked || false;
            const q = chEl.querySelector('.choiceQ')?.value.trim() || '';
            const once = chEl.querySelector('.choiceOnce')?.checked || false;
            const ifOnceNode = chEl.querySelector('.choiceIfOnceNode')?.value.trim() || '';
            const ifOnceLabel = chEl.querySelector('.choiceIfOnceLabel')?.value.trim() || '';
            const ifOnceUsed = chEl.querySelector('.choiceIfOnceUsed')?.checked || false;
            const setFlagName = chEl.querySelector('.choiceSetFlagName')?.value.trim() || '';
            const flag = chEl.querySelector('.choiceFlag')?.value.trim() || '';
            const op = chEl.querySelector('.choiceOp')?.value || '>=';
            const valTxt = chEl.querySelector('.choiceVal')?.value.trim() || '';
            const val = valTxt ? parseInt(valTxt, 10) : undefined;
            choiceRefs.push({ to, el: toEl });
            // Auto-create targets for [new] and new:<slug>
            if (to === '[new]' || to.startsWith('new:')) {
                const slug = to === '[new]' ? '' : to.substring(4);
                let base = slug || 'node';
                let cand = base;
                let i = 1;
                while (newTree[cand] || oldTree[cand]) {
                    cand = base + '-' + i++;
                }
                if (!newTree[cand])
                    newTree[cand] = { text: '', choices: [{ label: '(Leave)', to: 'bye' }] };
                to = cand;
                populateChoiceDropdown(toEl, to);
            }
            if (label) {
                const c = { label };
                if (to)
                    c.to = to;
                if (reward)
                    c.reward = reward;
                if (stat)
                    c.stat = stat;
                if (dc != null && !Number.isNaN(dc))
                    c.dc = dc;
                if (success)
                    c.success = success;
                if (failure)
                    c.failure = failure;
                if (costItem)
                    c.costItem = costItem;
                if (costSlot)
                    c.costSlot = costSlot;
                if (costTag)
                    c.costTag = costTag;
                if (reqItem)
                    c.reqItem = reqItem;
                if (reqSlot)
                    c.reqSlot = reqSlot;
                if (reqTag)
                    c.reqTag = reqTag;
                if (joinId || joinName || joinRole)
                    c.join = { id: joinId, name: joinName, role: joinRole };
                if (gotoMap || gotoXTxt || gotoYTxt || gotoTarget === 'npc' || gotoRel) {
                    const go = {};
                    if (gotoMap)
                        go.map = gotoMap;
                    const gx = gotoXTxt ? parseInt(gotoXTxt, 10) : undefined;
                    const gy = gotoYTxt ? parseInt(gotoYTxt, 10) : undefined;
                    if (gx != null && !Number.isNaN(gx))
                        go.x = gx;
                    if (gy != null && !Number.isNaN(gy))
                        go.y = gy;
                    if (gotoTarget === 'npc')
                        go.target = 'npc';
                    if (gotoRel)
                        go.rel = true;
                    c.goto = go;
                }
                if (q)
                    c.q = q;
                if (once)
                    c.once = true;
                if (ifOnceNode && ifOnceLabel) {
                    c.ifOnce = { node: ifOnceNode, label: ifOnceLabel };
                    if (ifOnceUsed)
                        c.ifOnce.used = true;
                }
                const boardId = chEl.querySelector('.choiceBoard')?.value.trim();
                const unboardId = chEl.querySelector('.choiceUnboard')?.value.trim();
                const lockSel = chEl.querySelector('.choiceLockNPC');
                const lockNpc = lockSel ? (lockSel.value || lockSel.dataset?.sel || '').trim() : '';
                const lockDurTxt = chEl.querySelector('.choiceLockDuration')?.value.trim();
                const lockDur = lockDurTxt ? parseInt(lockDurTxt, 10) : 0;
                const unlockSel = chEl.querySelector('.choiceUnlockNPC');
                const unlockNpc = unlockSel ? (unlockSel.value || unlockSel.dataset?.sel || '').trim() : '';
                const colorSel = chEl.querySelector('.choiceColorNPC');
                const colorNpc = colorSel ? (colorSel.value || colorSel.dataset?.sel || '').trim() : '';
                const colorHex = chEl.querySelector('.choiceNPCColor')?.value.trim();
                if (flag)
                    c.if = { flag, op, value: val != null && !Number.isNaN(val) ? val : 0 };
                const ds = chEl.dataset || {};
                let extra = [];
                if (ds.extraEffects) {
                    try {
                        extra = JSON.parse(ds.extraEffects) || [];
                    }
                    catch (e) {
                        extra = [];
                    }
                }
                const effs = Array.isArray(extra) ? extra.filter(e => e && typeof e === 'object').map(e => ({ ...e })) : [];
                if (boardId)
                    effs.push({ effect: 'boardDoor', interiorId: boardId });
                if (unboardId)
                    effs.push({ effect: 'unboardDoor', interiorId: unboardId });
                if (lockNpc) {
                    const obj = { effect: 'lockNPC', npcId: lockNpc };
                    if (!Number.isNaN(lockDur) && lockDur > 0)
                        obj.duration = lockDur;
                    effs.push(obj);
                }
                if (unlockNpc)
                    effs.push({ effect: 'unlockNPC', npcId: unlockNpc });
                if (colorNpc && colorHex)
                    effs.push({ effect: 'npcColor', npcId: colorNpc, color: colorHex });
                if (effs.length)
                    c.effects = effs;
                if (setFlagName) {
                    const op = chEl.querySelector('.choiceSetFlagOp').value;
                    const valTxt = chEl.querySelector('.choiceSetFlagValue').value.trim();
                    const value = valTxt ? parseInt(valTxt, 10) : undefined;
                    c.setFlag = { flag: setFlagName, op, value };
                }
                const spawnTemplate = chEl.querySelector('.choiceSpawnTemplate')?.value.trim();
                if (spawnTemplate) {
                    const x = chEl.querySelector('.choiceSpawnX')?.value.trim() || '0';
                    const y = chEl.querySelector('.choiceSpawnY')?.value.trim() || '0';
                    c.spawn = { templateId: spawnTemplate, x: parseInt(x, 10), y: parseInt(y, 10) };
                }
                choices.push(c);
            }
        });
        const nodeData = { text, choices };
        newTree[id] = nodeData;
    });
    // Commit + mirror into textarea for persistence/preview, persist imports (only if non-empty)
    const __imp = generateImportsShallow(newTree);
    if ((__imp.flags && __imp.flags.length) || (__imp.items && __imp.items.length) || (__imp.events && __imp.events.length) || (__imp.queries && __imp.queries.length)) {
        newTree.imports = __imp;
    }
    else if (newTree.imports) {
        delete newTree.imports;
    }
    setTreeData(newTree);
    // Live preview + keep "to" dropdowns in sync with current node keys
    renderDialogPreview();
    refreshChoiceDropdowns();
    // ---- Validation: highlight bad targets & orphans ----
    // 1) Choice target validation: red border if target doesn't exist
    choiceRefs.forEach(({ to, el }) => {
        el.style.borderColor = (to && !newTree[to]) ? 'red' : '';
    });
    // 2) Reachability from 'start' (and 'locked' if enabled)
    const visited = new Set();
    const visit = id => {
        if (visited.has(id) || !newTree[id])
            return;
        visited.add(id);
        (newTree[id].choices || []).forEach(c => { if (c.to)
            visit(c.to); });
    };
    visit('start');
    if (document.getElementById('npcLocked').checked)
        visit('locked');
    const orphans = [];
    Object.entries(nodeRefs).forEach(([id, nodeEl]) => {
        const el = nodeEl;
        if (!visited.has(id)) {
            el.style.borderColor = 'orange';
            orphans.push(id);
        }
        else {
            el.style.borderColor = '';
        }
    });
    const warnEl = document.getElementById('treeWarning');
    if (warnEl)
        warnEl.textContent = orphans.length ? `⚠️ Orphan nodes: ${orphans.join(', ')}` : '';
}
function loadTreeEditor() {
    let txt = document.getElementById('npcTree').value.trim();
    let tree;
    try {
        tree = txt ? JSON.parse(txt) : {};
    }
    catch (e) {
        tree = {};
    }
    setTreeData(tree);
    renderTreeEditor();
    updateTreeData();
}
function openDialogEditor() {
    document.getElementById('dialogModal').classList.add('shown');
    renderTreeEditor();
}
function closeDialogEditor() {
    updateTreeData();
    document.getElementById('dialogModal').classList.remove('shown');
    const dlgEl = document.getElementById('npcDialog');
    const tree = getTreeData();
    if (!dlgEl.value.trim())
        dlgEl.value = tree.start?.text || '';
    applyNPCChanges();
}
function toggleQuestDialogBtn() {
    const btn = document.getElementById('genQuestDialog');
    const sel = document.getElementById('npcQuests');
    if (!btn || !sel)
        return;
    const count = sel.selectedOptions ? sel.selectedOptions.length : 0;
    btn.style.display = count ? 'block' : 'none';
}
function addNode() {
    const tree = getTreeData();
    const id = Object.keys(tree).length ? 'node' + Object.keys(tree).length : 'start';
    tree[id] = { text: '', choices: [] };
    setTreeData(tree);
    renderTreeEditor();
    updateTreeData();
}
function generateQuestTree() {
    const sel = document.getElementById('npcQuests');
    if (!sel)
        return;
    const opts = sel.selectedOptions || [];
    const quest = opts[0]?.value?.trim();
    if (!quest)
        return;
    const dialogLines = document.getElementById('npcDialog').value.trim().split('\n');
    const dialog = dialogLines[0] || '';
    const accept = document.getElementById('npcAccept').value.trim();
    const turnin = document.getElementById('npcTurnin').value.trim();
    const tree = { start: { text: dialog } };
    if (accept)
        tree.accept = { text: accept };
    if (turnin)
        tree.do_turnin = { text: turnin };
    document.getElementById('npcTree').value = JSON.stringify(tree, null, 2);
    loadTreeEditor();
}
function toggleQuestTextWrap() {
    const wrap = document.getElementById('questTextWrap');
    const sel = document.getElementById('npcQuests');
    if (!wrap || !sel)
        return;
    const count = sel.selectedOptions ? sel.selectedOptions.length : 0;
    wrap.style.display = count ? 'block' : 'none';
}
// --- NPCs ---
const npcPortraits = [null, ...Array.from({ length: 90 }, (_, i) => `assets/portraits/portrait_${1000 + i}.png`)];
let npcPortraitIndex = 0;
let npcPortraitPath = '';
function setNpcPortrait() {
    const el = document.getElementById('npcPort');
    const img = npcPortraitPath || npcPortraits[npcPortraitIndex];
    if (el)
        el.style.backgroundImage = img ? `url(${img})` : '';
}
const personaPortraits = npcPortraits;
let itemPersonaPortraitIndex = 0;
let itemPersonaPortraitPath = '';
function setItemPersonaPortrait() {
    const el = document.getElementById('itemPersonaPort');
    const img = itemPersonaPortraitPath || personaPortraits[itemPersonaPortraitIndex];
    if (el)
        el.style.backgroundImage = img ? `url(${img})` : '';
}
function resetPersonaFields() {
    const idEl = document.getElementById('itemPersonaId');
    const labelEl = document.getElementById('itemPersonaLabel');
    const pathEl = document.getElementById('itemPersonaPortraitPath');
    if (idEl)
        idEl.value = '';
    if (labelEl)
        labelEl.value = '';
    if (pathEl)
        pathEl.value = '';
    itemPersonaPortraitIndex = 0;
    itemPersonaPortraitPath = '';
    setItemPersonaPortrait();
    updatePersonaSection();
}
function loadPersonaFields(personaId) {
    const id = personaId || document.getElementById('itemPersonaId')?.value?.trim() || '';
    const labelEl = document.getElementById('itemPersonaLabel');
    const pathEl = document.getElementById('itemPersonaPortraitPath');
    const data = (moduleData.personas || {})[id] || {};
    if (labelEl)
        labelEl.value = data.label || '';
    const stored = data.portrait || '';
    const idx = personaPortraits.indexOf(stored);
    if (idx > 0) {
        itemPersonaPortraitIndex = idx;
        itemPersonaPortraitPath = '';
        if (pathEl)
            pathEl.value = '';
    }
    else {
        itemPersonaPortraitIndex = 0;
        itemPersonaPortraitPath = stored || '';
        if (pathEl)
            pathEl.value = stored || '';
    }
    setItemPersonaPortrait();
    updatePersonaSection();
}
function updatePersonaSection() {
    const wrap = document.getElementById('itemPersonaSection');
    if (!wrap)
        return;
    const tags = document.getElementById('itemTags')?.value || '';
    const personaId = document.getElementById('itemPersonaId')?.value?.trim();
    const tagList = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    const show = tagList.includes('mask') || !!personaId;
    wrap.style.display = show ? 'block' : 'none';
}
function applyCombatTree(tree) {
    tree.start = tree.start || { text: '', choices: [] };
    tree.start.choices = Array.isArray(tree.start.choices) ? tree.start.choices : [];
    if (!tree.start.choices.some(c => c?.to === 'do_fight'))
        tree.start.choices.unshift({ label: '(Fight)', to: 'do_fight' });
    tree.do_fight = tree.do_fight || { text: '', choices: [] };
    tree.do_fight.choices = Array.isArray(tree.do_fight.choices) ? tree.do_fight.choices : [];
    if (!tree.do_fight.choices.length)
        tree.do_fight.choices.push({ label: '(Continue)', to: 'bye' });
}
function removeCombatTree(tree) {
    if (tree.start && Array.isArray(tree.start.choices))
        tree.start.choices = tree.start.choices.filter(c => c.to !== 'do_fight');
    delete tree.do_fight;
}
function onLockedToggle() {
    if (document.getElementById('npcLocked').checked) {
        const tree = getTreeData();
        if (!tree.start)
            tree.start = { text: '', choices: [{ label: '(Leave)', to: 'bye' }] };
        if (!tree.locked)
            tree.locked = { text: '', choices: [{ label: '(Leave)', to: 'bye' }] };
        setTreeData(tree);
        renderTreeEditor();
    }
    updateTreeData();
}
function updateNPCOptSections() {
    document.getElementById('combatOpts').style.display =
        document.getElementById('npcCombat').checked ? 'block' : 'none';
    document.getElementById('shopOpts').style.display =
        document.getElementById('npcShop').checked ? 'block' : 'none';
    document.getElementById('revealOpts').style.display =
        document.getElementById('npcHidden').checked ? 'block' : 'none';
    document.getElementById('trainerOpts').style.display =
        document.getElementById('npcTrainer').checked ? 'block' : 'none';
}
function updateColorOverride() {
    const wrap = document.getElementById('npcColorWrap');
    wrap.style.display = document.getElementById('npcColorOverride').checked ? 'block' : 'none';
}
function updatePatrolSection() {
    const patrol = document.getElementById('npcPatrol').checked;
    const loopWrap = document.getElementById('npcLoopPts');
    const addBtn = document.getElementById('addLoopPt');
    if (loopWrap)
        loopWrap.style.display = patrol ? 'block' : 'none';
    if (addBtn)
        addBtn.style.display = patrol ? 'block' : 'none';
    if (patrol) {
        if (selectedObj && selectedObj.type === 'npc') {
            selectedObj.obj.loop = selectedObj.obj.loop || [{ x: selectedObj.obj.x, y: selectedObj.obj.y }];
            renderLoopFields(selectedObj.obj.loop);
        }
    }
    else {
        if (selectedObj && selectedObj.type === 'npc')
            delete selectedObj.obj.loop;
        renderLoopFields([]);
        showLoopControls(null);
    }
}
function renderLoopFields(pts) {
    const wrap = document.getElementById('npcLoopPts');
    if (!wrap)
        return;
    wrap.innerHTML = '';
    pts.forEach(p => {
        const row = document.createElement('div');
        row.className = 'row loopPoint';
        row.innerHTML = `<label>X<input type="number" class="loopX" value="${p.x}" /></label>` +
            `<label>Y<input type="number" class="loopY" value="${p.y}" /></label>`;
        const del = document.createElement('button');
        del.type = 'button';
        del.textContent = '-';
        del.className = 'pill';
        del.setAttribute('aria-label', 'Remove loop point');
        del.onclick = () => row.remove();
        row.appendChild(del);
        wrap.appendChild(row);
    });
}
function gatherLoopFields() {
    const pts = [];
    document.querySelectorAll('#npcLoopPts .loopPoint').forEach(row => {
        const x = parseInt(row.querySelector('.loopX').value, 10);
        const y = parseInt(row.querySelector('.loopY').value, 10);
        if (!isNaN(x) && !isNaN(y))
            pts.push({ x, y });
    });
    return pts;
}
const addLoopBtn = document.getElementById('addLoopPt');
if (addLoopBtn) {
    addLoopBtn.addEventListener('click', () => {
        const pts = gatherLoopFields();
        pts.push({ x: 0, y: 0 });
        renderLoopFields(pts);
    });
}
const loopWrap = document.getElementById('npcLoopPts');
if (loopWrap) {
    loopWrap.addEventListener('input', () => {
        if (selectedObj && selectedObj.type === 'npc') {
            selectedObj.obj.loop = gatherLoopFields();
        }
    });
}
function updateFlagBuilder() {
    const type = document.getElementById('npcFlagType').value;
    document.getElementById('revealVisit').style.display = type === 'visits' ? 'block' : 'none';
    document.getElementById('revealParty').style.display = type === 'party' ? 'block' : 'none';
}
function gatherEventFlags() {
    const flags = new Set();
    (moduleData.events || []).forEach(e => {
        (e.events || []).forEach(ev => {
            if (ev.effect === 'addFlag' && ev.flag)
                flags.add(ev.flag);
        });
    });
    return [...flags];
}
function populateFlagList() {
    const flags = gatherEventFlags().map(f => `<option value="${f}"></option>`).join('');
    const npcList = document.getElementById('npcFlagList');
    if (npcList)
        npcList.innerHTML = flags;
    const choiceList = document.getElementById('choiceFlagList');
    if (choiceList)
        choiceList.innerHTML = flags;
}
function getRevealFlag() {
    const type = document.getElementById('npcFlagType').value;
    if (type === 'visits') {
        const map = document.getElementById('npcFlagMap').value.trim() || 'world';
        const x = parseInt(document.getElementById('npcFlagX').value, 10) || 0;
        const y = parseInt(document.getElementById('npcFlagY').value, 10) || 0;
        return `visits@${map}@${x},${y}`;
    }
    if (type === 'party') {
        return document.getElementById('npcFlagName').value.trim();
    }
    return '';
}
function showNPCEditor(show) {
    document.getElementById('npcEditor').style.display = show ? 'block' : 'none';
    if (!show) {
        updateNpcMapBanner('', false);
        canvas?.classList?.remove('map-select');
    }
}
function setNpcNotice(message, type = 'info', autoClear = false) {
    const notice = document.getElementById('npcFormNotice');
    if (!notice)
        return;
    clearTimeout(npcNoticeTimer);
    npcNoticeTimer = 0;
    notice.textContent = message || '';
    notice.style.display = message ? 'block' : 'none';
    notice.classList.remove('error', 'success');
    if (type === 'error')
        notice.classList.add('error');
    if (type === 'success')
        notice.classList.add('success');
    if (autoClear && message) {
        npcNoticeTimer = setTimeout(() => {
            notice.classList.remove('success');
            notice.style.display = 'none';
        }, 3500);
    }
}
function updateNpcMapBanner(message, show) {
    const banner = document.getElementById('npcMapBanner');
    if (!banner)
        return;
    banner.textContent = message || '';
    banner.style.display = show && message ? 'block' : 'none';
}
function setNpcCancelVisible(show) {
    const cancelBtn = document.getElementById('npcCancelPick');
    if (!cancelBtn)
        return;
    cancelBtn.style.display = show ? 'inline-block' : 'none';
}
function setNpcFieldInvalid(el, invalid) {
    if (!el)
        return;
    const cls = el.classList;
    if (invalid) {
        if (cls?.add)
            cls.add('input-invalid');
        if (typeof el.setAttribute === 'function')
            el.setAttribute('aria-invalid', 'true');
    }
    else {
        if (cls?.remove)
            cls.remove('input-invalid');
        if (typeof el.removeAttribute === 'function')
            el.removeAttribute('aria-invalid');
    }
}
function getNpcFieldWrapper(id) {
    const el = document.getElementById(id);
    if (!el)
        return null;
    const wrap = typeof el.closest === 'function' ? el.closest('label') : null;
    return wrap || el;
}
function openNpcSection(sectionId, options = {}) {
    const section = npcSectionRefs.get(sectionId);
    if (!section)
        return;
    const { scroll = false, focus = false } = options;
    section.open = true;
    if (scroll && typeof section.scrollIntoView === 'function') {
        section.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    if (focus) {
        const summary = section.querySelector('summary');
        summary?.focus?.({ preventScroll: scroll });
    }
}
function setupNpcSections() {
    const editor = document.getElementById('npcEditor');
    if (!editor)
        return;
    const appliedAttr = typeof editor.getAttribute === 'function' ? editor.getAttribute('data-sections-applied') : null;
    const applied = editor.dataset?.sectionsApplied === '1' || appliedAttr === '1';
    if (applied)
        return;
    if (editor.dataset) {
        editor.dataset.sectionsApplied = '1';
    }
    else if (typeof editor.setAttribute === 'function') {
        editor.setAttribute('data-sections-applied', '1');
    }
    npcSectionRefs.clear();
    const npcXField = document.getElementById('npcX');
    const mapRow = npcXField && typeof npcXField.closest === 'function'
        ? npcXField.closest('.xy')
        : npcXField?.parentElement || null;
    const pickRow = document.getElementById('npcPick')?.parentElement;
    const portraitNav = document.getElementById('npcPrevP')?.parentElement;
    const sections = [
        {
            id: 'npcSectionGeneral',
            label: 'General',
            open: true,
            nodes: [
                getNpcFieldWrapper('npcId'),
                getNpcFieldWrapper('npcName'),
                getNpcFieldWrapper('npcTitle'),
                getNpcFieldWrapper('npcDesc'),
                getNpcFieldWrapper('npcColorOverride'),
                document.getElementById('npcColorWrap'),
                getNpcFieldWrapper('npcSymbol')
            ]
        },
        {
            id: 'npcSectionPlacement',
            label: 'Map & Placement',
            open: true,
            nodes: [
                getNpcFieldWrapper('npcMap'),
                mapRow,
                pickRow,
                getNpcFieldWrapper('npcPatrol'),
                document.getElementById('npcLoopPts'),
                document.getElementById('addLoopPt')
            ]
        },
        {
            id: 'npcSectionAppearance',
            label: 'Portrait & Visibility',
            nodes: [
                document.getElementById('npcPort'),
                portraitNav,
                getNpcFieldWrapper('npcPortraitLock'),
                getNpcFieldWrapper('npcHidden'),
                getNpcFieldWrapper('npcLocked'),
                getNpcFieldWrapper('npcInanimate'),
                document.getElementById('revealOpts')
            ]
        },
        {
            id: 'npcSectionInteraction',
            label: 'Dialogue & Quests',
            nodes: [
                getNpcFieldWrapper('npcDialog'),
                document.getElementById('npcDialogHint'),
                getNpcFieldWrapper('npcQuests'),
                document.getElementById('genQuestDialog'),
                document.getElementById('questTextWrap'),
                document.getElementById('treeWrap'),
                document.getElementById('npcTree'),
                document.getElementById('dialogPreview')
            ]
        },
        {
            id: 'npcSectionServices',
            label: 'Behavior & Services',
            nodes: [
                getNpcFieldWrapper('npcCombat'),
                document.getElementById('combatOpts'),
                getNpcFieldWrapper('npcShop'),
                document.getElementById('shopOpts'),
                getNpcFieldWrapper('npcTrainer'),
                document.getElementById('trainerOpts'),
                getNpcFieldWrapper('npcWorkbench')
            ]
        }
    ];
    const notice = document.getElementById('npcFormNotice');
    const canFragment = typeof document.createDocumentFragment === 'function';
    const frag = canFragment ? document.createDocumentFragment() : null;
    const sectionNodes = [];
    sections.forEach(section => {
        const detail = document.createElement('details');
        detail.className = 'npc-section';
        detail.id = section.id;
        if (section.open)
            detail.open = true;
        const summary = document.createElement('summary');
        summary.textContent = section.label;
        detail.appendChild(summary);
        const body = document.createElement('div');
        body.className = 'npc-section__body';
        section.nodes.forEach(node => {
            if (!node)
                return;
            body.appendChild(node);
        });
        detail.appendChild(body);
        if (frag)
            frag.appendChild(detail);
        else
            sectionNodes.push(detail);
        npcSectionRefs.set(section.id, detail);
    });
    if (notice && notice.parentNode) {
        if (frag && typeof notice.parentNode.insertBefore === 'function') {
            notice.parentNode.insertBefore(frag, notice.nextSibling);
        }
        else {
            let ref = notice.nextSibling;
            sectionNodes.forEach(node => {
                if (typeof notice.parentNode.insertBefore === 'function') {
                    notice.parentNode.insertBefore(node, ref);
                    ref = node.nextSibling;
                }
                else if (typeof notice.parentNode.appendChild === 'function') {
                    notice.parentNode.appendChild(node);
                }
            });
        }
    }
    else {
        if (frag && typeof editor.prepend === 'function') {
            editor.prepend(frag);
        }
        else if (frag && typeof editor.insertBefore === 'function') {
            editor.insertBefore(frag, editor.firstChild);
        }
        else {
            for (let i = sectionNodes.length - 1; i >= 0; i -= 1) {
                const node = sectionNodes[i];
                if (typeof editor.insertBefore === 'function') {
                    editor.insertBefore(node, editor.firstChild);
                }
                else if (typeof editor.prepend === 'function') {
                    editor.prepend(node);
                }
                else if (typeof editor.appendChild === 'function') {
                    editor.appendChild(node);
                }
            }
        }
    }
    updateNpcCoordinateState();
}
function updateNpcCoordinateState() {
    const idVal = document.getElementById('npcId')?.value.trim();
    const nameVal = document.getElementById('npcName')?.value.trim();
    const ready = !!(idVal && nameVal);
    const xInput = document.getElementById('npcX');
    const yInput = document.getElementById('npcY');
    const pickBtn = document.getElementById('npcPick');
    [xInput, yInput].forEach(el => {
        if (!el)
            return;
        el.disabled = !ready;
        if (!ready)
            el.setAttribute('aria-disabled', 'true');
        else if (typeof el.removeAttribute === 'function')
            el.removeAttribute('aria-disabled');
    });
    if (pickBtn) {
        pickBtn.disabled = !ready;
        pickBtn.title = ready
            ? 'Click on the map to choose location'
            : 'Fill in ID, Name, and Title before choosing a location';
    }
}
function cloneNpcData(npc) {
    try {
        return JSON.parse(JSON.stringify(npc || {}));
    }
    catch (err) {
        return npc ? { ...npc } : null;
    }
}
function validateNpcForm(options = {}) {
    const { silent = false } = options;
    const idEl = document.getElementById('npcId');
    const nameEl = document.getElementById('npcName');
    const titleEl = document.getElementById('npcTitle');
    const mapEl = document.getElementById('npcMap');
    const xEl = document.getElementById('npcX');
    const yEl = document.getElementById('npcY');
    if (!idEl || !nameEl || !mapEl || !xEl || !yEl)
        return { valid: false, errors: ['Missing form fields'] };
    const id = idEl.value.trim();
    const name = nameEl.value.trim();
    const map = mapEl.value.trim();
    const x = Number.parseInt(xEl.value, 10);
    const y = Number.parseInt(yEl.value, 10);
    const errors = [];
    const warnings = [];
    if (!id)
        errors.push('Enter an ID for the NPC.');
    const duplicate = id && moduleData.npcs.some((npc, idx) => idx !== editNPCIdx && npc?.id === id);
    if (duplicate)
        errors.push('That ID already exists. Choose another one.');
    if (!name)
        errors.push('Enter a name for the NPC.');
    if (!map)
        errors.push('Choose a map for this NPC.');
    const hasCoords = Number.isFinite(x) && Number.isFinite(y);
    if (!hasCoords)
        errors.push('Set map coordinates for the NPC.');
    setNpcFieldInvalid(idEl, !id || duplicate);
    setNpcFieldInvalid(nameEl, !name);
    setNpcFieldInvalid(titleEl, false);
    setNpcFieldInvalid(mapEl, !map);
    setNpcFieldInvalid(xEl, !hasCoords);
    setNpcFieldInvalid(yEl, !hasCoords);
    const saveBtn = document.getElementById('saveNPC');
    if (saveBtn)
        saveBtn.disabled = errors.length > 0;
    if (!silent) {
        if (errors.length) {
            setNpcNotice(errors.join(' '), 'error');
        }
        else if (warnings.length) {
            setNpcNotice(warnings.join(' '));
        }
        else if (npcDirty) {
            setNpcNotice('All required fields look good. Click Save NPC to apply your changes.');
        }
        else {
            setNpcNotice('Fill out ID, Name, and Title, then choose a map location before saving the NPC.');
        }
    }
    updateNpcCoordinateState();
    return { valid: errors.length === 0, errors, warnings };
}
function beginNpcCoordinateSelection() {
    clearPaletteSelection();
    const idEl = document.getElementById('npcId');
    const nameEl = document.getElementById('npcName');
    const id = idEl?.value.trim();
    const name = nameEl?.value.trim();
    const missing = [];
    if (!id)
        missing.push({ label: 'ID', el: idEl });
    if (!name)
        missing.push({ label: 'Name', el: nameEl });
    if (missing.length) {
        const labels = missing.map(m => m.label).join(', ');
        setNpcNotice(`Enter ${labels} before selecting a map location.`, 'error');
        validateNpcForm();
        const focusTarget = missing[0]?.el;
        if (focusTarget && typeof focusTarget.focus === 'function')
            focusTarget.focus();
        return;
    }
    npcMapMode = true;
    updateNpcMapBanner('Map selection active: click a tile to place your NPC.', true);
    coordTarget = { x: 'npcX', y: 'npcY', map: 'npcMap' };
    canvas?.classList?.add('map-select');
    setNpcCancelVisible(true);
    openNpcSection('npcSectionPlacement', { scroll: true });
    setMapActionBanner('NPC placement active: choose a walkable tile.', 'info');
    drawWorld();
}
function finishNpcCoordinateSelection(x, y) {
    if (!npcMapMode)
        return;
    npcMapMode = false;
    updateNpcMapBanner('', false);
    canvas?.classList?.remove('map-select');
    setNpcNotice(`Location set to (${x}, ${y}).`, 'success', true);
    const mapVal = document.getElementById('npcMap')?.value.trim() || currentMap || 'world';
    npcLastCoords = { map: mapVal, x, y };
    setMapActionBanner(`NPC location set to (${x}, ${y}).`, 'success', 3000);
    applyNPCChanges();
    setNpcCancelVisible(false);
    drawWorld();
}
function cancelNpcCoordinateSelection() {
    if (!npcMapMode)
        return;
    npcMapMode = false;
    coordTarget = null;
    updateNpcMapBanner('', false);
    canvas?.classList?.remove('map-select');
    setNpcNotice('Map selection cancelled.', 'error', true);
    validateNpcForm({ silent: false });
    setNpcCancelVisible(false);
    setMapActionBanner('NPC placement cancelled.', 'error', 2500);
    drawWorld();
}
function startNewNPC() {
    editNPCIdx = -1;
    document.getElementById('npcId').value = nextId('npc', moduleData.npcs);
    document.getElementById('npcName').value = '';
    document.getElementById('npcTitle').value = '';
    document.getElementById('npcDesc').value = '';
    document.getElementById('npcColor').value = '#9ef7a0';
    document.getElementById('npcColorOverride').checked = false;
    updateColorOverride();
    document.getElementById('npcSymbol').value = '!';
    populateMapDropdown(document.getElementById('npcMap'), '');
    document.getElementById('npcX').value = '';
    document.getElementById('npcY').value = '';
    document.getElementById('npcTileSprite').value = '';
    updateTileSpritePreview('npcTileSprite', 'npcTileSpritePreview');
    renderLoopFields([]);
    document.getElementById('npcPatrol').checked = false;
    updatePatrolSection();
    npcPortraitIndex = 0;
    npcPortraitPath = '';
    setNpcPortrait();
    document.getElementById('npcPortraitLock').checked = true;
    document.getElementById('npcHidden').checked = false;
    document.getElementById('npcLocked').checked = false;
    document.getElementById('npcInanimate').checked = false;
    document.getElementById('npcFlagType').value = 'visits';
    populateMapDropdown(document.getElementById('npcFlagMap'), 'world');
    document.getElementById('npcFlagX').value = 0;
    document.getElementById('npcFlagY').value = 0;
    document.getElementById('npcFlagName').value = '';
    document.getElementById('npcOp').value = '>=';
    document.getElementById('npcVal').value = 1;
    populateFlagList();
    updateFlagBuilder();
    document.getElementById('npcDialog').value = '';
    const qs = document.getElementById('npcQuests');
    if (qs)
        Array.from(qs.options || []).forEach((opt) => opt.selected = false);
    document.getElementById('npcAccept').value = 'Good luck.';
    document.getElementById('npcTurnin').value = 'Thanks for helping.';
    npcLastCoords = null;
    updateNpcCoordinateState();
    toggleQuestTextWrap();
    document.getElementById('npcTree').value = '';
    document.getElementById('npcHP').value = 5;
    document.getElementById('npcATK').value = 0;
    document.getElementById('npcDEF').value = 0;
    document.getElementById('npcLoot').value = '';
    document.getElementById('npcLootChance').value = '';
    document.getElementById('npcBoss').checked = false;
    document.getElementById('npcSpecialCue').value = '';
    document.getElementById('npcSpecialDmg').value = '';
    document.getElementById('npcSpecialDelay').value = '';
    document.getElementById('npcCombat').checked = false;
    document.getElementById('npcShop').checked = false;
    document.getElementById('npcWorkbench').checked = false;
    document.getElementById('shopMarkup').value = 2;
    document.getElementById('shopRefresh').value = 0;
    document.getElementById('npcTrainer').checked = false;
    document.getElementById('npcTrainerType').value = 'power';
    updateNPCOptSections();
    document.getElementById('delNPC').style.display = 'none';
    const saveBtn = document.getElementById('saveNPC');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Save NPC';
    }
    npcOriginal = null;
    npcDirty = false;
    updateNpcMapBanner('', false);
    setNpcNotice('Fill out ID, Name, and Title, then choose a map location before saving the NPC.');
    loadTreeEditor();
    toggleQuestDialogBtn();
    placingType = null;
    placingPos = null;
    selectedObj = null;
    drawWorld();
    showNPCEditor(true);
    setNpcCancelVisible(false);
    const npcIdEl = document.getElementById('npcId');
    if (npcIdEl && typeof npcIdEl.focus === 'function')
        npcIdEl.focus();
    validateNpcForm({ silent: true });
}
// Gather NPC form fields into an object
function ensureTrainerChoiceEffect(tree, trainerId) {
    if (!tree?.start)
        return;
    const start = tree.start;
    start.choices = Array.isArray(start.choices) ? start.choices : [];
    let choice = start.choices.find(c => c?.to === 'train');
    if (!choice) {
        choice = { label: '(Upgrade Skills)', to: 'train' };
        start.choices.unshift(choice);
    }
    const effects = Array.isArray(choice.effects) ? choice.effects.filter(e => e && typeof e === 'object') : [];
    const existing = effects.find(e => e.effect === 'showTrainer');
    if (existing) {
        existing.trainer = trainerId;
    }
    else {
        effects.push({ effect: 'showTrainer', trainer: trainerId });
    }
    choice.effects = effects;
}
function removeTrainerChoiceEffect(tree) {
    const choice = tree?.start?.choices?.find(c => c?.to === 'train');
    if (!choice || !Array.isArray(choice.effects))
        return;
    const remaining = choice.effects.filter(e => e && e.effect !== 'showTrainer');
    if (remaining.length)
        choice.effects = remaining;
    else
        delete choice.effects;
}
function collectNPCFromForm() {
    const id = document.getElementById('npcId').value.trim();
    const name = document.getElementById('npcName').value.trim();
    const title = document.getElementById('npcTitle').value.trim();
    const desc = document.getElementById('npcDesc').value.trim();
    const overrideColor = document.getElementById('npcColorOverride').checked;
    const color = document.getElementById('npcColor').value.trim() || '#fff';
    const symbol = document.getElementById('npcSymbol').value.trim().charAt(0) || '!';
    const map = document.getElementById('npcMap').value.trim() || 'world';
    const tileSprite = document.getElementById('npcTileSprite').value.trim();
    const rawX = document.getElementById('npcX').value;
    const rawY = document.getElementById('npcY').value;
    const parsedX = Number.parseInt(rawX, 10);
    const parsedY = Number.parseInt(rawY, 10);
    let x = Number.isFinite(parsedX) ? parsedX : undefined;
    let y = Number.isFinite(parsedY) ? parsedY : undefined;
    if (Number.isFinite(parsedX) && Number.isFinite(parsedY)) {
        npcLastCoords = { map, x: parsedX, y: parsedY };
    }
    else if (npcLastCoords && npcLastCoords.map === map) {
        ({ x, y } = npcLastCoords);
    }
    const dialogLines = document.getElementById('npcDialog').value.trim().split('\n');
    const questSel = document.getElementById('npcQuests');
    const questIds = questSel ? Array.from(questSel.selectedOptions || []).map(o => o.value.trim()).filter(Boolean) : [];
    const accept = document.getElementById('npcAccept').value.trim();
    const turnin = document.getElementById('npcTurnin').value.trim();
    const combat = document.getElementById('npcCombat').checked;
    const shop = document.getElementById('npcShop').checked;
    const workbench = document.getElementById('npcWorkbench').checked;
    const shopMarkup = parseInt(document.getElementById('shopMarkup').value, 10) || 2;
    const shopRefresh = parseInt(document.getElementById('shopRefresh').value, 10) || 0;
    const trainer = document.getElementById('npcTrainer').checked ?
        document.getElementById('npcTrainerType').value.trim() : '';
    const hidden = document.getElementById('npcHidden').checked;
    const inanimate = document.getElementById('npcInanimate').checked;
    const locked = document.getElementById('npcLocked').checked;
    const portraitLock = document.getElementById('npcPortraitLock').checked;
    const flag = getRevealFlag();
    const op = document.getElementById('npcOp').value;
    const val = parseInt(document.getElementById('npcVal').value, 10) || 0;
    let tree = null;
    const treeTxt = document.getElementById('npcTree').value.trim();
    if (treeTxt) {
        try {
            tree = JSON.parse(treeTxt);
        }
        catch (e) {
            tree = null;
        }
    }
    const firstQuest = questIds[0];
    const startDialog = dialogLines[0] || '';
    if (!tree || !Object.keys(tree).length) {
        tree = { start: { text: startDialog } };
    }
    if (locked && !tree.locked) {
        tree.locked = { text: '' };
    }
    if (!tree.start)
        tree.start = { text: startDialog };
    if (tree.start)
        tree.start.text = startDialog;
    if (tree.accept)
        tree.accept.text = accept || tree.accept.text;
    if (tree.do_turnin)
        tree.do_turnin.text = turnin || tree.do_turnin.text;
    if (firstQuest) {
        const questMeta = moduleData.quests.find(q => q.id === firstQuest);
        if (questMeta) {
            questMeta.dialog = questMeta.dialog || {};
            questMeta.dialog.offer = questMeta.dialog.offer || {};
            if (startDialog)
                questMeta.dialog.offer.text = startDialog;
            questMeta.dialog.accept = questMeta.dialog.accept || {};
            questMeta.dialog.accept.text = accept || questMeta.dialog.accept.text || 'Good luck.';
            questMeta.dialog.turnIn = questMeta.dialog.turnIn || {};
            questMeta.dialog.turnIn.text = turnin || questMeta.dialog.turnIn.text || 'Thanks for helping.';
        }
    }
    const ensureTrainerFn = typeof ensureTrainerChoiceEffect === 'function'
        ? ensureTrainerChoiceEffect
        : (treeArg, trainerId) => {
            if (!treeArg?.start)
                return;
            const start = treeArg.start;
            start.choices = Array.isArray(start.choices) ? start.choices : [];
            let choice = start.choices.find(c => c?.to === 'train');
            if (!choice) {
                choice = { label: '(Upgrade Skills)', to: 'train' };
                start.choices.unshift(choice);
            }
            const effects = Array.isArray(choice.effects) ? choice.effects.filter(e => e && typeof e === 'object') : [];
            const existing = effects.find(e => e.effect === 'showTrainer');
            if (existing)
                existing.trainer = trainerId;
            else
                effects.push({ effect: 'showTrainer', trainer: trainerId });
            choice.effects = effects;
        };
    const removeTrainerFn = typeof removeTrainerChoiceEffect === 'function'
        ? removeTrainerChoiceEffect
        : treeArg => {
            const choice = treeArg?.start?.choices?.find(c => c?.to === 'train');
            if (!choice || !Array.isArray(choice.effects))
                return;
            const remaining = choice.effects.filter(e => e && e.effect !== 'showTrainer');
            if (remaining.length)
                choice.effects = remaining;
            else
                delete choice.effects;
        };
    if (trainer)
        ensureTrainerFn(tree, trainer);
    else
        removeTrainerFn(tree);
    if (combat)
        applyCombatTree(tree);
    else
        removeCombatTree(tree);
    document.getElementById('npcTree').value = JSON.stringify(tree, null, 2);
    loadTreeEditor();
    if (!Number.isFinite(x))
        x = 0;
    if (!Number.isFinite(y))
        y = 0;
    const npc = { id, name, title, desc, symbol, map, x, y, tree };
    if (tileSprite)
        npc.tileSprite = tileSprite;
    if (overrideColor) {
        npc.color = color;
        npc.overrideColor = true;
    }
    if (questIds.length > 1)
        npc.quests = questIds;
    else if (firstQuest)
        npc.questId = firstQuest;
    if (dialogLines.length > 1)
        npc.dialogs = dialogLines;
    else if (dialogLines[0])
        npc.dialog = dialogLines[0];
    if (document.getElementById('npcPatrol').checked) {
        const pts = gatherLoopFields();
        if (pts.length >= 2)
            npc.loop = pts;
    }
    if (combat) {
        const HP = parseInt(document.getElementById('npcHP').value, 10) || 1;
        const ATK = parseInt(document.getElementById('npcATK').value, 10) || 0;
        const DEF = parseInt(document.getElementById('npcDEF').value, 10) || 0;
        const loot = document.getElementById('npcLoot').value.trim();
        const lootChanceEl = document.getElementById('npcLootChance');
        const lootChanceInput = typeof lootChanceEl?.value === 'string' ? lootChanceEl.value.trim() : '';
        const boss = document.getElementById('npcBoss').checked;
        const cue = document.getElementById('npcSpecialCue').value.trim();
        const dmg = parseInt(document.getElementById('npcSpecialDmg').value, 10);
        const delay = parseInt(document.getElementById('npcSpecialDelay').value, 10);
        npc.combat = { HP, ATK, DEF };
        if (loot)
            npc.combat.loot = loot;
        if (lootChanceInput !== '') {
            const lootChancePct = parseFloat(lootChanceInput);
            if (!Number.isNaN(lootChancePct) && lootChancePct >= 0 && lootChancePct <= 100) {
                npc.combat.lootChance = lootChancePct / 100;
            }
        }
        if (boss)
            npc.combat.boss = true;
        if (cue || !isNaN(dmg) || !isNaN(delay)) {
            npc.combat.special = {};
            if (cue)
                npc.combat.special.cue = cue;
            if (!isNaN(dmg))
                npc.combat.special.dmg = dmg;
            if (!isNaN(delay))
                npc.combat.special.delay = delay;
        }
    }
    if (shop)
        npc.shop = { markup: shopMarkup, refresh: shopRefresh, inv: [] };
    if (trainer)
        npc.trainer = trainer;
    if (workbench)
        npc.workbench = true;
    if (hidden && flag)
        npc.hidden = true, npc.reveal = { flag, op, value: val };
    if (inanimate)
        npc.inanimate = true;
    if (npcPortraitPath)
        npc.portraitSheet = npcPortraitPath;
    else if (npcPortraitIndex > 0)
        npc.portraitSheet = npcPortraits[npcPortraitIndex];
    if (!portraitLock)
        npc.portraitLock = false;
    if (locked)
        npc.locked = true;
    return npc;
}
// Add or update an NPC
function saveNPC() {
    const { valid, errors } = validateNpcForm();
    if (!valid) {
        setNpcNotice(errors.join(' '), 'error');
        return;
    }
    const wasNew = editNPCIdx < 0;
    const npc = collectNPCFromForm();
    if (editNPCIdx >= 0) {
        moduleData.npcs[editNPCIdx] = npc;
    }
    else {
        moduleData.npcs.push(npc);
        editNPCIdx = moduleData.npcs.length - 1;
    }
    npcOriginal = cloneNpcData(npc);
    npcDirty = false;
    renderNPCList();
    const delBtn = document.getElementById('delNPC');
    if (delBtn)
        delBtn.style.display = 'block';
    const saveBtn = document.getElementById('saveNPC');
    if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save NPC';
    }
    updateNpcMapBanner('', false);
    setNpcCancelVisible(false);
    canvas?.classList?.remove('map-select');
    setNpcNotice('NPC saved.', 'success', true);
    selectedObj = { type: 'npc', obj: npc };
    drawWorld();
    drawInterior();
    if (wasNew)
        resetListFilter('npcFilter');
}
function applyNPCChanges() {
    npcDirty = true;
    const npc = collectNPCFromForm();
    const result = validateNpcForm({ silent: false });
    if (result.valid) {
        selectedObj = { type: 'npc', obj: npc };
    }
    else if (editNPCIdx >= 0 && moduleData.npcs[editNPCIdx]) {
        selectedObj = { type: 'npc', obj: moduleData.npcs[editNPCIdx] };
    }
    else {
        selectedObj = null;
    }
    drawWorld();
    drawInterior();
}
function discardNPC() {
    if (editNPCIdx >= 0) {
        const idx = editNPCIdx;
        editNPC(idx);
        npcDirty = false;
        setNpcNotice('Changes discarded.', 'success', true);
        return;
    }
    npcOriginal = null;
    npcDirty = false;
    updateNpcMapBanner('', false);
    setNpcCancelVisible(false);
    showNPCEditor(false);
    const saveBtn = document.getElementById('saveNPC');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Save NPC';
    }
    document.getElementById('delNPC').style.display = 'none';
    setNpcNotice('', 'info');
    selectedObj = null;
    drawWorld();
    drawInterior();
    validateNpcForm({ silent: true });
}
function expandHex(hex) {
    if (typeof hex === 'string' && /^#[0-9a-fA-F]{3}$/.test(hex)) {
        return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    return hex;
}
function editNPC(i) {
    const n = moduleData.npcs[i];
    showMap(n.map);
    focusMap(n.x, n.y);
    editNPCIdx = i;
    document.getElementById('npcId').value = n.id;
    document.getElementById('npcName').value = n.name;
    document.getElementById('npcTitle').value = n.title || '';
    document.getElementById('npcDesc').value = n.desc || '';
    document.getElementById('npcColor').value = expandHex(n.color || '#9ef7a0');
    document.getElementById('npcColorOverride').checked = !!n.overrideColor;
    updateColorOverride();
    document.getElementById('npcSymbol').value = n.symbol || '!';
    populateMapDropdown(document.getElementById('npcMap'), n.map);
    document.getElementById('npcX').value = n.x;
    document.getElementById('npcY').value = n.y;
    document.getElementById('npcTileSprite').value = n.tileSprite || '';
    updateTileSpritePreview('npcTileSprite', 'npcTileSpritePreview');
    npcLastCoords = { map: n.map || 'world', x: n.x, y: n.y };
    renderLoopFields(n.loop || []);
    document.getElementById('npcPatrol').checked = Array.isArray(n.loop) && n.loop.length >= 2;
    updatePatrolSection();
    npcPortraitIndex = npcPortraits.indexOf(n.portraitSheet);
    if (npcPortraitIndex < 0) {
        npcPortraitIndex = 0;
        npcPortraitPath = n.portraitSheet || '';
    }
    else {
        npcPortraitPath = '';
    }
    setNpcPortrait();
    document.getElementById('npcPortraitLock').checked = n.portraitLock !== false;
    document.getElementById('npcHidden').checked = !!n.hidden;
    document.getElementById('npcLocked').checked = !!n.locked;
    document.getElementById('npcInanimate').checked = !!n.inanimate;
    let flagMap = 'world';
    if (n.reveal?.flag?.startsWith('visits@')) {
        document.getElementById('npcFlagType').value = 'visits';
        const parts = n.reveal.flag.split('@');
        flagMap = parts[1] || 'world';
        const [fx, fy] = (parts[2] || '0,0').split(',');
        document.getElementById('npcFlagX').value = fx;
        document.getElementById('npcFlagY').value = fy;
    }
    else {
        document.getElementById('npcFlagType').value = 'party';
        document.getElementById('npcFlagName').value = n.reveal?.flag || '';
    }
    populateMapDropdown(document.getElementById('npcFlagMap'), flagMap);
    document.getElementById('npcOp').value = n.reveal?.op || '>=';
    document.getElementById('npcVal').value = n.reveal?.value ?? 1;
    populateFlagList();
    updateFlagBuilder();
    document.getElementById('npcDialog').value = Array.isArray(n.dialogs) ? n.dialogs.join('\n') : (n.dialog || n.tree?.start?.text || '');
    const qs = document.getElementById('npcQuests');
    if (qs) {
        Array.from(qs.options || []).forEach((o) => {
            o.selected = Array.isArray(n.quests) ? n.quests.includes(o.value) : n.questId === o.value;
        });
    }
    document.getElementById('npcAccept').value = n.tree?.accept?.text || 'Good luck.';
    document.getElementById('npcTurnin').value = n.tree?.do_turnin?.text || 'Thanks for helping.';
    toggleQuestTextWrap();
    document.getElementById('npcTree').value = JSON.stringify(n.tree, null, 2);
    document.getElementById('npcHP').value = n.combat?.HP ?? 1;
    document.getElementById('npcATK').value = n.combat?.ATK ?? 0;
    document.getElementById('npcDEF').value = n.combat?.DEF ?? 0;
    document.getElementById('npcLoot').value = n.combat?.loot || '';
    const lootChanceEl = document.getElementById('npcLootChance');
    if (lootChanceEl) {
        lootChanceEl.value = n.combat?.lootChance != null ? String(Math.round(n.combat.lootChance * 100)) : '';
    }
    document.getElementById('npcBoss').checked = !!n.combat?.boss;
    document.getElementById('npcSpecialCue').value = n.combat?.special?.cue || '';
    document.getElementById('npcSpecialDmg').value = n.combat?.special?.dmg ?? '';
    document.getElementById('npcSpecialDelay').value = n.combat?.special?.delay ?? '';
    document.getElementById('npcCombat').checked = !!n.combat;
    document.getElementById('npcShop').checked = !!n.shop;
    document.getElementById('npcWorkbench').checked = !!n.workbench;
    document.getElementById('shopMarkup').value = n.shop ? n.shop.markup || 2 : 2;
    document.getElementById('shopRefresh').value = n.shop ? n.shop.refresh || 0 : 0;
    document.getElementById('npcTrainer').checked = !!n.trainer;
    document.getElementById('npcTrainerType').value = n.trainer || 'power';
    updateNPCOptSections();
    const saveBtn = document.getElementById('saveNPC');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Save NPC';
    }
    document.getElementById('delNPC').style.display = 'block';
    npcOriginal = cloneNpcData(n);
    npcDirty = false;
    updateNpcMapBanner('', false);
    setNpcCancelVisible(false);
    setNpcNotice('Make your changes, then click Save NPC.');
    loadTreeEditor();
    toggleQuestDialogBtn();
    showNPCEditor(true);
    selectedObj = { type: 'npc', obj: n };
    drawWorld();
    renderNPCList();
    validateNpcForm({ silent: true });
    updateNpcCoordinateState();
}
function renderNPCList() {
    const list = document.getElementById('npcList');
    if (moduleData.npcs.length === 0) {
        list.innerHTML = renderEmptyState('No NPCs created yet.');
    }
    else {
        const npcs = moduleData.npcs.map((n, i) => ({ n, i })).sort((a, b) => a.n.id.localeCompare(b.n.id));
        list.innerHTML = npcs.map(({ n, i }) => {
            const q = Array.isArray(n.quests) ? n.quests.join(',') : (n.questId || '');
            return `<button type="button" class="list-item-btn" data-idx="${i}">${n.id} @${n.map} (${n.x},${n.y})${q ? ` [${q}]` : ''}</button>`;
        }).join('');
        Array.from(list.children).forEach(btn => {
            const idx = parseInt(btn.dataset.idx, 10);
            btn.onclick = () => editNPC(idx);
            if (idx === editNPCIdx) {
                btn.style.outline = '1px solid #4f6b4f';
                btn.style.background = '#141a14';
                btn.scrollIntoView({ block: 'nearest' });
            }
        });
    }
    updateQuestOptions();
    refreshChoiceDropdowns();
    renderProblems();
}
function deleteNPC() {
    if (editNPCIdx < 0)
        return;
    confirmDialog('Delete this NPC?', () => {
        moduleData.npcs.splice(editNPCIdx, 1);
        editNPCIdx = -1;
        document.getElementById('delNPC').style.display = 'none';
        const saveBtn = document.getElementById('saveNPC');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Save NPC';
        }
        npcOriginal = null;
        npcDirty = false;
        updateNpcMapBanner('', false);
        setNpcCancelVisible(false);
        setNpcNotice('NPC deleted.', 'success', true);
        renderNPCList();
        selectedObj = null;
        drawWorld();
        document.getElementById('npcId').value = nextId('npc', moduleData.npcs);
        document.getElementById('npcDesc').value = '';
        loadTreeEditor();
        showNPCEditor(false);
        validateNpcForm({ silent: true });
    });
}
function closeNPCEditor() {
    editNPCIdx = -1;
    selectedObj = null;
    placingType = null;
    showNPCEditor(false);
    const saveBtn = document.getElementById('saveNPC');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Save NPC';
    }
    document.getElementById('delNPC').style.display = 'none';
    npcOriginal = null;
    npcDirty = false;
    updateNpcMapBanner('', false);
    setNpcCancelVisible(false);
    setNpcNotice('');
    validateNpcForm({ silent: true });
}
// --- Items ---
function showItemEditor(show) {
    document.getElementById('itemEditor').style.display = show ? 'block' : 'none';
}
function updateModsWrap() {
    const type = document.getElementById('itemType').value;
    const isEquip = ['weapon', 'armor', 'trinket'].includes(type);
    document.getElementById('modsWrap').style.display = isEquip ? 'block' : 'none';
    const equipWrap = document.getElementById('itemEquip').parentElement;
    if (equipWrap)
        equipWrap.style.display = isEquip ? 'block' : 'none';
    if (!isEquip)
        document.getElementById('itemEquip').value = '';
}
function updateUseWrap() {
    const type = document.getElementById('itemUseType').value;
    document.getElementById('itemUseAmtWrap').style.display = type === 'heal' ? 'block' : 'none';
    const boost = type === 'boost';
    document.getElementById('itemBoostStatWrap').style.display = boost ? 'block' : 'none';
    document.getElementById('itemBoostAmtWrap').style.display = boost ? 'block' : 'none';
    document.getElementById('itemBoostDurWrap').style.display = boost ? 'block' : 'none';
    document.getElementById('itemUseWrap').style.display = type ? 'block' : 'none';
}
function updateItemMapWrap() {
    const onMap = document.getElementById('itemOnMap').checked;
    const mapEl = document.getElementById('itemMap');
    populateMapDropdown(mapEl, mapEl.value || '');
    const mapWrap = document.getElementById('itemMapWrap');
    const xy = document.getElementById('itemXY');
    const pick = document.getElementById('itemPick');
    const remove = document.getElementById('itemRemove');
    if (mapWrap)
        mapWrap.style.display = onMap ? 'block' : 'none';
    if (xy)
        xy.style.display = onMap ? 'flex' : 'none';
    if (pick)
        pick.style.display = onMap ? 'inline-block' : 'none';
    if (remove)
        remove.style.display = onMap ? 'inline-block' : 'none';
    if (!onMap)
        mapEl.value = '';
}
function startNewItem() {
    editItemIdx = -1;
    document.getElementById('itemName').value = '';
    document.getElementById('itemId').value = '';
    document.getElementById('itemType').value = '';
    document.getElementById('itemDesc').value = '';
    document.getElementById('itemTags').value = '';
    document.getElementById('itemNarrativeId').value = '';
    document.getElementById('itemNarrativePrompt').value = '';
    document.getElementById('itemMap').value = '';
    document.getElementById('itemX').value = 0;
    document.getElementById('itemY').value = 0;
    document.getElementById('itemOnMap').checked = false;
    document.getElementById('itemTileSprite').value = '';
    updateTileSpritePreview('itemTileSprite', 'itemTileSpritePreview');
    resetPersonaFields();
    updateModsWrap();
    loadMods({});
    document.getElementById('itemValue').value = 0;
    document.getElementById('itemEquip').value = '';
    document.getElementById('itemUseType').value = '';
    document.getElementById('itemUseAmount').value = 0;
    document.getElementById('itemBoostStat').value = '';
    document.getElementById('itemBoostAmount').value = 0;
    document.getElementById('itemBoostDuration').value = 0;
    document.getElementById('itemUse').value = '';
    document.getElementById('itemFuel').value = 0;
    updateUseWrap();
    updateItemMapWrap();
    document.getElementById('addItem').textContent = 'Add Item';
    document.getElementById('cancelItem').style.display = 'none';
    document.getElementById('delItem').style.display = 'none';
    placingType = null;
    placingPos = null;
    selectedObj = null;
    drawWorld();
    showItemEditor(true);
    document.getElementById('itemName').focus();
}
function beginPlaceItem() {
    clearPaletteSelection();
    placingType = 'item';
    placingPos = null;
    placingCb = addItem;
    document.getElementById('addItem').style.display = 'none';
    document.getElementById('cancelItem').style.display = 'block';
    selectedObj = null;
    drawWorld();
}
function addItem() {
    const wasNew = editItemIdx < 0;
    const name = document.getElementById('itemName').value.trim();
    const id = document.getElementById('itemId').value.trim();
    const type = document.getElementById('itemType').value.trim();
    const desc = document.getElementById('itemDesc').value.trim();
    const tags = document.getElementById('itemTags').value.split(',').map(t => t.trim()).filter(Boolean);
    collectKnownTags(tags);
    updateTagOptions();
    const narrativeId = document.getElementById('itemNarrativeId').value.trim();
    const narrativePrompt = document.getElementById('itemNarrativePrompt').value.trim();
    const onMap = document.getElementById('itemOnMap').checked;
    const tileSprite = document.getElementById('itemTileSprite').value.trim();
    const map = onMap ? document.getElementById('itemMap').value.trim() : '';
    const x = parseInt(document.getElementById('itemX').value, 10) || 0;
    const y = parseInt(document.getElementById('itemY').value, 10) || 0;
    const isEquip = ['weapon', 'armor', 'trinket'].includes(type);
    const mods = collectMods();
    const value = parseInt(document.getElementById('itemValue').value, 10) || 0;
    const fuel = parseInt(document.getElementById('itemFuel').value, 10) || 0;
    let equip = null;
    if (isEquip) {
        try {
            equip = JSON.parse(document.getElementById('itemEquip').value || 'null');
        }
        catch (e) {
            equip = null;
        }
    }
    let use = null;
    const useType = document.getElementById('itemUseType').value;
    if (useType === 'heal') {
        const amt = parseInt(document.getElementById('itemUseAmount').value, 10) || 0;
        use = { type: 'heal', amount: amt };
    }
    else if (useType === 'boost') {
        const stat = document.getElementById('itemBoostStat').value.trim();
        const amt = parseInt(document.getElementById('itemBoostAmount').value, 10) || 0;
        const dur = parseInt(document.getElementById('itemBoostDuration').value, 10) || 0;
        use = { type: 'boost', stat, amount: amt, duration: dur };
    }
    else if (useType) {
        use = { type: useType };
    }
    const useText = document.getElementById('itemUse').value.trim();
    if (use && useText)
        use.text = useText;
    const item = { id, name, desc, type, tags, mods, value, use, equip };
    if (tileSprite)
        item.tileSprite = tileSprite;
    if (fuel)
        item.fuel = fuel;
    if (narrativeId || narrativePrompt) {
        item.narrative = {};
        if (narrativeId)
            item.narrative.id = narrativeId;
        if (narrativePrompt)
            item.narrative.prompt = narrativePrompt;
    }
    if (onMap && map) {
        item.map = map;
        item.x = x;
        item.y = y;
    }
    const personaId = document.getElementById('itemPersonaId').value.trim();
    const personaLabel = document.getElementById('itemPersonaLabel').value.trim();
    const personaPathInput = document.getElementById('itemPersonaPortraitPath').value.trim();
    if (personaId) {
        item.persona = personaId;
        const portrait = personaPathInput || (itemPersonaPortraitIndex > 0 ? personaPortraits[itemPersonaPortraitIndex] : '');
        const store = moduleData.personas || (moduleData.personas = {});
        const prevEntry = store[personaId];
        const entry = { ...(prevEntry && typeof prevEntry === 'object' ? prevEntry : {}) };
        if (personaLabel)
            entry.label = personaLabel;
        else
            delete entry.label;
        if (portrait)
            entry.portrait = portrait;
        else
            delete entry.portrait;
        if (Object.keys(entry).length)
            store[personaId] = entry;
        else
            delete store[personaId];
    }
    if (editItemIdx >= 0) {
        moduleData.items[editItemIdx] = item;
    }
    else {
        moduleData.items.push(item);
    }
    editItemIdx = -1;
    document.getElementById('addItem').textContent = 'Add Item';
    document.getElementById('addItem').style.display = 'block';
    document.getElementById('cancelItem').style.display = 'none';
    document.getElementById('delItem').style.display = 'none';
    loadMods({});
    document.getElementById('itemNarrativeId').value = '';
    document.getElementById('itemNarrativePrompt').value = '';
    renderItemList();
    selectedObj = null;
    drawWorld();
    drawInterior();
    showItemEditor(false);
    if (wasNew)
        resetListFilter('itemFilter');
}
function cancelItem() {
    placingType = null;
    placingPos = null;
    placingCb = null;
    document.getElementById('addItem').style.display = 'block';
    document.getElementById('cancelItem').style.display = 'none';
    drawWorld();
    drawInterior();
    updateCursor();
}
function removeItemFromWorld() {
    document.getElementById('itemOnMap').checked = false;
    document.getElementById('itemMap').value = '';
    if (editItemIdx >= 0) {
        const it = moduleData.items[editItemIdx];
        delete it.map;
        delete it.x;
        delete it.y;
        if (selectedObj && selectedObj.type === 'item' && selectedObj.obj === it) {
            selectedObj = null;
        }
        renderItemList();
        drawWorld();
    }
    updateItemMapWrap();
}
function editItem(i) {
    const it = moduleData.items[i];
    if (it.map) {
        showMap(it.map);
        focusMap(it.x, it.y);
    }
    editItemIdx = i;
    document.getElementById('itemName').value = it.name;
    document.getElementById('itemId').value = it.id;
    document.getElementById('itemType').value = it.type || '';
    document.getElementById('itemDesc').value = it.desc || '';
    collectKnownTags(it.tags || []);
    updateTagOptions();
    document.getElementById('itemTags').value = (it.tags || []).join(',');
    document.getElementById('itemNarrativeId').value = it.narrative ? it.narrative.id || '' : '';
    document.getElementById('itemNarrativePrompt').value = it.narrative ? it.narrative.prompt || '' : '';
    document.getElementById('itemMap').value = it.map || '';
    document.getElementById('itemX').value = it.x || 0;
    document.getElementById('itemY').value = it.y || 0;
    document.getElementById('itemOnMap').checked = !!it.map;
    document.getElementById('itemTileSprite').value = it.tileSprite || '';
    updateTileSpritePreview('itemTileSprite', 'itemTileSpritePreview');
    updateItemMapWrap();
    updateModsWrap();
    loadMods(it.mods);
    document.getElementById('itemValue').value = it.value || 0;
    document.getElementById('itemFuel').value = it.fuel || 0;
    document.getElementById('itemEquip').value = it.equip ? JSON.stringify(it.equip, null, 2) : '';
    if (it.use) {
        document.getElementById('itemUseType').value = it.use.type || '';
        if (it.use.type === 'heal') {
            document.getElementById('itemUseAmount').value = it.use.amount || 0;
            document.getElementById('itemBoostStat').value = '';
            document.getElementById('itemBoostAmount').value = 0;
            document.getElementById('itemBoostDuration').value = 0;
        }
        else if (it.use.type === 'boost') {
            document.getElementById('itemUseAmount').value = 0;
            document.getElementById('itemBoostStat').value = it.use.stat || '';
            document.getElementById('itemBoostAmount').value = it.use.amount || 0;
            document.getElementById('itemBoostDuration').value = it.use.duration || 0;
        }
        else {
            document.getElementById('itemUseAmount').value = 0;
            document.getElementById('itemBoostStat').value = '';
            document.getElementById('itemBoostAmount').value = 0;
            document.getElementById('itemBoostDuration').value = 0;
        }
        document.getElementById('itemUse').value = it.use.text || '';
    }
    else {
        document.getElementById('itemUseType').value = '';
        document.getElementById('itemUseAmount').value = 0;
        document.getElementById('itemBoostStat').value = '';
        document.getElementById('itemBoostAmount').value = 0;
        document.getElementById('itemBoostDuration').value = 0;
        document.getElementById('itemUse').value = '';
    }
    updateUseWrap();
    document.getElementById('itemPersonaId').value = it.persona || '';
    if (it.persona)
        loadPersonaFields(it.persona);
    else
        resetPersonaFields();
    updatePersonaSection();
    document.getElementById('addItem').textContent = 'Update Item';
    document.getElementById('delItem').style.display = 'block';
    document.getElementById('cancelItem').style.display = 'none';
    showItemEditor(true);
    selectedObj = { type: 'item', obj: it };
    drawWorld();
}
function renderItemList() {
    const list = document.getElementById('itemList');
    if (moduleData.items.length === 0) {
        list.innerHTML = renderEmptyState('No items created yet.');
    }
    else {
        const items = moduleData.items.map((it, i) => ({ it, i })).sort((a, b) => a.it.name.localeCompare(b.it.name));
        list.innerHTML = items.map(({ it, i }) => {
            const loc = it.map ? ` @${it.map} (${it.x},${it.y})` : '';
            return `<button type="button" class="list-item-btn" data-idx="${i}">${it.name}${loc}</button>`;
        }).join('');
        Array.from(list.children).forEach(btn => btn.onclick = () => editItem(parseInt(btn.dataset.idx, 10)));
    }
    refreshChoiceDropdowns();
    renderProblems();
}
function deleteItem() {
    if (editItemIdx < 0)
        return;
    confirmDialog('Delete this item?', () => {
        moduleData.items.splice(editItemIdx, 1);
        editItemIdx = -1;
        document.getElementById('addItem').textContent = 'Add Item';
        document.getElementById('delItem').style.display = 'none';
        loadMods({});
        renderItemList();
        selectedObj = null;
        drawWorld();
        showItemEditor(false);
    });
}
function closeItemEditor() {
    editItemIdx = -1;
    document.getElementById('addItem').textContent = 'Add Item';
    document.getElementById('cancelItem').style.display = 'none';
    document.getElementById('delItem').style.display = 'none';
    loadMods({});
    document.getElementById('itemNarrativeId').value = '';
    document.getElementById('itemNarrativePrompt').value = '';
    renderItemList();
    selectedObj = null;
    showItemEditor(false);
    drawWorld();
    drawInterior();
}
// --- Encounters ---
function clampChance(value) {
    const num = Number(value);
    if (!Number.isFinite(num))
        return 0;
    return Math.max(0, Math.min(num, 1));
}
function clampPercent(value) {
    const num = Number(value);
    if (!Number.isFinite(num))
        return 0;
    return Math.max(0, Math.min(num, 100));
}
function chanceToPercent(chance) {
    return clampChance(chance) * 100;
}
function formatPercentValue(chance) {
    if (chance == null)
        return '100';
    const pct = chanceToPercent(chance);
    const rounded = Math.round(pct * 10) / 10;
    return Number.isInteger(rounded) ? String(Math.round(rounded)) : rounded.toFixed(1);
}
function percentToChance(pct) {
    const chance = clampPercent(pct) / 100;
    return Math.round(chance * 1000) / 1000;
}
function normalizeLootEntry(entry) {
    if (!entry)
        return null;
    const rawItem = entry.item ?? entry.loot ?? entry.reward ?? entry.id;
    if (!rawItem)
        return null;
    const item = typeof rawItem === 'string' ? rawItem.trim() : rawItem;
    if (!item)
        return null;
    let chance = entry.chance;
    if (!Number.isFinite(chance))
        chance = entry.lootChance;
    if (!Number.isFinite(chance))
        chance = entry.probability;
    chance = clampChance(chance ?? 1);
    return { item, chance };
}
function sanitizeLootTable(table) {
    if (!Array.isArray(table))
        return [];
    return table.map(normalizeLootEntry).filter(entry => entry && entry.item && entry.chance > 0);
}
function lootTablesEqual(a, b) {
    const left = sanitizeLootTable(a);
    const right = sanitizeLootTable(b);
    if (left.length !== right.length)
        return false;
    return left.every((entry, idx) => {
        const other = right[idx];
        return !!other && entry.item === other.item && Math.abs(entry.chance - other.chance) < 0.001;
    });
}
function collectLootTable(container) {
    if (!container)
        return [];
    const rows = Array.from(container.querySelectorAll('.lootRow')).map((row) => {
        const itemSel = row.querySelector('.lootItemSelect');
        const chanceInput = row.querySelector('.lootChanceInput');
        const val = itemSel?.value ?? '';
        const item = typeof val === 'string' ? val.trim() : val;
        return { item, chance: percentToChance(chanceInput?.value ?? 0) };
    });
    return sanitizeLootTable(rows);
}
function addLootTableRow(container, entry = {}) {
    if (!container)
        return null;
    const row = document.createElement('div');
    row.className = 'lootRow';
    const itemSelect = document.createElement('select');
    itemSelect.className = 'lootItemSelect';
    populateItemDropdown(itemSelect, entry.item || '');
    const chanceInput = document.createElement('input');
    chanceInput.type = 'number';
    chanceInput.min = '0';
    chanceInput.max = '100';
    chanceInput.step = '0.1';
    chanceInput.className = 'lootChanceInput';
    chanceInput.value = formatPercentValue(entry.chance);
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn lootRemove';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
        row.remove();
    });
    row.appendChild(itemSelect);
    row.appendChild(chanceInput);
    row.appendChild(removeBtn);
    container.appendChild(row);
    refreshChoiceDropdowns();
    return row;
}
function setLootTable(container, table = []) {
    if (!container)
        return;
    container.innerHTML = '';
    sanitizeLootTable(table).forEach(entry => addLootTableRow(container, entry));
    if (!table || table.length === 0)
        refreshChoiceDropdowns();
}
function getTemplateLootTable(t) {
    if (!t || !t.combat)
        return [];
    if (Array.isArray(t.combat.lootTable))
        return sanitizeLootTable(t.combat.lootTable);
    if (t.combat.loot) {
        return sanitizeLootTable([{ item: t.combat.loot, chance: t.combat.lootChance ?? 1 }]);
    }
    return [];
}
function getEncounterLootTable(entry, template) {
    if (Array.isArray(entry?.lootTable))
        return sanitizeLootTable(entry.lootTable);
    if (entry?.loot !== undefined) {
        if (!entry.loot)
            return [];
        return sanitizeLootTable([{ item: entry.loot, chance: entry.lootChance ?? 1 }]);
    }
    return getTemplateLootTable(template);
}
function formatLootTableSummary(table) {
    const rows = sanitizeLootTable(table);
    if (!rows.length)
        return '';
    return rows.map(entry => {
        const pct = chanceToPercent(entry.chance);
        const rounded = Math.round(pct * 10) / 10;
        const label = Number.isInteger(rounded) ? Math.round(rounded) : rounded.toFixed(1);
        return `${label}% ${entry.item}`;
    }).join(', ');
}
function getEncounterLocationMode() {
    const mode = document.getElementById('encLocationMode')?.value;
    return mode === 'zone' ? 'zone' : 'distance';
}
function populateEncounterZoneDropdown(map, selectedTag = '') {
    const select = document.getElementById('encZone');
    if (!select)
        return false;
    const zones = (moduleData.zones || []).filter(z => (z.map || 'world') === map && typeof z.tag === 'string' && z.tag.trim());
    select.innerHTML = '';
    let found = false;
    if (zones.length) {
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select a zone';
        placeholder.disabled = true;
        select.appendChild(placeholder);
        zones.forEach(z => {
            const opt = document.createElement('option');
            opt.value = z.tag;
            opt.textContent = formatZoneSummary(z);
            if (selectedTag && selectedTag === z.tag) {
                opt.selected = true;
                found = true;
            }
            select.appendChild(opt);
        });
        if (!found) {
            placeholder.selected = !selectedTag;
        }
        else {
            placeholder.selected = false;
        }
        if (selectedTag && !found) {
            placeholder.selected = false;
            const fallback = document.createElement('option');
            fallback.value = selectedTag;
            fallback.textContent = `${selectedTag} (missing)`;
            fallback.selected = true;
            select.appendChild(fallback);
        }
        select.disabled = false;
        return true;
    }
    else {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'No tagged zones';
        opt.disabled = true;
        opt.selected = true;
        select.appendChild(opt);
        select.disabled = true;
        return false;
    }
}
function updateEncounterLocationMode() {
    const mode = getEncounterLocationMode();
    const minInput = document.getElementById('encMinDist');
    const maxInput = document.getElementById('encMaxDist');
    const minLabel = (minInput?.parentElement && minInput.parentElement.style) ? minInput.parentElement : minInput;
    const maxLabel = (maxInput?.parentElement && maxInput.parentElement.style) ? maxInput.parentElement : maxInput;
    const zoneWrap = document.getElementById('encZoneWrap');
    const mapSel = document.getElementById('encMap');
    const zoneSel = document.getElementById('encZone');
    let hasZones = false;
    if (mode === 'zone' && mapSel) {
        hasZones = populateEncounterZoneDropdown(mapSel.value || 'world', zoneSel ? zoneSel.value : '');
    }
    if (minLabel?.style)
        minLabel.style.display = mode === 'distance' ? '' : 'none';
    if (maxLabel?.style)
        maxLabel.style.display = mode === 'distance' ? '' : 'none';
    if (zoneWrap)
        zoneWrap.style.display = mode === 'zone' ? '' : 'none';
    if (zoneSel)
        zoneSel.disabled = mode === 'zone' ? !hasZones : true;
}
function formatEncounterLocation(entry) {
    if (!entry || typeof entry !== 'object')
        return '';
    const mode = entry.mode === 'zone' || (entry.zoneTag && !entry.mode) ? 'zone' : 'distance';
    if (mode === 'zone') {
        if (entry.zoneTag)
            return `Zone: ${entry.zoneTag}`;
        return 'Zone encounter';
    }
    const pieces = [];
    if (Number.isFinite(entry.minDist))
        pieces.push(`≥${entry.minDist}`);
    if (Number.isFinite(entry.maxDist))
        pieces.push(`≤${entry.maxDist}`);
    if (!pieces.length)
        return '';
    return `Dist ${pieces.join(' ')}`;
}
function showEncounterEditor(show) {
    document.getElementById('encounterEditor').style.display = show ? 'block' : 'none';
}
function startNewEncounter() {
    editEncounterIdx = -1;
    const mapSel = document.getElementById('encMap');
    populateMapDropdown(mapSel, 'world');
    populateEncounterZoneDropdown(mapSel.value || 'world', '');
    document.getElementById('encLocationMode').value = 'distance';
    document.getElementById('encMinDist').value = '';
    document.getElementById('encMaxDist').value = '';
    document.getElementById('encZone').value = '';
    const tmplSel = document.getElementById('encTemplate');
    populateTemplateDropdown(tmplSel, '');
    setLootTable(document.getElementById('encLootTable'), []);
    document.getElementById('addEncounter').textContent = 'Add Enemy';
    document.getElementById('delEncounter').style.display = 'none';
    showEncounterEditor(true);
    tmplSel.focus();
    updateEncounterLocationMode();
}
function collectEncounter() {
    const map = document.getElementById('encMap').value.trim() || 'world';
    const templateId = document.getElementById('encTemplate').value.trim();
    const mode = getEncounterLocationMode();
    const minDist = parseInt(document.getElementById('encMinDist').value, 10);
    const maxDist = parseInt(document.getElementById('encMaxDist').value, 10);
    const zoneTag = document.getElementById('encZone').value.trim();
    const t = globalThis.moduleData?.templates?.find(t => t.id === templateId);
    const entry = { map, templateId };
    if (mode === 'zone') {
        entry.mode = 'zone';
        if (zoneTag)
            entry.zoneTag = zoneTag;
    }
    else {
        entry.mode = 'distance';
        if (!Number.isNaN(minDist))
            entry.minDist = minDist;
        if (!Number.isNaN(maxDist))
            entry.maxDist = maxDist;
    }
    const lootTable = collectLootTable(document.getElementById('encLootTable'));
    const tmplTable = getTemplateLootTable(t);
    if (lootTable.length) {
        if (!lootTablesEqual(lootTable, tmplTable))
            entry.lootTable = lootTable;
    }
    else if (tmplTable.length) {
        entry.lootTable = [];
    }
    return entry;
}
function addEncounter() {
    const entry = collectEncounter();
    if (editEncounterIdx >= 0) {
        moduleData.encounters[editEncounterIdx] = entry;
    }
    else
        moduleData.encounters.push(entry);
    editEncounterIdx = -1;
    document.getElementById('addEncounter').textContent = 'Add Enemy';
    document.getElementById('delEncounter').style.display = 'none';
    renderEncounterList();
    showEncounterEditor(false);
}
function editEncounter(i) {
    const e = moduleData.encounters[i];
    editEncounterIdx = i;
    const mapSel = document.getElementById('encMap');
    populateMapDropdown(mapSel, e.map);
    populateEncounterZoneDropdown(mapSel.value || 'world', e.zoneTag || '');
    populateTemplateDropdown(document.getElementById('encTemplate'), e.templateId || '');
    const mode = e.mode === 'zone' || (e.zoneTag && !e.mode) ? 'zone' : 'distance';
    document.getElementById('encLocationMode').value = mode;
    document.getElementById('encMinDist').value = Number.isFinite(e.minDist) ? e.minDist : '';
    document.getElementById('encMaxDist').value = Number.isFinite(e.maxDist) ? e.maxDist : '';
    document.getElementById('encZone').value = e.zoneTag || '';
    const t = moduleData.templates.find(t => t.id === e.templateId);
    setLootTable(document.getElementById('encLootTable'), getEncounterLootTable(e, t));
    document.getElementById('addEncounter').textContent = 'Update Enemy';
    document.getElementById('delEncounter').style.display = 'block';
    showEncounterEditor(true);
    updateEncounterLocationMode();
}
function renderEncounterList() {
    const list = document.getElementById('encounterList');
    if (moduleData.encounters.length === 0) {
        list.innerHTML = renderEmptyState('No enemies created yet.');
    }
    else {
        list.innerHTML = moduleData.encounters.map((e, i) => {
            const t = moduleData.templates.find(t => t.id === e.templateId);
            const name = t ? t.name : e.templateId;
            const summary = formatLootTableSummary(getEncounterLootTable(e, t));
            const lootStr = summary ? ` - ${summary}` : '';
            const location = formatEncounterLocation(e);
            const locStr = location ? ` [${location}]` : '';
            return `<button type="button" class="list-item-btn" data-idx="${i}">${e.map}: ${name}${locStr}${lootStr}</button>`;
        }).join('');
        Array.from(list.children).forEach(btn => btn.onclick = () => editEncounter(parseInt(btn.dataset.idx, 10)));
    }
}
function deleteEncounter() {
    if (editEncounterIdx < 0)
        return;
    confirmDialog('Delete this enemy?', () => {
        moduleData.encounters.splice(editEncounterIdx, 1);
        editEncounterIdx = -1;
        document.getElementById('addEncounter').textContent = 'Add Enemy';
        document.getElementById('delEncounter').style.display = 'none';
        renderEncounterList();
        showEncounterEditor(false);
    });
}
// --- NPC Templates ---
function showTemplateEditor(show) {
    document.getElementById('templateEditor').style.display = show ? 'block' : 'none';
}
function toggleTemplateScrapFields() {
    const show = document.getElementById('templateDropScrap').checked;
    document.querySelectorAll('.templateScrapField').forEach(el => {
        el.style.display = show ? 'inline-block' : 'none';
    });
}
function startNewTemplate() {
    editTemplateIdx = -1;
    document.getElementById('templateId').value = nextId('template', moduleData.templates);
    document.getElementById('templateName').value = '';
    document.getElementById('templateDesc').value = '';
    document.getElementById('templateColor').value = '#9ef7a0';
    document.getElementById('templatePortrait').value = '';
    document.getElementById('templateHP').value = 5;
    document.getElementById('templateATK').value = 1;
    document.getElementById('templateDEF').value = 0;
    document.getElementById('templateChallenge').value = '';
    document.getElementById('templateSpecialCue').value = '';
    document.getElementById('templateSpecialDmg').value = '';
    setLootTable(document.getElementById('templateLootTable'), []);
    document.getElementById('templateDropScrap').checked = false;
    document.getElementById('templateScrapChance').value = 100;
    document.getElementById('templateScrapMin').value = 1;
    document.getElementById('templateScrapMax').value = 1;
    document.getElementById('templateRequires').value = '';
    document.getElementById('addTemplate').textContent = 'Add Template';
    document.getElementById('delTemplate').style.display = 'none';
    toggleTemplateScrapFields();
    showTemplateEditor(true);
}
function collectTemplate() {
    const id = document.getElementById('templateId').value.trim();
    const name = document.getElementById('templateName').value.trim();
    const desc = document.getElementById('templateDesc').value.trim();
    const color = document.getElementById('templateColor').value.trim();
    const portraitSheet = document.getElementById('templatePortrait').value.trim();
    const HP = parseInt(document.getElementById('templateHP').value, 10) || 1;
    const ATK = parseInt(document.getElementById('templateATK').value, 10) || 1;
    const DEF = parseInt(document.getElementById('templateDEF').value, 10) || 0;
    const challenge = parseInt(document.getElementById('templateChallenge').value, 10);
    const specialCue = document.getElementById('templateSpecialCue').value.trim();
    const specialDmg = parseInt(document.getElementById('templateSpecialDmg').value, 10) || 0;
    const dropScrap = document.getElementById('templateDropScrap').checked;
    const scrapChancePct = parseFloat(document.getElementById('templateScrapChance').value);
    const scrapMin = parseInt(document.getElementById('templateScrapMin').value, 10) || 0;
    const scrapMax = parseInt(document.getElementById('templateScrapMax').value, 10) || scrapMin;
    const requires = document.getElementById('templateRequires').value.trim();
    const combat = { HP, ATK, DEF };
    if (challenge > 0)
        combat.challenge = Math.min(10, challenge); // higher values improve loot caches
    const lootTable = collectLootTable(document.getElementById('templateLootTable'));
    if (lootTable.length)
        combat.lootTable = lootTable;
    if (dropScrap) {
        combat.scrap = { min: scrapMin, max: scrapMax };
        if (!isNaN(scrapChancePct) && scrapChancePct >= 0 && scrapChancePct < 100) {
            combat.scrap.chance = scrapChancePct / 100;
        }
    }
    if (requires)
        combat.requires = requires;
    if (specialCue || specialDmg) {
        combat.special = {};
        if (specialCue)
            combat.special.cue = specialCue;
        if (specialDmg)
            combat.special.dmg = specialDmg;
    }
    return { id, name, desc, color, portraitSheet, combat };
}
function addTemplate() {
    const entry = collectTemplate();
    if (editTemplateIdx >= 0) {
        moduleData.templates[editTemplateIdx] = entry;
    }
    else
        moduleData.templates.push(entry);
    editTemplateIdx = -1;
    document.getElementById('addTemplate').textContent = 'Add Template';
    document.getElementById('delTemplate').style.display = 'none';
    renderTemplateList();
    showTemplateEditor(false);
}
function editTemplate(i) {
    const t = moduleData.templates[i];
    editTemplateIdx = i;
    document.getElementById('templateId').value = t.id;
    document.getElementById('templateName').value = t.name;
    document.getElementById('templateDesc').value = t.desc;
    document.getElementById('templateColor').value = expandHex(t.color || '#ffffff');
    document.getElementById('templatePortrait').value = t.portraitSheet || '';
    document.getElementById('templateHP').value = t.combat?.HP || 1;
    document.getElementById('templateATK').value = t.combat?.ATK || 1;
    document.getElementById('templateDEF').value = t.combat?.DEF || 0;
    document.getElementById('templateChallenge').value = t.combat?.challenge || '';
    document.getElementById('templateSpecialCue').value = t.combat?.special?.cue || '';
    document.getElementById('templateSpecialDmg').value = t.combat?.special?.dmg || '';
    setLootTable(document.getElementById('templateLootTable'), getTemplateLootTable(t));
    const scrap = t.combat?.scrap;
    document.getElementById('templateDropScrap').checked = !!scrap;
    document.getElementById('templateScrapChance').value = scrap?.chance != null ? Math.round(scrap.chance * 100) : 100;
    document.getElementById('templateScrapMin').value = scrap?.min ?? 1;
    document.getElementById('templateScrapMax').value = scrap?.max ?? 1;
    document.getElementById('templateRequires').value = t.combat?.requires || '';
    document.getElementById('addTemplate').textContent = 'Update Template';
    document.getElementById('delTemplate').style.display = 'block';
    toggleTemplateScrapFields();
    showTemplateEditor(true);
}
function renderTemplateList() {
    const list = document.getElementById('templateList');
    if (moduleData.templates.length === 0) {
        list.innerHTML = renderEmptyState('No templates created yet.');
    }
    else {
        list.innerHTML = moduleData.templates.map((t, i) => `<button type="button" class="list-item-btn" data-idx="${i}">${t.id}</button>`).join('');
        Array.from(list.children).forEach(btn => btn.onclick = () => editTemplate(parseInt(btn.dataset.idx, 10)));
    }
    refreshChoiceDropdowns();
}
function deleteTemplate() {
    if (editTemplateIdx < 0)
        return;
    confirmDialog('Delete this template?', () => {
        moduleData.templates.splice(editTemplateIdx, 1);
        editTemplateIdx = -1;
        document.getElementById('addTemplate').textContent = 'Add Template';
        document.getElementById('delTemplate').style.display = 'none';
        renderTemplateList();
        showTemplateEditor(false);
    });
}
// --- Tile Events ---
function showEventEditor(show) {
    document.getElementById('eventEditor').style.display = show ? 'block' : 'none';
}
function updateEventEffectFields() {
    const eff = document.getElementById('eventEffect').value;
    document.getElementById('eventMsgWrap').style.display = (eff === 'toast' || eff === 'log') ? 'block' : 'none';
    document.getElementById('eventFlagWrap').style.display = eff === 'addFlag' ? 'block' : 'none';
    document.getElementById('eventStatWrap').style.display = eff === 'modStat' ? 'block' : 'none';
}
function startNewEvent() {
    editEventIdx = -1;
    populateMapDropdown(document.getElementById('eventMap'), 'world');
    document.getElementById('eventX').value = 0;
    document.getElementById('eventY').value = 0;
    document.getElementById('eventEffect').value = 'toast';
    document.getElementById('eventMsg').value = '';
    document.getElementById('eventFlag').value = '';
    document.getElementById('eventStat').value = STAT_OPTS[0];
    document.getElementById('eventDelta').value = 0;
    document.getElementById('eventDuration').value = 0;
    updateEventEffectFields();
    document.getElementById('addEvent').textContent = 'Add Event';
    document.getElementById('delEvent').style.display = 'none';
    showEventEditor(true);
    document.getElementById('eventMap').focus();
}
function collectEvent() {
    const map = document.getElementById('eventMap').value.trim() || 'world';
    const x = parseInt(document.getElementById('eventX').value, 10) || 0;
    const y = parseInt(document.getElementById('eventY').value, 10) || 0;
    const eff = document.getElementById('eventEffect').value;
    const ev = { when: 'enter', effect: eff };
    if (eff === 'toast' || eff === 'log')
        ev.msg = document.getElementById('eventMsg').value;
    if (eff === 'addFlag')
        ev.flag = document.getElementById('eventFlag').value;
    if (eff === 'modStat') {
        ev.stat = document.getElementById('eventStat').value;
        ev.delta = parseInt(document.getElementById('eventDelta').value, 10) || 0;
        ev.duration = parseInt(document.getElementById('eventDuration').value, 10) || 0;
    }
    return { map, x, y, events: [ev] };
}
function addEvent() {
    const entry = collectEvent();
    if (editEventIdx >= 0) {
        moduleData.events[editEventIdx] = entry;
    }
    else {
        moduleData.events.push(entry);
    }
    editEventIdx = -1;
    document.getElementById('addEvent').textContent = 'Add Event';
    document.getElementById('delEvent').style.display = 'none';
    renderEventList();
    selectedObj = null;
    drawWorld();
    showEventEditor(false);
}
function editEvent(i) {
    const e = moduleData.events[i];
    editEventIdx = i;
    populateMapDropdown(document.getElementById('eventMap'), e.map);
    document.getElementById('eventX').value = e.x;
    document.getElementById('eventY').value = e.y;
    const ev = e.events[0] || { effect: 'toast' };
    document.getElementById('eventEffect').value = ev.effect;
    document.getElementById('eventMsg').value = ev.msg || '';
    document.getElementById('eventFlag').value = ev.flag || '';
    document.getElementById('eventStat').value = ev.stat || STAT_OPTS[0];
    document.getElementById('eventDelta').value = ev.delta || 0;
    document.getElementById('eventDuration').value = ev.duration || 0;
    updateEventEffectFields();
    document.getElementById('addEvent').textContent = 'Update Event';
    document.getElementById('delEvent').style.display = 'block';
    showEventEditor(true);
    selectedObj = { type: 'event', obj: e };
    drawWorld();
}
function renderEventList() {
    const list = document.getElementById('eventList');
    if (moduleData.events.length === 0) {
        list.innerHTML = renderEmptyState('No events created yet.');
    }
    else {
        list.innerHTML = moduleData.events.map((e, i) => {
            const eff = e.events[0]?.effect;
            return `<button type="button" class="list-item-btn" data-idx="${i}">${e.map} @(${e.x},${e.y}) - ${eff}</button>`;
        }).join('');
        Array.from(list.children).forEach(btn => btn.onclick = () => editEvent(parseInt(btn.dataset.idx, 10)));
    }
    populateFlagList();
}
function deleteEvent() {
    if (editEventIdx < 0)
        return;
    confirmDialog('Delete this event?', () => {
        moduleData.events.splice(editEventIdx, 1);
        editEventIdx = -1;
        document.getElementById('addEvent').textContent = 'Add Event';
        document.getElementById('delEvent').style.display = 'none';
        renderEventList();
        selectedObj = null;
        drawWorld();
        showEventEditor(false);
    });
}
// --- Arenas ---
function arenaList(create = false) {
    if (!moduleData.behaviors) {
        if (!create)
            return null;
        moduleData.behaviors = {};
    }
    let list = moduleData.behaviors.arenas;
    if (!Array.isArray(list)) {
        if (!create)
            return null;
        list = moduleData.behaviors.arenas = [];
    }
    return list;
}
function ensureBehaviorKey() {
    if (Array.isArray(moduleData._origKeys) && !moduleData._origKeys.includes('behaviors')) {
        moduleData._origKeys.push('behaviors');
    }
}
function cleanupBehaviors() {
    if (!moduleData.behaviors)
        return;
    if (Array.isArray(moduleData.behaviors.arenas) && moduleData.behaviors.arenas.length === 0) {
        delete moduleData.behaviors.arenas;
    }
    if (moduleData.behaviors && Object.keys(moduleData.behaviors).length === 0) {
        delete moduleData.behaviors;
        if (Array.isArray(moduleData._origKeys)) {
            const idx = moduleData._origKeys.indexOf('behaviors');
            if (idx >= 0)
                moduleData._origKeys.splice(idx, 1);
        }
    }
}
function showArenaEditor(show) {
    const editor = document.getElementById('arenaEditor');
    if (editor)
        editor.style.display = show ? 'block' : 'none';
}
function updateArenaWaveHeaders() {
    const waves = document.querySelectorAll('#arenaWaveContainer .arenaWave');
    waves.forEach((div, idx) => {
        const title = div.querySelector('.arenaWaveTitle');
        if (title)
            title.textContent = `Wave ${idx + 1}`;
    });
}
function addArenaWaveBlock(entry = {}) {
    const container = document.getElementById('arenaWaveContainer');
    if (!container)
        return null;
    const div = document.createElement('div');
    div.className = 'arenaWave';
    div.innerHTML = `
    <div class="arenaWaveHeader">
      <span class="arenaWaveTitle"></span>
      <button class="btn arenaWaveRemove" type="button">Remove</button>
    </div>
    <label>Template<select class="arenaWaveTemplate"></select></label>
    <div class="xy">
      <label>Count<input type="number" class="arenaWaveCount" min="1" /></label>
      <label>Challenge<input type="number" class="arenaWaveChallenge" min="0" /></label>
    </div>
    <label>Announce<textarea rows="2" class="arenaWaveAnnounce"></textarea></label>
    <label>Toast<input class="arenaWaveToast" /></label>
    <label>Prompt<input class="arenaWavePrompt" /></label>
    <details class="arenaWaveVuln">
      <summary>Vulnerability</summary>
      <label>Items<input class="arenaWaveItems" placeholder="item ids, comma separated" /></label>
      <div class="xy">
        <label>Match DEF<input type="number" class="arenaWaveMatchDef" /></label>
        <label>Miss DEF<input type="number" class="arenaWaveMissDef" /></label>
      </div>
      <div class="xy">
        <label>Match DEF Mod<input type="number" class="arenaWaveDefMatch" /></label>
        <label>Miss DEF Mod<input type="number" class="arenaWaveDefMiss" /></label>
      </div>
      <label>Success Log<textarea rows="2" class="arenaWaveSuccess"></textarea></label>
      <label>Fail Log<textarea rows="2" class="arenaWaveFail"></textarea></label>
    </details>
  `;
    container.appendChild(div);
    const remove = div.querySelector('.arenaWaveRemove');
    if (remove) {
        remove.addEventListener('click', () => {
            div.remove();
            updateArenaWaveHeaders();
        });
    }
    const templateSel = div.querySelector('.arenaWaveTemplate');
    if (templateSel)
        populateTemplateDropdown(templateSel, entry.templateId || '');
    const countInput = div.querySelector('.arenaWaveCount');
    if (countInput)
        countInput.value = entry.count ?? '';
    const challengeInput = div.querySelector('.arenaWaveChallenge');
    if (challengeInput)
        challengeInput.value = entry.bankChallenge ?? '';
    const announceInput = div.querySelector('.arenaWaveAnnounce');
    if (announceInput)
        announceInput.value = entry.announce || '';
    const toastInput = div.querySelector('.arenaWaveToast');
    if (toastInput)
        toastInput.value = entry.toast || '';
    const promptInput = div.querySelector('.arenaWavePrompt');
    if (promptInput)
        promptInput.value = entry.prompt || '';
    const vuln = entry.vulnerability || {};
    const itemsInput = div.querySelector('.arenaWaveItems');
    if (itemsInput) {
        if (Array.isArray(vuln.items))
            itemsInput.value = vuln.items.join(', ');
        else
            itemsInput.value = vuln.items || '';
    }
    const matchDefInput = div.querySelector('.arenaWaveMatchDef');
    if (matchDefInput)
        matchDefInput.value = vuln.matchDef ?? '';
    const missDefInput = div.querySelector('.arenaWaveMissDef');
    if (missDefInput)
        missDefInput.value = vuln.missDef ?? '';
    const defMatchInput = div.querySelector('.arenaWaveDefMatch');
    if (defMatchInput)
        defMatchInput.value = vuln.defMod?.match ?? '';
    const defMissInput = div.querySelector('.arenaWaveDefMiss');
    if (defMissInput)
        defMissInput.value = vuln.defMod?.miss ?? '';
    const successInput = div.querySelector('.arenaWaveSuccess');
    if (successInput)
        successInput.value = vuln.successLog || '';
    const failInput = div.querySelector('.arenaWaveFail');
    if (failInput)
        failInput.value = vuln.failLog || '';
    if (div.querySelector('.arenaWaveVuln')) {
        const details = div.querySelector('.arenaWaveVuln');
        if (vuln.items || vuln.matchDef != null || vuln.missDef != null || vuln.defMod || vuln.successLog || vuln.failLog) {
            details.open = true;
        }
    }
    updateArenaWaveHeaders();
    refreshChoiceDropdowns();
    return div;
}
function setArenaWaves(list = []) {
    const container = document.getElementById('arenaWaveContainer');
    if (!container)
        return;
    container.innerHTML = '';
    if (Array.isArray(list) && list.length) {
        list.forEach(entry => addArenaWaveBlock(entry));
    }
    else {
        addArenaWaveBlock({});
    }
}
function startNewArena() {
    editArenaIdx = -1;
    const mapSel = document.getElementById('arenaMap');
    if (mapSel)
        populateMapDropdown(mapSel, 'world');
    document.getElementById('arenaBankId').value = '';
    document.getElementById('arenaDelay').value = '';
    document.getElementById('arenaResetLog').value = '';
    document.getElementById('arenaRewardLog').value = '';
    document.getElementById('arenaRewardToast').value = '';
    setArenaWaves([]);
    document.getElementById('addArena').textContent = 'Add Arena';
    document.getElementById('delArena').style.display = 'none';
    document.getElementById('cancelArena').style.display = 'inline-block';
    showArenaEditor(true);
    if (mapSel)
        mapSel.focus();
    if (window.showEditorTab)
        window.showEditorTab('arenas');
}
function collectArena() {
    const mapSel = document.getElementById('arenaMap');
    const map = mapSel?.value.trim() || 'world';
    const bankId = document.getElementById('arenaBankId').value.trim();
    const delayRaw = document.getElementById('arenaDelay').value.trim();
    const resetLog = document.getElementById('arenaResetLog').value.trim();
    const rewardLog = document.getElementById('arenaRewardLog').value.trim();
    const rewardToast = document.getElementById('arenaRewardToast').value.trim();
    const waves = [];
    document.querySelectorAll('#arenaWaveContainer .arenaWave').forEach(div => {
        const templateSel = div.querySelector('.arenaWaveTemplate');
        const templateId = templateSel?.value.trim();
        if (!templateId)
            return;
        const wave = { templateId };
        const countVal = parseInt(div.querySelector('.arenaWaveCount')?.value, 10);
        if (Number.isFinite(countVal) && countVal > 0)
            wave.count = countVal;
        const challengeVal = parseInt(div.querySelector('.arenaWaveChallenge')?.value, 10);
        if (Number.isFinite(challengeVal))
            wave.bankChallenge = challengeVal;
        const announce = div.querySelector('.arenaWaveAnnounce')?.value.trim();
        if (announce)
            wave.announce = announce;
        const toast = div.querySelector('.arenaWaveToast')?.value.trim();
        if (toast)
            wave.toast = toast;
        const prompt = div.querySelector('.arenaWavePrompt')?.value.trim();
        if (prompt)
            wave.prompt = prompt;
        const vuln = {};
        const itemsStr = div.querySelector('.arenaWaveItems')?.value.trim() || '';
        if (itemsStr) {
            const parts = itemsStr.split(',').map(str => str.trim()).filter(Boolean);
            if (parts.length === 1)
                vuln.items = parts[0];
            else if (parts.length > 1)
                vuln.items = parts;
        }
        const matchDef = parseFloat(div.querySelector('.arenaWaveMatchDef')?.value);
        if (Number.isFinite(matchDef))
            vuln.matchDef = matchDef;
        const missDef = parseFloat(div.querySelector('.arenaWaveMissDef')?.value);
        if (Number.isFinite(missDef))
            vuln.missDef = missDef;
        const defMatch = parseFloat(div.querySelector('.arenaWaveDefMatch')?.value);
        const defMiss = parseFloat(div.querySelector('.arenaWaveDefMiss')?.value);
        if (Number.isFinite(defMatch) || Number.isFinite(defMiss)) {
            const mod = {};
            if (Number.isFinite(defMatch))
                mod.match = defMatch;
            if (Number.isFinite(defMiss))
                mod.miss = defMiss;
            if (Object.keys(mod).length)
                vuln.defMod = mod;
        }
        const success = div.querySelector('.arenaWaveSuccess')?.value.trim();
        if (success)
            vuln.successLog = success;
        const fail = div.querySelector('.arenaWaveFail')?.value.trim();
        if (fail)
            vuln.failLog = fail;
        if (Object.keys(vuln).length)
            wave.vulnerability = vuln;
        waves.push(wave);
    });
    if (!waves.length) {
        alert('Add at least one wave with an enemy template.');
        return null;
    }
    const arena = { map, waves };
    if (bankId)
        arena.bankId = bankId;
    const delay = parseInt(delayRaw, 10);
    if (Number.isFinite(delay) && delay >= 0)
        arena.entranceDelay = delay;
    if (resetLog)
        arena.resetLog = resetLog;
    if (rewardLog || rewardToast) {
        arena.reward = {};
        if (rewardLog)
            arena.reward.log = rewardLog;
        if (rewardToast)
            arena.reward.toast = rewardToast;
    }
    return arena;
}
function addArena() {
    const arena = collectArena();
    if (!arena)
        return;
    const list = arenaList(true);
    if (!list)
        return;
    if (editArenaIdx >= 0)
        list[editArenaIdx] = arena;
    else
        list.push(arena);
    ensureBehaviorKey();
    editArenaIdx = -1;
    document.getElementById('addArena').textContent = 'Add Arena';
    document.getElementById('cancelArena').style.display = 'none';
    document.getElementById('delArena').style.display = 'none';
    renderArenaList();
    showArenaEditor(false);
}
function editArena(idx) {
    const list = Array.isArray(moduleData.behaviors?.arenas) ? moduleData.behaviors.arenas : [];
    const arena = list[idx];
    if (!arena)
        return;
    editArenaIdx = idx;
    populateMapDropdown(document.getElementById('arenaMap'), arena.map || 'world');
    document.getElementById('arenaBankId').value = arena.bankId || '';
    document.getElementById('arenaDelay').value = arena.entranceDelay ?? '';
    document.getElementById('arenaResetLog').value = arena.resetLog || '';
    document.getElementById('arenaRewardLog').value = arena.reward?.log || '';
    document.getElementById('arenaRewardToast').value = arena.reward?.toast || '';
    setArenaWaves(arena.waves || []);
    document.getElementById('addArena').textContent = 'Update Arena';
    document.getElementById('cancelArena').style.display = 'inline-block';
    document.getElementById('delArena').style.display = 'inline-block';
    showArenaEditor(true);
    if (window.showEditorTab)
        window.showEditorTab('arenas');
}
function deleteArena() {
    if (editArenaIdx < 0)
        return;
    confirmDialog('Delete this arena?', () => {
        const list = arenaList();
        if (!list)
            return;
        list.splice(editArenaIdx, 1);
        editArenaIdx = -1;
        document.getElementById('addArena').textContent = 'Add Arena';
        document.getElementById('cancelArena').style.display = 'none';
        document.getElementById('delArena').style.display = 'none';
        renderArenaList();
        showArenaEditor(false);
        cleanupBehaviors();
    });
}
function cancelArena() {
    editArenaIdx = -1;
    document.getElementById('addArena').textContent = 'Add Arena';
    document.getElementById('cancelArena').style.display = 'none';
    document.getElementById('delArena').style.display = 'none';
    showArenaEditor(false);
}
function renderArenaList() {
    const listEl = document.getElementById('arenaList');
    if (!listEl)
        return;
    const list = Array.isArray(moduleData.behaviors?.arenas) ? moduleData.behaviors.arenas : [];
    if (list.length === 0) {
        listEl.innerHTML = renderEmptyState('No arenas created yet.');
    }
    else {
        listEl.innerHTML = list.map((arena, idx) => {
            const waveCount = Array.isArray(arena.waves) ? arena.waves.length : 0;
            const reward = arena.reward?.toast || arena.reward?.log || '';
            const rewardStr = reward ? ` - ${reward}` : '';
            return `<button type="button" class="list-item-btn" data-idx="${idx}">${arena.map || 'world'} (${waveCount} waves)${rewardStr}</button>`;
        }).join('');
        Array.from(listEl.children).forEach(div => {
            div.onclick = () => editArena(parseInt(div.dataset.idx, 10));
        });
    }
}
// --- Zones ---
function showZoneEditor(show) {
    document.getElementById('zoneEditor').style.display = show ? 'block' : 'none';
}
function updateZoneWallFields() {
    const wrap = document.getElementById('zoneEntrancesWrap');
    if (!wrap)
        return;
    wrap.style.display = document.getElementById('zoneWalled').checked ? 'block' : 'none';
}
function startNewZone() {
    editZoneIdx = -1;
    populateMapDropdown(document.getElementById('zoneMap'), 'world');
    document.getElementById('zoneTag').value = '';
    document.getElementById('zoneX').value = 0;
    document.getElementById('zoneY').value = 0;
    document.getElementById('zoneW').value = 1;
    document.getElementById('zoneH').value = 1;
    document.getElementById('zoneHp').value = 0;
    document.getElementById('zoneMsg').value = '';
    document.getElementById('zoneWeather').value = '';
    document.getElementById('zoneNegate').value = '';
    document.getElementById('zoneHealMult').value = '';
    document.getElementById('zoneNoEnc').checked = false;
    document.getElementById('zoneUseItem').value = '';
    document.getElementById('zoneReward').value = '';
    document.getElementById('zoneOnce').checked = false;
    document.getElementById('zoneWalled').checked = false;
    ['North', 'South', 'East', 'West'].forEach(dir => {
        document.getElementById('zoneEntrance' + dir).checked = false;
    });
    updateZoneWallFields();
    document.getElementById('addZone').textContent = 'Add Zone';
    document.getElementById('delZone').style.display = 'none';
    showZoneEditor(true);
    selectedObj = null;
    drawWorld();
}
function collectZone() {
    const map = document.getElementById('zoneMap').value.trim() || 'world';
    const tag = document.getElementById('zoneTag').value.trim();
    const x = parseInt(document.getElementById('zoneX').value, 10) || 0;
    const y = parseInt(document.getElementById('zoneY').value, 10) || 0;
    const w = parseInt(document.getElementById('zoneW').value, 10) || 1;
    const h = parseInt(document.getElementById('zoneH').value, 10) || 1;
    const hp = parseInt(document.getElementById('zoneHp').value, 10);
    const msg = document.getElementById('zoneMsg').value.trim();
    const weather = document.getElementById('zoneWeather').value.trim();
    const negate = document.getElementById('zoneNegate').value.trim();
    const healMult = parseFloat(document.getElementById('zoneHealMult').value);
    const noEnc = document.getElementById('zoneNoEnc').checked;
    const useItemId = document.getElementById('zoneUseItem').value.trim();
    const reward = document.getElementById('zoneReward').value.trim();
    const once = document.getElementById('zoneOnce').checked;
    const walled = document.getElementById('zoneWalled').checked;
    const entrances = {
        north: document.getElementById('zoneEntranceNorth').checked,
        south: document.getElementById('zoneEntranceSouth').checked,
        east: document.getElementById('zoneEntranceEast').checked,
        west: document.getElementById('zoneEntranceWest').checked
    };
    const entry = { map, x, y, w, h };
    if (tag)
        entry.tag = tag;
    if (hp || msg) {
        entry.perStep = {};
        if (hp)
            entry.perStep.hp = hp;
        if (msg)
            entry.perStep.msg = msg;
    }
    if (weather)
        entry.weather = weather;
    if (negate)
        entry.negate = negate;
    if (!isNaN(healMult))
        entry.healMult = healMult;
    if (noEnc)
        entry.noEncounters = true;
    if (walled) {
        entry.walled = true;
        const enabled = Object.entries(entrances).reduce((acc, [dir, val]) => {
            if (val)
                acc[dir] = true;
            return acc;
        }, {});
        if (Object.keys(enabled).length)
            entry.entrances = enabled;
    }
    if (useItemId) {
        entry.useItem = { id: useItemId };
        if (reward)
            entry.useItem.reward = reward;
        if (once)
            entry.useItem.once = true;
    }
    return entry;
}
function addZone() {
    const entry = collectZone();
    if (!moduleData._origKeys)
        moduleData._origKeys = Object.keys(moduleData);
    if (!moduleData._origKeys.includes('zones'))
        moduleData._origKeys.push('zones');
    if (editZoneIdx >= 0) {
        moduleData.zones[editZoneIdx] = entry;
    }
    else {
        moduleData.zones.push(entry);
    }
    editZoneIdx = -1;
    document.getElementById('addZone').textContent = 'Add Zone';
    document.getElementById('delZone').style.display = 'none';
    renderZoneList();
    showZoneEditor(false);
    selectedObj = null;
    drawWorld();
}
function editZone(i) {
    const z = moduleData.zones[i];
    editZoneIdx = i;
    populateMapDropdown(document.getElementById('zoneMap'), z.map);
    document.getElementById('zoneTag').value = z.tag || '';
    document.getElementById('zoneX').value = z.x;
    document.getElementById('zoneY').value = z.y;
    document.getElementById('zoneW').value = z.w;
    document.getElementById('zoneH').value = z.h;
    document.getElementById('zoneHp').value = z.perStep?.hp ?? '';
    document.getElementById('zoneMsg').value = z.perStep?.msg || '';
    document.getElementById('zoneWeather').value = typeof z.weather === 'string' ? z.weather : z.weather?.state || '';
    document.getElementById('zoneNegate').value = z.negate || '';
    document.getElementById('zoneHealMult').value = z.healMult ?? '';
    document.getElementById('zoneNoEnc').checked = !!z.noEncounters;
    document.getElementById('zoneUseItem').value = z.useItem?.id || '';
    document.getElementById('zoneReward').value = z.useItem?.reward || '';
    document.getElementById('zoneOnce').checked = !!z.useItem?.once;
    document.getElementById('zoneWalled').checked = !!z.walled;
    const entrances = typeof z.entrances === 'object' && z.entrances ? z.entrances : {};
    document.getElementById('zoneEntranceNorth').checked = !!entrances.north;
    document.getElementById('zoneEntranceSouth').checked = !!entrances.south;
    document.getElementById('zoneEntranceEast').checked = !!entrances.east;
    document.getElementById('zoneEntranceWest').checked = !!entrances.west;
    updateZoneWallFields();
    document.getElementById('addZone').textContent = 'Update Zone';
    document.getElementById('delZone').style.display = 'block';
    showZoneEditor(true);
    selectedObj = { type: 'zone', obj: z };
    showMap(z.map);
    focusMap(z.x + z.w / 2, z.y + z.h / 2);
    drawWorld();
}
function formatZoneSummary(z) {
    if (!z)
        return '';
    const coords = `@(${z.x},${z.y},${z.w}x${z.h})`;
    if (z.tag)
        return `${z.tag} - ${z.map} ${coords}`;
    return `${z.map} ${coords}`;
}
function renderZoneList() {
    const list = document.getElementById('zoneList');
    if (moduleData.zones.length === 0) {
        list.innerHTML = renderEmptyState('No zones created yet.');
    }
    else {
        list.innerHTML = moduleData.zones.map((z, i) => `<button type="button" class="list-item-btn" data-idx="${i}">${formatZoneSummary(z)}</button>`).join('');
        Array.from(list.children).forEach(btn => btn.onclick = () => editZone(parseInt(btn.dataset.idx, 10)));
    }
    const encMap = document.getElementById('encMap');
    if (encMap) {
        const encZone = document.getElementById('encZone');
        const selectedTag = encZone ? encZone.value : '';
        populateEncounterZoneDropdown(encMap.value || 'world', selectedTag);
    }
}
function updateZoneDims() {
    if (editZoneIdx < 0)
        return;
    const z = moduleData.zones[editZoneIdx];
    z.x = parseInt(document.getElementById('zoneX').value, 10) || 0;
    z.y = parseInt(document.getElementById('zoneY').value, 10) || 0;
    z.w = Math.max(1, parseInt(document.getElementById('zoneW').value, 10) || 1);
    z.h = Math.max(1, parseInt(document.getElementById('zoneH').value, 10) || 1);
    renderZoneList();
    drawWorld();
}
['zoneX', 'zoneY', 'zoneW', 'zoneH'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateZoneDims);
});
document.getElementById('zoneWalled').addEventListener('change', updateZoneWallFields);
function deleteZone() {
    if (editZoneIdx < 0)
        return;
    moduleData.zones.splice(editZoneIdx, 1);
    editZoneIdx = -1;
    document.getElementById('addZone').textContent = 'Add Zone';
    document.getElementById('delZone').style.display = 'none';
    renderZoneList();
    showZoneEditor(false);
    selectedObj = null;
    drawWorld();
}
// --- Portals ---
function showPortalEditor(show) {
    document.getElementById('portalEditor').style.display = show ? 'block' : 'none';
}
function startNewPortal() {
    editPortalIdx = -1;
    populateMapDropdown(document.getElementById('portalMap'), 'world');
    document.getElementById('portalX').value = 0;
    document.getElementById('portalY').value = 0;
    populateMapDropdown(document.getElementById('portalToMap'), 'world');
    document.getElementById('portalToX').value = 0;
    document.getElementById('portalToY').value = 0;
    document.getElementById('addPortal').textContent = 'Add Portal';
    document.getElementById('delPortal').style.display = 'none';
    showPortalEditor(true);
}
function collectPortal() {
    const map = document.getElementById('portalMap').value.trim() || 'world';
    const x = parseInt(document.getElementById('portalX').value, 10) || 0;
    const y = parseInt(document.getElementById('portalY').value, 10) || 0;
    const toMap = document.getElementById('portalToMap').value.trim() || 'world';
    const toX = parseInt(document.getElementById('portalToX').value, 10) || 0;
    const toY = parseInt(document.getElementById('portalToY').value, 10) || 0;
    return { map, x, y, toMap, toX, toY };
}
function addPortal() {
    const entry = collectPortal();
    if (editPortalIdx >= 0) {
        moduleData.portals[editPortalIdx] = entry;
    }
    else {
        moduleData.portals.push(entry);
    }
    editPortalIdx = -1;
    document.getElementById('addPortal').textContent = 'Add Portal';
    document.getElementById('delPortal').style.display = 'none';
    renderPortalList();
    selectedObj = null;
    drawWorld();
    showPortalEditor(false);
}
function editPortal(i) {
    const p = moduleData.portals[i];
    editPortalIdx = i;
    populateMapDropdown(document.getElementById('portalMap'), p.map);
    document.getElementById('portalX').value = p.x;
    document.getElementById('portalY').value = p.y;
    populateMapDropdown(document.getElementById('portalToMap'), p.toMap);
    document.getElementById('portalToX').value = p.toX;
    document.getElementById('portalToY').value = p.toY;
    document.getElementById('addPortal').textContent = 'Update Portal';
    document.getElementById('delPortal').style.display = 'block';
    showPortalEditor(true);
    selectedObj = { type: 'portal', obj: p };
    drawWorld();
}
function renderPortalList() {
    const list = document.getElementById('portalList');
    if (moduleData.portals.length === 0) {
        list.innerHTML = renderEmptyState('No portals created yet.');
    }
    else {
        list.innerHTML = moduleData.portals.map((p, i) => `<button type="button" class="list-item-btn" data-idx="${i}">${p.map} @(${p.x},${p.y}) → ${p.toMap} (${p.toX},${p.toY})</button>`).join('');
        Array.from(list.children).forEach(btn => btn.onclick = () => editPortal(parseInt(btn.dataset.idx, 10)));
    }
}
function deletePortal() {
    if (editPortalIdx < 0)
        return;
    moduleData.portals.splice(editPortalIdx, 1);
    editPortalIdx = -1;
    document.getElementById('addPortal').textContent = 'Add Portal';
    document.getElementById('delPortal').style.display = 'none';
    renderPortalList();
    selectedObj = null;
    drawWorld();
    showPortalEditor(false);
}
// --- Buildings ---
function drawBldg() {
    if (!bldgCanvas || !bldgCtx)
        return;
    const w = bldgGrid[0]?.length || 1, h = bldgGrid.length || 1;
    const sx = bldgCanvas.width / w, sy = bldgCanvas.height / h;
    bldgCtx.clearRect(0, 0, bldgCanvas.width, bldgCanvas.height);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const t = bldgGrid[y][x];
            bldgCtx.fillStyle = t === TILE.BUILDING ? '#fff' : t === TILE.DOOR ? '#8bd98d' : '#000';
            bldgCtx.fillRect(x * sx, y * sy, sx, sy);
        }
    }
}
function showBldgEditor(show) {
    document.getElementById('bldgEditor').style.display = show ? 'block' : 'none';
}
function startNewBldg() {
    editBldgIdx = -1;
    document.getElementById('bldgX').value = 0;
    document.getElementById('bldgY').value = 0;
    document.getElementById('bldgW').value = 6;
    document.getElementById('bldgH').value = 5;
    document.getElementById('bldgBoarded').checked = false;
    document.getElementById('bldgBunker').checked = false;
    document.getElementById('bldgInterior').disabled = false;
    bldgGrid = Array.from({ length: 5 }, () => Array.from({ length: 6 }, () => TILE.BUILDING));
    bldgGrid[4][3] = TILE.DOOR;
    bldgPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    bldgPalette.querySelector('button[data-tile="B"]').classList.add('active');
    bldgPaint = TILE.BUILDING;
    updateInteriorOptions();
    document.getElementById('addBldg').style.display = 'block';
    document.getElementById('cancelBldg').style.display = 'none';
    document.getElementById('delBldg').style.display = 'none';
    placingType = null;
    placingPos = null;
    selectedObj = null;
    drawWorld();
    drawBldg();
    showBldgEditor(true);
}
function beginPlaceBldg() {
    clearPaletteSelection();
    placingType = 'bldg';
    placingPos = null;
    placingCb = addBuilding;
    document.getElementById('addBldg').style.display = 'none';
    document.getElementById('cancelBldg').style.display = 'block';
    selectedObj = null;
    drawWorld();
}
// Add a new building to the world and start editing it
function addBuilding() {
    const x = parseInt(document.getElementById('bldgX').value, 10) || 0;
    const y = parseInt(document.getElementById('bldgY').value, 10) || 0;
    const bunker = document.getElementById('bldgBunker').checked;
    let interiorId = document.getElementById('bldgInterior').value;
    if (!bunker) {
        if (!interiorId) {
            interiorId = makeInteriorRoom();
            const I = interiors[interiorId];
            I.id = interiorId;
            moduleData.interiors.push(I);
            renderInteriorList();
        }
    }
    else {
        interiorId = null;
    }
    const boarded = document.getElementById('bldgBoarded').checked;
    const b = placeHut(x, y, { interiorId, grid: bldgGrid, boarded, bunker });
    moduleData.buildings.push(b);
    editBldgIdx = moduleData.buildings.length - 1;
    renderBldgList();
    selectedObj = { type: 'bldg', obj: b };
    placingType = null;
    placingPos = null;
    drawWorld();
    document.getElementById('delBldg').style.display = 'block';
    document.getElementById('addBldg').style.display = 'none';
}
function cancelBldg() {
    placingType = null;
    placingPos = null;
    placingCb = null;
    document.getElementById('addBldg').style.display = 'block';
    document.getElementById('cancelBldg').style.display = 'none';
    drawWorld();
    updateCursor();
}
function renderBldgList() {
    const list = document.getElementById('bldgList');
    if (moduleData.buildings.length === 0) {
        list.innerHTML = renderEmptyState('No buildings created yet.');
    }
    else {
        const bldgs = moduleData.buildings.map((b, i) => ({ b, i })).sort((a, b) => a.b.x - b.b.x || a.b.y - b.b.y);
        list.innerHTML = bldgs.map(({ b, i }) => `<button type="button" class="list-item-btn" data-idx="${i}">Bldg @(${b.x},${b.y})</button>`).join('');
        Array.from(list.children).forEach(btn => btn.onclick = () => editBldg(parseInt(btn.dataset.idx, 10)));
    }
}
function editBldg(i) {
    const b = moduleData.buildings[i];
    showMap('world');
    focusMap(b.x + b.w / 2, b.y + b.h / 2);
    editBldgIdx = i;
    document.getElementById('bldgX').value = b.x;
    document.getElementById('bldgY').value = b.y;
    document.getElementById('bldgW').value = b.w;
    document.getElementById('bldgH').value = b.h;
    document.getElementById('bldgBoarded').checked = !!b.boarded;
    document.getElementById('bldgBunker').checked = !!b.bunker;
    document.getElementById('bldgInterior').disabled = !!b.bunker;
    bldgGrid = b.grid ? b.grid.map(r => r.slice()) : Array.from({ length: b.h }, () => Array.from({ length: b.w }, () => TILE.BUILDING));
    updateInteriorOptions();
    document.getElementById('bldgInterior').value = b.interiorId || '';
    document.getElementById('addBldg').style.display = 'none';
    document.getElementById('cancelBldg').style.display = 'none';
    document.getElementById('delBldg').style.display = 'block';
    bldgPalette.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
    bldgPalette.querySelector('button[data-tile="B"]').classList.add('active');
    bldgPaint = TILE.BUILDING;
    drawBldg();
    showBldgEditor(true);
    selectedObj = { type: 'bldg', obj: b };
    drawWorld();
}
function paintBldg(e) {
    if (!bldgPainting || !bldgCanvas)
        return;
    const w = bldgGrid[0]?.length || 1, h = bldgGrid.length || 1;
    const rect = bldgCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (bldgCanvas.width / w));
    const y = Math.floor((e.clientY - rect.top) / (bldgCanvas.height / h));
    if (bldgPaint === TILE.DOOR) {
        for (let yy = 0; yy < h; yy++) {
            for (let xx = 0; xx < w; xx++) {
                if (bldgGrid[yy][xx] === TILE.DOOR)
                    bldgGrid[yy][xx] = TILE.BUILDING;
            }
        }
    }
    bldgGrid[y][x] = bldgPaint;
    drawBldg();
    applyBldgChanges();
}
if (bldgCanvas) {
    bldgCanvas.addEventListener('mousedown', e => { bldgPainting = true; paintBldg(e); });
    bldgCanvas.addEventListener('mousemove', paintBldg);
    bldgCanvas.addEventListener('mouseup', () => { bldgPainting = false; });
    bldgCanvas.addEventListener('mouseleave', () => { bldgPainting = false; });
}
function resizeBldg() {
    const w = parseInt(document.getElementById('bldgW').value, 10) || 1;
    const h = parseInt(document.getElementById('bldgH').value, 10) || 1;
    const ng = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (y < bldgGrid.length && x < bldgGrid[0].length) ? bldgGrid[y][x] : null));
    bldgGrid = ng;
    drawBldg();
    applyBldgChanges();
}
document.getElementById('bldgW').addEventListener('change', resizeBldg);
document.getElementById('bldgH').addEventListener('change', resizeBldg);
bldgPalette.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        bldgPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const t = btn.dataset.tile;
        bldgPaint = t === 'B' ? TILE.BUILDING : t === 'D' ? TILE.DOOR : null;
    });
});
bldgPalette.querySelector('button')?.classList.add('active');
if (worldPalette) {
    worldPalette.querySelectorAll('button').forEach(btn => {
        const id = parseInt(btn.dataset.tile, 10);
        const name = tileNames[id] || '';
        btn.title = name;
        btn.setAttribute('aria-label', name);
        btn.dataset.name = name;
    });
    function bindPaletteBtn(btn) {
        btn.addEventListener('click', () => {
            const isOn = btn.classList.contains('active');
            worldPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            worldPaint = isOn ? null : parseInt(btn.dataset.tile, 10);
            worldStamp = null;
            if (currentMap !== 'world' && worldPaint != null) {
                intPaint = worldPaint;
            }
            if (!isOn) {
                btn.classList.add('active');
                if (paletteLabel) {
                    const label = btn.dataset.name || tileNames[worldPaint] || '';
                    paletteLabel.textContent = label;
                }
            }
            else if (paletteLabel) {
                paletteLabel.textContent = '';
            }
            updateCursor();
        });
    }
    worldPalette.querySelectorAll('button').forEach(bindPaletteBtn);
}
function clearPaletteSelection() {
    if (worldPalette)
        worldPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    worldPaint = null;
    worldStamp = null;
    if (paletteLabel)
        paletteLabel.textContent = '';
    updateCursor();
}
if (window.NanoPalette) {
    window.NanoPalette.init();
}
const stampsBtn = document.getElementById('stampsBtn');
const stampWindow = document.getElementById('stampWindow');
if (stampsBtn && stampWindow) {
    function renderStampWindow() {
        stampWindow.innerHTML = '';
        for (const [id, stamp] of Object.entries(worldStamps)) {
            const opt = document.createElement('div');
            opt.className = 'stamp-option';
            opt.setAttribute('role', 'button');
            opt.setAttribute('tabindex', '0');
            const canv = document.createElement('canvas');
            canv.width = 64;
            canv.height = 64;
            const c = canv.getContext('2d');
            for (let y = 0; y < stamp.length; y++) {
                for (let x = 0; x < stamp[y].length; x++) {
                    c.fillStyle = akColors[stamp[y][x]] || '#000';
                    c.fillRect(x * 4, y * 4, 4, 4);
                }
            }
            opt.appendChild(canv);
            const lbl = document.createElement('span');
            lbl.textContent = stampNames[id] || id;
            opt.appendChild(lbl);
            const selectStamp = () => {
                worldStamp = worldStamps[id];
                worldPaint = null;
                if (worldPalette)
                    worldPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                if (paletteLabel)
                    paletteLabel.textContent = stampNames[id] || '';
                stampWindow.style.display = 'none';
                updateCursor();
                drawWorld();
            };
            opt.addEventListener('click', selectStamp);
            opt.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectStamp();
                }
            });
            stampWindow.appendChild(opt);
        }
        if (window.NanoPalette) {
            const aiBtn = document.createElement('button');
            aiBtn.id = 'nanoStampBtn';
            aiBtn.className = 'btn';
            aiBtn.textContent = '🤖';
            aiBtn.setAttribute('aria-label', 'Generate AI Stamp');
            aiBtn.addEventListener('click', async () => {
                const originalText = aiBtn.textContent;
                aiBtn.disabled = true;
                aiBtn.textContent = '⏳';
                try {
                    const block = await window.NanoPalette.generate();
                    if (block) {
                        const grid = gridFromEmoji(block);
                        worldStamps.nano = grid;
                        worldStampEmoji.nano = block;
                        stampNames.nano = 'Nano';
                        renderStampWindow();
                        worldStamp = worldStamps.nano;
                        worldPaint = null;
                        if (worldPalette)
                            worldPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                        if (paletteLabel)
                            paletteLabel.textContent = stampNames.nano || '';
                        stampWindow.style.display = 'none';
                        updateCursor();
                        drawWorld();
                    }
                }
                finally {
                    aiBtn.disabled = false;
                    aiBtn.textContent = originalText;
                }
            });
            stampWindow.appendChild(aiBtn);
        }
    }
    renderStampWindow();
    stampsBtn.addEventListener('click', () => {
        if (stampWindow.style.display === 'block') {
            stampWindow.style.display = 'none';
            return;
        }
        const rect = stampsBtn.getBoundingClientRect();
        stampWindow.style.left = rect.left + window.scrollX + 'px';
        stampWindow.style.top = rect.bottom + window.scrollY + 'px';
        stampWindow.style.right = 'auto';
        stampWindow.style.display = 'block';
    });
}
function removeBuilding(b) {
    if (b.under) {
        for (let yy = 0; yy < b.h; yy++) {
            for (let xx = 0; xx < b.w; xx++) {
                setTile('world', b.x + xx, b.y + yy, b.under[yy][xx]);
            }
        }
    }
    else {
        for (let yy = 0; yy < b.h; yy++) {
            for (let xx = 0; xx < b.w; xx++) {
                setTile('world', b.x + xx, b.y + yy, TILE.SAND);
            }
        }
    }
    const idx = buildings.indexOf(b);
    if (idx >= 0)
        buildings.splice(idx, 1);
}
function moveBuilding(b, x, y) {
    const idx = moduleData.buildings.indexOf(b);
    removeBuilding(b);
    const nb = placeHut(x, y, { interiorId: b.interiorId, boarded: b.boarded, grid: b.grid });
    moduleData.buildings[idx] = nb;
    editBldgIdx = idx;
    return nb;
}
function redrawBuildings() {
    moduleData.buildings.forEach(b => {
        const grid = b.grid || Array.from({ length: b.h }, () => Array.from({ length: b.w }, () => TILE.BUILDING));
        for (let yy = 0; yy < b.h; yy++) {
            for (let xx = 0; xx < b.w; xx++) {
                const t = grid[yy][xx];
                if (t === TILE.DOOR || t === TILE.BUILDING) {
                    setTile('world', b.x + xx, b.y + yy, t);
                }
            }
        }
    });
}
// Update the currently edited building when fields or tiles change
function applyBldgChanges() {
    if (editBldgIdx < 0)
        return;
    const x = parseInt(document.getElementById('bldgX').value, 10) || 0;
    const y = parseInt(document.getElementById('bldgY').value, 10) || 0;
    const bunker = document.getElementById('bldgBunker').checked;
    let interiorId = document.getElementById('bldgInterior').value;
    if (!bunker) {
        if (!interiorId) {
            interiorId = makeInteriorRoom();
            const I = interiors[interiorId];
            I.id = interiorId;
            moduleData.interiors.push(I);
            renderInteriorList();
            document.getElementById('bldgInterior').value = interiorId;
        }
    }
    else {
        interiorId = null;
    }
    const ob = moduleData.buildings[editBldgIdx];
    removeBuilding(ob);
    const boarded = document.getElementById('bldgBoarded').checked;
    const b = placeHut(x, y, { interiorId, grid: bldgGrid, boarded, bunker });
    moduleData.buildings[editBldgIdx] = b;
    selectedObj = { type: 'bldg', obj: b };
    placingType = null;
    placingPos = null;
    renderBldgList();
    drawWorld();
}
function deleteBldg() {
    if (editBldgIdx < 0)
        return;
    const b = moduleData.buildings[editBldgIdx];
    removeBuilding(b);
    moduleData.buildings.splice(editBldgIdx, 1);
    editBldgIdx = -1;
    document.getElementById('addBldg').style.display = 'block';
    document.getElementById('cancelBldg').style.display = 'none';
    document.getElementById('delBldg').style.display = 'none';
    renderBldgList();
    selectedObj = null;
    drawWorld();
    showBldgEditor(false);
}
function closeBldgEditor() {
    editBldgIdx = -1;
    placingType = null;
    placingPos = null;
    selectedObj = null;
    document.getElementById('addBldg').style.display = 'block';
    document.getElementById('cancelBldg').style.display = 'none';
    document.getElementById('delBldg').style.display = 'none';
    renderBldgList();
    showBldgEditor(false);
    drawWorld();
}
// --- Quests ---
function updateQuestRewardFields() {
    const type = document.getElementById('questRewardType')?.value || '';
    const showItem = type === 'item';
    const showXP = type === 'xp';
    const showScrap = type === 'scrap';
    const showCustom = type === 'custom';
    const toggle = (id, shouldShow, display = 'block') => {
        const el = document.getElementById(id);
        if (el)
            el.style.display = shouldShow ? display : 'none';
    };
    toggle('questRewardItemWrap', showItem);
    toggle('questRewardXPWrap', showXP);
    toggle('questRewardScrapWrap', showScrap);
    toggle('questRewardCustomWrap', showCustom);
}
function resetQuestRewardFields() {
    const typeSel = document.getElementById('questRewardType');
    if (!typeSel)
        return;
    typeSel.value = '';
    const itemId = document.getElementById('questRewardItemId');
    if (itemId)
        itemId.value = '';
    const xp = document.getElementById('questRewardXP');
    if (xp)
        xp.value = 10;
    const scrap = document.getElementById('questRewardScrap');
    if (scrap)
        scrap.value = 0;
    const customId = document.getElementById('questRewardCustomId');
    if (customId)
        customId.value = '';
    const customName = document.getElementById('questRewardCustomName');
    if (customName)
        customName.value = '';
    const customType = document.getElementById('questRewardCustomType');
    if (customType)
        customType.value = '';
    const customSlot = document.getElementById('questRewardCustomSlot');
    if (customSlot)
        customSlot.value = '';
    loadMods({}, 'questRewardMods');
    updateQuestRewardFields();
}
function setQuestRewardFields(reward) {
    resetQuestRewardFields();
    const typeSel = document.getElementById('questRewardType');
    if (!typeSel)
        return;
    if (typeof reward === 'string') {
        const trimmed = reward.trim();
        if (/^xp\s*\d+/i.test(trimmed)) {
            typeSel.value = 'xp';
            const xp = document.getElementById('questRewardXP');
            if (xp)
                xp.value = parseInt(trimmed.replace(/[^0-9]/g, ''), 10) || 0;
        }
        else if (/^scrap\s*\d+/i.test(trimmed)) {
            typeSel.value = 'scrap';
            const scrap = document.getElementById('questRewardScrap');
            if (scrap)
                scrap.value = parseInt(trimmed.replace(/[^0-9]/g, ''), 10) || 0;
        }
        else {
            typeSel.value = 'item';
            const item = document.getElementById('questRewardItemId');
            if (item)
                item.value = trimmed;
        }
    }
    else if (reward && typeof reward === 'object') {
        typeSel.value = 'custom';
        const customId = document.getElementById('questRewardCustomId');
        if (customId)
            customId.value = reward.id || '';
        const customName = document.getElementById('questRewardCustomName');
        if (customName)
            customName.value = reward.name || '';
        const customType = document.getElementById('questRewardCustomType');
        if (customType)
            customType.value = reward.type || '';
        const customSlot = document.getElementById('questRewardCustomSlot');
        if (customSlot)
            customSlot.value = reward.slot || '';
        loadMods(reward.mods || {}, 'questRewardMods');
        maybeSyncQuestRewardSlot();
    }
    updateQuestRewardFields();
}
function buildQuestRewardFromInputs() {
    const typeSel = document.getElementById('questRewardType');
    if (!typeSel)
        return { ok: true, reward: undefined };
    const type = typeSel.value;
    if (!type)
        return { ok: true, reward: undefined };
    if (type === 'item') {
        const itemId = document.getElementById('questRewardItemId').value.trim();
        if (!itemId)
            return { ok: false, error: 'Enter an item id for the reward.' };
        return { ok: true, reward: itemId };
    }
    if (type === 'xp') {
        const xp = parseInt(document.getElementById('questRewardXP').value, 10);
        if (!Number.isFinite(xp) || xp < 0)
            return { ok: false, error: 'Enter an XP amount of 0 or more.' };
        return { ok: true, reward: `XP ${xp}` };
    }
    if (type === 'scrap') {
        const scrap = parseInt(document.getElementById('questRewardScrap').value, 10);
        if (!Number.isFinite(scrap) || scrap < 0)
            return { ok: false, error: 'Enter a scrap amount of 0 or more.' };
        return { ok: true, reward: `SCRAP ${scrap}` };
    }
    if (type === 'custom') {
        const id = document.getElementById('questRewardCustomId').value.trim();
        const name = document.getElementById('questRewardCustomName').value.trim();
        const rewardType = document.getElementById('questRewardCustomType').value.trim();
        const slot = document.getElementById('questRewardCustomSlot').value.trim();
        if (!id || !name)
            return { ok: false, error: 'Custom rewards need an id and name.' };
        const mods = collectMods('questRewardMods');
        const reward = { id, name };
        if (rewardType)
            reward.type = rewardType;
        if (slot)
            reward.slot = slot;
        if (Object.keys(mods).length)
            reward.mods = mods;
        return { ok: true, reward };
    }
    return { ok: true, reward: undefined };
}
function maybeSyncQuestRewardSlot() {
    const type = document.getElementById('questRewardCustomType')?.value || '';
    const slot = document.getElementById('questRewardCustomSlot');
    if (!slot)
        return;
    if (!slot.value && ['weapon', 'armor', 'trinket'].includes(type))
        slot.value = type;
}
function showQuestEditor(show) {
    document.getElementById('questEditor').style.display = show ? 'block' : 'none';
}
function startNewQuest() {
    editQuestIdx = -1;
    document.getElementById('questId').value = nextId('quest', moduleData.quests);
    document.getElementById('questTitle').value = '';
    document.getElementById('questDesc').value = '';
    document.getElementById('questItem').value = '';
    resetQuestRewardFields();
    document.getElementById('questXP').value = 10;
    document.getElementById('questNPC').value = '';
    document.getElementById('addQuest').textContent = 'Add Quest';
    document.getElementById('delQuest').style.display = 'none';
    showQuestEditor(true);
    document.getElementById('questId').focus();
}
function addQuest() {
    const id = document.getElementById('questId').value.trim();
    const title = document.getElementById('questTitle').value.trim();
    const desc = document.getElementById('questDesc').value.trim();
    const item = document.getElementById('questItem').value.trim();
    const rewardResult = buildQuestRewardFromInputs();
    if (!rewardResult.ok) {
        alert(rewardResult.error);
        return;
    }
    const xpValue = parseInt(document.getElementById('questXP').value, 10);
    let xp = Number.isFinite(xpValue) ? xpValue : 10;
    xp = Math.round(xp);
    if (xp < 10)
        xp = 10;
    else if (xp > 100)
        xp = 100;
    const quest = { id, title, desc, xp };
    if (item)
        quest.item = item;
    if (typeof rewardResult.reward !== 'undefined')
        quest.reward = rewardResult.reward;
    if (editQuestIdx >= 0) {
        moduleData.quests[editQuestIdx] = quest;
    }
    else {
        moduleData.quests.push(quest);
    }
    const npcId = document.getElementById('questNPC').value.trim();
    if (npcId) {
        const npc = moduleData.npcs.find(n => n.id === npcId);
        if (npc) {
            if (Array.isArray(npc.quests)) {
                if (!npc.quests.includes(id))
                    npc.quests.push(id);
            }
            else if (npc.questId) {
                npc.quests = [npc.questId, id];
                delete npc.questId;
            }
            else {
                npc.questId = id;
            }
        }
    }
    editQuestIdx = -1;
    document.getElementById('addQuest').textContent = 'Add Quest';
    document.getElementById('delQuest').style.display = 'none';
    renderQuestList();
    renderNPCList();
    document.getElementById('questId').value = nextId('quest', moduleData.quests);
    showQuestEditor(false);
}
function renderQuestList() {
    const list = document.getElementById('questList');
    if (moduleData.quests.length === 0) {
        list.innerHTML = renderEmptyState('No quests created yet.');
    }
    else {
        list.innerHTML = moduleData.quests.map((q, i) => `<button type="button" class="list-item-btn" data-idx="${i}">${q.id}: ${q.title}</button>`).join('');
        Array.from(list.children).forEach(btn => btn.onclick = () => editQuest(parseInt(btn.dataset.idx, 10)));
    }
    updateQuestOptions();
}
function editQuest(i) {
    const q = moduleData.quests[i];
    editQuestIdx = i;
    document.getElementById('questId').value = q.id;
    document.getElementById('questTitle').value = q.title;
    document.getElementById('questDesc').value = q.desc;
    document.getElementById('questItem').value = q.item || '';
    setQuestRewardFields(q.reward);
    const questXP = typeof q.xp === 'number' ? q.xp : parseInt(q.xp, 10);
    const sanitizedQuestXP = Number.isFinite(questXP) ? Math.min(Math.max(Math.round(questXP), 10), 100) : 10;
    document.getElementById('questXP').value = sanitizedQuestXP;
    const npc = moduleData.npcs.find(n => Array.isArray(n.quests) ? n.quests.includes(q.id) : n.questId === q.id);
    document.getElementById('questNPC').value = npc ? npc.id : '';
    document.getElementById('addQuest').textContent = 'Update Quest';
    document.getElementById('delQuest').style.display = 'block';
    showQuestEditor(true);
}
function updateQuestOptions() {
    const sel = document.getElementById('npcQuests');
    if (sel) {
        const cur = Array.from(sel.selectedOptions || []).map(o => o.value);
        sel.innerHTML = moduleData.quests.map(q => `<option value="${q.id}">${q.title}</option>`).join('');
        cur.forEach(v => { const opt = Array.from(sel.options || []).find((o) => o.value === v); if (opt)
            opt.selected = true; });
    }
    const npcSel = document.getElementById('questNPC');
    if (npcSel) {
        const npcCur = npcSel.value;
        npcSel.innerHTML = '<option value="" data-placeholder="true">Select NPC…</option>' + moduleData.npcs.map(n => `<option value="${n.id}">${n.id}</option>`).join('');
        if (npcCur)
            npcSel.value = npcCur;
        else
            npcSel.selectedIndex = 0;
    }
}
function deleteQuest() {
    if (editQuestIdx < 0)
        return;
    confirmDialog('Delete this quest?', () => {
        const q = moduleData.quests[editQuestIdx];
        moduleData.npcs.forEach(n => {
            if (Array.isArray(n.quests)) {
                n.quests = n.quests.filter(id => id !== q.id);
            }
            else if (n.questId === q.id) {
                n.questId = '';
            }
        });
        moduleData.quests.splice(editQuestIdx, 1);
        editQuestIdx = -1;
        document.getElementById('addQuest').textContent = 'Add Quest';
        document.getElementById('delQuest').style.display = 'none';
        renderQuestList();
        renderNPCList();
        updateQuestOptions();
        document.getElementById('questId').value = nextId('quest', moduleData.quests);
        showQuestEditor(false);
    });
}
function applyLoadedModule(data) {
    moduleData.module = data.module;
    moduleData.moduleVar = data.moduleVar;
    moduleData.props = { ...(data.props || {}) };
    moduleData.seed = data.seed || Date.now();
    moduleData._origKeys = Object.keys(data);
    moduleData.name = data.name || 'adventure-module';
    moduleData.npcs = data.npcs || [];
    moduleData.items = (data.items || []).map(it => {
        if (it && it.slot && (!it.type || ['weapon', 'armor', 'trinket'].includes(it.slot))) {
            it.type = it.type || it.slot;
        }
        delete it.slot;
        return it;
    });
    moduleData.personas = { ...(data.personas || {}) };
    initTags();
    moduleData.quests = data.quests || [];
    moduleData.buildings = data.buildings || [];
    moduleData.interiors = (data.interiors || []).map(I => {
        let g = I.grid;
        let orig;
        if (g && typeof g[0] === 'string') {
            orig = g.slice();
            g = gridFromEmoji(g);
        }
        return { ...I, grid: g, _origGrid: orig };
    });
    moduleData.portals = data.portals || [];
    moduleData.events = data.events || [];
    moduleData.templates = data.templates || [];
    moduleData.zones = data.zones || [];
    moduleData.zoneEffects = (data.zoneEffects || []).map(z => ({ ...z }));
    moduleData.behaviors = JSON.parse(JSON.stringify(data.behaviors || {}));
    moduleData.encounters = [];
    if (data.encounters) {
        Object.entries(data.encounters).forEach(([map, list]) => {
            list.forEach(e => moduleData.encounters.push({ map, ...e }));
        });
    }
    moduleData.start = data.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
    document.getElementById('moduleName').value = moduleData.name;
    const bunkerScope = moduleData.props?.bunkerTravelScope || 'global';
    const scopeEl = document.getElementById('moduleBunkerScope');
    if (scopeEl)
        scopeEl.value = bunkerScope;
    globalThis.interiors = {};
    interiors = globalThis.interiors;
    moduleData.interiors.forEach(I => { interiors[I.id] = I; });
    if (data.world) {
        const w = typeof data.world[0] === 'string' ? gridFromEmoji(data.world) : data.world;
        globalThis.world = w;
        world = globalThis.world;
    }
    else {
        buildings.forEach(b => {
            for (let yy = 0; yy < b.h; yy++) {
                for (let xx = 0; xx < b.w; xx++) {
                    setTile('world', b.x + xx, b.y + yy, b.under[yy][xx]);
                }
            }
        });
    }
    buildings.length = 0;
    moduleData.buildings.forEach(b => {
        const nb = placeHut(b.x, b.y, b);
        nb._origKeys = Object.keys(b);
    });
    moduleData.buildings = [...buildings];
    drawWorld();
    renderNPCList();
    renderItemList();
    renderBldgList();
    renderInteriorList();
    renderPortalList();
    renderZoneList();
    renderQuestList();
    renderEventList();
    renderArenaList();
    renderEncounterList();
    renderTemplateList();
    updateQuestOptions();
    loadMods({});
    showItemEditor(false);
    showNPCEditor(false);
    setNpcCancelVisible(false);
    showBldgEditor(false);
    showInteriorEditor(false);
    showQuestEditor(false);
    showArenaEditor(false);
}
globalThis.applyLoadedModule = applyLoadedModule;
function validateSpawns() {
    const walkable = { 0: true, 1: true, 2: false, 3: true, 4: true, 5: true, 6: false, 7: true, 8: true, 9: false };
    const issues = [];
    const s = moduleData.start;
    if (!walkable[world[s.y][s.x]])
        issues.push({ msg: 'Player start on blocked tile', type: 'start' });
    moduleData.npcs.forEach((n, i) => { if (n.map === 'world' && !walkable[world[n.y][n.x]])
        issues.push({ msg: 'NPC ' + (n.id || '') + ' on blocked tile', type: 'npc', idx: i }); });
    moduleData.items.forEach((it, i) => { if (it.map === 'world' && !walkable[world[it.y][it.x]])
        issues.push({ msg: 'Item ' + it.id + ' on blocked tile', type: 'item', idx: i }); });
    const unlocks = new Set();
    moduleData.npcs.forEach(n => {
        Object.values(n.tree || {}).forEach((node) => {
            (node.choices || []).forEach(ch => {
                (ch.effects || []).forEach(e => { if (e.effect === 'unlockNPC' && e.npcId)
                    unlocks.add(e.npcId); });
            });
        });
    });
    moduleData.npcs.forEach((n, i) => {
        if (n.locked && n.id && !unlocks.has(n.id))
            issues.push({ msg: 'Locked NPC ' + n.id + ' has no unlock', type: 'npc', idx: i });
        if (!n.portraitSheet)
            issues.push({ msg: 'NPC ' + (n.id || '') + ' missing portrait', type: 'npc', idx: i, warn: true });
        if (!n.prompt)
            issues.push({ msg: 'NPC ' + (n.id || '') + ' missing prompt', type: 'npc', idx: i, warn: true });
    });
    const availableItems = new Set();
    const availableTags = new Set();
    const addTag = tag => {
        if (typeof tag !== 'string')
            return;
        const clean = tag.trim().toLowerCase();
        if (clean)
            availableTags.add(clean);
    };
    const addTags = tags => {
        if (!tags)
            return;
        if (Array.isArray(tags))
            tags.forEach(addTag);
        else
            addTag(tags);
    };
    const addItemId = id => {
        if (typeof id !== 'string')
            return;
        const clean = id.trim();
        if (!clean || /\s/.test(clean))
            return;
        availableItems.add(clean);
    };
    const addItemEntry = entry => {
        if (!entry)
            return;
        if (typeof entry === 'string') {
            addItemId(entry);
            return;
        }
        if (typeof entry === 'object') {
            if (entry.id)
                addItemId(entry.id);
            if (entry.item)
                addItemId(entry.item);
            if (entry.baseId)
                addItemId(entry.baseId);
            addTags(entry.tags);
        }
    };
    const addReward = reward => {
        if (!reward)
            return;
        if (Array.isArray(reward)) {
            reward.forEach(addReward);
            return;
        }
        if (typeof reward === 'string') {
            addItemId(reward);
            return;
        }
        if (typeof reward === 'object') {
            addItemEntry(reward);
            if (reward.reward)
                addReward(reward.reward);
            if (reward.items)
                addReward(reward.items);
        }
    };
    const addEffects = effects => {
        if (!Array.isArray(effects))
            return;
        effects.forEach(e => {
            if (!e || typeof e !== 'object')
                return;
            if (e.effect === 'addItem')
                addItemId(e.id || e.item);
        });
    };
    (moduleData.items || []).forEach(it => {
        addItemEntry(it);
        addTags(it.tags);
    });
    (moduleData.quests || []).forEach(q => { addReward(q.reward); });
    (moduleData.npcs || []).forEach(n => {
        if (n.shop?.inv)
            n.shop.inv.forEach(addItemEntry);
        Object.values(n.tree || {}).forEach((node) => {
            addEffects(node.effects);
            (node.choices || []).forEach(ch => {
                addReward(ch.reward);
                addEffects(ch.effects);
            });
        });
    });
    (moduleData.events || []).forEach(ev => {
        (ev.events || []).forEach(e => { if (e.effect === 'addItem')
            addItemId(e.id || e.item); });
    });
    const normReqList = req => {
        const out = [];
        const push = entry => {
            if (!entry)
                return;
            if (Array.isArray(entry)) {
                entry.forEach(push);
                return;
            }
            if (typeof entry === 'string') {
                const str = entry.trim();
                if (!str)
                    return;
                if (str.includes(','))
                    str.split(',').forEach(part => push(part.trim()));
                else
                    out.push(str);
                return;
            }
            out.push(entry);
        };
        push(req);
        return out;
    };
    const hasRequirement = req => {
        if (!req)
            return false;
        if (Array.isArray(req))
            return req.some(hasRequirement);
        if (typeof req === 'string') {
            const str = req.trim();
            if (!str)
                return false;
            if (str.startsWith('tag:')) {
                const tag = str.slice(4).trim().toLowerCase();
                return tag ? availableTags.has(tag) : false;
            }
            return availableItems.has(str);
        }
        if (typeof req === 'object') {
            if (req.id && hasRequirement(req.id))
                return true;
            if (req.item && hasRequirement(req.item))
                return true;
            if (typeof req.tag === 'string')
                return availableTags.has(req.tag.trim().toLowerCase());
            if (Array.isArray(req.tags))
                return req.tags.some(t => typeof t === 'string' && availableTags.has(t.trim().toLowerCase()));
        }
        return false;
    };
    const describeReq = req => {
        if (!req)
            return 'the required item';
        if (typeof req === 'string') {
            if (req.startsWith('tag:')) {
                const tag = req.slice(4).trim();
                return tag ? `an item tagged "${tag}"` : 'the required item';
            }
            return `"${req}"`;
        }
        if (typeof req === 'object') {
            if (typeof req.tag === 'string' && req.tag.trim())
                return `an item tagged "${req.tag.trim()}"`;
            if (Array.isArray(req.tags)) {
                const tags = req.tags.map(t => typeof t === 'string' ? t.trim() : '').filter(Boolean);
                if (tags.length)
                    return `an item tagged "${tags.join('" or "')}"`;
            }
            if (typeof req.id === 'string' && req.id.trim())
                return `"${req.id.trim()}"`;
            if (typeof req.item === 'string' && req.item.trim())
                return `"${req.item.trim()}"`;
        }
        return 'the required item';
    };
    const describeReqList = list => {
        const parts = list.map(describeReq).filter(Boolean);
        if (!parts.length)
            return 'the required item';
        if (parts.length === 1)
            return parts[0];
        return parts.slice(0, -1).join(', ') + ' or ' + parts[parts.length - 1];
    };
    const checkCombatRequires = (entry, label, type, idx) => {
        const reqs = normReqList(entry?.combat?.requires);
        if (!reqs.length)
            return;
        if (reqs.some(hasRequirement))
            return;
        issues.push({ msg: `${label} requires ${describeReqList(reqs)} but the module has none`, type, idx });
    };
    (moduleData.npcs || []).forEach((n, i) => {
        const label = 'Enemy ' + (n.id || n.name || ('NPC #' + (i + 1)));
        checkCombatRequires(n, label, 'npc', i);
    });
    (moduleData.templates || []).forEach((t, i) => {
        const label = 'Enemy template ' + (t.id || t.name || ('#' + (i + 1)));
        checkCombatRequires(t, label, 'template', i);
    });
    return issues;
}
function onProblemClick() {
    const idxStr = this.dataset?.idx ?? (typeof this.getAttribute === 'function' ? this.getAttribute('data-idx') : null);
    const prob = problemRefs[parseInt(idxStr || '-1', 10)];
    if (!prob)
        return;
    if (prob.type === 'npc') {
        editNPC(prob.idx);
        const msg = prob.msg || '';
        let targetSection = null;
        if (/portrait/i.test(msg))
            targetSection = 'npcSectionAppearance';
        else if (/prompt|dialog/i.test(msg))
            targetSection = 'npcSectionInteraction';
        else if (/locked npc/i.test(msg))
            targetSection = 'npcSectionServices';
        else if (/blocked tile/i.test(msg))
            targetSection = 'npcSectionPlacement';
        if (/blocked tile/i.test(msg)) {
            setTimeout(() => {
                beginNpcCoordinateSelection();
                openNpcSection('npcSectionPlacement', { scroll: true, focus: true });
            }, 60);
            return;
        }
        if (targetSection) {
            setTimeout(() => openNpcSection(targetSection, { scroll: true, focus: true }), 60);
        }
    }
    else if (prob.type === 'item')
        editItem(prob.idx);
    else if (prob.type === 'template')
        editTemplate(prob.idx);
    else if (prob.type === 'start') {
        showMap('world');
        focusMap(moduleData.start.x, moduleData.start.y);
        selectedObj = null;
        settingStart = true;
        setMapActionBanner('Player start needs a walkable tile. Click a valid tile to reposition.', 'error');
        drawWorld();
    }
}
function renderProblems(issues) {
    issues = issues || validateSpawns();
    const card = document.getElementById('problemCard');
    const list = document.getElementById('problemList');
    problemRefs = issues;
    if (!issues.length) {
        card.style.display = 'none';
        if (list)
            list.innerHTML = '';
        return;
    }
    card.style.display = 'block';
    if (!list)
        return;
    const existing = Array.from(list.children);
    const frag = typeof document.createDocumentFragment === 'function' ? document.createDocumentFragment() : null;
    const pendingNodes = [];
    issues.forEach((p, i) => {
        let btn = existing[i];
        const isButton = btn && btn.tagName === 'BUTTON';
        if (!isButton) {
            btn = document.createElement('button');
        }
        const button = btn;
        button.type = 'button';
        button.className = 'problem-link';
        if (button.dataset)
            button.dataset.idx = String(i);
        else if (typeof button.setAttribute === 'function')
            button.setAttribute('data-idx', String(i));
        button.style.color = p.warn ? '#fc0' : '#f33';
        button.title = 'Jump to issue';
        if (button.onclick !== onProblemClick)
            button.onclick = onProblemClick;
        let icon = button.querySelector('span.problem-icon');
        if (!icon) {
            icon = document.createElement('span');
            icon.className = 'problem-icon';
            button.insertBefore(icon, button.firstChild);
        }
        icon.textContent = p.warn ? '⚠️' : '🛑';
        let text = button.querySelector('span.problem-text');
        if (!text) {
            text = document.createElement('span');
            text.className = 'problem-text';
            button.appendChild(text);
        }
        text.textContent = p.msg;
        if (frag)
            frag.appendChild(button);
        else
            pendingNodes.push(button);
    });
    if (frag && typeof list.replaceChildren === 'function') {
        list.replaceChildren(frag);
    }
    else {
        while (list.firstChild)
            list.removeChild(list.firstChild);
        pendingNodes.forEach(node => list.appendChild(node));
    }
}
function hasBlockingProblems() {
    const issues = (validateSpawns() || []);
    if (issues.length)
        renderProblems(issues);
    return issues.some(issue => !issue?.warn);
}
function exportModulePayload() {
    moduleData.name = document.getElementById('moduleName').value.trim() || 'adventure-module';
    if (moduleData.personas) {
        const used = new Set((moduleData.items || []).map(it => it.persona).filter(Boolean));
        Object.keys(moduleData.personas).forEach(id => {
            const entry = moduleData.personas[id];
            if (!entry || Object.keys(entry).length === 0 || !used.has(id))
                delete moduleData.personas[id];
        });
    }
    const hasPersonas = moduleData.personas && Object.keys(moduleData.personas).length > 0;
    if (hasPersonas && Array.isArray(moduleData._origKeys) && !moduleData._origKeys.includes('personas')) {
        moduleData._origKeys.push('personas');
    }
    const hasProps = Object.keys(moduleData.props || {}).length > 0;
    const bldgs = moduleData.buildings.map(({ under, _origKeys, ...rest }) => {
        const clean = {};
        (_origKeys || Object.keys(rest)).forEach(k => { clean[k] = rest[k]; });
        return clean;
    });
    const ints = moduleData.interiors.map(I => {
        const { _origGrid, ...rest } = I;
        return { ...rest, grid: _origGrid || gridToEmoji(I.grid) };
    });
    const enc = {};
    (moduleData.encounters || []).forEach(e => {
        const { map, ...rest } = e;
        (enc[map] || (enc[map] = [])).push(rest);
    });
    const base = {};
    (moduleData._origKeys || Object.keys(moduleData)).forEach(k => {
        if (['buildings', 'interiors', 'encounters', 'world', '_origKeys'].includes(k))
            return;
        if (k === 'props') {
            if (hasProps)
                base.props = moduleData.props;
            return;
        }
        if (k === 'personas' && !hasPersonas)
            return;
        if (moduleData[k] !== undefined)
            base[k] = moduleData[k];
    });
    if (moduleData._origKeys?.includes('encounters') || Object.keys(enc).length)
        base.encounters = enc;
    if (moduleData._origKeys?.includes('zoneEffects') || (moduleData.zoneEffects && moduleData.zoneEffects.length)) {
        base.zoneEffects = moduleData.zoneEffects.map(z => ({ ...z }));
    }
    base.world = gridToEmoji(world);
    if (moduleData._origKeys?.includes('buildings') || bldgs.length)
        base.buildings = bldgs;
    if (moduleData._origKeys?.includes('interiors') || ints.length)
        base.interiors = ints;
    const data = base;
    return { data };
}
globalThis.exportModulePayload = exportModulePayload;
function saveModule() {
    if (hasBlockingProblems())
        return;
    const { data } = exportModulePayload();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = moduleData.name + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
}
function playtestModule() {
    if (hasBlockingProblems())
        return;
    moduleData.name = document.getElementById('moduleName').value.trim() || 'adventure-module';
    if (moduleData.personas) {
        const used = new Set((moduleData.items || []).map(it => it.persona).filter(Boolean));
        Object.keys(moduleData.personas).forEach(id => {
            const entry = moduleData.personas[id];
            if (!entry || Object.keys(entry).length === 0 || !used.has(id))
                delete moduleData.personas[id];
        });
    }
    const bldgs = buildings.map(({ under, ...rest }) => rest);
    const ints = moduleData.interiors.map(I => ({ ...I, grid: gridToEmoji(I.grid) }));
    const enc = {};
    (moduleData.encounters || []).forEach(e => {
        const { map, ...rest } = e;
        (enc[map] || (enc[map] = [])).push(rest);
    });
    const zones = moduleData.zones ? moduleData.zones.map(z => ({ ...z })) : [];
    const zoneEffects = moduleData.zoneEffects ? moduleData.zoneEffects.map(z => ({ ...z })) : [];
    const hasProps = Object.keys(moduleData.props || {}).length > 0;
    const moduleBase = { ...moduleData };
    if (!hasProps)
        delete moduleBase.props;
    const data = { ...moduleBase, encounters: enc, world: gridToEmoji(world), buildings: bldgs, interiors: ints, zones, zoneEffects };
    localStorage.setItem(PLAYTEST_KEY, JSON.stringify(data));
    window.open('dustland.html?ack-player=1#play', '_blank');
}
document.getElementById('clear').onclick = clearWorld;
const moduleBunkerScope = document.getElementById('moduleBunkerScope');
if (moduleBunkerScope) {
    moduleBunkerScope.addEventListener('change', () => {
        const scope = moduleBunkerScope.value || 'global';
        moduleData.props = moduleData.props || {};
        if (scope === 'global')
            delete moduleData.props.bunkerTravelScope;
        else
            moduleData.props.bunkerTravelScope = scope;
    });
}
function runGenerate(regen) {
    if (typeof moduleData?.generateMap === 'function')
        moduleData.generateMap(regen);
    else
        generateProceduralWorld(regen);
}
document.getElementById('procGen').onclick = () => runGenerate(false);
document.getElementById('procRegen').onclick = () => runGenerate(true);
document.getElementById('saveNPC').onclick = saveNPC;
document.getElementById('addItem').onclick = () => {
    const onMap = document.getElementById('itemOnMap').checked;
    const mapVal = document.getElementById('itemMap').value.trim();
    if (editItemIdx >= 0 || !onMap || !mapVal)
        addItem();
    else
        beginPlaceItem();
};
document.getElementById('newItem').onclick = startNewItem;
document.getElementById('itemMap').addEventListener('input', updateItemMapWrap);
document.getElementById('itemOnMap').addEventListener('change', updateItemMapWrap);
document.getElementById('itemRemove').onclick = removeItemFromWorld;
document.getElementById('newNPC').onclick = startNewNPC;
document.getElementById('discardNPC').onclick = discardNPC;
document.getElementById('newBldg').onclick = startNewBldg;
document.getElementById('newQuest').onclick = startNewQuest;
document.getElementById('questRewardType').addEventListener('change', updateQuestRewardFields);
const questRewardCustomType = document.getElementById('questRewardCustomType');
if (questRewardCustomType)
    questRewardCustomType.addEventListener('change', () => {
        maybeSyncQuestRewardSlot();
    });
document.getElementById('addBldg').onclick = beginPlaceBldg;
document.getElementById('addQuest').onclick = addQuest;
document.getElementById('addEvent').onclick = addEvent;
document.getElementById('cancelItem').onclick = cancelItem;
document.getElementById('cancelBldg').onclick = cancelBldg;
document.getElementById('newEvent').onclick = startNewEvent;
document.getElementById('addPortal').onclick = addPortal;
document.getElementById('newPortal').onclick = startNewPortal;
document.getElementById('newZone').onclick = startNewZone;
document.getElementById('bldgBunker').addEventListener('change', () => {
    document.getElementById('bldgInterior').disabled = document.getElementById('bldgBunker').checked;
});
document.getElementById('addZone').onclick = addZone;
document.getElementById('delZone').onclick = deleteZone;
document.getElementById('delNPC').onclick = deleteNPC;
document.getElementById('closeNPC').onclick = closeNPCEditor;
document.getElementById('closeItem').onclick = closeItemEditor;
document.getElementById('closeBldg').onclick = closeBldgEditor;
document.getElementById('closeInterior').onclick = closeInteriorEditor;
document.getElementById('newArena').onclick = startNewArena;
document.getElementById('addArena').onclick = addArena;
document.getElementById('arenaAddWave').onclick = () => addArenaWaveBlock({});
document.getElementById('cancelArena').onclick = cancelArena;
document.getElementById('delArena').onclick = deleteArena;
document.getElementById('newEncounter').onclick = startNewEncounter;
document.getElementById('addEncounter').onclick = addEncounter;
document.getElementById('encAddLootRow').onclick = () => addLootTableRow(document.getElementById('encLootTable'));
document.getElementById('cancelEncounter').onclick = () => { editEncounterIdx = -1; showEncounterEditor(false); };
document.getElementById('delEncounter').onclick = deleteEncounter;
document.getElementById('closeEncounter').onclick = () => showEncounterEditor(false);
document.getElementById('newTemplate').onclick = startNewTemplate;
document.getElementById('addTemplate').onclick = addTemplate;
document.getElementById('templateAddLootRow').onclick = () => addLootTableRow(document.getElementById('templateLootTable'));
document.getElementById('delTemplate').onclick = deleteTemplate;
document.getElementById('templateDropScrap').onchange = toggleTemplateScrapFields;
document.getElementById('encTemplate').addEventListener('change', () => {
    const container = document.getElementById('encLootTable');
    if (!container || container.querySelector('.lootRow'))
        return;
    const tmplId = document.getElementById('encTemplate').value.trim();
    const tmpl = moduleData.templates.find(t => t.id === tmplId);
    const table = getTemplateLootTable(tmpl);
    if (table.length)
        setLootTable(container, table);
});
document.getElementById('encLocationMode').addEventListener('change', updateEncounterLocationMode);
document.getElementById('encMap').addEventListener('change', () => {
    const mapSel = document.getElementById('encMap');
    const zoneSel = document.getElementById('encZone');
    populateEncounterZoneDropdown(mapSel.value || 'world', zoneSel ? zoneSel.value : '');
    updateEncounterLocationMode();
});
updateEncounterLocationMode();
document.getElementById('npcPrevP').onclick = () => {
    npcPortraitIndex = (npcPortraitIndex + npcPortraits.length - 1) % npcPortraits.length;
    npcPortraitPath = '';
    setNpcPortrait();
    applyNPCChanges();
};
document.getElementById('npcNextP').onclick = () => {
    npcPortraitIndex = (npcPortraitIndex + 1) % npcPortraits.length;
    npcPortraitPath = '';
    setNpcPortrait();
    applyNPCChanges();
};
setupListFilter('npcFilter', 'npcList');
setupListFilter('itemFilter', 'itemList');
setupListFilter('questFilter', 'questList');
setupListFilter('eventFilter', 'eventList');
setupListFilter('arenaFilter', 'arenaList');
setupListFilter('encFilter', 'encounterList');
document.getElementById('delItem').onclick = deleteItem;
document.getElementById('delBldg').onclick = deleteBldg;
document.getElementById('newInterior').onclick = startNewInterior;
document.getElementById('delInterior').onclick = deleteInterior;
document.getElementById('delQuest').onclick = deleteQuest;
document.getElementById('delEvent').onclick = deleteEvent;
document.getElementById('delPortal').onclick = deletePortal;
populateTypeDropdown(document.getElementById('itemType'));
document.getElementById('itemType').addEventListener('change', updateModsWrap);
document.getElementById('itemUseType').addEventListener('change', updateUseWrap);
document.getElementById('itemTags').addEventListener('input', updatePersonaSection);
document.getElementById('itemPersonaId').addEventListener('input', updatePersonaSection);
document.getElementById('itemPersonaPortraitPath').addEventListener('input', e => {
    itemPersonaPortraitPath = e.target.value.trim();
    if (itemPersonaPortraitPath)
        itemPersonaPortraitIndex = 0;
    setItemPersonaPortrait();
});
document.getElementById('itemPersonaPrev').onclick = () => {
    itemPersonaPortraitIndex = (itemPersonaPortraitIndex + personaPortraits.length - 1) % personaPortraits.length;
    itemPersonaPortraitPath = '';
    const pathEl = document.getElementById('itemPersonaPortraitPath');
    if (pathEl)
        pathEl.value = '';
    setItemPersonaPortrait();
};
document.getElementById('itemPersonaNext').onclick = () => {
    itemPersonaPortraitIndex = (itemPersonaPortraitIndex + 1) % personaPortraits.length;
    itemPersonaPortraitPath = '';
    const pathEl = document.getElementById('itemPersonaPortraitPath');
    if (pathEl)
        pathEl.value = '';
    setItemPersonaPortrait();
};
document.getElementById('npcTileSprite').addEventListener('input', () => {
    updateTileSpritePreview('npcTileSprite', 'npcTileSpritePreview');
});
document.getElementById('itemTileSprite').addEventListener('input', () => {
    updateTileSpritePreview('itemTileSprite', 'itemTileSpritePreview');
});
const npcTileUploadBtn = document.getElementById('npcTileSpriteUploadBtn');
if (npcTileUploadBtn) {
    npcTileUploadBtn.addEventListener('click', () => {
        const input = document.getElementById('npcTileSpriteUpload');
        input?.click();
    });
}
attachTileSpriteUpload('npcTileSpriteUpload', 'npcTileSprite', 'npcTileSpritePreview', applyNPCChanges);
const itemTileUploadBtn = document.getElementById('itemTileSpriteUploadBtn');
if (itemTileUploadBtn) {
    itemTileUploadBtn.addEventListener('click', () => {
        const input = document.getElementById('itemTileSpriteUpload');
        input?.click();
    });
}
attachTileSpriteUpload('itemTileSpriteUpload', 'itemTileSprite', 'itemTileSpritePreview');
updateTileSpritePreview('npcTileSprite', 'npcTileSpritePreview');
updateTileSpritePreview('itemTileSprite', 'itemTileSpritePreview');
document.getElementById('eventEffect').addEventListener('change', updateEventEffectFields);
document.getElementById('eventPick').onclick = () => { coordTarget = { x: 'eventX', y: 'eventY' }; };
document.getElementById('npcFlagType').addEventListener('change', updateFlagBuilder);
setupNpcSections();
const npcEditorEl = typeof document !== 'undefined' ? document.getElementById('npcEditor') : null;
if (npcEditorEl) {
    npcEditorEl.addEventListener('input', applyNPCChanges);
    npcEditorEl.addEventListener('change', applyNPCChanges);
    npcEditorEl.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const saveBtn = document.getElementById('saveNPC');
            if (saveBtn && !saveBtn.disabled)
                saveNPC();
        }
    });
}
document.getElementById('moduleName').value = moduleData.name;
document.getElementById('npcPatrol').addEventListener('change', () => {
    updatePatrolSection();
    applyNPCChanges();
});
updatePatrolSection();
document.getElementById('bldgEditor').addEventListener('input', applyBldgChanges);
document.getElementById('bldgEditor').addEventListener('change', applyBldgChanges);
document.getElementById('npcFlagPick').onclick = () => { coordTarget = { x: 'npcFlagX', y: 'npcFlagY', map: 'npcFlagMap' }; };
document.getElementById('portalPick').onclick = () => { coordTarget = { x: 'portalX', y: 'portalY' }; };
document.getElementById('portalDestPick').onclick = () => { coordTarget = { x: 'portalToX', y: 'portalToY' }; };
document.getElementById('npcPick').onclick = beginNpcCoordinateSelection;
document.getElementById('npcCancelPick').onclick = cancelNpcCoordinateSelection;
document.getElementById('itemPick').onclick = () => { coordTarget = { x: 'itemX', y: 'itemY', map: 'itemMap' }; };
document.getElementById('save').onclick = saveModule;
document.getElementById('quickSave')?.addEventListener('click', saveModule);
function loadErrorMessage(err) {
    return err?.message ?? String(err);
}
function setLoadStatus(msg, isError = false) {
    const status = document.getElementById('loadStatus');
    if (status) {
        status.textContent = msg;
        status.style.color = isError ? '#f88' : '';
    }
    else if (isError && msg) {
        alert(msg);
    }
}
function resetLoadModal() {
    setLoadStatus('');
    const input = document.getElementById('loadFile');
    if (input)
        input.value = '';
    document.getElementById('loadDropZone')?.classList.remove('dragging');
}
function closeLoadModal() {
    document.getElementById('loadModal')?.classList.remove('shown');
    resetLoadModal();
}
function showLoadModal() {
    resetLoadModal();
    const modal = document.getElementById('loadModal');
    if (modal) {
        modal.classList.add('shown');
        document.getElementById('browseLoadFile')?.focus?.();
    }
    else {
        document.getElementById('loadFile')?.click();
    }
}
function importModuleText(text) {
    try {
        applyLoadedModule(JSON.parse(text));
        closeLoadModal();
    }
    catch (err) {
        setLoadStatus('Invalid module: ' + loadErrorMessage(err), true);
    }
}
function handleModuleFile(file) {
    if (!file)
        return;
    setLoadStatus('');
    const reader = new FileReader();
    reader.onload = () => importModuleText(reader.result);
    reader.onerror = () => setLoadStatus('Unable to read that file.', true);
    reader.readAsText(file);
}
document.getElementById('load').onclick = showLoadModal;
const loadInput = document.getElementById('loadFile');
if (loadInput)
    loadInput.addEventListener('change', () => handleModuleFile(loadInput.files?.[0]));
const loadDropZone = document.getElementById('loadDropZone');
if (loadDropZone) {
    const stop = (e) => { e.preventDefault?.(); e.stopPropagation?.(); };
    ['dragenter', 'dragover'].forEach(evt => loadDropZone.addEventListener(evt, e => {
        stop(e);
        loadDropZone.classList.add('dragging');
    }));
    ['dragleave', 'drop'].forEach(evt => loadDropZone.addEventListener(evt, e => {
        stop(e);
        loadDropZone.classList.remove('dragging');
    }));
    loadDropZone.addEventListener('drop', e => {
        stop(e);
        const files = e.dataTransfer?.files;
        handleModuleFile(files?.[0]);
    });
    loadDropZone.addEventListener('click', () => loadInput?.click());
    loadDropZone.addEventListener('keydown', e => {
        const key = e.key;
        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
            e.preventDefault?.();
            loadInput?.click();
        }
    });
}
const browseLoadBtn = document.getElementById('browseLoadFile');
if (browseLoadBtn)
    browseLoadBtn.addEventListener('click', () => loadInput?.click());
document.getElementById('closeLoadModal')?.addEventListener('click', closeLoadModal);
document.getElementById('loadModal')?.addEventListener('click', e => { if (e.target?.id === 'loadModal')
    closeLoadModal(); });
document.getElementById('setStart').onclick = () => {
    settingStart = true;
    setMapActionBanner('Start position active: choose a walkable tile on the world map.', 'info');
    drawWorld();
};
document.getElementById('resetStart').onclick = () => {
    moduleData.start = { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
    drawWorld();
    setMapActionBanner('Start position reset to the default location.', 'info', 2500);
};
const spawnHeatBtn = document.getElementById('spawnHeatBtn');
if (spawnHeatBtn)
    spawnHeatBtn.onclick = () => {
        spawnHeat = !spawnHeat;
        spawnHeatBtn.textContent = `Spawn Heat: ${spawnHeat ? 'On' : 'Off'}`;
        drawWorld();
    };
document.getElementById('addNode').onclick = addNode;
document.getElementById('editDialog').onclick = openDialogEditor;
document.getElementById('closeDialogModal').onclick = closeDialogEditor;
document.getElementById('dialogModal').addEventListener('click', e => { if (e.target.id === 'dialogModal')
    closeDialogEditor(); });
// Live preview when dialog text changes
['npcDialog', 'npcAccept', 'npcTurnin'].forEach(id => {
    document.getElementById(id).addEventListener('input', renderDialogPreview);
});
// When quest selection changes, show/hide extra fields, update preview, and (optionally) auto-generate the quest scaffold
const npcQuestEl = document.getElementById('npcQuests');
if (npcQuestEl)
    npcQuestEl.addEventListener('change', () => {
        toggleQuestDialogBtn();
        toggleQuestTextWrap();
        if ((npcQuestEl.selectedOptions || []).length) {
            generateQuestTree(); // build start/accept/turn-in scaffold
        }
        else {
            renderDialogPreview(); // just refresh preview of whatever is in the editor
        }
    });
document.getElementById('npcCombat').addEventListener('change', updateNPCOptSections);
document.getElementById('npcShop').addEventListener('change', updateNPCOptSections);
document.getElementById('npcHidden').addEventListener('change', updateNPCOptSections);
document.getElementById('npcTrainer').addEventListener('change', updateNPCOptSections);
document.getElementById('npcColorOverride').addEventListener('change', updateColorOverride);
document.getElementById('npcLocked').addEventListener('change', onLockedToggle);
document.getElementById('genQuestDialog').onclick = generateQuestTree;
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && npcMapMode) {
            cancelNpcCoordinateSelection();
        }
    });
}
// --- Map interactions ---
function canvasPos(ev) {
    const rect = canvas.getBoundingClientRect();
    const { scaleX, scaleY } = getCanvasScale(rect);
    if (currentMap === 'world') {
        const sx = baseTileW * worldZoom, sy = baseTileH * worldZoom;
        const px = (ev.clientX - rect.left) / scaleX;
        const py = (ev.clientY - rect.top) / scaleY;
        const x = clamp(Math.floor(px / sx + panX), 0, WORLD_W - 1);
        const y = clamp(Math.floor(py / sy + panY), 0, WORLD_H - 1);
        return { x, y };
    }
    else {
        const I = moduleData.interiors.find(i => i.id === currentMap);
        if (!I)
            return { x: 0, y: 0 };
        const sx = canvas.width / I.w;
        const sy = canvas.height / I.h;
        const px = (ev.clientX - rect.left) / scaleX;
        const py = (ev.clientY - rect.top) / scaleY;
        const x = clamp(Math.floor(px / sx), 0, I.w - 1);
        const y = clamp(Math.floor(py / sy), 0, I.h - 1);
        return { x, y };
    }
}
function updateCursor(x, y) {
    if (panning) {
        canvas.style.cursor = 'grabbing';
        return;
    }
    if (currentMap === 'world' && (worldPaint != null || worldStamp)) {
        canvas.style.cursor = 'crosshair';
        return;
    }
    if (dragTarget) {
        canvas.style.cursor = 'grabbing';
        return;
    }
    if (currentMap === 'world' && (settingStart || placingType)) {
        canvas.style.cursor = 'crosshair';
        return;
    }
    if (x == null || y == null) {
        const ht = hoverTile;
        if (ht) {
            x = ht.x;
            y = ht.y;
        }
    }
    if (x != null && y != null) {
        const overNpc = moduleData.npcs.some(n => n.map === currentMap && n.x === x && n.y === y);
        const overItem = moduleData.items.some(it => it.map === currentMap && it.x === x && it.y === y);
        const overBldg = currentMap === 'world' && moduleData.buildings.some(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
        const overStart = currentMap === 'world' && moduleData.start && moduleData.start.map === 'world' && moduleData.start.x === x && moduleData.start.y === y;
        const overEvent = moduleData.events.some(ev => ev.map === currentMap && ev.x === x && ev.y === y);
        const overPortal = moduleData.portals.some(p => p.map === currentMap && p.x === x && p.y === y);
        let zoneCursor = null;
        if (selectedObj && selectedObj.type === 'zone' && selectedObj.obj.map === currentMap) {
            const z = selectedObj.obj;
            const overTL = x >= z.x - 1 && x <= z.x && y >= z.y - 1 && y <= z.y;
            const overBR = x >= z.x + z.w - 1 && x <= z.x + z.w && y >= z.y + z.h - 1 && y <= z.y + z.h;
            if (overTL || overBR)
                zoneCursor = 'nwse-resize';
            else if (x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h)
                zoneCursor = 'grab';
        }
        canvas.style.cursor = zoneCursor || (overNpc || overItem || overBldg || overStart || overEvent || overPortal ? 'grab' : 'pointer');
    }
    else {
        canvas.style.cursor = 'pointer';
    }
}
canvas.addEventListener('mousedown', ev => {
    if (ev.button === 2 && currentMap === 'world') {
        showLoopControls(null);
        panning = true;
        const rect = canvas.getBoundingClientRect();
        const { scaleX, scaleY } = getCanvasScale(rect);
        panScaleX = scaleX;
        panScaleY = scaleY;
        panMouseX = ev.clientX;
        panMouseY = ev.clientY;
        panStartX = panX;
        panStartY = panY;
        canvas.style.cursor = 'grabbing';
        return;
    }
    showLoopControls(null);
    if (ev.button !== 0)
        return;
    const { x, y } = canvasPos(ev);
    const overNpc = moduleData.npcs.some(n => n.map === currentMap && n.x === x && n.y === y);
    const overItem = moduleData.items.some(it => it.map === currentMap && it.x === x && it.y === y);
    const overBldg = currentMap === 'world' && moduleData.buildings.some(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
    const overStart = currentMap === 'world' && moduleData.start && moduleData.start.map === 'world' && moduleData.start.x === x && moduleData.start.y === y;
    const overEvent = moduleData.events.some(ev2 => ev2.map === currentMap && ev2.x === x && ev2.y === y);
    const overPortal = moduleData.portals.some(p => p.map === currentMap && p.x === x && p.y === y);
    const overZone = selectedObj && selectedObj.type === 'zone' && selectedObj.obj.map === currentMap && x >= selectedObj.obj.x && x < selectedObj.obj.x + selectedObj.obj.w && y >= selectedObj.obj.y && y < selectedObj.obj.y + selectedObj.obj.h;
    if (currentMap === 'world' && worldStamp && !coordTarget && !(overNpc || overItem || overBldg || overStart || overEvent || overPortal || overZone)) {
        stampWorld(x, y, worldStamp);
        drawWorld();
        updateCursor(x, y);
        return;
    }
    const isPaintTab = activeTab === 'paint';
    const validPaint = worldPaint != null || (isPaintTab && (paintMode === 'asset' || paintMode === 'clear'));
    if (currentMap === 'world' && validPaint && !coordTarget && !(overNpc || overItem || overBldg || overStart || overEvent || overPortal || overZone)) {
        worldPainting = true;
        hoverTile = { x, y };
        if (isPaintTab && paintMode !== 'tile') {
            moduleData.tileOverrides = moduleData.tileOverrides || {};
            moduleData.tileOverrides[currentMap] = moduleData.tileOverrides[currentMap] || {};
            const key = `${x},${y}`;
            if (paintMode === 'clear') {
                delete moduleData.tileOverrides[currentMap][key];
            }
            else if (paintMode === 'asset' && paintAssetId) {
                moduleData.tileOverrides[currentMap][key] = {
                    assetId: paintAssetId,
                    opacity: paintOpacity
                };
            }
        }
        else if (worldPaint != null) {
            addTerrainFeature(x, y, worldPaint);
        }
        didPaint = true;
        drawWorld();
        updateCursor(x, y);
        return;
    }
    if (currentMap !== 'world' && !coordTarget && !placingType && !(overNpc || overItem || overEvent || overPortal || overZone)) {
        hoverTile = { x, y };
        const I = moduleData.interiors.find(i => i.id === currentMap);
        if (I) {
            applyInteriorBrush(I, x, y, intPaint);
            delete I._origGrid;
            intPainting = true;
            didPaint = true;
            drawWorld();
            drawInterior();
            updateCursor(x, y);
        }
        return;
    }
    hoverTarget = null;
    didDrag = false;
    if (coordTarget) {
        const target = coordTarget;
        document.getElementById(target.x).value = x;
        document.getElementById(target.y).value = y;
        if (target.map)
            populateMapDropdown(document.getElementById(target.map), currentMap);
        coordTarget = null;
        canvas.style.cursor = '';
        if (target.x === 'npcX' && target.y === 'npcY') {
            finishNpcCoordinateSelection(x, y);
        }
        drawWorld();
        return;
    }
    if (placingType) {
        if (placingType === 'item') {
            populateMapDropdown(document.getElementById('itemMap'), currentMap);
            document.getElementById('itemX').value = x;
            document.getElementById('itemY').value = y;
            if (placingCb)
                placingCb();
            document.getElementById('cancelItem').style.display = 'none';
        }
        else if (placingType === 'bldg' && currentMap === 'world') {
            document.getElementById('bldgX').value = x;
            document.getElementById('bldgY').value = y;
            if (placingCb)
                placingCb();
            document.getElementById('cancelBldg').style.display = 'none';
        }
        placingType = null;
        placingPos = null;
        placingCb = null;
        drawWorld();
        updateCursor(x, y);
        return;
    }
    if (settingStart && currentMap === 'world') {
        if (!isTileWalkable('world', x, y)) {
            setMapActionBanner('That tile is blocked. Pick a walkable tile for the start.', 'error');
            return;
        }
        moduleData.start = { map: 'world', x, y };
        settingStart = false;
        setMapActionBanner(`Player start set to (${x}, ${y}).`, 'success', 3000);
        drawWorld();
        updateCursor(x, y);
        return;
    }
    if (currentMap === 'world' && moduleData.start && moduleData.start.map === 'world' && moduleData.start.x === x && moduleData.start.y === y) {
        dragTarget = moduleData.start;
        dragTarget._type = 'start';
        updateCursor(x, y);
        return;
    }
    if (selectedObj && selectedObj.type === 'zone' && selectedObj.obj.map === currentMap) {
        const z = selectedObj.obj;
        const nearTL = x >= z.x - 1 && x <= z.x && y >= z.y - 1 && y <= z.y;
        const nearBR = x >= z.x + z.w - 1 && x <= z.x + z.w && y >= z.y + z.h - 1 && y <= z.y + z.h;
        if (nearTL) {
            dragTarget = z;
            dragTarget._type = 'zoneTL';
            dragOffsetX = z.x + z.w;
            dragOffsetY = z.y + z.h;
            updateCursor(x, y);
            return;
        }
        else if (nearBR) {
            dragTarget = z;
            dragTarget._type = 'zoneBR';
            updateCursor(x, y);
            return;
        }
        else if (x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) {
            dragTarget = z;
            dragTarget._type = 'zoneMove';
            dragOffsetX = x - z.x;
            dragOffsetY = y - z.y;
            updateCursor(x, y);
            return;
        }
    }
    if (selectedObj && selectedObj.type === 'npc' && selectedObj.obj.loop) {
        const idx = selectedObj.obj.loop.findIndex(p => p.x === x && p.y === y);
        if (idx >= 0) {
            dragTarget = { _type: 'loop', npc: selectedObj.obj, idx };
            updateCursor(x, y);
            return;
        }
    }
    dragTarget = moduleData.npcs.find(n => n.map === currentMap && n.x === x && n.y === y);
    if (dragTarget) {
        dragTarget._type = 'npc';
        updateCursor(x, y);
        return;
    }
    dragTarget = moduleData.items.find(it => it.map === currentMap && it.x === x && it.y === y);
    if (dragTarget) {
        dragTarget._type = 'item';
        updateCursor(x, y);
        return;
    }
    dragTarget = currentMap === 'world' ? moduleData.buildings.find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) : null;
    if (dragTarget) {
        dragTarget._type = 'bldg';
        document.getElementById('bldgX').value = dragTarget.x;
        document.getElementById('bldgY').value = dragTarget.y;
        editBldgIdx = moduleData.buildings.indexOf(dragTarget);
        document.getElementById('delBldg').style.display = 'block';
        selectedObj = { type: 'bldg', obj: dragTarget };
        drawWorld();
        showBldgEditor(true);
        updateCursor(x, y);
        return;
    }
    document.getElementById('npcX').value = x;
    document.getElementById('npcY').value = y;
    document.getElementById('itemX').value = x;
    document.getElementById('itemY').value = y;
    document.getElementById('bldgX').value = x;
    document.getElementById('bldgY').value = y;
    document.getElementById('eventX').value = x;
    document.getElementById('eventY').value = y;
    document.getElementById('zoneX').value = x;
    document.getElementById('zoneY').value = y;
    const px = document.getElementById('portalX');
    const py = document.getElementById('portalY');
    if (px && py) {
        px.value = x;
        py.value = y;
    }
    selectedObj = null;
    drawWorld();
    updateCursor(x, y);
});
canvas.addEventListener('mousemove', ev => {
    if (panning) {
        const dx = (ev.clientX - panMouseX) / (baseTileW * worldZoom * panScaleX);
        const dy = (ev.clientY - panMouseY) / (baseTileH * worldZoom * panScaleY);
        const maxPanX = WORLD_W - WORLD_W / worldZoom;
        const maxPanY = WORLD_H - WORLD_H / worldZoom;
        panX = clamp(panStartX - dx, 0, maxPanX);
        panY = clamp(panStartY - dy, 0, maxPanY);
        hoverTile = canvasPos(ev);
        drawWorld();
        updateCursor();
        return;
    }
    const { x, y } = canvasPos(ev);
    hoverTile = { x, y };
    if (currentMap === 'world' && worldStamp)
        drawWorld();
    const isPaintTab = activeTab === 'paint';
    const validPaint = worldPaint != null || (isPaintTab && (paintMode === 'asset' || paintMode === 'clear'));
    if (currentMap === 'world' && worldPainting && validPaint) {
        if (isPaintTab && paintMode !== 'tile') {
            moduleData.tileOverrides = moduleData.tileOverrides || {};
            moduleData.tileOverrides[currentMap] = moduleData.tileOverrides[currentMap] || {};
            const key = `${x},${y}`;
            if (paintMode === 'clear') {
                delete moduleData.tileOverrides[currentMap][key];
            }
            else if (paintMode === 'asset' && paintAssetId) {
                moduleData.tileOverrides[currentMap][key] = {
                    assetId: paintAssetId,
                    opacity: paintOpacity
                };
            }
        }
        else if (worldPaint != null) {
            addTerrainFeature(x, y, worldPaint);
        }
        didPaint = true;
        drawWorld();
        return;
    }
    if (currentMap !== 'world' && intPainting) {
        const I = moduleData.interiors.find(i => i.id === currentMap);
        if (I) {
            applyInteriorBrush(I, x, y, intPaint);
            delete I._origGrid;
            didPaint = true;
            drawWorld();
            drawInterior();
        }
        return;
    }
    // While placing, show ghost & bail
    if (placingType) {
        placingPos = { x, y };
        drawWorld();
        updateCursor(x, y);
        return;
    }
    // While dragging, move the correct thing & bail
    if (dragTarget) {
        didDrag = true;
        if (dragTarget._type === 'bldg') {
            // Buildings are re-placed to keep tiles coherent
            dragTarget = moveBuilding(dragTarget, x, y);
            dragTarget._type = 'bldg';
            if (selectedObj && selectedObj.type === 'bldg')
                selectedObj.obj = dragTarget;
            renderBldgList();
            document.getElementById('bldgX').value = x;
            document.getElementById('bldgY').value = y;
            document.getElementById('delBldg').style.display = 'block';
        }
        else if (dragTarget._type === 'loop') {
            const npc = dragTarget.npc;
            npc.loop[dragTarget.idx].x = x;
            npc.loop[dragTarget.idx].y = y;
            if (dragTarget.idx === 0) {
                npc.x = x;
                npc.y = y;
                document.getElementById('npcX').value = x;
                document.getElementById('npcY').value = y;
                renderNPCList();
            }
            renderLoopFields(npc.loop);
        }
        else if (dragTarget._type === 'npc') {
            dragTarget.x = x;
            dragTarget.y = y;
            renderNPCList();
            document.getElementById('npcX').value = x;
            document.getElementById('npcY').value = y;
        }
        else if (dragTarget._type === 'start') {
            dragTarget.x = x;
            dragTarget.y = y;
        }
        else if (dragTarget._type === 'zoneMove') {
            dragTarget.x = x - dragOffsetX;
            dragTarget.y = y - dragOffsetY;
            document.getElementById('zoneX').value = dragTarget.x;
            document.getElementById('zoneY').value = dragTarget.y;
            renderZoneList();
        }
        else if (dragTarget._type === 'zoneTL') {
            const brx = dragOffsetX, bry = dragOffsetY;
            dragTarget.x = Math.min(x, brx - 1);
            dragTarget.y = Math.min(y, bry - 1);
            dragTarget.w = brx - dragTarget.x;
            dragTarget.h = bry - dragTarget.y;
            document.getElementById('zoneX').value = dragTarget.x;
            document.getElementById('zoneY').value = dragTarget.y;
            document.getElementById('zoneW').value = dragTarget.w;
            document.getElementById('zoneH').value = dragTarget.h;
            renderZoneList();
        }
        else if (dragTarget._type === 'zoneBR') {
            dragTarget.w = Math.max(1, x - dragTarget.x + 1);
            dragTarget.h = Math.max(1, y - dragTarget.y + 1);
            document.getElementById('zoneW').value = dragTarget.w;
            document.getElementById('zoneH').value = dragTarget.h;
            renderZoneList();
        }
        else { // item
            dragTarget.x = x;
            dragTarget.y = y;
            renderItemList();
            document.getElementById('itemX').value = x;
            document.getElementById('itemY').value = y;
        }
        drawWorld();
        updateCursor(x, y);
        return;
    }
    // Not dragging: update hover target highlighting
    let ht = null;
    let obj = moduleData.npcs.find(n => n.map === currentMap && n.x === x && n.y === y);
    if (obj) {
        ht = { obj, type: 'npc' };
    }
    else if (obj = moduleData.items.find(it => it.map === currentMap && it.x === x && it.y === y)) {
        ht = { obj, type: 'item' };
    }
    else if (obj = (currentMap === 'world' ? moduleData.buildings.find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) : null)) {
        ht = { obj, type: 'bldg' };
    }
    else if (obj = moduleData.events.find(ev => ev.map === currentMap && ev.x === x && ev.y === y)) {
        ht = { obj, type: 'event' };
    }
    else if (obj = moduleData.zones.find(z => z.map === currentMap && x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h)) {
        ht = { obj, type: 'zone' };
    }
    else if (obj = moduleData.portals.find(p => p.map === currentMap && p.x === x && p.y === y)) {
        ht = { obj, type: 'portal' };
    }
    if ((hoverTarget && (!ht || hoverTarget.obj !== ht.obj)) || (!hoverTarget && ht)) {
        hoverTarget = ht;
        drawWorld();
    }
    if (loopHover)
        positionLoopControls();
    updateCursor(x, y);
});
canvas.addEventListener('mouseup', ev => {
    if (ev.button === 2 && panning) {
        panning = false;
        updateCursor();
        return;
    }
    if (ev.button !== 0)
        return;
    worldPainting = false;
    intPainting = false;
    if (dragTarget)
        delete dragTarget._type;
    dragTarget = null;
    if (didPaint) {
        if (currentMap === 'world')
            redrawBuildings();
        drawWorld();
        if (currentMap !== 'world')
            drawInterior();
    }
    updateCursor();
});
canvas.addEventListener('mouseleave', () => {
    if (panning)
        panning = false;
    if (didPaint && currentMap === 'world') {
        redrawBuildings();
    }
    worldPainting = false;
    intPainting = false;
    if (dragTarget)
        delete dragTarget._type;
    dragTarget = null;
    hoverTile = null;
    didPaint = false;
    drawWorld();
    if (currentMap !== 'world')
        drawInterior();
    updateCursor();
});
canvas.addEventListener('click', ev => {
    if (ev.button !== 0)
        return;
    if (didPaint) {
        didPaint = false;
        return;
    }
    if (didDrag) {
        didDrag = false;
        return;
    }
    const { x, y } = canvasPos(ev);
    if (selectedObj && selectedObj.type === 'npc' && selectedObj.obj.loop) {
        const npc = selectedObj.obj;
        if (x === npc.x && y === npc.y) {
            showLoopControls({ idx: 0, x: npc.x, y: npc.y });
            return;
        }
        const pts = npc.loop;
        const li = pts.findIndex(p => p.x === x && p.y === y);
        if (li >= 0) {
            showLoopControls({ idx: li, x: pts[li].x, y: pts[li].y });
            return;
        }
    }
    showLoopControls(null);
    let idx = moduleData.npcs.findIndex(n => n.map === currentMap && n.x === x && n.y === y);
    if (idx >= 0) {
        if (window.showEditorTab)
            window.showEditorTab('npc');
        editNPC(idx);
        return;
    }
    idx = moduleData.items.findIndex(it => it.map === currentMap && it.x === x && it.y === y);
    if (idx >= 0) {
        if (window.showEditorTab)
            window.showEditorTab('items');
        editItem(idx);
        return;
    }
    idx = currentMap === 'world' ? moduleData.buildings.findIndex(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) : -1;
    if (idx >= 0) {
        if (window.showEditorTab)
            window.showEditorTab('buildings');
        editBldg(idx);
        return;
    }
    idx = moduleData.events.findIndex(ev => ev.map === currentMap && ev.x === x && ev.y === y);
    if (idx >= 0) {
        if (window.showEditorTab)
            window.showEditorTab('events');
        editEvent(idx);
        return;
    }
    idx = moduleData.zones.findIndex(z => z.map === currentMap && x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
    if (idx >= 0) {
        if (window.showEditorTab)
            window.showEditorTab('zones');
        editZone(idx);
        return;
    }
    idx = moduleData.portals.findIndex(p => p.map === currentMap && p.x === x && p.y === y);
    if (idx >= 0) {
        if (window.showEditorTab)
            window.showEditorTab('portals');
        editPortal(idx);
    }
});
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('wheel', ev => {
    if (currentMap !== 'world')
        return;
    ev.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const { scaleX, scaleY } = getCanvasScale(rect);
    const mx = (ev.clientX - rect.left) / scaleX;
    const my = (ev.clientY - rect.top) / scaleY;
    const tileX = panX + mx / (baseTileW * worldZoom);
    const tileY = panY + my / (baseTileH * worldZoom);
    const factor = ev.deltaY < 0 ? 1.25 : 0.8;
    const newZoom = clamp(worldZoom * factor, 1, 8);
    if (newZoom === worldZoom)
        return;
    worldZoom = newZoom;
    const maxPanX = WORLD_W - WORLD_W / worldZoom;
    const maxPanY = WORLD_H - WORLD_H / worldZoom;
    panX = clamp(tileX - mx / (baseTileW * worldZoom), 0, maxPanX);
    panY = clamp(tileY - my / (baseTileH * worldZoom), 0, maxPanY);
    hoverTile = canvasPos(ev);
    drawWorld();
    updateCursor(hoverTile.x, hoverTile.y);
}, { passive: false });
function setPlaceholders() {
    document.querySelectorAll('label').forEach(label => {
        const input = label.querySelector('input:not([type=checkbox]):not([type=color]), textarea');
        if (input && !input.placeholder) {
            const txt = label.childNodes[0]?.textContent?.trim() || label.textContent.trim();
            input.placeholder = txt;
        }
    });
}
regenWorld();
loadMods({});
showItemEditor(false);
showNPCEditor(false);
showBldgEditor(false);
showQuestEditor(false);
showEventEditor(false);
document.getElementById('npcId').value = nextId('npc', moduleData.npcs);
document.getElementById('questId').value = nextId('quest', moduleData.quests);
document.getElementById('eventStat').innerHTML = STAT_OPTS.map(s => `<option value="${s}">${s}</option>`).join('');
renderEventList();
loadTreeEditor();
setPlaceholders();
const wizardList = document.getElementById('wizardList');
if (wizardList && globalThis.Dustland?.wizards) {
    Object.values(globalThis.Dustland.wizards).forEach(cfg => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = cfg.title;
        btn.addEventListener('click', () => openWizard(cfg));
        wizardList.appendChild(btn);
    });
}
function mergeWizardResult(res) {
    if (!res)
        return;
    Object.entries(res).forEach(([k, v]) => {
        if (Array.isArray(moduleData[k]))
            moduleData[k].push(...v);
        else
            moduleData[k] = v;
    });
    if (typeof applyModule === 'function')
        applyModule(moduleData, { fullReset: false });
    // Refresh lists so wizard changes appear immediately.
    if (typeof renderNPCList === 'function')
        renderNPCList();
    if (typeof renderItemList === 'function')
        renderItemList();
    if (typeof renderQuestList === 'function')
        renderQuestList();
    if (typeof renderBldgList === 'function')
        renderBldgList();
    if (typeof renderInteriorList === 'function')
        renderInteriorList();
    if (typeof renderEventList === 'function')
        renderEventList();
    if (typeof renderPortalList === 'function')
        renderPortalList();
    if (typeof renderZoneList === 'function')
        renderZoneList();
    if (typeof renderEncounterList === 'function')
        renderEncounterList();
    if (typeof renderTemplateList === 'function')
        renderTemplateList();
}
function openWizard(cfg) {
    const modal = document.getElementById('wizardModal');
    const body = document.getElementById('wizardBody');
    const title = document.getElementById('wizardTitle');
    const next = document.getElementById('wizardNext');
    const prev = document.getElementById('wizardPrev');
    const close = document.getElementById('closeWizard');
    title.textContent = cfg.title;
    modal.style.display = 'block';
    const wiz = Dustland.Wizard(body, cfg.steps, {
        onComplete(state) {
            if (cfg.commit)
                mergeWizardResult(cfg.commit(state));
            modal.style.display = 'none';
        }
    });
    next.onclick = () => wiz.next();
    prev.onclick = () => wiz.prev();
    body.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            wiz.next();
        }
    });
    close.onclick = () => { modal.style.display = 'none'; };
}
function animate() {
    drawWorld();
    requestAnimationFrame(animate);
}
animate();
// ---- Right-rail tabs with wide-screen mode ----
(function () {
    const panel = document.getElementById('editorPanel');
    if (!panel)
        return;
    const tabList = panel.querySelector('.tabs2');
    if (!tabList)
        return;
    const tabs = Array.from(tabList.querySelectorAll('.tab2'));
    const panes = Array.from(panel.querySelectorAll('[data-pane]'));
    const layout = document.querySelector('.ak-layout');
    const mapCard = document.getElementById('mapCard');
    // let current used to be here, now using global activeTab
    activeTab = 'npc';
    let wide = false;
    let sizingRaf = 0;
    // New Paint tab setup
    const paintTab = document.createElement('button');
    paintTab.className = 'tab2';
    paintTab.type = 'button';
    const paintTabDataset = paintTab.dataset ?? (paintTab.dataset = {});
    paintTabDataset.tab = 'paint';
    paintTab.textContent = 'Paint';
    paintTab.setAttribute('role', 'tab');
    paintTab.setAttribute('aria-selected', 'false');
    tabList.appendChild(paintTab);
    tabs.push(paintTab);
    const paintPane = document.createElement('div');
    const paintPaneDataset = paintPane.dataset ?? (paintPane.dataset = {});
    paintPaneDataset.pane = 'paint';
    paintPane.className = 'editor-section';
    paintPane.style.display = 'none';
    paintPane.innerHTML = `
    <h3>Tile Paint</h3>
    <div id="paintControls">
      <label>Mode<select id="paintMode"><option value="tile">Tile</option><option value="asset">Custom Asset</option></select></label>
      <div id="paintAssetWrap" style="display:none">
        <label>Asset ID<input id="paintAssetId" placeholder="custom asset id"/></label>
        <button class="btn" id="paintAssetPick">Pick Asset</button>
      </div>
      <label>Opacity<input type="range" id="paintOpacity" min="0" max="1" step="0.1" value="1"/><span id="paintOpacityVal">1.0</span></label>
      <button class="btn" id="paintClearTile">Clear Tile Override</button>
    </div>
    <h3>Custom Assets</h3>
    <div id="customAssetsList"></div>
    <div class="row">
      <label>Upload Asset<input type="file" id="uploadAssetInput" accept="image/png,image/webp"/></label>
    </div>
  `;
    const scrollContainer = panel.querySelector('.scroll-y');
    (scrollContainer ?? panel).appendChild(paintPane);
    panes.push(paintPane);
    // Paint logic variables: using globals defined at top
    paintMode = 'tile';
    document.getElementById('paintMode').addEventListener('change', (e) => {
        paintMode = e.target.value;
        document.getElementById('paintAssetWrap').style.display = paintMode === 'asset' ? 'block' : 'none';
    });
    document.getElementById('paintOpacity').addEventListener('input', (e) => {
        paintOpacity = parseFloat(e.target.value);
        document.getElementById('paintOpacityVal').textContent = paintOpacity.toFixed(1);
    });
    document.getElementById('paintAssetId').addEventListener('input', (e) => {
        paintAssetId = e.target.value.trim();
    });
    document.getElementById('paintClearTile').addEventListener('click', () => {
        // Logic to clear override on click handled in map click handler
        paintMode = 'clear';
        // Visual feedback or toast
    });
    // Custom Asset Upload
    document.getElementById('uploadAssetInput').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file)
            return;
        const assetId = await createCustomAssetFromFile(file);
        if (!assetId)
            return;
        const paintAssetEl = document.getElementById('paintAssetId');
        if (paintAssetEl)
            paintAssetEl.value = assetId;
        paintAssetId = assetId;
        paintMode = 'asset';
        const modeEl = document.getElementById('paintMode');
        if (modeEl)
            modeEl.value = 'asset';
        const wrap = document.getElementById('paintAssetWrap');
        if (wrap)
            wrap.style.display = 'block';
    });
    // Attach event listener for map clicking to handle paint
    // We need to hook into canvas 'mousedown' or click.
    // Existing canvas mousedown handles painting. We can extend it.
    // Ideally we modify 'paintWorld' or the canvas mousedown handler.
    // But modifying big chunks of code is risky with 'replace_with_git_merge_diff' if context matches multiple places.
    // The canvas mousedown handler calls 'addTerrainFeature' or 'applyInteriorBrush'.
    // We should intercept or modify that.
    // Let's monkey-patch addTerrainFeature and applyInteriorBrush or similar if possible,
    // or better, add a check in the event listener if we can locate it reliably.
    // The event listener is at line ~1352.
    paintTab.addEventListener('click', () => {
        renderCustomAssetList();
    });
    if (tabList && tabList.addEventListener) {
        tabList.addEventListener('wheel', e => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                tabList.scrollLeft += e.deltaY;
            }
        });
    }
    function scheduleSizing() {
        if (!layout || !mapCard)
            return;
        if (sizingRaf)
            return;
        if (typeof requestAnimationFrame !== 'function') {
            updateResponsiveSizing();
            return;
        }
        sizingRaf = requestAnimationFrame(() => {
            sizingRaf = 0;
            updateResponsiveSizing();
        });
    }
    function updateResponsiveSizing() {
        if (!layout || !mapCard)
            return;
        if (typeof window === 'undefined')
            return;
        if (window.innerWidth < 1100) {
            layout.style.removeProperty('--ak-panel-min');
            layout.style.removeProperty('--ak-map-max');
            return;
        }
        const styles = window.getComputedStyle(layout);
        const padLeft = parseFloat(styles.paddingLeft) || 0;
        const padRight = parseFloat(styles.paddingRight) || 0;
        const gap = parseFloat(styles.columnGap || styles.gap) || 0;
        const layoutWidth = Math.max(0, layout.clientWidth - padLeft - padRight);
        const trackSpace = Math.max(0, layoutWidth - gap);
        if (!trackSpace) {
            layout.style.removeProperty('--ak-panel-min');
            layout.style.removeProperty('--ak-map-max');
            return;
        }
        const mapMin = 360;
        const mapMaxDefault = 640;
        const panelMinBase = 360;
        const tabsWidth = tabList ? (tabList.scrollWidth + 32) : panelMinBase;
        const maxPanelSpace = Math.max(panelMinBase, trackSpace - mapMin);
        const panelMin = Math.min(Math.max(panelMinBase, tabsWidth), maxPanelSpace);
        const remaining = Math.max(trackSpace - panelMin, mapMin);
        const mapMax = Math.max(mapMin, Math.min(mapMaxDefault, remaining));
        layout.style.setProperty('--ak-panel-min', panelMin + 'px');
        layout.style.setProperty('--ak-map-max', mapMax + 'px');
    }
    function setLayout() {
        wide = panel.offsetWidth >= 960;
        panel.classList.toggle('wide', wide);
        if (wide) {
            panes.forEach(p => p.style.display = '');
        }
        show(activeTab);
    }
    function show(tabName) {
        activeTab = tabName;
        tabs.forEach(t => {
            const on = t.dataset.tab === tabName;
            t.classList.toggle('active', on);
            t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        const active = tabs.find(t => t.dataset.tab === tabName);
        if (active && active.scrollIntoView) {
            active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
        if (!wide) {
            panes.forEach(p => p.style.display = (p.dataset.pane === tabName ? '' : 'none'));
        }
        scheduleSizing();
    }
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
    function handleResize() {
        setLayout();
        scheduleSizing();
    }
    if (typeof ResizeObserver === 'function') {
        const ro = new ResizeObserver(handleResize);
        ro.observe(panel);
        if (layout)
            ro.observe(layout);
        if (mapCard)
            ro.observe(mapCard);
        if (tabList)
            ro.observe(tabList);
    }
    else if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('resize', handleResize);
    }
    if (typeof MutationObserver === 'function' && tabList) {
        const mo = new MutationObserver(scheduleSizing);
        mo.observe(tabList, { childList: true, subtree: true, characterData: true });
    }
    handleResize();
    if (typeof window !== 'undefined') {
        window.showEditorTab = show;
    }
})();
if (document && typeof document.addEventListener === 'function') {
    document.addEventListener('keydown', e => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') {
                e.preventDefault();
                saveModule();
            }
            else if (e.key === 'p') {
                e.preventDefault();
                playtestModule();
            }
        }
    });
}
document.getElementById('playtestFloat')?.addEventListener('click', playtestModule);
updateMapSelect();

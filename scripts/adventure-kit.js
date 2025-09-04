
// Adventure Construction Kit
// Provides basic tools to build Dustland modules.

// Ensure world generation doesn't pull default content
window.seedWorldContent = () => { };



const PLAYTEST_KEY = 'ack_playtest';

const akColors = { 0: '#1e271d', 1: '#2c342c', 2: '#1573ff', 3: '#203320', 4: '#777777', 5: '#304326', 6: '#4d5f4d', 7: '#233223', 8: '#8bd98d', 9: '#000' };
const tileNames = {
  [TILE.SAND]: 'Sand',
  [TILE.ROCK]: 'Rock',
  [TILE.WATER]: 'Water',
  [TILE.BRUSH]: 'Brush',
  [TILE.ROAD]: 'Road',
  [TILE.RUIN]: 'Ruin',
  [TILE.WALL]: 'Wall'
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
const ctx = canvas.getContext('2d');

let dragTarget = null, settingStart = false, hoverTarget = null, didDrag = false, dragOffsetX = 0, dragOffsetY = 0;
let placingType = null, placingPos = null, placingCb = null;
let hoverTile = null;
var coordTarget = null;
function setCoordTarget(v){ coordTarget = v; }
globalThis.setCoordTarget = setCoordTarget;
let worldZoom = 1, panX = 0, panY = 0;
let panning = false, panStartX = 0, panStartY = 0, panMouseX = 0, panMouseY = 0;
const baseTileW = canvas.width / WORLD_W;
const baseTileH = canvas.height / WORLD_H;
let problemRefs = [];

function focusMap(x, y) {
  if (currentMap !== 'world') return;
  const viewW = WORLD_W / worldZoom;
  const viewH = WORLD_H / worldZoom;
  const maxPanX = WORLD_W - viewW;
  const maxPanY = WORLD_H - viewH;
  panX = clamp(x - viewW / 2, 0, maxPanX);
  panY = clamp(y - viewH / 2, 0, maxPanY);
}
globalThis.focusMap = focusMap;

let loopHover = null;
const loopPlus = document.createElement('span');
loopPlus.textContent = '+';
loopPlus.className = 'pill';
loopPlus.style.position = 'absolute';
loopPlus.style.display = 'none';
document.body.appendChild(loopPlus);
const loopMinus = document.createElement('span');
loopMinus.textContent = '-';
loopMinus.className = 'pill';
loopMinus.style.position = 'absolute';
loopMinus.style.display = 'none';
document.body.appendChild(loopMinus);

function positionLoopControls() {
  if (!loopHover) return;
  const rect = canvas.getBoundingClientRect();
  const sx = baseTileW * worldZoom;
  const sy = baseTileH * worldZoom;
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
  } else {
    loopHover = null;
    loopPlus.style.display = 'none';
    loopMinus.style.display = 'none';
  }
}

loopPlus.addEventListener('click', () => {
  if (!selectedObj || selectedObj.type !== 'npc' || !loopHover) return;
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
  if (!selectedObj || selectedObj.type !== 'npc' || !loopHover) return;
  if (loopHover.idx <= 0) return;
  const npc = selectedObj.obj;
  npc.loop.splice(loopHover.idx, 1);
  renderLoopFields(npc.loop);
  drawWorld();
  showLoopControls(null);
});

const moduleData = globalThis.moduleData || (globalThis.moduleData = { seed: Date.now(), name: 'adventure-module', npcs: [], items: [], quests: [], buildings: [], interiors: [], portals: [], events: [], zones: [], encounters: [], templates: [], start: { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) }, module: undefined, moduleVar: undefined });
const STAT_OPTS = ['ATK', 'DEF', 'LCK', 'INT', 'PER', 'CHA'];
const MOD_TYPES = ['ATK', 'DEF', 'LCK', 'INT', 'PER', 'CHA', 'STR', 'AGI', 'ADR', 'adrenaline_gen_mod', 'adrenaline_dmg_mod'];
let editNPCIdx = -1, editItemIdx = -1, editQuestIdx = -1, editBldgIdx = -1, editInteriorIdx = -1, editEventIdx = -1, editPortalIdx = -1, editZoneIdx = -1, editEncounterIdx = -1, editTemplateIdx = -1;
let treeData = {};
let selectedObj = null;
const mapSelect = document.getElementById('mapSelect');
let currentMap = 'world';
function updateMapSelect(selected = 'world') {
  if (!mapSelect) return;
  const maps = ['world', ...moduleData.interiors.map(I => I.id)];
  mapSelect.innerHTML = maps.map(m => `<option value="${m}">${m}</option>`).join('');
  mapSelect.value = selected;
}
function showMap(map) {
  currentMap = map;
  if (mapSelect && mapSelect.value !== map) mapSelect.value = map;
  if (map === 'world') {
    editInteriorIdx = -1;
  } else {
    const idx = moduleData.interiors.findIndex(I => I.id === map);
    if (idx >= 0) {
      editInterior(idx);
      if (typeof showEditorTab === 'function') showEditorTab('interiors');
    }
  }
  worldZoom = map === 'world' ? worldZoom : 1;
  panX = map === 'world' ? panX : 0;
  panY = map === 'world' ? panY : 0;
  drawWorld();
  if (map !== 'world') drawInterior();
}
if (mapSelect) mapSelect.addEventListener('change', e => showMap(e.target.value));
const intCanvas = document.getElementById('intCanvas');
const intCtx = intCanvas.getContext('2d');
const intPalette = document.getElementById('intPalette');
let intPaint = TILE.WALL;
let intPainting = false;
if (intPalette) {
  const names = { W: 'Wall', F: 'Floor', D: 'Door' };
  intPalette.querySelectorAll('button').forEach(btn => {
    const name = names[btn.dataset.tile];
    if (name) btn.title = name;
  });
}

const bldgCanvas = document.getElementById('bldgCanvas');
const bldgCtx = bldgCanvas.getContext('2d');
const bldgPalette = document.getElementById('bldgPalette');
let bldgPaint = TILE.BUILDING;
let bldgPainting = false;
let bldgGrid = [];

const worldPalette = document.getElementById('worldPalette');
const paletteLabel = document.getElementById('paletteLabel');
let worldPaint = null;
let worldStamp = null;
let worldPainting = false;
let didPaint = false;
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
  if (brushSizeLabel) brushSizeLabel.textContent = brushSizeSlider.value;
  brushSizeSlider.addEventListener('input', () => {
    brushSize = parseInt(brushSizeSlider.value, 10);
    if (brushSizeLabel) brushSizeLabel.textContent = brushSizeSlider.value;
  });
}

function addTerrainFeature(x, y, tile) {
  if (!setTile('world', x, y, tile)) return;
  if (!worldPaintNoise) return;
  for (let dy = -brushSize; dy <= brushSize; dy++) {
    for (let dx = -brushSize; dx <= brushSize; dx++) {
      if (dx || dy) {
        if (Math.random() < 0.3) setTile('world', x + dx, y + dy, tile);
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

function drawWorld() {
  const map = currentMap;
  let W = WORLD_W, H = WORLD_H;
  let sx = baseTileW * worldZoom, sy = baseTileH * worldZoom;
  const pulse = 2 + Math.sin(Date.now() / 300) * 2;
  let grid = world;
  if (map !== 'world') {
    const I = moduleData.interiors.find(i => i.id === map);
    if (!I) return;
    W = I.w; H = I.h; grid = I.grid;
    sx = canvas.width / W * worldZoom;
    sy = canvas.height / H * worldZoom;
  }
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < H; y++) {
    const py = (y - (map === 'world' ? panY : 0)) * sy;
    if (py + sy < 0 || py >= canvas.height) continue;
    for (let x = 0; x < W; x++) {
      const px = (x - (map === 'world' ? panX : 0)) * sx;
      if (px + sx < 0 || px >= canvas.width) continue;
      const t = grid[y][x];
      if (map === 'world') {
        ctx.fillStyle = akColors[t] || '#000';
      } else {
        ctx.fillStyle = t === TILE.WALL ? '#444' : t === TILE.DOOR ? '#8bd98d' : '#222';
      }
      ctx.fillRect(px, py, sx, sy);
    }
  }
  if (map === 'world' && hoverTile) {
    if (worldStamp) {
      ctx.globalAlpha = 0.5;
      for (let yy = 0; yy < worldStamp.length; yy++) {
        for (let xx = 0; xx < worldStamp[yy].length; xx++) {
          const tx = hoverTile.x + xx;
          const ty = hoverTile.y + yy;
          if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) continue;
          ctx.fillStyle = akColors[worldStamp[yy][xx]] || '#000';
          ctx.fillRect((tx - panX) * sx, (ty - panY) * sy, sx, sy);
        }
      }
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect((hoverTile.x - panX) * sx, (hoverTile.y - panY) * sy, sx, sy);
    }
  }
  const pxoff = map === 'world' ? panX : 0;
  const pyoff = map === 'world' ? panY : 0;
  moduleData.npcs.filter(n => n.map === map).forEach(n => {
    const hovering = hoverTarget && hoverTarget.type === 'npc' && hoverTarget.obj === n;
    const px = (n.x - pxoff) * sx;
    const py = (n.y - pyoff) * sy;
    if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height) return;
    ctx.save();
    ctx.fillStyle = hovering ? '#fff' : (n.color || '#fff');
    if (hovering) {
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 8;
    }
    ctx.fillRect(px, py, sx, sy);
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
    ctx.setLineDash([4,4]);
    ctx.beginPath();
    pts.forEach((p, i) => {
      const px = (p.x - panX) * sx + sx / 2;
      const py = (p.y - panY) * sy + sy / 2;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
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
    if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height) return;
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
    if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height) return;
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
    if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height) return;
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
    if (zx + zw < 0 || zy + zh < 0 || zx > canvas.width || zy > canvas.height) return;
    const hovering = hoverTarget && hoverTarget.type === 'zone' && hoverTarget.obj === z;
    const selected = selectedObj && selectedObj.type === 'zone' && selectedObj.obj === z;
    ctx.save();
    ctx.strokeStyle = '#fa0';
    if (hovering) {
      ctx.shadowColor = '#fa0';
      ctx.shadowBlur = 8;
    }
    if (hovering || selected) ctx.lineWidth = 2;
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
      ctx.strokeStyle = o.color || '#fff';
      ctx.strokeRect((o.x - pxoff) * sx + 1, (o.y - pyoff) * sy + 1, sx - 2, sy - 2);
    } else if (selectedObj.type === 'item') {
      ctx.strokeStyle = '#ff0';
      ctx.strokeRect((o.x - pxoff) * sx + 1, (o.y - pyoff) * sy + 1, sx - 2, sy - 2);
    } else if (selectedObj.type === 'bldg' && map === 'world') {
      ctx.strokeStyle = '#fff';
      ctx.strokeRect((o.x - panX) * sx, (o.y - panY) * sy, o.w * sx, o.h * sy);
    } else if (selectedObj.type === 'event') {
      ctx.strokeStyle = '#0ff';
      ctx.strokeRect((o.x - pxoff) * sx + 1, (o.y - pyoff) * sy + 1, sx - 2, sy - 2);
    } else if (selectedObj.type === 'portal') {
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
    } else if (placingType === 'item') {
      ctx.strokeStyle = '#ff0';
      ctx.strokeRect(px + 1, py + 1, sx - 2, sy - 2);
    } else if (placingType === 'bldg' && map === 'world') {
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
  if (editInteriorIdx < 0) return;
  const I = moduleData.interiors[editInteriorIdx];
  const sx = intCanvas.width / I.w;
  const sy = intCanvas.height / I.h;
  intCtx.clearRect(0, 0, intCanvas.width, intCanvas.height);
  for (let y = 0; y < I.h; y++) {
    for (let x = 0; x < I.w; x++) {
      const t = I.grid[y][x];
      intCtx.fillStyle = t === TILE.WALL ? '#444' : t === TILE.DOOR ? '#8bd98d' : '#222';
      intCtx.fillRect(x * sx, y * sy, sx, sy);
    }
  }
  moduleData.npcs.filter(n => n.map === I.id).forEach(n => {
    intCtx.fillStyle = n.color || '#fff';
    intCtx.fillRect(n.x * sx, n.y * sy, sx, sy);
  });
  moduleData.items.filter(it => it.map === I.id).forEach(it => {
    intCtx.strokeStyle = '#ff0';
    intCtx.strokeRect(it.x * sx + 1, it.y * sy + 1, sx - 2, sy - 2);
  });
  if (selectedObj && selectedObj.obj.map === I.id) {
    const o = selectedObj.obj;
    intCtx.save();
    intCtx.lineWidth = 2;
    intCtx.strokeStyle = selectedObj.type === 'npc' ? (o.color || '#fff') : '#ff0';
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
function paintInterior(e){
  if(editInteriorIdx<0||!intPainting) return;
  const I=moduleData.interiors[editInteriorIdx];
  const { x, y } = interiorCanvasPos(e);
  I.grid[y][x]=intPaint;
  if(intPaint===TILE.DOOR){ I.entryX=x; I.entryY=y-1; }
  drawInterior();
}
intCanvas.addEventListener('mousedown',e=>{
  if(editInteriorIdx<0) return;
  const I = moduleData.interiors[editInteriorIdx];
  const { x, y } = interiorCanvasPos(e);
  if(coordTarget){
    document.getElementById(coordTarget.x).value = x;
    document.getElementById(coordTarget.y).value = y;
    if(coordTarget.map) document.getElementById(coordTarget.map).value = I.id;
    coordTarget = null;
    drawInterior();
    return;
  }
  if(placingType){
    if(placingType==='npc'){
      document.getElementById('npcMap').value = I.id;
      document.getElementById('npcX').value = x;
      document.getElementById('npcY').value = y;
      if(placingCb) placingCb();
      document.getElementById('cancelNPC').style.display = 'none';
    }else if(placingType==='item'){
      document.getElementById('itemMap').value = I.id;
      document.getElementById('itemX').value = x;
      document.getElementById('itemY').value = y;
      if(placingCb) placingCb();
      document.getElementById('cancelItem').style.display = 'none';
    }
    placingType=null;
    placingPos=null;
    placingCb=null;
    drawInterior();
    return;
  }
  intPainting=true;
  paintInterior(e);
});
intCanvas.addEventListener('mousemove',e=>{ if(intPainting) paintInterior(e); });
intCanvas.addEventListener('mouseup',()=>{ intPainting=false; });
intCanvas.addEventListener('mouseleave',()=>{ intPainting=false; });

intPalette.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    intPalette.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const t=btn.dataset.tile;
    intPaint = t==='W'?TILE.WALL: t==='D'?TILE.DOOR: TILE.FLOOR;
  });
});
intPalette.querySelector('button')?.classList.add('active');

function showInteriorEditor(show) {
  document.getElementById('intEditor').style.display = show ? 'block' : 'none';
}

function renderInteriorList() {
  const list = document.getElementById('intList');
  const ints = moduleData.interiors.map((I, i) => ({ I, i })).sort((a, b) => a.I.id.localeCompare(b.I.id));
  list.innerHTML = ints.map(({ I, i }) => `<div data-idx="${i}">${I.id}</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editInterior(parseInt(div.dataset.idx, 10)));
  updateInteriorOptions();
  refreshChoiceDropdowns();
  updateMapSelect(mapSelect ? mapSelect.value : 'world');
}

function startNewInterior() {
  const w = parseInt(document.getElementById('intW').value,10) || 12;
  const h = parseInt(document.getElementById('intH').value,10) || 9;
  const id = makeInteriorRoom(undefined,w,h);
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
  document.getElementById('intW').value = I.w;
  document.getElementById('intH').value = I.h;
  showInteriorEditor(true);
  document.getElementById('delInterior').style.display = 'block';
  drawInterior();
}

function resizeInterior(){
  if(editInteriorIdx<0) return;
  const I=moduleData.interiors[editInteriorIdx];
  const w=parseInt(document.getElementById('intW').value,10)||I.w;
  const h=parseInt(document.getElementById('intH').value,10)||I.h;
  const ng=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>{
    if(y<I.h && x<I.w) return I.grid[y][x];
    const edge=y===0||y===h-1||x===0||x===w-1; return edge?TILE.WALL:TILE.FLOOR;
  }));
  I.w=w; I.h=h; I.grid=ng;
  drawInterior();
}
document.getElementById('intW').addEventListener('change',resizeInterior);
document.getElementById('intH').addEventListener('change',resizeInterior);

function deleteInterior() {
  if (editInteriorIdx < 0) return;
  const I = moduleData.interiors[editInteriorIdx];
  delete interiors[I.id];
  moduleData.interiors.splice(editInteriorIdx, 1);
  editInteriorIdx = -1;
  showInteriorEditor(false);
  renderInteriorList();
}

function updateInteriorOptions() {
  const sel = document.getElementById('bldgInterior');
  if (!sel) return;
  sel.innerHTML = '<option value=""></option>' + moduleData.interiors.map(I => `<option value="${I.id}">${I.id}</option>`).join('');
}

function confirmDialog(msg, onYes) {
  const modal = document.getElementById('confirmModal');
  if (!modal) {
    if (confirm(msg)) onYes();
    return;
  }
  document.getElementById('confirmText').textContent = msg;
  modal.classList.add('shown');
  const yes = document.getElementById('confirmYes');
  const no = document.getElementById('confirmNo');
  const cleanup = () => {
    modal.classList.remove('shown');
    yes.onclick = null;
    no.onclick = null;
  };
  yes.onclick = () => { cleanup(); onYes(); };
  no.onclick = cleanup;
}

function setupListFilter(inputId, listId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;
  const apply = () => {
    const term = input.value.toLowerCase();
    Array.from(list.children).forEach(ch => {
      ch.style.display = ch.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  };
  input.addEventListener('input', apply);
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(apply).observe(list, { childList: true });
  }
  apply();
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
    if (id === 'creator') continue;
    const I = interiors[id]; I.id = id; moduleData.interiors.push(I);
  }
  renderInteriorList();
  renderBldgList();
  renderEventList();
  renderPortalList();
  renderZoneList();
  renderEncounterList();
  renderTemplateList();
  drawWorld();
}

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
    drawWorld();
  });
}

function collectMods() {
  const mods = {};
  document.querySelectorAll('#modBuilder > label').forEach(label => {
    const chk = label.querySelector('input[type="checkbox"]');
    if (chk.checked) {
      const mod = chk.dataset.mod;
      const val = parseInt(label.querySelector('.modVal').value, 10);
      if (mod && !isNaN(val)) mods[mod] = val;
    }
  });
  return mods;
}
function loadMods(mods = {}) {
  const mb = document.getElementById('modBuilder');
  mb.innerHTML = '';
  MOD_TYPES.forEach(m => {
    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '4px';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.dataset = chk.dataset || {};
    chk.dataset.mod = m;
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
      inp.value = mods[m];
    }
  });
}

function renderDialogPreview() {
  const prev = document.getElementById('dialogPreview');
  let tree = null;
  const txt = document.getElementById('npcTree').value.trim();
  if (txt) { try { tree = JSON.parse(txt); } catch (e) { tree = null; } }
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
    if (!imports && tree) imports = generateImportsShallow(tree);
    const flags = (imports && imports.flags) || [];
    const items = (imports && imports.items) || [];
    let html = '';
    if (flags.length) {
      html += '<div><b>Flags</b> ' + flags.map(f=>`<label style="margin-right:6px">${f}<input type="number" data-flag="${f}" value="1" min="0" style="width:56px;margin-left:4px"/></label>`).join('') + '</div>';
    }
    if (items.length) {
      html += '<div style="margin-top:4px"><b>Items</b> ' + items.map(it=>`<label style="margin-right:6px">${it}<input type="number" data-item="${it}" value="1" min="0" style="width:56px;margin-left:4px"/></label>`).join('') + '</div>';
    }
    importsEl.innerHTML = html || '<span class="muted">(no imports)</span>';
  }
  if (!tree || !tree.start) { prev.innerHTML = ''; return; }
  function show(id) {
    const node = tree[id]; if (!node) return;
    const html = (node.choices || [])
      .map(c => `<button class="btn" data-to="${c.to || ''}" style="margin-top:4px">${c.label}</button>`)
      .join('');
    prev.innerHTML = `<div>${node.text || ''}</div>` + html;
    Array.from(prev.querySelectorAll('button')).forEach(btn => btn.onclick = () => {
      const t = btn.dataset.to;
      if (t) show(t);
    });
  }
  show('start');
}

// Shallow imports generator (editor-only)
function generateImportsShallow(tree) {
  const flags = new Set();
  const items = new Set();
  Object.entries(tree || {}).forEach(([id, node]) => {
    if (id === 'imports') return;
    const choices = (node && node.choices) || [];
    choices.forEach(c => {
      if (c.if && c.if.flag) flags.add(c.if.flag);
      if (c.setFlag && c.setFlag.flag) flags.add(c.setFlag.flag);
      if (c.reqItem) items.add(c.reqItem);
      if (c.costItem) items.add(c.costItem);
      if (c.reward && typeof c.reward === 'string' && !/^xp|scrap/i.test(c.reward)) items.add(c.reward);
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
    if (!k) return;
    const num = v === '' ? 1 : (isNaN(Number(v)) ? 1 : Number(v));
    out[k] = num;
  });
  return out;
}

function buildSpoofFlagsFromPanel() {
  const panel = document.getElementById('spoofImports');
  if (!panel) return null;
  const inputs = panel.querySelectorAll('input[data-flag]');
  if (!inputs.length) return null;
  const out = {};
  inputs.forEach(inp => { const v = parseInt(inp.value, 10); out[inp.dataset.flag] = Number.isNaN(v) ? 1 : v; });
  return out;
}
function buildSpoofItemsFromPanel() {
  const panel = document.getElementById('spoofImports');
  if (!panel) return null;
  const inputs = panel.querySelectorAll('input[data-item]');
  if (!inputs.length) return null;
  const out = {};
  inputs.forEach(inp => { const v = parseInt(inp.value, 10); out[inp.dataset.item] = Number.isNaN(v) ? 1 : v; });
  return out;
}

function startSpoofPlayback(tree, flags, items) {
  if (!_origFlagValue) _origFlagValue = globalThis.flagValue;
  if (!_origCloseDialog) _origCloseDialog = globalThis.closeDialog;
  if (!_origHasItem) _origHasItem = globalThis.hasItem;
  if (!_origCountItems) _origCountItems = globalThis.countItems;
  globalThis.flagValue = function (flag) {
    if (Object.prototype.hasOwnProperty.call(flags || {}, flag)) return flags[flag] || 0;
    return _origFlagValue(flag);
  };
  const itemCounts = items || {};
  globalThis.hasItem = function(idOrTag){
    if (typeof idOrTag === 'string' && Object.prototype.hasOwnProperty.call(itemCounts, idOrTag)) return (itemCounts[idOrTag]||0) > 0;
    return _origHasItem(idOrTag);
  };
  globalThis.countItems = function(idOrTag){
    if (typeof idOrTag === 'string' && Object.prototype.hasOwnProperty.call(itemCounts, idOrTag)) return itemCounts[idOrTag]||0;
    return _origCountItems(idOrTag);
  };
  globalThis.closeDialog = function () {
    stopSpoofPlayback();
    _origCloseDialog();
  };
  const npc = { id: 'ack_preview', map: state.map, x: party.x, y: party.y, color: '#9ef7a0', name: 'Preview', title: '', desc: '', tree };
  openDialog(npc, 'start');
}
function stopSpoofPlayback() {
  if (_origFlagValue) { globalThis.flagValue = _origFlagValue; _origFlagValue = null; }
  if (_origCloseDialog) { globalThis.closeDialog = _origCloseDialog; _origCloseDialog = null; }
  if (_origHasItem) { globalThis.hasItem = _origHasItem; _origHasItem = null; }
  if (_origCountItems) { globalThis.countItems = _origCountItems; _origCountItems = null; }
}
function playInGameWithSpoof() {
  // Use imports panel values if present, else freeform field
  const txt = document.getElementById('npcTree').value.trim();
  if (!txt) return;
  let tree = null; try { tree = JSON.parse(txt); } catch (e) { alert('Invalid tree JSON'); return; }
  const flags = buildSpoofFlagsFromPanel() || parseSpoofFlags(document.getElementById('spoofFlags').value);
  const items = buildSpoofItemsFromPanel() || {};
  startSpoofPlayback(tree, flags, items);
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
      <label>Cost Slot<select class="choiceCostSlot"></select></label>`,
  req: `<label>Req Item<select class="choiceReqItem"></select></label>
      <label>Req Slot<select class="choiceReqSlot"></select></label>`,
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
      <label>Unlock NPC<select class="choiceUnlockNPC"></select></label>`,
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
  const { label = '', to = '', reward = '', stat = '', dc = '', success = '', failure = '', once = false, costItem = '', costSlot = '', reqItem = '', reqSlot = '', join = null, q = '', setFlag = null, spawn = null } = ch || {};
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
  const boardEff = effs.find(e => e.effect === 'boardDoor');
  const unboardEff = effs.find(e => e.effect === 'unboardDoor');
  const boardId = boardEff ? boardEff.interiorId || '' : '';
  const unboardId = unboardEff ? unboardEff.interiorId || '' : '';
  const lockEff = effs.find(e => e.effect === 'lockNPC');
  const unlockEff = effs.find(e => e.effect === 'unlockNPC');
  const lockId = lockEff ? lockEff.npcId || '' : '';
  const unlockId = unlockEff ? unlockEff.npcId || '' : '';
  const setFlagName = setFlag?.flag || '';
  const setFlagOp = setFlag?.op || 'set';
  const setFlagVal = setFlag?.value ?? '';
  const spawnTemplate = spawn?.templateId || '';
  const spawnX = spawn?.x ?? '';
  const spawnY = spawn?.y ?? '';
  const row = document.createElement('div');
  row.innerHTML = `<label>Label<input class="choiceLabel" value="${label}"/></label>
    <label>To<select class="choiceTo"></select></label>
    <button class="btn delChoice" type="button">x</button>
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
    if (opts.querySelector(`[data-adv="${type}"]`)) return;
    const div = document.createElement('div');
    div.dataset.adv = type;
    div.innerHTML = ADV_HTML[type] || '';
    const del = document.createElement('button');
    del.className = 'btn delAdv';
    del.type = 'button';
    del.textContent = 'x';
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
        if (npc && !nameEl.value) nameEl.value = npc.name;
        updateTreeData();
      });
    }
  }

  const advBtn = row.querySelector('.advAddBtn');
  advBtn.addEventListener('click', () => {
    const sel = row.querySelector('.advSelect');
    const type = sel.value;
    if (type) { addAdv(type); sel.value = ''; }
  });

  if (reward) {
    addAdv('reward');
    const rt = row.querySelector('.choiceRewardType');
    const xp = row.querySelector('.choiceRewardXP');
    const sc = row.querySelector('.choiceRewardScrap');
    const ri = row.querySelector('.choiceRewardItem');
    if (rt) rt.value = isXP ? 'xp' : isScrap ? 'scrap' : 'item';
    if (xp) xp.value = xpVal;
    if (sc) sc.value = scrapVal;
    if (ri) ri.value = itemVal;
    if (rt) rt.dispatchEvent(new Event('change'));
  }
  if (stat || dc || success || failure) {
    addAdv('stat');
    if (stat) row.querySelector('.choiceStat').value = stat;
    if (dc !== '') row.querySelector('.choiceDC').value = dc;
    if (success) row.querySelector('.choiceSuccess').value = success;
    if (failure) row.querySelector('.choiceFailure').value = failure;
  }
  if (costItem || costSlot) {
    addAdv('cost');
    if (costItem) row.querySelector('.choiceCostItem').value = costItem;
    if (costSlot) row.querySelector('.choiceCostSlot').value = costSlot;
  }
  if (reqItem || reqSlot) {
    addAdv('req');
    if (reqItem) row.querySelector('.choiceReqItem').value = reqItem;
    if (reqSlot) row.querySelector('.choiceReqSlot').value = reqSlot;
  }
  if (joinId || joinName || joinRole) {
    addAdv('join');
    if (joinId) row.querySelector('.choiceJoinId').value = joinId;
    if (joinName) row.querySelector('.choiceJoinName').value = joinName;
    if (joinRole) row.querySelector('.choiceJoinRole').value = joinRole;
  }
  if (gotoMap || gotoX !== '' || gotoY !== '' || gotoTarget === 'npc' || gotoRel) {
    addAdv('goto');
    row.querySelector('.choiceGotoTarget').value = gotoTarget;
    if (gotoMap) row.querySelector('.choiceGotoMap').value = gotoMap;
    if (gotoX !== '') row.querySelector('.choiceGotoX').value = gotoX;
    if (gotoY !== '') row.querySelector('.choiceGotoY').value = gotoY;
    if (gotoRel) row.querySelector('.choiceGotoRel').checked = true;
  }
  if (boardId || unboardId) {
    addAdv('doors');
    if (boardId) row.querySelector('.choiceBoard').value = boardId;
    if (unboardId) row.querySelector('.choiceUnboard').value = unboardId;
  }
  if (lockId || unlockId) {
    addAdv('npcLock');
    if (lockId) row.querySelector('.choiceLockNPC').value = lockId;
    if (unlockId) row.querySelector('.choiceUnlockNPC').value = unlockId;
  }
  if (setFlagName) {
    addAdv('flagEff');
    row.querySelector('.choiceSetFlagName').value = setFlagName;
    row.querySelector('.choiceSetFlagOp').value = setFlagOp;
    if (setFlagVal !== '') row.querySelector('.choiceSetFlagValue').value = setFlagVal;
  }
  if (spawnTemplate) {
    addAdv('spawn');
    row.querySelector('.choiceSpawnTemplate').value = spawnTemplate;
    if (spawnX !== '') row.querySelector('.choiceSpawnX').value = spawnX;
    if (spawnY !== '') row.querySelector('.choiceSpawnY').value = spawnY;
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
    if (ifOnceUsed) row.querySelector('.choiceIfOnceUsed').checked = true;
  }
  if (flag) {
    addAdv('condition');
    row.querySelector('.choiceFlag').value = flag;
    row.querySelector('.choiceOp').value = op;
    row.querySelector('.choiceVal').value = val;
  }
  const toSel = row.querySelector('.choiceTo');
  toSel.addEventListener('change', () => { if (toSel.value === '[new]') updateTreeData(); });
  row.querySelectorAll('input,textarea,select').forEach(el => el.addEventListener('input', updateTreeData));
  row.querySelectorAll('select').forEach(el => el.addEventListener('change', updateTreeData));
  row.querySelectorAll('input[type=checkbox]').forEach(el => el.addEventListener('change', updateTreeData));
  row.querySelector('.delChoice').addEventListener('click', () => { row.remove(); updateTreeData(); });
  refreshChoiceDropdowns();
}

function populateChoiceDropdown(sel, selected = '') {
  const keys = Object.keys(treeData);
  sel.innerHTML = '<option value=""></option><option value="[new]">[new]</option>' + keys.map(k => `<option value="${k}">${k}</option>`).join('');
  if (selected && !keys.includes(selected)) {
    sel.innerHTML += `<option value="${selected}" selected>${selected}</option>`;
  } else {
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

function populateItemDropdown(sel, selected = '') {
  sel.innerHTML = '<option value=""></option>' + moduleData.items.map(it => `<option value="${it.id}">${it.id}</option>`).join('');
  sel.value = selected;
}

function populateNPCDropdown(sel, selected = '') {
  sel.innerHTML = '<option value=""></option>' + moduleData.npcs.map(n => `<option value="${n.id}">${n.id}</option>`).join('');
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
  document.querySelectorAll('.choiceCostSlot').forEach(sel => populateSlotDropdown(sel, sel.value));
  document.querySelectorAll('.choiceReqSlot').forEach(sel => populateSlotDropdown(sel, sel.value));
  document.querySelectorAll('.choiceCostItem').forEach(sel => populateItemDropdown(sel, sel.value));
  document.querySelectorAll('.choiceReqItem').forEach(sel => populateItemDropdown(sel, sel.value));
  document.querySelectorAll('.choiceJoinId').forEach(sel => populateNPCDropdown(sel, sel.value));
  document.querySelectorAll('.choiceJoinRole').forEach(sel => populateRoleDropdown(sel, sel.value));
  document.querySelectorAll('.choiceGotoMap').forEach(sel => populateMapDropdown(sel, sel.value));
  document.querySelectorAll('.choiceRewardItem').forEach(sel => populateItemDropdown(sel, sel.value));
  document.querySelectorAll('.choiceBoard').forEach(sel => populateInteriorDropdown(sel, sel.value));
  document.querySelectorAll('.choiceUnboard').forEach(sel => populateInteriorDropdown(sel, sel.value));
  document.querySelectorAll('.choiceLockNPC').forEach(sel => populateNPCDropdown(sel, sel.value));
  document.querySelectorAll('.choiceUnlockNPC').forEach(sel => populateNPCDropdown(sel, sel.value));
  document.querySelectorAll('.choiceSpawnTemplate').forEach(sel => populateTemplateDropdown(sel, sel.value));
  const encLoot = document.getElementById('encLoot');
  if (encLoot) populateItemDropdown(encLoot, encLoot.value);
  const encTemplate = document.getElementById('encTemplate');
  if (encTemplate) populateTemplateDropdown(encTemplate, encTemplate.value);
}

function renderTreeEditor() {
  const wrap = document.getElementById('treeEditor');
  if (!wrap) return;
  wrap.innerHTML = '';
  Object.entries(treeData).forEach(([id, node]) => {
    const div = document.createElement('div');
    div.className = 'node';
    div.innerHTML = `<div class="nodeHeader"><button class="btn toggle" type="button">-</button><label>Node ID<input class="nodeId" value="${id}"></label><button class="btn delNode" type="button" title="Delete node">&#128465;</button></div><div class="nodeBody"><label>Dialog Text<textarea class="nodeText" rows="2">${node.text || ''}</textarea></label><fieldset class="choiceGroup"><legend>Choices</legend><div class="choices"></div><button class="btn addChoice" type="button">Add Choice</button></fieldset></div>`;
    const choicesDiv = div.querySelector('.choices');
    (node.choices || []).forEach(ch => addChoiceRow(choicesDiv, ch));
    div.querySelector('.addChoice').onclick = () => addChoiceRow(choicesDiv);
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
}

function updateTreeData() {
  const wrap = document.getElementById('treeEditor');
  const newTree = {};
  const choiceRefs = [];
  const nodeRefs = {};

  // Build tree from editor UI. Preserve collapsed nodes by keeping previous snapshot.
  wrap.querySelectorAll('.node').forEach(nodeEl => {
    const id = nodeEl.querySelector('.nodeId').value.trim();
    if (!id) return;

    nodeRefs[id] = nodeEl;

    // If collapsed, keep previous data for this node (don’t overwrite)
    if (nodeEl.classList.contains('collapsed')) {
      if (treeData[id]) newTree[id] = treeData[id];
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
      if (rewardType === 'xp' && xpTxt) reward = `XP ${parseInt(xpTxt, 10)}`;
      else if (rewardType === 'scrap' && scrapTxt) reward = `SCRAP ${parseInt(scrapTxt, 10)}`;
      else if (rewardType === 'item' && itemReward) reward = itemReward;
      const stat = chEl.querySelector('.choiceStat')?.value.trim() || '';
      const dcTxt = chEl.querySelector('.choiceDC')?.value.trim() || '';
      const dc = dcTxt ? parseInt(dcTxt, 10) : undefined;
      const success = chEl.querySelector('.choiceSuccess')?.value.trim() || '';
      const failure = chEl.querySelector('.choiceFailure')?.value.trim() || '';
      const costItem = chEl.querySelector('.choiceCostItem')?.value.trim() || '';
      const costSlot = chEl.querySelector('.choiceCostSlot')?.value.trim() || '';
      const reqItem = chEl.querySelector('.choiceReqItem')?.value.trim() || '';
      const reqSlot = chEl.querySelector('.choiceReqSlot')?.value.trim() || '';
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
        while (newTree[cand] || treeData[cand]) { cand = base + '-' + i++; }
        if (!newTree[cand]) newTree[cand] = { text: '', choices: [{ label: '(Leave)', to: 'bye' }] };
        to = cand;
        populateChoiceDropdown(toEl, to);
      }

      if (label) {
        const c = { label };
        if (to) c.to = to;
        if (reward) c.reward = reward;
        if (stat) c.stat = stat;
        if (dc != null && !Number.isNaN(dc)) c.dc = dc;
        if (success) c.success = success;
        if (failure) c.failure = failure;
        if (costItem) c.costItem = costItem;
        if (costSlot) c.costSlot = costSlot;
        if (reqItem) c.reqItem = reqItem;
        if (reqSlot) c.reqSlot = reqSlot;
        if (joinId || joinName || joinRole) c.join = { id: joinId, name: joinName, role: joinRole };
        if (gotoMap || gotoXTxt || gotoYTxt || gotoTarget === 'npc' || gotoRel) {
          const go = {};
          if (gotoMap) go.map = gotoMap;
          const gx = gotoXTxt ? parseInt(gotoXTxt, 10) : undefined;
          const gy = gotoYTxt ? parseInt(gotoYTxt, 10) : undefined;
          if (gx != null && !Number.isNaN(gx)) go.x = gx;
          if (gy != null && !Number.isNaN(gy)) go.y = gy;
          if (gotoTarget === 'npc') go.target = 'npc';
          if (gotoRel) go.rel = true;
          c.goto = go;
        }
        if (q) c.q = q;
        if (once) c.once = true;
        if (ifOnceNode && ifOnceLabel) {
          c.ifOnce = { node: ifOnceNode, label: ifOnceLabel };
          if (ifOnceUsed) c.ifOnce.used = true;
        }
      const boardId = chEl.querySelector('.choiceBoard')?.value.trim();
      const unboardId = chEl.querySelector('.choiceUnboard')?.value.trim();
      const lockNpc = chEl.querySelector('.choiceLockNPC')?.value.trim();
      const unlockNpc = chEl.querySelector('.choiceUnlockNPC')?.value.trim();
      if (flag) c.if = { flag, op, value: val != null && !Number.isNaN(val) ? val : 0 };
      const effs = [];
      if (boardId) effs.push({ effect: 'boardDoor', interiorId: boardId });
      if (unboardId) effs.push({ effect: 'unboardDoor', interiorId: unboardId });
      if (lockNpc) effs.push({ effect: 'lockNPC', npcId: lockNpc });
      if (unlockNpc) effs.push({ effect: 'unlockNPC', npcId: unlockNpc });
      if (effs.length) c.effects = effs;
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
  } else if (newTree.imports) {
    delete newTree.imports;
  }
  treeData = newTree;
  document.getElementById('npcTree').value = JSON.stringify(treeData, null, 2);

  // Live preview + keep "to" dropdowns in sync with current node keys
  renderDialogPreview();
  refreshChoiceDropdowns();

  // ---- Validation: highlight bad targets & orphans ----

  // 1) Choice target validation: red border if target doesn't exist
  choiceRefs.forEach(({ to, el }) => {
    el.style.borderColor = (to && !treeData[to]) ? 'red' : '';
  });

  // 2) Reachability from 'start' (orange outline for orphan nodes)
  const visited = new Set();
  const visit = id => {
    if (visited.has(id) || !treeData[id]) return;
    visited.add(id);
    (treeData[id].choices || []).forEach(c => { if (c.to) visit(c.to); });
  };
  visit('start');

  const orphans = [];
  Object.entries(nodeRefs).forEach(([id, nodeEl]) => {
    if (!visited.has(id)) {
      nodeEl.style.borderColor = 'orange';
      orphans.push(id);
    } else {
      nodeEl.style.borderColor = '';
    }
  });

  const warnEl = document.getElementById('treeWarning');
  if (warnEl) warnEl.textContent = orphans.length ? `Orphan nodes: ${orphans.join(', ')}` : '';
}

function loadTreeEditor() {
  let txt = document.getElementById('npcTree').value.trim();
  try { treeData = txt ? JSON.parse(txt) : {}; } catch (e) { treeData = {}; }
  renderTreeEditor();
  updateTreeData();
}

function openDialogEditor() {
  document.getElementById('dialogModal').classList.add('shown');
  renderTreeEditor();
}

function closeDialogEditor() {
  document.getElementById('dialogModal').classList.remove('shown');
  const dlgEl = document.getElementById('npcDialog');
  if (!dlgEl.value.trim()) dlgEl.value = treeData.start?.text || '';
  applyNPCChanges();
}

function toggleQuestDialogBtn() {
  const btn = document.getElementById('genQuestDialog');
  btn.style.display = document.getElementById('npcQuest').value ? 'block' : 'none';
}

function addNode() {
  const id = Object.keys(treeData).length ? 'node' + Object.keys(treeData).length : 'start';
  treeData[id] = { text: '', choices: [{ label: '(Leave)', to: 'bye' }] };
  renderTreeEditor();
  updateTreeData();
}

function generateQuestTree() {
  const quest = document.getElementById('npcQuest').value.trim();
  if (!quest) return;
  const dialog = document.getElementById('npcDialog').value.trim();
  const accept = document.getElementById('npcAccept').value.trim();
  const turnin = document.getElementById('npcTurnin').value.trim();
  const tree = {
    start: { text: dialog, choices: [{ label: 'Accept quest', to: 'accept', q: 'accept' }, { label: 'Turn in', to: 'do_turnin', q: 'turnin' }, { label: '(Leave)', to: 'bye' }] },
    accept: { text: accept || 'Good luck.', choices: [{ label: '(Leave)', to: 'bye' }] },
    do_turnin: { text: turnin || 'Thanks for helping.', choices: [{ label: '(Leave)', to: 'bye' }] }
  };
  document.getElementById('npcTree').value = JSON.stringify(tree, null, 2);
  loadTreeEditor();
}

function toggleQuestTextWrap() {
  const wrap = document.getElementById('questTextWrap');
  wrap.style.display = document.getElementById('npcQuest').value ? 'block' : 'none';
}

// --- NPCs ---
const npcPortraits = [null, ...Array.from({ length: 90 }, (_, i) => `assets/portraits/portrait_${1000 + i}.png`)];
let npcPortraitIndex = 0;
let npcPortraitPath = '';
function setNpcPortrait() {
  const el = document.getElementById('npcPort');
  const img = npcPortraitPath || npcPortraits[npcPortraitIndex];
  if (el) el.style.backgroundImage = img ? `url(${img})` : '';
}
function applyCombatTree(tree) {
  tree.start = tree.start || { text: '', choices: [] };
  if (!tree.start.choices.some(c => c.to === 'do_fight'))
    tree.start.choices.unshift({ label: '(Fight)', to: 'do_fight' });
  tree.do_fight = tree.do_fight || { text: '', choices: [{ label: '(Continue)', to: 'bye' }] };
}
function removeCombatTree(tree) {
  if (tree.start && Array.isArray(tree.start.choices))
    tree.start.choices = tree.start.choices.filter(c => c.to !== 'do_fight');
  delete tree.do_fight;
}
function updateNPCOptSections() {
  document.getElementById('combatOpts').style.display =
    document.getElementById('npcCombat').checked ? 'block' : 'none';
  document.getElementById('shopOpts').style.display =
    document.getElementById('npcShop').checked ? 'block' : 'none';
  document.getElementById('revealOpts').style.display =
    document.getElementById('npcHidden').checked ? 'block' : 'none';
}

function renderLoopFields(pts) {
  const wrap = document.getElementById('npcLoopPts');
  if (!wrap) return;
  wrap.innerHTML = '';
  pts.forEach((p, i) => {
    const row = document.createElement('div');
    row.className = 'row loopPoint';
    row.innerHTML = `<label>X<input type="number" class="loopX" value="${p.x}" /></label>` +
      `<label>Y<input type="number" class="loopY" value="${p.y}" /></label>`;
    const del = document.createElement('span');
    del.textContent = '-';
    del.className = 'pill';
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
    if (!isNaN(x) && !isNaN(y)) pts.push({ x, y });
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
      if (ev.effect === 'addFlag' && ev.flag) flags.add(ev.flag);
    });
  });
  return [...flags];
}
function populateFlagList() {
  const flags = gatherEventFlags().map(f => `<option value="${f}"></option>`).join('');
  const npcList = document.getElementById('npcFlagList');
  if (npcList) npcList.innerHTML = flags;
  const choiceList = document.getElementById('choiceFlagList');
  if (choiceList) choiceList.innerHTML = flags;
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
}
function startNewNPC() {
  editNPCIdx = -1;
  document.getElementById('npcId').value = nextId('npc', moduleData.npcs);
  document.getElementById('npcName').value = '';
  document.getElementById('npcTitle').value = '';
  document.getElementById('npcDesc').value = '';
  document.getElementById('npcColor').value = '#9ef7a0';
  document.getElementById('npcSymbol').value = '!';
  populateMapDropdown(document.getElementById('npcMap'), 'world');
  document.getElementById('npcX').value = 0;
  document.getElementById('npcY').value = 0;
  renderLoopFields([]);
  npcPortraitIndex = 0;
  npcPortraitPath = '';
  setNpcPortrait();
  document.getElementById('npcPortraitLock').checked = true;
  document.getElementById('npcHidden').checked = false;
  document.getElementById('npcLocked').checked = false;
  document.getElementById('npcFlagType').value = 'visits';
  document.getElementById('npcFlagMap').value = 'world';
  document.getElementById('npcFlagX').value = 0;
  document.getElementById('npcFlagY').value = 0;
  document.getElementById('npcFlagName').value = '';
  document.getElementById('npcOp').value = '>=';
  document.getElementById('npcVal').value = 1;
  populateFlagList();
  updateFlagBuilder();
  document.getElementById('npcDialog').value = '';
  document.getElementById('npcQuest').value = '';
  document.getElementById('npcAccept').value = 'Good luck.';
  document.getElementById('npcTurnin').value = 'Thanks for helping.';
  toggleQuestTextWrap();
  document.getElementById('npcTree').value = '';
  document.getElementById('npcHP').value = 5;
  document.getElementById('npcATK').value = 0;
  document.getElementById('npcDEF').value = 0;
  document.getElementById('npcLoot').value = '';
  document.getElementById('npcBoss').checked = false;
  document.getElementById('npcSpecialCue').value = '';
  document.getElementById('npcSpecialDmg').value = '';
  document.getElementById('npcSpecialDelay').value = '';
  document.getElementById('npcCombat').checked = false;
  document.getElementById('npcShop').checked = false;
  document.getElementById('shopMarkup').value = 2;
  updateNPCOptSections();
  document.getElementById('addNPC').style.display = 'block';
  document.getElementById('cancelNPC').style.display = 'none';
  document.getElementById('delNPC').style.display = 'none';
  loadTreeEditor();
  toggleQuestDialogBtn();
  placingType = null;
  placingPos = null;
  selectedObj = null;
  drawWorld();
  showNPCEditor(true);
  const npcIdEl = document.getElementById('npcId');
  if (npcIdEl && typeof npcIdEl.focus === 'function') npcIdEl.focus();
}

function beginPlaceNPC() {
  clearPaletteSelection();
  placingType = 'npc';
  placingPos = null;
  placingCb = addNPC;
  document.getElementById('addNPC').style.display = 'none';
  document.getElementById('cancelNPC').style.display = 'block';
  selectedObj = null;
  drawWorld();
}
// Gather NPC form fields into an object
function collectNPCFromForm() {
  const id = document.getElementById('npcId').value.trim();
  const name = document.getElementById('npcName').value.trim();
  const title = document.getElementById('npcTitle').value.trim();
  const desc = document.getElementById('npcDesc').value.trim();
  const color = document.getElementById('npcColor').value.trim() || '#fff';
  const symbol = document.getElementById('npcSymbol').value.trim().charAt(0) || '!';
  const map = document.getElementById('npcMap').value.trim() || 'world';
  const x = parseInt(document.getElementById('npcX').value, 10) || 0;
  const y = parseInt(document.getElementById('npcY').value, 10) || 0;
  const dialog = document.getElementById('npcDialog').value.trim();
  const questId = document.getElementById('npcQuest').value.trim();
  const accept = document.getElementById('npcAccept').value.trim();
  const turnin = document.getElementById('npcTurnin').value.trim();
  const combat = document.getElementById('npcCombat').checked;
  const shop = document.getElementById('npcShop').checked;
  const shopMarkup = parseInt(document.getElementById('shopMarkup').value, 10) || 2;
  const hidden = document.getElementById('npcHidden').checked;
  const locked = document.getElementById('npcLocked').checked;
  const portraitLock = document.getElementById('npcPortraitLock').checked;
  const flag = getRevealFlag();
  const op = document.getElementById('npcOp').value;
  const val = parseInt(document.getElementById('npcVal').value, 10) || 0;
  updateTreeData();
  let tree = null;
  const treeTxt = document.getElementById('npcTree').value.trim();
  if (treeTxt) { try { tree = JSON.parse(treeTxt); } catch (e) { tree = null; } }
  if (!tree || !Object.keys(tree).length) {
    if (questId) {
      tree = {
        start: { text: dialog, choices: [{ label: 'Accept quest', to: 'accept', q: 'accept' }, { label: 'Turn in', to: 'do_turnin', q: 'turnin' }, { label: '(Leave)', to: 'bye' }] },
        accept: { text: accept || 'Good luck.', choices: [{ label: '(Leave)', to: 'bye' }] },
        do_turnin: { text: turnin || 'Thanks for helping.', choices: [{ label: '(Leave)', to: 'bye' }] }
      };
    } else {
      tree = { start: { text: dialog, choices: [{ label: '(Leave)', to: 'bye' }] } };
    }
  }
  if (tree.start) tree.start.text = dialog;
  if (tree.accept) tree.accept.text = accept || tree.accept.text;
  if (tree.do_turnin) tree.do_turnin.text = turnin || tree.do_turnin.text;
  if (combat) applyCombatTree(tree); else removeCombatTree(tree);
  document.getElementById('npcTree').value = JSON.stringify(tree, null, 2);
  loadTreeEditor();

  const npc = { id, name, title, desc, color, symbol, map, x, y, tree, questId };
  const pts = gatherLoopFields();
  if (pts.length >= 2) npc.loop = pts;
  if (combat) {
    const HP = parseInt(document.getElementById('npcHP').value, 10) || 1;
    const ATK = parseInt(document.getElementById('npcATK').value, 10) || 0;
    const DEF = parseInt(document.getElementById('npcDEF').value, 10) || 0;
    const loot = document.getElementById('npcLoot').value.trim();
    const boss = document.getElementById('npcBoss').checked;
    const cue = document.getElementById('npcSpecialCue').value.trim();
    const dmg = parseInt(document.getElementById('npcSpecialDmg').value, 10);
    const delay = parseInt(document.getElementById('npcSpecialDelay').value, 10);
    npc.combat = { HP, ATK, DEF };
    if (loot) npc.combat.loot = loot;
    if (boss) npc.combat.boss = true;
    if (cue || !isNaN(dmg) || !isNaN(delay)) {
      npc.combat.special = {};
      if (cue) npc.combat.special.cue = cue;
      if (!isNaN(dmg)) npc.combat.special.dmg = dmg;
      if (!isNaN(delay)) npc.combat.special.delay = delay;
    }
  }
  if (shop) npc.shop = { markup: shopMarkup, inv: [] };
  if (hidden && flag) npc.hidden = true, npc.reveal = { flag, op, value: val };
  if (npcPortraitPath) npc.portraitSheet = npcPortraitPath;
  else if (npcPortraitIndex > 0) npc.portraitSheet = npcPortraits[npcPortraitIndex];
  if (!portraitLock) npc.portraitLock = false;
  if (locked) npc.locked = true;
  return npc;
}

// Add a new NPC to the module and begin editing it
function addNPC() {
  const npc = collectNPCFromForm();
  moduleData.npcs.push(npc);
  editNPCIdx = moduleData.npcs.length - 1;
  renderNPCList();
  document.getElementById('delNPC').style.display = 'block';
  document.getElementById('addNPC').style.display = 'none';
  selectedObj = { type: 'npc', obj: npc };
  drawWorld();
  drawInterior();
}

function cancelNPC() {
  placingType = null;
  placingPos = null;
  placingCb = null;
  document.getElementById('addNPC').style.display = 'block';
  document.getElementById('cancelNPC').style.display = 'none';
  drawWorld();
  drawInterior();
  updateCursor();
}

// Update the currently edited NPC as form fields change
function applyNPCChanges() {
  if (editNPCIdx < 0) return;
  const npc = collectNPCFromForm();
  moduleData.npcs[editNPCIdx] = npc;
  renderNPCList();
  selectedObj = { type: 'npc', obj: npc };
  drawWorld();
  drawInterior();
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
  document.getElementById('npcColor').value = expandHex(n.color || '#ffffff');
  document.getElementById('npcSymbol').value = n.symbol || '!';
  populateMapDropdown(document.getElementById('npcMap'), n.map);
  document.getElementById('npcX').value = n.x;
  document.getElementById('npcY').value = n.y;
  renderLoopFields(n.loop || []);
  npcPortraitIndex = npcPortraits.indexOf(n.portraitSheet);
  if (npcPortraitIndex < 0) {
    npcPortraitIndex = 0;
    npcPortraitPath = n.portraitSheet || '';
  } else {
    npcPortraitPath = '';
  }
  setNpcPortrait();
  document.getElementById('npcPortraitLock').checked = n.portraitLock !== false;
  document.getElementById('npcHidden').checked = !!n.hidden;
  document.getElementById('npcLocked').checked = !!n.locked;
  if (n.reveal?.flag?.startsWith('visits@')) {
    document.getElementById('npcFlagType').value = 'visits';
    const parts = n.reveal.flag.split('@');
    document.getElementById('npcFlagMap').value = parts[1] || 'world';
    const [fx, fy] = (parts[2] || '0,0').split(',');
    document.getElementById('npcFlagX').value = fx;
    document.getElementById('npcFlagY').value = fy;
  } else {
    document.getElementById('npcFlagType').value = 'party';
    document.getElementById('npcFlagName').value = n.reveal?.flag || '';
  }
  document.getElementById('npcOp').value = n.reveal?.op || '>=';
  document.getElementById('npcVal').value = n.reveal?.value ?? 1;
  populateFlagList();
  updateFlagBuilder();
  document.getElementById('npcDialog').value = n.tree?.start?.text || '';
  document.getElementById('npcQuest').value = n.questId || '';
  document.getElementById('npcAccept').value = n.tree?.accept?.text || 'Good luck.';
  document.getElementById('npcTurnin').value = n.tree?.do_turnin?.text || 'Thanks for helping.';
  toggleQuestTextWrap();
  document.getElementById('npcTree').value = JSON.stringify(n.tree, null, 2);
  document.getElementById('npcHP').value = n.combat?.HP ?? 1;
  document.getElementById('npcATK').value = n.combat?.ATK ?? 0;
  document.getElementById('npcDEF').value = n.combat?.DEF ?? 0;
  document.getElementById('npcLoot').value = n.combat?.loot || '';
  document.getElementById('npcBoss').checked = !!n.combat?.boss;
  document.getElementById('npcSpecialCue').value = n.combat?.special?.cue || '';
  document.getElementById('npcSpecialDmg').value = n.combat?.special?.dmg ?? '';
  document.getElementById('npcSpecialDelay').value = n.combat?.special?.delay ?? '';
  document.getElementById('npcCombat').checked = !!n.combat;
  document.getElementById('npcShop').checked = !!n.shop;
  document.getElementById('shopMarkup').value = n.shop ? n.shop.markup || 2 : 2;
  updateNPCOptSections();
  document.getElementById('addNPC').style.display = 'none';
  document.getElementById('cancelNPC').style.display = 'none';
  document.getElementById('delNPC').style.display = 'block';
  loadTreeEditor();
  toggleQuestDialogBtn();
  showNPCEditor(true);
  selectedObj = { type: 'npc', obj: n };
  drawWorld();
  renderNPCList();
}
function renderNPCList() {
  const list = document.getElementById('npcList');
  const npcs = moduleData.npcs.map((n, i) => ({ n, i })).sort((a, b) => a.n.id.localeCompare(b.n.id));
  list.innerHTML = npcs.map(({ n, i }) => `<div data-idx="${i}">${n.id} @${n.map} (${n.x},${n.y})${n.questId ? ` [${n.questId}]` : ''}</div>`).join('');
  Array.from(list.children).forEach(div => {
    const idx = parseInt(div.dataset.idx, 10);
    div.onclick = () => editNPC(idx);
    if (idx === editNPCIdx) {
      div.style.outline = '1px solid #4f6b4f';
      div.style.background = '#141a14';
      div.scrollIntoView({ block: 'nearest' });
    }
  });
  updateQuestOptions();
  refreshChoiceDropdowns();
  renderProblems();
}

function deleteNPC() {
  if (editNPCIdx < 0) return;
  confirmDialog('Delete this NPC?', () => {
    moduleData.npcs.splice(editNPCIdx, 1);
    editNPCIdx = -1;
    document.getElementById('addNPC').style.display = 'block';
    document.getElementById('cancelNPC').style.display = 'none';
    document.getElementById('delNPC').style.display = 'none';
    renderNPCList();
    selectedObj = null;
    drawWorld();
    document.getElementById('npcId').value = nextId('npc', moduleData.npcs);
    document.getElementById('npcDesc').value = '';
    loadTreeEditor();
    showNPCEditor(false);
  });
}

function closeNPCEditor() {
  editNPCIdx = -1;
  selectedObj = null;
  placingType = null;
  showNPCEditor(false);
  document.getElementById('addNPC').style.display = 'block';
  document.getElementById('cancelNPC').style.display = 'none';
  document.getElementById('delNPC').style.display = 'none';
}

// --- Items ---
function showItemEditor(show) {
  document.getElementById('itemEditor').style.display = show ? 'block' : 'none';
}

function updateModsWrap() {
  const slot = document.getElementById('itemSlot').value;
  document.getElementById('modsWrap').style.display =
    ['weapon', 'armor', 'trinket'].includes(slot) ? 'block' : 'none';
}
function updateUseWrap() {
  const type = document.getElementById('itemUseType').value;
  document.getElementById('itemUseAmtWrap').style.display = type === 'heal' ? 'block' : 'none';
  document.getElementById('itemUseWrap').style.display = type ? 'none' : 'block';
}
function startNewItem() {
  editItemIdx = -1;
  document.getElementById('itemName').value = '';
  document.getElementById('itemId').value = '';
  document.getElementById('itemType').value = '';
  document.getElementById('itemDesc').value = '';
  document.getElementById('itemTags').value = '';
  document.getElementById('itemMap').value = 'world';
  document.getElementById('itemX').value = 0;
  document.getElementById('itemY').value = 0;
  document.getElementById('itemSlot').value = '';
  updateModsWrap();
  loadMods({});
  document.getElementById('itemValue').value = 0;
  document.getElementById('itemEquip').value = '';
  document.getElementById('itemUseType').value = '';
  document.getElementById('itemUseAmount').value = 0;
  document.getElementById('itemUse').value = '';
  updateUseWrap();
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
  const name = document.getElementById('itemName').value.trim();
  const id = document.getElementById('itemId').value.trim();
  const type = document.getElementById('itemType').value.trim();
  const desc = document.getElementById('itemDesc').value.trim();
  const tags = document.getElementById('itemTags').value.split(',').map(t=>t.trim()).filter(Boolean);
  const map = document.getElementById('itemMap').value.trim() || 'world';
  const x = parseInt(document.getElementById('itemX').value, 10) || 0;
  const y = parseInt(document.getElementById('itemY').value, 10) || 0;
  const slot = document.getElementById('itemSlot').value || null;
  const mods = collectMods();
  const value = parseInt(document.getElementById('itemValue').value, 10) || 0;
  let equip = null;
  try { equip = JSON.parse(document.getElementById('itemEquip').value || 'null'); } catch (e) { equip = null; }
  let use = null;
  const useType = document.getElementById('itemUseType').value;
  if (useType === 'heal') {
    const amt = parseInt(document.getElementById('itemUseAmount').value, 10) || 0;
    use = { type: 'heal', amount: amt };
  } else {
    try { use = JSON.parse(document.getElementById('itemUse').value || 'null'); } catch (e) { use = null; }
  }
  const item = { id, name, desc, type, tags, map, x, y, slot, mods, value, use, equip };
  if (editItemIdx >= 0) {
    moduleData.items[editItemIdx] = item;
  } else {
    moduleData.items.push(item);
  }
  editItemIdx = -1;
  document.getElementById('addItem').textContent = 'Add Item';
  document.getElementById('addItem').style.display = 'block';
  document.getElementById('cancelItem').style.display = 'none';
  document.getElementById('delItem').style.display = 'none';
  loadMods({});
  renderItemList();
  selectedObj = null;
  drawWorld();
  drawInterior();
  showItemEditor(false);
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
function editItem(i) {
  const it = moduleData.items[i];
  showMap(it.map);
  focusMap(it.x, it.y);
  editItemIdx = i;
  document.getElementById('itemName').value = it.name;
  document.getElementById('itemId').value = it.id;
  document.getElementById('itemType').value = it.type || '';
  document.getElementById('itemDesc').value = it.desc || '';
  document.getElementById('itemTags').value = (it.tags || []).join(',');
  document.getElementById('itemMap').value = it.map;
  document.getElementById('itemX').value = it.x;
  document.getElementById('itemY').value = it.y;
  document.getElementById('itemSlot').value = it.slot || '';
  updateModsWrap();
  loadMods(it.mods);
  document.getElementById('itemValue').value = it.value || 0;
  document.getElementById('itemEquip').value = it.equip ? JSON.stringify(it.equip, null, 2) : '';
  if (it.use && it.use.type === 'heal') {
    document.getElementById('itemUseType').value = 'heal';
    document.getElementById('itemUseAmount').value = it.use.amount || 0;
    document.getElementById('itemUse').value = '';
  } else {
    document.getElementById('itemUseType').value = '';
    document.getElementById('itemUseAmount').value = 0;
    document.getElementById('itemUse').value = it.use ? JSON.stringify(it.use, null, 2) : '';
  }
  updateUseWrap();
  document.getElementById('addItem').textContent = 'Update Item';
  document.getElementById('delItem').style.display = 'block';
  document.getElementById('cancelItem').style.display = 'none';
  showItemEditor(true);
  selectedObj = { type: 'item', obj: it };
  drawWorld();
}
function renderItemList() {
  const list = document.getElementById('itemList');
  const items = moduleData.items.map((it, i) => ({ it, i })).sort((a, b) => a.it.name.localeCompare(b.it.name));
  list.innerHTML = items.map(({ it, i }) => `<div data-idx="${i}">${it.name} @${it.map} (${it.x},${it.y})</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editItem(parseInt(div.dataset.idx, 10)));
  refreshChoiceDropdowns();
  renderProblems();
}

function deleteItem() {
  if (editItemIdx < 0) return;
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

// --- Encounters ---
function showEncounterEditor(show){
  document.getElementById('encounterEditor').style.display = show ? 'block' : 'none';
}
function startNewEncounter(){
  editEncounterIdx = -1;
  document.getElementById('encMap').value = 'world';
  document.getElementById('encMinDist').value = '';
  document.getElementById('encMaxDist').value = '';
  const tmplSel = document.getElementById('encTemplate');
  populateTemplateDropdown(tmplSel, '');
  populateItemDropdown(document.getElementById('encLoot'), '');
  document.getElementById('addEncounter').textContent = 'Add Enemy';
  document.getElementById('delEncounter').style.display = 'none';
  showEncounterEditor(true);
  tmplSel.focus();
}
function collectEncounter(){
  const map = document.getElementById('encMap').value.trim() || 'world';
  const templateId = document.getElementById('encTemplate').value.trim();
  const minDist = parseInt(document.getElementById('encMinDist').value,10) || 0;
  const maxDist = parseInt(document.getElementById('encMaxDist').value,10) || 0;
  const loot = document.getElementById('encLoot').value.trim();
  const entry = { map, templateId, loot, minDist, maxDist };
  return entry;
}
function addEncounter(){
  const entry = collectEncounter();
  if(editEncounterIdx >= 0){ moduleData.encounters[editEncounterIdx] = entry; }
  else moduleData.encounters.push(entry);
  editEncounterIdx = -1;
  document.getElementById('addEncounter').textContent = 'Add Enemy';
  document.getElementById('delEncounter').style.display = 'none';
  renderEncounterList();
  showEncounterEditor(false);
}
function editEncounter(i){
  const e = moduleData.encounters[i];
  editEncounterIdx = i;
  document.getElementById('encMap').value = e.map;
  populateTemplateDropdown(document.getElementById('encTemplate'), e.templateId || '');
  document.getElementById('encMinDist').value = e.minDist || '';
  document.getElementById('encMaxDist').value = e.maxDist || '';
  populateItemDropdown(document.getElementById('encLoot'), e.loot || '');
  document.getElementById('addEncounter').textContent = 'Update Enemy';
  document.getElementById('delEncounter').style.display = 'block';
  showEncounterEditor(true);
}
function renderEncounterList(){
  const list = document.getElementById('encounterList');
  list.innerHTML = moduleData.encounters.map((e,i)=>{
    const t = moduleData.templates.find(t => t.id === e.templateId);
    const name = t ? t.name : e.templateId;
    return `<div data-idx="${i}">${e.map}: ${name}</div>`;
  }).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editEncounter(parseInt(div.dataset.idx,10)));
}
function deleteEncounter(){
  if(editEncounterIdx < 0) return;
  confirmDialog('Delete this enemy?', () => {
    moduleData.encounters.splice(editEncounterIdx,1);
    editEncounterIdx = -1;
    document.getElementById('addEncounter').textContent = 'Add Enemy';
    document.getElementById('delEncounter').style.display = 'none';
    renderEncounterList();
    showEncounterEditor(false);
  });
}

// --- NPC Templates ---
function showTemplateEditor(show){
  document.getElementById('templateEditor').style.display = show ? 'block' : 'none';
}
function startNewTemplate(){
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
  populateItemDropdown(document.getElementById('templateLoot'), '');
  document.getElementById('templateRequires').value = '';
  document.getElementById('addTemplate').textContent = 'Add Template';
  document.getElementById('delTemplate').style.display = 'none';
  showTemplateEditor(true);
}
function collectTemplate(){
  const id = document.getElementById('templateId').value.trim();
  const name = document.getElementById('templateName').value.trim();
  const desc = document.getElementById('templateDesc').value.trim();
  const color = document.getElementById('templateColor').value.trim();
  const portraitSheet = document.getElementById('templatePortrait').value.trim();
  const HP = parseInt(document.getElementById('templateHP').value,10) || 1;
  const ATK = parseInt(document.getElementById('templateATK').value,10) || 1;
  const DEF = parseInt(document.getElementById('templateDEF').value,10) || 0;
  const challenge = parseInt(document.getElementById('templateChallenge').value,10) || 0;
  const specialCue = document.getElementById('templateSpecialCue').value.trim();
  const specialDmg = parseInt(document.getElementById('templateSpecialDmg').value,10) || 0;
  const loot = document.getElementById('templateLoot').value.trim();
  const requires = document.getElementById('templateRequires').value.trim();
  const combat = { HP, ATK, DEF };
  if (challenge) combat.challenge = challenge;
  if (loot) combat.loot = loot;
  if (requires) combat.requires = requires;
  if (specialCue || specialDmg) {
    combat.special = {};
    if (specialCue) combat.special.cue = specialCue;
    if (specialDmg) combat.special.dmg = specialDmg;
  }
  return { id, name, desc, color, portraitSheet, combat };
}
function addTemplate(){
  const entry = collectTemplate();
  if(editTemplateIdx >= 0){ moduleData.templates[editTemplateIdx] = entry; }
  else moduleData.templates.push(entry);
  editTemplateIdx = -1;
  document.getElementById('addTemplate').textContent = 'Add Template';
  document.getElementById('delTemplate').style.display = 'none';
  renderTemplateList();
  showTemplateEditor(false);
}
function editTemplate(i){
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
  populateItemDropdown(document.getElementById('templateLoot'), t.combat?.loot || '');
  document.getElementById('templateRequires').value = t.combat?.requires || '';
  document.getElementById('addTemplate').textContent = 'Update Template';
  document.getElementById('delTemplate').style.display = 'block';
  showTemplateEditor(true);
}
function renderTemplateList(){
  const list = document.getElementById('templateList');
  list.innerHTML = moduleData.templates.map((t,i)=>`<div data-idx="${i}">${t.id}</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editTemplate(parseInt(div.dataset.idx,10)));
  refreshChoiceDropdowns();
}
function deleteTemplate(){
  if(editTemplateIdx < 0) return;
  confirmDialog('Delete this template?', () => {
    moduleData.templates.splice(editTemplateIdx,1);
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
  document.getElementById('eventMap').value = 'world';
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
  if (eff === 'toast' || eff === 'log') ev.msg = document.getElementById('eventMsg').value;
  if (eff === 'addFlag') ev.flag = document.getElementById('eventFlag').value;
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
  } else {
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
  document.getElementById('eventMap').value = e.map;
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
  list.innerHTML = moduleData.events.map((e, i) => {
    const eff = e.events[0]?.effect;
    return `<div data-idx="${i}">${e.map} @(${e.x},${e.y}) - ${eff}</div>`;
  }).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editEvent(parseInt(div.dataset.idx, 10)));
  populateFlagList();
}

function deleteEvent() {
  if (editEventIdx < 0) return;
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

// --- Zones ---
function showZoneEditor(show) {
  document.getElementById('zoneEditor').style.display = show ? 'block' : 'none';
}

function startNewZone() {
  editZoneIdx = -1;
  document.getElementById('zoneMap').value = 'world';
  document.getElementById('zoneX').value = 0;
  document.getElementById('zoneY').value = 0;
  document.getElementById('zoneW').value = 1;
  document.getElementById('zoneH').value = 1;
  document.getElementById('zoneHp').value = 0;
  document.getElementById('zoneMsg').value = '';
  document.getElementById('zoneNegate').value = '';
  document.getElementById('zoneHealMult').value = '';
  document.getElementById('zoneNoEnc').checked = false;
  document.getElementById('addZone').textContent = 'Add Zone';
  document.getElementById('delZone').style.display = 'none';
  showZoneEditor(true);
  selectedObj = null;
  drawWorld();
}

function collectZone() {
  const map = document.getElementById('zoneMap').value.trim() || 'world';
  const x = parseInt(document.getElementById('zoneX').value, 10) || 0;
  const y = parseInt(document.getElementById('zoneY').value, 10) || 0;
  const w = parseInt(document.getElementById('zoneW').value, 10) || 1;
  const h = parseInt(document.getElementById('zoneH').value, 10) || 1;
  const hp = parseInt(document.getElementById('zoneHp').value, 10);
  const msg = document.getElementById('zoneMsg').value.trim();
  const negate = document.getElementById('zoneNegate').value.trim();
  const healMult = parseFloat(document.getElementById('zoneHealMult').value);
  const noEnc = document.getElementById('zoneNoEnc').checked;
  const entry = { map, x, y, w, h };
  if (hp || msg) {
    entry.perStep = {};
    if (hp) entry.perStep.hp = hp;
    if (msg) entry.perStep.msg = msg;
  }
  if (negate) entry.negate = negate;
  if (!isNaN(healMult)) entry.healMult = healMult;
  if (noEnc) entry.noEncounters = true;
  return entry;
}

function addZone() {
  const entry = collectZone();
  if (!moduleData._origKeys) moduleData._origKeys = Object.keys(moduleData);
  if (!moduleData._origKeys.includes('zones')) moduleData._origKeys.push('zones');
  if (editZoneIdx >= 0) {
    moduleData.zones[editZoneIdx] = entry;
  } else {
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
  document.getElementById('zoneMap').value = z.map;
  document.getElementById('zoneX').value = z.x;
  document.getElementById('zoneY').value = z.y;
  document.getElementById('zoneW').value = z.w;
  document.getElementById('zoneH').value = z.h;
  document.getElementById('zoneHp').value = z.perStep?.hp ?? '';
  document.getElementById('zoneMsg').value = z.perStep?.msg || '';
  document.getElementById('zoneNegate').value = z.negate || '';
  document.getElementById('zoneHealMult').value = z.healMult ?? '';
  document.getElementById('zoneNoEnc').checked = !!z.noEncounters;
  document.getElementById('addZone').textContent = 'Update Zone';
  document.getElementById('delZone').style.display = 'block';
  showZoneEditor(true);
  selectedObj = { type: 'zone', obj: z };
  showMap(z.map);
  focusMap(z.x + z.w / 2, z.y + z.h / 2);
  drawWorld();
}

function renderZoneList() {
  const list = document.getElementById('zoneList');
  list.innerHTML = moduleData.zones.map((z, i) => `<div data-idx="${i}">${z.map} @(${z.x},${z.y},${z.w}x${z.h})</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editZone(parseInt(div.dataset.idx, 10)));
}

function deleteZone() {
  if (editZoneIdx < 0) return;
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
  document.getElementById('portalMap').value = 'world';
  document.getElementById('portalX').value = 0;
  document.getElementById('portalY').value = 0;
  document.getElementById('portalToMap').value = 'world';
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
  } else {
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
  document.getElementById('portalMap').value = p.map;
  document.getElementById('portalX').value = p.x;
  document.getElementById('portalY').value = p.y;
  document.getElementById('portalToMap').value = p.toMap;
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
  list.innerHTML = moduleData.portals.map((p, i) => `<div data-idx="${i}">${p.map} @(${p.x},${p.y}) → ${p.toMap} (${p.toX},${p.toY})</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editPortal(parseInt(div.dataset.idx, 10)));
}

function deletePortal() {
  if (editPortalIdx < 0) return;
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
function drawBldg(){
  const w=bldgGrid[0]?.length||1, h=bldgGrid.length||1;
  const sx=bldgCanvas.width/w, sy=bldgCanvas.height/h;
  bldgCtx.clearRect(0,0,bldgCanvas.width,bldgCanvas.height);
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const t=bldgGrid[y][x];
      bldgCtx.fillStyle = t===TILE.BUILDING? '#fff' : t===TILE.DOOR? '#8bd98d' : '#000';
      bldgCtx.fillRect(x*sx,y*sy,sx,sy);
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
  bldgGrid = Array.from({length:5},(_,yy)=>Array.from({length:6},(_,xx)=>TILE.BUILDING));
  bldgGrid[4][3]=TILE.DOOR;
  bldgPalette.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
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
  let interiorId = document.getElementById('bldgInterior').value;
  if (!interiorId) {
    interiorId = makeInteriorRoom();
    const I = interiors[interiorId]; I.id = interiorId; moduleData.interiors.push(I); renderInteriorList();
  }
  const boarded = document.getElementById('bldgBoarded').checked;
  const b = placeHut(x,y,{interiorId, grid:bldgGrid, boarded});
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
  const bldgs = moduleData.buildings.map((b, i) => ({ b, i })).sort((a, b) => a.b.x - b.b.x || a.b.y - b.b.y);
  list.innerHTML = bldgs.map(({ b, i }) => `<div data-idx="${i}">Bldg @(${b.x},${b.y})</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editBldg(parseInt(div.dataset.idx, 10)));
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
  bldgGrid = b.grid ? b.grid.map(r=>r.slice()) : Array.from({length:b.h},()=>Array.from({length:b.w},()=>TILE.BUILDING));
  updateInteriorOptions();
  document.getElementById('bldgInterior').value = b.interiorId || '';
  document.getElementById('addBldg').style.display = 'none';
  document.getElementById('cancelBldg').style.display = 'none';
  document.getElementById('delBldg').style.display = 'block';
  bldgPalette.querySelectorAll('button').forEach(btn=>btn.classList.remove('active'));
  bldgPalette.querySelector('button[data-tile="B"]').classList.add('active');
  bldgPaint = TILE.BUILDING;
  drawBldg();
  showBldgEditor(true);
  selectedObj = { type: 'bldg', obj: b };
  drawWorld();
}

function paintBldg(e){
  if(!bldgPainting) return;
  const w=bldgGrid[0]?.length||1, h=bldgGrid.length||1;
  const rect=bldgCanvas.getBoundingClientRect();
  const x=Math.floor((e.clientX-rect.left)/(bldgCanvas.width/w));
  const y=Math.floor((e.clientY-rect.top)/(bldgCanvas.height/h));
  if(bldgPaint===TILE.DOOR){
    for(let yy=0; yy<h; yy++){ for(let xx=0; xx<w; xx++){ if(bldgGrid[yy][xx]===TILE.DOOR) bldgGrid[yy][xx]=TILE.BUILDING; }}
  }
  bldgGrid[y][x]=bldgPaint;
  drawBldg();
  applyBldgChanges();
}
bldgCanvas.addEventListener('mousedown',e=>{ bldgPainting=true; paintBldg(e); });
bldgCanvas.addEventListener('mousemove',paintBldg);
bldgCanvas.addEventListener('mouseup',()=>{ bldgPainting=false; });
bldgCanvas.addEventListener('mouseleave',()=>{ bldgPainting=false; });

function resizeBldg(){
  const w=parseInt(document.getElementById('bldgW').value,10)||1;
  const h=parseInt(document.getElementById('bldgH').value,10)||1;
  const ng=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=> (y<bldgGrid.length && x<bldgGrid[0].length)? bldgGrid[y][x]:null));
  bldgGrid=ng; drawBldg();
  applyBldgChanges();
}
document.getElementById('bldgW').addEventListener('change',resizeBldg);
document.getElementById('bldgH').addEventListener('change',resizeBldg);

bldgPalette.querySelectorAll('button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    bldgPalette.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const t=btn.dataset.tile;
    bldgPaint = t==='B'?TILE.BUILDING : t==='D'?TILE.DOOR : null;
  });
});
bldgPalette.querySelector('button')?.classList.add('active');

if (worldPalette) {
  worldPalette.querySelectorAll('button').forEach(btn => {
    const id = parseInt(btn.dataset.tile, 10);
    const name = tileNames[id] || '';
    btn.title = name;
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
      } else if (paletteLabel) {
        paletteLabel.textContent = '';
      }
      updateCursor();
    });
  }
  worldPalette.querySelectorAll('button').forEach(bindPaletteBtn);
}

function clearPaletteSelection() {
  if (worldPalette) worldPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  worldPaint = null;
  worldStamp = null;
  if (paletteLabel) paletteLabel.textContent = '';
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
      const canv = document.createElement('canvas');
      canv.width = 64; canv.height = 64;
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
      opt.addEventListener('click', () => {
        worldStamp = worldStamps[id];
        worldPaint = null;
        if (worldPalette) worldPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        if (paletteLabel) paletteLabel.textContent = stampNames[id] || '';
        stampWindow.style.display = 'none';
        updateCursor();
        drawWorld();
      });
      stampWindow.appendChild(opt);
    }
    if (window.NanoPalette) {
      const aiBtn = document.createElement('button');
      aiBtn.id = 'nanoStampBtn';
      aiBtn.className = 'btn';
      aiBtn.textContent = '🤖';
      aiBtn.addEventListener('click', async () => {
        const block = await window.NanoPalette.generate();
        if (block) {
          const grid = gridFromEmoji(block);
          worldStamps.nano = grid;
          worldStampEmoji.nano = block;
          stampNames.nano = 'Nano';
          renderStampWindow();
          worldStamp = worldStamps.nano;
          worldPaint = null;
          if (worldPalette) worldPalette.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          if (paletteLabel) paletteLabel.textContent = stampNames.nano || '';
          stampWindow.style.display = 'none';
          updateCursor();
          drawWorld();
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
    for (let yy = 0; yy < b.h; yy++) { for (let xx = 0; xx < b.w; xx++) { setTile('world', b.x + xx, b.y + yy, b.under[yy][xx]); } }
  } else {
    for (let yy = 0; yy < b.h; yy++) { for (let xx = 0; xx < b.w; xx++) { setTile('world', b.x + xx, b.y + yy, TILE.SAND); } }
  }
  const idx = buildings.indexOf(b); if (idx >= 0) buildings.splice(idx, 1);
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
  if (editBldgIdx < 0) return;
  const x = parseInt(document.getElementById('bldgX').value, 10) || 0;
  const y = parseInt(document.getElementById('bldgY').value, 10) || 0;
  let interiorId = document.getElementById('bldgInterior').value;
  if (!interiorId) {
    interiorId = makeInteriorRoom();
    const I = interiors[interiorId]; I.id = interiorId; moduleData.interiors.push(I); renderInteriorList();
    document.getElementById('bldgInterior').value = interiorId;
  }
  const ob = moduleData.buildings[editBldgIdx];
  removeBuilding(ob);
  const boarded = document.getElementById('bldgBoarded').checked;
  const b = placeHut(x, y, { interiorId, grid: bldgGrid, boarded });
  moduleData.buildings[editBldgIdx] = b;
  selectedObj = { type: 'bldg', obj: b };
  placingType = null;
  placingPos = null;
  renderBldgList();
  drawWorld();
}

function deleteBldg() {
  if (editBldgIdx < 0) return;
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

// --- Quests ---
function showQuestEditor(show) {
  document.getElementById('questEditor').style.display = show ? 'block' : 'none';
}
function startNewQuest() {
  editQuestIdx = -1;
  document.getElementById('questId').value = nextId('quest', moduleData.quests);
  document.getElementById('questTitle').value = '';
  document.getElementById('questDesc').value = '';
  document.getElementById('questItem').value = '';
  document.getElementById('questReward').value = '';
  document.getElementById('questXP').value = 0;
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
  const reward = document.getElementById('questReward').value.trim();
  const xp = parseInt(document.getElementById('questXP').value, 10) || 0;
  const quest = { id, title, desc, item: item || undefined, reward: reward || undefined, xp };
  if (editQuestIdx >= 0) {
    moduleData.quests[editQuestIdx] = quest;
  } else {
    moduleData.quests.push(quest);
  }
  const npcId = document.getElementById('questNPC').value.trim();
  if (npcId) {
    const npc = moduleData.npcs.find(n => n.id === npcId);
    if (npc) npc.questId = id;
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
  list.innerHTML = moduleData.quests.map((q, i) => `<div data-idx="${i}">${q.id}: ${q.title}</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editQuest(parseInt(div.dataset.idx, 10)));
  updateQuestOptions();
}
function editQuest(i) {
  const q = moduleData.quests[i];
  editQuestIdx = i;
  document.getElementById('questId').value = q.id;
  document.getElementById('questTitle').value = q.title;
  document.getElementById('questDesc').value = q.desc;
  document.getElementById('questItem').value = q.item || '';
  document.getElementById('questReward').value = q.reward || '';
  document.getElementById('questXP').value = q.xp || 0;
  const npc = moduleData.npcs.find(n => n.questId === q.id);
  document.getElementById('questNPC').value = npc ? npc.id : '';
  document.getElementById('addQuest').textContent = 'Update Quest';
  document.getElementById('delQuest').style.display = 'block';
  showQuestEditor(true);
}
function updateQuestOptions() {
  const sel = document.getElementById('npcQuest');
  const cur = sel.value;
  sel.innerHTML = '<option value="">(none)</option>' + moduleData.quests.map(q => `<option value="${q.id}">${q.title}</option>`).join('');
  sel.value = cur;
  const npcSel = document.getElementById('questNPC');
  if (npcSel) {
    const npcCur = npcSel.value;
    npcSel.innerHTML = '<option value="">(none)</option>' + moduleData.npcs.map(n => `<option value="${n.id}">${n.id}</option>`).join('');
    npcSel.value = npcCur;
  }
}

function deleteQuest() {
  if (editQuestIdx < 0) return;
  confirmDialog('Delete this quest?', () => {
    const q = moduleData.quests[editQuestIdx];
    moduleData.npcs.forEach(n => { if (n.questId === q.id) n.questId = ''; });
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
  moduleData.seed = data.seed || Date.now();
  moduleData._origKeys = Object.keys(data);
  moduleData.name = data.name || 'adventure-module';
  moduleData.npcs = data.npcs || [];
  moduleData.items = data.items || [];
  moduleData.quests = data.quests || [];
  moduleData.buildings = data.buildings || [];
  moduleData.interiors = (data.interiors || []).map(I => {
    let g = I.grid;
    let orig;
    if (g && typeof g[0] === 'string') { orig = g.slice(); g = gridFromEmoji(g); }
    return { ...I, grid: g, _origGrid: orig };
  });
  moduleData.portals = data.portals || [];
  moduleData.events = data.events || [];
  moduleData.templates = data.templates || [];
  moduleData.zones = data.zones || [];
  moduleData.encounters = [];
  if (data.encounters) {
    Object.entries(data.encounters).forEach(([map, list]) => {
      list.forEach(e => moduleData.encounters.push({ map, ...e }));
    });
  }
  moduleData.start = data.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  document.getElementById('moduleName').value = moduleData.name;
  globalThis.interiors = {};
  interiors = globalThis.interiors;
  moduleData.interiors.forEach(I => { interiors[I.id] = I; });

  if (data.world) {
    const w = typeof data.world[0] === 'string' ? gridFromEmoji(data.world) : data.world;
    globalThis.world = w;
    world = globalThis.world;
  } else {
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
  renderEncounterList();
  renderTemplateList();
  updateQuestOptions();
  loadMods({});
  showItemEditor(false);
  showNPCEditor(false);
  showBldgEditor(false);
  showInteriorEditor(false);
  showQuestEditor(false);
}

function validateSpawns(){
  const walkable={0:true,1:true,2:false,3:true,4:true,5:true,6:false,7:true,8:true,9:false};
  const issues=[];
  const s=moduleData.start;
  if(!walkable[world[s.y][s.x]]) issues.push({ msg:'Player start on blocked tile', type:'start' });
  moduleData.npcs.forEach((n,i)=>{ if(n.map==='world' && !walkable[world[n.y][n.x]]) issues.push({ msg:'NPC '+(n.id||'')+' on blocked tile', type:'npc', idx:i }); });
  moduleData.items.forEach((it,i)=>{ if(it.map==='world' && !walkable[world[it.y][it.x]]) issues.push({ msg:'Item '+it.id+' on blocked tile', type:'item', idx:i }); });
  return issues;
}

function onProblemClick(){
  const prob=problemRefs[parseInt(this.dataset.idx,10)];
  if(prob.type==='npc') editNPC(prob.idx);
  else if(prob.type==='item') editItem(prob.idx);
  else if(prob.type==='start'){
    showMap('world');
    focusMap(moduleData.start.x,moduleData.start.y);
    selectedObj=null;
    drawWorld();
  }
}

function renderProblems(issues){
  issues = issues || validateSpawns();
  const card = document.getElementById('problemCard');
  const list = document.getElementById('problemList');
  problemRefs = issues;
  if(!issues.length){
    card.style.display='none';
    return;
  }
  card.style.display='block';
  const html = issues.map((p,i)=>`<div data-idx="${i}">${p.msg}</div>`).join('');
  if(list.innerHTML !== html){
    list.innerHTML = html;
    Array.from(list.children).forEach(div=>div.onclick=onProblemClick);
  }
}

function saveModule() {
  const issues = validateSpawns();
  if(issues.length){ renderProblems(issues); return; }
  moduleData.name = document.getElementById('moduleName').value.trim() || 'adventure-module';
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
    (enc[map] ||= []).push(rest);
  });
  const base = {};
  (moduleData._origKeys || Object.keys(moduleData)).forEach(k => {
    if (['buildings', 'interiors', 'encounters', 'world', '_origKeys'].includes(k)) return;
    if (moduleData[k] !== undefined) base[k] = moduleData[k];
  });
  if (moduleData._origKeys?.includes('encounters')) base.encounters = enc;
  base.world = gridToEmoji(world);
  if (moduleData._origKeys?.includes('buildings')) base.buildings = bldgs;
  if (moduleData._origKeys?.includes('interiors')) base.interiors = ints;
  const data = base;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = moduleData.name + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function playtestModule() {
  moduleData.name = document.getElementById('moduleName').value.trim() || 'adventure-module';
  const bldgs = buildings.map(({ under, ...rest }) => rest);
  const ints = moduleData.interiors.map(I => ({...I, grid: gridToEmoji(I.grid)}));
  const enc = {};
  (moduleData.encounters||[]).forEach(e => {
    const { map, ...rest } = e;
    (enc[map] ||= []).push(rest);
  });
  const data = { ...moduleData, encounters: enc, world: gridToEmoji(world), buildings: bldgs, interiors: ints };
  localStorage.setItem(PLAYTEST_KEY, JSON.stringify(data));
  window.open('dustland.html?ack-player=1#play', '_blank');
}

document.getElementById('clear').onclick = clearWorld;
document.getElementById('addNPC').onclick = beginPlaceNPC;
document.getElementById('addItem').onclick = () => { if (editItemIdx >= 0) addItem(); else beginPlaceItem(); };
document.getElementById('newItem').onclick = startNewItem;
document.getElementById('newNPC').onclick = startNewNPC;
document.getElementById('newBldg').onclick = startNewBldg;
document.getElementById('newQuest').onclick = startNewQuest;
document.getElementById('addBldg').onclick = beginPlaceBldg;
document.getElementById('addQuest').onclick = addQuest;
document.getElementById('addEvent').onclick = addEvent;
document.getElementById('cancelNPC').onclick = cancelNPC;
document.getElementById('cancelItem').onclick = cancelItem;
document.getElementById('cancelBldg').onclick = cancelBldg;
document.getElementById('newEvent').onclick = startNewEvent;
document.getElementById('addPortal').onclick = addPortal;
document.getElementById('newPortal').onclick = startNewPortal;
document.getElementById('newZone').onclick = startNewZone;
document.getElementById('addZone').onclick = addZone;
document.getElementById('delZone').onclick = deleteZone;
document.getElementById('delNPC').onclick = deleteNPC;
document.getElementById('closeNPC').onclick = closeNPCEditor;
document.getElementById('newEncounter').onclick = startNewEncounter;
document.getElementById('addEncounter').onclick = addEncounter;
document.getElementById('cancelEncounter').onclick = () => { editEncounterIdx = -1; showEncounterEditor(false); };
document.getElementById('delEncounter').onclick = deleteEncounter;
document.getElementById('closeEncounter').onclick = () => showEncounterEditor(false);
document.getElementById('newTemplate').onclick = startNewTemplate;
document.getElementById('addTemplate').onclick = addTemplate;
document.getElementById('delTemplate').onclick = deleteTemplate;
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

setupListFilter('npcFilter','npcList');
setupListFilter('itemFilter','itemList');
setupListFilter('questFilter','questList');
setupListFilter('eventFilter','eventList');
setupListFilter('encFilter','encounterList');
document.getElementById('delItem').onclick = deleteItem;
document.getElementById('delBldg').onclick = deleteBldg;
document.getElementById('newInterior').onclick = startNewInterior;
document.getElementById('delInterior').onclick = deleteInterior;
document.getElementById('delQuest').onclick = deleteQuest;
document.getElementById('delEvent').onclick = deleteEvent;
document.getElementById('delPortal').onclick = deletePortal;
document.getElementById('itemSlot').addEventListener('change', updateModsWrap);
document.getElementById('itemUseType').addEventListener('change', updateUseWrap);
document.getElementById('eventEffect').addEventListener('change', updateEventEffectFields);
document.getElementById('eventPick').onclick = () => { coordTarget = { x: 'eventX', y: 'eventY' }; };
document.getElementById('npcFlagType').addEventListener('change', updateFlagBuilder);
document.getElementById('npcEditor').addEventListener('input', applyNPCChanges);
document.getElementById('moduleName').value = moduleData.name;
document.getElementById('npcEditor').addEventListener('change', applyNPCChanges);
document.getElementById('bldgEditor').addEventListener('input', applyBldgChanges);
document.getElementById('bldgEditor').addEventListener('change', applyBldgChanges);
document.getElementById('npcFlagPick').onclick = () => { coordTarget = { x: 'npcFlagX', y: 'npcFlagY', map: 'npcFlagMap' }; };
document.getElementById('portalPick').onclick = () => { coordTarget = { x: 'portalX', y: 'portalY' }; };
document.getElementById('portalDestPick').onclick = () => { coordTarget = { x: 'portalToX', y: 'portalToY' }; };
document.getElementById('npcPick').onclick = () => { coordTarget = { x: 'npcX', y: 'npcY', map: 'npcMap' }; };
document.getElementById('itemPick').onclick = () => { coordTarget = { x: 'itemX', y: 'itemY' }; };
document.getElementById('save').onclick = saveModule;
document.getElementById('load').onclick = () => document.getElementById('loadFile').click();
document.getElementById('loadFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { applyLoadedModule(JSON.parse(reader.result)); }
    catch (err) { alert('Invalid module'); }
  };
  reader.readAsText(file);
  e.target.value = '';
});
document.getElementById('setStart').onclick = () => { settingStart = true; };
document.getElementById('resetStart').onclick = () => {
  moduleData.start = { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  drawWorld();
};
document.getElementById('addNode').onclick = addNode;
document.getElementById('editDialog').onclick = openDialogEditor;
document.getElementById('closeDialogModal').onclick = closeDialogEditor;
document.getElementById('dialogModal').addEventListener('click', e => { if (e.target.id === 'dialogModal') closeDialogEditor(); });
// Live preview when dialog text changes
['npcDialog', 'npcAccept', 'npcTurnin'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderDialogPreview);
});

// When quest selection changes, show/hide extra fields, update preview, and (optionally) auto-generate the quest scaffold
document.getElementById('npcQuest').addEventListener('change', () => {
  toggleQuestDialogBtn();
  toggleQuestTextWrap();
  if (document.getElementById('npcQuest').value) {
    generateQuestTree();     // build start/accept/turn-in scaffold
  } else {
    renderDialogPreview();   // just refresh preview of whatever is in the editor
  }
});
document.getElementById('npcCombat').addEventListener('change', updateNPCOptSections);
document.getElementById('npcShop').addEventListener('change', updateNPCOptSections);
document.getElementById('npcHidden').addEventListener('change', updateNPCOptSections);
document.getElementById('genQuestDialog').onclick = generateQuestTree;

// --- Map interactions ---
function canvasPos(ev) {
  const rect = canvas.getBoundingClientRect();
  if (currentMap === 'world') {
    const sx = baseTileW * worldZoom, sy = baseTileH * worldZoom;
    const x = clamp(Math.floor((ev.clientX - rect.left) / sx + panX), 0, WORLD_W - 1);
    const y = clamp(Math.floor((ev.clientY - rect.top) / sy + panY), 0, WORLD_H - 1);
    return { x, y };
  } else {
    const I = moduleData.interiors.find(i => i.id === currentMap);
    if (!I) return { x: 0, y: 0 };
    const sx = canvas.width / I.w;
    const sy = canvas.height / I.h;
    const x = clamp(Math.floor((ev.clientX - rect.left) / sx), 0, I.w - 1);
    const y = clamp(Math.floor((ev.clientY - rect.top) / sy), 0, I.h - 1);
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
    if (ht) { x = ht.x; y = ht.y; }
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
      if (overTL || overBR) zoneCursor = 'nwse-resize';
      else if (x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) zoneCursor = 'grab';
    }
    canvas.style.cursor = zoneCursor || (overNpc || overItem || overBldg || overStart || overEvent || overPortal ? 'grab' : 'pointer');
  } else {
    canvas.style.cursor = 'pointer';
  }
}
canvas.addEventListener('mousedown', ev => {
  if (ev.button === 2 && currentMap === 'world') {
    showLoopControls(null);
    panning = true;
    panMouseX = ev.clientX;
    panMouseY = ev.clientY;
    panStartX = panX;
    panStartY = panY;
    canvas.style.cursor = 'grabbing';
    return;
  }
  showLoopControls(null);
  if (ev.button !== 0) return;
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
  if (currentMap === 'world' && worldPaint != null && !coordTarget && !(overNpc || overItem || overBldg || overStart || overEvent || overPortal || overZone)) {
    worldPainting = true;
    hoverTile = { x, y };
    addTerrainFeature(x, y, worldPaint);
    didPaint = true;
    drawWorld();
    updateCursor(x, y);
    return;
  }
  if (currentMap !== 'world' && !coordTarget && !(overNpc || overItem || overEvent || overPortal || overZone)) {
    hoverTile = { x, y };
    const I = moduleData.interiors.find(i => i.id === currentMap);
    if (I) {
      setTile(currentMap, x, y, intPaint);
      if (intPaint === TILE.DOOR) { I.entryX = x; I.entryY = y - 1; }
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
    document.getElementById(coordTarget.x).value = x;
    document.getElementById(coordTarget.y).value = y;
    if (coordTarget.map) document.getElementById(coordTarget.map).value = currentMap;
    coordTarget = null;
    canvas.style.cursor = '';
    drawWorld();
    return;
  }
  if (placingType) {
    if (placingType === 'npc') {
      document.getElementById('npcMap').value = currentMap;
      document.getElementById('npcX').value = x;
      document.getElementById('npcY').value = y;
      if (placingCb) placingCb();
      document.getElementById('cancelNPC').style.display = 'none';
    } else if (placingType === 'item') {
      document.getElementById('itemX').value = x;
      document.getElementById('itemY').value = y;
      if (placingCb) placingCb();
      document.getElementById('cancelItem').style.display = 'none';
    } else if (placingType === 'bldg' && currentMap === 'world') {
      document.getElementById('bldgX').value = x;
      document.getElementById('bldgY').value = y;
      if (placingCb) placingCb();
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
    moduleData.start = { map: 'world', x, y };
    settingStart = false;
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
    } else if (nearBR) {
      dragTarget = z;
      dragTarget._type = 'zoneBR';
      updateCursor(x, y);
      return;
    } else if (x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h) {
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
  document.getElementById('npcX').value = x; document.getElementById('npcY').value = y;
  document.getElementById('itemX').value = x; document.getElementById('itemY').value = y;
  document.getElementById('bldgX').value = x; document.getElementById('bldgY').value = y;
  document.getElementById('eventX').value = x; document.getElementById('eventY').value = y;
  document.getElementById('zoneX').value = x; document.getElementById('zoneY').value = y;
  const px = document.getElementById('portalX');
  const py = document.getElementById('portalY');
  if (px && py) { px.value = x; py.value = y; }
  selectedObj = null;
  drawWorld();
  updateCursor(x, y);
});
canvas.addEventListener('mousemove', ev => {
  if (panning) {
    const dx = (ev.clientX - panMouseX) / (baseTileW * worldZoom);
    const dy = (ev.clientY - panMouseY) / (baseTileH * worldZoom);
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
  if (currentMap === 'world' && worldStamp) drawWorld();
  if (currentMap === 'world' && worldPainting && worldPaint != null) {
    addTerrainFeature(x, y, worldPaint);
    didPaint = true;
    drawWorld();
    return;
  }
  if (currentMap !== 'world' && intPainting) {
    const I = moduleData.interiors.find(i => i.id === currentMap);
    if (I) {
      setTile(currentMap, x, y, intPaint);
      if (intPaint === TILE.DOOR) { I.entryX = x; I.entryY = y - 1; }
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
      if (selectedObj && selectedObj.type === 'bldg') selectedObj.obj = dragTarget;
      renderBldgList();
      document.getElementById('bldgX').value = x;
      document.getElementById('bldgY').value = y;
      document.getElementById('delBldg').style.display = 'block';
    } else if (dragTarget._type === 'loop') {
      const npc = dragTarget.npc;
      npc.loop[dragTarget.idx].x = x; npc.loop[dragTarget.idx].y = y;
      if (dragTarget.idx === 0) {
        npc.x = x; npc.y = y;
        document.getElementById('npcX').value = x;
        document.getElementById('npcY').value = y;
        renderNPCList();
      }
      renderLoopFields(npc.loop);
    } else if (dragTarget._type === 'npc') {
      dragTarget.x = x; dragTarget.y = y;
      renderNPCList();
      document.getElementById('npcX').value = x;
      document.getElementById('npcY').value = y;
    } else if (dragTarget._type === 'start') {
      dragTarget.x = x; dragTarget.y = y;
    } else if (dragTarget._type === 'zoneMove') {
      dragTarget.x = x - dragOffsetX;
      dragTarget.y = y - dragOffsetY;
      document.getElementById('zoneX').value = dragTarget.x;
      document.getElementById('zoneY').value = dragTarget.y;
      renderZoneList();
    } else if (dragTarget._type === 'zoneTL') {
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
    } else if (dragTarget._type === 'zoneBR') {
      dragTarget.w = Math.max(1, x - dragTarget.x + 1);
      dragTarget.h = Math.max(1, y - dragTarget.y + 1);
      document.getElementById('zoneW').value = dragTarget.w;
      document.getElementById('zoneH').value = dragTarget.h;
      renderZoneList();
    } else { // item
      dragTarget.x = x; dragTarget.y = y;
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
  } else if (obj = moduleData.items.find(it => it.map === currentMap && it.x === x && it.y === y)) {
    ht = { obj, type: 'item' };
  } else if (obj = (currentMap === 'world' ? moduleData.buildings.find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) : null)) {
    ht = { obj, type: 'bldg' };
  } else if (obj = moduleData.events.find(ev => ev.map === currentMap && ev.x === x && ev.y === y)) {
    ht = { obj, type: 'event' };
  } else if (obj = moduleData.zones.find(z => z.map === currentMap && x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h)) {
    ht = { obj, type: 'zone' };
  } else if (obj = moduleData.portals.find(p => p.map === currentMap && p.x === x && p.y === y)) {
    ht = { obj, type: 'portal' };
  }

  if ((hoverTarget && (!ht || hoverTarget.obj !== ht.obj)) || (!hoverTarget && ht)) {
    hoverTarget = ht;
    drawWorld();
  }

  if (loopHover) positionLoopControls();

  updateCursor(x, y);
});
canvas.addEventListener('mouseup', ev => {
  if (ev.button === 2 && panning) {
    panning = false;
    updateCursor();
    return;
  }
  if (ev.button !== 0) return;
  worldPainting = false;
  intPainting = false;
  if (dragTarget) delete dragTarget._type;
  dragTarget = null;
  if (didPaint) {
    if (currentMap === 'world') redrawBuildings();
    drawWorld();
    if (currentMap !== 'world') drawInterior();
  }
  updateCursor();
});
canvas.addEventListener('mouseleave', () => {
  if (panning) panning = false;
  if (didPaint && currentMap === 'world') {
    redrawBuildings();
  }
  worldPainting = false;
  intPainting = false;
  if (dragTarget) delete dragTarget._type;
  dragTarget = null;
  hoverTile = null;
  didPaint = false;
  drawWorld();
  if (currentMap !== 'world') drawInterior();
  updateCursor();
});

canvas.addEventListener('click', ev => {
  if (ev.button !== 0) return;
  if (didPaint) { didPaint = false; return; }
  if (didDrag) { didDrag = false; return; }
  const { x, y } = canvasPos(ev);
  if (selectedObj && selectedObj.type === 'npc') {
    const npc = selectedObj.obj;
    if (x === npc.x && y === npc.y) {
      showLoopControls({ idx: 0, x: npc.x, y: npc.y });
      return;
    }
    const pts = npc.loop || [];
    const li = pts.findIndex(p => p.x === x && p.y === y);
    if (li >= 0) { showLoopControls({ idx: li, x: pts[li].x, y: pts[li].y }); return; }
  }
  showLoopControls(null);
  let idx = moduleData.npcs.findIndex(n => n.map === currentMap && n.x === x && n.y === y);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('npc');
    editNPC(idx);
    return;
  }
  idx = moduleData.items.findIndex(it => it.map === currentMap && it.x === x && it.y === y);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('items');
    editItem(idx);
    return;
  }
  idx = currentMap === 'world' ? moduleData.buildings.findIndex(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) : -1;
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('buildings');
    editBldg(idx);
    return;
  }
  idx = moduleData.events.findIndex(ev => ev.map === currentMap && ev.x === x && ev.y === y);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('events');
    editEvent(idx);
    return;
  }
  idx = moduleData.zones.findIndex(z => z.map === currentMap && x >= z.x && x < z.x + z.w && y >= z.y && y < z.y + z.h);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('zones');
    editZone(idx);
    return;
  }
  idx = moduleData.portals.findIndex(p => p.map === currentMap && p.x === x && p.y === y);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('portals');
    editPortal(idx);
  }
});

canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('wheel', ev => {
  if (currentMap !== 'world') return;
  ev.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = ev.clientX - rect.left;
  const my = ev.clientY - rect.top;
  const tileX = panX + mx / (baseTileW * worldZoom);
  const tileY = panY + my / (baseTileH * worldZoom);
  const factor = ev.deltaY < 0 ? 1.25 : 0.8;
  const newZoom = clamp(worldZoom * factor, 1, 8);
  if (newZoom === worldZoom) return;
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
  if (!res) return;
  Object.entries(res).forEach(([k, v]) => {
    if (Array.isArray(moduleData[k])) moduleData[k].push(...v);
    else moduleData[k] = v;
  });
  if (typeof applyModule === 'function') applyModule(moduleData, { fullReset: false });
  // Refresh lists so wizard changes appear immediately.
  if (typeof renderNPCList === 'function') renderNPCList();
  if (typeof renderItemList === 'function') renderItemList();
  if (typeof renderQuestList === 'function') renderQuestList();
  if (typeof renderBldgList === 'function') renderBldgList();
  if (typeof renderInteriorList === 'function') renderInteriorList();
  if (typeof renderEventList === 'function') renderEventList();
  if (typeof renderPortalList === 'function') renderPortalList();
  if (typeof renderZoneList === 'function') renderZoneList();
  if (typeof renderEncounterList === 'function') renderEncounterList();
  if (typeof renderTemplateList === 'function') renderTemplateList();
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
      if (cfg.commit) mergeWizardResult(cfg.commit(state));
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
  if (!panel) return;
  const tabs = Array.from(panel.querySelectorAll('.tab2'));
  const panes = Array.from(panel.querySelectorAll('[data-pane]'));
  let current = 'npc';
  let wide = false;

  function setLayout() {
    wide = panel.offsetWidth >= 960;
    panel.classList.toggle('wide', wide);
    if (wide) {
      panes.forEach(p => p.style.display = '');
    }
    show(current);
  }

  function show(tabName) {
    current = tabName;
    tabs.forEach(t => {
      const on = t.dataset.tab === tabName;
      t.classList.toggle('active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (!wide) {
      panes.forEach(p => p.style.display = (p.dataset.pane === tabName ? '' : 'none'));
    }
  }

  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
  if (typeof ResizeObserver === 'function') {
    const ro = new ResizeObserver(setLayout);
    ro.observe(panel);
  } else if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('resize', setLayout);
  }
  setLayout();
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
      } else if (e.key === 'p') {
        e.preventDefault();
        playtestModule();
      }
    }
  });
}

document.getElementById('playtestFloat')?.addEventListener('click', playtestModule);
updateMapSelect();

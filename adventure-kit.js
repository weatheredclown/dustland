
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

let dragTarget = null, settingStart = false, hoverTarget = null, didDrag = false;
let placingType = null, placingPos = null, placingCb = null;
let hoverTile = null;
var coordTarget = null;
function setCoordTarget(v){ coordTarget = v; }
globalThis.setCoordTarget = setCoordTarget;
let worldZoom = 1, panX = 0, panY = 0;
let panning = false, panStartX = 0, panStartY = 0, panMouseX = 0, panMouseY = 0;
const baseTileW = canvas.width / WORLD_W;
const baseTileH = canvas.height / WORLD_H;

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

const moduleData = { seed: Date.now(), name: 'adventure-module', npcs: [], items: [], quests: [], buildings: [], interiors: [], portals: [], events: [], start: { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) } };
const STAT_OPTS = ['ATK', 'DEF', 'LCK', 'INT', 'PER', 'CHA'];
let editNPCIdx = -1, editItemIdx = -1, editQuestIdx = -1, editBldgIdx = -1, editInteriorIdx = -1, editEventIdx = -1, editPortalIdx = -1;
let treeData = {};
let selectedObj = null;
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
let worldPaintNoise = true;
if (noiseToggle) {
  noiseToggle.addEventListener('click', () => {
    worldPaintNoise = !worldPaintNoise;
    noiseToggle.textContent = `Noise: ${worldPaintNoise ? 'On' : 'Off'}`;
  });
  noiseToggle.textContent = 'Noise: On';
}

function nextId(prefix, arr) {
  let i = 1; while (arr.some(o => o.id === prefix + i)) i++; return prefix + i;
}

function addTerrainFeature(x, y, tile) {
  if (!setTile('world', x, y, tile)) return;
  if (!worldPaintNoise) return;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
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
  const W = WORLD_W, H = WORLD_H;
  const sx = baseTileW * worldZoom;
  const sy = baseTileH * worldZoom;
  const pulse = 2 + Math.sin(Date.now() / 300) * 2;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let y = 0; y < H; y++) {
    const py = (y - panY) * sy;
    if (py + sy < 0 || py >= canvas.height) continue;
    for (let x = 0; x < W; x++) {
      const px = (x - panX) * sx;
      if (px + sx < 0 || px >= canvas.width) continue;
      const t = world[y][x];
      ctx.fillStyle = akColors[t] || '#000';
      ctx.fillRect(px, py, sx, sy);
    }
  }
  if (hoverTile) {
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
  // Draw NPC markers
  moduleData.npcs.filter(n => n.map === 'world').forEach(n => {
    const hovering = hoverTarget && hoverTarget.type === 'npc' && hoverTarget.obj === n;
    const px = (n.x - panX) * sx;
    const py = (n.y - panY) * sy;
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
  if (selectedObj && selectedObj.type === 'npc' && selectedObj.obj.loop) {
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
  // Draw Item markers
  moduleData.items.filter(it => it.map === 'world').forEach(it => {
    const hovering = hoverTarget && hoverTarget.type === 'item' && hoverTarget.obj === it;
    const px = (it.x - panX) * sx;
    const py = (it.y - panY) * sy;
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
  // Draw Portal markers
  moduleData.portals.filter(p => p.map === 'world').forEach(p => {
    const hovering = hoverTarget && hoverTarget.type === 'portal' && hoverTarget.obj === p;
    const px = (p.x - panX) * sx;
    const py = (p.y - panY) * sy;
    if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height) return;
    ctx.save();
    ctx.strokeStyle = hovering ? '#f0f' : '#f0f';
    if (hovering) {
      ctx.shadowColor = '#f0f';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
    }
    ctx.strokeRect(px + 2, py + 2, sx - 4, sy - 4);
    ctx.restore();
  });
  // Draw Tile Event markers
  moduleData.events.filter(ev => ev.map === 'world').forEach(ev => {
    const hovering = hoverTarget && hoverTarget.type === 'event' && hoverTarget.obj === ev;
    const px = (ev.x - panX) * sx;
    const py = (ev.y - panY) * sy;
    if (px + sx < 0 || py + sy < 0 || px > canvas.width || py > canvas.height) return;
    ctx.save();
    ctx.fillStyle = hovering ? '#0ff' : '#0ff';
    if (hovering) {
      ctx.shadowColor = '#0ff';
      ctx.shadowBlur = 8;
    }
    ctx.fillRect(px + sx / 4, py + sy / 4, sx / 2, sy / 2);
    ctx.restore();
  });
  // Highlight hovered building
  if (hoverTarget && hoverTarget.type === 'bldg') {
    const b = hoverTarget.obj;
    ctx.save();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 8;
    ctx.strokeRect((b.x - panX) * sx, (b.y - panY) * sy, b.w * sx, b.h * sy);
    ctx.restore();
  }
  if (moduleData.start && moduleData.start.map === 'world') {
    ctx.save();
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = pulse;
    ctx.strokeRect((moduleData.start.x - panX) * sx + 1, (moduleData.start.y - panY) * sy + 1, sx - 2, sy - 2);
    ctx.restore();
  }
  if (selectedObj && selectedObj.obj) {
    const o = selectedObj.obj;
    ctx.save();
    ctx.lineWidth = pulse;
    if (selectedObj.type === 'npc' && o.map === 'world') {
      ctx.strokeStyle = o.color || '#fff';
      ctx.strokeRect((o.x - panX) * sx + 1, (o.y - panY) * sy + 1, sx - 2, sy - 2);
    } else if (selectedObj.type === 'item' && o.map === 'world') {
      ctx.strokeStyle = '#ff0';
      ctx.strokeRect((o.x - panX) * sx + 1, (o.y - panY) * sy + 1, sx - 2, sy - 2);
    } else if (selectedObj.type === 'bldg') {
      ctx.strokeStyle = '#fff';
      ctx.strokeRect((o.x - panX) * sx, (o.y - panY) * sy, o.w * sx, o.h * sy);
    } else if (selectedObj.type === 'event' && o.map === 'world') {
      ctx.strokeStyle = '#0ff';
      ctx.strokeRect((o.x - panX) * sx + 1, (o.y - panY) * sy + 1, sx - 2, sy - 2);
    } else if (selectedObj.type === 'portal' && o.map === 'world') {
      ctx.strokeStyle = '#f0f';
      ctx.strokeRect((o.x - panX) * sx + 2, (o.y - panY) * sy + 2, sx - 4, sy - 4);
    }
    ctx.restore();
  }
  if (placingType && placingPos) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    if (placingType === 'npc') {
      ctx.fillStyle = '#fff';
      ctx.fillRect((placingPos.x - panX) * sx, (placingPos.y - panY) * sy, sx, sy);
    } else if (placingType === 'item') {
      ctx.strokeStyle = '#ff0';
      ctx.strokeRect((placingPos.x - panX) * sx + 1, (placingPos.y - panY) * sy + 1, sx - 2, sy - 2);
    } else if (placingType === 'bldg') {
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
}

function paintInterior(e){
  if(editInteriorIdx<0||!intPainting) return;
  const I=moduleData.interiors[editInteriorIdx];
  const rect=intCanvas.getBoundingClientRect();
  const x=Math.floor((e.clientX-rect.left)/(intCanvas.width/I.w));
  const y=Math.floor((e.clientY-rect.top)/(intCanvas.height/I.h));
  I.grid[y][x]=intPaint;
  if(intPaint===TILE.DOOR){ I.entryX=x; I.entryY=y-1; }
  drawInterior();
}
intCanvas.addEventListener('mousedown',e=>{ intPainting=true; paintInterior(e); });
intCanvas.addEventListener('mousemove',paintInterior);
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
  list.innerHTML = moduleData.interiors.map((I, i) => `<div data-idx="${i}">${I.id}</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editInterior(parseInt(div.dataset.idx, 10)));
  updateInteriorOptions();
  refreshChoiceDropdowns();
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

function regenWorld() {
  moduleData.seed = Date.now();
  genWorld(moduleData.seed, { buildings: [] });
  moduleData.buildings = [];
  moduleData.interiors = [];
  moduleData.events = [];
  moduleData.portals = [];
  for (const id in interiors) {
    if (id === 'creator') continue;
    const I = interiors[id]; I.id = id; moduleData.interiors.push(I);
  }
  renderInteriorList();
  renderBldgList();
  renderEventList();
  renderPortalList();
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
    drawWorld();
  });
}

function modRow(stat = 'ATK', val = 1) {
  const div = document.createElement('div');
  const sel = document.createElement('select');
  sel.className = 'modStat';
  sel.innerHTML = STAT_OPTS.map(s => `<option value="${s}"${s === stat ? ' selected' : ''}>${s}</option>`).join('');
  const inp = document.createElement('input');
  inp.type = 'number'; inp.className = 'modVal'; inp.value = val;
  div.appendChild(sel); div.appendChild(inp);
  document.getElementById('modBuilder').appendChild(div);
}
function collectMods() {
  const mods = {};
  document.querySelectorAll('#modBuilder > div').forEach(div => {
    const stat = div.querySelector('.modStat').value;
    const val = parseInt(div.querySelector('.modVal').value, 10);
    if (stat && val) mods[stat] = val;
  });
  return mods;
}
function loadMods(mods) {
  const mb = document.getElementById('modBuilder');
  mb.innerHTML = '';
  Object.entries(mods || {}).forEach(([s, v]) => modRow(s, v));
}

function renderDialogPreview() {
  const prev = document.getElementById('dialogPreview');
  let tree = null;
  const txt = document.getElementById('npcTree').value.trim();
  if (txt) { try { tree = JSON.parse(txt); } catch (e) { tree = null; } }
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

function addChoiceRow(container, ch = {}) {
  const { label = '', to = '', reward = '', stat = '', dc = '', success = '', failure = '', once = false, costItem = '', costSlot = '', reqItem = '', reqSlot = '', join = null, q = '' } = ch || {};
  const cond = ch && ch.if ? ch.if : null;
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
  const isItem = reward && !isXP;
  const itemVal = isItem ? reward : '';
  const effs = Array.isArray(ch.effects) ? ch.effects : [];
  const boardEff = effs.find(e => e.effect === 'boardDoor');
  const unboardEff = effs.find(e => e.effect === 'unboardDoor');
  const boardId = boardEff ? boardEff.interiorId || '' : '';
  const unboardId = unboardEff ? unboardEff.interiorId || '' : '';
  const row = document.createElement('div');
  row.innerHTML = `<label>Label<input class="choiceLabel" value="${label}"/></label>
    <label>To<select class="choiceTo"></select></label>
    <button class="btn delChoice" type="button">x</button>
    <details class="choiceAdv"><summary>Advanced</summary>
      <label>Reward<select class="choiceRewardType"><option value="" ${!reward?'selected':''}></option><option value="xp" ${isXP?'selected':''}>XP</option><option value="item" ${isItem?'selected':''}>Item</option></select>
        <input type="number" class="choiceRewardXP" value="${xpVal}" style="display:${isXP?'inline-block':'none'}"/>
        <select class="choiceRewardItem" style="display:${isItem?'inline-block':'none'}"></select></label>
      <label>Stat<select class="choiceStat"></select></label>
      <label>DC<input type="number" class="choiceDC" value="${dc || ''}"/><span class="small">Target number for stat check.</span></label>
      <label>Success<input class="choiceSuccess" value="${success || ''}"/><span class="small">Shown if check passes.</span></label>
      <label>Failure<input class="choiceFailure" value="${failure || ''}"/><span class="small">Shown if check fails.</span></label>
      <label>Cost Item<select class="choiceCostItem"></select></label>
      <label>Cost Slot<select class="choiceCostSlot"></select></label>
      <label>Req Item<select class="choiceReqItem"></select></label>
      <label>Req Slot<select class="choiceReqSlot"></select></label>
      <fieldset class="choiceSubGroup"><legend>Join</legend>
        <label>ID<select class="choiceJoinId"></select></label>
        <label>Name<input class="choiceJoinName" value="${joinName}"/><span class="small">Name shown after joining.</span></label>
        <label>Role<select class="choiceJoinRole"></select></label>
      </fieldset>
      <fieldset class="choiceSubGroup"><legend>Goto</legend>
        <label>Target<select class="choiceGotoTarget"><option value="player" ${gotoTarget==='player'?'selected':''}>Player</option><option value="npc" ${gotoTarget==='npc'?'selected':''}>NPC</option></select></label>
        <label>Map<select class="choiceGotoMap"></select></label>
        <label>X<input type="number" class="choiceGotoX" value="${gotoX}"/><span class="small">X coordinate.</span></label>
        <label>Y<input type="number" class="choiceGotoY" value="${gotoY}"/><span class="small">Y coordinate.</span></label>
        <label class="inline"><input type="checkbox" class="choiceGotoRel" ${gotoRel?'checked':''}/> relative</label>
      </fieldset>
      <label>Board Door<select class="choiceBoard"></select></label>
      <label>Unboard Door<select class="choiceUnboard"></select></label>
      <label>Quest<select class="choiceQ"><option value=""></option><option value="accept" ${q==='accept'?'selected':''}>accept</option><option value="turnin" ${q==='turnin'?'selected':''}>turnin</option></select></label>
      <label class="onceWrap"><input type="checkbox" class="choiceOnce" ${once ? 'checked' : ''}/> once</label>
      <label>Flag<input class="choiceFlag" list="choiceFlagList" value="${flag}"/></label>
      <label>Op<select class="choiceOp">
        <option value=">=" ${op === '>=' ? 'selected' : ''}>>=</option>
        <option value=">" ${op === '>' ? 'selected' : ''}>></option>
        <option value="<=" ${op === '<=' ? 'selected' : ''}><=</option>
        <option value="<" ${op === '<' ? 'selected' : ''}><</option>
        <option value="==" ${op === '==' ? 'selected' : ''}>=</option>
        <option value="!=" ${op === '!=' ? 'selected' : ''}>!=</option>
      </select></label>
      <label>Value<input type="number" class="choiceVal" value="${val}"/></label>
    </details>`;
  container.appendChild(row);
  populateChoiceDropdown(row.querySelector('.choiceTo'), to);
  populateStatDropdown(row.querySelector('.choiceStat'), stat);
  populateItemDropdown(row.querySelector('.choiceCostItem'), costItem);
  populateSlotDropdown(row.querySelector('.choiceCostSlot'), costSlot);
  populateItemDropdown(row.querySelector('.choiceReqItem'), reqItem);
  populateSlotDropdown(row.querySelector('.choiceReqSlot'), reqSlot);
  populateNPCDropdown(row.querySelector('.choiceJoinId'), joinId);
  populateRoleDropdown(row.querySelector('.choiceJoinRole'), joinRole);
  populateMapDropdown(row.querySelector('.choiceGotoMap'), gotoMap);
  populateItemDropdown(row.querySelector('.choiceRewardItem'), itemVal);
  populateInteriorDropdown(row.querySelector('.choiceBoard'), boardId);
  populateInteriorDropdown(row.querySelector('.choiceUnboard'), unboardId);
  const rewardTypeSel = row.querySelector('.choiceRewardType');
  const rewardXP = row.querySelector('.choiceRewardXP');
  const rewardItem = row.querySelector('.choiceRewardItem');
  rewardTypeSel.addEventListener('change', () => {
    rewardXP.style.display = rewardTypeSel.value === 'xp' ? 'inline-block' : 'none';
    rewardItem.style.display = rewardTypeSel.value === 'item' ? 'inline-block' : 'none';
    updateTreeData();
  });
  const joinSel = row.querySelector('.choiceJoinId');
  joinSel.addEventListener('change', () => {
    const npc = moduleData.npcs.find(n => n.id === joinSel.value);
    const nameEl = row.querySelector('.choiceJoinName');
    if (npc && !nameEl.value) nameEl.value = npc.name;
    updateTreeData();
  });
  row.querySelectorAll('input,textarea,select').forEach(el => el.addEventListener('input', updateTreeData));
  row.querySelectorAll('select').forEach(el => el.addEventListener('change', updateTreeData));
  row.querySelectorAll('input[type=checkbox]').forEach(el => el.addEventListener('change', updateTreeData));
  row.querySelector('.delChoice').addEventListener('click', () => { row.remove(); updateTreeData(); });
}

function populateChoiceDropdown(sel, selected = '') {
  const keys = Object.keys(treeData);
  sel.innerHTML = '<option value=""></option>' + keys.map(k => `<option value="${k}">${k}</option>`).join('');
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
      const to = toEl.value.trim();
      const rewardType = chEl.querySelector('.choiceRewardType').value;
      const xpTxt = chEl.querySelector('.choiceRewardXP').value.trim();
      const itemReward = chEl.querySelector('.choiceRewardItem').value.trim();
      let reward = '';
      if (rewardType === 'xp' && xpTxt) reward = `XP ${parseInt(xpTxt, 10)}`;
      else if (rewardType === 'item' && itemReward) reward = itemReward;
      const stat = chEl.querySelector('.choiceStat').value.trim();
      const dcTxt = chEl.querySelector('.choiceDC').value.trim();
      const dc = dcTxt ? parseInt(dcTxt, 10) : undefined;
      const success = chEl.querySelector('.choiceSuccess').value.trim();
      const failure = chEl.querySelector('.choiceFailure').value.trim();
      const costItem = chEl.querySelector('.choiceCostItem').value.trim();
      const costSlot = chEl.querySelector('.choiceCostSlot').value.trim();
      const reqItem = chEl.querySelector('.choiceReqItem').value.trim();
      const reqSlot = chEl.querySelector('.choiceReqSlot').value.trim();
      const joinId = chEl.querySelector('.choiceJoinId').value.trim();
      const joinName = chEl.querySelector('.choiceJoinName').value.trim();
      const joinRole = chEl.querySelector('.choiceJoinRole').value.trim();
      const gotoMap = chEl.querySelector('.choiceGotoMap').value.trim();
      const gotoXTxt = chEl.querySelector('.choiceGotoX').value.trim();
      const gotoYTxt = chEl.querySelector('.choiceGotoY').value.trim();
      const gotoTarget = chEl.querySelector('.choiceGotoTarget').value;
      const gotoRel = chEl.querySelector('.choiceGotoRel').checked;
      const q = chEl.querySelector('.choiceQ').value.trim();
      const once = chEl.querySelector('.choiceOnce').checked;
      const flag = chEl.querySelector('.choiceFlag').value.trim();
      const op = chEl.querySelector('.choiceOp').value;
      const valTxt = chEl.querySelector('.choiceVal').value.trim();
      const val = valTxt ? parseInt(valTxt, 10) : undefined;

      choiceRefs.push({ to, el: toEl });

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
        const boardId = chEl.querySelector('.choiceBoard')?.value.trim();
        const unboardId = chEl.querySelector('.choiceUnboard')?.value.trim();
        if (flag) c.if = { flag, op, value: val != null && !Number.isNaN(val) ? val : 0 };
        const effs = [];
        if (boardId) effs.push({ effect: 'boardDoor', interiorId: boardId });
        if (unboardId) effs.push({ effect: 'unboardDoor', interiorId: unboardId });
        if (effs.length) c.effects = effs;
        choices.push(c);
      }
    });

    const nodeData = { text, choices };
    newTree[id] = nodeData;
  });

  // Commit + mirror into textarea for persistence/preview
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
function setNpcPortrait() {
  const el = document.getElementById('npcPort');
  const img = npcPortraits[npcPortraitIndex];
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
function applyShopTree(tree) {
  tree.start = tree.start || { text: '', choices: [] };
  if (!tree.start.choices.some(c => c.to === 'sell'))
    tree.start.choices.push({ label: '(Sell items)', to: 'sell' });
  tree.sell = tree.sell || { text: 'What are you selling?', choices: [] };
}
function removeShopTree(tree) {
  if (tree.start && Array.isArray(tree.start.choices))
    tree.start.choices = tree.start.choices.filter(c => c.to !== 'sell');
  delete tree.sell;
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
  document.getElementById('npcDesc').value = '';
  document.getElementById('npcColor').value = '#9ef7a0';
  document.getElementById('npcMap').value = 'world';
  document.getElementById('npcX').value = 0;
  document.getElementById('npcY').value = 0;
  renderLoopFields([]);
  npcPortraitIndex = 0;
  setNpcPortrait();
  document.getElementById('npcHidden').checked = false;
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
  document.getElementById('npcCombat').checked = false;
  document.getElementById('npcShop').checked = false;
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
}

function beginPlaceNPC() {
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
  const desc = document.getElementById('npcDesc').value.trim();
  const color = document.getElementById('npcColor').value.trim() || '#fff';
  const map = document.getElementById('npcMap').value.trim() || 'world';
  const x = parseInt(document.getElementById('npcX').value, 10) || 0;
  const y = parseInt(document.getElementById('npcY').value, 10) || 0;
  const dialog = document.getElementById('npcDialog').value.trim();
  const questId = document.getElementById('npcQuest').value.trim();
  const accept = document.getElementById('npcAccept').value.trim();
  const turnin = document.getElementById('npcTurnin').value.trim();
  const combat = document.getElementById('npcCombat').checked;
  const shop = document.getElementById('npcShop').checked;
  const hidden = document.getElementById('npcHidden').checked;
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
  if (shop) applyShopTree(tree); else removeShopTree(tree);
  document.getElementById('npcTree').value = JSON.stringify(tree, null, 2);
  loadTreeEditor();

  const npc = { id, name, desc, color, map, x, y, tree, questId };
  const pts = gatherLoopFields();
  if (pts.length >= 2) npc.loop = pts;
  if (combat) npc.combat = { DEF: 5 };
  if (shop) npc.shop = true;
  if (hidden && flag) npc.hidden = true, npc.reveal = { flag, op, value: val };
  if (npcPortraitIndex > 0) npc.portraitSheet = npcPortraits[npcPortraitIndex];
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
}

function cancelNPC() {
  placingType = null;
  placingPos = null;
  placingCb = null;
  document.getElementById('addNPC').style.display = 'block';
  document.getElementById('cancelNPC').style.display = 'none';
  drawWorld();
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
}
function editNPC(i) {
  const n = moduleData.npcs[i];
  editNPCIdx = i;
  document.getElementById('npcId').value = n.id;
  document.getElementById('npcName').value = n.name;
  document.getElementById('npcDesc').value = n.desc || '';
  document.getElementById('npcColor').value = n.color;
  document.getElementById('npcMap').value = n.map;
  document.getElementById('npcX').value = n.x;
  document.getElementById('npcY').value = n.y;
  renderLoopFields(n.loop || []);
  npcPortraitIndex = npcPortraits.indexOf(n.portraitSheet);
  if (npcPortraitIndex < 0) npcPortraitIndex = 0;
  setNpcPortrait();
  document.getElementById('npcHidden').checked = !!n.hidden;
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
  document.getElementById('npcCombat').checked = !!n.combat;
  document.getElementById('npcShop').checked = !!n.shop;
  updateNPCOptSections();
  document.getElementById('addNPC').style.display = 'none';
  document.getElementById('cancelNPC').style.display = 'none';
  document.getElementById('delNPC').style.display = 'block';
  loadTreeEditor();
  toggleQuestDialogBtn();
  showNPCEditor(true);
  selectedObj = { type: 'npc', obj: n };
  drawWorld();
}
function renderNPCList() {
  const list = document.getElementById('npcList');
  list.innerHTML = moduleData.npcs.map((n, i) => `<div data-idx="${i}">${n.id} @${n.map} (${n.x},${n.y})${n.questId ? ` [${n.questId}]` : ''}</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editNPC(parseInt(div.dataset.idx, 10)));
  updateQuestOptions();
  refreshChoiceDropdowns();
}

function deleteNPC() {
  if (editNPCIdx < 0) return;
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
}

function beginPlaceItem() {
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
  const item = { id, name, type, tags, map, x, y, slot, mods, value, use, equip };
  if (editItemIdx >= 0) {
    moduleData.items[editItemIdx] = item;
  } else {
    moduleData.items.push(item);
  }
  editItemIdx = -1;
  document.getElementById('addItem').textContent = 'Add Item';
  document.getElementById('cancelItem').style.display = 'none';
  document.getElementById('delItem').style.display = 'none';
  loadMods({});
  renderItemList();
  selectedObj = null;
  drawWorld();
  showItemEditor(false);
}

function cancelItem() {
  placingType = null;
  placingPos = null;
  placingCb = null;
  document.getElementById('addItem').style.display = 'block';
  document.getElementById('cancelItem').style.display = 'none';
  drawWorld();
  updateCursor();
}
function editItem(i) {
  const it = moduleData.items[i];
  editItemIdx = i;
  document.getElementById('itemName').value = it.name;
  document.getElementById('itemId').value = it.id;
  document.getElementById('itemType').value = it.type || '';
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
  list.innerHTML = moduleData.items.map((it, i) => `<div data-idx="${i}">${it.name} @${it.map} (${it.x},${it.y})</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editItem(parseInt(div.dataset.idx, 10)));
  refreshChoiceDropdowns();
}

function deleteItem() {
  if (editItemIdx < 0) return;
  moduleData.items.splice(editItemIdx, 1);
  editItemIdx = -1;
  document.getElementById('addItem').textContent = 'Add Item';
  document.getElementById('delItem').style.display = 'none';
  loadMods({});
  renderItemList();
  selectedObj = null;
  drawWorld();
  showItemEditor(false);
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
  moduleData.events.splice(editEventIdx, 1);
  editEventIdx = -1;
  document.getElementById('addEvent').textContent = 'Add Event';
  document.getElementById('delEvent').style.display = 'none';
  renderEventList();
  selectedObj = null;
  drawWorld();
  showEventEditor(false);
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
  const b = placeHut(x,y,{interiorId, grid:bldgGrid});
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
  list.innerHTML = moduleData.buildings.map((b, i) => `<div data-idx="${i}">Bldg @(${b.x},${b.y})</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editBldg(parseInt(div.dataset.idx, 10)));
}

function editBldg(i) {
  const b = moduleData.buildings[i];
  editBldgIdx = i;
  document.getElementById('bldgX').value = b.x;
  document.getElementById('bldgY').value = b.y;
  document.getElementById('bldgW').value = b.w;
  document.getElementById('bldgH').value = b.h;
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
  const b = placeHut(x, y, { interiorId, grid: bldgGrid, boarded: ob.boarded });
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
}

function applyLoadedModule(data) {
  moduleData.seed = data.seed || Date.now();
  moduleData.name = data.name || 'adventure-module';
  moduleData.npcs = data.npcs || [];
  moduleData.items = data.items || [];
  moduleData.quests = data.quests || [];
  moduleData.buildings = data.buildings || [];
  moduleData.interiors = (data.interiors || []).map(I => {
    const g = I.grid && typeof I.grid[0] === 'string' ? gridFromEmoji(I.grid) : I.grid;
    return { ...I, grid: g };
  });
  moduleData.portals = data.portals || [];
  moduleData.events = data.events || [];
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
  moduleData.buildings.forEach(b => placeHut(b.x, b.y, b));
  moduleData.buildings = [...buildings];

  drawWorld();
  renderNPCList();
  renderItemList();
  renderBldgList();
  renderInteriorList();
  renderPortalList();
  renderQuestList();
  renderEventList();
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
  if(!walkable[world[s.y][s.x]]) issues.push('Player start is on blocked tile');
  moduleData.npcs.filter(n=>n.map==='world').forEach(n=>{ if(!walkable[world[n.y][n.x]]) issues.push('NPC '+(n.id||'')+' on blocked tile'); });
  moduleData.items.filter(it=>it.map==='world').forEach(it=>{ if(!walkable[world[it.y][it.x]]) issues.push('Item '+it.id+' on blocked tile'); });
  if(issues.length){ alert('Fix spawn locations:\n'+issues.join('\n')+'\nHint: water tiles are bright blue and block spawns.'); return false; }
  return true;
}

function saveModule() {
  if(!validateSpawns()) return;
  moduleData.name = document.getElementById('moduleName').value.trim() || 'adventure-module';
  const bldgs = buildings.map(({ under, ...rest }) => rest);
  const ints = moduleData.interiors.map(I => ({...I, grid: gridToEmoji(I.grid)}));
  const data = { ...moduleData, world: gridToEmoji(world), buildings: bldgs, interiors: ints };
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
  const data = { ...moduleData, world: gridToEmoji(world), buildings: bldgs, interiors: ints };
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
document.getElementById('delNPC').onclick = deleteNPC;
document.getElementById('closeNPC').onclick = closeNPCEditor;
document.getElementById('npcPrevP').onclick = () => {
  npcPortraitIndex = (npcPortraitIndex + npcPortraits.length - 1) % npcPortraits.length;
  setNpcPortrait();
  applyNPCChanges();
};
document.getElementById('npcNextP').onclick = () => {
  npcPortraitIndex = (npcPortraitIndex + 1) % npcPortraits.length;
  setNpcPortrait();
  applyNPCChanges();
};
document.getElementById('delItem').onclick = deleteItem;
document.getElementById('delBldg').onclick = deleteBldg;
document.getElementById('newInterior').onclick = startNewInterior;
document.getElementById('delInterior').onclick = deleteInterior;
document.getElementById('delQuest').onclick = deleteQuest;
document.getElementById('delEvent').onclick = deleteEvent;
document.getElementById('delPortal').onclick = deletePortal;
document.getElementById('addMod').onclick = () => modRow();
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
document.getElementById('npcFlagPick').onclick = () => { coordTarget = { x: 'npcFlagX', y: 'npcFlagY' }; };
document.getElementById('portalPick').onclick = () => { coordTarget = { x: 'portalX', y: 'portalY' }; };
document.getElementById('portalDestPick').onclick = () => { coordTarget = { x: 'portalToX', y: 'portalToY' }; };
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
  const sx = baseTileW * worldZoom, sy = baseTileH * worldZoom;
  const x = clamp(Math.floor((ev.clientX - rect.left) / sx + panX), 0, WORLD_W - 1);
  const y = clamp(Math.floor((ev.clientY - rect.top) / sy + panY), 0, WORLD_H - 1);
  return { x, y };
}

function updateCursor(x, y) {
  if (panning) {
    canvas.style.cursor = 'grabbing';
    return;
  }
  if (worldPaint != null || worldStamp) {
    canvas.style.cursor = 'crosshair';
    return;
  }
  if (dragTarget) {
    canvas.style.cursor = 'grabbing';
    return;
  }
  if (settingStart || placingType) {
    canvas.style.cursor = 'crosshair';
    return;
  }
  if (x == null || y == null) {
    const ht = hoverTile;
    if (ht) { x = ht.x; y = ht.y; }
  }
  if (x != null && y != null) {
    const overNpc = moduleData.npcs.some(n => n.map === 'world' && n.x === x && n.y === y);
    const overItem = moduleData.items.some(it => it.map === 'world' && it.x === x && it.y === y);
    const overBldg = moduleData.buildings.some(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
    const overStart = moduleData.start && moduleData.start.map === 'world' && moduleData.start.x === x && moduleData.start.y === y;
    const overEvent = moduleData.events.some(ev => ev.map === 'world' && ev.x === x && ev.y === y);
    const overPortal = moduleData.portals.some(p => p.map === 'world' && p.x === x && p.y === y);
    canvas.style.cursor = (overNpc || overItem || overBldg || overStart || overEvent || overPortal) ? 'grab' : 'pointer';
  } else {
    canvas.style.cursor = 'pointer';
  }
}
canvas.addEventListener('mousedown', ev => {
  if (ev.button === 2) {
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
  const overNpc = moduleData.npcs.some(n => n.map === 'world' && n.x === x && n.y === y);
  const overItem = moduleData.items.some(it => it.map === 'world' && it.x === x && it.y === y);
  const overBldg = moduleData.buildings.some(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
  const overStart = moduleData.start && moduleData.start.map === 'world' && moduleData.start.x === x && moduleData.start.y === y;
  const overEvent = moduleData.events.some(ev2 => ev2.map === 'world' && ev2.x === x && ev2.y === y);
  const overPortal = moduleData.portals.some(p => p.map === 'world' && p.x === x && p.y === y);
  if (worldStamp && !coordTarget && !(overNpc || overItem || overBldg || overStart || overEvent || overPortal)) {
    stampWorld(x, y, worldStamp);
    drawWorld();
    updateCursor(x, y);
    return;
  }
  if (worldPaint != null && !coordTarget && !(overNpc || overItem || overBldg || overStart || overEvent || overPortal)) {
    worldPainting = true;
    hoverTile = { x, y };
    addTerrainFeature(x, y, worldPaint);
    didPaint = true;
    drawWorld();
    updateCursor(x, y);
    return;
  }
  hoverTarget = null;
  didDrag = false;
  if (coordTarget) {
    document.getElementById(coordTarget.x).value = x;
    document.getElementById(coordTarget.y).value = y;
    coordTarget = null;
    canvas.style.cursor = '';
    drawWorld();
    return;
  }
  if (placingType) {
    if (placingType === 'npc') {
      document.getElementById('npcX').value = x;
      document.getElementById('npcY').value = y;
      if (placingCb) placingCb();
      document.getElementById('cancelNPC').style.display = 'none';
    } else if (placingType === 'item') {
      document.getElementById('itemX').value = x;
      document.getElementById('itemY').value = y;
      if (placingCb) placingCb();
      document.getElementById('cancelItem').style.display = 'none';
    } else if (placingType === 'bldg') {
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
  if (settingStart) {
    moduleData.start = { map: 'world', x, y };
    settingStart = false;
    drawWorld();
    updateCursor(x, y);
    return;
  }
  if (moduleData.start && moduleData.start.map === 'world' && moduleData.start.x === x && moduleData.start.y === y) {
    dragTarget = moduleData.start;
    dragTarget._type = 'start';
    updateCursor(x, y);
    return;
  }
  if (selectedObj && selectedObj.type === 'npc' && selectedObj.obj.loop) {
    const idx = selectedObj.obj.loop.findIndex(p => p.x === x && p.y === y);
    if (idx >= 0) {
      dragTarget = { _type: 'loop', npc: selectedObj.obj, idx };
      updateCursor(x, y);
      return;
    }
  }
  dragTarget = moduleData.npcs.find(n => n.map === 'world' && n.x === x && n.y === y);
  if (dragTarget) {
    dragTarget._type = 'npc';
    updateCursor(x, y);
    return;
  }
  dragTarget = moduleData.items.find(it => it.map === 'world' && it.x === x && it.y === y);
  if (dragTarget) {
    dragTarget._type = 'item';
    updateCursor(x, y);
    return;
  }
  dragTarget = moduleData.buildings.find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
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
  if (worldStamp) drawWorld();
  if (worldPainting && worldPaint != null) {
    addTerrainFeature(x, y, worldPaint);
    didPaint = true;
    drawWorld();
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
  let obj = moduleData.npcs.find(n => n.map === 'world' && n.x === x && n.y === y);
  if (obj) {
    ht = { obj, type: 'npc' };
  } else if (obj = moduleData.items.find(it => it.map === 'world' && it.x === x && it.y === y)) {
    ht = { obj, type: 'item' };
  } else if (obj = moduleData.buildings.find(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h)) {
    ht = { obj, type: 'bldg' };
  } else if (obj = moduleData.events.find(ev => ev.map === 'world' && ev.x === x && ev.y === y)) {
    ht = { obj, type: 'event' };
  } else if (obj = moduleData.portals.find(p => p.map === 'world' && p.x === x && p.y === y)) {
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
  if (dragTarget) delete dragTarget._type;
  dragTarget = null;
  if (didPaint) {
    redrawBuildings();
    drawWorld();
  }
  updateCursor();
});
canvas.addEventListener('mouseleave', () => {
  if (panning) panning = false;
  if (didPaint) {
    redrawBuildings();
  }
  worldPainting = false;
  if (dragTarget) delete dragTarget._type;
  dragTarget = null;
  hoverTile = null;
  didPaint = false;
  drawWorld();
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
  let idx = moduleData.npcs.findIndex(n => n.map === 'world' && n.x === x && n.y === y);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('npc');
    editNPC(idx);
    return;
  }
  idx = moduleData.items.findIndex(it => it.map === 'world' && it.x === x && it.y === y);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('items');
    editItem(idx);
    return;
  }
  idx = moduleData.buildings.findIndex(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('buildings');
    editBldg(idx);
    return;
  }
  idx = moduleData.events.findIndex(ev => ev.map === 'world' && ev.x === x && ev.y === y);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('events');
    editEvent(idx);
    return;
  }
  idx = moduleData.portals.findIndex(p => p.map === 'world' && p.x === x && p.y === y);
  if (idx >= 0) {
    if (window.showEditorTab) window.showEditorTab('portals');
    editPortal(idx);
  }
});

canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('wheel', ev => {
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

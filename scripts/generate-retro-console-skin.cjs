#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'assets', 'skins', 'retro-console');

const palette = {
  midnight: '#0A0B2E',
  indigo: '#1F2F98',
  cobalt: '#1146D3',
  azure: '#38A7FF',
  neon: '#00F6FF',
  peach: '#FF7F3F',
  gold: '#FEDA4A',
  crimson: '#E52B20',
  emerald: '#38B653',
  mint: '#71FFB2',
  plum: '#6D24B2',
  lilac: '#B085FF',
  slate: '#1C1F3A',
  shadow: '#05060F'
};

function parseMeta(svg, file) {
  const widthMatch = svg.match(/width="([^"]+)"/);
  const heightMatch = svg.match(/height="([^"]+)"/);
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  if (!widthMatch || !heightMatch || !viewBoxMatch) {
    throw new Error(`Missing dimensions in ${file}`);
  }
  const widthAttr = widthMatch[1];
  const heightAttr = heightMatch[1];
  const viewBox = viewBoxMatch[1];
  const viewParts = viewBox.split(/\s+/).map(Number);
  const w = viewParts[2];
  const h = viewParts[3];
  return { widthAttr, heightAttr, viewBox, width: w, height: h };
}

function toKey(name) {
  return name.replace(/\.svg$/, '').replace(/[^a-z0-9]+/gi, '-');
}

function starPath(cx, cy, outerRadius, innerRadius, rotationDeg) {
  const rotation = (rotationDeg ?? -18) * Math.PI / 180;
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = rotation + (Math.PI / 5) * i;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${points[0]}L${points.slice(1).join(' ')}Z`;
}

function pixelRect(x, y, w, h, size, fill, opacity) {
  const width = (w * size).toFixed(2);
  const height = (h * size).toFixed(2);
  const px = (x * size).toFixed(2);
  const py = (y * size).toFixed(2);
  const opacityAttr = opacity !== undefined ? ` fill-opacity="${opacity}"` : '';
  return `<rect x="${px}" y="${py}" width="${width}" height="${height}" fill="${fill}"${opacityAttr}/>`;
}

function pixelQuestionBlock(x, y, size) {
  const unit = size / 6;
  const innerSize = size - unit * 2;
  const block = [
    `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${size.toFixed(2)}" height="${size.toFixed(2)}" rx="${(unit * 1.2).toFixed(2)}" fill="${palette.gold}" stroke="#F0B400" stroke-width="${(unit * 0.6).toFixed(2)}"/>`,
    `<rect x="${(x + unit).toFixed(2)}" y="${(y + unit).toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" rx="${(unit * 0.8).toFixed(2)}" fill="#FFEF9A"/>`
  ];
  const px = (pxVal, pyVal, wVal = 1, hVal = 1) => pixelRect(pxVal, pyVal, wVal, hVal, unit, palette.crimson, 0.8);
  const offsetX = x / unit;
  const offsetY = y / unit;
  block.push(px(offsetX + 1.2, offsetY + 2));
  block.push(px(offsetX + 2.2, offsetY + 2));
  block.push(px(offsetX + 3.2, offsetY + 2));
  block.push(px(offsetX + 1.2, offsetY + 3));
  block.push(px(offsetX + 2.2, offsetY + 3));
  block.push(px(offsetX + 3.2, offsetY + 3));
  block.push(px(offsetX + 2.2, offsetY + 4));
  block.push(px(offsetX + 2.2, offsetY + 5));
  return block.join('');
}

function createDefs(key, options) {
  const { top, bottom, shine } = options;
  return `\n  <defs>\n    <linearGradient id="grad-${key}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">\n      <stop offset="0" stop-color="${top}"/>\n      <stop offset="1" stop-color="${bottom}"/>\n    </linearGradient>\n    <linearGradient id="shine-${key}" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">\n      <stop offset="0" stop-color="#FFFFFF" stop-opacity="${shine?.top ?? 0.55}"/>\n      <stop offset="0.5" stop-color="#FFFFFF" stop-opacity="${shine?.mid ?? 0.15}"/>\n      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>\n    </linearGradient>\n    <pattern id="grid-${key}" width="8" height="8" patternUnits="userSpaceOnUse">\n      <rect width="8" height="8" fill="#FFFFFF" fill-opacity="0.05"/>\n      <rect width="4" height="4" fill="#000000" fill-opacity="0.12"/>\n      <rect x="4" y="4" width="4" height="4" fill="#000000" fill-opacity="0.08"/>\n    </pattern>\n    <radialGradient id="spark-${key}" cx="0.5" cy="0.5" r="0.6">\n      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9"/>\n      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>\n    </radialGradient>\n  </defs>\n`;
}

function createCircuitry(width, height, stroke) {
  const pad = Math.min(width, height) * 0.08;
  const nodes = [];
  nodes.push(`<path d="M${pad.toFixed(2)} ${pad.toFixed(2)}H${(width - pad).toFixed(2)}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-dasharray="8 6"/>`);
  nodes.push(`<path d="M${pad.toFixed(2)} ${(height / 2).toFixed(2)}H${(width - pad * 0.6).toFixed(2)}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-dasharray="6 6"/>`);
  nodes.push(`<circle cx="${(pad * 1.1).toFixed(2)}" cy="${(height / 2).toFixed(2)}" r="4" fill="${palette.gold}" stroke="${stroke}" stroke-width="2"/>`);
  nodes.push(`<circle cx="${(width - pad * 0.6).toFixed(2)}" cy="${(height / 2).toFixed(2)}" r="4" fill="${palette.neon}" stroke="${stroke}" stroke-width="2"/>`);
  nodes.push(`<path d="M${(width / 2).toFixed(2)} ${(height - pad).toFixed(2)}V${(pad * 0.8).toFixed(2)}" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-dasharray="6 4"/>`);
  nodes.push(`<circle cx="${(width / 2).toFixed(2)}" cy="${(pad * 0.8).toFixed(2)}" r="3" fill="${palette.peach}" stroke="${stroke}" stroke-width="1.5"/>`);
  const traceGap = Math.max(width, height) * 0.18;
  const traceWidth = Math.min(width, height) * 0.015;
  for (let i = 1; i <= 2; i += 1) {
    const x = pad + i * traceGap;
    nodes.push(`<rect x="${x.toFixed(2)}" y="${(pad * 0.8).toFixed(2)}" width="${traceWidth.toFixed(2)}" height="${(height - pad * 1.6).toFixed(2)}" fill="${palette.shadow}" stroke="${stroke}" stroke-width="1.5" rx="${(traceWidth / 2).toFixed(2)}"/>`);
    nodes.push(`<circle cx="${x.toFixed(2)}" cy="${(height * 0.25).toFixed(2)}" r="2.4" fill="${palette.neon}"/>`);
    nodes.push(`<circle cx="${x.toFixed(2)}" cy="${(height * 0.75).toFixed(2)}" r="2.4" fill="${palette.peach}"/>`);
  }
  const diagOffset = Math.min(width, height) * 0.22;
  nodes.push(`<path d="M${pad.toFixed(2)} ${(height - pad).toFixed(2)}L${(pad + diagOffset).toFixed(2)} ${(height - pad * 0.6).toFixed(2)}" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="4 4"/>`);
  nodes.push(`<path d="M${(width - pad).toFixed(2)} ${pad.toFixed(2)}L${(width - pad - diagOffset).toFixed(2)} ${(pad * 0.6).toFixed(2)}" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="4 4"/>`);
  const chipSize = Math.min(width, height) * 0.12;
  const chipPositions = [
    { x: pad * 1.1, y: height * 0.22 },
    { x: width - pad * 1.1 - chipSize, y: height * 0.62 }
  ];
  const accentColors = [palette.neon, palette.peach, palette.azure];
  chipPositions.forEach((chip, index) => {
    const cx = chip.x + chipSize / 2;
    const cy = chip.y + chipSize / 2;
    const accent = accentColors[index % accentColors.length];
    nodes.push(`<rect x="${chip.x.toFixed(2)}" y="${chip.y.toFixed(2)}" width="${chipSize.toFixed(2)}" height="${chipSize.toFixed(2)}" rx="6" fill="${palette.shadow}" stroke="${stroke}" stroke-width="2"/>`);
    nodes.push(`<rect x="${(chip.x + chipSize * 0.18).toFixed(2)}" y="${(chip.y + chipSize * 0.18).toFixed(2)}" width="${(chipSize * 0.64).toFixed(2)}" height="${(chipSize * 0.64).toFixed(2)}" rx="4" fill="${accent}" fill-opacity="0.35" stroke="${accent}" stroke-opacity="0.6" stroke-width="1.4"/>`);
    nodes.push(`<path d="M${cx.toFixed(2)} ${(chip.y + chipSize).toFixed(2)}V${(cy + chipSize * 0.68).toFixed(2)}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 3"/>`);
    nodes.push(`<path d="M${(chip.x + chipSize).toFixed(2)} ${cy.toFixed(2)}H${(cx + chipSize * 0.68).toFixed(2)}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="3 3"/>`);
    nodes.push(`<path d="${starPath(cx, cy, chipSize * 0.24, chipSize * 0.1)}" fill="${palette.gold}" fill-opacity="0.65" stroke="#F3A400" stroke-width="1.5"/>`);
  });
  return nodes.join('');
}

function createButton(meta, key, variant) {
  const { width, height } = meta;
  const radius = Math.min(width, height) * 0.32;
  const defs = createDefs(key, {
    top: variant.top,
    bottom: variant.bottom,
    shine: { top: 0.75, mid: 0.2 }
  });
  const innerRadius = radius - 4;
  const question = pixelQuestionBlock(width - height * 0.55, height * 0.2, height * 0.45);
  const star = `<path d="${starPath(height * 0.32, height * 0.32, height * 0.18, height * 0.08)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="2"/>`;
  const body = `
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${radius.toFixed(2)}" fill="url(#grad-${key})" stroke="${variant.border}" stroke-width="4"/>
    <rect x="6" y="6" width="${(width - 12).toFixed(2)}" height="${(height - 12).toFixed(2)}" rx="${innerRadius.toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.35"/>
    <rect x="6" y="6" width="${(width - 12).toFixed(2)}" height="${(height - 12).toFixed(2)}" rx="${innerRadius.toFixed(2)}" fill="url(#shine-${key})"/>
    <g transform="translate(6 6)" opacity="0.85">${createCircuitry(width - 12, height - 12, variant.circuit)}</g>
    <g transform="translate(6 6)">${star}</g>
    ${question}
  `;
  return { defs, body };
}
function createOverlay(meta, key, color, opacity) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <radialGradient id="vignette-${key}" cx="0.5" cy="0.5" r="0.75">\n      <stop offset="0" stop-color="${color}" stop-opacity="${opacity * 0.2}"/>\n      <stop offset="1" stop-color="${palette.shadow}" stop-opacity="${opacity}"/>\n    </radialGradient>\n  </defs>\n`;
  const body = `<rect width="${width}" height="${height}" fill="url(#vignette-${key})"/>`;
  return { defs, body };
}

function createPanel(meta, key, options) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: options.top, bottom: options.bottom, shine: { top: 0.65, mid: 0.15 } });
  const borderRadius = Math.min(width, height) * (options.radius ?? 0.12);
  const innerRadius = Math.max(borderRadius - 10, 4);
  const topStripeHeight = Math.max(height * 0.12, 32);
  const bottomStripeHeight = Math.max(height * 0.12, 28);
  const stars = `
    <path d="${starPath(width * 0.12, height * 0.18, Math.min(width, height) * 0.08, Math.min(width, height) * 0.035)}" fill="${options.star ?? palette.gold}" stroke="#F3A400" stroke-width="3"/>
    <path d="${starPath(width - width * 0.12, height * 0.82, Math.min(width, height) * 0.07, Math.min(width, height) * 0.03, 12)}" fill="${palette.peach}" stroke="#F36228" stroke-width="3"/>
  `;
  const question = pixelQuestionBlock(width * 0.72, height * 0.12, Math.min(width, height) * 0.18);
  const circuitry = createCircuitry(width - 32, height - 32, options.circuit ?? palette.neon);
  const body = `
    <rect x="4" y="4" width="${(width - 8).toFixed(2)}" height="${(height - 8).toFixed(2)}" rx="${borderRadius.toFixed(2)}" fill="url(#grad-${key})" stroke="${options.border ?? palette.azure}" stroke-width="8"/>
    <rect x="16" y="16" width="${(width - 32).toFixed(2)}" height="${(height - 32).toFixed(2)}" rx="${innerRadius.toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.35" stroke="${palette.shadow}" stroke-opacity="0.3" stroke-width="2"/>
    <rect x="16" y="16" width="${(width - 32).toFixed(2)}" height="${(height - 32).toFixed(2)}" rx="${innerRadius.toFixed(2)}" fill="url(#shine-${key})"/>
    <rect x="16" y="16" width="${(width - 32).toFixed(2)}" height="${topStripeHeight.toFixed(2)}" rx="${(innerRadius * 0.6).toFixed(2)}" fill="${options.header ?? palette.plum}" fill-opacity="0.65"/>
    <rect x="16" y="${(height - 16 - bottomStripeHeight).toFixed(2)}" width="${(width - 32).toFixed(2)}" height="${bottomStripeHeight.toFixed(2)}" rx="${(innerRadius * 0.6).toFixed(2)}" fill="${options.footer ?? palette.midnight}" fill-opacity="0.85"/>
    <g transform="translate(16 16)" opacity="0.9">${circuitry}</g>
    ${stars}
    ${question}
  `;
  return { defs, body };
}

function createCard(meta, key, options) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: options.top, bottom: options.bottom, shine: { top: 0.55, mid: 0.1 } });
  const radius = Math.min(width, height) * 0.16;
  const accentHeight = Math.max(height * 0.22, 40);
  const star = `<path d="${starPath(width * 0.85, accentHeight * 0.6, Math.min(width, height) * 0.08, Math.min(width, height) * 0.035)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="2"/>`;
  const question = pixelQuestionBlock(width * 0.08, height - accentHeight * 1.1, Math.min(width, height) * 0.2);
  const body = `
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${radius.toFixed(2)}" fill="url(#grad-${key})" stroke="${options.border ?? palette.azure}" stroke-width="4"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 8).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.3"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${accentHeight.toFixed(2)}" rx="${(radius * 0.8).toFixed(2)}" fill="${options.accent ?? palette.crimson}" fill-opacity="0.85"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 8).toFixed(2)}" fill="url(#shine-${key})"/>
    <g>${createCircuitry(width - 20, height - 20, options.circuit ?? palette.neon)}</g>
    ${star}
    ${question}
  `;
  return { defs, body };
}

function createRingIcon(meta, key, options) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <radialGradient id="ring-${key}" cx="0.5" cy="0.5" r="0.55">\n      <stop offset="0" stop-color="${options.inner}"/>\n      <stop offset="1" stop-color="${options.outer}"/>\n    </radialGradient>\n    <radialGradient id="spark-${key}" cx="0.32" cy="0.32" r="0.6">\n      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.9"/>\n      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>\n    </radialGradient>\n  </defs>\n`;
  const radius = Math.min(width, height) / 2 - 6;
  const inner = radius * 0.55;
  const star = `<path d="${starPath(width / 2, height / 2, radius * 0.55, radius * 0.24)}" fill="${options.star ?? palette.gold}" stroke="#F3A400" stroke-width="2"/>`;
  const body = `
    <circle cx="${(width / 2).toFixed(2)}" cy="${(height / 2).toFixed(2)}" r="${(radius + 4).toFixed(2)}" fill="${palette.shadow}"/>
    <circle cx="${(width / 2).toFixed(2)}" cy="${(height / 2).toFixed(2)}" r="${radius.toFixed(2)}" fill="url(#ring-${key})" stroke="${options.border ?? palette.azure}" stroke-width="5"/>
    <circle cx="${(width / 2).toFixed(2)}" cy="${(height / 2).toFixed(2)}" r="${inner.toFixed(2)}" fill="${options.core ?? palette.midnight}" stroke="${palette.shadow}" stroke-width="3"/>
    <circle cx="${(width / 2).toFixed(2)}" cy="${(height / 2).toFixed(2)}" r="${(inner * 0.65).toFixed(2)}" fill="url(#spark-${key})"/>
    ${options.detail ?? ''}
    ${star}
  `;
  return { defs, body };
}

function createGauge(meta, key, colors) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="fill-${key}" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="${colors.start}"/>\n      <stop offset="1" stop-color="${colors.end}"/>\n    </linearGradient>\n    <pattern id="pulse-${key}" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="skewX(-18)">\n      <rect width="12" height="12" fill="#FFFFFF" fill-opacity="0.06"/>\n      <rect width="6" height="12" fill="#FFFFFF" fill-opacity="0.1"/>\n    </pattern>\n  </defs>\n`;
  const body = `
    <rect width="${width}" height="${height}" rx="${Math.min(width, height) * 0.4}" fill="#05060F"/>
    <rect x="3" y="3" width="${(width - 6).toFixed(2)}" height="${(height - 6).toFixed(2)}" rx="${Math.min(width, height) * 0.35}" fill="url(#fill-${key})"/>
    <rect x="3" y="3" width="${(width - 6).toFixed(2)}" height="${(height - 6).toFixed(2)}" rx="${Math.min(width, height) * 0.35}" fill="url(#pulse-${key})"/>
  `;
  return { defs, body };
}

function createSlotHighlight(meta, key, colors) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: colors.top, bottom: colors.bottom, shine: { top: 0.45, mid: 0.12 } });
  const radius = Math.min(width, height) * 0.16;
  const body = `
    <rect x="1" y="1" width="${(width - 2).toFixed(2)}" height="${(height - 2).toFixed(2)}" rx="${radius.toFixed(2)}" fill="url(#grad-${key})" stroke="${colors.border}" stroke-width="2"/>
    <rect x="6" y="6" width="${(width - 12).toFixed(2)}" height="${(height - 12).toFixed(2)}" rx="${(radius - 4).toFixed(2)}" fill="url(#shine-${key})"/>
    <rect x="6" y="6" width="${(width - 12).toFixed(2)}" height="${(height - 12).toFixed(2)}" rx="${(radius - 4).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.28"/>
  `;
  return { defs, body };
}

function createTileAtlas(meta, key) {
  const { width, height } = meta;
  const cols = 8;
  const rows = 8;
  const cellW = width / cols;
  const cellH = height / rows;
  const defs = `\n  <defs>\n    <linearGradient id="atlas-${key}" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0" stop-color="${palette.indigo}"/>\n      <stop offset="1" stop-color="${palette.midnight}"/>\n    </linearGradient>\n  </defs>\n`;
  const cells = [];
  const colors = [palette.gold, palette.peach, palette.azure, palette.neon, palette.crimson, palette.emerald, palette.lilac, palette.plum];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const idx = (y * cols + x) % colors.length;
      const px = x * cellW;
      const py = y * cellH;
      const cellColor = colors[idx];
      const star = `<path d="${starPath(px + cellW / 2, py + cellH / 2, cellW * 0.24, cellW * 0.1)}" fill="${cellColor}" fill-opacity="0.75" stroke="#FFFFFF" stroke-width="1.2"/>`;
      const block = pixelQuestionBlock(px + cellW * 0.18, py + cellH * 0.18, Math.min(cellW, cellH) * 0.45);
      const overlay = (x + y) % 2 === 0 ? star : block;
      cells.push(`<g>${overlay}</g>`);
    }
  }
  const grid = [];
  for (let x = 0; x <= cols; x += 1) {
    grid.push(`<line x1="${(x * cellW).toFixed(2)}" y1="0" x2="${(x * cellW).toFixed(2)}" y2="${height}" stroke="#FFFFFF" stroke-opacity="0.12"/>`);
  }
  for (let y = 0; y <= rows; y += 1) {
    grid.push(`<line x1="0" y1="${(y * cellH).toFixed(2)}" x2="${width}" y2="${(y * cellH).toFixed(2)}" stroke="#FFFFFF" stroke-opacity="0.12"/>`);
  }
  const body = `
    <rect width="${width}" height="${height}" fill="url(#atlas-${key})"/>
    ${grid.join('')}
    ${cells.join('\n')}
  `;
  return { defs, body };
}

function createFrameEdge(meta, key, options) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="edge-${key}" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="${options.start}"/>\n      <stop offset="1" stop-color="${options.end}"/>\n    </linearGradient>\n  </defs>\n`;
  const body = `
    <rect width="${width}" height="${height}" fill="#05060F"/>
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" fill="url(#edge-${key})"/>
    <rect x="${(width / 2 - 2).toFixed(2)}" y="${(height * 0.1).toFixed(2)}" width="4" height="${(height * 0.8).toFixed(2)}" fill="#FFFFFF" fill-opacity="0.12"/>
  `;
  return { defs, body };
}

function createFrameCorner(meta, key) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="corner-${key}" x1="0" y1="0" x2="1" y2="1">\n      <stop offset="0" stop-color="${palette.indigo}"/>\n      <stop offset="1" stop-color="${palette.midnight}"/>\n    </linearGradient>\n    <radialGradient id="corner-glow-${key}" cx="0.15" cy="0.15" r="0.9">\n      <stop offset="0" stop-color="${palette.gold}" stop-opacity="0.85"/>\n      <stop offset="1" stop-color="${palette.gold}" stop-opacity="0"/>\n    </radialGradient>\n  </defs>\n`;
  const block = pixelQuestionBlock(width * 0.12, height * 0.12, width * 0.35);
  const star = `<path d="${starPath(width * 0.74, height * 0.74, width * 0.18, width * 0.08)}" fill="${palette.peach}" stroke="#F36228" stroke-width="4"/>`;
  const body = `
    <rect width="${width}" height="${height}" fill="#05060F"/>
    <path d="M0 0H${width}V${height}H0V0Z" fill="url(#corner-${key})"/>
    <path d="M0 0H${(width * 0.45).toFixed(2)}V${(height * 0.45).toFixed(2)}H0V0Z" fill="url(#corner-glow-${key})"/>
    ${block}
    ${star}
  `;
  return { defs, body };
}
function createBadge(meta, key, options) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: options.top, bottom: options.bottom, shine: { top: 0.6, mid: 0.18 } });
  const radius = Math.min(width, height) * 0.32;
  const star = `<path d="${starPath(width / 2, height / 2, radius, radius * 0.45)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>`;
  const body = `
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${radius.toFixed(2)}" fill="url(#grad-${key})" stroke="${options.border ?? palette.azure}" stroke-width="4"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 8).toFixed(2)}" fill="url(#shine-${key})"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 8).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.32"/>
    ${star}
  `;
  return { defs, body };
}

function createToggleChip(meta, key) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="chip-${key}" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="${palette.peach}"/>\n      <stop offset="1" stop-color="${palette.crimson}"/>\n    </linearGradient>\n  </defs>\n`;
  const body = `
    <rect width="${width}" height="${height}" rx="${height / 2}" fill="#05060F"/>
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${(height / 2 - 2).toFixed(2)}" fill="url(#chip-${key})"/>
    <circle cx="${(width - height / 2).toFixed(2)}" cy="${(height / 2).toFixed(2)}" r="${(height / 2 - 4).toFixed(2)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>
    <path d="${starPath(width - height / 2, height / 2, height * 0.24, height * 0.1)}" fill="#FFFFFF" fill-opacity="0.85"/>
  `;
  return { defs, body };
}

function createWeather(meta, key, options) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="weather-${key}" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0" stop-color="${options.top}"/>\n      <stop offset="1" stop-color="${options.bottom}"/>\n    </linearGradient>\n  </defs>\n`;
  const sun = `<path d="${starPath(width * 0.3, height * 0.35, height * 0.16, height * 0.06)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="2"/>`;
  const cloud = `<ellipse cx="${width * 0.55}" cy="${height * 0.6}" rx="${width * 0.32}" ry="${height * 0.26}" fill="#FFFFFF" fill-opacity="0.92" stroke="#D6E4FF" stroke-width="3"/>`;
  const rain = `<g stroke="${palette.azure}" stroke-width="4" stroke-linecap="round">\n      <line x1="${width * 0.3}" y1="${height * 0.75}" x2="${width * 0.24}" y2="${height * 0.92}"/>\n      <line x1="${width * 0.44}" y1="${height * 0.78}" x2="${width * 0.38}" y2="${height * 0.95}"/>\n      <line x1="${width * 0.58}" y1="${height * 0.76}" x2="${width * 0.52}" y2="${height * 0.94}"/>\n    </g>`;
  const body = `
    <rect width="${width}" height="${height}" rx="${Math.min(width, height) * 0.2}" fill="url(#weather-${key})" stroke="${options.border ?? palette.azure}" stroke-width="4"/>
    ${sun}
    ${cloud}
    ${rain}
  `;
  return { defs, body };
}

function createWeatherText(meta, key) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="text-${key}" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="${palette.gold}"/>\n      <stop offset="1" stop-color="${palette.peach}"/>\n    </linearGradient>\n  </defs>\n`;
  const body = `
    <rect x="1" y="1" width="${(width - 2).toFixed(2)}" height="${(height - 2).toFixed(2)}" rx="${height * 0.4}" fill="#05060F" stroke="${palette.azure}" stroke-width="2"/>
    <rect x="6" y="6" width="${(width - 12).toFixed(2)}" height="${(height - 12).toFixed(2)}" rx="${height * 0.35}" fill="url(#text-${key})" fill-opacity="0.85"/>
    <g transform="translate(${(width * 0.15).toFixed(2)} ${(height * 0.25).toFixed(2)})">${pixelQuestionBlock(0, 0, height * 0.5)}</g>
  `;
  return { defs, body };
}

function createInventorySlot(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.slate, bottom: palette.midnight, shine: { top: 0.4, mid: 0.1 } });
  const radius = Math.min(width, height) * 0.18;
  const body = `
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${radius.toFixed(2)}" fill="#05060F" stroke="${palette.azure}" stroke-width="4"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 6).toFixed(2)}" fill="url(#grad-${key})"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 6).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.25"/>
    <path d="${starPath(width / 2, height / 2, Math.min(width, height) * 0.18, Math.min(width, height) * 0.08)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>
  `;
  return { defs, body };
}

function createGlyphStrip(meta, key) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="glyph-${key}" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="${palette.plum}"/>\n      <stop offset="1" stop-color="${palette.lilac}"/>\n    </linearGradient>\n  </defs>\n`;
  const segment = width / 16;
  const shapes = [];
  for (let i = 0; i < 16; i += 1) {
    const cx = i * segment + segment / 2;
    const star = `<path d="${starPath(cx, height / 2, height * 0.35, height * 0.14, i * 12)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="1.5"/>`;
    shapes.push(star);
  }
  const body = `
    <rect width="${width}" height="${height}" fill="#05060F"/>
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${height * 0.3}" fill="url(#glyph-${key})"/>
    ${shapes.join('\n')}
  `;
  return { defs, body };
}

function createInventoryGlyphs(meta, key) {
  const { width, height } = meta;
  const cols = 8;
  const rows = 3;
  const cellW = width / cols;
  const cellH = height / rows;
  const defs = `\n  <defs>\n    <linearGradient id="glyph-set-${key}" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="${palette.azure}"/>\n      <stop offset="1" stop-color="${palette.peach}"/>\n    </linearGradient>\n  </defs>\n`;
  const shapes = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const cx = x * cellW + cellW / 2;
      const cy = y * cellH + cellH / 2;
      const base = y % 2 === 0 ? palette.gold : palette.crimson;
      const detail = starPath(cx, cy, cellH * 0.35, cellH * 0.15, (x + y) * 12);
      shapes.push(`<path d="${detail}" fill="${base}" stroke="#FFFFFF" stroke-width="1"/>`);
    }
  }
  const body = `
    <rect width="${width}" height="${height}" fill="#05060F"/>
    <rect x="4" y="4" width="${(width - 8).toFixed(2)}" height="${(height - 8).toFixed(2)}" rx="12" fill="url(#glyph-set-${key})" fill-opacity="0.85"/>
    ${shapes.join('\n')}
  `;
  return { defs, body };
}

function createDoorOverlay(meta, key) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <radialGradient id="door-${key}" cx="0.5" cy="0.5" r="0.65">\n      <stop offset="0" stop-color="${palette.gold}" stop-opacity="0.7"/>\n      <stop offset="1" stop-color="${palette.peach}" stop-opacity="0"/>\n    </radialGradient>\n  </defs>\n`;
  const body = `
    <rect width="${width}" height="${height}" fill="url(#door-${key})"/>
    <path d="${starPath(width / 2, height / 2, Math.min(width, height) * 0.35, Math.min(width, height) * 0.14)}" fill="${palette.gold}" fill-opacity="0.65"/>
  `;
  return { defs, body };
}

function createSignalCard(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.midnight, bottom: palette.plum, shine: { top: 0.5, mid: 0.15 } });
  const radius = Math.min(width, height) * 0.12;
  const waveform = [];
  const step = (width - 24) / 12;
  for (let i = 0; i < 12; i += 1) {
    const x = 12 + i * step;
    const h = (i % 3 === 0 ? height * 0.6 : height * 0.4);
    waveform.push(`<rect x="${x.toFixed(2)}" y="${(height - h) / 2}" width="${(step * 0.4).toFixed(2)}" height="${h.toFixed(2)}" rx="4" fill="${palette.neon}"/>`);
  }
  const body = `
    <rect x="4" y="4" width="${(width - 8).toFixed(2)}" height="${(height - 8).toFixed(2)}" rx="${radius.toFixed(2)}" fill="url(#grad-${key})" stroke="${palette.azure}" stroke-width="4"/>
    <rect x="12" y="12" width="${(width - 24).toFixed(2)}" height="${(height - 24).toFixed(2)}" rx="${(radius - 4).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.3"/>
    ${waveform.join('')}
    <path d="${starPath(width * 0.85, height * 0.28, Math.min(width, height) * 0.07, Math.min(width, height) * 0.03)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="2"/>
  `;
  return { defs, body };
}
function createWorkbench(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.peach, bottom: palette.crimson, shine: { top: 0.5, mid: 0.12 } });
  const radius = Math.min(width, height) * 0.1;
  const body = `
    <rect x="4" y="4" width="${(width - 8).toFixed(2)}" height="${(height - 8).toFixed(2)}" rx="${radius.toFixed(2)}" fill="url(#grad-${key})" stroke="${palette.gold}" stroke-width="4"/>
    <rect x="14" y="14" width="${(width - 28).toFixed(2)}" height="${(height - 28).toFixed(2)}" rx="${(radius - 4).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.28"/>
    <g stroke="${palette.shadow}" stroke-width="4" stroke-linecap="round">
      <line x1="${(width * 0.18).toFixed(2)}" y1="${(height * 0.72).toFixed(2)}" x2="${(width * 0.82).toFixed(2)}" y2="${(height * 0.72).toFixed(2)}"/>
      <line x1="${(width * 0.32).toFixed(2)}" y1="${(height * 0.42).toFixed(2)}" x2="${(width * 0.32).toFixed(2)}" y2="${(height * 0.72).toFixed(2)}"/>
      <line x1="${(width * 0.68).toFixed(2)}" y1="${(height * 0.42).toFixed(2)}" x2="${(width * 0.68).toFixed(2)}" y2="${(height * 0.72).toFixed(2)}"/>
    </g>
    <path d="${starPath(width * 0.18, height * 0.28, Math.min(width, height) * 0.09, Math.min(width, height) * 0.04)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="2"/>
    ${pixelQuestionBlock(width * 0.66, height * 0.18, Math.min(width, height) * 0.2)}
  `;
  return { defs, body };
}

function createWorldItem(meta, key) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="world-${key}" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0" stop-color="${palette.emerald}"/>\n      <stop offset="1" stop-color="${palette.mint}"/>\n    </linearGradient>\n    <radialGradient id="orb-${key}" cx="0.5" cy="0.5" r="0.6">\n      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.95"/>\n      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>\n    </radialGradient>\n  </defs>\n`;
  const body = `
    <rect width="${width}" height="${height}" rx="${Math.min(width, height) * 0.2}" fill="#05060F"/>
    <rect x="4" y="4" width="${(width - 8).toFixed(2)}" height="${(height - 8).toFixed(2)}" rx="${Math.min(width, height) * 0.16}" fill="url(#world-${key})" stroke="${palette.azure}" stroke-width="3"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.26}" fill="#FFFFFF" fill-opacity="0.92" stroke="${palette.shadow}" stroke-width="2"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.22}" fill="url(#orb-${key})"/>
    <path d="${starPath(width / 2, height / 2, Math.min(width, height) * 0.2, Math.min(width, height) * 0.08)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="2"/>
  `;
  return { defs, body };
}

function createNpcIcon(meta, key, mood) {
  const { width, height } = meta;
  const baseColors = {
    friendly: { top: palette.emerald, bottom: palette.mint, border: palette.azure },
    hostile: { top: palette.crimson, bottom: palette.peach, border: palette.gold },
    quest: { top: palette.gold, bottom: palette.peach, border: palette.crimson }
  };
  const colors = baseColors[mood];
  const defs = createDefs(key, { top: colors.top, bottom: colors.bottom, shine: { top: 0.65, mid: 0.18 } });
  const radius = Math.min(width, height) / 2 - 4;
  const face = mood === 'hostile'
    ? `<path d="M${(width / 2 - radius * 0.6).toFixed(2)} ${(height / 2 + radius * 0.25).toFixed(2)}Q${(width / 2).toFixed(2)} ${(height / 2 - radius * 0.2).toFixed(2)} ${(width / 2 + radius * 0.6).toFixed(2)} ${(height / 2 + radius * 0.25).toFixed(2)}" stroke="#3A042E" stroke-width="6" stroke-linecap="round"/>`
    : `<path d="M${(width / 2 - radius * 0.6).toFixed(2)} ${(height / 2 + radius * 0.2).toFixed(2)}Q${(width / 2).toFixed(2)} ${(height / 2 + radius * 0.5).toFixed(2)} ${(width / 2 + radius * 0.6).toFixed(2)} ${(height / 2 + radius * 0.2).toFixed(2)}" stroke="#0D1B4C" stroke-width="6" stroke-linecap="round"/>`;
  const eyes = mood === 'hostile'
    ? `<g fill="#3A042E"><circle cx="${(width / 2 - radius * 0.45).toFixed(2)}" cy="${(height / 2 - radius * 0.2).toFixed(2)}" r="${(radius * 0.18).toFixed(2)}"/><circle cx="${(width / 2 + radius * 0.45).toFixed(2)}" cy="${(height / 2 - radius * 0.2).toFixed(2)}" r="${(radius * 0.18).toFixed(2)}"/></g>`
    : `<g fill="#0D1B4C"><circle cx="${(width / 2 - radius * 0.35).toFixed(2)}" cy="${(height / 2 - radius * 0.25).toFixed(2)}" r="${(radius * 0.16).toFixed(2)}"/><circle cx="${(width / 2 + radius * 0.35).toFixed(2)}" cy="${(height / 2 - radius * 0.25).toFixed(2)}" r="${(radius * 0.16).toFixed(2)}"/></g>`;
  const question = mood === 'quest' ? pixelQuestionBlock(width / 2 - radius * 0.6, height / 2 - radius * 0.2, radius * 0.8) : '';
  const star = mood !== 'hostile'
    ? `<path d="${starPath(width * 0.8, height * 0.25, radius * 0.45, radius * 0.18)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>`
    : `<path d="${starPath(width * 0.2, height * 0.25, radius * 0.4, radius * 0.16)}" fill="${palette.crimson}" stroke="#7C041B" stroke-width="3"/>`;
  const body = `
    <circle cx="${width / 2}" cy="${height / 2}" r="${radius + 4}" fill="#05060F"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="url(#grad-${key})" stroke="${colors.border}" stroke-width="6"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${(radius * 0.9).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.3"/>
    <circle cx="${width / 2}" cy="${(height / 2 - radius * 0.4).toFixed(2)}" r="${(radius * 0.2).toFixed(2)}" fill="#FFFFFF" fill-opacity="0.85"/>
    ${eyes}
    ${face}
    ${question}
    ${star}
  `;
  return { defs, body };
}

function createPlayerIcon(meta, key, adrenaline) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: adrenaline ? palette.crimson : palette.azure, bottom: adrenaline ? palette.peach : palette.lilac, shine: { top: 0.7, mid: 0.2 } });
  const radius = Math.min(width, height) / 2 - 4;
  const auraColor = adrenaline ? palette.peach : palette.neon;
  const star = `<path d="${starPath(width / 2, height / 2, radius * 0.6, radius * 0.28)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>`;
  const body = `
    <circle cx="${width / 2}" cy="${height / 2}" r="${radius + 6}" fill="#05060F"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${radius + 2}" fill="${auraColor}" fill-opacity="0.3"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="url(#grad-${key})" stroke="${adrenaline ? palette.gold : palette.azure}" stroke-width="6"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${(radius * 0.85).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.35"/>
    ${star}
  `;
  return { defs, body };
}

function createRemotePartyIcon(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.indigo, bottom: palette.midnight, shine: { top: 0.5, mid: 0.1 } });
  const radius = Math.min(width, height) * 0.18;
  const positions = [0.25, 0.5, 0.75];
  const avatars = positions.map((px, idx) => {
    const cx = width * px;
    const cy = height * (idx === 1 ? 0.42 : 0.58);
    return `<g>
      <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="#FFFFFF" fill-opacity="0.9" stroke="${palette.azure}" stroke-width="3"/>
      <circle cx="${cx.toFixed(2)}" cy="${(cy - radius * 0.5).toFixed(2)}" r="${(radius * 0.4).toFixed(2)}" fill="${palette.gold}" fill-opacity="0.9"/>
    </g>`;
  });
  const body = `
    <rect x="4" y="4" width="${(width - 8).toFixed(2)}" height="${(height - 8).toFixed(2)}" rx="${Math.min(width, height) * 0.25}" fill="url(#grad-${key})" stroke="${palette.azure}" stroke-width="4"/>
    <rect x="12" y="12" width="${(width - 24).toFixed(2)}" height="${(height - 24).toFixed(2)}" rx="${Math.min(width, height) * 0.2}" fill="url(#grid-${key})" fill-opacity="0.3"/>
    ${avatars.join('\n')}
    <path d="${starPath(width * 0.85, height * 0.2, Math.min(width, height) * 0.08, Math.min(width, height) * 0.035)}" fill="${palette.peach}" stroke="#F36228" stroke-width="2"/>
  `;
  return { defs, body };
}

function createTab(meta, key, active) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: active ? palette.azure : palette.midnight, bottom: active ? palette.indigo : palette.slate, shine: { top: 0.6, mid: 0.15 } });
  const radius = Math.min(width, height) * 0.4;
  const star = `<path d="${starPath(width * 0.82, height * 0.45, height * 0.32, height * 0.14)}" fill="${active ? palette.gold : palette.lilac}" stroke="#F3A400" stroke-width="2.5"/>`;
  const body = `
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${radius.toFixed(2)}" fill="url(#grad-${key})" stroke="${active ? palette.gold : palette.azure}" stroke-width="4"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 6).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.3"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 6).toFixed(2)}" fill="url(#shine-${key})"/>
    ${star}
  `;
  return { defs, body };
}

function createSectionAccent(meta, key, vertical) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="accent-${key}" x1="0" y1="0" x2="${vertical ? '0' : '1'}" y2="1" gradientUnits="objectBoundingBox">\n      <stop offset="0" stop-color="${palette.gold}"/>\n      <stop offset="1" stop-color="${palette.peach}"/>\n    </linearGradient>\n  </defs>\n`;
  const body = `
    <rect width="${width}" height="${height}" rx="${vertical ? height * 0.4 : width * 0.2}" fill="url(#accent-${key})"/>
    <path d="${starPath(width / 2, height / 2, Math.min(width, height) * 0.35, Math.min(width, height) * 0.12)}" fill="#FFFFFF" fill-opacity="0.85"/>
  `;
  return { defs, body };
}

function createHudLabel(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.midnight, bottom: palette.plum, shine: { top: 0.5, mid: 0.15 } });
  const radius = Math.min(width, height) * 0.4;
  const body = `
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${radius.toFixed(2)}" fill="url(#grad-${key})" stroke="${palette.azure}" stroke-width="4"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 6).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.28"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 6).toFixed(2)}" fill="url(#shine-${key})"/>
    <path d="${starPath(width * 0.85, height * 0.5, height * 0.28, height * 0.12)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="2"/>
  `;
  return { defs, body };
}

function createHudBadge(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.crimson, bottom: palette.peach, shine: { top: 0.7, mid: 0.2 } });
  const radius = Math.min(width, height) * 0.28;
  const body = `
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${radius.toFixed(2)}" fill="url(#grad-${key})" stroke="${palette.gold}" stroke-width="4"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${(radius - 6).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.3"/>
    <path d="${starPath(width / 2, height / 2, Math.min(width, height) * 0.35, Math.min(width, height) * 0.15)}" fill="#FFFFFF" fill-opacity="0.85" stroke="#F3A400" stroke-width="2"/>
  `;
  return { defs, body };
}
function createQuestBackground(meta, key) {
  return createCard(meta, key, { top: palette.midnight, bottom: palette.indigo, accent: palette.gold, border: palette.azure, circuit: palette.neon });
}

function createPersonaWindow(meta, key) {
  return createPanel(meta, key, { top: palette.plum, bottom: palette.midnight, border: palette.lilac, header: palette.gold, footer: palette.indigo });
}

function createPartyCard(meta, key) {
  return createCard(meta, key, { top: palette.indigo, bottom: palette.midnight, accent: palette.lilac, border: palette.azure, circuit: palette.neon });
}

function createShopPanel(meta, key) {
  return createPanel(meta, key, { top: palette.gold, bottom: palette.peach, border: palette.crimson, header: palette.crimson, footer: palette.midnight, circuit: palette.shadow });
}

function createShopHeader(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.crimson, bottom: palette.peach, shine: { top: 0.6, mid: 0.18 } });
  const body = `
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${Math.min(width, height) * 0.4}" fill="url(#grad-${key})" stroke="${palette.gold}" stroke-width="4"/>
    <rect x="8" y="8" width="${(width - 16).toFixed(2)}" height="${(height - 16).toFixed(2)}" rx="${Math.min(width, height) * 0.35}" fill="url(#grid-${key})" fill-opacity="0.25"/>
    <path d="${starPath(width * 0.1, height / 2, Math.min(width, height) * 0.25, Math.min(width, height) * 0.1)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="2"/>
    ${pixelQuestionBlock(width * 0.75, height * 0.2, Math.min(width, height) * 0.5)}
  `;
  return { defs, body };
}

function createShopkeeperIcon(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.gold, bottom: palette.peach, shine: { top: 0.65, mid: 0.2 } });
  const radius = Math.min(width, height) / 2 - 6;
  const mustache = `<path d="M${(width / 2 - radius * 0.7).toFixed(2)} ${(height / 2 + radius * 0.2).toFixed(2)}Q${(width / 2 - radius * 0.2).toFixed(2)} ${(height / 2 + radius * 0.5).toFixed(2)} ${(width / 2).toFixed(2)} ${(height / 2 + radius * 0.2).toFixed(2)}Q${(width / 2 + radius * 0.2).toFixed(2)} ${(height / 2 + radius * 0.5).toFixed(2)} ${(width / 2 + radius * 0.7).toFixed(2)} ${(height / 2 + radius * 0.2).toFixed(2)}" stroke="#733511" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  const hat = `<path d="M${(width / 2 - radius * 0.9).toFixed(2)} ${(height / 2 - radius * 0.6).toFixed(2)}H${(width / 2 + radius * 0.9).toFixed(2)}L${(width / 2 + radius * 0.6).toFixed(2)} ${(height / 2 - radius * 1.1).toFixed(2)}H${(width / 2 - radius * 0.6).toFixed(2)}Z" fill="${palette.crimson}" stroke="#8C1C1C" stroke-width="4"/>`;
  const body = `
    <circle cx="${width / 2}" cy="${height / 2}" r="${radius + 6}" fill="#05060F"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="url(#grad-${key})" stroke="${palette.crimson}" stroke-width="6"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${(radius * 0.9).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.35"/>
    ${hat}
    <circle cx="${(width / 2 - radius * 0.35).toFixed(2)}" cy="${(height / 2 - radius * 0.25).toFixed(2)}" r="${(radius * 0.16).toFixed(2)}" fill="#0D1B4C"/>
    <circle cx="${(width / 2 + radius * 0.35).toFixed(2)}" cy="${(height / 2 - radius * 0.25).toFixed(2)}" r="${(radius * 0.16).toFixed(2)}" fill="#0D1B4C"/>
    ${mustache}
    <path d="${starPath(width * 0.8, height * 0.25, radius * 0.4, radius * 0.18)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>
  `;
  return { defs, body };
}

function createTrainerIcon(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.azure, bottom: palette.indigo, shine: { top: 0.65, mid: 0.2 } });
  const radius = Math.min(width, height) / 2 - 6;
  const whistle = `<rect x="${(width / 2 - radius * 0.45).toFixed(2)}" y="${(height / 2).toFixed(2)}" width="${(radius * 0.9).toFixed(2)}" height="${(radius * 0.3).toFixed(2)}" rx="${(radius * 0.12).toFixed(2)}" fill="${palette.peach}" stroke="#F36228" stroke-width="3"/>`;
  const strap = `<path d="M${(width / 2 - radius * 0.6).toFixed(2)} ${(height / 2 - radius * 0.6).toFixed(2)}C${(width * 0.2).toFixed(2)} ${(height * 0.05).toFixed(2)} ${(width * 0.8).toFixed(2)} ${(height * 0.05).toFixed(2)} ${(width / 2 + radius * 0.6).toFixed(2)} ${(height / 2 - radius * 0.6).toFixed(2)}" stroke="${palette.gold}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const body = `
    <circle cx="${width / 2}" cy="${height / 2}" r="${radius + 6}" fill="#05060F"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${radius}" fill="url(#grad-${key})" stroke="${palette.azure}" stroke-width="6"/>
    <circle cx="${width / 2}" cy="${height / 2}" r="${(radius * 0.9).toFixed(2)}" fill="url(#grid-${key})" fill-opacity="0.35"/>
    ${strap}
    ${whistle}
    <path d="${starPath(width * 0.2, height * 0.25, radius * 0.35, radius * 0.15)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>
  `;
  return { defs, body };
}

function createStackIcon(meta, key) {
  const { width, height } = meta;
  const defs = createDefs(key, { top: palette.peach, bottom: palette.gold, shine: { top: 0.6, mid: 0.18 } });
  const coin = (cx, cy, r) => {
    const cxNum = Number(cx);
    const cyNum = Number(cy);
    const rNum = Number(r);
    return `<g>
    <circle cx="${cxNum.toFixed(2)}" cy="${cyNum.toFixed(2)}" r="${rNum.toFixed(2)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>
    <path d="${starPath(cxNum, cyNum, rNum * 0.7, rNum * 0.3)}" fill="#FFFFFF" fill-opacity="0.85"/>
  </g>`;
  };
  const body = `
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${Math.min(width, height) * 0.2}" fill="url(#grad-${key})" stroke="${palette.crimson}" stroke-width="4"/>
    <rect x="10" y="10" width="${(width - 20).toFixed(2)}" height="${(height - 20).toFixed(2)}" rx="${Math.min(width, height) * 0.16}" fill="url(#grid-${key})" fill-opacity="0.28"/>
    ${coin(width * 0.35, height * 0.55, Math.min(width, height) * 0.2)}
    ${coin(width * 0.6, height * 0.45, Math.min(width, height) * 0.18)}
    ${coin(width * 0.75, height * 0.65, Math.min(width, height) * 0.16)}
  `;
  return { defs, body };
}

function createSlotLocked(meta, key) {
  const base = createSlotHighlight(meta, key, { top: palette.midnight, bottom: palette.slate, border: palette.crimson });
  const { width, height } = meta;
  const lock = `<rect x="${(width / 2 - width * 0.12).toFixed(2)}" y="${(height * 0.45).toFixed(2)}" width="${(width * 0.24).toFixed(2)}" height="${(height * 0.28).toFixed(2)}" rx="8" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>
    <path d="M${(width / 2).toFixed(2)} ${(height * 0.45).toFixed(2)}V${(height * 0.3).toFixed(2)}C${(width * 0.38).toFixed(2)} ${(height * 0.2).toFixed(2)} ${(width * 0.62).toFixed(2)} ${(height * 0.2).toFixed(2)} ${(width / 2).toFixed(2)} ${(height * 0.3).toFixed(2)}" stroke="#F3A400" stroke-width="6" fill="none"/>`;
  return { defs: base.defs, body: `${base.body}${lock}` };
}

function createSlotBetter(meta, key) {
  const base = createSlotHighlight(meta, key, { top: palette.emerald, bottom: palette.mint, border: palette.azure });
  const { width, height } = meta;
  const badge = `<path d="${starPath(width / 2, height / 2, Math.min(width, height) * 0.22, Math.min(width, height) * 0.1)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>`;
  return { defs: base.defs, body: `${base.body}${badge}` };
}

function createStatusStrip(meta, key) {
  const { width, height } = meta;
  const defs = `\n  <defs>\n    <linearGradient id="status-${key}" x1="0" y1="0" x2="1" y2="0">\n      <stop offset="0" stop-color="${palette.azure}"/>\n      <stop offset="1" stop-color="${palette.peach}"/>\n    </linearGradient>\n  </defs>\n`;
  const segment = width / 8;
  const icons = [];
  for (let i = 0; i < 8; i += 1) {
    const cx = i * segment + segment / 2;
    icons.push(`<path d="${starPath(cx, height / 2, height * 0.45, height * 0.18, i * 18)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="1.5"/>`);
  }
  const body = `
    <rect width="${width}" height="${height}" fill="#05060F"/>
    <rect x="2" y="2" width="${(width - 4).toFixed(2)}" height="${(height - 4).toFixed(2)}" rx="${height * 0.4}" fill="url(#status-${key})"/>
    ${icons.join('\n')}
  `;
  return { defs, body };
}
const builders = {
  'button-default.svg': (meta) => createButton(meta, toKey('button-default'), { top: palette.gold, bottom: palette.peach, border: palette.crimson, circuit: palette.shadow }),
  'button-hover.svg': (meta) => createButton(meta, toKey('button-hover'), { top: palette.azure, bottom: palette.indigo, border: palette.gold, circuit: palette.neon }),
  'button-label-overlay.svg': (meta) => createOverlay(meta, toKey('button-label-overlay'), palette.midnight, 0.45),
  'button-pressed.svg': (meta) => createButton(meta, toKey('button-pressed'), { top: palette.crimson, bottom: palette.peach, border: palette.gold, circuit: palette.shadow }),
  'camp-chest-panel.svg': (meta) => createPanel(meta, toKey('camp-chest-panel'), { top: palette.plum, bottom: palette.midnight, border: palette.gold, header: palette.crimson, footer: palette.indigo }),
  'collapsible-section-background.svg': (meta) => createPanel(meta, toKey('collapsible-section-background'), { top: palette.indigo, bottom: palette.midnight, border: palette.azure, header: palette.plum, footer: palette.midnight }),
  'combat-command-card.svg': (meta) => createCard(meta, toKey('combat-command-card'), { top: palette.midnight, bottom: palette.indigo, accent: palette.crimson, circuit: palette.neon }),
  'combat-window-background.svg': (meta) => createPanel(meta, toKey('combat-window-background'), { top: palette.midnight, bottom: palette.indigo, border: palette.crimson, header: palette.crimson, footer: palette.slate, star: palette.peach }),
  'control-tile-card.svg': (meta) => createCard(meta, toKey('control-tile-card'), { top: palette.azure, bottom: palette.indigo, accent: palette.gold, circuit: palette.neon }),
  'dialog-choice-button.svg': (meta) => createButton(meta, toKey('dialog-choice-button'), { top: palette.lilac, bottom: palette.plum, border: palette.gold, circuit: palette.neon }),
  'dialog-portrait-frame.svg': (meta) => createRingIcon(meta, toKey('dialog-portrait-frame'), { inner: palette.midnight, outer: palette.plum, border: palette.gold, core: palette.slate, detail: pixelQuestionBlock(meta.width / 2 - Math.min(meta.width, meta.height) * 0.25, meta.height / 2 - Math.min(meta.width, meta.height) * 0.25, Math.min(meta.width, meta.height) * 0.5) }),
  'dialog-window-background.svg': (meta) => createPanel(meta, toKey('dialog-window-background'), { top: palette.plum, bottom: palette.midnight, border: palette.azure, header: palette.gold, footer: palette.indigo }),
  'door-highlight-overlay.svg': (meta) => createDoorOverlay(meta, toKey('door-highlight-overlay')),
  'hud-badge-background.svg': (meta) => createHudBadge(meta, toKey('hud-badge-background')),
  'hud-bar-fill.svg': (meta) => createGauge(meta, toKey('hud-bar-fill'), { start: palette.gold, end: palette.peach }),
  'hud-bar-ghost-fill.svg': (meta) => createGauge(meta, toKey('hud-bar-ghost-fill'), { start: palette.lilac, end: palette.plum }),
  'hud-label-chips.svg': (meta) => createHudLabel(meta, toKey('hud-label-chips')),
  'inventory-item-glyph-set.svg': (meta) => createInventoryGlyphs(meta, toKey('inventory-item-glyph-set')),
  'inventory-slot-frame.svg': (meta) => createInventorySlot(meta, toKey('inventory-slot-frame')),
  'loot-drop-icon.svg': (meta) => createRingIcon(meta, toKey('loot-drop-icon'), { inner: palette.peach, outer: palette.gold, border: palette.crimson, core: palette.midnight, star: palette.gold, detail: `<path d="${starPath(meta.width / 2, meta.height / 2, Math.min(meta.width, meta.height) * 0.4, Math.min(meta.width, meta.height) * 0.18)}" fill="${palette.gold}" stroke="#F3A400" stroke-width="3"/>` }),
  'main-panel.svg': (meta) => createPanel(meta, toKey('main-panel'), { top: palette.indigo, bottom: palette.midnight, border: palette.azure, header: palette.crimson, footer: palette.slate }),
  'map-frame-corners.svg': (meta) => createFrameCorner(meta, toKey('map-frame-corners')),
  'map-frame-edge.svg': (meta) => createFrameEdge(meta, toKey('map-frame-edge'), { start: palette.indigo, end: palette.midnight }),
  'modal-body-fill.svg': (meta) => createPanel(meta, toKey('modal-body-fill'), { top: palette.midnight, bottom: palette.slate, border: palette.azure, header: palette.lilac, footer: palette.midnight }),
  'modal-header-bar.svg': (meta) => createSectionAccent(meta, toKey('modal-header-bar'), false),
  'modal-window-backdrop.svg': (meta) => createOverlay(meta, toKey('modal-window-backdrop'), palette.midnight, 0.75),
  'npc-friendly-icon.svg': (meta) => createNpcIcon(meta, toKey('npc-friendly-icon'), 'friendly'),
  'npc-hostile-icon.svg': (meta) => createNpcIcon(meta, toKey('npc-hostile-icon'), 'hostile'),
  'npc-quest-giver-icon.svg': (meta) => createNpcIcon(meta, toKey('npc-quest-giver-icon'), 'quest'),
  'overlay-vignette.svg': (meta) => createOverlay(meta, toKey('overlay-vignette'), palette.shadow, 0.9),
  'panel-body-wallpaper.svg': (meta) => createPanel(meta, toKey('panel-body-wallpaper'), { top: palette.midnight, bottom: palette.indigo, border: palette.plum, header: palette.peach, footer: palette.midnight }),
  'panel-header-overlay.svg': (meta) => createOverlay(meta, toKey('panel-header-overlay'), palette.plum, 0.65),
  'panel-header.svg': (meta) => createSectionAccent(meta, toKey('panel-header'), false),
  'panel-title-accent.svg': (meta) => createSectionAccent(meta, toKey('panel-title-accent'), true),
  'panel-toggle-chip.svg': (meta) => createToggleChip(meta, toKey('panel-toggle-chip')),
  'party-card-background.svg': (meta) => createPartyCard(meta, toKey('party-card-background')),
  'persona-window-background.svg': (meta) => createPersonaWindow(meta, toKey('persona-window-background')),
  'pill-toggle-button.svg': (meta) => createButton(meta, toKey('pill-toggle-button'), { top: palette.emerald, bottom: palette.mint, border: palette.azure, circuit: palette.neon }),
  'player-icon-adrenaline.svg': (meta) => createPlayerIcon(meta, toKey('player-icon-adrenaline'), true),
  'player-icon-default.svg': (meta) => createPlayerIcon(meta, toKey('player-icon-default'), false),
  'primary-panel-backdrop.svg': (meta) => createPanel(meta, toKey('primary-panel-backdrop'), { top: palette.indigo, bottom: palette.midnight, border: palette.azure, header: palette.gold, footer: palette.slate }),
  'quest-card-background.svg': (meta) => createQuestBackground(meta, toKey('quest-card-background')),
  'remote-party-icon.svg': (meta) => createRemotePartyIcon(meta, toKey('remote-party-icon')),
  'section-header-badge.svg': (meta) => createBadge(meta, toKey('section-header-badge'), { top: palette.lilac, bottom: palette.plum, border: palette.azure }),
  'section-title-accent.svg': (meta) => createSectionAccent(meta, toKey('section-title-accent'), true),
  'shop-header-strip.svg': (meta) => createShopHeader(meta, toKey('shop-header-strip')),
  'shop-panel.svg': (meta) => createShopPanel(meta, toKey('shop-panel')),
  'shopkeeper-icon.svg': (meta) => createShopkeeperIcon(meta, toKey('shopkeeper-icon')),
  'signal-log-feed-card.svg': (meta) => createSignalCard(meta, toKey('signal-log-feed-card')),
  'slot-highlight-better-item.svg': (meta) => createSlotBetter(meta, toKey('slot-highlight-better-item')),
  'slot-highlight-level-locked.svg': (meta) => createSlotLocked(meta, toKey('slot-highlight-level-locked')),
  'stack-multi-drop-icon.svg': (meta) => createStackIcon(meta, toKey('stack-multi-drop-icon')),
  'status-icon-glyphs.svg': (meta) => createStatusStrip(meta, toKey('status-icon-glyphs')),
  'tab-active-state.svg': (meta) => createTab(meta, toKey('tab-active-state'), true),
  'tab-idle-state.svg': (meta) => createTab(meta, toKey('tab-idle-state'), false),
  'tile-atlas.svg': (meta) => createTileAtlas(meta, toKey('tile-atlas')),
  'trainer-icon.svg': (meta) => createTrainerIcon(meta, toKey('trainer-icon')),
  'weather-badge.svg': (meta) => createWeather(meta, toKey('weather-badge'), { top: palette.azure, bottom: palette.indigo }),
  'weather-text-treatment.svg': (meta) => createWeatherText(meta, toKey('weather-text-treatment')),
  'workbench-panel.svg': (meta) => createWorkbench(meta, toKey('workbench-panel')),
  'world-item-icon.svg': (meta) => createWorldItem(meta, toKey('world-item-icon'))
};

const files = fs.readdirSync(baseDir).filter((file) => file.endsWith('.svg'));
for (const file of files) {
  const builder = builders[file];
  if (!builder) {
    throw new Error(`No builder defined for ${file}`);
  }
  const fullPath = path.join(baseDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const meta = parseMeta(raw, file);
  const { defs, body } = builder(meta);
  const svg = `<svg width="${meta.widthAttr}" height="${meta.heightAttr}" viewBox="${meta.viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">${defs}${body}\n</svg>\n`;
  fs.writeFileSync(fullPath, svg);
}

console.log('Retro console skin refreshed with colorful techno Mario flourishes.');

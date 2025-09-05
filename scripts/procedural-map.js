// Simplex noise-based height field generator without external deps

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h >>> 0;
}

function createNoise2D(seed) {
  const grad3 = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [0, 1], [0, -1]
  ];
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }
  const random = mulberry32(seed);
  for (let i = 255; i > 0; i--) {
    const r = Math.floor(random() * (i + 1));
    const t = p[i];
    p[i] = p[r];
    p[r] = t;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
  }
  return function(xin, yin) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    let i1, j1;
    if (x0 > y0) {
      i1 = 1; j1 = 0;
    } else {
      i1 = 0; j1 = 1;
    }
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = perm[ii + perm[jj]] % 8;
    const gi1 = perm[ii + i1 + perm[jj + j1]] % 8;
    const gi2 = perm[ii + 1 + perm[jj + 1]] % 8;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      const g = grad3[gi0];
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      const g = grad3[gi1];
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      const g = grad3[gi2];
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
    }
    return 70 * (n0 + n1 + n2);
  };
}

function generateHeightField(seed, size, scale, falloff = 0) {
  // falloff (0-1) subtracts a radial gradient to bias edges toward water
  const seedNum = typeof seed === 'string' ? hashString(seed) : seed;
  const noise2D = createNoise2D(seedNum);
  const grid = [];
  const center = (size - 1) / 2;
  const maxDist = Math.sqrt(2);
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      const nx = x / size * scale;
      const ny = y / size * scale;
      // noise2D returns roughly [-1,1]
      let v = noise2D(nx, ny);
      if (falloff > 0) {
        const dx = (x - center) / center;
        const dy = (y - center) / center;
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
        v -= falloff * dist;
      }
      row.push(v);
    }
    grid.push(row);
  }
  return grid;
}

function heightFieldToTiles(field) {
  const tiles = [];
  for (let y = 0; y < field.length; y++) {
    const row = [];
    for (let x = 0; x < field[y].length; x++) {
      const v = field[y][x];
      if (v > 0.62) row.push(TILE.ROCK);
      else if (v < -0.62) row.push(TILE.WATER);
      else if (v > 0.18) row.push(TILE.BRUSH);
      else row.push(TILE.SAND);
    }
    tiles.push(row);
  }
  return tiles;
}

function refineTiles(tiles, iterations = 1) {
  let current = tiles.map(r => r.slice());
  for (let i = 0; i < iterations; i++) {
    const next = current.map(r => r.slice());
    for (let y = 0; y < current.length; y++) {
      for (let x = 0; x < current[y].length; x++) {
        let land = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < current.length && nx >= 0 && nx < current[y].length) {
              if (current[ny][nx] !== TILE.WATER) land++;
            }
          }
        }
        if (current[y][x] === TILE.WATER && land >= 5) next[y][x] = TILE.SAND;
        else if (current[y][x] !== TILE.WATER && land <= 3) next[y][x] = TILE.WATER;
        else next[y][x] = current[y][x];
      }
    }
    current = next;
  }
  return current;
}


function connectRegionCenters(centers) {
  const edges = [];
  if (!centers || centers.length < 2) return edges;
  const connected = new Set([0]);
  const remaining = new Set();
  for (let i = 1; i < centers.length; i++) {
    remaining.add(i);
  }
  function dist(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  while (connected.size < centers.length) {
    let bestA = -1;
    let bestB = -1;
    let bestDist = Infinity;
    for (const a of connected) {
      for (const b of remaining) {
        const d = dist(centers[a], centers[b]);
        if (d < bestDist) {
          bestDist = d;
          bestA = a;
          bestB = b;
        }
      }
    }
    edges.push([bestA, bestB]);
    connected.add(bestB);
    remaining.delete(bestB);
  }
  return edges;
}

function carveRoads(tiles, centers, edges, field, seed = 1) {
  const rand = mulberry32(typeof seed === 'string' ? hashString(seed) : seed);
  const h = tiles.length;
  const w = tiles[0].length;
  const weight = 10;
  for (const [ai, bi] of edges) {
    let x0 = Math.round(centers[ai].x);
    let y0 = Math.round(centers[ai].y);
    const x1 = Math.round(centers[bi].x);
    const y1 = Math.round(centers[bi].y);
    let steps = 0;
    const max = w * h;
    while ((x0 !== x1 || y0 !== y1) && steps++ < max) {
      tiles[y0][x0] = TILE.ROAD;
      const opts = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x0 + dx;
          const ny = y0 + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          if (tiles[ny][nx] === TILE.WATER) continue;
          const elev = Math.abs(field[ny][nx] - field[y0][x0]) * weight;
          const dist = Math.abs(x1 - nx) + Math.abs(y1 - ny);
          opts.push({ score: elev + dist + rand() * 0.01, nx, ny });
        }
      }
      if (!opts.length) break;
      opts.sort((a, b) => a.score - b.score);
      const px = x0;
      const py = y0;
      x0 = opts[0].nx;
      y0 = opts[0].ny;
      if (px !== x0 && py !== y0) {
        tiles[py][x0] = TILE.ROAD;
      }
      if (rand() < 0.3) {
        const jx = Math.max(0, Math.min(w - 1, x0 + (rand() < 0.5 ? -1 : 1)));
        const jy = Math.max(0, Math.min(h - 1, y0 + (rand() < 0.5 ? -1 : 1)));
        tiles[jy][jx] = TILE.ROAD;
      }
    }
    tiles[y0][x0] = TILE.ROAD;
    if (rand() < 0.3) {
      const jx = Math.max(0, Math.min(w - 1, x0 + (rand() < 0.5 ? -1 : 1)));
      const jy = Math.max(0, Math.min(h - 1, y0 + (rand() < 0.5 ? -1 : 1)));
      tiles[jy][jx] = TILE.ROAD;
    }
  }
  return tiles;
}

function scatterRuins(tiles, seed = 1, radius = 3) {
  const rand = mulberry32(typeof seed === 'string' ? hashString(seed) : seed);
  const h = tiles.length;
  const w = tiles[0].length;
  const ruins = [];
  const r2 = radius * radius;
  for (let i = 0; i < w * h; i++) {
    const x = Math.floor(rand() * w);
    const y = Math.floor(rand() * h);
    const t = tiles[y][x];
    if (t === TILE.WATER || t === TILE.ROAD) continue;
    let ok = true;
    for (const r of ruins) {
      const dx = r.x - x;
      const dy = r.y - y;
      if (dx * dx + dy * dy < r2) { ok = false; break; }
    }
    if (!ok) continue;
    tiles[y][x] = TILE.RUIN;
    ruins.push({ x, y });
  }
  return tiles;
}

function findRegionCenters(tiles) {
  const h = tiles.length;
  const w = tiles[0].length;
  const seen = Array.from({ length: h }, () => Array(w).fill(false));
  let centers = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (tiles[y][x] === TILE.WATER || seen[y][x]) continue;
      const q = [[x, y]];
      seen[y][x] = true;
      let sx = 0, sy = 0, count = 0;
      while (q.length) {
        const [cx, cy] = q.pop();
        sx += cx; sy += cy; count++;
        const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        for (const [dx, dy] of dirs) {
          const nx = cx + dx, ny = cy + dy;
          if (ny >= 0 && ny < h && nx >= 0 && nx < w && tiles[ny][nx] !== TILE.WATER && !seen[ny][nx]) {
            seen[ny][nx] = true;
            q.push([nx, ny]);
          }
        }
      }
      centers.push({ x: sx / count, y: sy / count });
    }
  }
  if (centers.length < 2) {
    const hw = Math.floor(w / 2);
    const hh = Math.floor(h / 2);
    const quads = [
      [0, 0, hw, hh],
      [hw, 0, w, hh],
      [0, hh, hw, h],
      [hw, hh, w, h]
    ];
    const extra = [];
    for (const [x0, y0, x1, y1] of quads) {
      let sx = 0, sy = 0, count = 0;
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          if (tiles[yy][xx] !== TILE.WATER) {
            sx += xx; sy += yy; count++;
          }
        }
      }
      if (count > 0) extra.push({ x: sx / count, y: sy / count });
    }
    if (extra.length > 1) centers = extra;
  }
  return centers;
}

function generateProceduralMap(seed, width, height, scale = 4, falloff = 0) {
  const size = Math.max(width, height);
  let field = generateHeightField(seed, size, scale, falloff);
  let tiles = heightFieldToTiles(field);
  tiles = refineTiles(tiles, 3);
  // Crop to requested dimensions before finding centers so roads stay in bounds
  tiles = tiles.slice(0, height).map(r => r.slice(0, width));
  field = field.slice(0, height).map(r => r.slice(0, width));
  const centers = findRegionCenters(tiles);
  const edges = connectRegionCenters(centers);
  carveRoads(tiles, centers, edges, field, seed);
  scatterRuins(tiles, seed);
  return tiles;
}

globalThis.generateHeightField = generateHeightField;
globalThis.heightFieldToTiles = heightFieldToTiles;
globalThis.refineTiles = refineTiles;
globalThis.findRegionCenters = findRegionCenters;
globalThis.connectRegionCenters = connectRegionCenters;
globalThis.carveRoads = carveRoads;
globalThis.scatterRuins = scatterRuins;
globalThis.generateProceduralMap = generateProceduralMap;


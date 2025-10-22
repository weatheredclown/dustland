// @ts-nocheck
// Simplex noise-based height field generator without external deps
function mulberry32(a) {
    return function () {
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
    return function (xin, yin) {
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
            i1 = 1;
            j1 = 0;
        }
        else {
            i1 = 0;
            j1 = 1;
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
            if (v > 0.62)
                row.push(TILE.ROCK);
            else if (v < -0.62)
                row.push(TILE.WATER);
            else if (v > 0.18)
                row.push(TILE.BRUSH);
            else
                row.push(TILE.SAND);
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
                        if (dx === 0 && dy === 0)
                            continue;
                        const ny = y + dy;
                        const nx = x + dx;
                        if (ny >= 0 && ny < current.length && nx >= 0 && nx < current[y].length) {
                            if (current[ny][nx] !== TILE.WATER)
                                land++;
                        }
                    }
                }
                if (current[y][x] === TILE.WATER && land >= 5)
                    next[y][x] = TILE.SAND;
                else if (current[y][x] !== TILE.WATER && land <= 3)
                    next[y][x] = TILE.WATER;
                else
                    next[y][x] = current[y][x];
            }
        }
        current = next;
    }
    return current;
}
function clampValue(v, min, max) {
    if (v < min)
        return min;
    if (v > max)
        return max;
    return v;
}
function tileMatches(tile, key) {
    const tileset = globalThis.TILE;
    if (!tileset || typeof tileset[key] !== 'number')
        return false;
    return tile === tileset[key];
}
function getRoadTile() {
    const tileset = globalThis.TILE;
    if (tileset && typeof tileset.ROAD === 'number')
        return tileset.ROAD;
    if (tileset && typeof tileset.PATH === 'number')
        return tileset.PATH;
    if (tileset && typeof tileset.SAND === 'number')
        return tileset.SAND;
    return 0;
}
function isWater(tile) {
    return tileMatches(tile, 'WATER');
}
function terrainCost(tile) {
    if (tileMatches(tile, 'ROAD'))
        return 0.05;
    if (tileMatches(tile, 'SAND'))
        return 1;
    if (tileMatches(tile, 'BRUSH'))
        return 1.2;
    if (tileMatches(tile, 'ROCK'))
        return 1.8;
    if (tileMatches(tile, 'RUIN'))
        return 2.2;
    if (tileMatches(tile, 'WATER'))
        return 5;
    return 1.5;
}
function findNearestLand(x, y, tiles) {
    const h = tiles.length;
    const w = tiles[0].length;
    const seen = new Set();
    const queue = [[x, y]];
    const dirs = [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [-1, 1], [1, -1], [-1, -1]
    ];
    while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        const key = `${cx},${cy}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        if (cx < 0 || cy < 0 || cx >= w || cy >= h)
            continue;
        if (!isWater(tiles[cy][cx]))
            return { x: cx, y: cy };
        for (const [dx, dy] of dirs) {
            queue.push([cx + dx, cy + dy]);
        }
    }
    return { x: clampValue(x, 0, w - 1), y: clampValue(y, 0, h - 1) };
}
function deriveVirtualAnchors(tiles) {
    const h = tiles.length;
    const w = tiles[0].length;
    let minX = Infinity, maxX = -1, minY = Infinity, maxY = -1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (isWater(tiles[y][x]))
                continue;
            if (x < minX)
                minX = x;
            if (x > maxX)
                maxX = x;
            if (y < minY)
                minY = y;
            if (y > maxY)
                maxY = y;
        }
    }
    if (!isFinite(minX) || !isFinite(minY))
        return [];
    const midX = Math.round((minX + maxX) / 2);
    const midY = Math.round((minY + maxY) / 2);
    const candidates = [
        [minX, midY],
        [maxX, midY],
        [midX, minY],
        [midX, maxY]
    ];
    const anchors = [];
    const seen = new Set();
    for (const [cx, cy] of candidates) {
        const snapped = findNearestLand(cx, cy, tiles);
        const key = `${snapped.x},${snapped.y}`;
        if (!seen.has(key)) {
            seen.add(key);
            anchors.push(snapped);
        }
    }
    return anchors;
}
class MinHeap {
    constructor() {
        this.data = [];
    }
    push(node) {
        this.data.push(node);
        this.bubbleUp(this.data.length - 1);
    }
    bubbleUp(index) {
        while (index > 0) {
            const parent = index - 1 >> 1;
            if (this.data[parent].cost <= this.data[index].cost)
                break;
            const tmp = this.data[parent];
            this.data[parent] = this.data[index];
            this.data[index] = tmp;
            index = parent;
        }
    }
    pop() {
        if (!this.data.length)
            return null;
        const root = this.data[0];
        const last = this.data.pop();
        if (this.data.length) {
            this.data[0] = last;
            this.sinkDown(0);
        }
        return root;
    }
    sinkDown(index) {
        const len = this.data.length;
        for (let current = index; current < len;) {
            let left = current * 2 + 1;
            let right = left + 1;
            let smallest = current;
            if (left < len && this.data[left].cost < this.data[smallest].cost)
                smallest = left;
            if (right < len && this.data[right].cost < this.data[smallest].cost)
                smallest = right;
            if (smallest === current)
                break;
            const tmp = this.data[current];
            this.data[current] = this.data[smallest];
            this.data[smallest] = tmp;
            current = smallest;
        }
    }
    get length() {
        return this.data.length;
    }
}
function buildPath(start, goal, tiles, field, preference) {
    const h = tiles.length;
    const w = tiles[0].length;
    const total = w * h;
    const startIdx = start.y * w + start.x;
    const goalIdx = goal.y * w + goal.x;
    const dist = new Float64Array(total);
    const prev = new Int32Array(total);
    const prevDir = new Int8Array(total);
    dist.fill(Infinity);
    prev.fill(-1);
    prevDir.fill(-1);
    const heap = new MinHeap();
    dist[startIdx] = 0;
    heap.push({ idx: startIdx, cost: 0 });
    const dirs = [
        [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
        [1, 1, Math.SQRT2], [-1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, -1, Math.SQRT2]
    ];
    while (heap.length > 0) {
        const current = heap.pop();
        if (current.idx === goalIdx)
            break;
        if (current.cost !== dist[current.idx])
            continue;
        const cx = current.idx % w;
        const cy = Math.floor(current.idx / w);
        for (let dirIndex = 0; dirIndex < dirs.length; dirIndex++) {
            const [dx, dy, len] = dirs[dirIndex];
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || nx >= w || ny < 0 || ny >= h)
                continue;
            const nIdx = ny * w + nx;
            let step = len;
            const tile = tiles[ny][nx];
            const slope = Math.abs(field[ny][nx] - field[cy][cx]);
            step += terrainCost(tile);
            step += slope * 12;
            if (preference[ny][nx])
                step *= 0.35;
            if (isWater(tile))
                step += 8;
            if (prevDir[current.idx] !== -1 && prevDir[current.idx] !== dirIndex)
                step += 0.25;
            const newCost = current.cost + step;
            if (newCost < dist[nIdx]) {
                dist[nIdx] = newCost;
                prev[nIdx] = current.idx;
                prevDir[nIdx] = dirIndex;
                heap.push({ idx: nIdx, cost: newCost });
            }
        }
    }
    if (!Number.isFinite(dist[goalIdx]))
        return null;
    const path = [];
    const bridges = [];
    let cur = goalIdx;
    while (cur !== -1) {
        const x = cur % w;
        const y = Math.floor(cur / w);
        path.push({ x, y });
        if (isWater(tiles[y][x]))
            bridges.push({ x, y });
        cur = prev[cur];
    }
    path.reverse();
    bridges.reverse();
    return { path, cost: dist[goalIdx], bridges };
}
function connectRegionCenters(tiles, field, centers, seed = 1) {
    const h = tiles.length;
    if (!h)
        return { anchors: [], segments: [] };
    const w = tiles[0].length;
    const anchors = [];
    if (Array.isArray(centers) && centers.length >= 2) {
        for (const c of centers) {
            const x = clampValue(Math.round(c.x), 0, w - 1);
            const y = clampValue(Math.round(c.y), 0, h - 1);
            anchors.push(findNearestLand(x, y, tiles));
        }
    }
    else {
        anchors.push(...deriveVirtualAnchors(tiles));
    }
    if (anchors.length < 2) {
        return { anchors, segments: [] };
    }
    const rng = mulberry32(typeof seed === 'string' ? hashString(seed) : seed);
    const order = anchors.map((a, idx) => ({ ...a, idx })).sort((a, b) => a.x - b.x || a.y - b.y);
    const connected = new Set([order[0].idx]);
    const preference = Array.from({ length: h }, () => Array(w).fill(false));
    const segments = [];
    while (connected.size < anchors.length) {
        let best = null;
        for (const from of connected) {
            for (let to = 0; to < anchors.length; to++) {
                if (connected.has(to))
                    continue;
                const plan = buildPath(anchors[from], anchors[to], tiles, field, preference);
                if (!plan)
                    continue;
                if (!best || plan.cost < best.cost - 1e-6 || (Math.abs(plan.cost - best.cost) <= 1e-6 && rng() < 0.5)) {
                    best = { from, to, cost: plan.cost, path: plan.path, bridges: plan.bridges };
                }
            }
        }
        if (!best)
            break;
        segments.push(best);
        connected.add(best.to);
        for (const step of best.path) {
            preference[step.y][step.x] = true;
        }
    }
    return { anchors, segments };
}
function carveRoads(tiles, network) {
    const roadId = getRoadTile();
    if (!network || !network.segments || !network.segments.length) {
        return { anchors: network?.anchors ?? [], segments: [], crossroads: [] };
    }
    const h = tiles.length;
    const usage = Array.from({ length: h }, () => Array(tiles[0].length).fill(0));
    const carvedSegments = [];
    for (const seg of network.segments) {
        const path = [];
        const bridges = [];
        for (const step of seg.path) {
            const { x, y } = step;
            path.push({ x, y });
            if (isWater(tiles[y][x]))
                bridges.push({ x, y });
            tiles[y][x] = roadId;
            usage[y][x]++;
        }
        carvedSegments.push({ from: seg.from, to: seg.to, path, bridges });
    }
    const crossroads = [];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let y = 0; y < usage.length; y++) {
        for (let x = 0; x < usage[y].length; x++) {
            if (usage[y][x] > 1) {
                crossroads.push({ x, y });
                for (const [dx, dy] of dirs) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (ny < 0 || ny >= tiles.length || nx < 0 || nx >= tiles[0].length)
                        continue;
                    if (isWater(tiles[ny][nx]))
                        continue;
                    tiles[ny][nx] = roadId;
                }
            }
        }
    }
    return { anchors: network.anchors, segments: carvedSegments, crossroads };
}
function scatterRuins(tiles, seed = 1, radius = 12) {
    const rand = mulberry32(typeof seed === 'string' ? hashString(seed) : seed);
    const h = tiles.length;
    const w = tiles[0].length;
    const hubs = [];
    const ruins = [];
    const r2 = radius * radius;
    for (let i = 0; i < w * h; i++) {
        const x = Math.floor(rand() * w);
        const y = Math.floor(rand() * h);
        const t = tiles[y][x];
        if (t === TILE.WATER || t === TILE.ROAD || t === TILE.RUIN)
            continue;
        let ok = true;
        for (const c of hubs) {
            const dx = c.x - x;
            const dy = c.y - y;
            if (dx * dx + dy * dy < r2) {
                ok = false;
                break;
            }
        }
        if (!ok)
            continue;
        hubs.push({ x, y });
        const groups = 2 + Math.floor(rand() * 3);
        for (let g = 0; g < groups; g++) {
            const angle = rand() * Math.PI * 2;
            const dist = 2 + Math.floor(rand() * Math.max(1, radius / 2));
            const cx = x + Math.round(Math.cos(angle) * dist);
            const cy = y + Math.round(Math.sin(angle) * dist);
            if (cx < 0 || cx >= w || cy < 0 || cy >= h)
                continue;
            const ct = tiles[cy][cx];
            if (ct === TILE.WATER || ct === TILE.ROAD || ct === TILE.RUIN)
                continue;
            tiles[cy][cx] = TILE.RUIN;
            ruins.push({ x: cx, y: cy });
            const extra = 1 + Math.floor(rand() * 3);
            for (let n = 0; n < extra; n++) {
                const nx = cx + Math.floor(rand() * 3) - 1;
                const ny = cy + Math.floor(rand() * 3) - 1;
                if (nx < 0 || nx >= w || ny < 0 || ny >= h)
                    continue;
                const tt = tiles[ny][nx];
                if (tt === TILE.WATER || tt === TILE.ROAD || tt === TILE.RUIN)
                    continue;
                tiles[ny][nx] = TILE.RUIN;
                ruins.push({ x: nx, y: ny });
            }
        }
    }
    return { tiles, ruins, hubs };
}
function findRegionCenters(tiles) {
    const h = tiles.length;
    const w = tiles[0].length;
    const seen = Array.from({ length: h }, () => Array(w).fill(false));
    let centers = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (tiles[y][x] === TILE.WATER || seen[y][x])
                continue;
            const q = [[x, y]];
            seen[y][x] = true;
            let sx = 0, sy = 0, count = 0;
            while (q.length) {
                const [cx, cy] = q.pop();
                sx += cx;
                sy += cy;
                count++;
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
                        sx += xx;
                        sy += yy;
                        count++;
                    }
                }
            }
            if (count > 0)
                extra.push({ x: sx / count, y: sy / count });
        }
        if (extra.length > 1)
            centers = extra;
    }
    return centers;
}
async function exportMap(data, path = 'map.json') {
    if (typeof window !== 'undefined') {
        console.warn('exportMap requires Node.js');
        return;
    }
    const fs = await import('node:fs');
    fs.writeFileSync(path, JSON.stringify(data));
}
function generateProceduralMap(seed, width, height, scale = 4, falloff = 0, features = { roads: true, ruins: true }) {
    const size = Math.max(width, height);
    let field = generateHeightField(seed, size, scale, falloff);
    let tiles = heightFieldToTiles(field);
    tiles = refineTiles(tiles, 3);
    // Crop to requested dimensions before finding centers so roads stay in bounds
    tiles = tiles.slice(0, height).map(r => r.slice(0, width));
    field = field.slice(0, height).map(r => r.slice(0, width));
    let centers = [];
    let roadData = { anchors: [], segments: [], crossroads: [] };
    if (features.roads) {
        const regionCenters = findRegionCenters(tiles);
        const planned = connectRegionCenters(tiles, field, regionCenters, seed);
        roadData = carveRoads(tiles, planned);
        centers = roadData.anchors;
    }
    let feat = {};
    if (features.ruins) {
        const res = scatterRuins(tiles, seed);
        tiles = res.tiles;
        feat.ruins = res.ruins;
        feat.ruinHubs = res.hubs;
    }
    return { tiles, regions: centers, roads: roadData, features: feat };
}
globalThis.generateHeightField = generateHeightField;
globalThis.heightFieldToTiles = heightFieldToTiles;
globalThis.refineTiles = refineTiles;
globalThis.findRegionCenters = findRegionCenters;
globalThis.connectRegionCenters = connectRegionCenters;
globalThis.carveRoads = carveRoads;
globalThis.scatterRuins = scatterRuins;
globalThis.exportMap = exportMap;
globalThis.generateProceduralMap = generateProceduralMap;

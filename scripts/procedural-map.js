// Simplex noise-based height field generator without external deps
function getTileset() {
    return globalThis.TILE;
}
function readTile(key) {
    const tileset = getTileset();
    const value = tileset?.[key];
    return typeof value === 'number' ? value : undefined;
}
const MIN_RUIN_HUB_DISTANCE = 12;
const MIN_RUIN_HUB_DISTANCE_SQ = MIN_RUIN_HUB_DISTANCE * MIN_RUIN_HUB_DISTANCE;
function mulberry32(seed) {
    let state = seed >>> 0;
    return () => {
        state = Math.imul(state ^ (state >>> 15), state | 1);
        state ^= state + Math.imul(state ^ (state >>> 7), state | 61);
        return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
    };
}
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = Math.imul(31, hash) + str.charCodeAt(i);
    }
    return hash >>> 0;
}
function createNoise2D(seed) {
    const grad3 = [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
        p[i] = i;
    }
    const random = mulberry32(seed);
    for (let i = 255; i > 0; i--) {
        const r = Math.floor(random() * (i + 1));
        const temp = p[i];
        p[i] = p[r];
        p[r] = temp;
    }
    const perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
        perm[i] = p[i & 255];
    }
    return (xin, yin) => {
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
        const [i1, j1] = x0 > y0 ? [1, 0] : [0, 1];
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = perm[ii + perm[jj]] % grad3.length;
        const gi1 = perm[ii + i1 + perm[jj + j1]] % grad3.length;
        const gi2 = perm[ii + 1 + perm[jj + 1]] % grad3.length;
        let n0 = 0;
        let n1 = 0;
        let n2 = 0;
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            t0 *= t0;
            const [gx, gy] = grad3[gi0];
            n0 = t0 * t0 * (gx * x0 + gy * y0);
        }
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            t1 *= t1;
            const [gx, gy] = grad3[gi1];
            n1 = t1 * t1 * (gx * x1 + gy * y1);
        }
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            t2 *= t2;
            const [gx, gy] = grad3[gi2];
            n2 = t2 * t2 * (gx * x2 + gy * y2);
        }
        return 70 * (n0 + n1 + n2);
    };
}
function normalizeSeed(seed) {
    return typeof seed === 'string' ? hashString(seed) : seed >>> 0;
}
function generateHeightField(seed, size, scale, falloff = 0) {
    const seedNum = normalizeSeed(seed);
    const noise2D = createNoise2D(seedNum);
    const grid = [];
    const center = (size - 1) / 2;
    const maxDist = Math.sqrt(2);
    for (let y = 0; y < size; y++) {
        const row = [];
        for (let x = 0; x < size; x++) {
            const nx = (x / size) * scale;
            const ny = (y / size) * scale;
            let value = noise2D(nx, ny);
            if (falloff > 0) {
                const dx = (x - center) / center;
                const dy = (y - center) / center;
                const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
                value -= falloff * dist;
            }
            row.push(value);
        }
        grid.push(row);
    }
    return grid;
}
function heightFieldToTiles(field) {
    const tiles = [];
    const rock = readTile('ROCK');
    const water = readTile('WATER');
    const brush = readTile('BRUSH');
    const sand = readTile('SAND');
    const fallback = sand ?? 0;
    for (let y = 0; y < field.length; y++) {
        const row = [];
        for (let x = 0; x < field[y].length; x++) {
            const v = field[y][x];
            if (typeof rock === 'number' && v > 0.62)
                row.push(rock);
            else if (typeof water === 'number' && v < -0.62)
                row.push(water);
            else if (typeof brush === 'number' && v > 0.18)
                row.push(brush);
            else
                row.push(fallback);
        }
        tiles.push(row);
    }
    return tiles;
}
function refineTiles(tiles, iterations = 1) {
    const water = readTile('WATER');
    const sand = readTile('SAND');
    let current = tiles.map(row => [...row]);
    for (let iteration = 0; iteration < iterations; iteration++) {
        const next = current.map(row => [...row]);
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
                            if (!tileMatches(current[ny][nx], 'WATER'))
                                land++;
                        }
                    }
                }
                const currentTile = current[y][x];
                if (currentTile === water && land >= 5) {
                    next[y][x] = sand ?? currentTile;
                }
                else if (currentTile !== water && land <= 3 && typeof water === 'number') {
                    next[y][x] = water;
                }
                else {
                    next[y][x] = currentTile;
                }
            }
        }
        current = next;
    }
    return current;
}
function clampValue(value, min, max) {
    if (value < min)
        return min;
    if (value > max)
        return max;
    return value;
}
function tileMatches(tile, key) {
    const target = readTile(key);
    return typeof target === 'number' && tile === target;
}
function getRoadTile() {
    const road = readTile('ROAD');
    if (typeof road === 'number')
        return road;
    const path = readTile('PATH');
    if (typeof path === 'number')
        return path;
    const sand = readTile('SAND');
    return typeof sand === 'number' ? sand : 0;
}
function isWaterTile(tile) {
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
function findNearestLandTile(x, y, tiles) {
    const h = tiles.length;
    const w = tiles[0]?.length ?? 0;
    const seen = new Set();
    const queue = [[x, y]];
    const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1]
    ];
    while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        const key = `${cx},${cy}`;
        if (seen.has(key))
            continue;
        seen.add(key);
        if (cx < 0 || cy < 0 || cx >= w || cy >= h)
            continue;
        if (!isWaterTile(tiles[cy][cx]))
            return { x: cx, y: cy };
        for (const [dx, dy] of dirs) {
            queue.push([cx + dx, cy + dy]);
        }
    }
    return { x: clampValue(x, 0, w - 1), y: clampValue(y, 0, h - 1) };
}
function deriveVirtualAnchors(tiles) {
    const h = tiles.length;
    const w = tiles[0]?.length ?? 0;
    let minX = Number.POSITIVE_INFINITY;
    let maxX = -1;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = -1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (isWaterTile(tiles[y][x]))
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
    if (!Number.isFinite(minX) || !Number.isFinite(minY))
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
        const snapped = findNearestLandTile(cx, cy, tiles);
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
        for (let current = index; current > 0;) {
            const parent = (current - 1) >> 1;
            if (this.data[parent].cost <= this.data[current].cost)
                break;
            [this.data[parent], this.data[current]] = [this.data[current], this.data[parent]];
            current = parent;
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
            const left = current * 2 + 1;
            const right = left + 1;
            let smallest = current;
            if (left < len && this.data[left].cost < this.data[smallest].cost)
                smallest = left;
            if (right < len && this.data[right].cost < this.data[smallest].cost)
                smallest = right;
            if (smallest === current)
                break;
            [this.data[current], this.data[smallest]] = [this.data[smallest], this.data[current]];
            current = smallest;
        }
    }
    get length() {
        return this.data.length;
    }
}
function buildPath(start, goal, tiles, field, preference) {
    const h = tiles.length;
    const w = tiles[0]?.length ?? 0;
    const total = w * h;
    if (!total)
        return null;
    const startIdx = start.y * w + start.x;
    const goalIdx = goal.y * w + goal.x;
    const dist = new Float64Array(total);
    const prev = new Int32Array(total);
    const prevDir = new Int8Array(total);
    dist.fill(Number.POSITIVE_INFINITY);
    prev.fill(-1);
    prevDir.fill(-1);
    const heap = new MinHeap();
    dist[startIdx] = 0;
    heap.push({ idx: startIdx, cost: 0 });
    const dirs = [
        [1, 0, 1],
        [-1, 0, 1],
        [0, 1, 1],
        [0, -1, 1],
        [1, 1, Math.SQRT2],
        [-1, 1, Math.SQRT2],
        [1, -1, Math.SQRT2],
        [-1, -1, Math.SQRT2]
    ];
    while (heap.length > 0) {
        const current = heap.pop();
        if (!current)
            break;
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
            if (preference[ny]?.[nx])
                step *= 0.35;
            if (isWaterTile(tile))
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
    for (let cursor = goalIdx; cursor !== -1; cursor = prev[cursor]) {
        const x = cursor % w;
        const y = Math.floor(cursor / w);
        path.push({ x, y });
        if (isWaterTile(tiles[y][x]))
            bridges.push({ x, y });
    }
    path.reverse();
    bridges.reverse();
    return { path, cost: dist[goalIdx], bridges };
}
function connectRegionCenters(tiles, field, centers, seed = 1) {
    const h = tiles.length;
    if (!h)
        return { anchors: [], segments: [], crossroads: [] };
    const w = tiles[0]?.length ?? 0;
    const anchors = [];
    if (Array.isArray(centers) && centers.length >= 2) {
        for (const center of centers) {
            const x = clampValue(Math.round(center.x), 0, w - 1);
            const y = clampValue(Math.round(center.y), 0, h - 1);
            anchors.push(findNearestLandTile(x, y, tiles));
        }
    }
    else {
        anchors.push(...deriveVirtualAnchors(tiles));
    }
    if (anchors.length < 2) {
        return { anchors, segments: [], crossroads: [] };
    }
    const rng = mulberry32(normalizeSeed(seed));
    const order = anchors
        .map((point, idx) => ({ ...point, idx }))
        .sort((a, b) => a.x - b.x || a.y - b.y);
    const connected = new Set([order[0]?.idx ?? 0]);
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
                if (!best ||
                    plan.cost < best.cost - 1e-6 ||
                    (Math.abs(plan.cost - best.cost) <= 1e-6 && rng() < 0.5)) {
                    best = { from, to, path: plan.path, bridges: plan.bridges, cost: plan.cost };
                }
            }
        }
        if (!best)
            break;
        segments.push({ from: best.from, to: best.to, path: best.path, bridges: best.bridges });
        connected.add(best.to);
        for (const step of best.path) {
            if (preference[step.y]) {
                preference[step.y][step.x] = true;
            }
        }
    }
    return { anchors, segments, crossroads: [] };
}
function carveRoads(tiles, network) {
    const roadId = getRoadTile();
    if (!network || !network.segments.length) {
        return { anchors: network?.anchors ?? [], segments: [], crossroads: [] };
    }
    const h = tiles.length;
    const w = tiles[0]?.length ?? 0;
    const usage = Array.from({ length: h }, () => Array(w).fill(0));
    const carvedSegments = [];
    for (const segment of network.segments) {
        const path = [];
        const bridges = [];
        for (const step of segment.path) {
            const { x, y } = step;
            path.push({ x, y });
            if (tiles[y]?.[x] !== undefined) {
                if (isWaterTile(tiles[y][x]))
                    bridges.push({ x, y });
                tiles[y][x] = roadId;
                usage[y][x]++;
            }
        }
        carvedSegments.push({ from: segment.from, to: segment.to, path, bridges });
    }
    const crossroads = [];
    const dirs = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];
    for (let y = 0; y < usage.length; y++) {
        for (let x = 0; x < usage[y].length; x++) {
            if (usage[y][x] > 1) {
                crossroads.push({ x, y });
                for (const [dx, dy] of dirs) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (ny < 0 || ny >= h || nx < 0 || nx >= w)
                        continue;
                    const tile = tiles[ny]?.[nx];
                    if (tile === undefined)
                        continue;
                    if (isWaterTile(tile))
                        continue;
                    tiles[ny][nx] = roadId;
                }
            }
        }
    }
    return { anchors: network.anchors, segments: carvedSegments, crossroads };
}
function scatterRuins(tiles, seed = 1) {
    const h = tiles.length;
    const w = tiles[0]?.length ?? 0;
    const rand = mulberry32(normalizeSeed(seed));
    const count = Math.max(3, Math.round((w * h) / 160));
    const ruins = [];
    const hubs = [];
    const water = readTile('WATER');
    const road = readTile('ROAD');
    const ruin = readTile('RUIN');
    const pickRandomLand = () => {
        for (let attempt = 0; attempt < 200; attempt++) {
            const x = Math.floor(rand() * w);
            const y = Math.floor(rand() * h);
            const tile = tiles[y]?.[x];
            if (tile === undefined)
                continue;
            if (tile === water || tile === road || tile === ruin)
                continue;
            return { x, y };
        }
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const tile = tiles[y]?.[x];
                if (tile === undefined)
                    continue;
                if (tile === water || tile === road || tile === ruin)
                    continue;
                return { x, y };
            }
        }
        return null;
    };
    const selectHub = () => {
        if (!h || !w)
            return null;
        if (!hubs.length) {
            return pickRandomLand();
        }
        let bestDistSq = -1;
        const candidates = [];
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const tile = tiles[y]?.[x];
                if (tile === undefined)
                    continue;
                if (tile === water || tile === road || tile === ruin)
                    continue;
                let minDistSq = Infinity;
                for (const hub of hubs) {
                    const dx = hub.x - x;
                    const dy = hub.y - y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < minDistSq)
                        minDistSq = distSq;
                }
                if (minDistSq > bestDistSq + 1e-6) {
                    bestDistSq = minDistSq;
                    candidates.length = 0;
                    candidates.push({ x, y });
                }
                else if (Math.abs(minDistSq - bestDistSq) <= 1e-6) {
                    candidates.push({ x, y });
                }
            }
        }
        if (bestDistSq < MIN_RUIN_HUB_DISTANCE_SQ || !candidates.length) {
            return null;
        }
        const choice = candidates[Math.floor(rand() * candidates.length) % candidates.length];
        return choice;
    };
    for (let i = 0; i < count; i++) {
        const hub = selectHub();
        if (!hub)
            break;
        const { x, y } = hub;
        hubs.push(hub);
        const radius = 2 + Math.floor(rand() * 4);
        const groups = 2 + Math.floor(rand() * 3);
        for (let g = 0; g < groups; g++) {
            const angle = rand() * Math.PI * 2;
            const dist = 2 + Math.floor(rand() * Math.max(1, radius / 2));
            const cx = x + Math.round(Math.cos(angle) * dist);
            const cy = y + Math.round(Math.sin(angle) * dist);
            if (cx < 0 || cx >= w || cy < 0 || cy >= h)
                continue;
            const tile = tiles[cy]?.[cx];
            if (tile === water || tile === road || tile === ruin)
                continue;
            tiles[cy][cx] = ruin ?? tile ?? 0;
            ruins.push({ x: cx, y: cy });
            const extra = 1 + Math.floor(rand() * 3);
            for (let n = 0; n < extra; n++) {
                const nx = cx + Math.floor(rand() * 3) - 1;
                const ny = cy + Math.floor(rand() * 3) - 1;
                if (nx < 0 || nx >= w || ny < 0 || ny >= h)
                    continue;
                const current = tiles[ny]?.[nx];
                if (current === water || current === road || current === ruin)
                    continue;
                tiles[ny][nx] = ruin ?? current ?? 0;
                ruins.push({ x: nx, y: ny });
            }
        }
    }
    return { tiles, ruins, hubs };
}
function findRegionCenters(tiles) {
    const h = tiles.length;
    const w = tiles[0]?.length ?? 0;
    const water = readTile('WATER');
    const seen = Array.from({ length: h }, () => Array(w).fill(false));
    const centers = [];
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (tiles[y]?.[x] === water || seen[y][x])
                continue;
            const stack = [[x, y]];
            seen[y][x] = true;
            let sx = 0;
            let sy = 0;
            let count = 0;
            while (stack.length) {
                const [cx, cy] = stack.pop();
                sx += cx;
                sy += cy;
                count++;
                const dirs = [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1]
                ];
                for (const [dx, dy] of dirs) {
                    const nx = cx + dx;
                    const ny = cy + dy;
                    if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                        if (!seen[ny][nx] && tiles[ny]?.[nx] !== water) {
                            seen[ny][nx] = true;
                            stack.push([nx, ny]);
                        }
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
            let sx = 0;
            let sy = 0;
            let count = 0;
            for (let yy = y0; yy < y1; yy++) {
                for (let xx = x0; xx < x1; xx++) {
                    if (tiles[yy]?.[xx] !== water) {
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
            return extra;
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
    tiles = tiles.slice(0, height).map(row => row.slice(0, width));
    field = field.slice(0, height).map(row => row.slice(0, width));
    let centers = [];
    let roadData = { anchors: [], segments: [], crossroads: [] };
    if (features.roads) {
        const regionCenters = findRegionCenters(tiles);
        const planned = connectRegionCenters(tiles, field, regionCenters, seed);
        roadData = carveRoads(tiles, planned);
        centers = roadData.anchors;
    }
    const featureData = {};
    if (features.ruins) {
        const res = scatterRuins(tiles, seed);
        tiles = res.tiles;
        featureData.ruins = res.ruins;
        featureData.ruinHubs = res.hubs;
    }
    return { tiles, regions: centers, roads: roadData, features: featureData };
}
const scope = globalThis;
scope.generateHeightField = generateHeightField;
scope.heightFieldToTiles = heightFieldToTiles;
scope.refineTiles = refineTiles;
scope.findRegionCenters = findRegionCenters;
scope.connectRegionCenters = connectRegionCenters;
scope.carveRoads = carveRoads;
scope.scatterRuins = scatterRuins;
scope.exportMap = exportMap;
scope.generateProceduralMap = generateProceduralMap;

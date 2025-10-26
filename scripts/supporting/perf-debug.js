(function () {
    const panel = document.getElementById('perfPanel');
    const openBtn = document.getElementById('perfBtn');
    const closeBtn = document.getElementById('perfClose');
    const canvas = document.getElementById('perfCanvas');
    const sfxLabel = document.getElementById('perfSfx');
    const pathLabel = document.getElementById('perfPath');
    const aiLabel = document.getElementById('perfAI');
    const tileLabel = document.getElementById('perfTiles');
    const ctx = canvas?.getContext('2d');
    const width = canvas?.width ?? 0;
    const height = canvas?.height ?? 0;
    const hist = {
        sfx: Array(width).fill(0),
        path: Array(width).fill(0),
        ai: Array(width).fill(0),
        tiles: Array(width).fill(0)
    };
    const globalPerf = globalThis;
    const stats = globalPerf.perfStats = {
        sfx: 0,
        path: 0,
        ai: 0,
        tiles: 0
    };
    function draw() {
        if (!ctx)
            return;
        ctx.clearRect(0, 0, width, height);
        const max = Math.max(...hist.sfx, ...hist.path, ...hist.ai, ...hist.tiles, 1);
        const scale = height / max;
        ctx.strokeStyle = '#f33';
        ctx.beginPath();
        hist.sfx.forEach((v, i) => {
            const y = height - v * scale;
            if (i) {
                ctx.lineTo(i, y);
            }
            else {
                ctx.moveTo(i, y);
            }
        });
        ctx.stroke();
        ctx.strokeStyle = '#3f3';
        ctx.beginPath();
        hist.path.forEach((v, i) => {
            const y = height - v * scale;
            if (i) {
                ctx.lineTo(i, y);
            }
            else {
                ctx.moveTo(i, y);
            }
        });
        ctx.stroke();
        ctx.strokeStyle = '#39f';
        ctx.beginPath();
        hist.ai.forEach((v, i) => {
            const y = height - v * scale;
            if (i) {
                ctx.lineTo(i, y);
            }
            else {
                ctx.moveTo(i, y);
            }
        });
        ctx.stroke();
        ctx.strokeStyle = '#ff0';
        ctx.beginPath();
        hist.tiles.forEach((v, i) => {
            const y = height - v * scale;
            if (i) {
                ctx.lineTo(i, y);
            }
            else {
                ctx.moveTo(i, y);
            }
        });
        ctx.stroke();
    }
    function record() {
        hist.sfx.push(stats.sfx);
        hist.sfx.shift();
        hist.path.push(stats.path);
        hist.path.shift();
        hist.ai.push(stats.ai);
        hist.ai.shift();
        hist.tiles.push(stats.tiles);
        hist.tiles.shift();
        if (sfxLabel)
            sfxLabel.textContent = stats.sfx.toFixed(2);
        if (pathLabel)
            pathLabel.textContent = stats.path.toFixed(2);
        if (aiLabel)
            aiLabel.textContent = stats.ai.toFixed(2);
        if (tileLabel)
            tileLabel.textContent = stats.tiles.toFixed(2);
        draw();
        stats.sfx = stats.path = stats.ai = stats.tiles = 0;
    }
    globalPerf._perfRecord = record;
    const timer = setInterval(record, 1000);
    if (typeof timer === 'object' && timer !== null && 'unref' in timer) {
        const timeout = timer;
        timeout.unref?.();
    }
    function show() {
        if (panel) {
            panel.style.display = 'block';
        }
    }
    function hide() {
        if (panel) {
            panel.style.display = 'none';
        }
    }
    openBtn?.addEventListener('click', show);
    closeBtn?.addEventListener('click', hide);
    const dragHandle = panel?.querySelector('header') ?? null;
    let dragX = 0;
    let dragY = 0;
    function startDrag(e) {
        if (!panel)
            return;
        dragX = e.clientX - panel.offsetLeft;
        dragY = e.clientY - panel.offsetTop;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
        e.preventDefault();
    }
    function onDrag(e) {
        if (!panel)
            return;
        panel.style.left = `${e.clientX - dragX}px`;
        panel.style.top = `${e.clientY - dragY}px`;
    }
    function endDrag() {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
    }
    dragHandle?.addEventListener('mousedown', startDrag);
})();

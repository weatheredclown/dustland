// @ts-nocheck
(function(){
  const panel = document.getElementById('perfPanel');
  const openBtn = document.getElementById('perfBtn');
  const closeBtn = document.getElementById('perfClose');
  const canvas = document.getElementById('perfCanvas');
  const sfxLabel = document.getElementById('perfSfx');
  const pathLabel = document.getElementById('perfPath');
  const aiLabel = document.getElementById('perfAI');
  const ctx = canvas?.getContext('2d');
  const width = canvas?.width || 0;
  const height = canvas?.height || 0;
  const hist = {
    sfx: Array(width).fill(0),
    path: Array(width).fill(0),
    ai: Array(width).fill(0)
  };
  const stats = globalThis.perfStats = { sfx:0, path:0, ai:0 };

  function draw(){
    if(!ctx) return;
    ctx.clearRect(0,0,width,height);
    const max = Math.max(...hist.sfx, ...hist.path, ...hist.ai, 1);
    const scale = height / max;
    ctx.strokeStyle = '#f33';
    ctx.beginPath();
    hist.sfx.forEach((v,i)=>{ const y = height - v * scale; i?ctx.lineTo(i,y):ctx.moveTo(i,y); });
    ctx.stroke();
    ctx.strokeStyle = '#3f3';
    ctx.beginPath();
    hist.path.forEach((v,i)=>{ const y = height - v * scale; i?ctx.lineTo(i,y):ctx.moveTo(i,y); });
    ctx.stroke();
    ctx.strokeStyle = '#39f';
    ctx.beginPath();
    hist.ai.forEach((v,i)=>{ const y = height - v * scale; i?ctx.lineTo(i,y):ctx.moveTo(i,y); });
    ctx.stroke();
  }

  function record(){
    hist.sfx.push(stats.sfx); hist.sfx.shift();
    hist.path.push(stats.path); hist.path.shift();
    hist.ai.push(stats.ai); hist.ai.shift();
    if(sfxLabel) sfxLabel.textContent = stats.sfx.toFixed(2);
    if(pathLabel) pathLabel.textContent = stats.path.toFixed(2);
    if(aiLabel) aiLabel.textContent = stats.ai.toFixed(2);
    draw();
    stats.sfx=stats.path=stats.ai=0;
  }
  globalThis._perfRecord = record;
  setInterval(record, 1000).unref?.();

  function show(){ if(panel) panel.style.display='block'; }
  function hide(){ if(panel) panel.style.display='none'; }
  openBtn?.addEventListener('click', show);
  closeBtn?.addEventListener('click', hide);

  const dragHandle = panel?.querySelector('header');
  let dragX = 0;
  let dragY = 0;
  function startDrag(e){
    dragX = e.clientX - panel.offsetLeft;
    dragY = e.clientY - panel.offsetTop;
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    e.preventDefault();
  }
  function onDrag(e){
    panel.style.left = (e.clientX - dragX) + 'px';
    panel.style.top = (e.clientY - dragY) + 'px';
  }
  function endDrag(){
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', endDrag);
  }
  dragHandle?.addEventListener('mousedown', startDrag);
})();

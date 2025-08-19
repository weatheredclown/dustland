// Adventure Construction Kit
// Provides basic tools to build Dustland modules.

// Ensure world generation doesn't pull default content
window.seedWorldContent = () => { };

const PLAYTEST_KEY = 'ack_playtest';

const colors = { 0: '#1e271d', 1: '#2c342c', 2: '#1573ff', 3: '#203320', 4: '#394b39', 5: '#304326', 6: '#4d5f4d', 7: '#233223', 8: '#8bd98d', 9: '#000' };
const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

let dragTarget = null, settingStart = false, hoverTarget = null, didDrag = false;
let placingType = null, placingPos = null;
let hoverTile = null;
let coordTarget = null;

const moduleData = { seed: Date.now(), npcs: [], items: [], quests: [], buildings: [], interiors: [], start: { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) } };
const STAT_OPTS = ['ATK', 'DEF', 'LCK', 'INT', 'PER', 'CHA'];
let editNPCIdx = -1, editItemIdx = -1, editQuestIdx = -1, editBldgIdx = -1, editInteriorIdx = -1;
let treeData = {};
let selectedObj = null;
const intCanvas = document.getElementById('intCanvas');
const intCtx = intCanvas.getContext('2d');

function nextId(prefix, arr) {
  let i = 1; while (arr.some(o => o.id === prefix + i)) i++; return prefix + i;
}

function drawWorld() {
  const W = WORLD_W, H = WORLD_H;
  const sx = canvas.width / W;
  const sy = canvas.height / H;
  const pulse = 2 + Math.sin(Date.now() / 300) * 2;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = world[y][x];
      ctx.fillStyle = colors[t] || '#000';
      ctx.fillRect(x * sx, y * sy, sx, sy);
    }
  }
  if (hoverTile) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(hoverTile.x * sx, hoverTile.y * sy, sx, sy);
  }
  // Draw NPC markers
  moduleData.npcs.filter(n => n.map === 'world').forEach(n => {
    const hovering = hoverTarget && hoverTarget.type === 'npc' && hoverTarget.obj === n;
    ctx.save();
    ctx.fillStyle = hovering ? '#fff' : (n.color || '#fff');
    if (hovering) {
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 8;
    }
    ctx.fillRect(n.x * sx, n.y * sy, sx, sy);
    if (hovering) {
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(n.x * sx, n.y * sy, sx, sy);
    }
    ctx.restore();
  });
  // Draw Item markers
  moduleData.items.filter(it => it.map === 'world').forEach(it => {
    const hovering = hoverTarget && hoverTarget.type === 'item' && hoverTarget.obj === it;
    ctx.save();
    ctx.strokeStyle = hovering ? '#fff' : '#ff0';
    if (hovering) {
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2;
    }
    ctx.strokeRect(it.x * sx + 1, it.y * sy + 1, sx - 2, sy - 2);
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
    ctx.strokeRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy);
    ctx.restore();
  }
  if (moduleData.start && moduleData.start.map === 'world') {
    ctx.save();
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = pulse;
    ctx.strokeRect(moduleData.start.x * sx + 1, moduleData.start.y * sy + 1, sx - 2, sy - 2);
    ctx.restore();
  }
  if (selectedObj && selectedObj.obj) {
    const o = selectedObj.obj;
    ctx.save();
    ctx.lineWidth = pulse;
    if (selectedObj.type === 'npc' && o.map === 'world') {
      ctx.strokeStyle = o.color || '#fff';
      ctx.strokeRect(o.x * sx + 1, o.y * sy + 1, sx - 2, sy - 2);
    } else if (selectedObj.type === 'item' && o.map === 'world') {
      ctx.strokeStyle = '#ff0';
      ctx.strokeRect(o.x * sx + 1, o.y * sy + 1, sx - 2, sy - 2);
    } else if (selectedObj.type === 'bldg') {
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(o.x * sx, o.y * sy, o.w * sx, o.h * sy);
    }
    ctx.restore();
  }
  if (placingType && placingPos) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    if (placingType === 'npc') {
      ctx.fillStyle = '#fff';
      ctx.fillRect(placingPos.x * sx, placingPos.y * sy, sx, sy);
    } else if (placingType === 'item') {
      ctx.strokeStyle = '#ff0';
      ctx.strokeRect(placingPos.x * sx + 1, placingPos.y * sy + 1, sx - 2, sy - 2);
    } else if (placingType === 'bldg') {
      const bw = 6, bh = 5;
      ctx.fillStyle = '#fff';
      ctx.fillRect(placingPos.x * sx, placingPos.y * sy, bw * sx, bh * sy);
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

intCanvas.addEventListener('click', e => {
  if (editInteriorIdx < 0) return;
  const I = moduleData.interiors[editInteriorIdx];
  const rect = intCanvas.getBoundingClientRect();
  const x = Math.floor((e.clientX - rect.left) / (intCanvas.width / I.w));
  const y = Math.floor((e.clientY - rect.top) / (intCanvas.height / I.h));
  const cyc = [TILE.WALL, TILE.FLOOR, TILE.DOOR];
  let idx = cyc.indexOf(I.grid[y][x]);
  idx = (idx + 1) % cyc.length;
  I.grid[y][x] = cyc[idx];
  if (I.grid[y][x] === TILE.DOOR) { I.entryX = x; I.entryY = y - 1; }
  drawInterior();
});

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
  const id = makeInteriorRoom();
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
  showInteriorEditor(true);
  document.getElementById('delInterior').style.display = 'block';
  drawInterior();
}

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

function regenWorld() {
  moduleData.seed = Date.now();
  genWorld(moduleData.seed);
  moduleData.buildings = [...buildings];
  moduleData.interiors = [];
  for (const id in interiors) {
    if(id==='creator') continue;
    const I = interiors[id]; I.id = id; moduleData.interiors.push(I);
  }
  renderInteriorList();
  renderBldgList();
  drawWorld();
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
  if (!tree) { prev.innerHTML = ''; return; }
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
  const joinId = join?.id || '', joinName = join?.name || '', joinRole = join?.role || '';
  const goto = ch.goto || {};
  const gotoMap = goto.map || '', gotoX = goto.x != null ? goto.x : '', gotoY = goto.y != null ? goto.y : '';
  const isXP = typeof reward === 'string' && /^xp\s*\d+/i.test(reward);
  const xpVal = isXP ? parseInt(reward.replace(/[^0-9]/g, ''), 10) : '';
  const isItem = reward && !isXP;
  const itemVal = isItem ? reward : '';
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
      <label>Join ID<select class="choiceJoinId"></select></label>
      <label>Join Name<input class="choiceJoinName" value="${joinName}"/><span class="small">Name shown after joining.</span></label>
      <label>Join Role<select class="choiceJoinRole"></select></label>
      <label>Goto Map<select class="choiceGotoMap"></select></label>
      <label>Goto X<input type="number" class="choiceGotoX" value="${gotoX}"/><span class="small">X coordinate.</span></label>
      <label>Goto Y<input type="number" class="choiceGotoY" value="${gotoY}"/><span class="small">Y coordinate.</span></label>
      <label>Quest<select class="choiceQ"><option value=""></option><option value="accept" ${q==='accept'?'selected':''}>accept</option><option value="turnin" ${q==='turnin'?'selected':''}>turnin</option></select></label>
      <label class="onceWrap"><input type="checkbox" class="choiceOnce" ${once ? 'checked' : ''}/> once</label>
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
}

function renderTreeEditor() {
  const wrap = document.getElementById('treeEditor');
  if (!wrap) return;
  wrap.innerHTML = '';
  Object.entries(treeData).forEach(([id, node]) => {
    const div = document.createElement('div');
    div.className = 'node';
    div.innerHTML = `<div class="nodeHeader"><button class="toggle" type="button">[-]</button><label>Node ID<input class="nodeId" value="${id}"></label></div><div class="nodeBody"><label>Dialog Text<textarea class="nodeText" rows="2">${node.text || ''}</textarea></label><fieldset class="choiceGroup"><legend>Choices</legend><div class="choices"></div><button class="btn addChoice" type="button">Add Choice</button></fieldset></div>`;
    const choicesDiv = div.querySelector('.choices');
    (node.choices || []).forEach(ch => addChoiceRow(choicesDiv, ch));
    div.querySelector('.addChoice').onclick = () => addChoiceRow(choicesDiv);
    const toggleBtn = div.querySelector('.toggle');
    toggleBtn.addEventListener('click', () => {
      div.classList.toggle('collapsed');
      toggleBtn.textContent = div.classList.contains('collapsed') ? '[+]' : '[-]';
      updateTreeData();
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
      const q = chEl.querySelector('.choiceQ').value.trim();
      const once = chEl.querySelector('.choiceOnce').checked;

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
        if (gotoMap) {
          c.goto = { map: gotoMap };
          const gx = gotoXTxt ? parseInt(gotoXTxt, 10) : undefined;
          const gy = gotoYTxt ? parseInt(gotoYTxt, 10) : undefined;
          if (gx != null && !Number.isNaN(gx)) c.goto.x = gx;
          if (gy != null && !Number.isNaN(gy)) c.goto.y = gy;
        }
        if (q) c.q = q;
        if (once) c.once = true;
        choices.push(c);
      }
    });

    newTree[id] = { text, choices };
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
  document.getElementById('npcDialog').value = '';
  document.getElementById('npcQuest').value = '';
  document.getElementById('npcAccept').value = 'Good luck.';
  document.getElementById('npcTurnin').value = 'Thanks for helping.';
  toggleQuestTextWrap();
  document.getElementById('npcTree').value = '';
  document.getElementById('npcCombat').checked = false;
  document.getElementById('npcShop').checked = false;
  updateNPCOptSections();
  document.getElementById('addNPC').textContent = 'Add NPC';
  document.getElementById('delNPC').style.display = 'none';
  loadTreeEditor();
  toggleQuestDialogBtn();
  placingType = 'npc';
  placingPos = null;
  selectedObj = null;
  drawWorld();
  showNPCEditor(true);
}
function addNPC() {
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
  updateTreeData();
  let tree = null;
  const treeTxt = document.getElementById('npcTree').value.trim();
  if (treeTxt) { try { tree = JSON.parse(treeTxt); } catch (e) { tree = null; } }
  if (!tree) {
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
  // Update dialog text even when tree JSON already exists
  if (tree.start) tree.start.text = dialog;
  if (tree.accept) tree.accept.text = accept || tree.accept.text;
  if (tree.do_turnin) tree.do_turnin.text = turnin || tree.do_turnin.text;
  if (combat) applyCombatTree(tree); else removeCombatTree(tree);
  if (shop) applyShopTree(tree); else removeShopTree(tree);
  document.getElementById('npcTree').value = JSON.stringify(tree, null, 2);
  loadTreeEditor();

  const npc = { id, name, desc, color, map, x, y, tree, questId };
  if (combat) npc.combat = { DEF: 5 };
  if (shop) npc.shop = true;
  if (editNPCIdx >= 0) {
    moduleData.npcs[editNPCIdx] = npc;
  } else {
    moduleData.npcs.push(npc);
  }
  editNPCIdx = -1;
  document.getElementById('addNPC').textContent = 'Add NPC';
  document.getElementById('delNPC').style.display = 'none';
  renderNPCList();
  document.getElementById('npcId').value = nextId('npc', moduleData.npcs);
  document.getElementById('npcDesc').value = '';
  document.getElementById('npcCombat').checked = false;
  document.getElementById('npcShop').checked = false;
  updateNPCOptSections();
  selectedObj = null;
  drawWorld();
  loadTreeEditor();
  showNPCEditor(false);
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
  document.getElementById('npcDialog').value = n.tree?.start?.text || '';
  document.getElementById('npcQuest').value = n.questId || '';
  document.getElementById('npcAccept').value = n.tree?.accept?.text || 'Good luck.';
  document.getElementById('npcTurnin').value = n.tree?.do_turnin?.text || 'Thanks for helping.';
  toggleQuestTextWrap();
  document.getElementById('npcTree').value = JSON.stringify(n.tree, null, 2);
  document.getElementById('npcCombat').checked = !!n.combat;
  document.getElementById('npcShop').checked = !!n.shop;
  updateNPCOptSections();
  document.getElementById('addNPC').textContent = 'Update NPC';
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
  document.getElementById('addNPC').textContent = 'Add NPC';
  document.getElementById('delNPC').style.display = 'none';
  renderNPCList();
  selectedObj = null;
  drawWorld();
  document.getElementById('npcId').value = nextId('npc', moduleData.npcs);
  document.getElementById('npcDesc').value = '';
  loadTreeEditor();
  showNPCEditor(false);
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
  document.getElementById('itemUse').value = '';
  document.getElementById('addItem').textContent = 'Add Item';
  document.getElementById('delItem').style.display = 'none';
  placingType = 'item';
  placingPos = null;
  selectedObj = null;
  drawWorld();
  showItemEditor(true);
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
  try { use = JSON.parse(document.getElementById('itemUse').value || 'null'); } catch (e) { use = null; }
  const item = { id, name, type, tags, map, x, y, slot, mods, value, use, equip };
  if (editItemIdx >= 0) {
    moduleData.items[editItemIdx] = item;
  } else {
    moduleData.items.push(item);
  }
  editItemIdx = -1;
  document.getElementById('addItem').textContent = 'Add Item';
  document.getElementById('delItem').style.display = 'none';
  loadMods({});
  renderItemList();
  selectedObj = null;
  drawWorld();
  showItemEditor(false);
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
  document.getElementById('itemUse').value = it.use ? JSON.stringify(it.use, null, 2) : '';
  document.getElementById('addItem').textContent = 'Update Item';
  document.getElementById('delItem').style.display = 'block';
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

// --- Buildings ---
function showBldgEditor(show) {
  document.getElementById('bldgEditor').style.display = show ? 'block' : 'none';
}
function startNewBldg() {
  editBldgIdx = -1;
  document.getElementById('bldgX').value = 0;
  document.getElementById('bldgY').value = 0;
  updateInteriorOptions();
  document.getElementById('delBldg').style.display = 'none';
  placingType = 'bldg';
  placingPos = null;
  selectedObj = null;
  drawWorld();
  showBldgEditor(true);
}
function addBuilding() {
  const x = parseInt(document.getElementById('bldgX').value, 10) || 0;
  const y = parseInt(document.getElementById('bldgY').value, 10) || 0;
  let interiorId = document.getElementById('bldgInterior').value;
  if (!interiorId) {
    interiorId = makeInteriorRoom();
    const I = interiors[interiorId]; I.id = interiorId; moduleData.interiors.push(I); renderInteriorList();
  }
  const b = placeHut(x, y, { interiorId });
  moduleData.buildings.push(b);
  renderBldgList();
  selectedObj = null;
  drawWorld();
  editBldgIdx = -1;
  document.getElementById('delBldg').style.display = 'none';
  showBldgEditor(false);
}
function renderBldgList() {
  const list = document.getElementById('bldgList');
  list.innerHTML = moduleData.buildings.map((b, i) => `<div data-idx="${i}">Hut @(${b.x},${b.y})</div>`).join('');
  Array.from(list.children).forEach(div => div.onclick = () => editBldg(parseInt(div.dataset.idx, 10)));
}

function editBldg(i) {
  const b = moduleData.buildings[i];
  editBldgIdx = i;
  document.getElementById('bldgX').value = b.x;
  document.getElementById('bldgY').value = b.y;
  updateInteriorOptions();
  document.getElementById('bldgInterior').value = b.interiorId || '';
  document.getElementById('delBldg').style.display = 'block';
  showBldgEditor(true);
  selectedObj = { type: 'bldg', obj: b };
  drawWorld();
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
  const nb = placeHut(x, y, { interiorId: b.interiorId, boarded: b.boarded });
  moduleData.buildings[idx] = nb;
  editBldgIdx = idx;
  return nb;
}

function deleteBldg() {
  if (editBldgIdx < 0) return;
  const b = moduleData.buildings[editBldgIdx];
  removeBuilding(b);
  moduleData.buildings.splice(editBldgIdx, 1);
  editBldgIdx = -1;
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
  moduleData.npcs = data.npcs || [];
  moduleData.items = data.items || [];
  moduleData.quests = data.quests || [];
  moduleData.buildings = data.buildings || [];
  moduleData.interiors = data.interiors || [];
  moduleData.start = data.start || { map: 'world', x: 2, y: Math.floor(WORLD_H / 2) };
  interiors = {};
  moduleData.interiors.forEach(I => { interiors[I.id] = I; });

  world = data.world || world;
  buildings = moduleData.buildings.map(b => ({
    ...b,
    under: Array.from({ length: b.h }, () => Array.from({ length: b.w }, () => TILE.SAND))
  }));

  drawWorld();
  renderNPCList();
  renderItemList();
  renderBldgList();
  renderInteriorList();
  renderQuestList();
  updateQuestOptions();
  loadMods({});
  showItemEditor(false);
  showNPCEditor(false);
  showBldgEditor(false);
  showInteriorEditor(false);
  showQuestEditor(false);
}

function saveModule() {
  const bldgs = buildings.map(({ under, ...rest }) => rest);
  const data = { ...moduleData, world, buildings: bldgs };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'adventure-module.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function playtestModule() {
  const bldgs = buildings.map(({ under, ...rest }) => rest);
  const data = { ...moduleData, world, buildings: bldgs };
  localStorage.setItem(PLAYTEST_KEY, JSON.stringify(data));
  window.open('ack-player.html#play', '_blank');
}

document.getElementById('regen').onclick = regenWorld;
document.getElementById('addNPC').onclick = addNPC;
document.getElementById('addItem').onclick = addItem;
document.getElementById('newItem').onclick = startNewItem;
document.getElementById('newNPC').onclick = startNewNPC;
document.getElementById('newBldg').onclick = startNewBldg;
document.getElementById('newQuest').onclick = startNewQuest;
document.getElementById('addBldg').onclick = addBuilding;
document.getElementById('addQuest').onclick = addQuest;
document.getElementById('delNPC').onclick = deleteNPC;
document.getElementById('delItem').onclick = deleteItem;
document.getElementById('delBldg').onclick = deleteBldg;
document.getElementById('newInterior').onclick = startNewInterior;
document.getElementById('delInterior').onclick = deleteInterior;
document.getElementById('delQuest').onclick = deleteQuest;
document.getElementById('addMod').onclick = () => modRow();
document.getElementById('itemSlot').addEventListener('change', updateModsWrap);
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
document.getElementById('playtest').onclick = playtestModule;
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
document.getElementById('genQuestDialog').onclick = generateQuestTree;

// --- Map interactions ---
function canvasPos(ev) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / WORLD_W, sy = canvas.height / WORLD_H;
  const x = clamp(Math.floor((ev.clientX - rect.left) / sx), 0, WORLD_W - 1);
  const y = clamp(Math.floor((ev.clientY - rect.top) / sy), 0, WORLD_H - 1);
  return { x, y };
}

function updateCursor(x, y) {
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
    canvas.style.cursor = (overNpc || overItem || overBldg || overStart) ? 'grab' : 'pointer';
  } else {
    canvas.style.cursor = 'pointer';
  }
}
canvas.addEventListener('mousedown', ev => {
  const { x, y } = canvasPos(ev);
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
    } else if (placingType === 'item') {
      document.getElementById('itemX').value = x;
      document.getElementById('itemY').value = y;
    } else if (placingType === 'bldg') {
      document.getElementById('bldgX').value = x;
      document.getElementById('bldgY').value = y;
    }
    placingType = null;
    placingPos = null;
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
  selectedObj = null;
  drawWorld();
  updateCursor(x, y);
});
canvas.addEventListener('mousemove', ev => {
  const { x, y } = canvasPos(ev);
  hoverTile = { x, y };

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
  }

  if ((hoverTarget && (!ht || hoverTarget.obj !== ht.obj)) || (!hoverTarget && ht)) {
    hoverTarget = ht;
    drawWorld();
  }

  updateCursor(x, y);
});
canvas.addEventListener('mouseup', () => {
  if (dragTarget) delete dragTarget._type;
  dragTarget = null;
  updateCursor();
});
canvas.addEventListener('mouseleave', () => {
  if (dragTarget) delete dragTarget._type;
  dragTarget = null;
  hoverTile = null;
  drawWorld();
  updateCursor();
});

canvas.addEventListener('click', ev => {
  if (didDrag) { didDrag = false; return; }
  const { x, y } = canvasPos(ev);
  let idx = moduleData.npcs.findIndex(n => n.map === 'world' && n.x === x && n.y === y);
  if (idx >= 0) {
    document.querySelector('.tab2[data-tab="npc"]').click();
    editNPC(idx);
    return;
  }
  idx = moduleData.items.findIndex(it => it.map === 'world' && it.x === x && it.y === y);
  if (idx >= 0) {
    document.querySelector('.tab2[data-tab="items"]').click();
    editItem(idx);
    return;
  }
  idx = moduleData.buildings.findIndex(b => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
  if (idx >= 0) {
    document.querySelector('.tab2[data-tab="buildings"]').click();
    editBldg(idx);
  }
});

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
document.getElementById('npcId').value = nextId('npc', moduleData.npcs);
document.getElementById('questId').value = nextId('quest', moduleData.quests);
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
  const mq = window.matchMedia('(min-width: 1600px)');
  let current = 'npc';

  function setLayout() {
    if (mq.matches) {
      panel.classList.add('wide');
      panes.forEach(p => p.style.display = '');
    } else {
      panel.classList.remove('wide');
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
    if (!mq.matches) {
      panes.forEach(p => p.style.display = (p.dataset.pane === tabName ? '' : 'none'));
    }
  }

  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
  mq.addEventListener('change', setLayout);
  setLayout();
})();

document.getElementById('playtestFloat').onclick =
  () => document.getElementById('playtest')?.click();

const toggleEditorBtn = document.getElementById('toggleEditor');
if (toggleEditorBtn) {
  const panel = document.getElementById('editorPanel');
  toggleEditorBtn.addEventListener('click', () => {
    const isShown = panel.style.display !== 'none';
    panel.style.display = isShown ? 'none' : '';
    toggleEditorBtn.textContent = isShown ? 'Show Editor' : 'Hide Editor';
    toggleEditorBtn.setAttribute('aria-expanded', String(!isShown));
    panel.setAttribute('aria-hidden', String(isShown));
  });
}

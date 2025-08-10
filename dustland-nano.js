// dustland-nano.js
// Gemini Nano background dialog generator for Dustland
// - Detects on-device LanguageModel Prompt API
// - Keeps a single session
// - Queues NPC dialog generations and caches lines per (npcId, "start"/node)
// - Never blocks gameplay; best-effort only

(function(){
  // Public API
  window.NanoDialog = {
    init,
    queueForNPC,
    linesFor,      // get cached lines; returns []
    choicesFor,    // get cached choices; returns []
    isReady: ()=> _state.ready,
    enabled: true, // flip to false to disable
    choicesEnabled: false,
    refreshIndicator
  };

  const _state = {
    ready: false,
    session: null,
    queue: [],
    busy: false,
    failed: false,
    cache: new Map(), // key: `${npcId}::${node}` -> {lines:[],choices:[]}
    seenKeys: new Set(), // avoid re-enqueue storms
  };

  const _ui = { badge:null, progress:null };

  function refreshIndicator(){ _updateBadge(); }

  function _ensureUI(){
    if(_ui.badge) return;
    const wrap=document.getElementById('nanoStatus');
    if(!wrap) return;
    _ui.progress=wrap.querySelector('#nanoProgress');
    _ui.badge=wrap.querySelector('#nanoBadge');
  }

  function _updateBadge(){
    _ensureUI();
    if(!_ui.badge) return;
    const on=_state.ready && window.NanoDialog.enabled;
    _ui.badge.textContent = on ? '✓' : (_state.failed ? '!' : '✗');
    _ui.badge.classList.toggle('on', on);
    _ui.badge.classList.toggle('off', !on && !_state.failed);
    _ui.badge.classList.toggle('failed', _state.failed);
  }

  function _showProgress(p){
    _ensureUI();
    if(!_ui.progress) return;
    _ui.progress.style.display='block';
    _ui.progress.style.background=`conic-gradient(var(--accent) ${p}%,#273027 0)`;
  }

  function _hideProgress(){
    if(_ui.progress) _ui.progress.style.display='none';
  }

  function _setBusy(flag){
    _state.busy=flag;
    if(_ui.badge) _ui.badge.classList.toggle('busy', flag);
  }

  // ===== Lifecycle =====
  async function init(){
    _ensureUI();
    _state.failed=false;
    _updateBadge();
    if(!_featureSupported()){
      log && log('[Nano] Prompt API not supported.');
      _state.failed=true;
      _updateBadge();
      return;
    }
    try {
      const avail = await LanguageModel.availability({ outputLanguage: "en" });
      if (avail === "available") {
        _state.session = await LanguageModel.create({ outputLanguage: "en" });
        _state.ready = true; _state.failed=false; log && log('[Nano] Model ready.');
        _updateBadge();
      } else if (avail === "downloadable" || avail === "downloading") {
        log && log('[Nano] Downloading on-device model…');
        _showProgress(0);
        _state.session = await LanguageModel.create({
          outputLanguage: "en",
          monitor(m){
            m.addEventListener("downloadprogress", (e)=>{
              const pct = e.total ? (e.loaded / e.total) * 100 : e.loaded * 100;
              _showProgress(pct);
            });
          }
        });
        _hideProgress();
        _state.ready = true; _state.failed=false; log && log('[Nano] Model ready.');
        _updateBadge();
      } else {
        log && log('[Nano] Model not available on this device.');
        _state.failed=true;
        _updateBadge();
      }
    } catch (err){
      console.error(err);
      log && log('[Nano] Failed to init model.');
      _hideProgress();
      _state.failed=true;
      _updateBadge();
    }
    _pump(); // start background worker
  }

  function _featureSupported(){ return !!window.LanguageModel; }

  // ===== Public: schedule generation for an NPC/node pair =====
  function queueForNPC(npc, nodeId='start', reason='timer'){
    if(!_state.ready || !window.NanoDialog.enabled) return;
    const key = _key(npc.id, nodeId);
    if(_state.seenKeys.has(key)) return;
    _state.seenKeys.add(key);
    _state.queue.push({ npcId:npc.id, nodeId, reason, when: Date.now() });
    _pump();
  }

  function linesFor(npcId, nodeId='start'){
    const data = _state.cache.get(_key(npcId, nodeId));
    return data && Array.isArray(data.lines) ? data.lines : [];
  }

  function choicesFor(npcId, nodeId='start'){
    const data = _state.cache.get(_key(npcId, nodeId));
    return data && Array.isArray(data.choices) ? data.choices : [];
  }

  function _key(npcId, node){ return `${npcId}::${node}`; }

  // ===== Background worker =====
  async function _pump(){
    if(_state.busy || !_state.ready || _state.queue.length===0) return;
    _setBusy(true);
    try{
      // FIFO
      const job = _state.queue.shift();
      const prompt = _buildPrompt(job.npcId, job.nodeId);
      if(!prompt){ _state.busy=false; _pump(); return; }

      const txt = await _state.session.prompt(prompt);
      const data = _extract(txt);
      if(data.lines.length || data.choices.length){
        const key=_key(job.npcId, job.nodeId);
        const prev = _state.cache.get(key) || {lines:[],choices:[]};
        const merged = {
          lines: _dedupe(prev.lines.concat(data.lines)),
          choices: _dedupeChoices(prev.choices.concat(data.choices))
        };
        _state.cache.set(key, merged);
        // allow re-enqueue later for fresh variants
        setTimeout(()=> _state.seenKeys.delete(key), 10000);
        if (typeof toast === 'function') toast(`New dialog for ${job.npcId}`);
      }
    } catch(err){
      console.warn('[Nano] generation error', err);
    } finally{
      _setBusy(false);
      // keep trickling jobs, but don’t starve main thread
      setTimeout(_pump, 50);
    }
  }

  // ===== Prompt construction =====
  function _buildPrompt(npcId, nodeId){
    if(typeof NPCS==='undefined' || typeof party==='undefined' || typeof player==='undefined' || typeof quests==='undefined') return null;
    const npc = NPCS.find(n=> n.id===npcId);
    if(!npc) return null;
    const desc = (typeof NPC_DESCS!=='undefined' && NPC_DESCS[npc.id]) || '';

    const leader = party[typeof selectedMember==='number' ? selectedMember : 0] || null;
    const inv = (player.inv || []).map(i=>i.name);
    const completed = Object.entries(quests)
      .filter(([,q])=>q.status==='completed')
      .map(([id,q])=> q.title || id);

    // Ask for short lines plus up to two choice hooks
    return `You write in-universe dialog for DUSTLAND – a rusted,
sun-blasted world of scrap tech and wry survivors. Tone: dry humor,
90s CRPG bite, hints of hope. Keep each line 4-14 words. No quotes
or stage directions.

NPC:
- id: ${npc.id}
- name: ${npc.name}
- title: ${npc.title}
- description: ${desc}

Player state:
- leader: ${leader ? `${leader.name} (${leader.role}) lvl ${leader.lvl}` : 'none'}
- leader stats: ${leader ? JSON.stringify(leader.stats) : '{}'}
- inventory: ${inv.join(', ') || 'empty'}
- completed quests: ${completed.join(', ') || 'none'}

Context:
- This is node: ${nodeId}
- If inventory or quests relate, reference them.
- Never repeat earlier lines verbatim; be fresh.

Output format strictly:
Lines:
Line1
Line2
Line3
Choices:
Label|STAT|DC|Reward
Label2|STAT|DC|Reward
`;
  }

  // ===== Parsing helpers =====
  function _extract(txt){
    if(!txt) return {lines:[],choices:[]};
    const parts = txt.split(/Choices:/i);
    const linePart = parts[0] || '';
    const choicePart = parts[1] || '';
    const lines = linePart.split(/\r?\n/)
      .map(s=>s.trim())
      .filter(Boolean)
      .filter(s=> s.length<=80)
      .slice(0,3);
    const choices = choicePart.split(/\r?\n/)
      .map(_parseChoice)
      .filter(Boolean)
      .slice(0,2);
    return {lines, choices};
  }

  function _parseChoice(s){
    const parts = s.split('|').map(p=>p.trim());
    if(parts.length < 4) return null;
    const dc = parseInt(parts[2],10);
    return {label:parts[0], stat:parts[1].toUpperCase(), dc:isNaN(dc)?0:dc, reward:parts[3]};
  }

  function _dedupe(arr){
    const seen=new Set(), out=[];
    for(const s of arr){
      const k=s.toLowerCase();
      if(!seen.has(k)){ seen.add(k); out.push(s); }
    }
    return out.slice(-12); // keep latest 12
  }

  function _dedupeChoices(arr){
    const seen=new Set(), out=[];
    for(const c of arr){
      const k=c.label.toLowerCase();
      if(!seen.has(k)){ seen.add(k); out.push(c); }
    }
    return out.slice(-4); // keep latest few
  }

})();

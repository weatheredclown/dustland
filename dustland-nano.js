// dustland-nano.js
// Gemini Nano background dialog generator for Dustland
// - Detects on-device LanguageModel Prompt API
// - Keeps a single session
// - Queues NPC dialog generations and caches lines per (npcId, "start"/node)
// - Never blocks gameplay; best-effort only

(function(){
  console.log("[Nano] Script loaded and initializing public API...");

  // Public API
  window.NanoDialog = {
    init,
    queueForNPC,
    linesFor,      // get cached lines; returns []
    choicesFor,    // get cached choices; returns []
    isReady: ()=> _state.ready,
    enabled: true, // flip to false to disable
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

  function refreshIndicator(){ 
    console.log("[Nano] Refreshing badge indicator...");
    _updateBadge(); 
  }

  function _ensureUI(){
    if(_ui.badge) return;
    console.log("[Nano] Ensuring UI elements exist...");
    const wrap=document.getElementById('nanoStatus');
    if(!wrap) {
      console.warn("[Nano] No #nanoStatus wrapper found; UI indicators disabled.");
      return;
    }
    _ui.progress=wrap.querySelector('#nanoProgress');
    _ui.badge=wrap.querySelector('#nanoBadge');
    console.log("[Nano] UI elements wired:", _ui);
  }

  function _updateBadge(){
    _ensureUI();
    if(!_ui.badge) return;
    console.log("[Nano] Updating badge display. Ready:", _state.ready, "Failed:", _state.failed, "Enabled:", window.NanoDialog.enabled);
    const on=_state.ready && window.NanoDialog.enabled;
    _ui.badge.textContent = on ? '✓' : (_state.failed ? '!' : '✗');
    _ui.badge.classList.toggle('on', on);
    _ui.badge.classList.toggle('off', !on && !_state.failed);
    _ui.badge.classList.toggle('failed', _state.failed);
  }

  function _showProgress(p){
    _ensureUI();
    if(!_ui.progress) return;
    console.log(`[Nano] Showing progress: ${p.toFixed(1)}%`);
    _ui.progress.style.display='block';
    _ui.progress.style.background=`conic-gradient(var(--accent) ${p}%,#273027 0)`;
  }

  function _hideProgress(){
    console.log("[Nano] Hiding progress indicator.");
    if(_ui.progress) _ui.progress.style.display='none';
  }

  function _setBusy(flag){
    console.log("[Nano] Set busy state:", flag);
    _state.busy=flag;
    if(_ui.badge) _ui.badge.classList.toggle('busy', flag);
  }

  // ===== Lifecycle =====
  async function init(){
    console.log("[Nano] init() called...");
    _ensureUI();
    _state.failed=false;
    _updateBadge();
    if(!_featureSupported()){
      console.warn("[Nano] Prompt API not supported in this browser.");
      _state.failed=true;
      _updateBadge();
      return;
    }
    try {
      console.log("[Nano] Checking LanguageModel.availability...");
      const avail = await LanguageModel.availability({ outputLanguage: "en" });
      console.log("[Nano] availability() returned:", avail);

      if (avail === "available") {
        console.log("[Nano] Creating session (model already available)...");
        _state.session = await LanguageModel.create({ outputLanguage: "en" });
        _state.ready = true; _state.failed=false; 
        console.log("[Nano] Model ready.");
        _updateBadge();

      } else if (avail === "downloadable" || avail === "downloading") {
        console.log("[Nano] Downloading on-device model…");
        _showProgress(0);
        _state.session = await LanguageModel.create({
          outputLanguage: "en",
          monitor(m){
            m.addEventListener("downloadprogress", (e)=>{
              const pct = e.total ? (e.loaded / e.total) * 100 : e.loaded * 100;
              console.log(`[Nano] Download progress: ${pct.toFixed(1)}%`);
              _showProgress(pct);
            });
          }
        });
        _hideProgress();
        _state.ready = true; _state.failed=false; 
        console.log("[Nano] Model ready after download.");
        _updateBadge();

      } else {
        console.warn("[Nano] Model not available on this device.");
        _state.failed=true;
        _updateBadge();
      }
    } catch (err){
      console.error("[Nano] Failed to init model:", err);
      _hideProgress();
      _state.failed=true;
      _updateBadge();
    }
    console.log("[Nano] Starting background worker pump...");
    _pump(); // start background worker
  }

  function _featureSupported(){ 
    const supported = !!window.LanguageModel; 
    console.log("[Nano] Feature supported:", supported);
    return supported; 
  }

  // ===== Public: schedule generation for an NPC/node pair =====
  function queueForNPC(npc, nodeId='start', reason='timer'){
    console.log(`[Nano] queueForNPC called: npcId=${npc?.id}, nodeId=${nodeId}, reason=${reason}`);
    if(!_state.ready || !window.NanoDialog.enabled) {
      console.warn("[Nano] Not ready or disabled; ignoring queue request.");
      return;
    }
    const key = _key(npc.id, nodeId);
    if(_state.seenKeys.has(key)) {
      console.log("[Nano] Already seen this key recently; skipping:", key);
      return;
    }
    _state.seenKeys.add(key);
    _state.queue.push({ npcId:npc.id, nodeId, reason, when: Date.now() });
    console.log("[Nano] Job queued. Queue length now:", _state.queue.length);
    _pump();
  }

  function linesFor(npcId, nodeId='start'){
    console.log(`[Nano] linesFor called: npcId=${npcId}, nodeId=${nodeId}`);
    const data = _state.cache.get(_key(npcId, nodeId));
    return data && Array.isArray(data.lines) ? data.lines : [];
  }

  function choicesFor(npcId, nodeId='start'){
    const data = _state.cache.get(_key(npcId, nodeId));
    return data && Array.isArray(data.choices) ? data.choices : [];
  }

  function _key(npcId, node){ 
    return `${npcId}::${node}`; 
  }

  // ===== Background worker =====
  async function _pump(){
    console.log("[Nano] _pump() called. Busy:", _state.busy, "Ready:", _state.ready, "Queue length:", _state.queue.length);
    if(_state.busy || !_state.ready || _state.queue.length===0) return;
    _setBusy(true);
    try{
      const job = _state.queue.shift();
      console.log("[Nano] Processing job:", job);
      const prompt = _buildPrompt(job.npcId, job.nodeId);
      if(!prompt){ 
        console.warn("[Nano] No prompt built; skipping job.");
        _state.busy=false; 
        _pump(); 
        return; 
      }

      console.log("[Nano] Sending prompt to model...");
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
      setTimeout(_pump, 50);
    }
  }

  // ===== Prompt construction =====
  function _buildPrompt(npcId, nodeId){
    console.log("[Nano] Building prompt for npcId:", npcId, "nodeId:", nodeId);
    if(typeof NPCS==='undefined' || typeof party==='undefined' || typeof player==='undefined' || typeof quests==='undefined') {
      console.warn("[Nano] Game state globals missing; cannot build prompt.");
      return null;
    }
    const npc = NPCS.find(n=> n.id===npcId);
    if(!npc) {
      console.warn("[Nano] NPC not found:", npcId);
      return null;
    }
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
    console.log("[Nano] Prompt built:", prompt);
    return prompt;
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
    console.log("[Nano] Deduping lines array...");
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

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
    isReady: ()=> _state.ready,
    enabled: true, // flip to false to disable
    refreshIndicator
  };

  const _state = {
    ready: false,
    session: null,
    queue: [],
    busy: false,
    cache: new Map(), // key: `${npcId}::${node}` -> string[]
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
    _ui.badge.textContent= on ? '✓':'✗';
    _ui.badge.classList.toggle('off', !on);
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
    if(!_featureSupported()){ log && log('[Nano] Prompt API not supported.'); return; }
    try {
      _ensureUI();
      _updateBadge();
      const avail = await LanguageModel.availability({ outputLanguage: "en" });
      if (avail === "available") {
        _state.session = await LanguageModel.create({ outputLanguage: "en" });
        _state.ready = true; log && log('[Nano] Model ready.');
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
        _state.ready = true; log && log('[Nano] Model ready.');
        _updateBadge();
      } else {
        log && log('[Nano] Model not available on this device.');
        _updateBadge();
      }
    } catch (err){
      console.error(err);
      log && log('[Nano] Failed to init model.');
      _hideProgress();
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
    const arr = _state.cache.get(_key(npcId, nodeId));
    return Array.isArray(arr) ? arr : [];
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
      const lines = _extractLines(txt);
      if(lines.length){
        const key=_key(job.npcId, job.nodeId);
        _state.cache.set(key, _dedupe((_state.cache.get(key)||[]).concat(lines)));
        // allow re-enqueue later for fresh variants
        setTimeout(()=> _state.seenKeys.delete(key), 10000);
        if (typeof toast === 'function') toast(`New lines for ${job.npcId}`);
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
    if(!window.NPCS || !window.party || !window.player || !window.quests) return null;
    const npc = NPCS.find(n=> n.id===npcId);
    if(!npc) return null;

    const leader = party[window.selectedMember] || party[0] || null;
    const inv = (player.inv || []).map(i=>i.name);
    const completed = Object.entries(quests)
      .filter(([,q])=>q.status==='completed')
      .map(([id,q])=> q.title || id);

    // Keep it compact; ask for 3 short lines in-character
    return `You are writing in-universe dialog lines for a post-apocalyptic, witty,
dusty wasteland RPG NPC. Keep each line to 4–14 words. No stage directions.
3 variants only. No quotes.

NPC:
- id: ${npc.id}
- name: ${npc.name}
- title: ${npc.title}

World vibe: dry humor, 90s CRPG snark, a little heart.

Player state:
- leader: ${leader ? `${leader.name} (${leader.role}) lvl ${leader.lvl}` : 'none'}
- leader stats: ${leader ? JSON.stringify(leader.stats) : '{}'}
- inventory: ${inv.join(', ') || 'empty'}
- completed: ${completed.join(', ') || 'none'}

Context:
- This is node: ${nodeId}
- If the inventory or completed quests relate, reference them slyly.
- Never repeat earlier lines verbatim; be fresh.

Output format:
Line1
Line2
Line3
`;
  }

  // ===== Parsing helpers =====
  function _extractLines(txt){
    if(!txt) return [];
    // split by newlines, trim, keep short non-empty lines
    return txt.split(/\r?\n/)
      .map(s=>s.trim())
      .filter(Boolean)
      .filter(s=> s.length<=80)
      .slice(0,3);
  }

  function _dedupe(arr){
    const seen=new Set(), out=[];
    for(const s of arr){
      const k=s.toLowerCase();
      if(!seen.has(k)){ seen.add(k); out.push(s); }
    }
    return out.slice(-12); // keep latest 12
  }

})();

// dustland-nano.js
// Gemini Nano background dialog generator for Dustland
// - Detects on-device LanguageModel Prompt API
// - Keeps a single session
// - Queues NPC dialog generations and caches lines per (npcId, "start"/node)
// - Never blocks gameplay; best-effort only
// - chrome://on-device-internals/ to resent your crash count if needed

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
    choicesEnabled: false,
    refreshIndicator
  };
  window.NanoPalette = {
    init,
    generate: generatePalette,
    isReady: ()=> _state.ready,
    enabled: true,
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
    _updateBadge(); 
  }

  function _ensureUI(){
    if(_ui.badge) return;
    const wrap=document.getElementById('nanoStatus');
    if(!wrap) {
      return;
    }
    _ui.progress=wrap.querySelector('#nanoProgress');
    _ui.badge=wrap.querySelector('#nanoBadge');
  }

  function _updateBadge(){
    _ensureUI();
    if(!_ui.badge) return;
    const on=_state.ready && (window.NanoDialog.enabled || window.NanoPalette.enabled);
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
      console.warn("[Nano] Prompt API not supported in this browser.");
      _state.failed=true;
      _updateBadge();
      return;
    }
    try {
      const avail = await LanguageModel.availability({ outputLanguage: "en" });
      console.log("[Nano] availability() returned:", avail);

      if (avail === "available") {
        console.log("[Nano] Creating session (model already available)...");
        _state.session = await LanguageModel.create({ outputLanguage: "en" });
        _state.ready = true; _state.failed=false; 
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
  // state
  _state.seenAt = new Map(); // key -> timestamp
  const SEEN_TTL_MS = 8000;  // allow re-gen after 8s

  function queueForNPC(npc, nodeId='start', reason='timer'){
    console.log(`[Nano] queueForNPC called: npcId=${npc?.id}, nodeId=${nodeId}, reason=${reason}`);
    if(!_state.ready || !window.NanoDialog.enabled) return;

    const key = _key(npc.id, nodeId);
    const now = Date.now();
    const last = _state.seenAt.get(key) || 0;
    const ttl = (reason === 'quest update') ? 0 : SEEN_TTL_MS;

    if (now - last < ttl) {
      console.log("[Nano] Throttled; seen recently:", key, `(+${now-last}ms)`);
      return;
    }
    _state.seenAt.set(key, now);
    _state.queue.push({ npcId:npc.id, nodeId, reason, when: now });
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

      const txt = await _state.session.prompt(prompt);
      console.log("[Nano] Prompt built:\n"+ prompt);
      console.log("[Nano] returned:\n"+ txt);
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

  function _visibleLabels(npc, nodeId, node) {
    node = node || resolveNode(npc.tree, nodeId);
    if (!node) return [];
    let labels = (node.choices || []).slice();
  
    // Apply the same visibility rules your UI uses for quest choices
    if (npc.quest) {
      const q = npc.quest;
      labels = labels.filter(c => {
        if (c.q === 'accept' && q.status !== 'available') return false;
        if (c.q === 'turnin' && (q.status !== 'active' || (q.item && !hasItem(q.item)))) return false;
        return true;
      });
    }
  
    return labels.map(c => (c.label || '').replace(/\|/g,'').trim()).filter(Boolean);
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
    const node = resolveNode(npc.tree, nodeId);
    if(!node){
      console.warn("[Nano] Node not found:", nodeId);
      return null;
    }
    const desc = npc.desc || '';

    const leader = party[typeof selectedMember==='number' ? selectedMember : 0] || null;
    const inv = (player.inv || []).map(i=>i.name);
    const completed = Object.entries(quests)
      .filter(([,q])=>q.status==='completed')
      .map(([id,q])=> q.title || id);

    const existing = _visibleLabels(npc, nodeId, node);
    const text = node.text;

    // Consider this in the prompt:
    //CURRENT UI CHOICES SHOWN TO PLAYER (do not duplicate these labels):
    //${existing.map(l => `- ${l}`).join('\n') || '- (none)'}

    // Ask for short lines plus up to two choice hooks
    var prompt = `You write in-universe dialog for DUSTLAND — a rusted, sun-blasted world.
Voice must match the NPC. Dry humor, 90s CRPG bite, hints of hope.
Each line: 4–14 word complete sentences, ≤80 chars. No quotes. No leading dashes/bullets.
Stay in-world. Avoid modern real-world references or idioms (e.g., saunas, airports, brand names, bar talk).
Do NOT include the NPC’s name in any line. No stage directions.

NPC:
- id: ${npc.id}
- name: ${npc.name}
- title: ${npc.title}
- description: ${desc || 'n/a'}
- text: ${text}

Player:
- party leader: ${leader ? leader.name : 'none'}
- leader stats: ${leader ? JSON.stringify(leader.stats) : '{}'}
- inventory: ${inv.join(', ') || 'empty'}
- completed quests: ${completed.join(', ') || 'none'}

Context:
- dialog node: ${nodeId}
- If inventory/quests are relevant, reference them naturally.
- Avoid generic greetings or “you’re new here” clichés.
- Do not repeat lines previously used for this NPC/node.

CHOICE SCHEMA:
- Skill check format: <label>|<STAT>|<DC>|<Reward>|<Success>|<Failure>
- Only create a skill check if the reward is XP or an item.
- STAT in {STR, AGI, INT, PER, LCK, CHA}; DC 6–12.
- Reward must be "XP N" or an item name; otherwise, omit the skill check.
- Simple dialog format (no roll): <label>|<Response>
- Success/failure/response lines follow the same style rules as dialog lines.
 - Output 0–2 choices total. If no useful option fits, leave the Choices section empty.
- Do not duplicate any label already visible to the player.

OUTPUT EXAMPLES (FOLLOW FORMAT EXACTLY; THESE ARE EXAMPLES, NOT TO BE REPEATED):
Lines:
Pump coughs at dusk but still runs.
Keep the gears oiled and it behaves.
If it wheezes, kick the intake gently.
Choices:
Check the intake|INT|9|XP 10|Mesh clears and hum steadies.|You drop a bolt, cursing softly.
Ask about spare parts|Any for trade?|She shakes her head and turns away.

Lines:
Tolls keep the road quiet and safe.
Pay the price or pay in blood.
Your choice decides your luck today.
Choices:
Intimidate her guard|STR|10|XP 12|Guard backs off, eyes wide.|He laughs and calls your bluff.
Ask for mercy|Can you cut the toll?|She snorts but lets you pass.

Lines:
Road’s quiet, but don’t trust quiet.
Keep your head low past the ruins.
Trade if you must; run if you can’t.

Choices:
Check the intake|INT|9|XP 10|You tweak the valves and it purrs.|Steam hisses and you flinch back.
Offer spare gasket|CHA|8|Valve|She smiles and pockets the part.|She waves you off, unimpressed.

EXACT OUTPUT FORMAT:
Lines:
<up to 3 short dialog lines, no name/quotes/bullets>
Choices:
<label>|<STAT>|<DC>|<Reward>|<Success>|<Failure>
<label>|<Response>
`;
    return prompt;
  }

  // ===== Parsing helpers =====
  function _cleanLine(s){
    // remove leading bullets/dashes/quotes; trim trailing quotes
    return s.replace(/^[\s"'`–—\-•·]+/, '').replace(/["'`]+$/, '').trim();
  }
  
  function _extract(txt){
    if(!txt) return {lines:[], choices:[]};
    const parts = txt.split(/Choices:/i);
    const linePart = parts[0] || '';
    const choicePart = parts[1] || '';
  
    const rawLines = linePart.split(/\r?\n/).map(s => s.trim());
    if(rawLines[0]?.toLowerCase() !== 'lines:') return {lines:[], choices:[]};
    rawLines.shift();
    const lines = rawLines
      .map(s => _cleanLine(s))
      .filter(Boolean)
      .filter(s => s.length <= 80)
      .slice(0, 3);
  
    const choices = choicePart.split(/\r?\n/)
      .map(_parseChoice)
      .filter(Boolean)
      .filter(c => !(c.check && (!c.reward || c.reward.toLowerCase() === 'none')))
      .slice(0, 2);
  
    console.log("Produced:", lines, choices);
    return { lines, choices };
  }

  function _parseChoice(s){
    const parts = s.split('|').map(p=>p.trim());
    if(parts.length === 2){
      return {label: parts[0], response: parts[1]};
    }
    if(parts.length >= 6){
      const dc = parseInt(parts[2],10);
      return {
        label: parts[0],
        check: { stat: parts[1].toUpperCase(), dc: isNaN(dc)?0:dc },
        reward: parts[3],
        success: parts[4],
        failure: parts[5]
      };
    }
    return null;
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

  async function generatePalette(examples){
    if(!_state.ready || !window.NanoPalette.enabled) return null;
    _setBusy(true);
    const prompt = _buildPalettePrompt(examples || _defaultExamples());
    try {
      console.log("[Nano] prompt palette:\n"+prompt);
      const txt = await _state.session.prompt(prompt);
      console.log("[Nano] returned:\n"+ txt);
      return _parseEmojiBlock(txt);
    } catch(err){
      console.error('[Nano] palette generation failed:', err);
      return null;
    } finally {
      _setBusy(false);
    }
  }

  function _defaultExamples(){
    if(globalThis.worldStampEmoji){
      return Object.values(globalThis.worldStampEmoji);
    }
    const palette = globalThis.tileEmoji ? Object.values(globalThis.tileEmoji) : [];
    return palette.map(e => Array(16).fill(e.repeat(16)));
  }

  function _buildPalettePrompt(examples){
    const ex = examples?.map(b=>b.join('\n')).join('\n\n')??
[
[
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣",
    "🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣🛣",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝",
    "🏝🏝🏝🏝🏝🏝🏝🛣🛣🏝🏝🏝🏝🏝🏝🏝"
].join("\n")
].join("\n\n");
    const legend = 'Emojis: 🏝 sand, 🪨 rock, 🌊 water, 🌿 brush, 🛣 road, 🏚 ruin, 🧱 wall, ⬜ floor, 🚪 door, 🏠 building. These are map tiles in a 2D game world.';
    return `${legend}\n\nExamples of 16x16 emoji blocks:\n${ex}\n\nNew 16x16 block:`;
  }

  function _parseEmojiBlock(txt){
    const lines = txt.trim().split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const block = lines.slice(0,16).map(line=> Array.from(line).slice(0,16).join(''));
    return block.length===16 ? block : null;
  }

})();

// dustland-nano.js
// Gemini Nano background dialog generator for Dustland
// - Detects on-device LanguageModel Prompt API
// - Keeps a single session
// - Queues NPC dialog generations and caches lines per (npcId, "start"/node)
// - Never blocks gameplay; best-effort only
// - chrome://on-device-internals/ to resent your crash count if needed

type LanguageModelAvailability = 'available' | 'unavailable' | 'downloadable' | 'downloading';

interface LanguageModelDownloadProgressEvent extends Event {
  loaded: number;
  total?: number;
}

interface LanguageModelMonitor {
  addEventListener: (
    type: 'downloadprogress',
    listener: (event: LanguageModelDownloadProgressEvent) => void
  ) => void;
}

interface LanguageModelRequestOptions {
  output: { language: string };
}

interface LanguageModelCreateOptions extends LanguageModelRequestOptions {
  monitor?: (monitor: LanguageModelMonitor) => void;
}

interface LanguageModelSession {
  prompt: (prompt: string) => Promise<string>;
}

interface LanguageModelGlobal {
  availability: (options: LanguageModelRequestOptions) => Promise<LanguageModelAvailability>;
  create: (options: LanguageModelCreateOptions) => Promise<LanguageModelSession>;
}

interface NanoResponseChoice {
  label: string;
  response: string;
}

interface NanoCheckChoice {
  label: string;
  check: { stat: string; dc: number };
  reward?: string;
  success?: string;
  failure?: string;
}

type NanoChoice = NanoResponseChoice | NanoCheckChoice;

interface NanoDialogQueueJob {
  npcId: string;
  nodeId: string;
  reason: string;
  when: number;
}

interface NanoDialogState {
  ready: boolean;
  session: LanguageModelSession | null;
  queue: NanoDialogQueueJob[];
  busy: boolean;
  failed: boolean;
  cache: Map<string, { lines: string[]; choices: NanoChoice[] }>;
  seenKeys: Set<string>;
  seenAt: Map<string, number>;
}

interface NanoDialogAPI {
  init: () => Promise<void>;
  queueForNPC: (npc: NanoNPCSummary | undefined, nodeId?: string, reason?: string) => void;
  linesFor: (npcId: string, nodeId?: string) => string[];
  choicesFor: (npcId: string, nodeId?: string) => NanoChoice[];
  isReady: () => boolean;
  enabled: boolean;
  choicesEnabled: boolean;
  refreshIndicator: () => void;
}

interface NanoPaletteAPI {
  init: () => Promise<void>;
  generate: (examples?: string[][]) => Promise<string[] | null>;
  isReady: () => boolean;
  enabled: boolean;
  refreshIndicator: () => void;
}

interface NanoDialogChoice {
  label?: string;
  q?: string;
  response?: string;
}

interface NanoDialogNode {
  text?: string;
  choices?: NanoDialogChoice[];
}

interface NanoNPCQuest {
  status?: string;
  item?: string;
  title?: string;
}

interface NanoNPCSummary {
  id: string;
  name?: string;
  title?: string;
  desc?: string;
  text?: string;
  tree: unknown;
  quest?: NanoNPCQuest;
}

interface NanoPartyMember {
  name?: string;
  stats?: Record<string, unknown>;
}

interface NanoInventoryItem {
  name?: string;
  type?: string;
  tags?: string[];
  count?: number;
}

interface NanoPlayerState {
  inv?: NanoInventoryItem[];
}

interface NanoUiState {
  wrap: HTMLElement | null;
  badge: HTMLElement | null;
  progress: HTMLElement | null;
}

interface TimeoutLike {
  unref?: () => void;
}

const { resolveNode } = globalThis as typeof globalThis & {
  resolveNode: (tree: unknown, nodeId: string) => NanoDialogNode | undefined;
};

interface NanoWindow extends Window {
  NanoDialog: NanoDialogAPI;
  NanoPalette: NanoPaletteAPI;
  LanguageModel?: LanguageModelGlobal;
}

type NanoGlobal = typeof globalThis & {
  NPCS?: NanoNPCSummary[];
  party?: NanoPartyMember[];
  player?: NanoPlayerState;
  quests?: Record<string, NanoNPCQuest & Record<string, unknown>>;
  selectedMember?: number;
  toast?: (message: string) => void;
  worldStampEmoji?: Record<string, string[]>;
  tileEmoji?: Record<string, string>;
};

(function(){
  const nanoWindow = window as unknown as NanoWindow;
  const nanoGlobal = globalThis as NanoGlobal;
  console.log("[Nano] Script loaded and initializing public API...");

  // Public API
  nanoWindow.NanoDialog = {
    init,
    queueForNPC,
    linesFor,      // get cached lines; returns []
    choicesFor,    // get cached choices; returns []
    isReady: ()=> _state.ready,
    enabled: true, // flip to false to disable
    choicesEnabled: false,
    refreshIndicator
  };
  nanoWindow.NanoPalette = {
    init,
    generate: generatePalette,
    isReady: ()=> _state.ready,
    enabled: true,
    refreshIndicator
  };

  const _state: NanoDialogState = {
    ready: false,
    session: null,
    queue: [],
    busy: false,
    failed: false,
    cache: new Map(), // key: `${npcId}::${node}` -> {lines:[],choices:[]}
    seenKeys: new Set(), // avoid re-enqueue storms
    seenAt: new Map()
  };

  const _ui: NanoUiState = { wrap:null, badge:null, progress:null };

  function refreshIndicator(){
    _updateBadge();
  }

  function _ensureUI(){
    if(_ui.badge) return;
    const wrap=document.getElementById('nanoStatus');
    if(!wrap) {
      return;
    }
    _ui.wrap=wrap;
    _ui.progress=wrap.querySelector<HTMLElement>('#nanoProgress');
    _ui.badge=wrap.querySelector<HTMLElement>('#nanoBadge');
  }

  function _updateBadge(){
    _ensureUI();
    if(!_ui.badge) return;
    if(_state.failed){
      if(_ui.wrap) _ui.wrap.style.display='none';
      return;
    }
    if(_ui.wrap) _ui.wrap.style.display='';
    const on=_state.ready && (nanoWindow.NanoDialog.enabled || nanoWindow.NanoPalette.enabled);
    _ui.badge.textContent = on ? '✓' : '✗';
    _ui.badge.classList.toggle('on', on);
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
  async function init(): Promise<void>{
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
      if (!nanoWindow.LanguageModel) {
        console.warn("[Nano] LanguageModel global missing.");
        _state.failed = true;
        _updateBadge();
        return;
      }
      const avail = await nanoWindow.LanguageModel.availability({ output: { language: "en" } });
      console.log("[Nano] availability() returned:", avail);

      if (avail === "available") {
        console.log("[Nano] Creating session (model already available)...");
        _state.session = await nanoWindow.LanguageModel.create({ output: { language: "en" } });
        _state.ready = true; _state.failed=false;
        _updateBadge();

      } else if (avail === "downloadable" || avail === "downloading") {
        console.log("[Nano] Downloading on-device model…");
        _showProgress(0);
        _state.session = await nanoWindow.LanguageModel.create({
          output: { language: "en" },
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
    const supported = !!nanoWindow.LanguageModel;
    console.log("[Nano] Feature supported:", supported);
    return supported;
  }

  // ===== Public: schedule generation for an NPC/node pair =====
  // state
  const SEEN_TTL_MS = 8000;  // allow re-gen after 8s

  function queueForNPC(npc: NanoNPCSummary | undefined, nodeId='start', reason='timer'){
    if(!_state.ready || !nanoWindow.NanoDialog.enabled || !npc || !npc.id) return;
    console.log(`[Nano] queueForNPC called: npcId=${npc?.id}, nodeId=${nodeId}, reason=${reason}`);

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

  function linesFor(npcId: string, nodeId='start'){
    console.log(`[Nano] linesFor called: npcId=${npcId}, nodeId=${nodeId}`);
    const data = _state.cache.get(_key(npcId, nodeId));
    return data && Array.isArray(data.lines) ? data.lines : [];
  }

  function choicesFor(npcId: string, nodeId='start'){
    const data = _state.cache.get(_key(npcId, nodeId));
    return data && Array.isArray(data.choices) ? data.choices : [];
  }

  function _key(npcId: string, node: string){
    return `${npcId}::${node}`;
  }

  // ===== Background worker =====
  async function _pump(): Promise<void>{
    if(_state.busy || !_state.ready || _state.queue.length===0) return;
    _setBusy(true);
    try{
      const job = _state.queue.shift();
      if(!job){
        return;
      }
      console.log("[Nano] Processing job:", job);
      const prompt = _buildPrompt(job.npcId, job.nodeId);
      if(!prompt){
        console.warn("[Nano] No prompt built; skipping job.");
        _state.busy=false;
        _pump();
        return;
      }

      if(!_state.session){
        console.warn("[Nano] Session not ready; skipping job.");
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
        const timeoutHandle = setTimeout(()=> _state.seenKeys.delete(key), 10000);
        unrefTimeout(timeoutHandle);
        if (typeof nanoGlobal.toast === 'function') nanoGlobal.toast(`New dialog for ${job.npcId}`);
      }
    } catch(err){
      console.warn('[Nano] generation error', err);
    } finally{
      _setBusy(false);
      const timeoutHandle = setTimeout(_pump, 50);
      unrefTimeout(timeoutHandle);
    }
  }

  function _visibleLabels(npc: NanoNPCSummary, nodeId: string, node?: NanoDialogNode | undefined) {
    node = node || resolveNode(npc.tree, nodeId);
    if (!node) return [];
    const choices = Array.isArray(node.choices) ? node.choices : [];
    let labels = choices.slice();

    // Apply the same visibility rules your UI uses for quest choices
    if (npc.quest) {
      const q = npc.quest;
      labels = labels.filter(c => {
        if (c.q === 'accept' && q.status !== 'available') return false;
        if (c.q === 'turnin' && (q.status !== 'active' || (q.item && !hasItem(q.item)))) return false;
        return true;
      });
    }
  
    return labels
      .map(c => (c.label || '').replace(/\|/g,'').trim())
      .filter((label): label is string => Boolean(label));
  }

  // ===== Prompt construction =====
  function _buildPrompt(npcId: string, nodeId: string){
    console.log("[Nano] Building prompt for npcId:", npcId, "nodeId:", nodeId);
    if(!nanoGlobal.NPCS || !nanoGlobal.party || !nanoGlobal.player || !nanoGlobal.quests) {
      console.warn("[Nano] Game state globals missing; cannot build prompt.");
      return null;
    }
    const npc = (nanoGlobal.NPCS ?? []).find(n=> n.id===npcId);
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

    const leaderIndex = typeof nanoGlobal.selectedMember==='number' ? nanoGlobal.selectedMember : 0;
    const partyList = nanoGlobal.party ?? [];
    const leader = partyList[leaderIndex] || null;
    const inv = (nanoGlobal.player?.inv || []).map(i=>i.name ?? '').filter(Boolean);
    const completed = Object.entries(nanoGlobal.quests)
      .filter(([,q])=>q?.status==='completed')
      .map(([id,q])=> (q?.title && q.title.trim()) || id);

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
  function _cleanLine(s: string){
    // remove leading bullets/dashes/quotes; trim trailing quotes
    return s.replace(/^[\s"'`–—\-•·]+/, '').replace(/["'`]+$/, '').trim();
  }

  function _extract(txt: string | undefined | null){
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
      .filter((choice): choice is NanoChoice => Boolean(choice))
      .filter(c => !('check' in c) || (c.reward && c.reward.toLowerCase() !== 'none'))
      .slice(0, 2);

    console.log("Produced:", lines, choices);
    return { lines, choices };
  }

  function _parseChoice(s: string): NanoChoice | null{
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

  function _dedupe(arr: string[]){
    const seen=new Set<string>(), out: string[]=[];
    for(const s of arr){
      const k=s.toLowerCase();
      if(!seen.has(k)){ seen.add(k); out.push(s); }
    }
    return out.slice(-12); // keep latest 12
  }

  function _dedupeChoices(arr: NanoChoice[]){
    const seen=new Set<string>(), out: NanoChoice[]=[];
    for(const c of arr){
      const key = c.label.toLowerCase();
      if(!seen.has(key)){ seen.add(key); out.push(c); }
    }
    return out.slice(-4); // keep latest few
  }

  async function generatePalette(examples?: string[][]){
    if(!_state.ready || !nanoWindow.NanoPalette.enabled) return null;
    _setBusy(true);
    const prompt = _buildPalettePrompt(examples || _defaultExamples());
    try {
      console.log("[Nano] prompt palette:\n"+prompt);
      if(!_state.session){
        console.warn('[Nano] Session not ready for palette generation.');
        return null;
      }
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
    if(nanoGlobal.worldStampEmoji){
      return Object.values(nanoGlobal.worldStampEmoji);
    }
    const palette = nanoGlobal.tileEmoji ? Object.values(nanoGlobal.tileEmoji) : [];
    return palette.map(e => Array(16).fill((e ?? '').repeat(16)));
  }

  function _buildPalettePrompt(examples?: string[][]){
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

  function _parseEmojiBlock(txt: string | null){
    if(!txt) return null;
    const lines = txt.trim().split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    const block = lines.slice(0,16).map(line=> Array.from(line).slice(0,16).join(''));
    return block.length===16 ? block : null;
  }

  function unrefTimeout(handle: unknown): void {
    if (typeof handle === 'object' && handle !== null && 'unref' in handle) {
      const maybeTimeout = handle as TimeoutLike;
      if (typeof maybeTimeout.unref === 'function') {
        maybeTimeout.unref();
      }
    }
  }

})();

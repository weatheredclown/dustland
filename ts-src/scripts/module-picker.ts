// Splash screen allowing the player to pick a module.
// Displays a pulsing title and swirling dust background with drifting particles.
(() => {
type ModuleSource = 'local' | 'cloud';

interface PickerModuleInfo {
  id: string;
  name: string;
  file?: string;
  summary?: string;
  updatedAt?: number;
  ownerId?: string;
  publishedVersionId?: string | null;
  source: ModuleSource;
}

interface CloudModuleSummary {
  id: string;
  title?: string;
  summary?: string;
  visibility?: string;
  ownerId?: string;
  updatedAt?: number;
  publishedVersionId?: string | null;
  [key: string]: unknown;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  speed: number;
}

interface DustAttractor {
  angle: number;
  x: number;
  y: number;
}

interface ModulePickerEventPayload {
  moduleId: string;
  moduleName: string;
  moduleFile?: string;
  moduleSource?: ModuleSource;
  moduleVersionId?: string | null;
  __fromNet?: boolean;
  [key: string]: unknown;
}

type PickerEventHandler = (payload: unknown) => void;

interface ModulePickerEventBus {
  emit?: (event: string, payload: unknown) => void;
  on?: (event: string, handler: PickerEventHandler) => void;
}

interface PickerMultiplayerBridge {
  publish?: (event: string, payload: ModulePickerEventPayload) => void;
  subscribe?: (event: string, handler: PickerEventHandler) => void;
}

interface PickerDustlandNamespace {
  multiplayer?: {
    disconnect?: (role: string) => void;
  };
  multiplayerBridge?: PickerMultiplayerBridge;
}

type PickerUiApi = {
  hide?: (id: string) => void;
  show?: (id: string) => void;
  remove?: (id: string) => void;
};

type DustlandWindow = Window & {
  EventBus?: ModulePickerEventBus;
  Dustland?: PickerDustlandNamespace;
  openCreator?: () => void;
  showStart?: () => void;
  resetAll?: () => void;
  seedWorldContent?: () => void;
  startGame?: () => void;
  modulePickerPending?: boolean;
  modulePickerLoaded?: boolean;
  UI?: PickerUiApi;
  warnOnUnload?: () => void;
};

const dustlandWindow = window as DustlandWindow;
const UI = dustlandWindow.UI;
const warnOnUnload = dustlandWindow.warnOnUnload;

if (dustlandWindow.modulePickerLoaded) {
  console.warn('Module picker already initialized; skipping duplicate load.');
  return;
}
dustlandWindow.modulePickerLoaded = true;

const LOCAL_MODULES: PickerModuleInfo[] = [
  { id: 'dustland', name: 'Dustland', file: 'modules/dustland.module.js', source: 'local' },
  { id: 'office', name: 'Office', file: 'modules/office.module.js', source: 'local' },
  { id: 'lootbox-demo', name: 'Loot Box Demo', file: 'modules/lootbox-demo.module.js', source: 'local' },
  { id: 'pit', name: 'PIT.BAS', file: 'modules/pit-bas.module.js', source: 'local' },
  { id: 'other', name: 'OTHER.BAS', file: 'modules/other-bas.module.js', source: 'local' },
  { id: 'two-worlds', name: 'Two Worlds', file: 'modules/two-worlds.module.js', source: 'local' },
  { id: 'true-dust', name: 'True Dust', file: 'modules/true-dust.module.js', source: 'local' },
  { id: 'golden', name: 'Golden Sample', file: 'modules/golden.module.json', source: 'local' },
  { id: 'edge', name: 'bunker-trainer-workshop', file: 'modules/edge.module.js', source: 'local' },
  { id: 'cli-demo', name: 'CLI Demo Adventure', file: 'modules/cli-demo.module.js', source: 'local' },
];

(globalThis as typeof globalThis & { MODULES?: PickerModuleInfo[] }).MODULES = LOCAL_MODULES;

type PickerTab = 'local' | 'mine' | 'shared' | 'public';

const NET_FLAG = '__fromNet';
const pickerBus = dustlandWindow.EventBus;
const mpBridge = dustlandWindow.Dustland?.multiplayerBridge;
const moduleLists: Record<PickerTab, PickerModuleInfo[]> = {
  local: [...LOCAL_MODULES],
  mine: [],
  shared: [],
  public: [],
};
const selectedByTab: Record<PickerTab, number> = {
  local: 0,
  mine: -1,
  shared: -1,
  public: -1,
};
let activeTab: PickerTab = 'local';
let buttons: HTMLButtonElement[] = [];
let buttonContainer: HTMLElement | null = null;
let statusLine: HTMLElement | null = null;
let sessionRole: string | null = null;
const tabButtons: Partial<Record<PickerTab, HTMLButtonElement>> = {};
try {
  sessionRole = window.sessionStorage?.getItem?.('dustland.multiplayerRole') ?? null;
} catch (err) {
  sessionRole = null;
}
const isClient = sessionRole === 'client';
if (isClient) {
  selectedByTab.local = -1;
}

let latestSessionSnapshot: { status: string; user: { uid?: string | null } | null; bootstrap: { status: string } } | null = null;
let cloudRepo: CloudRepo | null = null;
let cloudRepoPromise: Promise<CloudRepo | null> | null = null;
let cloudRepoUserId: string | null = null;
let rerenderActiveList: (() => void) | null = null;
let dynamicImportsBroken = false;

type CloudRepo = {
  init: (session: { status: string; user: { uid?: string } | null; error: Error | null; bootstrap: unknown }) => Promise<void> | void;
  listMine: () => Promise<CloudModuleSummary[]>;
  listShared: () => Promise<CloudModuleSummary[]>;
  listPublic: () => Promise<CloudModuleSummary[]>;
  loadVersion: (moduleId: string) => Promise<{ moduleId: string; versionId: string; payload: unknown } | null>;
};

function isModulePickerPayload(payload: unknown): payload is ModulePickerEventPayload {
  if (!payload || typeof payload !== 'object') return false;
  const record = payload as Record<string, unknown>;
  return typeof record.moduleId === 'string' || typeof record.moduleFile === 'string';
}

async function ensureCloudRepo(): Promise<CloudRepo | null> {
  const snapshot = await ensureSessionSnapshot();
  if (!snapshot || snapshot.bootstrap.status !== 'firebase-ready') {
    return null;
  }
  const userId = snapshot.user?.uid ?? null;
  if (cloudRepo && cloudRepoUserId === userId) {
    return cloudRepo;
  }
  if (cloudRepoPromise) {
    return cloudRepoPromise;
  }
  cloudRepoPromise = (async () => {
    try {
      const { FirestoreModuleRepository } = await import('./ack/module-repository.js');
      const repo: CloudRepo = new FirestoreModuleRepository();
      await repo.init(snapshot as unknown as { status: string; user: { uid?: string } | null; error: Error | null; bootstrap: unknown });
      cloudRepo = repo;
      cloudRepoUserId = userId;
      return repo;
    } catch (err) {
      console.warn('Cloud module repository unavailable', err);
      return null;
    } finally {
      if (!cloudRepo) {
        cloudRepoPromise = null;
      }
    }
  })();
  const repo = await cloudRepoPromise;
  if (!repo) {
    cloudRepoPromise = null;
  }
  return repo;
}

function mapSummaryToModule(summary: CloudModuleSummary): PickerModuleInfo {
  return {
    id: summary.id,
    name: (summary.title as string) || 'Untitled Map',
    summary: (summary.summary as string) ?? '',
    updatedAt: typeof summary.updatedAt === 'number' ? summary.updatedAt : undefined,
    ownerId: (summary.ownerId as string) ?? undefined,
    publishedVersionId: (summary.publishedVersionId as string | null | undefined) ?? null,
    source: 'cloud',
  };
}

function formatUpdatedAt(timestamp?: number): string {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (err) {
    return '';
  }
}

async function ensureSessionSnapshot(): Promise<{ status: string; user: { uid?: string | null } | null; bootstrap: { status: string } } | null> {
  if (dynamicImportsBroken) {
    return null;
  }
  if (latestSessionSnapshot) {
    return latestSessionSnapshot;
  }
  try {
    const { detectServerMode } = await import('./ack/server-mode.js');
    const bootstrap = detectServerMode();
    if (bootstrap.status !== 'firebase-ready') {
      return null;
    }
    latestSessionSnapshot = { status: 'idle', user: null, error: null, bootstrap } as unknown as {
      status: string;
      user: { uid?: string | null } | null;
      bootstrap: { status: string };
    };
    return latestSessionSnapshot;
  } catch (err) {
    if ((err as { code?: string })?.code === 'ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING') {
      dynamicImportsBroken = true;
      return null;
    }
    console.warn('Server mode detection failed', err);
    return null;
  }
}

function resetCloudRepo(): void {
  cloudRepo = null;
  cloudRepoPromise = null;
  cloudRepoUserId = null;
}

function hideCloudTabs(): void {
  moduleLists.mine = [];
  moduleLists.shared = [];
  moduleLists.public = [];
  selectedByTab.mine = -1;
  selectedByTab.shared = -1;
  selectedByTab.public = -1;
  Object.entries(tabButtons).forEach(([tab, btn]) => {
    if (tab !== 'local' && btn) {
      btn.style.display = 'none';
      btn.classList.remove('active');
    } else if (tab === 'local' && btn) {
      btn.classList.add('active');
    }
  });
  if (activeTab !== 'local') {
    activeTab = 'local';
    seedSelection('local');
  }
  rerenderActiveList?.();
}

function showCloudTabs(): void {
  Object.entries(tabButtons).forEach(([tab, btn]) => {
    if (tab !== 'local' && btn) {
      btn.style.display = '';
    }
  });
}

type CloudUiState = {
  message: string;
  buttonLabel: string;
  buttonDisabled: boolean;
  buttonTooltip: string;
};

function describeCloudSessionSnapshot(snapshot: { status: string; error?: Error | null }): CloudUiState {
  switch (snapshot.status) {
    case 'idle':
      return {
        message: 'Sign in to browse cloud modules.',
        buttonLabel: '☁ Sign in',
        buttonDisabled: false,
        buttonTooltip: 'Use Google login to unlock Mine/Shared/Public tabs.',
      };
    case 'initializing':
      return {
        message: 'Connecting to Dustland cloud…',
        buttonLabel: '☁ Connecting…',
        buttonDisabled: true,
        buttonTooltip: 'Bootstrapping Firebase client.',
      };
    case 'authenticating':
      return {
        message: 'Signing you in…',
        buttonLabel: '☁ Signing in…',
        buttonDisabled: true,
        buttonTooltip: 'Completing authentication.',
      };
    case 'authenticated':
      return {
        message: 'Cloud tabs unlocked.',
        buttonLabel: '☁ Sign out',
        buttonDisabled: false,
        buttonTooltip: 'Sign out of Dustland cloud.',
      };
    case 'error':
      return {
        message: `Cloud error: ${snapshot.error?.message ?? 'Unknown issue'}`,
        buttonLabel: '☁ Retry',
        buttonDisabled: false,
        buttonTooltip: 'Try signing in again.',
      };
    case 'disabled':
    default:
      return {
        message: 'Cloud unavailable.',
        buttonLabel: '☁ Cloud',
        buttonDisabled: true,
        buttonTooltip: 'Server mode disabled.',
      };
  }
}

async function initCloudLoginControls(row: HTMLElement | null, statusEl: HTMLElement | null, button: HTMLButtonElement | null): Promise<void> {
  if (!row || !statusEl || !button) return;
  row.hidden = true;
  button.disabled = true;
  button.title = '';
  let sessionInstance: { signIn?: () => Promise<void>; signOut?: () => Promise<void>; subscribe?: (fn: (snapshot: unknown) => void) => void; getSnapshot?: () => unknown } | null = null;
  button.onclick = () => {
    if (button.disabled || !sessionInstance) return;
    const snapshot = latestSessionSnapshot;
    if (!snapshot) return;
    if (snapshot.status === 'authenticated') {
      void sessionInstance.signOut?.();
    } else {
      void sessionInstance.signIn?.();
    }
  };
  const baseSnapshot = await ensureSessionSnapshot();
  if (!baseSnapshot || baseSnapshot.bootstrap.status !== 'firebase-ready') {
    return;
  }
  applySessionSnapshotToUi(baseSnapshot, row, statusEl, button);
  try {
    const { ServerSession } = await import('./ack/server-session.js');
    sessionInstance = ServerSession.get();
    const apply = (snapshot: unknown) => {
      applySessionSnapshotToUi(snapshot as { status: string; user: { uid?: string | null } | null; bootstrap: { status: string } }, row, statusEl, button);
    };
    const current = sessionInstance.getSnapshot?.();
    if (current) apply(current);
    sessionInstance.subscribe?.(apply);
  } catch (err) {
    console.warn('Server session unavailable for module picker', err);
    statusEl.textContent = 'Cloud login unavailable.';
    button.disabled = true;
  }
}

function applySessionSnapshotToUi(
  snapshot: { status: string; user: { uid?: string | null } | null; bootstrap: { status: string } },
  row: HTMLElement,
  statusEl: HTMLElement,
  button: HTMLButtonElement,
): void {
  latestSessionSnapshot = snapshot;
  if (snapshot.bootstrap.status !== 'firebase-ready') {
    row.hidden = true;
    hideCloudTabs();
    return;
  }
  row.hidden = false;
  const uiState = describeCloudSessionSnapshot(snapshot);
  statusEl.textContent = uiState.message;
  button.textContent = uiState.buttonLabel;
  button.disabled = uiState.buttonDisabled;
  button.title = uiState.buttonTooltip;
  const nextUserId = snapshot.user?.uid ?? null;
  if (cloudRepoUserId !== nextUserId) {
    resetCloudRepo();
  }
  if (snapshot.status === 'authenticated') {
    void hydrateCloudLibrary();
  } else {
    hideCloudTabs();
    if (snapshot.status === 'idle') {
      setStatus('Sign in to access cloud modules.');
    } else if (snapshot.status === 'error') {
      setStatus('Cloud sign-in failed. Try again.');
    }
  }
}

function setStatus(message: string): void {
  if (statusLine) {
    statusLine.textContent = message;
  }
}

function disconnectClient(): void {
  try {
    dustlandWindow.Dustland?.multiplayer?.disconnect?.('client');
  } catch (err) {
    /* ignore */
  }
  try {
    window.sessionStorage?.removeItem?.('dustland.multiplayerRole');
  } catch (err) {
    /* ignore */
  }
  try {
    window.location.href = 'dustland.html';
  } catch (err) {
    /* ignore */
  }
}

const realOpenCreator = dustlandWindow.openCreator;
const realShowStart = dustlandWindow.showStart;
const realResetAll = dustlandWindow.resetAll;
dustlandWindow.openCreator = () => {};
dustlandWindow.showStart = () => {};
dustlandWindow.resetAll = () => {};
const loadBtn = document.getElementById('loadBtn');
if (loadBtn) UI?.hide?.('loadBtn');

function startDust(canvas: HTMLCanvasElement, getScale: () => number = () => 1) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Dust background requires a 2D canvas context');
  }
  const particles: DustParticle[] = [];
  const attractors: DustAttractor[] = [
    { angle: 0, x: 0, y: 0 },
    { angle: Math.PI, x: 0, y: 0 }
  ];
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  // Reset a particle with a new lifetime and entry point at the screen edge.
  function spawn(p: DustParticle) {
    p.life = Math.random() * 100 + 200;
    p.size = Math.random() * 2 + 1;
    p.speed = Math.random() * 0.5 + 0.2;
    const side = Math.floor(Math.random() * 4);
    if (side === 0) {
      p.x = 0;
      p.y = Math.random() * canvas.height;
      p.vx = Math.random() * 1 + 0.5;
      p.vy = (Math.random() * 2 - 1) * 0.5;
    } else if (side === 1) {
      p.x = canvas.width;
      p.y = Math.random() * canvas.height;
      p.vx = -(Math.random() * 1 + 0.5);
      p.vy = (Math.random() * 2 - 1) * 0.5;
    } else if (side === 2) {
      p.x = Math.random() * canvas.width;
      p.y = 0;
      p.vx = (Math.random() * 2 - 1) * 0.5;
      p.vy = Math.random() * 1 + 0.5;
    } else {
      p.x = Math.random() * canvas.width;
      p.y = canvas.height;
      p.vx = (Math.random() * 2 - 1) * 0.5;
      p.vy = -(Math.random() * 1 + 0.5);
    }
  }
  for (let i = 0; i < 60; i++) {
    const p: DustParticle = { x: 0, y: 0, vx: 0, vy: 0, life: 0, size: 0, speed: 0 };
    spawn(p);
    particles.push(p);
  }
  function update() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;
    attractors.forEach((a, i) => {
      a.angle += 0.01 + i * 0.005;
      a.x = cx + Math.cos(a.angle) * radius;
      a.y = cy + Math.sin(a.angle) * radius;
    });
    const scale = getScale();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,.4)';
    particles.forEach(p => {
      p.life--;
      if (
        p.life <= 0 ||
        p.x < -p.size * scale ||
        p.x > canvas.width + p.size * scale ||
        p.y < -p.size * scale ||
        p.y > canvas.height + p.size * scale
      ) {
        spawn(p);
        ctx.fillRect(p.x, p.y, p.size * scale, p.size * scale);
        return;
      }
      attractors.forEach(a => {
        const dx = a.x - p.x;
        const dy = a.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const force = 0.05;
        p.vx += (dx / dist) * force + (-dy / dist) * force * 0.5;
        p.vy += (dy / dist) * force + (dx / dist) * force * 0.5;
      });
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx - p.speed;
      p.y += p.vy;
      ctx.fillRect(p.x, p.y, p.size * scale, p.size * scale);
    });
    requestAnimationFrame(update);
  }
  update();
  return { particles, update };
}

(globalThis as typeof globalThis & { startDust?: typeof startDust }).startDust = startDust;

function broadcastModuleSelection(moduleInfo: PickerModuleInfo) {
  if (!moduleInfo || !pickerBus?.emit) return;
  const payload: ModulePickerEventPayload = {
    moduleId: moduleInfo.id,
    moduleName: moduleInfo.name,
    moduleFile: moduleInfo.file,
    moduleSource: moduleInfo.source,
    moduleVersionId: moduleInfo.publishedVersionId ?? null,
  };
  try {
    pickerBus.emit('module-picker:select', payload);
  } catch (err) {
    /* ignore */
  }
  try {
    mpBridge?.publish?.('module-picker:select', payload);
  } catch (err) {
    /* ignore */
  }
}

function loadModule(moduleInfo: PickerModuleInfo) {
  if (!moduleInfo.file) {
    alert('Module file missing.');
    return;
  }
  const existingScript = document.getElementById('activeModuleScript');
  existingScript?.remove();
  dustlandWindow.seedWorldContent = () => {};
  dustlandWindow.startGame = () => {};
  if (moduleInfo.file.endsWith('.json')) {
    window.location.href = `dustland.html?ack-player=1&module=${encodeURIComponent(moduleInfo.file)}`;
    return;
  }
  const script = document.createElement('script');
  script.id = 'activeModuleScript';
  script.src = `${moduleInfo.file}?_=${Date.now()}`;
  script.onload = () => {
    UI?.remove?.('modulePicker');
    dustlandWindow.openCreator = realOpenCreator;
    dustlandWindow.showStart = realShowStart;
    dustlandWindow.resetAll = () => {
      // Prevent stale modules from launching before the new one loads
      dustlandWindow.openCreator = () => {};
      realResetAll?.();
      loadModule(moduleInfo);
    };
    if (loadBtn) UI?.show?.('loadBtn');
    dustlandWindow.modulePickerPending = false;
    if (typeof warnOnUnload === 'function') warnOnUnload();
    dustlandWindow.openCreator?.();
  };
  document.body.appendChild(script);
}

(globalThis as typeof globalThis & { loadModule?: typeof loadModule }).loadModule = loadModule;

async function loadCloudModule(moduleInfo: PickerModuleInfo) {
  const repo = await ensureCloudRepo();
  if (!repo) {
    alert('Cloud modules are unavailable right now.');
    return;
  }
  try {
    setStatus('Loading module from cloud…');
    const version = await repo.loadVersion(moduleInfo.id);
    if (!version || typeof version.payload === 'undefined') {
      throw new Error('No module data found.');
    }
    let payloadToStore = version.payload as unknown;
    if (payloadToStore && typeof payloadToStore === 'object') {
      payloadToStore = { ...(payloadToStore as Record<string, unknown>) };
      const record = payloadToStore as Record<string, unknown>;
      if (!record.name) record.name = moduleInfo.name;
      if (!record.summary && moduleInfo.summary) record.summary = moduleInfo.summary;
    }
    try {
      window.localStorage?.setItem?.('ack_playtest', JSON.stringify(payloadToStore));
    } catch (err) {
      console.warn('Failed to cache cloud module', err);
    }
    window.location.href = 'dustland.html?ack-player=1';
  } catch (err) {
    alert('Unable to load cloud module: ' + (err as Error).message);
  } finally {
    setStatus('');
  }
}

function findModuleFromPayload(payload: ModulePickerEventPayload): PickerModuleInfo | null {
  const all: PickerModuleInfo[] = [
    ...moduleLists.local,
    ...moduleLists.mine,
    ...moduleLists.shared,
    ...moduleLists.public,
  ];
  const found = all.find(m => m.id === payload.moduleId) ||
    all.find(m => m.file && m.file === payload.moduleFile);
  if (found) return found;
  if (payload.moduleSource === 'cloud') {
    return {
      id: payload.moduleId,
      name: payload.moduleName,
      source: 'cloud',
      publishedVersionId: payload.moduleVersionId ?? null,
    };
  }
  if (payload.moduleFile) {
    return { id: payload.moduleId, name: payload.moduleName, file: payload.moduleFile, source: 'local' };
  }
  return null;
}

function findTabForModule(moduleInfo: PickerModuleInfo): PickerTab {
  if (moduleLists.local.includes(moduleInfo)) return 'local';
  if (moduleLists.mine.includes(moduleInfo)) return 'mine';
  if (moduleLists.shared.includes(moduleInfo)) return 'shared';
  if (moduleLists.public.includes(moduleInfo)) return 'public';
  return activeTab;
}

function seedSelection(tab: PickerTab): void {
  if (selectedByTab[tab] < 0 && moduleLists[tab].length && !isClient) {
    selectedByTab[tab] = 0;
  }
}

async function hydrateCloudLibrary(): Promise<void> {
  const snapshot = await ensureSessionSnapshot();
  if (!snapshot || snapshot.bootstrap.status !== 'firebase-ready') {
    setStatus('Cloud features unavailable. Showing local modules.');
    hideCloudTabs();
    return;
  }
  setStatus('Loading Mine/Shared/Public…');
  const repo = await ensureCloudRepo();
  if (!repo) {
    setStatus('Cloud features unavailable. Showing local modules.');
    hideCloudTabs();
    return;
  }
  try {
    showCloudTabs();
    const [mine, shared, pub] = await Promise.all([
      repo.listMine(),
      repo.listShared(),
      repo.listPublic(),
    ]);
    moduleLists.mine = mine.map(mapSummaryToModule);
    moduleLists.shared = shared.map(mapSummaryToModule);
    moduleLists.public = pub.map(mapSummaryToModule);
    seedSelection('mine');
    seedSelection('shared');
    seedSelection('public');
    setStatus(moduleLists.mine.length || moduleLists.shared.length || moduleLists.public.length
      ? ''
      : 'No cloud modules found. Try Local or publish a map from ACK.');
    if (activeTab !== 'local') {
      rerenderActiveList?.();
    }
  } catch (err) {
    console.warn('Unable to load cloud module lists', err);
    setStatus('Cloud module list unavailable. Local modules remain usable.');
    hideCloudTabs();
  }
}

function showModulePicker() {
  const overlay = document.createElement('div');
  overlay.id = 'modulePicker';
  overlay.style.cssText = 'position:fixed;inset:0;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;z-index:40';
  const styleTag = document.createElement('style');
  styleTag.textContent = '@keyframes pulse{0%,100%{opacity:.8}50%{opacity:1}}.btn.selected{border-color:#4f6b4f;background:#151b15}.tab-row{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}.tab-row button{font-family:var(--ui-font);background:#0f110f;border:1px solid #2a382a;color:#9fbf9f;padding:6px 10px;border-radius:8px;cursor:pointer}.tab-row button.active{color:#0f0;border-color:#3c533c;background:#101610}.module-meta{font-size:.75rem;color:#7a907a}.module-summary{color:#9fbf9f;font-size:.85rem;margin-top:2px}';
  document.head.appendChild(styleTag);

  const ackBtn = document.createElement('div');
  ackBtn.id = 'ackGlyph';
  ackBtn.textContent = '✎';
  ackBtn.title = 'Adventure Kit';
  ackBtn.style.cssText = 'position:absolute;top:10px;right:10px;z-index:1;color:#0f0;font-size:1.5rem;cursor:pointer';
  ackBtn.onclick = () => { window.location.href = 'adventure-kit.html'; };
  overlay.appendChild(ackBtn);

  const mpBtn = document.createElement('div');
  mpBtn.id = 'mpGlyph';
  mpBtn.textContent = '⇆';
  mpBtn.title = 'Multiplayer';
  mpBtn.style.cssText = 'position:absolute;top:44px;right:10px;z-index:1;color:#0f0;font-size:1.5rem;cursor:pointer';
  mpBtn.onclick = () => { window.location.href = 'multiplayer.html'; };
  overlay.appendChild(mpBtn);

  const canvas = document.createElement('canvas');
  canvas.id = 'dustParticles';
  // Background dust layer; z-index keeps UI elements in front.
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0';
  overlay.appendChild(canvas);

  const title = document.createElement('div');
  title.id = 'gameTitle';
  title.textContent = 'Dustland CRT';
  title.style.cssText = 'position:relative;z-index:1;color:#0f0;text-shadow:0 0 10px #0f0;font-size:2rem;margin-bottom:20px;animation:pulse 2s infinite';

  const win = document.createElement('div');
  win.className = 'win';
  win.style.cssText = 'position:relative;z-index:1;width:min(460px,92vw);background:#0b0d0b;border:1px solid #2a382a;border-radius:12px;box-shadow:0 20px 80px rgba(0,0,0,.7);overflow:hidden';
  win.innerHTML = '<header style="padding:10px 12px;border-bottom:1px solid #223022;font-weight:700">Select Module</header>' +
    '<main style="padding:12px" id="moduleButtons">' +
    '<div id="cloudStatusRow" style="display:flex;align-items:center;gap:8px;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px;">' +
    '<div id="cloudStatusLine" class="module-meta">Cloud saves unavailable.</div>' +
    '<button id="cloudLoginButton" class="btn" style="padding:4px 10px;font-size:.85rem;">☁ Sign in</button>' +
    '</div>' +
    '<div class="tab-row" id="moduleTabs"></div><div id="moduleList"></div><div id="moduleStatus" class="module-meta" style="margin-top:6px;"></div></main>';

  const uiBox = document.createElement('div');
  uiBox.style.cssText = 'position:absolute;top:50%;left:50%;display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-50%) scale(1);';
  uiBox.appendChild(title);
  uiBox.appendChild(win);
  overlay.appendChild(uiBox);
  document.body.appendChild(overlay);

  let uiScale = 1;
  function applyScale() {
    const small = Math.min(window.innerWidth, window.innerHeight);
    uiScale = Math.max(1, small / 600);
    uiBox.style.transform = `translate(-50%,-50%) scale(${uiScale})`;
    title.style.marginBottom = `${20 * uiScale}px`;
  }
  applyScale();
  window.addEventListener('resize', applyScale);
  startDust(canvas, () => uiScale);

  buttonContainer = overlay.querySelector<HTMLElement>('#moduleList');
  statusLine = overlay.querySelector<HTMLElement>('#moduleStatus');
  const tabRow = overlay.querySelector<HTMLElement>('#moduleTabs');
  const cloudRow = overlay.querySelector<HTMLElement>('#cloudStatusRow');
  const cloudStatus = overlay.querySelector<HTMLElement>('#cloudStatusLine');
  const cloudButton = overlay.querySelector<HTMLButtonElement>('#cloudLoginButton');
  if (cloudRow) cloudRow.hidden = true;
  if (cloudButton) cloudButton.disabled = true;
  if (!buttonContainer || !tabRow || !statusLine) {
    throw new Error('Module picker UI is missing required nodes');
  }
  buttonContainer.style.maxHeight = '220px';
  buttonContainer.style.overflowY = 'auto';

  const tabLabels: Record<PickerTab, string> = {
    local: 'Local',
    mine: 'Mine',
    shared: 'Shared',
    public: 'Public',
  };

  function updateSelected() {
    buttons.forEach((btn, i) => {
      if (i === selectedByTab[activeTab]) {
        btn.classList.add('selected');
        if (btn.focus) btn.focus();
        btn.scrollIntoView?.({ block: 'nearest' });
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  function pickModule(moduleInfo: PickerModuleInfo) {
    if (!moduleInfo) return;
    const idx = moduleLists[activeTab].indexOf(moduleInfo);
    if (idx >= 0) {
      selectedByTab[activeTab] = idx;
      updateSelected();
    }
    broadcastModuleSelection(moduleInfo);
    if (!isClient) {
      if (moduleInfo.source === 'cloud') {
        void loadCloudModule(moduleInfo);
      } else {
        loadModule(moduleInfo);
      }
    }
  }

  function renderModuleButtons() {
    if (!buttonContainer) return;
    buttonContainer.innerHTML = '';
    buttons = [];
    const mods = moduleLists[activeTab];
    if (!mods.length) {
      const empty = document.createElement('div');
      empty.textContent = activeTab === 'local'
        ? 'No local modules found.'
        : 'No entries in this library yet.';
      empty.className = 'module-meta';
      buttonContainer.appendChild(empty);
      return;
    }
    mods.forEach((moduleInfo, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.display = 'block';
      btn.style.margin = '4px 0';
      const detail = formatUpdatedAt(moduleInfo.updatedAt);
      const sourceLabel = moduleInfo.source === 'local' ? 'Local' : 'Cloud';
      btn.innerHTML = `<div style="font-weight:700;text-align:left">${moduleInfo.name}</div>` +
        `<div class="module-summary">${moduleInfo.summary || 'No summary provided.'}</div>` +
        `<div class="module-meta">${[detail, moduleInfo.ownerId, sourceLabel].filter(Boolean).join(' · ')}</div>`;
      if (isClient) {
        btn.disabled = true;
        btn.style.cursor = 'not-allowed';
        btn.style.opacity = '0.65';
      } else {
        btn.onclick = () => pickModule(moduleInfo);
      }
      btn.onfocus = () => { selectedByTab[activeTab] = i; updateSelected(); };
      buttons.push(btn);
      buttonContainer.appendChild(btn);
    });
    updateSelected();
  }
  rerenderActiveList = () => renderModuleButtons();

  function setActiveTab(next: PickerTab) {
    activeTab = next;
    Object.entries(tabButtons).forEach(([tab, btn]) => {
      if (btn) btn.classList.toggle('active', tab === activeTab);
    });
    seedSelection(activeTab);
    renderModuleButtons();
  }

  (['local', 'mine', 'shared', 'public'] as PickerTab[]).forEach(tab => {
    const btn = document.createElement('button');
    btn.textContent = tabLabels[tab];
    btn.className = tab === activeTab ? 'active' : '';
    btn.onclick = () => setActiveTab(tab);
    if (tab !== 'local') {
      btn.style.display = 'none';
    }
    tabButtons[tab] = btn;
    tabRow.appendChild(btn);
  });

  void initCloudLoginControls(cloudRow, cloudStatus, cloudButton);

  renderModuleButtons();

  overlay.tabIndex = 0;
  if (overlay.focus) overlay.focus();
  if (!isClient) {
    const keyHandler = (e: KeyboardEvent) => {
      if (!buttons.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        selectedByTab[activeTab] = (selectedByTab[activeTab] + 1 + buttons.length) % buttons.length;
        updateSelected();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        selectedByTab[activeTab] = (selectedByTab[activeTab] - 1 + buttons.length) % buttons.length;
        updateSelected();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const mod = moduleLists[activeTab][selectedByTab[activeTab]];
        if (mod) pickModule(mod);
      }
    };
    if (overlay.addEventListener) overlay.addEventListener('keydown', keyHandler);
  }

  if (pickerBus?.on) {
    pickerBus.on('module-picker:select', payload => {
      if (!isModulePickerPayload(payload)) return;
      const moduleInfo = findModuleFromPayload(payload);
      if (!moduleInfo) return;
      const tab = findTabForModule(moduleInfo);
      setActiveTab(tab);
      const idx = moduleLists[tab].indexOf(moduleInfo);
      if (idx >= 0) {
        selectedByTab[tab] = idx;
        updateSelected();
      }
      if (isClient && payload[NET_FLAG]) {
        if (moduleInfo.source === 'cloud') {
          void loadCloudModule(moduleInfo);
        } else {
          loadModule(moduleInfo);
        }
      }
    });
  }

  if (mpBridge?.subscribe && pickerBus?.emit) {
    mpBridge.subscribe('module-picker:select', payload => {
      const message: unknown = isModulePickerPayload(payload)
        ? { ...payload, [NET_FLAG]: true }
        : payload;
      try {
        pickerBus.emit('module-picker:select', message);
      } catch (err) {
        /* ignore */
      }
    });
  }

  if (isClient) {
    const waitingNotice = document.createElement('div');
    waitingNotice.style.cssText = 'position:relative;z-index:1;margin-top:14px;text-align:center;color:#8fa48f;';
    waitingNotice.textContent = 'Waiting for the host to pick a module.';
    uiBox.appendChild(waitingNotice);

    const actionRow = document.createElement('div');
    actionRow.style.cssText = 'position:relative;z-index:1;margin-top:8px;text-align:center;';
    const leaveBtn = document.createElement('button');
    leaveBtn.id = 'leaveMultiplayer';
    leaveBtn.className = 'btn';
    leaveBtn.textContent = 'Leave Multiplayer';
    leaveBtn.onclick = disconnectClient;
    actionRow.appendChild(leaveBtn);
    uiBox.appendChild(actionRow);
  }

  void hydrateCloudLibrary();
}

showModulePicker();
})();

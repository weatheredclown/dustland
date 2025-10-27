type LobbyEventBus = {
  emit?(event: string, ...args: any[]): void;
  on?(event: string, handler: (...args: any[]) => void): void;
  off?(event: string, handler: (...args: any[]) => void): void;
};

type MultiplayerBridge = {
  request?(event: string, payload: unknown): void;
  publish?(event: string, payload: unknown): void;
  subscribe?(event: string, handler: (payload: unknown) => void): (() => void) | void;
};

type MultiplayerApi = {
  startHost?: () => Promise<unknown>;
  connect?: (options: { code: string }) => Promise<unknown>;
  removeInvite?: (code: string) => void;
};

type LobbyGlobals = typeof globalThis & {
  EventBus?: LobbyEventBus;
  Dustland?: {
    multiplayerBridge?: MultiplayerBridge;
    multiplayer?: MultiplayerApi;
  };
};

const globalDustland = globalThis as LobbyGlobals;

(function(){
  const hostBtn = document.getElementById('startHost') as HTMLButtonElement | null;
  const newInviteBtn = document.getElementById('newInvite') as HTMLButtonElement | null;
  const hostStatusEl = document.getElementById('hostStatus') as HTMLElement | null;
  const peerListEl = document.getElementById('peerList') as HTMLElement | null;
  const modeSection = document.getElementById('modeSection') as HTMLElement | null;
  const hostSection = document.getElementById('hostSection') as HTMLElement | null;
  const joinSection = document.getElementById('joinSection') as HTMLElement | null;
  const inviteDeckEl = document.getElementById('inviteDeck') as HTMLElement | null;
  const inviteEmptyEl = document.getElementById('inviteEmpty') as HTMLElement | null;
  const inviteTemplate = document.getElementById('inviteTemplate') as HTMLTemplateElement | null;
  const joinAnswerGroup = document.getElementById('joinAnswerGroup') as HTMLElement | null;
  const chooseHostBtn = document.getElementById('chooseHost') as HTMLButtonElement | null;
  const chooseJoinBtn = document.getElementById('chooseJoin') as HTMLButtonElement | null;

  const joinCodeEl = document.getElementById('joinCode') as HTMLInputElement | null;
  const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement | null;
  const answerCodeEl = document.getElementById('answerCode') as HTMLInputElement | null;
  const copyAnswerBtn = document.getElementById('copyAnswer') as HTMLButtonElement | null;
  const joinStatusEl = document.getElementById('joinStatus') as HTMLElement | null;

  let hostRoom: any = null;
  let joinSocket: any = null;
  let removePeerWatcher: (() => void) | null = null;
  let enteredGame = false;
  let gameFrame: HTMLIFrameElement | null = null;
  let gameFrameContainer: HTMLDivElement | null = null;
  const bus = globalDustland.EventBus;
  const mpBridge = globalDustland.Dustland?.multiplayerBridge;
  const BRIDGE_EVENT = 'module-picker:select';
  const BRIDGE_FLAG = '__bridgeRelay';

  function cloneData<T>(data: T): T {
    if (!data || typeof data !== 'object') return data;
    const source = data as Record<string, unknown>;
    const copy: Record<string, unknown> = {};
    Object.keys(source).forEach(key => {
      copy[key] = source[key];
    });
    return copy as T;
  }
  const invites = new Map<string, { node: HTMLElement }>();
  function rememberRole(role: string | null){
    try {
      const store = globalThis.sessionStorage;
      if (!store?.setItem) return;
      if (!role) store.removeItem?.('dustland.multiplayerRole');
      else store.setItem('dustland.multiplayerRole', role);
    } catch (err) {
      /* ignore */
    }
  }
  rememberRole(null);

  function setText(el: HTMLElement | null, text?: string){ if (el) el.textContent = text ?? ''; }

  function hide(el: HTMLElement | null){ if (el?.classList) el.classList.add('hidden'); }
  function show(el: HTMLElement | null){ if (el?.classList) el.classList.remove('hidden'); }

  function showOnly(section){
    hide(modeSection);
    hide(hostSection);
    hide(joinSection);
    show(section);
  }

  function updatePeerList(peers: Array<{ id: string }> | null | undefined){
    if (!peerListEl) return;
    if (!peers || !peers.length) {
      peerListEl.textContent = 'No players linked yet.';
      return;
    }
    peerListEl.textContent = 'Linked players: ' + peers.map(p => p.id).join(', ');
  }

  function updateInviteVisibility(): void {
    const hasInvites = invites.size > 0;
    if (hasInvites) show(inviteDeckEl);
    else hide(inviteDeckEl);
    if (inviteEmptyEl) {
      if (hasInvites) hide(inviteEmptyEl);
      else show(inviteEmptyEl);
    }
  }

  function clearInvites(): void {
    invites.forEach(entry => entry.node?.remove?.());
    invites.clear();
    updateInviteVisibility();
  }

  function prepareHostView(): void {
    showOnly(hostSection);
    if (newInviteBtn) newInviteBtn.disabled = true;
    clearInvites();
    updatePeerList([]);
    enteredGame = false;
  }

  function updateJoinAnswerVisibility(): void {
    const hasCode = !!joinCodeEl?.value?.trim();
    if (hasCode) {
      show(joinAnswerGroup);
      if (connectBtn) connectBtn.disabled = false;
    } else {
      hide(joinAnswerGroup);
      if (connectBtn) connectBtn.disabled = true;
      if (answerCodeEl) answerCodeEl.value = '';
      if (copyAnswerBtn) copyAnswerBtn.disabled = true;
    }
  }

  function enterJoinMode(): void {
    showOnly(joinSection);
    if (joinCodeEl) joinCodeEl.value = '';
    if (answerCodeEl) answerCodeEl.value = '';
    if (copyAnswerBtn) copyAnswerBtn.disabled = true;
    updateJoinAnswerVisibility();
    setText(joinStatusEl, 'Paste the host code to continue.');
    joinCodeEl?.focus?.();
    rememberRole(null);
  }

  function enterGame(statusEl: HTMLElement | null, role: 'host' | 'client' | null){
    if (enteredGame) return;
    enteredGame = true;
    if (role) rememberRole(role);
    setText(statusEl, 'Link confirmed! Loading Dustland...');
    hide(modeSection);
    hide(hostSection);
    hide(joinSection);
    setTimeout(() => {
      openGameFrame();
      setText(statusEl, 'Dustland is running in this tab. Keep this page open while you play.');
    }, 400);
  }

  function openGameFrame(): HTMLIFrameElement | null {
    if (gameFrame && gameFrameContainer) return gameFrame;
    const container = document.createElement('div');
    if (!container) return null;
    container.id = 'mpGameFrame';
    container.style.cssText = 'position:fixed;inset:0;z-index:60;background:#000;display:flex;flex-direction:column;';
    const iframe = document.createElement('iframe');
    if (iframe) {
      iframe.id = 'mpGameFrameView';
      iframe.src = 'dustland.html';
      iframe.style.cssText = 'flex:1 1 auto;width:100%;height:100%;border:0;';
      iframe.allow = 'fullscreen';
      container.appendChild(iframe);
    }
    const notice = document.createElement('div');
    if (notice) {
      notice.textContent = 'Dustland is open. Keep this tab running to stay connected.';
      notice.style.cssText = 'flex:0 0 auto;padding:10px 16px;background:rgba(12,20,12,0.88);color:#9ec2a4;font-size:0.875rem;border-top:1px solid #2f3b2f;text-align:center;';
      container.appendChild(notice);
    }
    document.body?.appendChild?.(container);
    if (document.body) document.body.style.overflow = 'hidden';
    gameFrameContainer = container;
    gameFrame = iframe;
    setTimeout(() => {
      try { gameFrame?.focus?.(); } catch (err) { /* ignore */ }
    }, 250);
    return gameFrame;
  }

  function setupModuleBridge(): void {
    const eventBus = bus;
    if (!mpBridge || !eventBus?.on) return;
    const safeBus = eventBus;
    const publish = typeof mpBridge.publish === 'function' ? mpBridge.publish.bind(mpBridge) : null;
    const subscribe = typeof mpBridge.subscribe === 'function' ? mpBridge.subscribe.bind(mpBridge) : null;
    if (!publish || !subscribe) return;
    subscribe(BRIDGE_EVENT, payload => {
      const data = cloneData(payload);
      if (data && typeof data === 'object') data[BRIDGE_FLAG] = true;
      try {
        safeBus.emit?.(BRIDGE_EVENT, data);
      } catch (err) {
        /* ignore */
      }
    });
    safeBus.on(BRIDGE_EVENT, payload => {
      if (!publish) return;
      if (payload && typeof payload === 'object' && payload[BRIDGE_FLAG]) return;
      const data = cloneData(payload);
      if (data && typeof data === 'object') delete data[BRIDGE_FLAG];
      try {
        publish(BRIDGE_EVENT, data);
      } catch (err) {
        /* ignore */
      }
    });
  }

  async function copyToClipboard(el: HTMLInputElement | HTMLTextAreaElement | null, statusEl: HTMLElement | null, success: string){
    if (!el) return;
    const text = el.value.trim();
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setText(statusEl, success);
        return;
      }
    } catch (err) {
      /* fallback below */
    }
    el.select?.();
    try { document.execCommand?.('copy'); } catch (err) { /* ignore */ }
    setText(statusEl, success + ' (select & copy if needed)');
  }

  async function startHosting(autoInvite = false){
    if (hostBtn) hostBtn.disabled = true;
    setText(hostStatusEl, 'Preparing host tools...');
    removePeerWatcher?.();
    removePeerWatcher = null;
    hostRoom?.close?.();
    hostRoom = null;
    clearInvites();
    try {
      hostRoom = await globalDustland.Dustland?.multiplayer?.startHost();
      if (!hostRoom) throw new Error('Hosting unavailable.');
      setText(hostStatusEl, 'Hosting active. Generate a host code for each friend.');
      if (newInviteBtn) newInviteBtn.disabled = false;
      removePeerWatcher = hostRoom?.onPeers?.(updatePeerList);
      updatePeerList([]);
      rememberRole('host');
      if (autoInvite) await createInvite();
    } catch (err) {
      if (hostBtn) hostBtn.disabled = false;
      if (newInviteBtn) newInviteBtn.disabled = true;
      setText(hostStatusEl, 'Error: ' + (err?.message || err));
      if (!hostRoom) rememberRole(null);
    }
  }

  function buildInviteCard(ticket: { id: string; code?: string | null }){
    const template = inviteTemplate?.content;
    const node = template?.firstElementChild?.cloneNode(true) as HTMLElement | null;
    if (!node) return null;
    const hostField = node.querySelector<HTMLInputElement>('.host-code');
    const answerField = node.querySelector<HTMLInputElement>('.answer-input');
    const copyBtn = node.querySelector<HTMLButtonElement>('.copy-host');
    const linkBtn = node.querySelector<HTMLButtonElement>('.link-player');
    const statusEl = node.querySelector<HTMLElement>('.invite-status');
    if (hostField) {
      hostField.value = ticket.code || '';
      hostField.readOnly = true;
    }
    if (copyBtn) {
      copyBtn.onclick = () => copyToClipboard(hostField, statusEl, 'Host code copied.');
    }
    if (linkBtn) {
      linkBtn.onclick = async () => {
        const answer = answerField?.value?.trim();
        if (!answer) {
          setText(statusEl, 'Paste an answer code first.');
          return;
        }
        linkBtn.disabled = true;
        setText(statusEl, 'Linking player...');
        try {
          await hostRoom.acceptAnswer?.(ticket.id, answer);
          setText(statusEl, 'Linked! Invite closed.');
          invites.delete(ticket.id);
          node.remove();
          updateInviteVisibility();
          setText(hostStatusEl, 'Player linked! Create another host code for the next friend.');
          enterGame(hostStatusEl, 'host');
        } catch (err) {
          setText(statusEl, 'Error: ' + (err?.message || err));
        } finally {
          if (invites.has(ticket.id)) linkBtn.disabled = false;
        }
      };
    }
    invites.set(ticket.id, { node });
    if (inviteDeckEl) inviteDeckEl.appendChild(node);
    updateInviteVisibility();
    answerField?.focus?.();
    return node;
  }

  async function createInvite(): Promise<void>{
    if (!hostRoom) {
      setText(hostStatusEl, 'Start hosting first.');
      return;
    }
    if (newInviteBtn) newInviteBtn.disabled = true;
    try {
      const ticket = await hostRoom.createOffer?.();
      if (!ticket || !ticket.code) {
        setText(hostStatusEl, 'Failed to create host code.');
        return;
      }
      const card = buildInviteCard(ticket);
      if (!card) {
        setText(hostStatusEl, 'Host invite template missing.');
        return;
      }
      setText(hostStatusEl, 'Share each host code once. Paste the answer next to the matching invite.');
    } catch (err) {
      setText(hostStatusEl, 'Error: ' + (err?.message || err));
    } finally {
      if (newInviteBtn && hostRoom) newInviteBtn.disabled = false;
    }
  }

  async function generateAnswer(): Promise<void>{
    const code = joinCodeEl?.value?.trim();
    if (!code) {
      setText(joinStatusEl, 'Paste a host code first.');
      return;
    }
    if (connectBtn) connectBtn.disabled = true;
    setText(joinStatusEl, 'Preparing connection...');
    try {
      joinSocket?.close?.();
      joinSocket = await globalDustland.Dustland?.multiplayer?.connect({ code });
      if (!joinSocket) throw new Error('Connection failed.');
      if (answerCodeEl) answerCodeEl.value = joinSocket.answer || '';
      if (copyAnswerBtn) copyAnswerBtn.disabled = !(answerCodeEl?.value?.length);
      setText(joinStatusEl, 'Share your answer code with the host, then wait for them to link you.');
      joinSocket.ready?.then?.(() => {
        enterGame(joinStatusEl, 'client');
      }).catch(err => {
        setText(joinStatusEl, 'Connection closed: ' + (err?.message || err));
      });
    } catch (err) {
      joinSocket = null;
      setText(joinStatusEl, 'Error: ' + (err?.message || err));
    } finally {
      if (connectBtn) connectBtn.disabled = false;
    }
  }

  function init(){
    setupModuleBridge();
    if (hostBtn) hostBtn.onclick = () => startHosting();
    if (newInviteBtn) newInviteBtn.onclick = () => createInvite();
    if (connectBtn) connectBtn.onclick = generateAnswer;
    if (copyAnswerBtn) copyAnswerBtn.onclick = () => copyToClipboard(answerCodeEl, joinStatusEl, 'Answer code copied.');
    if (chooseHostBtn) chooseHostBtn.onclick = () => {
      prepareHostView();
      startHosting(true);
    };
    if (chooseJoinBtn) chooseJoinBtn.onclick = enterJoinMode;
    if (joinCodeEl) joinCodeEl.addEventListener('input', () => {
      updateJoinAnswerVisibility();
      setText(joinStatusEl, '');
    });
    updateInviteVisibility();
    updateJoinAnswerVisibility();
  }

  init();
})();

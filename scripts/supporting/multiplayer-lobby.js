const globalDustland = globalThis;
(function () {
    const hostBtn = document.getElementById('startHost');
    const newInviteBtn = document.getElementById('newInvite');
    const hostStatusEl = document.getElementById('hostStatus');
    const peerListEl = document.getElementById('peerList');
    const modeSection = document.getElementById('modeSection');
    const hostSection = document.getElementById('hostSection');
    const joinSection = document.getElementById('joinSection');
    const inviteDeckEl = document.getElementById('inviteDeck');
    const inviteEmptyEl = document.getElementById('inviteEmpty');
    const inviteTemplate = document.getElementById('inviteTemplate');
    const joinAnswerGroup = document.getElementById('joinAnswerGroup');
    const chooseHostBtn = document.getElementById('chooseHost');
    const chooseJoinBtn = document.getElementById('chooseJoin');
    const joinCodeEl = document.getElementById('joinCode');
    const connectBtn = document.getElementById('connectBtn');
    const answerCodeEl = document.getElementById('answerCode');
    const copyAnswerBtn = document.getElementById('copyAnswer');
    const joinStatusEl = document.getElementById('joinStatus');
    let hostRoom = null;
    let joinSocket = null;
    let removePeerWatcher = null;
    let enteredGame = false;
    let gameFrame = null;
    let gameFrameContainer = null;
    const bus = globalDustland.EventBus;
    const mpBridge = globalDustland.Dustland?.multiplayerBridge;
    const BRIDGE_EVENT = 'module-picker:select';
    const BRIDGE_FLAG = '__bridgeRelay';
    function cloneData(data) {
        if (!data || typeof data !== 'object')
            return data;
        const source = data;
        const copy = {};
        Object.keys(source).forEach(key => {
            copy[key] = source[key];
        });
        return copy;
    }
    const invites = new Map();
    function rememberRole(role) {
        try {
            const store = globalThis.sessionStorage;
            if (!store?.setItem)
                return;
            if (!role)
                store.removeItem?.('dustland.multiplayerRole');
            else
                store.setItem('dustland.multiplayerRole', role);
        }
        catch (err) {
            /* ignore */
        }
    }
    rememberRole(null);
    function setText(el, text) { if (el)
        el.textContent = text ?? ''; }
    function hide(el) { if (el?.classList)
        el.classList.add('hidden'); }
    function show(el) { if (el?.classList)
        el.classList.remove('hidden'); }
    function showOnly(section) {
        hide(modeSection);
        hide(hostSection);
        hide(joinSection);
        show(section);
    }
    function updatePeerList(peers) {
        if (!peerListEl)
            return;
        if (!peers || !peers.length) {
            peerListEl.textContent = 'No players linked yet.';
            return;
        }
        peerListEl.textContent = 'Linked players: ' + peers.map(p => p.id).join(', ');
    }
    function updateInviteVisibility() {
        const hasInvites = invites.size > 0;
        if (hasInvites)
            show(inviteDeckEl);
        else
            hide(inviteDeckEl);
        if (inviteEmptyEl) {
            if (hasInvites)
                hide(inviteEmptyEl);
            else
                show(inviteEmptyEl);
        }
    }
    function clearInvites() {
        invites.forEach(entry => entry.node?.remove?.());
        invites.clear();
        updateInviteVisibility();
    }
    function prepareHostView() {
        showOnly(hostSection);
        if (newInviteBtn)
            newInviteBtn.disabled = true;
        clearInvites();
        updatePeerList([]);
        enteredGame = false;
    }
    function updateJoinAnswerVisibility() {
        const hasCode = !!joinCodeEl?.value?.trim();
        if (hasCode) {
            show(joinAnswerGroup);
            if (connectBtn)
                connectBtn.disabled = false;
        }
        else {
            hide(joinAnswerGroup);
            if (connectBtn)
                connectBtn.disabled = true;
            if (answerCodeEl)
                answerCodeEl.value = '';
            if (copyAnswerBtn)
                copyAnswerBtn.disabled = true;
        }
    }
    function enterJoinMode() {
        showOnly(joinSection);
        if (joinCodeEl)
            joinCodeEl.value = '';
        if (answerCodeEl)
            answerCodeEl.value = '';
        if (copyAnswerBtn)
            copyAnswerBtn.disabled = true;
        updateJoinAnswerVisibility();
        setText(joinStatusEl, 'Paste the host code to continue.');
        joinCodeEl?.focus?.();
        rememberRole(null);
    }
    function enterGame(statusEl, role) {
        if (enteredGame)
            return;
        enteredGame = true;
        if (role)
            rememberRole(role);
        setText(statusEl, 'Link confirmed! Loading Dustland...');
        hide(modeSection);
        hide(hostSection);
        hide(joinSection);
        setTimeout(() => {
            openGameFrame();
            setText(statusEl, 'Dustland is running in this tab. Keep this page open while you play.');
        }, 400);
    }
    function openGameFrame() {
        if (gameFrame && gameFrameContainer)
            return gameFrame;
        const container = document.createElement('div');
        if (!container)
            return null;
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
        if (document.body)
            document.body.style.overflow = 'hidden';
        gameFrameContainer = container;
        gameFrame = iframe;
        setTimeout(() => {
            try {
                gameFrame?.focus?.();
            }
            catch (err) { /* ignore */ }
        }, 250);
        return gameFrame;
    }
    function setupModuleBridge() {
        const eventBus = bus;
        if (!mpBridge || !eventBus?.on)
            return;
        const safeBus = eventBus;
        const publish = typeof mpBridge.publish === 'function' ? mpBridge.publish.bind(mpBridge) : null;
        const subscribe = typeof mpBridge.subscribe === 'function' ? mpBridge.subscribe.bind(mpBridge) : null;
        if (!publish || !subscribe)
            return;
        subscribe(BRIDGE_EVENT, payload => {
            const data = cloneData(payload);
            if (data && typeof data === 'object')
                data[BRIDGE_FLAG] = true;
            try {
                safeBus.emit?.(BRIDGE_EVENT, data);
            }
            catch (err) {
                /* ignore */
            }
        });
        safeBus.on(BRIDGE_EVENT, payload => {
            if (!publish)
                return;
            if (payload && typeof payload === 'object' && payload[BRIDGE_FLAG])
                return;
            const data = cloneData(payload);
            if (data && typeof data === 'object')
                delete data[BRIDGE_FLAG];
            try {
                publish(BRIDGE_EVENT, data);
            }
            catch (err) {
                /* ignore */
            }
        });
    }
    async function copyToClipboard(el, statusEl, success) {
        if (!el)
            return;
        const text = el.value.trim();
        if (!text)
            return;
        try {
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                setText(statusEl, success);
                return;
            }
        }
        catch (err) {
            /* fallback below */
        }
        el.select?.();
        try {
            document.execCommand?.('copy');
        }
        catch (err) { /* ignore */ }
        setText(statusEl, success + ' (select & copy if needed)');
    }
    async function startHosting(autoInvite = false) {
        if (hostBtn)
            hostBtn.disabled = true;
        setText(hostStatusEl, 'Preparing host tools...');
        removePeerWatcher?.();
        removePeerWatcher = null;
        hostRoom?.close?.();
        hostRoom = null;
        clearInvites();
        try {
            hostRoom = await globalDustland.Dustland?.multiplayer?.startHost();
            if (!hostRoom)
                throw new Error('Hosting unavailable.');
            setText(hostStatusEl, 'Hosting active. Generate a host code for each friend.');
            if (newInviteBtn)
                newInviteBtn.disabled = false;
            removePeerWatcher = hostRoom?.onPeers?.(updatePeerList);
            updatePeerList([]);
            rememberRole('host');
            if (autoInvite)
                await createInvite();
        }
        catch (err) {
            if (hostBtn)
                hostBtn.disabled = false;
            if (newInviteBtn)
                newInviteBtn.disabled = true;
            setText(hostStatusEl, 'Error: ' + (err?.message || err));
            if (!hostRoom)
                rememberRole(null);
        }
    }
    function buildInviteCard(ticket) {
        const template = inviteTemplate?.content;
        const node = template?.firstElementChild?.cloneNode(true);
        if (!node)
            return null;
        const hostField = node.querySelector('.host-code');
        const answerField = node.querySelector('.answer-input');
        const copyBtn = node.querySelector('.copy-host');
        const linkBtn = node.querySelector('.link-player');
        const statusEl = node.querySelector('.invite-status');
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
                }
                catch (err) {
                    setText(statusEl, 'Error: ' + (err?.message || err));
                }
                finally {
                    if (invites.has(ticket.id))
                        linkBtn.disabled = false;
                }
            };
        }
        invites.set(ticket.id, { node });
        if (inviteDeckEl)
            inviteDeckEl.appendChild(node);
        updateInviteVisibility();
        answerField?.focus?.();
        return node;
    }
    async function createInvite() {
        if (!hostRoom) {
            setText(hostStatusEl, 'Start hosting first.');
            return;
        }
        if (newInviteBtn)
            newInviteBtn.disabled = true;
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
        }
        catch (err) {
            setText(hostStatusEl, 'Error: ' + (err?.message || err));
        }
        finally {
            if (newInviteBtn && hostRoom)
                newInviteBtn.disabled = false;
        }
    }
    async function generateAnswer() {
        const code = joinCodeEl?.value?.trim();
        if (!code) {
            setText(joinStatusEl, 'Paste a host code first.');
            return;
        }
        if (connectBtn)
            connectBtn.disabled = true;
        setText(joinStatusEl, 'Preparing connection...');
        try {
            joinSocket?.close?.();
            joinSocket = await globalDustland.Dustland?.multiplayer?.connect({ code });
            if (!joinSocket)
                throw new Error('Connection failed.');
            if (answerCodeEl)
                answerCodeEl.value = joinSocket.answer || '';
            if (copyAnswerBtn)
                copyAnswerBtn.disabled = !(answerCodeEl?.value?.length);
            setText(joinStatusEl, 'Share your answer code with the host, then wait for them to link you.');
            joinSocket.ready?.then?.(() => {
                enterGame(joinStatusEl, 'client');
            }).catch(err => {
                setText(joinStatusEl, 'Connection closed: ' + (err?.message || err));
            });
        }
        catch (err) {
            joinSocket = null;
            setText(joinStatusEl, 'Error: ' + (err?.message || err));
        }
        finally {
            if (connectBtn)
                connectBtn.disabled = false;
        }
    }
    function init() {
        setupModuleBridge();
        if (hostBtn)
            hostBtn.onclick = () => startHosting();
        if (newInviteBtn)
            newInviteBtn.onclick = () => createInvite();
        if (connectBtn)
            connectBtn.onclick = generateAnswer;
        if (copyAnswerBtn)
            copyAnswerBtn.onclick = () => copyToClipboard(answerCodeEl, joinStatusEl, 'Answer code copied.');
        if (chooseHostBtn)
            chooseHostBtn.onclick = () => {
                prepareHostView();
                startHosting(true);
            };
        if (chooseJoinBtn)
            chooseJoinBtn.onclick = enterJoinMode;
        if (joinCodeEl)
            joinCodeEl.addEventListener('input', () => {
                updateJoinAnswerVisibility();
                setText(joinStatusEl, '');
            });
        updateInviteVisibility();
        updateJoinAnswerVisibility();
    }
    init();
})();

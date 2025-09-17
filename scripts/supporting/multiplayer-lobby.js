(function(){
  const hostBtn = document.getElementById('startHost');
  const newInviteBtn = document.getElementById('newInvite');
  const linkBtn = document.getElementById('linkPlayer');
  const copyHostBtn = document.getElementById('copyHost');
  const hostCodeEl = document.getElementById('hostCode');
  const answerInputEl = document.getElementById('answerInput');
  const hostStatusEl = document.getElementById('hostStatus');
  const peerListEl = document.getElementById('peerList');
  const modeSection = document.getElementById('modeSection');
  const hostSection = document.getElementById('hostSection');
  const joinSection = document.getElementById('joinSection');
  const hostCodeGroup = document.getElementById('hostCodeGroup');
  const hostAnswerGroup = document.getElementById('hostAnswerGroup');
  const joinAnswerGroup = document.getElementById('joinAnswerGroup');
  const chooseHostBtn = document.getElementById('chooseHost');
  const chooseJoinBtn = document.getElementById('chooseJoin');

  const joinCodeEl = document.getElementById('joinCode');
  const connectBtn = document.getElementById('connectBtn');
  const answerCodeEl = document.getElementById('answerCode');
  const copyAnswerBtn = document.getElementById('copyAnswer');
  const joinStatusEl = document.getElementById('joinStatus');

  let hostRoom = null;
  let pendingTicket = null;
  let joinSocket = null;
  let removePeerWatcher = null;
  let enteredGame = false;

  function setText(el, text){ if (el) el.textContent = text || ''; }

  function hide(el){ if (el?.classList) el.classList.add('hidden'); }
  function show(el){ if (el?.classList) el.classList.remove('hidden'); }

  function showOnly(section){
    hide(modeSection);
    hide(hostSection);
    hide(joinSection);
    show(section);
  }

  function updatePeerList(peers){
    if (!peerListEl) return;
    if (!peers || !peers.length) {
      peerListEl.textContent = 'No players linked yet.';
      return;
    }
    peerListEl.textContent = 'Linked players: ' + peers.map(p => p.id).join(', ');
  }

  function revealHostSteps(){
    show(hostCodeGroup);
    show(hostAnswerGroup);
    answerInputEl?.removeAttribute('disabled');
  }

  function prepareHostView(){
    showOnly(hostSection);
    if (hostCodeEl) hostCodeEl.value = '';
    if (answerInputEl) {
      answerInputEl.value = '';
      answerInputEl.setAttribute('disabled', 'disabled');
    }
    if (copyHostBtn) copyHostBtn.disabled = true;
    if (linkBtn) linkBtn.disabled = true;
    if (newInviteBtn) newInviteBtn.disabled = true;
    hide(hostCodeGroup);
    hide(hostAnswerGroup);
    updatePeerList([]);
  }

  function updateJoinAnswerVisibility(){
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

  function enterJoinMode(){
    showOnly(joinSection);
    if (joinCodeEl) joinCodeEl.value = '';
    if (answerCodeEl) answerCodeEl.value = '';
    if (copyAnswerBtn) copyAnswerBtn.disabled = true;
    updateJoinAnswerVisibility();
    setText(joinStatusEl, 'Paste the host code to continue.');
    joinCodeEl?.focus?.();
  }

  function enterGame(statusEl){
    if (enteredGame) return;
    enteredGame = true;
    setText(statusEl, 'Link confirmed! Loading Dustland...');
    setTimeout(() => { window.location.href = 'dustland.html'; }, 800);
  }

  async function copyToClipboard(el, statusEl, success){
    if (!el) return;
    const text = el.value?.trim();
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

  async function startHosting(autoInvite){
    if (hostBtn) hostBtn.disabled = true;
    setText(hostStatusEl, 'Preparing host tools...');
    try {
      hostRoom = await globalThis.Dustland?.multiplayer?.startHost();
      setText(hostStatusEl, 'Hosting active. Generating connection details...');
      if (newInviteBtn) newInviteBtn.disabled = false;
      if (linkBtn) linkBtn.disabled = true;
      if (copyHostBtn) copyHostBtn.disabled = true;
      removePeerWatcher?.();
      removePeerWatcher = hostRoom?.onPeers?.(updatePeerList);
      updatePeerList([]);
      if (autoInvite) await createInvite();
    } catch (err) {
      if (hostBtn) hostBtn.disabled = false;
      setText(hostStatusEl, 'Error: ' + (err?.message || err));
    }
  }

  async function createInvite(){
    if (!hostRoom) {
      setText(hostStatusEl, 'Start hosting first.');
      return;
    }
    try {
      pendingTicket = await hostRoom.createOffer?.();
      if (!pendingTicket || !pendingTicket.code) {
        setText(hostStatusEl, 'Failed to create host code.');
        return;
      }
      hostCodeEl.value = pendingTicket.code;
      revealHostSteps();
      if (copyHostBtn) copyHostBtn.disabled = false;
      if (linkBtn) linkBtn.disabled = false;
      answerInputEl?.focus?.();
      setText(hostStatusEl, 'Share this host code. Generating another replaces the previous invite.');
    } catch (err) {
      setText(hostStatusEl, 'Error: ' + (err?.message || err));
    }
  }

  async function linkPlayer(){
    if (!hostRoom) {
      setText(hostStatusEl, 'Start hosting first.');
      return;
    }
    if (!pendingTicket) {
      setText(hostStatusEl, 'Create a host code before linking players.');
      return;
    }
    const answer = answerInputEl.value?.trim();
    if (!answer) {
      setText(hostStatusEl, 'Paste an answer code first.');
      return;
    }
    try {
      await hostRoom.acceptAnswer?.(pendingTicket.id, answer);
      setText(hostStatusEl, 'Player linked! Create another host code for the next friend.');
      answerInputEl.value = '';
      hostCodeEl.value = '';
      answerInputEl.setAttribute('disabled', 'disabled');
      hide(hostCodeGroup);
      hide(hostAnswerGroup);
      if (copyHostBtn) copyHostBtn.disabled = true;
      pendingTicket = null;
      if (linkBtn) linkBtn.disabled = true;
      enterGame(hostStatusEl);
    } catch (err) {
      setText(hostStatusEl, 'Error: ' + (err?.message || err));
    }
  }

  async function generateAnswer(){
    const code = joinCodeEl.value?.trim();
    if (!code) {
      setText(joinStatusEl, 'Paste a host code first.');
      return;
    }
    connectBtn.disabled = true;
    setText(joinStatusEl, 'Preparing connection...');
    try {
      joinSocket?.close?.();
      joinSocket = await globalThis.Dustland?.multiplayer?.connect({ code });
      if (!joinSocket) throw new Error('Connection failed.');
      answerCodeEl.value = joinSocket.answer || '';
      copyAnswerBtn.disabled = !answerCodeEl.value;
      setText(joinStatusEl, 'Share your answer code with the host, then wait for them to link you.');
      joinSocket.ready?.then?.(() => {
        enterGame(joinStatusEl);
      }).catch(err => {
        setText(joinStatusEl, 'Connection closed: ' + (err?.message || err));
      });
    } catch (err) {
      joinSocket = null;
      setText(joinStatusEl, 'Error: ' + (err?.message || err));
    } finally {
      connectBtn.disabled = false;
    }
  }

  function init(){
    if (hostBtn) hostBtn.onclick = () => startHosting();
    if (newInviteBtn) newInviteBtn.onclick = createInvite;
    if (linkBtn) linkBtn.onclick = linkPlayer;
    if (copyHostBtn) copyHostBtn.onclick = () => copyToClipboard(hostCodeEl, hostStatusEl, 'Host code copied.');
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
    updateJoinAnswerVisibility();
  }

  init();
})();

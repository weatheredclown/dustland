(function(){
  const hostBtn = document.getElementById('startHost');
  const newInviteBtn = document.getElementById('newInvite');
  const linkBtn = document.getElementById('linkPlayer');
  const copyHostBtn = document.getElementById('copyHost');
  const hostCodeEl = document.getElementById('hostCode');
  const answerInputEl = document.getElementById('answerInput');
  const hostStatusEl = document.getElementById('hostStatus');
  const peerListEl = document.getElementById('peerList');

  const joinCodeEl = document.getElementById('joinCode');
  const connectBtn = document.getElementById('connectBtn');
  const answerCodeEl = document.getElementById('answerCode');
  const copyAnswerBtn = document.getElementById('copyAnswer');
  const joinStatusEl = document.getElementById('joinStatus');

  let hostRoom = null;
  let pendingTicket = null;
  let joinSocket = null;
  let removePeerWatcher = null;

  function setText(el, text){ if (el) el.textContent = text || ''; }

  function updatePeerList(peers){
    if (!peerListEl) return;
    if (!peers || !peers.length) {
      peerListEl.textContent = 'No players linked yet.';
      return;
    }
    peerListEl.textContent = 'Linked players: ' + peers.map(p => p.id).join(', ');
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

  async function startHosting(){
    if (!hostBtn) return;
    hostBtn.disabled = true;
    setText(hostStatusEl, 'Preparing host tools...');
    try {
      hostRoom = await globalThis.Dustland?.multiplayer?.startHost();
      setText(hostStatusEl, 'Hosting active. Create a host code to invite a friend.');
      newInviteBtn.disabled = false;
      linkBtn.disabled = true;
      copyHostBtn.disabled = true;
      removePeerWatcher?.();
      removePeerWatcher = hostRoom?.onPeers?.(updatePeerList);
      updatePeerList([]);
    } catch (err) {
      hostBtn.disabled = false;
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
      copyHostBtn.disabled = false;
      linkBtn.disabled = false;
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
      copyHostBtn.disabled = true;
      pendingTicket = null;
      linkBtn.disabled = true;
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
        setText(joinStatusEl, 'Linked! Keep this tab open during play.');
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
    if (hostBtn) hostBtn.onclick = startHosting;
    if (newInviteBtn) newInviteBtn.onclick = createInvite;
    if (linkBtn) linkBtn.onclick = linkPlayer;
    if (copyHostBtn) copyHostBtn.onclick = () => copyToClipboard(hostCodeEl, hostStatusEl, 'Host code copied.');
    if (connectBtn) connectBtn.onclick = generateAnswer;
    if (copyAnswerBtn) copyAnswerBtn.onclick = () => copyToClipboard(answerCodeEl, joinStatusEl, 'Answer code copied.');
  }

  init();
})();

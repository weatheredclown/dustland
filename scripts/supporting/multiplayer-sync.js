// ===== Multiplayer Sync (browser-first) =====
(function(){
  globalThis.Dustland = globalThis.Dustland || {};
  const bus = globalThis.EventBus;
  const DEFAULT_ICE = [{ urls: 'stun:stun.l.google.com:19302' }];
  const hasWebRTC = typeof globalThis.RTCPeerConnection === 'function';

  const loopback = globalThis.__dustlandLoopback || (globalThis.__dustlandLoopback = {
    offers: new Map(),
    answers: new Map(),
    nextOffer: 1,
    nextAnswer: 1
  });

  function encode(obj){
    try {
      const json = JSON.stringify(obj);
      if (typeof btoa === 'function') return btoa(json);
      if (typeof Buffer === 'function') return Buffer.from(json, 'utf8').toString('base64');
      return json;
    } catch (err) {
      return '';
    }
  }

  function decode(str){
    try {
      if (typeof atob === 'function') return JSON.parse(atob(str));
      if (typeof Buffer === 'function') return JSON.parse(Buffer.from(str, 'base64').toString('utf8'));
      return JSON.parse(str);
    } catch (err) {
      return null;
    }
  }

  function cloneState(){
    const state = globalThis.Dustland.gameState?.getState?.();
    if (!state) return {};
    try {
      return JSON.parse(JSON.stringify(state));
    } catch (err) {
      const copy = {};
      Object.keys(state).forEach(key => { copy[key] = state[key]; });
      return copy;
    }
  }

  function computeDiff(prev, next){
    const diff = {};
    let changed = false;
    for (const key in next) {
      if (!isSame(prev[key], next[key])) {
        diff[key] = next[key];
        changed = true;
      }
    }
    for (const key in prev) {
      if (!(key in next)) {
        diff[key] = undefined;
        changed = true;
      }
    }
    return changed ? diff : null;
  }

  function isSame(a, b){
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (!a || !b) return false;
    if (typeof a !== 'object') return false;
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch (err) {
      return false;
    }
  }

  function applyStateMessage(msg){
    const gs = globalThis.Dustland.gameState;
    if (!gs) return;
    if (msg?.full) {
      gs.updateState(state => {
        Object.keys(state).forEach(key => { delete state[key]; });
        Object.assign(state, msg.full);
      });
      return;
    }
    if (msg?.diff) {
      gs.updateState(state => {
        Object.keys(msg.diff).forEach(key => {
          const val = msg.diff[key];
          if (val === undefined) {
            delete state[key];
          } else {
            state[key] = val;
          }
        });
      });
    }
  }

  function createLoopChannel(){
    const hostHandlers = new Set();
    const clientHandlers = new Set();
    let closed = false;
    return {
      hostHandlers,
      clientHandlers,
      sendToHost(msg){
        if (closed) return;
        const fn = () => { hostHandlers.forEach(handler => handler(msg)); };
        if (typeof queueMicrotask === 'function') queueMicrotask(fn);
        else setTimeout(fn, 0);
      },
      sendToClient(msg){
        if (closed) return;
        const fn = () => { clientHandlers.forEach(handler => handler(msg)); };
        if (typeof queueMicrotask === 'function') queueMicrotask(fn);
        else setTimeout(fn, 0);
      },
      close(){
        closed = true;
        hostHandlers.clear();
        clientHandlers.clear();
      }
    };
  }

  function createLoopbackHostTransport(){
    const peers = new Map();
    const messageListeners = new Set();
    const peerListeners = new Set();

    function snapshot(){
      return Array.from(peers.keys()).map(id => ({ id, status: 'open' }));
    }

    function notifyPeers(){
      const snap = snapshot();
      peerListeners.forEach(fn => fn(snap));
    }

    function encodeOfferId(id){ return `DL1:LOOP:${id}`; }
    function decodeAnswerId(code){
      if (typeof code !== 'string') return null;
      const parts = code.split(':');
      return parts[2] || null;
    }

    return {
      async createOffer(){
        const peerId = `peer-${loopback.nextOffer++}`;
        loopback.offers.set(peerId, { peerId });
        return { id: peerId, code: encodeOfferId(peerId) };
      },
      async acceptAnswer(peerId, code){
        const answerId = decodeAnswerId(code);
        const record = answerId ? loopback.answers.get(answerId) : null;
        if (!record || record.peerId !== peerId) throw new Error('Invalid answer code.');
        loopback.answers.delete(answerId);
        loopback.offers.delete(peerId);
        const { channel, resolveReady } = record;
        peers.set(peerId, channel);
        channel.hostHandlers.add(msg => messageListeners.forEach(fn => fn(msg, peerId)));
        resolveReady();
        notifyPeers();
        return peerId;
      },
      sendTo(peerId, msg){
        peers.get(peerId)?.sendToClient(msg);
      },
      broadcast(msg, skipId){
        peers.forEach((channel, id) => {
          if (id === skipId) return;
          channel.sendToClient(msg);
        });
      },
      onMessage(fn){
        messageListeners.add(fn);
        return () => messageListeners.delete(fn);
      },
      onPeers(fn){
        peerListeners.add(fn);
        fn(snapshot());
        return () => peerListeners.delete(fn);
      },
      close(){
        peers.forEach((ch, id) => {
          ch.close();
          loopback.offers.delete(id);
        });
        peers.clear();
        notifyPeers();
      }
    };
  }

  function connectLoopback({ code } = {}){
    if (typeof code !== 'string' || !code.startsWith('DL1:LOOP:')) {
      throw new Error('Invalid host code.');
    }
    const peerId = code.split(':')[2];
    if (!loopback.offers.has(peerId)) throw new Error('Host code expired.');
    const channel = createLoopChannel();
    const answerId = `ans-${loopback.nextAnswer++}`;
    let resolveReady;
    const ready = new Promise(res => { resolveReady = res; });
    loopback.answers.set(answerId, { peerId, channel, resolveReady });
    const listeners = new Set();
    channel.clientHandlers.add(msg => {
      if (msg && msg.__type === 'state') {
        applyStateMessage(msg);
      } else {
        listeners.forEach(fn => fn(msg));
      }
    });
    function encodeAnswerId(id){ return `DL1:ANS:${id}`; }
    return {
      answer: encodeAnswerId(answerId),
      send(msg){ channel.sendToHost(msg); },
      onMessage(fn){ listeners.add(fn); return () => listeners.delete(fn); },
      close(){ channel.close(); loopback.answers.delete(answerId); },
      ready
    };
  }

  function waitForIce(pc){
    if (!pc || pc.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise(resolve => {
      const check = () => {
        if (pc.iceGatheringState === 'complete') resolve();
        else setTimeout(check, 50);
      };
      check();
    });
  }

  function attachChannel(peer, channel, onMessage, onClosed){
    if (!channel) return;
    const handle = ev => {
      try {
        const obj = JSON.parse(ev.data);
        onMessage(obj, peer.id);
      } catch (err) {
        /* ignore */
      }
    };
    if (typeof channel.addEventListener === 'function') {
      channel.addEventListener('message', handle);
      channel.addEventListener('close', () => onClosed(peer));
      channel.addEventListener('error', () => onClosed(peer));
    } else {
      const origMessage = channel.onmessage;
      channel.onmessage = ev => { handle(ev); origMessage?.(ev); };
      const closeWrap = () => onClosed(peer);
      const origClose = channel.onclose;
      channel.onclose = ev => { closeWrap(); origClose?.(ev); };
      const origErr = channel.onerror;
      channel.onerror = ev => { closeWrap(); origErr?.(ev); };
    }
  }

  function waitForChannelOpen(channel){
    if (!channel) return Promise.resolve();
    if (channel.readyState === 'open') return Promise.resolve();
    return new Promise((resolve, reject) => {
      const done = () => {
        if (typeof channel.removeEventListener === 'function') {
          channel.removeEventListener('open', handleOpen);
          channel.removeEventListener('close', handleClose);
          channel.removeEventListener('error', handleClose);
        }
      };
      const handleOpen = () => { done(); resolve(); };
      const handleClose = () => { done(); reject(new Error('Connection closed.')); };
      if (typeof channel.addEventListener === 'function') {
        channel.addEventListener('open', handleOpen);
        channel.addEventListener('close', handleClose);
        channel.addEventListener('error', handleClose);
      } else {
        const origOpen = channel.onopen;
        channel.onopen = ev => { handleOpen(); origOpen?.(ev); };
        const origClose = channel.onclose;
        channel.onclose = ev => { handleClose(); origClose?.(ev); };
        const origErr = channel.onerror;
        channel.onerror = ev => { handleClose(); origErr?.(ev); };
      }
    });
  }

  function createWebRTCHostTransport(opts = {}){
    const Peer = globalThis.RTCPeerConnection;
    if (!Peer) throw new Error('WebRTC not supported in this browser.');
    const peers = new Map();
    const messageListeners = new Set();
    const peerListeners = new Set();

    function snapshot(){
      return Array.from(peers.values()).map(peer => ({
        id: peer.id,
        status: peer.channel?.readyState || 'closed'
      }));
    }

    function notifyPeers(){
      const snap = snapshot();
      peerListeners.forEach(fn => fn(snap));
    }

    return {
      async createOffer(){
        const peerId = `peer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
        const pc = new Peer({ iceServers: opts.iceServers || DEFAULT_ICE });
        const channel = pc.createDataChannel('dustland');
        const peer = { id: peerId, pc, channel };
        peers.set(peerId, peer);
        attachChannel(peer, channel, (msg, id) => messageListeners.forEach(fn => fn(msg, id)), () => {
          peers.delete(peerId);
          notifyPeers();
        });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await waitForIce(pc);
        return { id: peerId, code: `DL1:O:${encode(pc.localDescription)}` };
      },
      async acceptAnswer(peerId, code){
        const peer = peers.get(peerId);
        if (!peer) throw new Error('Unknown invite.');
        const desc = decode(code.split(':')[2]);
        if (!desc) throw new Error('Invalid answer code.');
        await peer.pc.setRemoteDescription(desc);
        await waitForChannelOpen(peer.channel);
        notifyPeers();
        return peerId;
      },
      sendTo(peerId, msg){
        const peer = peers.get(peerId);
        if (!peer || peer.channel?.readyState !== 'open') return;
        peer.channel.send(JSON.stringify(msg));
      },
      broadcast(msg, skipId){
        const data = JSON.stringify(msg);
        peers.forEach(peer => {
          if (peer.id === skipId) return;
          if (peer.channel?.readyState === 'open') peer.channel.send(data);
        });
      },
      onMessage(fn){
        messageListeners.add(fn);
        return () => messageListeners.delete(fn);
      },
      onPeers(fn){
        peerListeners.add(fn);
        fn(snapshot());
        return () => peerListeners.delete(fn);
      },
      close(){
        peers.forEach(peer => {
          peer.channel?.close();
          peer.pc?.close();
        });
        peers.clear();
        notifyPeers();
      }
    };
  }

  function connectWebRTC({ code, iceServers } = {}){
    if (typeof code !== 'string' || !code.startsWith('DL1:O:')) {
      throw new Error('Invalid host code.');
    }
    const offerDesc = decode(code.split(':')[2]);
    if (!offerDesc) throw new Error('Host code corrupt.');
    const Peer = globalThis.RTCPeerConnection;
    if (!Peer) throw new Error('WebRTC not supported in this browser.');
    const pc = new Peer({ iceServers: iceServers || DEFAULT_ICE });
    const listeners = new Set();
    let channel;
    const ready = new Promise((resolve, reject) => {
      const handleOpen = () => resolve();
      const handleClose = () => reject(new Error('Connection closed.'));
      pc.ondatachannel = ev => {
        channel = ev.channel;
        if (typeof channel.addEventListener === 'function') {
          channel.addEventListener('open', handleOpen);
          channel.addEventListener('close', handleClose);
          channel.addEventListener('error', handleClose);
          channel.addEventListener('message', handleMessage);
        } else {
          channel.onopen = handleOpen;
          channel.onclose = handleClose;
          channel.onerror = handleClose;
          channel.onmessage = handleMessage;
        }
      };
    });

    function handleMessage(ev){
      try {
        const obj = JSON.parse(ev.data);
        if (obj && obj.__type === 'state') {
          applyStateMessage(obj);
        } else {
          listeners.forEach(fn => fn(obj));
        }
      } catch (err) {
        /* ignore */
      }
    }

    return pc.setRemoteDescription(offerDesc)
      .then(() => pc.createAnswer())
      .then(answer => pc.setLocalDescription(answer))
      .then(() => waitForIce(pc))
      .then(() => ({
        answer: `DL1:A:${encode(pc.localDescription)}`,
        send(msg){
          if (channel?.readyState === 'open') channel.send(JSON.stringify(msg));
        },
        onMessage(fn){ listeners.add(fn); return () => listeners.delete(fn); },
        close(){ channel?.close(); pc.close(); },
        ready
      }));
  }

  function createHost(opts){
    const transport = hasWebRTC ? createWebRTCHostTransport(opts) : createLoopbackHostTransport();
    const listeners = new Set();
    let lastState = cloneState();
    const removeMsg = transport.onMessage((msg, fromId) => {
      if (msg && msg.__type === 'state') return;
      listeners.forEach(fn => fn(msg, fromId));
    });
    const onPeers = transport.onPeers?.bind(transport);

    function onStateChanged(){
      const next = cloneState();
      const diff = computeDiff(lastState, next);
      if (diff) {
        lastState = next;
        transport.broadcast({ __type: 'state', diff });
      }
    }

    bus?.on?.('state:changed', onStateChanged);

    return {
      createOffer: transport.createOffer,
      acceptAnswer: async (ticketId, code) => {
        const peerId = await transport.acceptAnswer(ticketId, code);
        lastState = cloneState();
        transport.sendTo?.(peerId, { __type: 'state', full: lastState });
        return peerId;
      },
      broadcast: transport.broadcast,
      onMessage(fn){
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      onPeers(fn){
        if (!onPeers) return () => {};
        return onPeers(fn);
      },
      close(){
        bus?.off?.('state:changed', onStateChanged);
        removeMsg?.();
        transport.close();
      }
    };
  }

  function connect(opts){
    const ctor = hasWebRTC ? connectWebRTC : connectLoopback;
    const listeners = new Set();
    return Promise.resolve(ctor(opts)).then(socket => {
      const remove = socket.onMessage(msg => {
        if (msg && msg.__type === 'state') {
          applyStateMessage(msg);
        } else {
          listeners.forEach(fn => fn(msg));
        }
      });
      return {
        answer: socket.answer,
        send: socket.send,
        onMessage(fn){
          listeners.add(fn);
          return () => listeners.delete(fn);
        },
        close(){
          remove?.();
          socket.close?.();
          listeners.clear();
        },
        ready: socket.ready || Promise.resolve()
      };
    });
  }

  globalThis.Dustland.multiplayer = {
    startHost: opts => Promise.resolve(createHost(opts)),
    connect
  };
})();

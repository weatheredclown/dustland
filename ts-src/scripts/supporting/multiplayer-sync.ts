type MultiplayerEventBus = {
  emit?(event: string, ...args: any[]): void;
  on?(event: string, handler: (...args: any[]) => void): void;
  off?(event: string, handler: (...args: any[]) => void): void;
  once?(event: string, handler: (...args: any[]) => void): void;
};

type LoopbackState = {
  offers: Map<string, string>;
  answers: Map<string, string>;
  nextOffer: number;
  nextAnswer: number;
};

type MultiplayerGlobals = typeof globalThis & {
  EventBus?: MultiplayerEventBus;
  Dustland?: {
    gameState?: {
      getState?: () => any;
    };
    multiplayer?: unknown;
  };
  __dustlandLoopback?: LoopbackState;
};

type PeerInfo = { id: string; status: string };
type MessageHandler = (message: unknown, peerId?: string) => void;
type HostOptions = { iceServers?: RTCIceServer[] };
type ConnectOptions = { code?: string; iceServers?: RTCIceServer[] };
type WebRTCPeer = { id: string; pc: RTCPeerConnection; channel: RTCDataChannel };
type StateMessage = { __type: 'state'; full?: Record<string, unknown>; diff?: Record<string, unknown> };

function isStateMessage(msg: unknown): msg is StateMessage {
  return typeof msg === 'object' && msg !== null && (msg as { __type?: unknown }).__type === 'state';
}

type BufferCtor = typeof import('node:buffer').Buffer;
const bufferCtor: BufferCtor | undefined = (globalThis as typeof globalThis & { Buffer?: BufferCtor }).Buffer;

const syncGlobal = globalThis as MultiplayerGlobals;

// ===== Multiplayer Sync (browser-first) =====
(function(){
  syncGlobal.Dustland = syncGlobal.Dustland || {};
  const bus = syncGlobal.EventBus;
  const DEFAULT_ICE = [{ urls: 'stun:stun.l.google.com:19302' }];
  const hasWebRTC = typeof syncGlobal.RTCPeerConnection === 'function';

  const loopback = syncGlobal.__dustlandLoopback || (syncGlobal.__dustlandLoopback = {
    offers: new Map(),
    answers: new Map(),
    nextOffer: 1,
    nextAnswer: 1
  });

  function encode(obj){
    try {
      const json = JSON.stringify(obj);
      if (typeof btoa === 'function') return btoa(json);
      if (bufferCtor) return bufferCtor.from(json, 'utf8').toString('base64');
      return json;
    } catch (err) {
      return '';
    }
  }

  function decode(str){
    try {
      if (typeof atob === 'function') return JSON.parse(atob(str));
      if (bufferCtor) return JSON.parse(bufferCtor.from(str, 'base64').toString('utf8'));
      return JSON.parse(str);
    } catch (err) {
      return null;
    }
  }

  function cloneState(){
    const state = syncGlobal.Dustland.gameState?.getState?.();
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

  function applyStateMessage(msg: StateMessage){
    const gs = syncGlobal.Dustland.gameState;
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
    const hostHandlers = new Set<(msg: unknown) => void>();
    const clientHandlers = new Set<(msg: unknown) => void>();
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
    const peers = new Map<string, ReturnType<typeof createLoopChannel>>();
    const messageListeners = new Set<MessageHandler>();
    const peerListeners = new Set<(peers: PeerInfo[]) => void>();

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
      broadcast(msg, skipId?: string){
        peers.forEach((channel, id) => {
          if (id === skipId) return;
          channel.sendToClient(msg);
        });
      },
      onMessage(fn: MessageHandler){
        messageListeners.add(fn);
        return () => messageListeners.delete(fn);
      },
      onPeers(fn: (peers: PeerInfo[]) => void){
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

  function connectLoopback({ code }: ConnectOptions = {}){
    if (typeof code !== 'string' || !code.startsWith('DL1:LOOP:')) {
      throw new Error('Invalid host code.');
    }
    const peerId = code.split(':')[2];
    if (!loopback.offers.has(peerId)) throw new Error('Host code expired.');
    const channel = createLoopChannel();
    const answerId = `ans-${loopback.nextAnswer++}`;
    let resolveReady: () => void = () => {};
    const ready = new Promise<void>(res => { resolveReady = res; });
    loopback.answers.set(answerId, { peerId, channel, resolveReady });
    const listeners = new Set<MessageHandler>();
    channel.clientHandlers.add(msg => {
      if (isStateMessage(msg)) {
        applyStateMessage(msg);
      } else {
        listeners.forEach(fn => fn(msg, 'loopback-host'));
      }
    });
    function encodeAnswerId(id){ return `DL1:ANS:${id}`; }
    return {
      answer: encodeAnswerId(answerId),
      send(msg){ channel.sendToHost(msg); },
      onMessage(fn: MessageHandler){ listeners.add(fn); return () => listeners.delete(fn); },
      close(){ channel.close(); loopback.answers.delete(answerId); },
      ready
    };
  }

  function waitForIce(pc: RTCPeerConnection | null | undefined){
    if (!pc || pc.iceGatheringState === 'complete') return Promise.resolve();
    return new Promise<void>(resolve => {
      const check = () => {
        if (pc.iceGatheringState === 'complete') resolve();
        else setTimeout(check, 50);
      };
      check();
    });
  }

  function attachChannel(peer: WebRTCPeer, channel: RTCDataChannel | null | undefined, onMessage: MessageHandler, onClosed: (peer: WebRTCPeer) => void){
    if (!channel) return;
    const handle = (ev: MessageEvent) => {
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
      const messageWrapper: typeof channel.onmessage = function(ev) {
        handle(ev);
        if (typeof origMessage === 'function') origMessage.call(this, ev);
      };
      channel.onmessage = messageWrapper;
      const closeWrap = () => onClosed(peer);
      const origClose = channel.onclose;
      const closeWrapper: typeof channel.onclose = function(ev) {
        closeWrap();
        origClose?.call(this, ev);
      };
      channel.onclose = closeWrapper;
      const origErr = channel.onerror;
      const errorWrapper: typeof channel.onerror = function(ev) {
        closeWrap();
        origErr?.call(this, ev);
      };
      channel.onerror = errorWrapper;
    }
  }

  function waitForChannelOpen(channel: RTCDataChannel | null | undefined){
    if (!channel) return Promise.resolve();
    if (channel.readyState === 'open') return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
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
        const openWrapper: typeof channel.onopen = function(ev) {
          handleOpen();
          origOpen?.call(this, ev);
        };
        channel.onopen = openWrapper;
        const origClose = channel.onclose;
        const closeWrapper: typeof channel.onclose = function(ev) {
          handleClose();
          origClose?.call(this, ev);
        };
        channel.onclose = closeWrapper;
        const origErr = channel.onerror;
        const errWrapper: typeof channel.onerror = function(ev) {
          handleClose();
          origErr?.call(this, ev);
        };
        channel.onerror = errWrapper;
      }
    });
  }

  function createWebRTCHostTransport(opts: HostOptions = {}){
    const Peer = syncGlobal.RTCPeerConnection;
    if (!Peer) throw new Error('WebRTC not supported in this browser.');
    const peers = new Map<string, WebRTCPeer>();
    const messageListeners = new Set<MessageHandler>();
    const peerListeners = new Set<(peers: PeerInfo[]) => void>();

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
      broadcast(msg, skipId?: string){
        const data = JSON.stringify(msg);
        peers.forEach(peer => {
          if (peer.id === skipId) return;
          if (peer.channel?.readyState === 'open') peer.channel.send(data);
        });
      },
      onMessage(fn: MessageHandler){
        messageListeners.add(fn);
        return () => messageListeners.delete(fn);
      },
      onPeers(fn: (peers: PeerInfo[]) => void){
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

  function connectWebRTC({ code, iceServers }: ConnectOptions = {}){
    if (typeof code !== 'string' || !code.startsWith('DL1:O:')) {
      throw new Error('Invalid host code.');
    }
    const offerDesc = decode(code.split(':')[2]);
    if (!offerDesc) throw new Error('Host code corrupt.');
    const Peer = syncGlobal.RTCPeerConnection;
    if (!Peer) throw new Error('WebRTC not supported in this browser.');
    const pc = new Peer({ iceServers: iceServers || DEFAULT_ICE });
    const listeners = new Set<MessageHandler>();
    let channel: RTCDataChannel | null = null;
    const ready = new Promise<void>((resolve, reject) => {
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
          const origOpen = channel.onopen;
          const openWrapper: typeof channel.onopen = function(ev) {
            handleOpen();
            origOpen?.call(this, ev);
          };
          channel.onopen = openWrapper;
          const origClose = channel.onclose;
          const closeWrapper: typeof channel.onclose = function(ev) {
            handleClose();
            origClose?.call(this, ev);
          };
          channel.onclose = closeWrapper;
          const origError = channel.onerror;
          const errorWrapper: typeof channel.onerror = function(ev) {
            handleClose();
            origError?.call(this, ev);
          };
          channel.onerror = errorWrapper;
          const messageWrapper: typeof channel.onmessage = function(ev) {
            handleMessage(ev);
          };
          channel.onmessage = messageWrapper;
        }
      };
    });

    function handleMessage(ev: MessageEvent){
      try {
        const obj = JSON.parse(ev.data);
        if (isStateMessage(obj)) {
          applyStateMessage(obj);
        } else {
          listeners.forEach(fn => fn(obj, 'webrtc-host'));
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
        onMessage(fn: MessageHandler){ listeners.add(fn); return () => listeners.delete(fn); },
        close(){ channel?.close(); pc.close(); },
        ready
      }));
  }

  function createHost(opts: HostOptions = {}){
    const transport = hasWebRTC ? createWebRTCHostTransport(opts) : createLoopbackHostTransport();
    const listeners = new Set<MessageHandler>();
    let lastState = cloneState();
    const removeMsg = transport.onMessage((msg, fromId) => {
      if (isStateMessage(msg)) return;
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
      onMessage(fn: MessageHandler){
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

  function connect(opts: ConnectOptions = {}){
    const ctor = hasWebRTC ? connectWebRTC : connectLoopback;
    const listeners = new Set<MessageHandler>();
    return Promise.resolve(ctor(opts)).then(socket => {
      const remove = socket.onMessage((msg, fromId) => {
        if (isStateMessage(msg)) {
          applyStateMessage(msg);
        } else {
          listeners.forEach(fn => fn(msg, fromId));
        }
      });
      return {
        answer: socket.answer,
        send: socket.send,
        onMessage(fn: MessageHandler){
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

  syncGlobal.Dustland.multiplayer = {
    startHost: opts => Promise.resolve(createHost(opts)),
    connect
  };
})();
/// <reference types="node" />

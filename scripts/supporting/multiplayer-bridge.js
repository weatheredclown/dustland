const bridgeGlobal = globalThis;
(function () {
    const CHANNEL = 'dustland.multiplayer.bridge';
    const listeners = new Map();
    const sourceId = `mpb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    function cloneData(data) {
        if (!data || typeof data !== 'object')
            return data;
        try {
            if (typeof structuredClone === 'function')
                return structuredClone(data);
            return JSON.parse(JSON.stringify(data));
        }
        catch (err) {
            const copy = {};
            Object.keys(data).forEach(key => {
                copy[key] = data[key];
            });
            return copy;
        }
    }
    function emit(evt, payload, meta) {
        const handlers = listeners.get(evt);
        if (!handlers)
            return;
        handlers.forEach(handler => {
            try {
                handler(cloneData(payload), meta);
            }
            catch (err) {
                /* ignore handler errors */
            }
        });
    }
    function createChannel(callback) {
        if (typeof BroadcastChannel === 'function') {
            try {
                const bc = new BroadcastChannel(CHANNEL);
                bc.onmessage = e => callback?.(e?.data);
                return {
                    post(data) { bc.postMessage(data); },
                    close() { bc.close?.(); }
                };
            }
            catch (err) {
                /* fallback to storage */
            }
        }
        const listener = event => {
            if (event?.key !== CHANNEL || !event.newValue)
                return;
            try {
                callback?.(JSON.parse(event.newValue));
            }
            catch (err) {
                /* ignore malformed payloads */
            }
        };
        try {
            globalThis.addEventListener?.('storage', listener);
        }
        catch (err) {
            /* ignore */
        }
        return {
            post(data) {
                try {
                    const json = JSON.stringify(data);
                    globalThis.localStorage?.setItem?.(CHANNEL, json);
                    globalThis.localStorage?.removeItem?.(CHANNEL);
                }
                catch (err) {
                    /* ignore */
                }
            },
            close() {
                try {
                    globalThis.removeEventListener?.('storage', listener);
                }
                catch (err) { /* ignore */ }
            }
        };
    }
    const channel = createChannel(message => {
        if (!message || message.sourceId === sourceId)
            return;
        if (message.type !== 'event')
            return;
        emit(message.evt, message.data, { sourceId: message.sourceId });
    });
    function publish(evt, payload) {
        if (!evt || !channel)
            return;
        channel.post({ type: 'event', evt, data: cloneData(payload), sourceId });
    }
    function subscribe(evt, handler) {
        if (typeof handler !== 'function')
            return () => { };
        if (!listeners.has(evt))
            listeners.set(evt, new Set());
        const set = listeners.get(evt);
        set.add(handler);
        return () => {
            set.delete(handler);
            if (set.size === 0)
                listeners.delete(evt);
        };
    }
    function close() {
        listeners.clear();
        channel?.close?.();
    }
    bridgeGlobal.Dustland = bridgeGlobal.Dustland || {};
    bridgeGlobal.Dustland.multiplayerBridge = Object.assign(bridgeGlobal.Dustland.multiplayerBridge || {}, {
        publish,
        subscribe,
        close,
        getId() { return sourceId; }
    });
})();

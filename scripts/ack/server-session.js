import { detectServerMode } from './server-mode.js';
export class ServerSession {
    static get() {
        if (!ServerSession.instance) {
            ServerSession.instance = new ServerSession();
        }
        return ServerSession.instance;
    }
    constructor() {
        this.subscribers = new Set();
        const bootstrap = detectServerMode();
        this.snapshot = {
            status: bootstrap.status === 'firebase-ready' ? 'idle' : 'disabled',
            user: null,
            error: null,
            bootstrap,
        };
    }
    subscribe(callback) {
        this.subscribers.add(callback);
        callback(this.snapshot);
        return () => {
            this.subscribers.delete(callback);
        };
    }
    getSnapshot() {
        return this.snapshot;
    }
    markInitializing() {
        this.updateSnapshot({ status: 'initializing', error: null });
    }
    markAuthenticating() {
        this.updateSnapshot({ status: 'authenticating', error: null });
    }
    markAuthenticated(user) {
        this.updateSnapshot({ status: 'authenticated', user, error: null });
    }
    markError(error) {
        this.updateSnapshot({ status: 'error', error });
    }
    disable(reason) {
        const bootstrap = detectServerMode();
        const next = bootstrap.status === 'firebase-ready'
            ? { status: 'disabled', reason: reason ?? 'feature-flag', features: bootstrap.features }
            : bootstrap;
        this.snapshot = {
            status: 'disabled',
            user: null,
            error: null,
            bootstrap: next,
        };
        this.dispatch();
    }
    updateSnapshot(partial) {
        this.snapshot = {
            ...this.snapshot,
            ...partial,
        };
        this.dispatch();
    }
    dispatch() {
        for (const subscriber of this.subscribers) {
            subscriber(this.snapshot);
        }
    }
}
ServerSession.instance = null;

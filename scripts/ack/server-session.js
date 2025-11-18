import { FIREBASE_APP_NAME, loadFirebaseApp, loadFirebaseAuth } from './firebase-clients.js';
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
        this.auth = null;
        this.authModule = null;
        this.authUnsubscribe = null;
        this.authReady = null;
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
        if (this.snapshot.bootstrap.status === 'firebase-ready') {
            void this.ensureAuthListener().catch(error => this.markError(this.normalizeError(error)));
        }
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
        this.teardownAuth();
        this.snapshot = {
            status: 'disabled',
            user: null,
            error: null,
            bootstrap: next,
        };
        this.dispatch();
    }
    async signIn() {
        if (this.snapshot.bootstrap.status !== 'firebase-ready') {
            return;
        }
        try {
            await this.ensureAuthListener();
            if (!this.auth || !this.authModule) {
                throw new Error('Auth not initialized.');
            }
            this.markAuthenticating();
            const provider = new this.authModule.GoogleAuthProvider();
            await this.authModule.signInWithPopup(this.auth, provider);
        }
        catch (error) {
            this.markError(this.normalizeError(error));
        }
    }
    async signOut() {
        if (!this.auth || !this.authModule) {
            return;
        }
        await this.authModule.signOut(this.auth);
        this.updateSnapshot({ status: 'idle', user: null, error: null });
    }
    static resetForTests() {
        if (ServerSession.instance) {
            ServerSession.instance.teardownAuth();
        }
        ServerSession.instance = null;
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
    async ensureAuthListener() {
        if (this.authReady) {
            return this.authReady;
        }
        this.authReady = this.initAuth().catch(error => {
            this.authReady = null;
            throw error;
        });
        return this.authReady;
    }
    async initAuth() {
        if (this.snapshot.bootstrap.status !== 'firebase-ready') {
            return;
        }
        this.markInitializing();
        const appModule = await loadFirebaseApp();
        const { initializeApp, getApps } = appModule;
        const app = getApps().find(existing => existing.name === FIREBASE_APP_NAME)
            ?? initializeApp(this.snapshot.bootstrap.config, FIREBASE_APP_NAME);
        const authModule = await loadFirebaseAuth();
        this.authModule = authModule;
        this.auth = authModule.getAuth(app);
        this.authUnsubscribe?.();
        this.authUnsubscribe = authModule.onAuthStateChanged(this.auth, user => {
            this.handleAuthStateChange(user);
        });
        this.handleAuthStateChange(this.auth.currentUser ?? null);
    }
    handleAuthStateChange(user) {
        if (!user) {
            this.updateSnapshot({ status: 'idle', user: null, error: null });
            return;
        }
        this.markAuthenticated({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            providerId: user.providerId,
        });
    }
    normalizeError(error) {
        return error instanceof Error ? error : new Error(String(error));
    }
    teardownAuth() {
        this.authUnsubscribe?.();
        this.authUnsubscribe = null;
        this.auth = null;
        this.authModule = null;
        this.authReady = null;
    }
}
ServerSession.instance = null;

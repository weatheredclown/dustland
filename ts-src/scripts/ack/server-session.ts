import { FIREBASE_APP_NAME, loadFirebaseApp, loadFirebaseAuth } from './firebase-clients.js';
import { detectServerMode, type ServerModeBootstrap } from './server-mode.js';

export type ServerSessionStatus =
  | 'disabled'
  | 'idle'
  | 'initializing'
  | 'authenticating'
  | 'authenticated'
  | 'error';

export interface ServerSessionUser {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  [key: string]: unknown;
}

export interface ServerSessionSnapshot {
  status: ServerSessionStatus;
  user: ServerSessionUser | null;
  error: Error | null;
  bootstrap: ServerModeBootstrap;
}

type ServerSessionSubscriber = (snapshot: ServerSessionSnapshot) => void;

export class ServerSession {
  private static instance: ServerSession | null = null;

  static get(): ServerSession {
    if (!ServerSession.instance) {
      ServerSession.instance = new ServerSession();
    }
    return ServerSession.instance;
  }

  private readonly subscribers = new Set<ServerSessionSubscriber>();
  private snapshot: ServerSessionSnapshot;
  private auth: import('firebase/auth').Auth | null = null;
  private authModule: typeof import('firebase/auth') | null = null;
  private authUnsubscribe: (() => void) | null = null;
  private authReady: Promise<void> | null = null;

  private constructor() {
    const bootstrap = detectServerMode();
    this.snapshot = {
      status: bootstrap.status === 'firebase-ready' ? 'idle' : 'disabled',
      user: null,
      error: null,
      bootstrap,
    };
  }

  subscribe(callback: ServerSessionSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.snapshot);
    if (this.snapshot.bootstrap.status === 'firebase-ready') {
      void this.ensureAuthListener().catch(error => this.markError(this.normalizeError(error)));
    }
    return () => {
      this.subscribers.delete(callback);
    };
  }

  getSnapshot(): ServerSessionSnapshot {
    return this.snapshot;
  }

  markInitializing(): void {
    this.updateSnapshot({ status: 'initializing', error: null });
  }

  markAuthenticating(): void {
    this.updateSnapshot({ status: 'authenticating', error: null });
  }

  markAuthenticated(user: ServerSessionUser | null): void {
    this.updateSnapshot({ status: 'authenticated', user, error: null });
  }

  markError(error: Error): void {
    this.updateSnapshot({ status: 'error', error });
  }

  disable(reason?: 'missing-config' | 'feature-flag' | 'invalid-config'): void {
    const bootstrap = detectServerMode();
    const next: ServerModeBootstrap =
      bootstrap.status === 'firebase-ready'
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

  async signIn(): Promise<void> {
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
    } catch (error) {
      this.markError(this.normalizeError(error));
    }
  }

  async signOut(): Promise<void> {
    if (!this.auth || !this.authModule) {
      return;
    }
    await this.authModule.signOut(this.auth);
    this.updateSnapshot({ status: 'idle', user: null, error: null });
  }

  static resetForTests(): void {
    if (ServerSession.instance) {
      ServerSession.instance.teardownAuth();
    }
    ServerSession.instance = null;
  }

  private updateSnapshot(partial: Partial<Omit<ServerSessionSnapshot, 'bootstrap'>>): void {
    this.snapshot = {
      ...this.snapshot,
      ...partial,
    };
    this.dispatch();
  }

  private dispatch(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.snapshot);
    }
  }

  private async ensureAuthListener(): Promise<void> {
    if (this.authReady) {
      return this.authReady;
    }
    this.authReady = this.initAuth().catch(error => {
      this.authReady = null;
      throw error;
    });
    return this.authReady;
  }

  private async initAuth(): Promise<void> {
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

  private handleAuthStateChange(user: import('firebase/auth').User | null): void {
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

  private normalizeError(error: unknown): Error {
    return error instanceof Error ? error : new Error(String(error));
  }

  private teardownAuth(): void {
    this.authUnsubscribe?.();
    this.authUnsubscribe = null;
    this.auth = null;
    this.authModule = null;
    this.authReady = null;
  }
}

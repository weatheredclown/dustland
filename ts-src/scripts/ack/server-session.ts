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
    this.snapshot = {
      status: 'disabled',
      user: null,
      error: null,
      bootstrap: next,
    };
    this.dispatch();
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
}

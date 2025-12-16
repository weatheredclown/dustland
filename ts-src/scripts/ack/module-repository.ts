import { FIREBASE_APP_NAME, loadFirebaseModule } from './firebase-clients.js';
import type { ServerSessionSnapshot } from './server-session.js';

export type ModuleVisibility = 'private' | 'shared' | 'public';

export interface ModuleSummary {
  id: string;
  title: string;
  summary?: string;
  visibility: ModuleVisibility;
  ownerId: string;
  updatedAt: number;
  publishedVersionId?: string | null;
  [key: string]: unknown;
}

export interface ModuleVersion {
  moduleId: string;
  versionId: string;
  payload: unknown;
  createdAt: number;
  createdBy: string;
  [key: string]: unknown;
}

export interface ModuleRepository {
  init(session: ServerSessionSnapshot): Promise<void> | void;
  listMine(): Promise<ModuleSummary[]>;
  listShared(): Promise<ModuleSummary[]>;
  listPublic(): Promise<ModuleSummary[]>;
  loadVersion(moduleId: string): Promise<ModuleVersion | null>;
  saveDraft(moduleId: string | null, payload: unknown): Promise<ModuleVersion>;
  publish(moduleId: string): Promise<void>;
  share?(moduleId: string, email: string, role?: 'viewer' | 'editor'): Promise<void>;
}

export class NullModuleRepository implements ModuleRepository {
  async init(_session: ServerSessionSnapshot): Promise<void> {
    // No-op
  }

  async listMine(): Promise<ModuleSummary[]> {
    return [];
  }

  async listShared(): Promise<ModuleSummary[]> {
    return [];
  }

  async listPublic(): Promise<ModuleSummary[]> {
    return [];
  }

  async loadVersion(_moduleId: string): Promise<ModuleVersion | null> {
    return null;
  }

  async saveDraft(moduleId: string | null, payload: unknown): Promise<ModuleVersion> {
    const now = Date.now();
    return {
      moduleId: moduleId ?? createId('module'),
      versionId: createId('version'),
      payload,
      createdAt: now,
      createdBy: 'offline',
    };
  }

  async publish(_moduleId: string): Promise<void> {
    // No-op
  }

  async share(_moduleId: string, _email: string): Promise<void> {
    // No-op
  }
}

type FirestoreModuleDoc = {
  ownerId?: string;
  title?: string;
  summary?: string;
  visibility?: ModuleVisibility;
  updatedAt?: number;
  latestVersionId?: string;
  publishedVersionId?: string | null;
  [key: string]: unknown;
};

type ShareLookupResponse = { uid?: string; displayName?: string | null } | null;

export class FirestoreModuleRepository implements ModuleRepository {
  private db: import('firebase/firestore').Firestore | null = null;
  private functions: import('firebase/functions').Functions | null = null;
  private session: ServerSessionSnapshot | null = null;

  async init(session: ServerSessionSnapshot): Promise<void> {
    if (session.bootstrap.status !== 'firebase-ready') {
      throw new Error('Firebase config missing.');
    }
    this.session = session;
    const { initializeApp, getApps } = await loadFirebaseModule<typeof import('firebase/app')>('firebase-app');
    const { getFirestore } = await loadFirebaseModule<typeof import('firebase/firestore')>('firebase-firestore');
    const { getFunctions } = await loadFirebaseModule<typeof import('firebase/functions')>('firebase-functions');
    const existing = getApps().find(app => app.name === FIREBASE_APP_NAME);
    const app = existing ?? initializeApp(session.bootstrap.config, FIREBASE_APP_NAME);
    this.db = getFirestore(app);
    this.functions = getFunctions(app);
  }

  async listMine(): Promise<ModuleSummary[]> {
    const userId = this.session?.user?.uid;
    if (!userId || !this.db) return [];
    const { collection, getDocs, query, where, orderBy } = await loadFirebaseModule<typeof import('firebase/firestore')>(
      'firebase-firestore',
    );
    const col = collection(this.db, 'maps');
    const q = query(col, where('ownerId', '==', userId), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => this.mapDocToSummary(doc.id, doc.data() as FirestoreModuleDoc));
  }

  async listShared(): Promise<ModuleSummary[]> {
    const userId = this.session?.user?.uid;
    if (!userId || !this.db) return [];
    const { collection, getDocs, query, where } = await loadFirebaseModule<typeof import('firebase/firestore')>(
      'firebase-firestore',
    );
    const sharesCol = collection(this.db, 'shares');
    const shareSnap = await getDocs(query(sharesCol, where('userId', '==', userId)));
    if (shareSnap.empty) return [];
    const mapIds = shareSnap.docs.map(doc => (doc.data() as { mapId?: string }).mapId).filter(Boolean) as string[];
    const mapsCol = collection(this.db, 'maps');
    const summaries: ModuleSummary[] = [];
    for (const mapId of mapIds) {
      const mapDoc = await this.safeGetDoc(mapsCol, mapId);
      if (mapDoc) {
        summaries.push(this.mapDocToSummary(mapId, mapDoc));
      }
    }
    return summaries;
  }

  async listPublic(): Promise<ModuleSummary[]> {
    if (!this.db) return [];
    const { collection, getDocs, orderBy, query } = await loadFirebaseModule<typeof import('firebase/firestore')>(
      'firebase-firestore',
    );
    const listings = collection(this.db, 'publicListings');
    const snap = await getDocs(query(listings, orderBy('updatedAt', 'desc')));
    return snap.docs.map(doc => this.mapDocToSummary(doc.id, doc.data() as FirestoreModuleDoc, true));
  }

  async loadVersion(moduleId: string): Promise<ModuleVersion | null> {
    if (!this.db) return null;
    const { doc, getDoc } = await loadFirebaseModule<typeof import('firebase/firestore')>('firebase-firestore');
    const mapRef = doc(this.db, 'maps', moduleId);
    const mapSnap = await getDoc(mapRef);
    if (!mapSnap.exists()) return null;
    const mapData = mapSnap.data() as FirestoreModuleDoc;
    const versionId = mapData.latestVersionId ?? mapData.publishedVersionId;
    if (!versionId) return null;
    const versionRef = doc(this.db, 'mapVersions', `${moduleId}_${versionId}`);
    const versionSnap = await getDoc(versionRef);
    if (!versionSnap.exists()) return null;
    const now = Date.now();
    const createdAt = typeof versionSnap.get('createdAt') === 'number' ? (versionSnap.get('createdAt') as number) : now;
    const createdBy = (versionSnap.get('createdBy') as string) ?? 'unknown';
    return {
      moduleId,
      versionId,
      payload: versionSnap.get('payload'),
      createdAt,
      createdBy,
    };
  }

  async saveDraft(moduleId: string | null, payload: unknown): Promise<ModuleVersion> {
    if (!this.db) throw new Error('Firestore is not initialized.');
    const userId = this.session?.user?.uid;
    if (!userId) throw new Error('Sign in before saving to the cloud.');
    const { doc, getDoc, setDoc } = await loadFirebaseModule<typeof import('firebase/firestore')>('firebase-firestore');
    const sanitizedModuleId = moduleId?.trim();
    const hasExistingId = Boolean(sanitizedModuleId);
    const mapId = sanitizedModuleId ?? createId('map');
    const versionId = createId('version');
    const now = Date.now();
    const createdBy = this.session?.user?.uid ?? 'anonymous';
    const mapRef = doc(this.db, 'maps', mapId);
    const existingMap = hasExistingId ? await getDoc(mapRef) : null;
    const existingOwnerId = existingMap?.exists() ? ((existingMap.data() as FirestoreModuleDoc).ownerId ?? null) : null;
    if (hasExistingId && existingMap?.exists()) {
      const canEdit = await this.hasEditAccess(mapId, existingOwnerId);
      if (!canEdit) {
        throw new Error(
          'You do not have edit access to this module. Ask the owner to share edit access before saving.',
        );
      }
    }
    const ownerId = existingOwnerId ?? userId;
    const mapPayload = {
      ownerId,
      visibility: 'private',
      updatedAt: now,
      latestVersionId: versionId,
      title: (payload as { name?: string }).name ?? '',
      summary: (payload as { summary?: string }).summary ?? '',
    };
    await this.writeWithDetail(
      'saving draft metadata',
      `maps/${mapId}`,
      mapPayload,
      () => setDoc(mapRef, mapPayload, { merge: true }),
    );
    const versionRef = doc(this.db, 'mapVersions', `${mapId}_${versionId}`);
    const versionPayload = { moduleId: mapId, versionId, payload, createdAt: now, createdBy };

    let lastError: unknown;
    // Retry the version save to handle eventual consistency where the map document
    // created above might not be visible to the security rules engine immediately.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.writeWithDetail(
          'saving draft version',
          `mapVersions/${mapId}_${versionId}`,
          versionPayload,
          () => setDoc(versionRef, versionPayload),
        );
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        if (isPermissionError(err)) {
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        throw err;
      }
    }

    if (lastError) {
      if (isPermissionError(lastError)) {
        throw new Error(
          'You do not have edit access to this module. Ask the owner to share editor access or duplicate the module to save your own copy.',
        );
      }
      throw lastError;
    }

    return { moduleId: mapId, versionId, payload, createdAt: now, createdBy };
  }

  private async hasEditAccess(mapId: string, ownerId: string | null): Promise<boolean> {
    const userId = this.session?.user?.uid;
    if (!userId) return false;
    if (ownerId && ownerId === userId) return true;
    if (!this.db) return false;
    try {
      const { doc, getDoc } = await loadFirebaseModule<typeof import('firebase/firestore')>('firebase-firestore');
      const shareRef = doc(this.db, 'shares', `${mapId}_${userId}`);
      const shareSnap = await getDoc(shareRef);
      if (!shareSnap.exists()) return false;
      const role = (shareSnap.get('role') as string | null) ?? null;
      return role === 'editor';
    } catch (err) {
      if (isPermissionError(err)) return false;
      throw err;
    }
  }

  async publish(moduleId: string): Promise<void> {
    if (!this.db) throw new Error('Firestore is not initialized.');
    const { doc, getDoc, setDoc } = await loadFirebaseModule<typeof import('firebase/firestore')>('firebase-firestore');
    const mapRef = doc(this.db, 'maps', moduleId);
    const mapSnap = await getDoc(mapRef);
    const now = Date.now();
    const data = (mapSnap.exists() ? mapSnap.data() : null) as FirestoreModuleDoc | null;
    const publishedVersionId = data?.latestVersionId ?? data?.publishedVersionId ?? null;
    const publishPayload = { visibility: 'public', publishedVersionId, updatedAt: now };
    await this.writeWithDetail(
      'publishing module',
      `maps/${moduleId}`,
      publishPayload,
      () => setDoc(mapRef, publishPayload, { merge: true }),
    );
    const listingRef = doc(this.db, 'publicListings', moduleId);
    const listingPayload = {
      title: data?.title ?? '',
      summary: data?.summary ?? '',
      ownerId: data?.ownerId ?? this.session?.user?.uid ?? 'anonymous',
      updatedAt: now,
      publishedVersionId,
    };
    await this.writeWithDetail(
      'publishing listing',
      `publicListings/${moduleId}`,
      listingPayload,
      () => setDoc(listingRef, listingPayload, { merge: true }),
    );
  }

  async share(moduleId: string, email: string, role: 'viewer' | 'editor' = 'viewer'): Promise<void> {
    if (!this.db) throw new Error('Firestore is not initialized.');
    const userId = await this.resolveUserByEmail(email.trim());
    if (!userId) {
      throw new Error('User not found. Ask them to sign up first.');
    }
    const { doc, setDoc } = await loadFirebaseModule<typeof import('firebase/firestore')>('firebase-firestore');
    const now = Date.now();
    const shareId = `${moduleId}_${userId}`;
    const shareRef = doc(this.db, 'shares', shareId);
    const sharePayload = {
      mapId: moduleId,
      userId,
      role,
      addedAt: now,
      addedBy: this.session?.user?.uid ?? 'anonymous',
    };
    await this.writeWithDetail(
      'sharing module',
      `shares/${shareId}`,
      sharePayload,
      () => setDoc(shareRef, sharePayload, { merge: true }),
    );
  }

  private getActorDescription(): string {
    const userId = this.session?.user?.uid ?? 'anonymous';
    const email = this.session?.user?.email ?? 'unknown email';
    return `${userId} (${email})`;
  }

  private formatPayloadSummary(payload: unknown): string {
    if (!payload || typeof payload !== 'object') {
      return String(payload);
    }
    const keys = Object.keys(payload as Record<string, unknown>);
    if (keys.length === 0) return 'empty object';
    const preview: Record<string, unknown> = {};
    for (const key of keys) {
      preview[key] = (payload as Record<string, unknown>)[key];
      if (Object.keys(preview).length >= 5) break;
    }
    return JSON.stringify(preview);
  }

  private async writeWithDetail<T>(
    operation: string,
    refPath: string,
    payload: unknown,
    writer: () => Promise<T>,
  ): Promise<T> {
    try {
      return await writer();
    } catch (err) {
      if (isPermissionError(err)) {
        const actor = this.getActorDescription();
        const payloadSummary = this.formatPayloadSummary(payload);
        const errorMessage = (err as { message?: string }).message ?? String(err);
        const errorCode = (err as { code?: string }).code ?? 'unknown-code';
        throw new Error(
          `Missing or insufficient permissions while ${operation} at ${refPath} as ${actor}. ` +
            `Payload: ${payloadSummary}. Firebase error ${errorCode}: ${errorMessage}`,
        );
      }
      throw err;
    }
  }

  private async resolveUserByEmail(email: string): Promise<string | null> {
    if (!email) return null;
    if (!this.functions) return email.toLowerCase();
    try {
      const { httpsCallable } = await loadFirebaseModule<typeof import('firebase/functions')>('firebase-functions');
      const callable = httpsCallable<{ email: string }, ShareLookupResponse>(this.functions, 'resolveUserByEmail');
      const res = await callable({ email });
      return res.data?.uid ?? null;
    } catch (err) {
      console.warn('Email lookup failed; falling back to manual share.', err);
      return email.toLowerCase();
    }
  }

  private mapDocToSummary(id: string, data: FirestoreModuleDoc, isPublic = false): ModuleSummary {
    return {
      id,
      title: (data.title as string) ?? '',
      summary: (data.summary as string) ?? '',
      visibility: data.visibility ?? (isPublic ? 'public' : 'private'),
      ownerId: (data.ownerId as string) ?? 'unknown',
      updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
      publishedVersionId: (data.publishedVersionId as string | null | undefined) ?? null,
    };
  }

  private async safeGetDoc(
    col: import('firebase/firestore').CollectionReference,
    id: string,
  ): Promise<FirestoreModuleDoc | null> {
    const { doc, getDoc } = await loadFirebaseModule<typeof import('firebase/firestore')>('firebase-firestore');
    const ref = doc(col, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as FirestoreModuleDoc;
  }
}

function createId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) {
    return uuid;
  }
  // Use hyphen instead of underscore to avoid ambiguity when splitting IDs in Firestore rules
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

export function isPermissionError(err: unknown): boolean {
  const code = (err as { code?: string }).code;
  if (code === 'permission-denied' || code === 'PERMISSION_DENIED') {
    return true;
  }
  const message = (err as { message?: string }).message?.toLowerCase();
  if (message?.includes('missing or insufficient permissions')) return true;
  return message?.includes('do not have edit access to this module') ?? false;
}

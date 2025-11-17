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
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    const { getFunctions } = await import('firebase/functions');
    const appName = 'dustland-ack';
    const existing = getApps().find(app => app.name === appName);
    const app = existing ?? initializeApp(session.bootstrap.config, appName);
    this.db = getFirestore(app);
    this.functions = getFunctions(app);
  }

  async listMine(): Promise<ModuleSummary[]> {
    const userId = this.session?.user?.uid;
    if (!userId || !this.db) return [];
    const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    const col = collection(this.db, 'maps');
    const q = query(col, where('ownerId', '==', userId), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(doc => this.mapDocToSummary(doc.id, doc.data() as FirestoreModuleDoc));
  }

  async listShared(): Promise<ModuleSummary[]> {
    const userId = this.session?.user?.uid;
    if (!userId || !this.db) return [];
    const { collection, getDocs, query, where } = await import('firebase/firestore');
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
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const listings = collection(this.db, 'publicListings');
    const snap = await getDocs(query(listings, orderBy('updatedAt', 'desc')));
    return snap.docs.map(doc => this.mapDocToSummary(doc.id, doc.data() as FirestoreModuleDoc, true));
  }

  async loadVersion(moduleId: string): Promise<ModuleVersion | null> {
    if (!this.db) return null;
    const { doc, getDoc } = await import('firebase/firestore');
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
    const { doc, setDoc } = await import('firebase/firestore');
    const mapId = moduleId ?? createId('map');
    const versionId = createId('version');
    const now = Date.now();
    const createdBy = this.session?.user?.uid ?? 'anonymous';
    const ownerId = this.session?.user?.uid ?? 'anonymous';
    const versionRef = doc(this.db, 'mapVersions', `${mapId}_${versionId}`);
    await setDoc(versionRef, { moduleId: mapId, versionId, payload, createdAt: now, createdBy });
    const mapRef = doc(this.db, 'maps', mapId);
    await setDoc(
      mapRef,
      {
        ownerId,
        visibility: 'private',
        updatedAt: now,
        latestVersionId: versionId,
        title: (payload as { name?: string }).name ?? '',
        summary: (payload as { summary?: string }).summary ?? '',
      },
      { merge: true },
    );
    return { moduleId: mapId, versionId, payload, createdAt: now, createdBy };
  }

  async publish(moduleId: string): Promise<void> {
    if (!this.db) throw new Error('Firestore is not initialized.');
    const { doc, getDoc, setDoc } = await import('firebase/firestore');
    const mapRef = doc(this.db, 'maps', moduleId);
    const mapSnap = await getDoc(mapRef);
    const now = Date.now();
    const data = (mapSnap.exists() ? mapSnap.data() : null) as FirestoreModuleDoc | null;
    const publishedVersionId = data?.latestVersionId ?? data?.publishedVersionId ?? null;
    await setDoc(mapRef, { visibility: 'public', publishedVersionId, updatedAt: now }, { merge: true });
    const listingRef = doc(this.db, 'publicListings', moduleId);
    await setDoc(
      listingRef,
      {
        title: data?.title ?? '',
        summary: data?.summary ?? '',
        ownerId: data?.ownerId ?? this.session?.user?.uid ?? 'anonymous',
        updatedAt: now,
        publishedVersionId,
      },
      { merge: true },
    );
  }

  async share(moduleId: string, email: string, role: 'viewer' | 'editor' = 'viewer'): Promise<void> {
    if (!this.db) throw new Error('Firestore is not initialized.');
    const userId = await this.resolveUserByEmail(email.trim());
    if (!userId) {
      throw new Error('User not found. Ask them to sign up first.');
    }
    const { doc, setDoc } = await import('firebase/firestore');
    const now = Date.now();
    const shareId = `${moduleId}_${userId}`;
    const shareRef = doc(this.db, 'shares', shareId);
    await setDoc(
      shareRef,
      {
        mapId: moduleId,
        userId,
        role,
        addedAt: now,
        addedBy: this.session?.user?.uid ?? 'anonymous',
      },
      { merge: true },
    );
  }

  private async resolveUserByEmail(email: string): Promise<string | null> {
    if (!email) return null;
    if (!this.functions) return email.toLowerCase();
    try {
      const { httpsCallable } = await import('firebase/functions');
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
    const { doc, getDoc } = await import('firebase/firestore');
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
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

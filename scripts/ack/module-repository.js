import { FIREBASE_APP_NAME } from './firebase-clients.js';
export class NullModuleRepository {
    async init(_session) {
        // No-op
    }
    async listMine() {
        return [];
    }
    async listShared() {
        return [];
    }
    async listPublic() {
        return [];
    }
    async loadVersion(_moduleId) {
        return null;
    }
    async saveDraft(moduleId, payload) {
        const now = Date.now();
        return {
            moduleId: moduleId ?? createId('module'),
            versionId: createId('version'),
            payload,
            createdAt: now,
            createdBy: 'offline',
        };
    }
    async publish(_moduleId) {
        // No-op
    }
    async share(_moduleId, _email) {
        // No-op
    }
}
export class FirestoreModuleRepository {
    constructor() {
        this.db = null;
        this.functions = null;
        this.session = null;
    }
    async init(session) {
        if (session.bootstrap.status !== 'firebase-ready') {
            throw new Error('Firebase config missing.');
        }
        this.session = session;
        const { initializeApp, getApps } = await import('firebase/app');
        const { getFirestore } = await import('firebase/firestore');
        const { getFunctions } = await import('firebase/functions');
        const existing = getApps().find(app => app.name === FIREBASE_APP_NAME);
        const app = existing ?? initializeApp(session.bootstrap.config, FIREBASE_APP_NAME);
        this.db = getFirestore(app);
        this.functions = getFunctions(app);
    }
    async listMine() {
        const userId = this.session?.user?.uid;
        if (!userId || !this.db)
            return [];
        const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
        const col = collection(this.db, 'maps');
        const q = query(col, where('ownerId', '==', userId), orderBy('updatedAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map(doc => this.mapDocToSummary(doc.id, doc.data()));
    }
    async listShared() {
        const userId = this.session?.user?.uid;
        if (!userId || !this.db)
            return [];
        const { collection, getDocs, query, where } = await import('firebase/firestore');
        const sharesCol = collection(this.db, 'shares');
        const shareSnap = await getDocs(query(sharesCol, where('userId', '==', userId)));
        if (shareSnap.empty)
            return [];
        const mapIds = shareSnap.docs.map(doc => doc.data().mapId).filter(Boolean);
        const mapsCol = collection(this.db, 'maps');
        const summaries = [];
        for (const mapId of mapIds) {
            const mapDoc = await this.safeGetDoc(mapsCol, mapId);
            if (mapDoc) {
                summaries.push(this.mapDocToSummary(mapId, mapDoc));
            }
        }
        return summaries;
    }
    async listPublic() {
        if (!this.db)
            return [];
        const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
        const listings = collection(this.db, 'publicListings');
        const snap = await getDocs(query(listings, orderBy('updatedAt', 'desc')));
        return snap.docs.map(doc => this.mapDocToSummary(doc.id, doc.data(), true));
    }
    async loadVersion(moduleId) {
        if (!this.db)
            return null;
        const { doc, getDoc } = await import('firebase/firestore');
        const mapRef = doc(this.db, 'maps', moduleId);
        const mapSnap = await getDoc(mapRef);
        if (!mapSnap.exists())
            return null;
        const mapData = mapSnap.data();
        const versionId = mapData.latestVersionId ?? mapData.publishedVersionId;
        if (!versionId)
            return null;
        const versionRef = doc(this.db, 'mapVersions', `${moduleId}_${versionId}`);
        const versionSnap = await getDoc(versionRef);
        if (!versionSnap.exists())
            return null;
        const now = Date.now();
        const createdAt = typeof versionSnap.get('createdAt') === 'number' ? versionSnap.get('createdAt') : now;
        const createdBy = versionSnap.get('createdBy') ?? 'unknown';
        return {
            moduleId,
            versionId,
            payload: versionSnap.get('payload'),
            createdAt,
            createdBy,
        };
    }
    async saveDraft(moduleId, payload) {
        if (!this.db)
            throw new Error('Firestore is not initialized.');
        const { doc, setDoc } = await import('firebase/firestore');
        const mapId = moduleId ?? createId('map');
        const versionId = createId('version');
        const now = Date.now();
        const createdBy = this.session?.user?.uid ?? 'anonymous';
        const ownerId = this.session?.user?.uid ?? 'anonymous';
        const versionRef = doc(this.db, 'mapVersions', `${mapId}_${versionId}`);
        await setDoc(versionRef, { moduleId: mapId, versionId, payload, createdAt: now, createdBy });
        const mapRef = doc(this.db, 'maps', mapId);
        await setDoc(mapRef, {
            ownerId,
            visibility: 'private',
            updatedAt: now,
            latestVersionId: versionId,
            title: payload.name ?? '',
            summary: payload.summary ?? '',
        }, { merge: true });
        return { moduleId: mapId, versionId, payload, createdAt: now, createdBy };
    }
    async publish(moduleId) {
        if (!this.db)
            throw new Error('Firestore is not initialized.');
        const { doc, getDoc, setDoc } = await import('firebase/firestore');
        const mapRef = doc(this.db, 'maps', moduleId);
        const mapSnap = await getDoc(mapRef);
        const now = Date.now();
        const data = (mapSnap.exists() ? mapSnap.data() : null);
        const publishedVersionId = data?.latestVersionId ?? data?.publishedVersionId ?? null;
        await setDoc(mapRef, { visibility: 'public', publishedVersionId, updatedAt: now }, { merge: true });
        const listingRef = doc(this.db, 'publicListings', moduleId);
        await setDoc(listingRef, {
            title: data?.title ?? '',
            summary: data?.summary ?? '',
            ownerId: data?.ownerId ?? this.session?.user?.uid ?? 'anonymous',
            updatedAt: now,
            publishedVersionId,
        }, { merge: true });
    }
    async share(moduleId, email, role = 'viewer') {
        if (!this.db)
            throw new Error('Firestore is not initialized.');
        const userId = await this.resolveUserByEmail(email.trim());
        if (!userId) {
            throw new Error('User not found. Ask them to sign up first.');
        }
        const { doc, setDoc } = await import('firebase/firestore');
        const now = Date.now();
        const shareId = `${moduleId}_${userId}`;
        const shareRef = doc(this.db, 'shares', shareId);
        await setDoc(shareRef, {
            mapId: moduleId,
            userId,
            role,
            addedAt: now,
            addedBy: this.session?.user?.uid ?? 'anonymous',
        }, { merge: true });
    }
    async resolveUserByEmail(email) {
        if (!email)
            return null;
        if (!this.functions)
            return email.toLowerCase();
        try {
            const { httpsCallable } = await import('firebase/functions');
            const callable = httpsCallable(this.functions, 'resolveUserByEmail');
            const res = await callable({ email });
            return res.data?.uid ?? null;
        }
        catch (err) {
            console.warn('Email lookup failed; falling back to manual share.', err);
            return email.toLowerCase();
        }
    }
    mapDocToSummary(id, data, isPublic = false) {
        return {
            id,
            title: data.title ?? '',
            summary: data.summary ?? '',
            visibility: data.visibility ?? (isPublic ? 'public' : 'private'),
            ownerId: data.ownerId ?? 'unknown',
            updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
            publishedVersionId: data.publishedVersionId ?? null,
        };
    }
    async safeGetDoc(col, id) {
        const { doc, getDoc } = await import('firebase/firestore');
        const ref = doc(col, id);
        const snap = await getDoc(ref);
        if (!snap.exists())
            return null;
        return snap.data();
    }
}
function createId(prefix) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) {
        return uuid;
    }
    const random = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${random}`;
}

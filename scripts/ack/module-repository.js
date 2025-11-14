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
}
function createId(prefix) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) {
        return uuid;
    }
    const random = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${random}`;
}

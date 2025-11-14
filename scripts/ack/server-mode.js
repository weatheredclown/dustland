function readFeatureFlags(globalObject) {
    const raw = globalObject.DUSTLAND_FEATURES;
    if (!raw || typeof raw !== 'object') {
        return {};
    }
    return { ...raw };
}
function readFirebaseConfig(globalObject) {
    const raw = globalObject.DUSTLAND_FIREBASE;
    if (!raw || typeof raw !== 'object') {
        return null;
    }
    const { projectId, ...rest } = raw;
    if (typeof projectId !== 'string' || projectId.trim() === '') {
        return null;
    }
    return { projectId, ...rest };
}
export function detectServerMode(globalObject = window) {
    const features = readFeatureFlags(globalObject);
    if (!features.serverMode) {
        return { status: 'disabled', reason: 'feature-flag', features };
    }
    const firebaseConfig = readFirebaseConfig(globalObject);
    if (!firebaseConfig) {
        return { status: 'disabled', reason: 'missing-config', features };
    }
    if (!isFirebaseConfigValid(firebaseConfig)) {
        return { status: 'disabled', reason: 'invalid-config', features };
    }
    return { status: 'firebase-ready', config: firebaseConfig, features };
}
function isFirebaseConfigValid(config) {
    if (!config.projectId) {
        return false;
    }
    const requiredKeys = ['apiKey', 'appId', 'authDomain'];
    for (const key of requiredKeys) {
        const value = config[key];
        if (typeof value !== 'string' || value.trim() === '') {
            return false;
        }
    }
    return true;
}

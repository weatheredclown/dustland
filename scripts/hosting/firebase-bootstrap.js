import { isFirebaseConfigValid } from '../ack/server-mode.js';
function isHostedConfigDocument(value) {
    return !!value && typeof value === 'object';
}
const CONFIG_PATH = './firebase-config.json';
export async function bootstrapHostedFirebase(globalObject = globalThis) {
    const features = ensureFeatureContainer(globalObject);
    if (!shouldFetchHostedConfig(globalObject)) {
        return;
    }
    const payload = await fetchHostedConfig(globalObject);
    if (!payload) {
        return;
    }
    const parsed = parseHostedConfig(payload);
    if (!parsed) {
        return;
    }
    if (parsed.featureFlags) {
        applyFeatureFlags(features, parsed.featureFlags);
    }
    applyFirebaseConfig(globalObject, features, parsed.firebaseConfig);
}
function ensureFeatureContainer(globalObject) {
    if (!globalObject.DUSTLAND_FEATURES || typeof globalObject.DUSTLAND_FEATURES !== 'object') {
        globalObject.DUSTLAND_FEATURES = {};
    }
    return globalObject.DUSTLAND_FEATURES;
}
function shouldFetchHostedConfig(globalObject) {
    const protocol = globalObject.location?.protocol ?? '';
    return protocol.startsWith('http');
}
async function fetchHostedConfig(globalObject) {
    const fetchFn = globalObject.fetch ?? globalThis.fetch;
    if (typeof fetchFn !== 'function') {
        return null;
    }
    try {
        const response = await fetchFn(CONFIG_PATH, { cache: 'no-store' });
        if (!response?.ok) {
            return null;
        }
        const json = await response.json();
        return isHostedConfigDocument(json) ? json : null;
    }
    catch (error) {
        console.warn('Skipping hosted Firebase config – fetch failed.', error);
        return null;
    }
}
function parseHostedConfig(payload) {
    if (!payload) {
        return null;
    }
    const firebaseSource = selectFirebaseSource(payload);
    const firebaseConfig = extractFirebaseConfig(firebaseSource);
    const featureFlags = extractFeatureFlags(payload);
    if (!firebaseConfig && !featureFlags) {
        return null;
    }
    return { firebaseConfig, featureFlags };
}
function selectFirebaseSource(document) {
    if (document.firebase && typeof document.firebase === 'object') {
        return document.firebase;
    }
    return document;
}
function extractFirebaseConfig(raw) {
    if (!raw) {
        return null;
    }
    if (!isFirebaseConfigValid(raw)) {
        return null;
    }
    return { ...raw };
}
function extractFeatureFlags(document) {
    if (!document.features || typeof document.features !== 'object') {
        return null;
    }
    return { ...document.features };
}
function applyFeatureFlags(target, nextFlags) {
    Object.assign(target, nextFlags);
}
function applyFirebaseConfig(globalObject, features, firebaseConfig) {
    const existingConfig = globalObject.DUSTLAND_FIREBASE;
    const hasExisting = !!existingConfig && isFirebaseConfigValid(existingConfig);
    const nextConfig = firebaseConfig ?? (hasExisting ? existingConfig : null);
    if (!nextConfig || !isFirebaseConfigValid(nextConfig)) {
        return;
    }
    globalObject.DUSTLAND_FIREBASE = nextConfig;
    if (typeof features.serverMode !== 'boolean') {
        features.serverMode = true;
    }
}

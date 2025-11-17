import { isFirebaseConfigValid, type DustlandFeatureFlags, type DustlandFirebaseBootstrap } from '../ack/server-mode.js';

type HostingLocation = { protocol?: string };

type HostingGlobal = {
  location?: HostingLocation;
  DUSTLAND_FEATURES?: DustlandFeatureFlags | null;
  DUSTLAND_FIREBASE?: DustlandFirebaseBootstrap | null;
  fetch?: typeof fetch;
};

type HostedConfigDocument = {
  firebase?: Record<string, unknown>;
  features?: DustlandFeatureFlags;
  [key: string]: unknown;
};

type ParsedHostedConfig = {
  firebaseConfig: DustlandFirebaseBootstrap | null;
  featureFlags: DustlandFeatureFlags | null;
};

const CONFIG_PATH = './firebase-config.json';

export async function bootstrapHostedFirebase(globalObject: HostingGlobal = globalThis as HostingGlobal): Promise<void> {
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

function ensureFeatureContainer(globalObject: HostingGlobal): DustlandFeatureFlags {
  if (!globalObject.DUSTLAND_FEATURES || typeof globalObject.DUSTLAND_FEATURES !== 'object') {
    globalObject.DUSTLAND_FEATURES = {};
  }
  return globalObject.DUSTLAND_FEATURES;
}

function shouldFetchHostedConfig(globalObject: HostingGlobal): boolean {
  const protocol = globalObject.location?.protocol ?? '';
  return protocol.startsWith('http');
}

async function fetchHostedConfig(globalObject: HostingGlobal): Promise<unknown | null> {
  const fetchFn = globalObject.fetch ?? globalThis.fetch;
  if (typeof fetchFn !== 'function') {
    return null;
  }
  try {
    const response = await fetchFn(CONFIG_PATH, { cache: 'no-store' });
    if (!response?.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.warn('Skipping hosted Firebase config – fetch failed.', error);
    return null;
  }
}

function parseHostedConfig(payload: unknown): ParsedHostedConfig | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }
  const document = payload as HostedConfigDocument;
  const firebaseSource = selectFirebaseSource(document);
  const firebaseConfig = extractFirebaseConfig(firebaseSource);
  const featureFlags = extractFeatureFlags(document);
  if (!firebaseConfig && !featureFlags) {
    return null;
  }
  return { firebaseConfig, featureFlags };
}

function selectFirebaseSource(document: HostedConfigDocument): Record<string, unknown> | null {
  if (document.firebase && typeof document.firebase === 'object') {
    return document.firebase;
  }
  return document as Record<string, unknown>;
}

function extractFirebaseConfig(raw: Record<string, unknown> | null): DustlandFirebaseBootstrap | null {
  if (!raw) {
    return null;
  }
  if (!isFirebaseConfigValid(raw as DustlandFirebaseBootstrap)) {
    return null;
  }
  return { ...raw } as DustlandFirebaseBootstrap;
}

function extractFeatureFlags(document: HostedConfigDocument): DustlandFeatureFlags | null {
  if (!document.features || typeof document.features !== 'object') {
    return null;
  }
  return { ...document.features } as DustlandFeatureFlags;
}

function applyFeatureFlags(target: DustlandFeatureFlags, nextFlags: DustlandFeatureFlags): void {
  Object.assign(target, nextFlags);
}

function applyFirebaseConfig(
  globalObject: HostingGlobal,
  features: DustlandFeatureFlags,
  firebaseConfig: DustlandFirebaseBootstrap | null,
): void {
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

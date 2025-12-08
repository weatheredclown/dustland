import type {
  DustlandFeatureFlags,
  DustlandFirebaseBootstrap,
} from './server-mode-types.js';

type DustlandWindow = Window & {
  DUSTLAND_FEATURES?: DustlandFeatureFlags | null;
  DUSTLAND_FIREBASE?: Record<string, unknown> | null;
};

export type ServerModeBootstrap =
  | {
      status: 'disabled';
      reason: 'feature-flag' | 'missing-config' | 'invalid-config';
      features: DustlandFeatureFlags;
    }
  | {
      status: 'firebase-ready';
      config: DustlandFirebaseBootstrap;
      features: DustlandFeatureFlags;
    };

function readFeatureFlags(globalObject: DustlandWindow): DustlandFeatureFlags {
  const raw = globalObject.DUSTLAND_FEATURES;
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  return { ...raw } as DustlandFeatureFlags;
}

function readFirebaseConfig(globalObject: DustlandWindow): DustlandFirebaseBootstrap | null {
  const raw = globalObject.DUSTLAND_FIREBASE;
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const { projectId, ...rest } = raw as Record<string, unknown>;
  if (typeof projectId !== 'string' || projectId.trim() === '') {
    return null;
  }
  return { projectId, ...rest } as DustlandFirebaseBootstrap;
}

export function detectServerMode(globalObject: DustlandWindow = window as DustlandWindow): ServerModeBootstrap {
  const features = readFeatureFlags(globalObject);
  const firebaseConfig = readFirebaseConfig(globalObject);
  const serverModeEnabled = typeof features.serverMode === 'boolean' ? features.serverMode : !!firebaseConfig;
  const normalizedFeatures: DustlandFeatureFlags = { ...features, serverMode: serverModeEnabled };

  if (!serverModeEnabled) {
    return { status: 'disabled', reason: 'feature-flag', features: normalizedFeatures };
  }

  if (!firebaseConfig) {
    return { status: 'disabled', reason: 'missing-config', features: normalizedFeatures };
  }

  if (!isFirebaseConfigValid(firebaseConfig)) {
    return { status: 'disabled', reason: 'invalid-config', features: normalizedFeatures };
  }

  return { status: 'firebase-ready', config: firebaseConfig, features: normalizedFeatures };
}

export function isFirebaseConfigValid(config: DustlandFirebaseBootstrap): boolean {
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

export type { DustlandFeatureFlags, DustlandFirebaseBootstrap } from './server-mode-types.js';

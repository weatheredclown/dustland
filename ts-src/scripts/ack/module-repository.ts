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
}

function createId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) {
    return uuid;
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

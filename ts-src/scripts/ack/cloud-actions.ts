import { bootstrapHostedFirebase } from '../hosting/firebase-bootstrap.js';
import { FirestoreModuleRepository, type ModuleSummary } from './module-repository.js';
import { ServerSession } from './server-session.js';

type ExportFn = () => { data: unknown };

type AckGlobals = typeof globalThis & {
  moduleData?: { id?: string; name?: string; summary?: string };
  exportModulePayload?: ExportFn;
  applyLoadedModule?: (data: unknown) => void;
};

async function initCloudActions(): Promise<void> {
  const saveBtn = document.getElementById('cloudSave') as HTMLButtonElement | null;
  const loadBtn = document.getElementById('cloudLoad') as HTMLButtonElement | null;
  const publishBtn = document.getElementById('cloudPublish') as HTMLButtonElement | null;
  const shareBtn = document.getElementById('cloudShare') as HTMLButtonElement | null;
  if (!saveBtn || !publishBtn || !shareBtn || !loadBtn) return;

  const globals = globalThis as AckGlobals;
  const repo = new FirestoreModuleRepository();
  const session = ServerSession.get();
  let ready = false;
  let lastUserId: string | null = null;
  let unavailableMessage = 'Cloud saves unavailable. Sign in to enable them.';
  let bootstrapFailed = false;
  const titles = new Map<HTMLButtonElement, string>([
    [saveBtn, saveBtn.title],
    [loadBtn, loadBtn.title],
    [publishBtn, publishBtn.title],
    [shareBtn, shareBtn.title],
  ]);

  const updateButtonStates = (enabled: boolean): void => {
    const btns = [saveBtn, loadBtn, publishBtn, shareBtn];
    const message = enabled ? '' : unavailableMessage;
    btns.forEach(btn => {
      btn.hidden = false;
      btn.disabled = false;
      if (enabled) {
        btn.removeAttribute('aria-disabled');
        btn.classList.remove('cloud-action-disabled');
        btn.title = titles.get(btn) ?? btn.title;
      } else {
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('cloud-action-disabled');
        btn.title = message || btn.title;
      }
    });
  };

  const requireReady = (): boolean => {
    if (ready) return true;
    alert(unavailableMessage);
    return false;
  };

  updateButtonStates(false);

  try {
    await bootstrapHostedFirebase();
  } catch (err) {
    console.warn('Cloud actions unavailable', err);
    unavailableMessage = 'Cloud actions unavailable: ' + (err as Error).message;
    updateButtonStates(false);
    bootstrapFailed = true;
  }

  if (!bootstrapFailed) {
    session.subscribe(async snapshot => {
      const canUseCloud = snapshot.status === 'authenticated' && snapshot.bootstrap.status === 'firebase-ready';
      lastUserId = snapshot.user?.uid ?? null;
      if (canUseCloud && !ready) {
        try {
          await repo.init(snapshot);
          ready = true;
          updateButtonStates(true);
        } catch (err) {
          console.warn('Cloud actions unavailable', err);
          unavailableMessage = 'Cloud actions unavailable: ' + (err as Error).message;
          updateButtonStates(false);
        }
      } else if (!canUseCloud) {
        ready = false;
        if (snapshot.bootstrap.status !== 'firebase-ready') {
          unavailableMessage = 'Cloud saves require a configured server connection.';
        } else if (snapshot.status === 'error') {
          unavailableMessage = 'Cloud sign-in failed: ' + (snapshot.error?.message ?? 'Unknown issue');
        } else {
          unavailableMessage = 'Sign in to enable cloud saves.';
        }
        updateButtonStates(false);
      }
    });
  }

  const listCloudModules = async (): Promise<ModuleSummary[]> => {
    const lists = await Promise.all([repo.listMine(), repo.listShared(), repo.listPublic()]);
    return lists
      .flat()
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  };

  const pickCloudModule = async (): Promise<ModuleSummary | null> => {
    try {
      const modules = await listCloudModules();
      if (!modules.length) {
        alert('No cloud modules found. Save or publish one first.');
        return null;
      }
      const menu = modules
        .map((m, idx) => {
          const timestamp = m.updatedAt ? new Date(m.updatedAt).toLocaleString() : 'unknown time';
          const name = m.title?.trim() || 'Untitled Map';
          const source = m.visibility === 'public' ? 'Public' : m.ownerId === lastUserId ? 'Mine' : 'Shared';
          return `${idx + 1}. ${name} — ${source ?? 'cloud'} (${timestamp})`;
        })
        .join('\n');
      const choice = prompt('Load a cloud module by number:\n' + menu);
      if (!choice) return null;
      const index = parseInt(choice, 10);
      if (!Number.isFinite(index) || index < 1 || index > modules.length) {
        alert('Invalid selection.');
        return null;
      }
      return modules[index - 1];
    } catch (err) {
      alert('Unable to list cloud modules: ' + (err as Error).message);
      return null;
    }
  };

  const loadFromCloud = async (): Promise<void> => {
    if (!requireReady()) return;
    const target = await pickCloudModule();
    if (!target) return;
    try {
      const version = await repo.loadVersion(target.id);
      if (!version) {
        alert('No saved version found for that module.');
        return;
      }
      if (typeof globals.applyLoadedModule !== 'function') {
        alert('Unable to load module into the editor.');
        return;
      }
      globals.applyLoadedModule(version.payload);
      if (globals.moduleData) {
        globals.moduleData.id = version.moduleId;
        globals.moduleData.name = target.title ?? globals.moduleData.name;
        if (target.summary) globals.moduleData.summary = target.summary;
      }
      alert('Loaded cloud module: ' + (target.title || target.id));
    } catch (err) {
      alert('Cloud load failed: ' + (err as Error).message);
    }
  };

  saveBtn.addEventListener('click', async () => {
    if (!requireReady()) return;
    const exporter = globals.exportModulePayload;
    if (typeof exporter !== 'function') {
      alert('Unable to export the current module.');
      return;
    }
    try {
      const payload = exporter().data;
      const moduleId = globals.moduleData?.id ?? null;
      const version = await repo.saveDraft(moduleId, payload);
      if (globals.moduleData) globals.moduleData.id = version.moduleId;
      alert('Draft saved to the cloud.');
    } catch (err) {
      alert('Cloud save failed: ' + (err as Error).message);
    }
  });

  loadBtn.addEventListener('click', () => {
    void loadFromCloud();
  });

  publishBtn.addEventListener('click', async () => {
    if (!requireReady()) return;
    const mapId = globals.moduleData?.id;
    if (!mapId) {
      alert('Save a draft before publishing.');
      return;
    }
    try {
      await repo.publish(mapId);
      alert('Module published.');
    } catch (err) {
      alert('Publish failed: ' + (err as Error).message);
    }
  });

  shareBtn.addEventListener('click', async () => {
    if (!requireReady()) return;
    const mapId = globals.moduleData?.id;
    if (!mapId) {
      alert('Save a draft before sharing.');
      return;
    }
    const email = prompt('Invite collaborator by email:');
    if (!email) return;
    try {
      await repo.share?.(mapId, email.trim(), 'editor');
      alert('Share invitation recorded.');
    } catch (err) {
      alert('Share failed: ' + (err as Error).message);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCloudActions, { once: true });
} else {
  initCloudActions();
}

import { FirestoreModuleRepository } from './module-repository.js';
import { ServerSession } from './server-session.js';

type ExportFn = () => { data: unknown };

type AckGlobals = typeof globalThis & {
  moduleData?: { id?: string; name?: string; summary?: string };
  exportModulePayload?: ExportFn;
};

function initCloudActions(): void {
  const saveBtn = document.getElementById('cloudSave') as HTMLButtonElement | null;
  const publishBtn = document.getElementById('cloudPublish') as HTMLButtonElement | null;
  const shareBtn = document.getElementById('cloudShare') as HTMLButtonElement | null;
  if (!saveBtn || !publishBtn || !shareBtn) return;

  const globals = globalThis as AckGlobals;
  const repo = new FirestoreModuleRepository();
  const session = ServerSession.get();
  let ready = false;

  const toggleButtons = (enabled: boolean): void => {
    saveBtn.hidden = !enabled;
    publishBtn.hidden = !enabled;
    shareBtn.hidden = !enabled;
    saveBtn.disabled = !enabled;
    publishBtn.disabled = !enabled;
    shareBtn.disabled = !enabled;
  };

  toggleButtons(false);

  session.subscribe(async snapshot => {
    const canUseCloud = snapshot.status === 'authenticated' && snapshot.bootstrap.status === 'firebase-ready';
    if (canUseCloud && !ready) {
      try {
        await repo.init(snapshot);
        ready = true;
        toggleButtons(true);
      } catch (err) {
        console.warn('Cloud actions unavailable', err);
        toggleButtons(false);
      }
    } else if (!canUseCloud) {
      toggleButtons(false);
    }
  });

  saveBtn.addEventListener('click', async () => {
    if (!ready) return;
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

  publishBtn.addEventListener('click', async () => {
    if (!ready) return;
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
    if (!ready) return;
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

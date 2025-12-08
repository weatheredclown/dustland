import { FirestoreModuleRepository } from './module-repository.js';
import { ServerSession } from './server-session.js';
function initCloudActions() {
    const saveBtn = document.getElementById('cloudSave');
    const loadBtn = document.getElementById('cloudLoad');
    const publishBtn = document.getElementById('cloudPublish');
    const shareBtn = document.getElementById('cloudShare');
    if (!saveBtn || !publishBtn || !shareBtn || !loadBtn)
        return;
    const globals = globalThis;
    const repo = new FirestoreModuleRepository();
    const session = ServerSession.get();
    let ready = false;
    let lastUserId = null;
    const toggleButtons = (enabled) => {
        saveBtn.hidden = !enabled;
        loadBtn.hidden = !enabled;
        publishBtn.hidden = !enabled;
        shareBtn.hidden = !enabled;
        saveBtn.disabled = !enabled;
        loadBtn.disabled = !enabled;
        publishBtn.disabled = !enabled;
        shareBtn.disabled = !enabled;
    };
    toggleButtons(false);
    session.subscribe(async (snapshot) => {
        const canUseCloud = snapshot.status === 'authenticated' && snapshot.bootstrap.status === 'firebase-ready';
        lastUserId = snapshot.user?.uid ?? null;
        if (canUseCloud && !ready) {
            try {
                await repo.init(snapshot);
                ready = true;
                toggleButtons(true);
            }
            catch (err) {
                console.warn('Cloud actions unavailable', err);
                toggleButtons(false);
            }
        }
        else if (!canUseCloud) {
            ready = false;
            toggleButtons(false);
        }
    });
    const listCloudModules = async () => {
        const lists = await Promise.all([repo.listMine(), repo.listShared(), repo.listPublic()]);
        return lists
            .flat()
            .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
    };
    const pickCloudModule = async () => {
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
            if (!choice)
                return null;
            const index = parseInt(choice, 10);
            if (!Number.isFinite(index) || index < 1 || index > modules.length) {
                alert('Invalid selection.');
                return null;
            }
            return modules[index - 1];
        }
        catch (err) {
            alert('Unable to list cloud modules: ' + err.message);
            return null;
        }
    };
    const loadFromCloud = async () => {
        if (!ready)
            return;
        const target = await pickCloudModule();
        if (!target)
            return;
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
                if (target.summary)
                    globals.moduleData.summary = target.summary;
            }
            alert('Loaded cloud module: ' + (target.title || target.id));
        }
        catch (err) {
            alert('Cloud load failed: ' + err.message);
        }
    };
    saveBtn.addEventListener('click', async () => {
        if (!ready)
            return;
        const exporter = globals.exportModulePayload;
        if (typeof exporter !== 'function') {
            alert('Unable to export the current module.');
            return;
        }
        try {
            const payload = exporter().data;
            const moduleId = globals.moduleData?.id ?? null;
            const version = await repo.saveDraft(moduleId, payload);
            if (globals.moduleData)
                globals.moduleData.id = version.moduleId;
            alert('Draft saved to the cloud.');
        }
        catch (err) {
            alert('Cloud save failed: ' + err.message);
        }
    });
    loadBtn.addEventListener('click', () => {
        void loadFromCloud();
    });
    publishBtn.addEventListener('click', async () => {
        if (!ready)
            return;
        const mapId = globals.moduleData?.id;
        if (!mapId) {
            alert('Save a draft before publishing.');
            return;
        }
        try {
            await repo.publish(mapId);
            alert('Module published.');
        }
        catch (err) {
            alert('Publish failed: ' + err.message);
        }
    });
    shareBtn.addEventListener('click', async () => {
        if (!ready)
            return;
        const mapId = globals.moduleData?.id;
        if (!mapId) {
            alert('Save a draft before sharing.');
            return;
        }
        const email = prompt('Invite collaborator by email:');
        if (!email)
            return;
        try {
            await repo.share?.(mapId, email.trim(), 'editor');
            alert('Share invitation recorded.');
        }
        catch (err) {
            alert('Share failed: ' + err.message);
        }
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCloudActions, { once: true });
}
else {
    initCloudActions();
}

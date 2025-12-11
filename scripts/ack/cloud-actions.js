import { bootstrapHostedFirebase } from '../hosting/firebase-bootstrap.js';
import { FirestoreModuleRepository } from './module-repository.js';
import { ServerSession } from './server-session.js';
async function initCloudActions() {
    const saveBtn = document.getElementById('cloudSave');
    const loadBtn = document.getElementById('cloudLoad');
    const publishBtn = document.getElementById('cloudPublish');
    const shareBtn = document.getElementById('cloudShare');
    const statusEl = document.getElementById('cloudActionStatus');
    if (!saveBtn || !publishBtn || !shareBtn || !loadBtn)
        return;
    const globals = globalThis;
    const repo = new FirestoreModuleRepository();
    const session = ServerSession.get();
    let ready = false;
    let lastUserId = null;
    let lastModuleId = globals.moduleData?.id ?? null;
    let unavailableMessage = 'Cloud saves unavailable. Sign in to enable them.';
    let bootstrapFailed = false;
    const titles = new Map([
        [saveBtn, saveBtn.title],
        [loadBtn, loadBtn.title],
        [publishBtn, publishBtn.title],
        [shareBtn, shareBtn.title],
    ]);
    const labels = new Map([
        [saveBtn, saveBtn.textContent ?? ''],
        [loadBtn, loadBtn.textContent ?? ''],
        [publishBtn, publishBtn.textContent ?? ''],
        [shareBtn, shareBtn.textContent ?? ''],
    ]);
    const setStatus = (message, state = 'info') => {
        if (!statusEl)
            return;
        statusEl.textContent = message;
        if (message) {
            statusEl.dataset.state = state;
            statusEl.hidden = false;
        }
        else {
            delete statusEl.dataset.state;
            statusEl.hidden = true;
        }
    };
    const setBusyState = (button, label) => {
        const baseLabel = labels.get(button) ?? button.textContent ?? '';
        button.textContent = `⏳ ${label}`;
        button.classList.add('is-busy');
        button.disabled = true;
        return () => {
            const defaultLabel = labels.get(button) ?? baseLabel;
            button.classList.remove('is-busy');
            button.textContent = defaultLabel;
            updateButtonStates(ready);
        };
    };
    const updateButtonStates = (enabled) => {
        const btns = [saveBtn, loadBtn, publishBtn, shareBtn];
        const message = enabled ? '' : unavailableMessage;
        btns.forEach(btn => {
            const busy = btn.classList.contains('is-busy');
            btn.hidden = false;
            if (busy) {
                btn.disabled = true;
                btn.setAttribute('aria-disabled', 'true');
                btn.classList.remove('cloud-action-disabled');
            }
            else if (enabled) {
                btn.disabled = false;
                btn.removeAttribute('aria-disabled');
                btn.classList.remove('cloud-action-disabled');
                btn.title = titles.get(btn) ?? btn.title;
            }
            else {
                btn.disabled = false;
                btn.setAttribute('aria-disabled', 'true');
                btn.classList.add('cloud-action-disabled');
                btn.title = message || btn.title;
            }
        });
    };
    const requireReady = () => {
        if (ready)
            return true;
        setStatus(unavailableMessage, 'error');
        alert(unavailableMessage);
        return false;
    };
    updateButtonStates(false);
    try {
        await bootstrapHostedFirebase();
    }
    catch (err) {
        console.warn('Cloud actions unavailable', err);
        unavailableMessage = 'Cloud actions unavailable: ' + err.message;
        setStatus(unavailableMessage, 'error');
        updateButtonStates(false);
        bootstrapFailed = true;
    }
    if (!bootstrapFailed) {
        session.subscribe(async (snapshot) => {
            const canUseCloud = snapshot.status === 'authenticated' && snapshot.bootstrap.status === 'firebase-ready';
            lastUserId = snapshot.user?.uid ?? null;
            if (canUseCloud && !ready) {
                try {
                    await repo.init(snapshot);
                    ready = true;
                    updateButtonStates(true);
                }
                catch (err) {
                    console.warn('Cloud actions unavailable', err);
                    unavailableMessage = 'Cloud actions unavailable: ' + err.message;
                    setStatus(unavailableMessage, 'error');
                    updateButtonStates(false);
                }
            }
            else if (!canUseCloud) {
                ready = false;
                if (snapshot.bootstrap.status !== 'firebase-ready') {
                    unavailableMessage = 'Cloud saves require a configured server connection.';
                }
                else if (snapshot.status === 'error') {
                    unavailableMessage = 'Cloud sign-in failed: ' + (snapshot.error?.message ?? 'Unknown issue');
                }
                else {
                    unavailableMessage = 'Sign in to enable cloud saves.';
                }
                if (snapshot.status === 'error') {
                    setStatus(unavailableMessage, 'error');
                }
                updateButtonStates(false);
            }
        });
    }
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
        if (!requireReady())
            return;
        const stopBusy = setBusyState(loadBtn, 'Loading…');
        setStatus('Fetching cloud modules…');
        try {
            const target = await pickCloudModule();
            if (!target) {
                setStatus('Cloud load canceled.');
                return;
            }
            const version = await repo.loadVersion(target.id);
            if (!version) {
                setStatus('No saved version found for that module.', 'error');
                alert('No saved version found for that module.');
                return;
            }
            if (typeof globals.applyLoadedModule !== 'function') {
                setStatus('Unable to load module into the editor.', 'error');
                alert('Unable to load module into the editor.');
                return;
            }
            globals.applyLoadedModule(version.payload);
            if (globals.moduleData) {
                globals.moduleData.id = version.moduleId;
                globals.moduleData.name = target.title ?? globals.moduleData.name;
                if (target.summary)
                    globals.moduleData.summary = target.summary;
                lastModuleId = version.moduleId;
            }
            setStatus('Loaded cloud module: ' + (target.title || target.id), 'success');
        }
        catch (err) {
            const message = err.message || 'Unknown issue';
            setStatus('Cloud load failed: ' + message, 'error');
            alert('Cloud load failed: ' + message);
        }
        finally {
            stopBusy();
        }
    };
    saveBtn.addEventListener('click', async () => {
        if (!requireReady())
            return;
        const exporter = globals.exportModulePayload;
        if (typeof exporter !== 'function') {
            alert('Unable to export the current module.');
            return;
        }
        const stopBusy = setBusyState(saveBtn, 'Saving…');
        setStatus('Saving draft to the cloud…');
        try {
            const payload = exporter().data;
            const moduleId = globals.moduleData?.id ?? null;
            const version = await repo.saveDraft(moduleId, payload);
            if (!globals.moduleData)
                globals.moduleData = {};
            globals.moduleData.id = version.moduleId;
            lastModuleId = version.moduleId;
            setStatus('Draft saved to the cloud.', 'success');
        }
        catch (err) {
            const message = err.message || 'Unknown issue';
            setStatus('Cloud save failed: ' + message, 'error');
            alert('Cloud save failed: ' + message);
        }
        finally {
            stopBusy();
        }
    });
    loadBtn.addEventListener('click', () => {
        void loadFromCloud();
    });
    publishBtn.addEventListener('click', async () => {
        if (!requireReady())
            return;
        const mapId = globals.moduleData?.id ?? lastModuleId;
        if (!mapId) {
            alert('Save a draft before publishing.');
            return;
        }
        const stopBusy = setBusyState(publishBtn, 'Publishing…');
        setStatus('Publishing module to the cloud…');
        try {
            await repo.publish(mapId);
            setStatus('Module published.', 'success');
        }
        catch (err) {
            const message = err.message || 'Unknown issue';
            setStatus('Publish failed: ' + message, 'error');
            alert('Publish failed: ' + message);
        }
        finally {
            stopBusy();
        }
    });
    shareBtn.addEventListener('click', async () => {
        if (!requireReady())
            return;
        const mapId = globals.moduleData?.id ?? lastModuleId;
        if (!mapId) {
            alert('Save a draft before sharing.');
            return;
        }
        const email = prompt('Invite collaborator by email:');
        if (!email)
            return;
        const stopBusy = setBusyState(shareBtn, 'Sharing…');
        setStatus('Recording share invitation…');
        try {
            await repo.share?.(mapId, email.trim(), 'editor');
            setStatus('Share invitation recorded.', 'success');
        }
        catch (err) {
            const message = err.message || 'Unknown issue';
            setStatus('Share failed: ' + message, 'error');
            alert('Share failed: ' + message);
        }
        finally {
            stopBusy();
        }
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCloudActions, { once: true });
}
else {
    initCloudActions();
}

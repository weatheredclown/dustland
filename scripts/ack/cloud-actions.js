import { bootstrapHostedFirebase } from '../hosting/firebase-bootstrap.js';
import { FIREBASE_APP_NAME, loadFirebaseApp, loadFirebaseAuth } from './firebase-clients.js';
import { FirestoreModuleRepository, isPermissionError } from './module-repository.js';
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
    let session = null;
    let ready = false;
    let lastModuleId = globals.moduleData?.id ?? null;
    let unavailableMessage = 'Cloud saves unavailable. Sign in to enable them.';
    let bootstrapFailed = false;
    let serverConfigWarningLogged = false;
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
    const withTimeout = async (promise, action, timeoutMs = 20000) => {
        let timeoutId;
        try {
            const timeout = new Promise((_, reject) => {
                timeoutId = window.setTimeout(() => {
                    reject(new Error(`${action} timed out. Check your connection and try again.`));
                }, timeoutMs);
            });
            return await Promise.race([promise, timeout]);
        }
        finally {
            if (timeoutId !== undefined)
                window.clearTimeout(timeoutId);
        }
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
    const reinitializeRepo = async () => {
        if (!session)
            return false;
        const snapshot = session.getSnapshot();
        const canUseCloud = snapshot.status === 'authenticated' && snapshot.bootstrap.status === 'firebase-ready';
        if (!canUseCloud)
            return false;
        try {
            await repo.init(snapshot);
            ready = true;
            updateButtonStates(true);
            return true;
        }
        catch (err) {
            console.warn('Cloud actions unavailable', err);
            unavailableMessage = 'Cloud actions unavailable: ' + err.message;
            setStatus(unavailableMessage, 'error');
            updateButtonStates(false);
        }
        return false;
    };
    const refreshAuthToken = async () => {
        try {
            const [appModule, authModule] = await Promise.all([loadFirebaseApp(), loadFirebaseAuth()]);
            const app = appModule.getApps().find(candidate => candidate.name === FIREBASE_APP_NAME);
            if (!app)
                return false;
            const auth = authModule.getAuth(app);
            const user = auth.currentUser;
            if (!user)
                return false;
            await user.getIdToken(true);
            return true;
        }
        catch (err) {
            console.warn('Unable to refresh auth token', err);
            return false;
        }
    };
    try {
        await bootstrapHostedFirebase();
        session = ServerSession.get();
    }
    catch (err) {
        console.warn('Cloud actions unavailable', err);
        unavailableMessage = 'Cloud actions unavailable: ' + err.message;
        setStatus(unavailableMessage, 'error');
        updateButtonStates(false);
        bootstrapFailed = true;
    }
    if (!bootstrapFailed && session) {
        session.subscribe(async (snapshot) => {
            const canUseCloud = snapshot.status === 'authenticated' && snapshot.bootstrap.status === 'firebase-ready';
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
                    if (!serverConfigWarningLogged) {
                        console.warn('Cloud actions unavailable: server connection not configured.', snapshot.bootstrap);
                        serverConfigWarningLogged = true;
                    }
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
    const listCloudModules = async (allowRetry = true) => {
        try {
            const lists = await Promise.all([repo.listMine(), repo.listShared(), repo.listPublic()]);
            const annotate = (mods, access) => mods.map(mod => ({ ...mod, access: mod.access ?? access }));
            return [...annotate(lists[0], 'owner'), ...annotate(lists[1], 'shared'), ...annotate(lists[2], 'public')]
                .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
        }
        catch (err) {
            if (isPermissionError(err)) {
                const refreshed = allowRetry && (await refreshAuthToken()) && (await reinitializeRepo());
                if (refreshed) {
                    return listCloudModules(false);
                }
                ready = false;
                unavailableMessage =
                    'Cloud access denied for this account. Verify your permissions or try a different signed-in user.';
                setStatus(unavailableMessage, 'error');
                updateButtonStates(false);
                throw new Error(unavailableMessage);
            }
            throw err;
        }
    };
    const pickCloudModule = async () => {
        try {
            let modules = await listCloudModules();
            if (!modules.length) {
                setStatus('No cloud modules found. Save or publish one first.', 'error');
                alert('No cloud modules found. Save or publish one first.');
                return { module: null, canceled: false };
            }
            const createModuleRow = (module, onSelect, refresh) => {
                const container = document.createElement('div');
                container.style.cssText =
                    'border:1px solid #1f2b1f;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px;background:#0a100a;';
                const titleRow = document.createElement('div');
                titleRow.style.cssText = 'display:flex;justify-content:space-between;gap:8px;align-items:center;';
                const title = document.createElement('div');
                title.textContent = module.title?.trim() || 'Untitled Map';
                title.style.cssText = 'color:#e8ffe8;font-weight:600;flex:1;';
                titleRow.appendChild(title);
                const status = document.createElement('div');
                const timestamp = module.updatedAt ? new Date(module.updatedAt).toLocaleString() : 'unknown time';
                const source = module.access === 'owner' ? 'Mine' : module.access === 'shared' ? 'Shared' : 'Public';
                status.textContent = `${source} • ${timestamp}`;
                status.className = 'module-summary';
                status.style.cssText = 'color:#a3c1a3;font-size:0.85rem;';
                container.appendChild(titleRow);
                container.appendChild(status);
                if (module.summary) {
                    const summary = document.createElement('div');
                    summary.textContent = module.summary;
                    summary.style.cssText = 'color:#8fb18f;font-size:0.9rem;';
                    container.appendChild(summary);
                }
                const actions = document.createElement('div');
                actions.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;';
                const loadBtn = document.createElement('button');
                loadBtn.type = 'button';
                loadBtn.className = 'btn';
                loadBtn.textContent = 'Load';
                loadBtn.onclick = () => onSelect('load');
                actions.appendChild(loadBtn);
                if (module.access === 'owner' && repo.deleteModule) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.type = 'button';
                    deleteBtn.className = 'btn';
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.onclick = async () => {
                        const confirmed = confirm(`Delete ${module.title || 'this map'} from the cloud? This cannot be undone.`);
                        if (!confirmed)
                            return;
                        deleteBtn.disabled = true;
                        try {
                            await repo.deleteModule?.(module.id);
                            setStatus('Map deleted.', 'success');
                            await refresh();
                        }
                        catch (err) {
                            const message = err.message || 'Unable to delete that map.';
                            setStatus('Delete failed: ' + message, 'error');
                            alert('Delete failed: ' + message);
                        }
                        finally {
                            deleteBtn.disabled = false;
                        }
                    };
                    actions.appendChild(deleteBtn);
                }
                if (module.access === 'shared' && repo.unshare) {
                    const removeBtn = document.createElement('button');
                    removeBtn.type = 'button';
                    removeBtn.className = 'btn';
                    removeBtn.textContent = 'Remove';
                    removeBtn.onclick = async () => {
                        const confirmed = confirm(`Remove access to ${module.title || 'this map'}?`);
                        if (!confirmed)
                            return;
                        removeBtn.disabled = true;
                        try {
                            await repo.unshare?.(module.id);
                            setStatus('Share removed.', 'success');
                            await refresh();
                        }
                        catch (err) {
                            const message = err.message || 'Unable to remove that share.';
                            setStatus('Unshare failed: ' + message, 'error');
                            alert('Unshare failed: ' + message);
                        }
                        finally {
                            removeBtn.disabled = false;
                        }
                    };
                    actions.appendChild(removeBtn);
                }
                container.appendChild(actions);
                return container;
            };
            return await new Promise(resolve => {
                const overlay = document.createElement('div');
                overlay.id = 'cloudModulePicker';
                overlay.style.cssText =
                    'position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:100;';
                const dialog = document.createElement('div');
                dialog.style.cssText =
                    'background:#0c120c;border:1px solid #1f2b1f;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.45);width:90%;max-width:640px;max-height:80vh;display:flex;flex-direction:column;padding:14px;gap:10px;color:#d8eed8;';
                const header = document.createElement('div');
                header.style.cssText = 'display:flex;justify-content:space-between;gap:10px;align-items:center;';
                const title = document.createElement('div');
                title.textContent = 'Load a cloud module';
                title.style.cssText = 'font-weight:700;font-size:1.1rem;';
                header.appendChild(title);
                const closeBtn = document.createElement('button');
                closeBtn.className = 'btn';
                closeBtn.type = 'button';
                closeBtn.textContent = 'Cancel';
                closeBtn.onclick = () => {
                    cleanup();
                    resolve({ module: null, canceled: true });
                };
                header.appendChild(closeBtn);
                const help = document.createElement('div');
                help.textContent = 'Choose a map to load or manage its availability.';
                help.style.cssText = 'color:#9fbf9f;font-size:0.9rem;';
                const list = document.createElement('div');
                list.style.cssText = 'overflow:auto;display:flex;flex-direction:column;gap:10px;min-height:120px;';
                const refreshList = async () => {
                    try {
                        modules = await listCloudModules();
                    }
                    catch (err) {
                        cleanup();
                        resolve({ module: null, canceled: true });
                        throw err;
                    }
                    list.replaceChildren();
                    if (!modules.length) {
                        const empty = document.createElement('div');
                        empty.textContent = 'No cloud modules available.';
                        empty.style.cssText = 'color:#9fbf9f;text-align:center;padding:12px;';
                        list.appendChild(empty);
                        return;
                    }
                    modules.forEach(mod => {
                        const row = createModuleRow(mod, action => {
                            if (action === 'load') {
                                cleanup();
                                resolve({ module: mod, canceled: false });
                            }
                        }, refreshList);
                        list.appendChild(row);
                    });
                };
                void refreshList().catch(() => {
                    /* handled in refreshList */
                });
                overlay.addEventListener('click', evt => {
                    if (evt.target === overlay) {
                        cleanup();
                        resolve({ module: null, canceled: true });
                    }
                });
                const onKeyDown = (evt) => {
                    if (evt.key === 'Escape') {
                        cleanup();
                        resolve({ module: null, canceled: true });
                    }
                };
                document.addEventListener('keydown', onKeyDown);
                function cleanup() {
                    document.removeEventListener('keydown', onKeyDown);
                    overlay.remove();
                }
                dialog.appendChild(header);
                dialog.appendChild(help);
                dialog.appendChild(list);
                overlay.appendChild(dialog);
                document.body.appendChild(overlay);
            });
        }
        catch (err) {
            const message = err.message;
            setStatus('Unable to list cloud modules: ' + message, 'error');
            alert('Unable to list cloud modules: ' + message);
            throw err;
        }
    };
    const loadFromCloud = async () => {
        if (!requireReady())
            return;
        const stopBusy = setBusyState(loadBtn, 'Loading…');
        setStatus('Fetching cloud modules…');
        try {
            const { module: target, canceled } = await pickCloudModule();
            if (!target) {
                if (canceled)
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
            setStatus('Unable to export the current module.', 'error');
            alert('Unable to export the current module.');
            return;
        }
        const stopBusy = setBusyState(saveBtn, 'Saving…');
        setStatus('Saving draft to the cloud…');
        const warnSlowSave = window.setTimeout(() => {
            setStatus('Still saving to the cloud… Check your connection and keep this page open.', 'info');
        }, 8000);
        try {
            const payload = exporter().data;
            const moduleId = globals.moduleData?.id ?? null;
            let version;
            try {
                const savePromise = repo.saveDraft(moduleId, payload);
                version = await withTimeout(savePromise, 'Cloud save', 30000);
            }
            catch (err) {
                if (!moduleId || !isPermissionError(err)) {
                    throw err;
                }
                setStatus('No edit access to the original module. Saving a copy instead…');
                if (globals.moduleData)
                    delete globals.moduleData.id;
                lastModuleId = null;
                const savePromise = repo.saveDraft(null, payload);
                version = await withTimeout(savePromise, 'Cloud save', 30000);
            }
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
            window.clearTimeout(warnSlowSave);
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
            setStatus('Save a draft before publishing.', 'error');
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
            setStatus('Save a draft before sharing.', 'error');
            alert('Save a draft before sharing.');
            return;
        }
        const email = prompt('Invite collaborator by email:');
        if (!email) {
            setStatus('Share canceled.');
            return;
        }
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

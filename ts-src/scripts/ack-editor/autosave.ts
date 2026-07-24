// ACK Editor — Autosave & Dirty State
// Tracks unsaved changes, warns before leaving, and auto-saves periodically.

(function initAutosave() {
  const AUTOSAVE_KEY = 'ack_autosave';
  const AUTOSAVE_INTERVAL = 60000; // 60 seconds

  let ackDirty = false;
  let autosaveTimer: ReturnType<typeof setInterval> | null = null;

  function updateDirtyIndicator() {
    const indicator = document.getElementById('dirtyIndicator');
    if (indicator) indicator.textContent = ackDirty ? ' *' : '';
    const base = 'Adventure Construction Kit';
    document.title = ackDirty ? '* ' + base : base;
  }

  function markAckDirty() {
    if (!ackDirty) {
      ackDirty = true;
      updateDirtyIndicator();
    }
  }

  function clearAckDirty() {
    if (ackDirty) {
      ackDirty = false;
      updateDirtyIndicator();
    }
  }

  function isAckDirty() {
    return ackDirty;
  }

  function setAutosaveStatus(msg, isError = false) {
    const el = document.getElementById('autosaveStatus');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = isError ? '#f66' : '';
  }

  function doAutosave() {
    if (!ackDirty) return;
    let payload = null;
    try {
      const exportFn = globalThis.ackExportModulePayload;
      if (typeof exportFn !== 'function') return;
      const { data } = exportFn();
      payload = JSON.stringify(data);
    } catch (e) {
      return; // export failed — nothing coherent to save
    }
    try {
      localStorage.setItem(AUTOSAVE_KEY, payload);
      const now = new Date();
      setAutosaveStatus('Autosaved ' + now.toLocaleTimeString());
    } catch (e) {
      setAutosaveStatus('Autosave failed — browser storage is full. Download or cloud-save your module.', true);
    }
  }

  function loadAutosave() {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || !data.name) return;
      if (confirm('An unsaved module ("' + data.name + '") was found. Restore it?')) {
        const applyFn = globalThis.ackApplyLoadedModule;
        if (typeof applyFn === 'function') {
          applyFn(data);
          clearAckDirty();
        }
      }
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch (e) {
      // silent
    }
  }

  // beforeunload guard
  window.addEventListener('beforeunload', (e) => {
    if (ackDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // Start autosave timer
  autosaveTimer = setInterval(doAutosave, AUTOSAVE_INTERVAL);

  // Expose globals
  globalThis.markAckDirty = markAckDirty;
  globalThis.clearAckDirty = clearAckDirty;
  globalThis.isAckDirty = isAckDirty;
  globalThis.ackDoAutosave = doAutosave;

  // Check for autosave on init (after a small delay to let adventure-kit.ts init)
  setTimeout(loadAutosave, 500);
})();

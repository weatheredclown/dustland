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

  function doAutosave() {
    if (!ackDirty) return;
    try {
      const exportFn = globalThis.ackExportModulePayload;
      if (typeof exportFn !== 'function') return;
      const { data } = exportFn();
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // silent — autosave is best-effort
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

  // Check for autosave on init (after a small delay to let adventure-kit.ts init)
  setTimeout(loadAutosave, 500);
})();

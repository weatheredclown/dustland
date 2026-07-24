// ACK Editor — Undo / Redo Manager
// Snapshot-based: captures full module state before each mutation.

(function initUndoManager() {
  const MAX_UNDO = 50;
  const undoStack: string[] = [];
  const redoStack: string[] = [];

  function captureSnapshot(): string | null {
    try {
      const exportFn = globalThis.ackExportModulePayload;
      const getWorld = globalThis.ackGetWorld;
      if (typeof exportFn !== 'function' || typeof getWorld !== 'function') return null;
      const { data } = exportFn();
      return JSON.stringify(data);
    } catch (e) {
      return null;
    }
  }

  function restoreSnapshot(json: string) {
    try {
      const data = JSON.parse(json);
      const applyFn = globalThis.ackApplyLoadedModule;
      if (typeof applyFn !== 'function') return;
      applyFn(data);
      globalThis.markAckDirty?.();
    } catch (e) {
      // silent
    }
  }

  function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn') as HTMLButtonElement | null;
    const redoBtn = document.getElementById('redoBtn') as HTMLButtonElement | null;
    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
  }

  function ackRecordSnapshot() {
    const snap = captureSnapshot();
    if (!snap) return;
    undoStack.push(snap);
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    redoStack.length = 0;
    updateUndoRedoButtons();
  }

  function ackUndo() {
    if (undoStack.length === 0) return;
    const current = captureSnapshot();
    if (current) redoStack.push(current);
    const prev = undoStack.pop()!;
    restoreSnapshot(prev);
    updateUndoRedoButtons();
  }

  function ackRedo() {
    if (redoStack.length === 0) return;
    const current = captureSnapshot();
    if (current) undoStack.push(current);
    const next = redoStack.pop()!;
    restoreSnapshot(next);
    updateUndoRedoButtons();
  }

  // Expose globals
  globalThis.ackRecordSnapshot = ackRecordSnapshot;
  globalThis.ackUndo = ackUndo;
  globalThis.ackRedo = ackRedo;

  // Wire up button clicks
  document.getElementById('undoBtn')?.addEventListener('click', ackUndo);
  document.getElementById('redoBtn')?.addEventListener('click', ackRedo);

  // Initial button state
  updateUndoRedoButtons();
})();

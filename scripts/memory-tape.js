const originalLog = globalThis.log;
let lastLogMsg = '';
let recording = null;

globalThis.log = function(msg) {
  lastLogMsg = msg;
  if (originalLog) originalLog(msg);
};

const memoryTape = registerItem({
  id: 'memory_tape',
  name: 'Memory Tape',
  type: 'quest',
  use: {
    onUse({ log }) {
      if (!recording) {
        recording = lastLogMsg;
        log('Memory Tape recorded: ' + (recording || 'static'));
      } else {
        log('Memory Tape plays: ' + (recording || 'static'));
        const npc = (NPCS || []).find(n => n.map === party.map && n.x === party.x && n.y === party.y && typeof n.onMemoryTape === 'function');
        npc?.onMemoryTape(recording);
      }
      memoryTape.recording = recording;
    }
  }
});

globalThis.memoryTape = memoryTape;

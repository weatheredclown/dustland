const originalLog = globalThis.log;
let lastLogMsg = '';
let recording = null;
globalThis.log = function memoryTapeLog(msg, type) {
    lastLogMsg = msg;
    if (originalLog)
        originalLog(msg, type);
};
const memoryTape = registerItem({
    id: 'memory_tape',
    name: 'Memory Tape',
    type: 'quest',
    use: {
        onUse({ log: itemLog }) {
            if (!recording) {
                recording = lastLogMsg;
                itemLog('Memory Tape recorded: ' + (recording || 'static'));
            }
            else {
                itemLog('Memory Tape plays: ' + (recording || 'static'));
                const globals = globalThis;
                const npc = (globals.NPCS ?? []).find(n => (n?.map === globals.party?.map &&
                    n?.x === globals.party?.x &&
                    n?.y === globals.party?.y &&
                    typeof n?.onMemoryTape === 'function'));
                npc?.onMemoryTape?.(recording);
            }
            memoryTape.recording = recording;
        }
    }
});
globalThis.memoryTape = memoryTape;

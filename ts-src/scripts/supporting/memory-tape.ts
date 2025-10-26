type MemoryTapeRecorder = (message: string, type?: string) => void;

const originalLog = globalThis.log as MemoryTapeRecorder | undefined;
let lastLogMsg = '';
let recording: string | null = null;

globalThis.log = function memoryTapeLog(msg: string, type?: string): void {
  lastLogMsg = msg;
  if (originalLog) originalLog(msg, type);
};

const memoryTape = registerItem({
  id: 'memory_tape',
  name: 'Memory Tape',
  type: 'quest',
  use: {
    onUse({ log: itemLog }: { log: (message: string) => void }) {
      if (!recording) {
        recording = lastLogMsg;
        itemLog('Memory Tape recorded: ' + (recording || 'static'));
      } else {
        itemLog('Memory Tape plays: ' + (recording || 'static'));
        const globals = globalThis as {
          NPCS?: Array<{
            map?: string;
            x?: number;
            y?: number;
            onMemoryTape?: (recording: string | null) => void;
          }>;
          party?: { map?: string; x?: number; y?: number };
        };
        const npc = (globals.NPCS ?? []).find(n => (
          n?.map === globals.party?.map &&
          n?.x === globals.party?.x &&
          n?.y === globals.party?.y &&
          typeof n?.onMemoryTape === 'function'
        ));
        npc?.onMemoryTape?.(recording);
      }
      memoryTape.recording = recording;
    }
  }
}) as ReturnType<typeof registerItem> & MemoryTapeItem;

(globalThis as Record<string, unknown>).memoryTape = memoryTape;

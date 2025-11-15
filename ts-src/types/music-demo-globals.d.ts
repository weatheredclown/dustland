export {};

declare global {
  type ToneJsGlobal = {
    now?: () => number;
    start?: () => Promise<void>;
    context?: { state?: string; currentTime: number };
    Transport?: {
      bpm: { value: number };
      swing?: number;
      swingSubdivision?: string;
      schedule?: (callback: (time: number) => void, time?: number | string) => unknown;
      clear?: (id: unknown) => void;
      cancel?: (time?: number | string) => void;
      start?: (time?: number) => void;
      stop?: (time?: number) => void;
      loop?: boolean;
      loopEnd?: string;
      position?: string;
    };
    [key: string]: any;
  };

  interface MagentaMusicNamespace {
    MusicVAE: new (checkpoint: string) => {
      initialize(): Promise<void>;
      interpolate(sequences: unknown[], count: number): Promise<any[]>;
    };
    sequences?: {
      quantizeNoteSequence?: (sequence: unknown, stepsPerQuarter: number) => any;
      [key: string]: unknown;
    };
    pitchToNote?: (midi: number) => string;
    [key: string]: unknown;
  }

  const Tone: ToneJsGlobal;
  const clampMidiToScale: ((midi: number, key: string, scaleName: string) => number) | undefined;

  interface Window {
    Tone?: ToneJsGlobal | null;
    mm?: MagentaMusicNamespace | null;
    webkitAudioContext?: typeof AudioContext;
  }

  interface GlobalThis {
    clampMidiToScale?: (midi: number, key: string, scaleName: string) => number;
  }
}

const globals = globalThis as typeof globalThis & { ENGINE_VERSION: string; log?: (message: string, type?: string) => void };
const logger = globals.log ?? console.log;
logger(`v${globals.ENGINE_VERSION} — boot log extracted to helper file.`, undefined);

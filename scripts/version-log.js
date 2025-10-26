const globals = globalThis;
const logger = globals.log ?? console.log;
logger(`v${globals.ENGINE_VERSION} — boot log extracted to helper file.`, undefined);

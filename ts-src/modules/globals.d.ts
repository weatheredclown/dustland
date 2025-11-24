export {};

declare global {
  var seedWorldContent: (() => void) | undefined;
  // Ensure module-scoped references to globalThis include seeded content hooks.
  var globalThis: GlobalThis & { seedWorldContent?: () => void };
  interface GlobalThis {
    seedWorldContent?: () => void;
  }
}

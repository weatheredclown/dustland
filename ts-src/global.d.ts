export {};

declare global {
  interface DustlandNamespace {
    [key: string]: unknown;
  }

  interface AckNavigationConfig {
    enabled?: boolean;
    [key: string]: unknown;
  }

  interface AckConfig {
    navigation?: AckNavigationConfig;
    [key: string]: unknown;
  }

  interface AckGlobal {
    config?: AckConfig;
    [key: string]: unknown;
  }

  interface GlobalThis {
    Dustland?: DustlandNamespace;
    ACK?: AckGlobal;
  }
}

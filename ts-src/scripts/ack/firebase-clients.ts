export const FIREBASE_APP_NAME = 'dustland-ack';

type FirebaseAppLoader = () => Promise<typeof import('firebase/app')>;
type FirebaseAuthLoader = () => Promise<typeof import('firebase/auth')>;

let loadFirebaseAppImpl: FirebaseAppLoader = () => import('firebase/app');
let loadFirebaseAuthImpl: FirebaseAuthLoader = () => import('firebase/auth');

export async function loadFirebaseApp(): Promise<typeof import('firebase/app')> {
  return loadFirebaseAppImpl();
}

export async function loadFirebaseAuth(): Promise<typeof import('firebase/auth')> {
  return loadFirebaseAuthImpl();
}

export function overrideFirebaseClients(overrides: {
  loadFirebaseApp?: FirebaseAppLoader;
  loadFirebaseAuth?: FirebaseAuthLoader;
}): void {
  if (overrides.loadFirebaseApp) loadFirebaseAppImpl = overrides.loadFirebaseApp;
  if (overrides.loadFirebaseAuth) loadFirebaseAuthImpl = overrides.loadFirebaseAuth;
}

export function resetFirebaseClientsForTests(): void {
  loadFirebaseAppImpl = () => import('firebase/app');
  loadFirebaseAuthImpl = () => import('firebase/auth');
}

export const FIREBASE_APP_NAME = 'dustland-ack';

type FirebaseAppLoader = () => Promise<typeof import('firebase/app')>;
type FirebaseAuthLoader = () => Promise<typeof import('firebase/auth')>;

const FIREBASE_VERSION = '11.0.1';
const FIREBASE_CDN_BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/`;

let loadFirebaseAppImpl: FirebaseAppLoader;
let loadFirebaseAuthImpl: FirebaseAuthLoader;

function firebaseModuleUrl(moduleName: string): string {
  return `${FIREBASE_CDN_BASE}${moduleName}.js`;
}

export function loadFirebaseModule<T>(moduleName: string): Promise<T> {
  return import(firebaseModuleUrl(moduleName)) as Promise<T>;
}

function setDefaultLoaders(): void {
  loadFirebaseAppImpl = () => loadFirebaseModule<typeof import('firebase/app')>('firebase-app');
  loadFirebaseAuthImpl = () => loadFirebaseModule<typeof import('firebase/auth')>('firebase-auth');
}

setDefaultLoaders();

export async function loadFirebaseApp(): Promise<typeof import('firebase/app')> {
  return loadFirebaseAppImpl();
}

export async function loadFirebaseAuth(): Promise<typeof import('firebase/auth')> {
  return loadFirebaseAuthImpl();
}

export function getFirebaseModuleUrl(moduleName: string): string {
  return firebaseModuleUrl(moduleName);
}

export function overrideFirebaseClients(overrides: {
  loadFirebaseApp?: FirebaseAppLoader;
  loadFirebaseAuth?: FirebaseAuthLoader;
}): void {
  if (overrides.loadFirebaseApp) loadFirebaseAppImpl = overrides.loadFirebaseApp;
  if (overrides.loadFirebaseAuth) loadFirebaseAuthImpl = overrides.loadFirebaseAuth;
}

export function resetFirebaseClientsForTests(): void {
  setDefaultLoaders();
}

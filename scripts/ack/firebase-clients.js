export const FIREBASE_APP_NAME = 'dustland-ack';
let loadFirebaseAppImpl = () => import('firebase/app');
let loadFirebaseAuthImpl = () => import('firebase/auth');
export async function loadFirebaseApp() {
    return loadFirebaseAppImpl();
}
export async function loadFirebaseAuth() {
    return loadFirebaseAuthImpl();
}
export function overrideFirebaseClients(overrides) {
    if (overrides.loadFirebaseApp)
        loadFirebaseAppImpl = overrides.loadFirebaseApp;
    if (overrides.loadFirebaseAuth)
        loadFirebaseAuthImpl = overrides.loadFirebaseAuth;
}
export function resetFirebaseClientsForTests() {
    loadFirebaseAppImpl = () => import('firebase/app');
    loadFirebaseAuthImpl = () => import('firebase/auth');
}

export const FIREBASE_APP_NAME = 'dustland-ack';
const FIREBASE_VERSION = '11.0.1';
const FIREBASE_CDN_BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/`;
let loadFirebaseAppImpl;
let loadFirebaseAuthImpl;
function firebaseModuleUrl(moduleName) {
    return `${FIREBASE_CDN_BASE}${moduleName}.js`;
}
export function loadFirebaseModule(moduleName) {
    return import(firebaseModuleUrl(moduleName));
}
function setDefaultLoaders() {
    loadFirebaseAppImpl = () => loadFirebaseModule('firebase-app');
    loadFirebaseAuthImpl = () => loadFirebaseModule('firebase-auth');
}
setDefaultLoaders();
export async function loadFirebaseApp() {
    return loadFirebaseAppImpl();
}
export async function loadFirebaseAuth() {
    return loadFirebaseAuthImpl();
}
export function getFirebaseModuleUrl(moduleName) {
    return firebaseModuleUrl(moduleName);
}
export function overrideFirebaseClients(overrides) {
    if (overrides.loadFirebaseApp)
        loadFirebaseAppImpl = overrides.loadFirebaseApp;
    if (overrides.loadFirebaseAuth)
        loadFirebaseAuthImpl = overrides.loadFirebaseAuth;
}
export function resetFirebaseClientsForTests() {
    setDefaultLoaders();
}

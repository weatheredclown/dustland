export const FIREBASE_APP_NAME = 'dustland-ack';
export async function loadFirebaseApp() {
    return import('firebase/app');
}
export async function loadFirebaseAuth() {
    return import('firebase/auth');
}

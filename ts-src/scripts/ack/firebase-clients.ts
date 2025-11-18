export const FIREBASE_APP_NAME = 'dustland-ack';

export async function loadFirebaseApp(): Promise<typeof import('firebase/app')> {
  return import('firebase/app');
}

export async function loadFirebaseAuth(): Promise<typeof import('firebase/auth')> {
  return import('firebase/auth');
}

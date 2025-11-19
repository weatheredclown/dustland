import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

import {
  overrideFirebaseClients,
  resetFirebaseClientsForTests,
} from '../scripts/ack/firebase-clients.js';

globalThis.window = globalThis;

test('server session authenticates with Firebase', async t => {
  const previousFeatures = globalThis.DUSTLAND_FEATURES;
  const previousFirebase = globalThis.DUSTLAND_FIREBASE;
  let ServerSession;

  t.after(() => {
    mock.restoreAll();
    if (previousFeatures === undefined) delete globalThis.DUSTLAND_FEATURES;
    else globalThis.DUSTLAND_FEATURES = previousFeatures;
    if (previousFirebase === undefined) delete globalThis.DUSTLAND_FIREBASE;
    else globalThis.DUSTLAND_FIREBASE = previousFirebase;
    resetFirebaseClientsForTests();
    ServerSession?.resetForTests();
  });

  globalThis.DUSTLAND_FEATURES = { serverMode: true };
  globalThis.DUSTLAND_FIREBASE = {
    projectId: 'demo-project',
    apiKey: 'abc',
    appId: 'def',
    authDomain: 'demo.firebaseapp.com',
  };

  const authCallbacks = [];
  let signInCount = 0;
  let signOutCount = 0;

  overrideFirebaseClients({
    loadFirebaseApp: async () => ({
      initializeApp: (_config, name) => ({ name }),
      getApps: () => [],
    }),
    loadFirebaseAuth: async () => ({
      getAuth: () => ({ app: 'ack-app' }),
      onAuthStateChanged: (_auth, callback) => {
        authCallbacks.push(callback);
        return () => {};
      },
      GoogleAuthProvider: class GoogleAuthProvider {},
      signInWithPopup: async () => {
        signInCount += 1;
      },
      signOut: async () => {
        signOutCount += 1;
      },
    }),
  });

  ({ ServerSession } = await import('../scripts/ack/server-session.js'));
  ServerSession.resetForTests();

  const session = ServerSession.get();
  const snapshots = [];
  const unsubscribe = session.subscribe(snapshot => snapshots.push(snapshot.status));

  await session.signIn();
  const fakeUser = {
    uid: 'user-123',
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/photo.png',
    emailVerified: true,
    providerId: 'google.com',
  };
  authCallbacks.forEach(callback => callback(fakeUser));

  const authed = session.getSnapshot();
  assert.equal(signInCount, 1);
  assert.equal(authed.status, 'authenticated');
  assert.equal(authed.user?.uid, fakeUser.uid);
  assert.equal(authed.user?.email, fakeUser.email);

  await session.signOut();
  authCallbacks.forEach(callback => callback(null));

  assert.equal(signOutCount, 1);
  assert.equal(session.getSnapshot().status, 'idle');

  unsubscribe();
  assert.ok(snapshots.includes('initializing'));
  assert.ok(snapshots.includes('authenticating'));
  assert.ok(snapshots.includes('authenticated'));
});

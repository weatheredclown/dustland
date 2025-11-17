import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bootstrapHostedFirebase } from '../scripts/hosting/firebase-bootstrap.js';

test('skips hosted config fetch for local file sessions', async () => {
  const stub = { location: { protocol: 'file:' }, fetch: () => { throw new Error('fetch called'); } };
  await bootstrapHostedFirebase(stub);
  assert.deepEqual(stub.DUSTLAND_FEATURES, {});
  assert.equal(stub.DUSTLAND_FIREBASE, undefined);
});

test('hydrates firebase config and enables server mode by default', async () => {
  const payload = {
    projectId: 'dustland-dev',
    apiKey: 'abc',
    appId: 'my-app',
    authDomain: 'example.firebaseapp.com',
  };
  const stub = {
    location: { protocol: 'https:' },
    fetch: async () => new Response(JSON.stringify(payload), { status: 200 }),
  };
  await bootstrapHostedFirebase(stub);
  assert.equal(stub.DUSTLAND_FIREBASE?.projectId, 'dustland-dev');
  assert.equal(stub.DUSTLAND_FEATURES?.serverMode, true);
});

test('applies feature flag overrides from hosted config', async () => {
  const payload = {
    firebase: {
      projectId: 'dustland-dev',
      apiKey: 'abc',
      appId: 'my-app',
      authDomain: 'example.firebaseapp.com',
    },
    features: { serverMode: false, serverModePreview: true },
  };
  const stub = {
    location: { protocol: 'https:' },
    fetch: async () => new Response(JSON.stringify(payload), { status: 200 }),
  };
  await bootstrapHostedFirebase(stub);
  assert.equal(stub.DUSTLAND_FIREBASE?.projectId, 'dustland-dev');
  assert.equal(stub.DUSTLAND_FEATURES?.serverMode, false);
  assert.equal(stub.DUSTLAND_FEATURES?.serverModePreview, true);
});

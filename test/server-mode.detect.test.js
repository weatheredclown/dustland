import assert from 'node:assert/strict';
import { test } from 'node:test';

import { detectServerMode } from '../scripts/ack/server-mode.js';

test('server mode disabled when flag missing', () => {
  const stubWindow = {};
  const result = detectServerMode(stubWindow);
  assert.equal(result.status, 'disabled');
  assert.equal(result.reason, 'feature-flag');
});

test('server mode disabled when config missing', () => {
  const stubWindow = { DUSTLAND_FEATURES: { serverMode: true } };
  const result = detectServerMode(stubWindow);
  assert.equal(result.status, 'disabled');
  assert.equal(result.reason, 'missing-config');
});

test('server mode disabled with invalid config', () => {
  const stubWindow = {
    DUSTLAND_FEATURES: { serverMode: true },
    DUSTLAND_FIREBASE: { projectId: 'abc', apiKey: '', appId: 'foo', authDomain: 'example' },
  };
  const result = detectServerMode(stubWindow);
  assert.equal(result.status, 'disabled');
  assert.equal(result.reason, 'invalid-config');
});

test('server mode ready with valid config', () => {
  const stubWindow = {
    DUSTLAND_FEATURES: { serverMode: true },
    DUSTLAND_FIREBASE: {
      projectId: 'abc',
      apiKey: 'key',
      appId: 'app',
      authDomain: 'example.firebaseapp.com',
    },
  };
  const result = detectServerMode(stubWindow);
  assert.equal(result.status, 'firebase-ready');
  assert.equal(result.config.projectId, 'abc');
});

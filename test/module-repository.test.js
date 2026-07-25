import assert from 'node:assert/strict';
import { test } from 'node:test';

const { FirestoreModuleRepository, NullModuleRepository } = await import('../scripts/ack/module-repository.js');

test('NullModuleRepository saveDraft keeps provided module id', async t => {
  const repo = new NullModuleRepository();
  const payload = { name: 'Test Module' };
  const previousNow = Date.now;
  const previousRandomUuid = globalThis.crypto?.randomUUID;
  Date.now = () => 1700000000000;
  if (globalThis.crypto) {
    globalThis.crypto.randomUUID = () => 'version-uuid';
  }

  t.after(() => {
    Date.now = previousNow;
    if (globalThis.crypto) {
      if (previousRandomUuid) globalThis.crypto.randomUUID = previousRandomUuid;
      else delete globalThis.crypto.randomUUID;
    }
  });

  const draft = await repo.saveDraft('existing-module', payload);
  assert.equal(draft.moduleId, 'existing-module');
  assert.equal(draft.versionId, 'version-uuid');
  assert.equal(draft.createdAt, 1700000000000);
  assert.equal(draft.createdBy, 'offline');
  assert.equal(draft.payload, payload);
});

test('writeWithDetail reports permission errors with payload preview', async () => {
  const repo = new FirestoreModuleRepository();
  repo.session = { user: { uid: 'user-1', email: 'user@example.com' } };
  const payload = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 };

  await assert.rejects(
    repo.writeWithDetail('saving draft', 'maps/map-1', payload, async () => {
      const err = new Error('Permission denied');
      err.code = 'permission-denied';
      throw err;
    }),
    err => {
      assert.match(err.message, /saving draft/);
      assert.match(err.message, /maps\/map-1/);
      assert.match(err.message, /user-1 \(user@example.com\)/);
      assert.match(err.message, /"e":5/);
      assert.doesNotMatch(err.message, /"f":6/);
      return true;
    },
  );
});

test('resolveUserByEmail falls back to lower-cased email when functions are missing', async () => {
  const repo = new FirestoreModuleRepository();
  repo.functions = null;

  const uid = await repo.resolveUserByEmail('Missing@Example.com');
  assert.equal(uid, 'missing@example.com');
});

test('mapDocToSummary applies defaults when fields are missing', t => {
  const repo = new FirestoreModuleRepository();
  const previousNow = Date.now;
  Date.now = () => 1800000000000;
  t.after(() => {
    Date.now = previousNow;
  });

  const summary = repo.mapDocToSummary('map-42', {}, true);
  assert.deepEqual(summary, {
    id: 'map-42',
    title: '',
    summary: '',
    visibility: 'public',
    ownerId: 'unknown',
    updatedAt: 1800000000000,
    publishedVersionId: null,
    thumb: '',
  });
});

test('mapDocToSummary carries the stored thumbnail through', () => {
  const repo = new FirestoreModuleRepository();
  const summary = repo.mapDocToSummary('map-7', { thumb: 'data:image/jpeg;base64,abc' });
  assert.equal(summary.thumb, 'data:image/jpeg;base64,abc');
});

test('NullModuleRepository lists no versions and loads none by id', async () => {
  const repo = new NullModuleRepository();
  assert.deepEqual(await repo.listVersions('mod-1'), []);
  assert.equal(await repo.loadVersion('mod-1', 'v-2'), null);
});

test('describeCloudError explains offline failures with a next step', async () => {
  const { describeCloudError } = await import('../scripts/ack/module-repository.js');
  const err = new Error('transport failure');
  err.code = 'unavailable';
  const message = describeCloudError(err);
  assert.match(message, /offline/i);
  assert.match(message, /try again/i);
});

test('describeCloudError explains expired sign-in with a next step', async () => {
  const { describeCloudError } = await import('../scripts/ack/module-repository.js');
  const err = new Error('credential no longer valid');
  err.code = 'unauthenticated';
  const message = describeCloudError(err);
  assert.match(message, /sign-in has expired/i);
  assert.match(message, /sign in again/i);
});

test('describeCloudError keeps detailed messages for other failures', async () => {
  const { describeCloudError } = await import('../scripts/ack/module-repository.js');
  assert.equal(describeCloudError(new Error('boom')), 'boom');
  assert.equal(describeCloudError({}), 'Unknown issue.');
});

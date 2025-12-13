# Firestore rules for Dustland cloud saves

Cloud saves require a Firestore rule set that matches the collections used by the Adventure Kit:

- `maps/{mapId}` – map metadata (owner, visibility, summary).
- `mapVersions/{mapId_versionId}` – immutable ACK JSON payloads.
- `shares/{mapId_userId}` – share table with `role: viewer|editor`.
- `publicListings/{mapId}` – cache of public map metadata for fast public queries.
- `users/{uid}` – per-user profile cache.

Use the following rules to avoid "Missing or insufficient permissions" errors when creating or loading cloud saves. They allow:

- Owners to create/update maps and publish listings.
- Owners and editors to write new map versions.
- Owners to grant/revoke shares; recipients can read their own share rows.
- Anyone to read public listings and published map metadata.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }

    function mapIdFromVersion(docId) {
      return docId.split('_')[0];
    }

    function mapRef(mapId) {
      return get(/databases/$(database)/documents/maps/$(mapId));
    }

    function isOwner(mapDoc) {
      return mapDoc.exists() && isSignedIn() && mapDoc.data.ownerId == request.auth.uid;
    }

    function shareRef(mapId, uid) {
      return get(/databases/$(database)/documents/shares/$(mapId + '_' + uid));
    }

    function shareRole(mapId) {
      let share = shareRef(mapId, request.auth.uid);
      return share.exists() ? share.data.role : null;
    }

    function canReadMap(mapDoc, mapId) {
      return mapDoc.exists()
        && (mapDoc.data.visibility == 'public'
          || isOwner(mapDoc)
          || (isSignedIn() && shareRef(mapId, request.auth.uid).exists()));
    }

    function canEditMap(mapDoc, mapId) {
      return canReadMap(mapDoc, mapId)
        && (isOwner(mapDoc) || shareRole(mapId) == 'editor');
    }

    match /maps/{mapId} {
      allow read: if canReadMap(resource, mapId);
      allow create: if isSignedIn() && request.resource.data.ownerId == request.auth.uid;
      allow update: if canEditMap(resource, mapId);
      allow delete: if false;
    }

    match /mapVersions/{docId} {
      allow read: if canReadMap(mapRef(mapIdFromVersion(docId)), mapIdFromVersion(docId));
      allow create: if isSignedIn()
        && canEditMap(mapRef(mapIdFromVersion(docId)), mapIdFromVersion(docId));
      allow update, delete: if false; // versions stay immutable
    }

    match /shares/{docId} {
      function shareMapId() { return docId.split('_')[0]; }
      allow read: if isSignedIn()
        && (request.auth.uid == resource.data.userId || isOwner(mapRef(shareMapId())));
      allow create: if isSignedIn()
        && request.resource.data.mapId == shareMapId()
        && isOwner(mapRef(shareMapId()));
      allow delete: if isSignedIn()
        && (request.auth.uid == resource.data.userId || isOwner(mapRef(shareMapId())));
      allow update: if false;
    }

    match /publicListings/{mapId} {
      allow read: if true;
      allow write: if isSignedIn() && isOwner(mapRef(mapId));
    }

    match /users/{uid} {
      allow read, write: if isSignedIn() && request.auth.uid == uid;
    }
  }
}
```

Deploy by saving the snippet as `firestore.rules` and running `firebase deploy --only firestore:rules` (or `firebase emulators:start --only firestore` for local testing). Ensure your client is authenticated before trying to save; unauthenticated requests will be rejected by the `isSignedIn` checks.

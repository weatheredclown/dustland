# Server Mode Map Persistence MVP
*By Priya "Gizmo" Sharma*

## Background
The current Dustland builds ship as fully static HTML bundles. Modules load from baked JSON, and the Adventure Kit (ACK) saves directly to the browser. That keeps local play lightning fast, but it means shared maps require manual JSON swaps. We want an opt-in "server mode" that layers in persistent storage and sharing without breaking the offline story. When players reach our public build at [`dustland.html`](https://weatheredclown.github.io/dustland/dustland.html), they should see the same experience until they choose to log in.

## Goals
- Keep offline and local-file usage unchanged when Firebase credentials are missing.
- Add Firebase Authentication + Firestore backed storage for ACK modules and map metadata.
- Surface a module picker that differentiates **Mine**, **Shared with me**, and **Public** libraries when the player is authenticated.
- Provide save, publish, and share controls in ACK that map to Firestore writes.
- Maintain a simple deployment story for GitHub Pages with a single static bundle.

## Non-Goals
- Replacing the existing JSON export/import tooling.
- Implementing granular diffing or merge for maps.
- Building moderation or content discovery features beyond public visibility and direct share links.
- Supporting multi-tenant servers or self-hosted backends in this MVP.

## Runtime Modes
| Mode | Trigger | Storage | UI Delta |
|------|---------|---------|----------|
| **Offline** | No Firebase config present or network unavailable | Local browser state only | Existing menus and JSON import/export.
| **Server (Unauthenticated)** | Firebase config available, user not logged in | Read-only public map list (optional landing) | "Sign in" button in ACK toolbar + module picker toggle.
| **Server (Authenticated)** | Firebase config + valid auth session | Full Firestore CRUD scoped to user permissions | Module picker tabs, save/share/publish menus.

Detection logic lives in a tiny `serverMode.ts` helper under `ts-src/ack/`. It reads a `window.DUSTLAND_FIREBASE` object injected by `dustland.html` when hosted. When the object is absent we never import Firebase SDKs, avoiding dead weight for local copies.

## Firebase Footprint
- **Authentication:** Firebase Auth with Google provider. We keep the sign-in button tucked in the ACK header. Tokens stay client-side; logout clears session.
- **Firestore:** Single-region multi-user database.
  - `users/{uid}` — profile cache (display name, email, lastLogin, featureFlags).
  - `maps/{mapId}` — metadata (`ownerId`, `title`, `summary`, `visibility`, `updatedAt`, `publishedVersionId`).
  - `mapVersions/{mapId}_{version}` — immutable blobs storing ACK JSON (`payload`, `createdAt`, `createdBy`). The latest version pointer sits on the map document.
  - `shares/{mapId}_{uid}` — derived documents (`role: viewer|editor`, `addedBy`, `addedAt`). Queries let us fetch "Shared with me" quickly.
  - `publicListings/{mapId}` — cached metadata for public catalog, allowing security rules to serve without complex queries.

### Firestore Security Rules (Sketch)
```text
match /maps/{mapId} {
  allow read: if resource.data.visibility == 'public' || request.auth.uid == resource.data.ownerId || exists(/databases/(default)/documents/shares/$(mapId + '_' + request.auth.uid));
  allow write: if request.auth.uid == resource.data.ownerId;
}
match /mapVersions/{docId} {
  allow read: if isAuthorizedForMap(mapIdFrom(docId));
  allow create: if request.auth.uid == map.ownerId || share.role == 'editor';
  allow update, delete: if false; // immutable
}
match /shares/{docId} {
  allow read, delete: if map.ownerId == request.auth.uid || request.auth.uid == share.userId;
  allow create: if request.auth.uid == map.ownerId;
}
```
Helpers like `isAuthorizedForMap` and `mapIdFrom` are defined in the rules file and cached via Cloud Firestore rule functions.

## Client Architecture
1. **Bootstrap:**
   - `dustland.html` checks for `firebase-config.json` fetched at load. If found, it populates `window.DUSTLAND_FIREBASE` and lazy-loads `firebase-app`, `firebase-auth`, and `firebase-firestore` modules.
   - A feature flag in `window.DUSTLAND_FEATURES.serverMode` keeps the code path optional for early testing.
2. **State Layer:**
   - New `ServerSession` singleton exposes reactive auth state (`status`, `user`, `error`).
   - `ModuleRepository` gains Firestore-backed implementations. Interface stays the same so offline mode keeps using in-memory storage.
3. **ACK Integration:**
   - Add a "Cloud" button near existing save options. When clicked in authenticated mode, it opens a dialog with tabs (Mine/Shared/Public) and fetches matching lists via Firestore queries with pagination.
   - Save dialog writes a new `mapVersions` doc, then updates the `maps` metadata. "Publish" toggles `visibility` to public and copies metadata into `publicListings`.
   - Share dialog lets owners type emails -> we call Firebase's `getUserByEmail` via a lightweight Cloud Function (see below) to map to `uid` and create `shares` documents.
4. **Adventure Kit loader:**
   - When a map is selected, loader fetches latest version JSON, caches it locally, and pipes it into the existing `loadModuleFromJSON` flow.
   - We continue to support manual JSON import; cloud-saved modules simply populate the list.

## Cloud Function (Optional but Helpful)
A minimal HTTPS callable function `resolveUserByEmail` ensures we never expose full user indices to the client. It returns `{uid, displayName}` for emails already registered. Owners can still share via link by copying a generated document ID; unauthorized users hitting that link will be prompted to request access.

## Deployment Story
- GitHub Pages remains our host. We add `firebase-config.json` to the `weatheredclown.github.io` repo, excluded from the main game bundle so local copies stay config-free.
- For contributors testing locally, we document how to drop a config file next to `dustland.html` or set `DUSTLAND_FIREBASE` manually in the dev console.
- `firebase-config.json` can be a raw Firebase config export (apiKey, appId, projectId, authDomain) or a wrapper object with `firebase` and optional `features` fields. When present, the hosted bootstrap sets `window.DUSTLAND_FIREBASE` and defaults `DUSTLAND_FEATURES.serverMode` to `true` unless explicitly overridden.
- The same static assets serve offline because Firebase scripts only load when config exists. No config → no auth prompts, no Firestore calls.

## Rollout Plan
1. **Scaffolding:** Land `ServerSession` and module repository interface with mock adapters and feature flag defaulted off.
2. **Auth UI:** Wire Google sign-in and show the authenticated state in ACK header.
3. **Module Picker:** Implement Firestore queries, lazy load data, ensure fallback to JSON import.
4. **Save/Publish/Share:** Hook ACK actions to Firestore writes and optional Cloud Function.
5. **Security + QA:** Finalize Firestore rules, write integration tests hitting emulator, and document manual smoke tests.

## Open Questions
- Do we need role-based editing beyond owner/editor distinction in MVP?
- Should published maps be auto-versioned separately from drafts?
- How do we surface share invitations inside the ACK (badge, notifications)?

Keeping the footprint light lets us merge the scaffolding quickly and iterate with confidence. Once this skeleton is live, adding filters, comments, or richer catalog browsing is just more sugar on top.

# Firestore API Contract (Cloud Saves)
*By Priya "Gizmo" Sharma & Alex "Echo" Johnson*

This is a current-state contract for the Firestore collections used by Dustland’s Adventure Kit (ACK) cloud saves. It focuses only on the fields and parameters that Firestore rules validate or that client queries depend on. Everything else in the documents is treated as an unstructured payload and is out of scope here.

## Frontend persona: Alex "Echo" Johnson (ACK integrator)
I care about the exact shape of the data I must send so the rules accept my writes and my queries return results.

### Required document IDs & fields I send
| Collection | Doc ID format | Fields I must send | Notes |
| --- | --- | --- | --- |
| `maps/{mapId}` | `mapId` (string) | `ownerId` (uid), `visibility` (`private`\|`shared`\|`public`), `updatedAt` (ms epoch), `latestVersionId` (string), `title` (string), `summary` (string) | `ownerId` must match `request.auth.uid` on create. Updates are allowed for owners or editors. |
| `mapVersions/{mapId}_{versionId}` | `${mapId}_${versionId}` | `moduleId` (same as mapId), `versionId` (string), `createdAt` (ms epoch), `createdBy` (uid), `payload` (blob) | Rules enforce doc ID consistency and that the map exists or is created by the same user. |
| `shares/{mapId}_{userId}` | `${mapId}_${userId}` | `mapId`, `userId`, `role` (`viewer`\|`editor`), `addedAt` (ms epoch), `addedBy` (uid) | Only the map owner can create or update shares. Recipients can read their own share doc. |
| `publicListings/{mapId}` | `mapId` | `ownerId`, `title`, `summary`, `updatedAt` (ms epoch), `publishedVersionId` (string\|null) | Anyone can read. Only owner can create/update. |
| `users/{uid}` | `uid` | (freeform per-user cache) | Only the signed-in user can read/write their own doc. |

### Client queries and required indexes
- **My modules:** `maps` where `ownerId == <uid>` ordered by `updatedAt desc`.
  - Requires a composite index on `maps(ownerId, updatedAt desc)`.
- **Shared with me:** `shares` where `userId == <uid>`.
  - Single-field index on `shares.userId` (automatic in Firestore).
- **Public listings:** `publicListings` ordered by `updatedAt desc`.
  - Single-field index on `publicListings.updatedAt` (automatic).
- **Cleanup and lookups:**
  - `shares` where `mapId == <mapId>` (single-field index).
  - `mapVersions` where `moduleId == <mapId>` (single-field index).

### Known mismatch to fix
If the Cloud Function `resolveUserByEmail` is unavailable, the client currently falls back to using the email address (lowercased) as the `userId` in `shares`. That does not match Firebase Auth UIDs, so:
- The recipient’s `shares` query (`userId == <uid>`) won’t return the share.
- The rules allow the owner to create the share, but the recipient can’t read it because their auth UID won’t match the stored email string.

**Action needed:** either require the Cloud Function for all shares, or change the client fallback to store real UIDs (e.g., by inviting via link or another uid-mapping flow).

## Backend persona: Priya "Gizmo" Sharma (rules + infra)
I enforce a minimal contract in Firestore rules. Everything else is freeform.

### Rule-critical fields and validations
These are the only parameters the rules read or enforce.

#### `maps/{mapId}`
- **Create:** `ownerId` must equal `request.auth.uid`.
- **Read:** allowed when `visibility == 'public'`, when a `publicListings/{mapId}` doc exists, when the requester is the owner, or when a `shares/{mapId}_{uid}` doc exists.
- **Update:** allowed for owners or `shares.role == 'editor'`.

#### `mapVersions/{mapId}_{versionId}`
- **Read:** allowed if the associated `maps/{mapId}` is readable.
- **Create:** allowed if:
  - Signed in, and
  - `docId == moduleId + '_' + versionId`, and
  - The requester can edit the map, **or** the map does not yet exist and `createdBy == request.auth.uid`.
- **Update:** allowed only if the ID + `moduleId` + `versionId` remain unchanged, and the requester can edit the map.

#### `shares/{mapId}_{userId}`
- **Create/update:** allowed only for owners, and only when `docId == mapId + '_' + userId` and the `mapId/userId` fields do not change on update.
- **Read:** allowed to the owner or the share recipient (`userId == request.auth.uid`).

#### `publicListings/{mapId}`
- **Read:** allowed to anyone.
- **Create/update:** allowed to the map owner, or if the map doesn’t exist yet and `ownerId == request.auth.uid`.

#### `users/{uid}`
- **Read/write:** allowed only when `uid == request.auth.uid`.

### Rule helper dependencies
- `request.auth.uid` is required for all writes and most reads.
- `shares` docs must exist for shared access, and they must use the auth UID as `userId`.
- `publicListings` presence is treated as public visibility, even if `maps.visibility` is missing.

## Appendix: Field glossary
- `mapId`: Module identifier for `maps` and `publicListings` docs.
- `moduleId`: Same as `mapId` but stored on `mapVersions` for lookups.
- `versionId`: The ACK save revision identifier.
- `ownerId`: Firebase Auth UID of the module owner.
- `createdBy`: Firebase Auth UID that authored a version.
- `role`: `viewer` or `editor`.
- `updatedAt` / `createdAt` / `addedAt`: Milliseconds since epoch, written by the client.

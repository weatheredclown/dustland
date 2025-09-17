# Multiplayer Link Exchange

*By Priya "Gizmo" Sharma*
> **Priority:** 11 – Park until single-player solid.
*Date: 2026-03-22*
*Status: Updated*

> **Gizmo:** Static hosting is our ground truth now. No lobby daemons, no npm installs, just the browser. This revision keeps co-op alive with a clipboard-based handshake that survives GitHub Pages.

## Overview
- The host runs Dustland in a browser and shares a **host code** generated from an `RTCPeerConnection` offer.
- Joiners paste that code, produce an **answer code**, and send it back to the host.
- Once the host pastes the answer, the data channel opens and the game syncs state and multiplayer events.
- Everything happens in-page: no Node.js helper, no WebSocket dependency, and no port-forwarding instructions.

## Signaling Flow
1. **Create Offer:** `Dustland.multiplayer.startHost()` builds a new `RTCPeerConnection` (STUN-only) per invite and encodes the SDP offer as a base64 host code.
2. **Manual Exchange:** Players swap codes over chat, DM, or carrier pigeon. The UI keeps a single active invite to avoid mismatched answers.
3. **Answer Acceptance:** The host calls `acceptAnswer(id, code)` to bind the peer, immediately sending the full game state followed by diff updates.
4. **Fallback:** If WebRTC is missing (headless tests, ultra-old browsers) a loopback transport mimics the handshake with in-memory channels so automated suites still run.

## Session Lifecycle
- **State Authority:** Hosts remain authoritative. `game-state.js` diffs broadcast after each `state:changed` event, and clients apply full snapshots on connect plus partial diffs thereafter.
- **Event Bus Relay:** Movement and combat events piggyback on the data channel. Messages tagged with `__fromNet` prevent feedback loops.
- **Connection Health:** Each connection exposes a `ready` promise so the lobby can report when the channel opens or closes. No background polling or heartbeats are required for the manual flow.

## Browser Requirements
- WebRTC support (DataChannel + STUN) is assumed for real sessions. The built-in STUN list currently uses `stun.l.google.com:19302`.
- Clipboard buttons rely on `navigator.clipboard.writeText`; when unavailable the UI falls back to `document.execCommand('copy')` and prompts players to copy manually.
- Because we lean on copy/paste signaling, there's no discovery component—players coordinate externally.

## Next Steps
- **Polish:** Track multiple pending invites so hosts can juggle more than one friend at a time without regenerating codes.
- **Convenience:** Add QR rendering for host/answer codes to speed up couch co-op.
- **Resilience:** Surface connection status inside the core HUD (e.g., "Waiting for host" vs. "Linked") and expose a reconnect action for flaky networks.

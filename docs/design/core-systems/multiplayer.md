# Multiplayer Wasteland Trek

*By Priya "Gizmo" Sharma*
> **Priority:** 11 – Park until single-player solid.
*Date: 2025-09-05*
*Status: Draft*

> **Gizmo:** Dustland always hinted at survivors traveling together. This doc sketches a lean co-op plan so we can gauge scope before touching the engine.

## Overview
LAN-based peer-to-peer sessions let a host share their world. A small lobby lists nearby games, and joiners sync the current map and party roster.

## Networking Considerations
- Hosts spin up a lightweight lobby server over HTTP 7777 for discovery and WebRTC signaling.
- Actual game data flows through WebRTC data channels with a bundled STUN list so most home routers require zero manual setup.
- When peers share the same LAN and WebRTC fails, the system transparently falls back to WebSocket connections on the same port.
- No dedicated servers; sessions live only while the host stays online.

## Tasks
- [x] Prototype world-state sync over WebSockets.
- [x] Build a lobby screen to list and join LAN sessions.
- [x] Draft a "connection health" overlay that flags when WebRTC falls back to WebSocket so players know why latency shifted.
- [x] Update onboarding copy to highlight that no port-forwarding is required and link to optional troubleshooting tips.
- [x] create button in UI for multiplayer mode accessible from a glyph button under the pencil (adventure kit) in module select

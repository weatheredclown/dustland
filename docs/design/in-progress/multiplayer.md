# Multiplayer Wasteland Trek

*By Priya "Gizmo" Sharma*
*Date: 2025-09-05*
*Status: Draft*

> **Gizmo:** Dustland always hinted at survivors traveling together. This doc sketches a lean co-op plan so we can gauge scope before touching the engine.

## Overview
LAN-based peer-to-peer sessions let a host share their world. A small lobby lists nearby games, and joiners sync the current map and party roster.

## Networking Considerations
- Hosts listen on UDP 7777 for discovery and TCP 7777 for game data.
- Players must open these ports on local firewalls or use temporary port-forwarding on trusted routers.
- No dedicated servers; sessions live only while the host stays online.

## Tasks
- [ ] Prototype world-state sync over WebSockets.
- [ ] Build a lobby screen to list and join LAN sessions.
- [ ] Draft player-facing firewall and port-forwarding guide.

# Multiplayer Link Guide

The old LAN firewall checklist is gone—Dustland now hosts co-op sessions entirely from the browser with manual code exchange. Use this quick reference when walking players through the new flow.

## Hosting Steps
1. Open **Multiplayer** from the main menu.
2. Click **Start Hosting**. The page enables the host controls.
3. Press **Create Host Code** and share the generated text with your friends.
4. When a friend responds with an **answer code**, paste it into the **Answer Code** box and press **Link Player**.
5. Repeat the invite step for each additional friend. Keep the tab open while you play.

## Joining Steps
1. Visit the same multiplayer page.
2. Paste the host’s code into the **Host Code** field and click **Generate Answer**.
3. Copy the answer code and send it back to the host.
4. Wait for the host to confirm; the status message switches to “Linked!” once the data channel opens.

## Tips
- The clipboard buttons use `navigator.clipboard`. If the browser blocks that API, the UI falls back to selecting the text so players can press **Ctrl+C** manually.
- WebRTC requires at least one STUN server to gather candidates. The default list includes `stun.l.google.com:19302`, which works for most home networks. Advanced users can add their own servers by editing `Dustland.multiplayer.startHost({ iceServers: [...] })` before generating invites.
- Because there is no discovery service, teams still need a side channel (Discord, SMS, etc.) to trade codes.

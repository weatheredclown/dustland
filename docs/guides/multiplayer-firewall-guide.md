# Multiplayer Firewall Guide

To host or join LAN sessions, ensure TCP and UDP port **7777** are open:

1. **Windows:**
   - Open *Windows Defender Firewall*.
   - Choose *Advanced Settings* → *Inbound Rules* → *New Rule*.
   - Select *Port*, enter **7777**, and allow connections.
2. **macOS:**
   - Go to *System Settings* → *Network* → *Firewall*.
   - Add Dustland to *Allow incoming connections* and specify port **7777**.
3. **Routers:**
   - Log in to your router and forward TCP/UDP **7777** to the host machine.
   - Save and reboot if required.

Players should share their local IP address with friends to join their session.

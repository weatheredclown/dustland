# Multiplayer Firewall Guide

Use the **Host** button on the multiplayer menu to start a session. By default,
games listen on TCP and UDP port **9000**, so ensure it is open:

1. **Windows:**
   - Open *Windows Defender Firewall*.
   - Choose *Advanced Settings* → *Inbound Rules* → *New Rule*.
   - Select *Port*, enter **9000**, and allow connections.
2. **macOS:**
   - Go to *System Settings* → *Network* → *Firewall*.
   - Add Dustland to *Allow incoming connections* and specify port **9000**.
3. **Routers:**
   - Log in to your router and forward TCP/UDP **9000** to the host machine.
   - Save and reboot if required.

Players should share their local IP address with friends to join their session.

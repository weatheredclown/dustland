# Broadcast Fragment Tutorial

*By Priya "Gizmo" Sharma*

This guide shows modders how to build a story fragment that plugs into the Broadcast Story sequence.

1. Copy an existing fragment like `modules/intro-fragment.module.js` and rename it.
2. In the new module, set `startMap` and `startPoint` inside the `DATA` block to define where the fragment begins.
3. Add any custom scripts or assets the fragment needs under `modules/` and `assets/`.
4. Run `npm run module:export -- <module>` and commit the generated JSON under `data/modules/` for review.
5. Test the fragment by launching `dustland.html?ack-player=1` and selecting **Broadcast Story** from the module picker.
6. Once verified, send a pull request and update `docs/design/in-progress/plot-draft.md` if the fragment advances the main narrative.

Fragments stay lightweight—avoid persistent state and rely on the event bus for cross-module communication. See `docs/guides/event-bus-quirks.md` for pitfalls.

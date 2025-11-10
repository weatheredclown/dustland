# Adventure Construction Kit UX Overhaul
*By Priya "Gizmo" Sharma*

The Adventure Construction Kit (ACK) still makes modders wrestle the UI before they can iterate on modules. Field tests with our quest designers surfaced recurring friction points: hidden state changes, silent data loss, and controls that wobble around the layout. This pass locks down the UX so every action is explicit, keyboard-friendly, and validated before we save.

## NPC Creation Flow
- **Separate creation from commit.** Replace the current toggle-style **Add NPC** button with a persistent **New NPC** control that opens a clearly labelled editor pane. Surface primary actions as **Save** and **Discard** so authors always understand whether they are editing or confirming.
- **Respect edit order.** Prevent the coordinate selector from wiping required fields. Either lock map selection until the author supplies ID, Name, and Title, or preserve partial edits across field changes. The panel should show a short inline hint ("Fill in ID, Name, and Title, then choose a tile") and disable **Save** until the prerequisites are satisfied.
- **Persist selections.** Keep the chosen map coordinates visible and editable after the user clicks away. A small inline badge or tooltip should confirm the current tile rather than resetting silently.

## Control Discoverability
- **Label the navigation.** Increase tab font sizes and pair icons with labels for NPCs, Items, Buildings, Quests, and Zones. The active tab gets a high-contrast highlight plus contextual help so designers instantly know which asset type they are editing.
- **Highlight required actions.** Inline validation messages explain why **Save** is disabled. Required fields glow with a subtle outline until the user provides valid input.
- **Context cues for map mode.** When the editor is waiting for a tile click, change the cursor and show a banner such as "Select a map tile for this NPC". Dismissing the banner exits the mode.

## List and Selector Components
- **Instant refresh.** Any dropdown (quests, NPC assignments, buildings) reloads its options when a new entity is saved. No more re-opening the editor just to see fresh data.
- **Use placeholders.** Replace "(none)" defaults with placeholder copy like "Select NPC…" so unassigned relationships are obvious.
- **Deduplicate IDs.** Validate IDs before commit and block duplicates with an inline warning that links to the existing entity.

## Layout and Scrolling
- **Reduce nested scroll.** Merge stacked panels into collapsible sections and expand the active editor to fill available space. This keeps key controls visible and trims redundant scrollbars.
- **Sticky actions.** Pin **Save**, **Discard**, and **Done** buttons to the bottom of the panel. Even in long forms, authors always see their exit options.

## Global Workflow
- **Persistent toolbar.** Add a top-level strip with Save Module, Undo, Redo, and Export/Import JSON. The toolbar remains visible regardless of which subpanel is active.
- **Mode clarity.** Tabs and breadcrumb copy reinforce the current editing context (e.g., "Editing NPCs → Settlers"). Contextual help panels link to relevant docs.

## Accessibility and Responsiveness
- **Keyboard paths.** Ensure every control follows a logical tab order, supports Enter/Escape shortcuts for Save/Discard, and exposes aria-labels for screen readers.
- **Responsive layout.** Flex panels so the editor works on narrower displays and supports browser zoom without overlapping controls. Critical buttons stay within the viewport, and map overlays adapt to DPI changes.

## Next Steps
1. Prototype the reworked NPC panel with the new action model and validation states.
2. Audit shared dropdown and list components so they respond to data events and accept placeholder labels.
3. Implement the global toolbar and mode indicators, then run usability tests with two module authors.
4. Verify keyboard navigation and responsiveness with automated accessibility tooling before shipping.

Locking these improvements gives the ACK the same reliability as our CLI tools—authors focus on storytelling instead of UI recovery work.

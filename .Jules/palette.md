## 2025-12-23 - [Accessible Editor Actions]
**Learning:** The Adventure Construction Kit (ACK) heavily relies on generated DOM for tree editors and map controls. Many interactive elements (delete buttons, toggle buttons) were icon-only or character-only without ARIA labels, making them inaccessible to screen readers.
**Action:** When generating DOM elements in code (e.g., `document.createElement`), always add `aria-label` to icon-only buttons, especially in complex editors where context is visual.

## 2026-01-14 - [Keyboard Accessible Lists]
**Learning:** Editor lists rendered as simple `<div>` elements are inaccessible to keyboard users.
**Action:** Created `bindListInteraction` helper to automatically add `role="button"`, `tabindex="0"`, and `keydown` handlers (Enter/Space) to list items, and applied it across all ACK list renderers. Also added `:focus-visible` CSS.

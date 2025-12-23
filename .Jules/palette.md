## 2025-12-23 - [Accessible Editor Actions]
**Learning:** The Adventure Construction Kit (ACK) heavily relies on generated DOM for tree editors and map controls. Many interactive elements (delete buttons, toggle buttons) were icon-only or character-only without ARIA labels, making them inaccessible to screen readers.
**Action:** When generating DOM elements in code (e.g., `document.createElement`), always add `aria-label` to icon-only buttons, especially in complex editors where context is visual.

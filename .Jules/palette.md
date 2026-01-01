## 2026-01-01 - [Accessible List Items in ACK]
**Learning:** In the Adventure Construction Kit (ACK), interactive lists (NPCs, Items, etc.) were rendered as `<div>` elements with `onclick` handlers, making them inaccessible to keyboard users.
**Action:** When creating interactive lists, use `<button>` elements (with appropriate styling to remove default button chrome if needed) to ensure they are focusable and operable via keyboard. I introduced a `.list-item-btn` class to maintain the visual design while adding accessibility.

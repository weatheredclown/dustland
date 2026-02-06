
## 2024-05-22 - Replacing Interactive Divs with Buttons
**Learning:** Replacing interactive `div`s with `button` elements in dynamic lists requires a careful CSS reset (`appearance: none`, `background: none`, `border: none`, `text-align: left`, `width: 100%`) to maintain visual consistency while gaining native accessibility benefits like keyboard focus and screen reader support.
**Action:** When refactoring legacy list components, apply the `.list-item-btn` class pattern immediately to ensure focus visibility without breaking the existing layout.

## 2025-02-14 - Empty State Filtering
**Learning:** `setupListFilter` iterates over all children of a list container. When adding empty state elements (e.g., "No items yet"), they must be explicitly excluded from filtering logic (e.g., via class check) to prevent them from being hidden when the user types in the filter box.
**Action:** When implementing empty states in dynamic lists, ensure the filter function ignores elements with `.list-empty-state`.

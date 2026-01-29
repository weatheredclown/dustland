
## 2024-05-22 - Replacing Interactive Divs with Buttons
**Learning:** Replacing interactive `div`s with `button` elements in dynamic lists requires a careful CSS reset (`appearance: none`, `background: none`, `border: none`, `text-align: left`, `width: 100%`) to maintain visual consistency while gaining native accessibility benefits like keyboard focus and screen reader support.
**Action:** When refactoring legacy list components, apply the `.list-item-btn` class pattern immediately to ensure focus visibility without breaking the existing layout.

## 2024-06-03 - Native Buttons for Icon Controls
**Learning:** Converting `span` elements acting as icon buttons to native `<button>` elements provides built-in keyboard accessibility (Enter/Space) and focus management. The existing `.pill` class in `dustland.css` handles the visual styling effectively, but it's crucial to verify `font-size` inheritance and explicit `type="button"` to prevent form submission side effects.
**Action:** Prefer `document.createElement('button')` with `type="button"` and `aria-label` over `span` with `role="button"` for dynamic UI controls.

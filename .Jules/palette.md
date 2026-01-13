
## 2024-05-22 - Replacing Interactive Divs with Buttons
**Learning:** Replacing interactive `div`s with `button` elements in dynamic lists requires a careful CSS reset (`appearance: none`, `background: none`, `border: none`, `text-align: left`, `width: 100%`) to maintain visual consistency while gaining native accessibility benefits like keyboard focus and screen reader support.
**Action:** When refactoring legacy list components, apply the `.list-item-btn` class pattern immediately to ensure focus visibility without breaking the existing layout.

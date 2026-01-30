
## 2024-05-22 - Replacing Interactive Divs with Buttons
**Learning:** Replacing interactive `div`s with `button` elements in dynamic lists requires a careful CSS reset (`appearance: none`, `background: none`, `border: none`, `text-align: left`, `width: 100%`) to maintain visual consistency while gaining native accessibility benefits like keyboard focus and screen reader support.
**Action:** When refactoring legacy list components, apply the `.list-item-btn` class pattern immediately to ensure focus visibility without breaking the existing layout.

## 2024-05-23 - Static ARIA Labels
**Learning:** Prefer adding `aria-label` and `title` attributes directly in the HTML for static UI elements like palettes. Relying on JavaScript injection causes a delay in accessibility and makes the code more complex.
**Action:** Audit existing UI components and move accessibility attributes to HTML where possible.

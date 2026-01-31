
## 2024-05-22 - Replacing Interactive Divs with Buttons
**Learning:** Replacing interactive `div`s with `button` elements in dynamic lists requires a careful CSS reset (`appearance: none`, `background: none`, `border: none`, `text-align: left`, `width: 100%`) to maintain visual consistency while gaining native accessibility benefits like keyboard focus and screen reader support.
**Action:** When refactoring legacy list components, apply the `.list-item-btn` class pattern immediately to ensure focus visibility without breaking the existing layout.

## 2024-05-24 - List Filters and Empty States
**Learning:** The `setupListFilter` utility iterates over `list.children` indiscriminately. Injecting non-filterable elements (like empty state messages) requires ensuring they handle being hidden by the filter logic, or the filter logic needs an exclusion class. For now, empty states are hidden when typing, which is acceptable but noteworthy.
**Action:** When adding static content to filtered lists, verify how `setupListFilter` interacts with it. Consider adding a class exclusion to `setupListFilter` in the future if persistent visibility is needed.

# Trainer UI Mockup

*By Priya "Gizmo" Sharma*

The Upgrade Skills dialog is a lightweight overlay that pops up when a player talks to a trainer NPC and selects **Upgrade Skills**. It keeps the flow quick while showing exactly what each upgrade buys.

### Layout

```
+----------------------------+
| Upgrade Skills      Points:1|
|----------------------------|
| STR 25 -> 30        Cost:1 |
| END 20 -> 25        Cost:1 |
| Dash (new)          Cost:1 |
|                        [✓]|
| [Confirm] [Cancel]        |
+----------------------------+
```

Selecting a row highlights it and fills the preview. The point total updates in real time.

### Data Driven

Each trainer owns a `tree` object that lists possible upgrades. The UI reads this object and renders rows automatically:

```
const trainerTrees = {
  power: [
    { id: 'str', label: 'Strength', cost: 1, before: 25, after: 30 },
    { id: 'dash', label: 'Dash Attack', cost: 1, before: null, after: 'Unlocked' }
  ]
};
```

> **Clown:** Keep the data inline. No external JSON files, just plain objects so the game still runs out of a single HTML file.

The dialog doesn't care how many entries exist; modders add new upgrades by extending the `tree` data. Stats show a `before ➜ after` preview. Abilities list an `Unlocked` tag.

### Flow

1. Player enters the dialog with one or more unspent points.
2. Selecting an upgrade previews the change and grays out unaffordable options.
3. Confirming applies the upgrade and deducts the points; cancel leaves everything untouched.

Fast, clear, and hackable—exactly how our trainers like it. Panels lean on a VGA-style palette to keep it crunchy.

# Event Bus Quirks

*By Priya "Gizmo" Sharma*

The global event bus powers most game interactions. Keep these behaviors in mind when extending modules:

- Handlers run synchronously in the order they were registered; expensive work blocks later listeners.
- Events are broadcast with a plain `emit(type, data)` call; missing listeners fail silently.
- Remove listeners with `off(type, handler)` during `postLoad` teardown to avoid leaks across modules.
- The bus does not clone payloads. Mutating `data` inside a handler affects downstream listeners.

Use the bus sparingly and prefer explicit function calls when modules share tight coupling.

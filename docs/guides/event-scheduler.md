# Event Scheduler Data Reference

The event scheduler lets modules describe timed world and NPC behavior without hand-coding timers. This guide documents the data structures Adventure Kit authors can now use inside their module JSON to stage upcoming events.

## Where schedule data lives

Add a new optional `schedules` block to your module definition. It contains two collections:

- `world`: timeline entries that fire regardless of specific NPCs.
- `npcs`: an array of `{ npcId, timeline }` objects. Each timeline drives events for a specific NPC id in the module.

```json
{
  "schedules": {
    "world": [
      { "event": "stonegate:dawn-toast", "trigger": { "type": "time", "hour": 6 }, "repeat": { "type": "daily" } }
    ],
    "npcs": [
      {
        "npcId": "rygar",
        "timeline": [
          {
            "id": "rygar-morning-patrol",
            "label": "Rygar patrol leaves Stonegate",
            "event": "npc:rygar:patrol",
            "trigger": { "type": "time", "hour": 7, "minute": 30 },
            "repeat": { "type": "daily", "skipIfActive": true },
            "prerequisites": [
              { "type": "flag", "flag": "stonegate.unlocked" }
            ]
          }
        ]
      }
    ]
  }
}
```

The scheduler service (to be implemented in a later task) will read these entries, emit the configured events, and persist progress across saves.

## Timeline entries

Each entry in a timeline follows the schema defined in `data/modules/schema.js`:

- `id` *(optional)* – Unique identifier so other entries can reference this one in `afterEvent` triggers or prerequisites.
- `label` *(optional)* – Short human-friendly description that editor tooling can surface.
- `event` *(required)* – Event key that the scheduler will emit on the global event bus.
- `payload` *(optional)* – Object passed as the payload when the event fires.
- `trigger` *(required)* – Defines when the event should occur. See [Trigger types](#trigger-types).
- `repeat` *(optional)* – Controls how often the event repeats. See [Repeat rules](#repeat-rules).
- `prerequisites` *(optional)* – Array of conditions that must be met before the entry can queue. See [Prerequisites](#prerequisites).
- `notes` *(optional)* – Free-form text for designers.

## Trigger types

The `trigger` field supports four shapes:

| Type | Description |
| --- | --- |
| `immediate` | Fires as soon as prerequisites are satisfied. Useful for one-shot follow-ups chained off other entries. |
| `time` | Fires at a specific in-world hour/minute, optionally scoped to a named or numbered day. Provide `hour` (0–23) and optional `minute` and `day`. |
| `delay` | Waits for the specified `hours` and/or `minutes` once the entry becomes eligible. |
| `afterEvent` | Runs after another scheduled entry completes. Provide `eventId` referencing the other entry's `id`, plus optional `offsetHours`/`offsetMinutes`. |

## Repeat rules

Repeat blocks share a simple structure:

- `type` *(required)* – One of `none`, `interval`, `daily`, or `weekly`.
- `intervalHours` / `intervalMinutes` *(interval only)* – How long to wait between runs. At least one must be present.
- `days` *(weekly only)* – Array of day identifiers (e.g., `"monday"`, `"day3"`) that the event should run on.
- `maxRuns` *(optional)* – Caps how many times the entry repeats before retiring.
- `skipIfActive` *(optional)* – When `true`, the scheduler will not queue a new instance while an earlier run is still executing.

Omit the `repeat` block entirely for one-shot events. Use `type: "none"` to make the intent explicit while still allowing `maxRuns` or `skipIfActive` to apply.

## Prerequisites

Prerequisites gate timeline entries until certain conditions are met. The schema supports four primitives:

| Type | Fields | Purpose |
| --- | --- | --- |
| `flag` | `flag`, optional `value` | Requires a world or module flag to match the expected value (defaults to truthy). |
| `questState` | `questId`, `state` | Ensures a quest has reached a particular state before scheduling. |
| `eventComplete` | `eventId` | Waits for another scheduled entry (identified by `id`) to finish at least once. |
| `script` | `handler` | Calls a custom handler function exported on the module to perform advanced checks. |

Combine multiple prerequisite objects to model AND logic. The scheduler will only enqueue the entry when every listed prerequisite is satisfied.

## Authoring tips

- Give every major entry an `id` and `label` so editor tooling and debug logs stay readable.
- Use `event` namespaces (e.g., `npc:rygar:patrol`) to avoid collisions with base game hooks.
- Pair `afterEvent` triggers with `repeat` rules to build multi-step chains that loop over time.
- Keep payloads compact—stick to serialisable primitives so the eventual scheduler can persist state cleanly.

With these structures in place, upcoming work on the scheduler service and editor visualisation can focus on runtime logic while Adventure Kit authors start sketching their timelines today.

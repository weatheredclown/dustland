# Dialog Navigation & State Machine

*By Alex "Echo" Johnson*
*Date: 2025-08-28*
*Status: Draft*

> **Echo:** Menu-driven conversations should feel deliberate and human—built with plain JavaScript and globals.

## Summary

Menu-driven conversations that feel deliberate and human, built with plain JavaScript and globals. This design introduces a small, testable dialog state machine that hooks into the event bus, reads conversation graphs from ACK-configured data, and renders choices using existing UI controls. It favors clear branches over clever magic and keeps persistent state minimal.

## Goals

- Menu-first UX: directional choices, back/close, no typing.
- ACK-configurable: enable/disable module and tweak options in one place.
- Plain JS + globals: no bundlers; drop-in scripts only.
- Event-bus driven: open, choose, back, and close as events.
- Minimal persistence: ephemeral session; durable flags via ACK.
- Testable: state transitions and navigation validated under Node’s test runner.
- LLM augmentation (Gemini Nano): optionally inject contextually appropriate choices/nodes at runtime under strict bounds and config gates.

## Non‑Goals

- Freeform, unconstrained chat. LLM use here is bounded augmentation of menu choices/nodes, not an open chat system.
- Networked/dialog streaming features.
- Complex runtime templating beyond simple token interpolation.

## User Stories

- As a player, I can talk to an NPC, read a short line, and pick from 2–5 clear options that branch the scene.
- As a designer, I can author dialog nodes in ACK data, add conditions/effects, and preview flows without editing engine code.
- As a tester, I can step a session via events and assert reachable nodes and flags with Node tests.

## UX Outline

- Reuse existing button styles from the HUD and editor for dialog choice buttons.
- Layout: portrait stack — line text, then a vertical list of buttons; optional "Back" and "Close" appear contextually.
- Keyboard: arrows/WASD to move focus; Enter or Space to select; Esc to close.
- Accessibility: ensure focus order matches visual order; no hidden focus traps.

## Data Model (ACK)

Dialog content is a graph of nodes resolved by ID.

Global attachment (no bundler):

```html
<!-- Loaded before core scripts that consume it -->
<script>
  window.ACK = window.ACK || {};
  ACK.dialogs = ACK.dialogs || {
    // example
    "npc.greeter": {
      start: "intro",
      nodes: {
        intro: {
          text: "Welcome to the dust, traveler.",
          choices: [
            { label: "Who are you?", to: "who" },
            { label: "Goodbye.", to: "end" }
          ]
        },
        who: {
          text: "Echoes remember. Names fade.",
          choices: [ { label: "Back", to: "@back" }, { label: "Later.", to: "end" } ]
        },
        end: { text: "Stay light on your feet.", choices: [] }
      }
    }
  };

  ACK.config = ACK.config || {};
  ACK.config.dialogs = {
    enabled: true,
    allowBack: true,
    showDebugIds: false
  };
  ACK.flags = ACK.flags || {}; // durable world flags owned by game state
}
</script>
```

Node schema:

- `text: string | (ctx) => string` — line to render (may interpolate using `ctx`).
- `choices: Choice[]` — each `{ label, to, cond?, effects? }`.
- `to: string` — next node ID; special `"@back"` pops the stack; missing/`end` closes; `"[new]"` or `"new:<slug>"` auto-creates a node (editor/runtime) and jumps to it.
- `cond(ctx): boolean` — optional guard; if false, choice is hidden.
- `effects(ctx): void` — optional; can set `ACK.flags[...]` or emit events.

Optional authoring/runtime metadata (persisted by ACK when available):

- `imports: { flags?: string[], events?: string[], queries?: string[], items?: string[] }` — collected dependencies for spoofing/mocking.

## Events & State Machine

Session state is ephemeral and not saved across loads.

States

- `idle` → no active dialog.
- `active(dialogId, nodeId, stack[])` → rendering node and choices.
- `closing` → teardown animation; returns to `idle`.

Events

- `dialog:open` `{ dialogId, npcId?, context? }` → validate config and enter `active` at `start`.
- `dialog:choose` `{ index }` → evaluate guard, apply `effects`, push current node onto `stack`, and transition to `to`.
- `dialog:back` → if `allowBack` and `stack.length`, pop and transition.
- `dialog:close` → transition to `closing` then `idle`.

Side effects are routed exclusively through `effects(ctx)` and/or separate events (e.g., `inventory:add`, `quest:update`). The dialog runtime itself stays pure aside from session state.

## Components & Wiring

- `components/dialog.js` — runtime + state machine (plain JS, global `DLDialog`).
- `components/hud.js` (existing) — renders choice list using existing button styles; subscribes to dialog events.
- `scripts/balance-tester-agent.js` — can fire sample dialogs to exercise event-bus handlers.
- `adventure-kit.html` / `dustland.html` — load order: world → modules → dialogs.

Global setup (order-sensitive):

1) Load `ACK` data and config.
2) Generate world and register modules.
3) Attach dialog runtime; subscribe to event bus.
4) Render HUD; listen for dialog events.

## LLM Augmentation (Gemini Nano)

Goal: Allow an on-device LLM (Gemini Nano) to propose contextually appropriate additional choices and/or new nodes while a dialog is active, without replacing menu-driven UX.

Config

- `ACK.config.dialogs.llmEnabled: boolean` — master toggle.
- `ACK.config.dialogs.llmMaxChoices: number` — cap generated choices per node (e.g., 1–2).
- `ACK.config.dialogs.llmNamespace: string` — ID prefix for generated nodes (e.g., `gen`).
- `ACK.config.dialogs.llmPersistByDefault: boolean` — if true, accept and persist generated nodes into `ACK.dialogs` via ACK editor; else keep ephemeral.

API

- `DLDialog.registerAugmentor(provider)` — provider receives `{ snapshot, context, imports }` and returns `{ choices?: GenChoice[], nodes?: GenNode[] }`.
- Bus events: `dialog:augment:request` (runtime asks for suggestions), `dialog:augment:apply` (augmentations accepted/applied), `dialog:augment:revoke` (remove ephemeral items).

Flow

1) On `dialog:render`, if `llmEnabled` and under caps, runtime emits `dialog:augment:request` with a compact prompt payload (no secrets), including current node text, visible choices, and any `imports`.
2) A Gemini Nano wrapper subscribes, runs locally, and returns suggested `GenChoice` entries like `{ label, to? }` and optional `GenNode` upserts like `{ id?, node }`.
3) Runtime assigns IDs for missing nodes using `llmNamespace` (e.g., `gen.npc.greeter.001`), inserts nodes into the active dialog (ephemeral unless persistence is enabled), and appends generated choices flagged with `source: 'llm'` and `volatile: true`.
4) HUD renders generated choices with the same button style (optionally with a subtle marker). Authors may accept/persist via ACK editor controls.

Safeguards

- Strict caps on count and frequency; debounce requests.
- Content guard: optional allow/deny filters before apply.
- Offline-first: no network required; wrap is swappable for different on-device models.
- Deterministic fallback: dialog remains fully navigable without augmentation.

Data Format Additions

- Choice may include metadata: `{ label, to, generated?: boolean, source?: 'llm', volatile?: boolean }`.
- Nodes generated at runtime carry `generated: true` and may be excluded from persistence unless accepted.

Persistence

- If `llmPersistByDefault` is true or author accepts via editor, the ACK editor writes generated nodes/choices back to JSON and clears `volatile`.

## Testing Plan

- `npm test` with Node’s test runner.
- Add behavior-driven tests that:
  - Open a dialog and assert initial node.
  - Choose guarded/unavailable options and confirm they are hidden or rejected.
  - Verify `@back` behavior and stack integrity.
  - Assert `effects` mutate flags or emit expected events.
  - Confirm `dialog:close` transitions to `idle`.
- LLM augmentation tests (behind a feature flag) that inject a fake provider and ensure suggestions are capped, flagged, and optionally persisted.
- Auto-node creation tests for `to: "[new]"` and `to: "new:<slug>"` paths.
- Imports generation and spoof playback tests in the ACK editor harness.

Balance/test agents:

- Extend `scripts/balance-tester-agent.js` to open sample dialogs and trace event flows, ensuring no path queue starvation.

## Constraints & Guidelines

- Plain JS, globals only; no imports or bundlers.
- UI buttons must match existing visual style in game and editor.
- Keep persistent state minimal; prefer flags/events over storing conversation history.
- Reflect changes across modules; dialogs toggled and tuned via ACK.
- Presubmit: no unsupported `fetch/import` patterns in HTML (use inline ACK data or script tags as shown).

## Imports & Spoofing (ACK)

Purpose: Let ACK play dialogs through the in-game renderer with the ability to spoof required conditions/queries. To support this, each dialog tracks its external dependencies ("imports").

Definition

- `imports.flags` — string keys read from `ACK.flags` or `ctx.flags` inside `cond`/`effects`.
- `imports.events` — event names emitted by `effects` (e.g., `quest:update`).
- `imports.items` — inventory/item keys referenced.
- `imports.queries` — other read-only lookups (e.g., `world:getFaction`, `npc:relation`).

Generation

- On object load, if `imports` is missing, the runtime attempts to generate it:
  - Static scan: `Function.prototype.toString()` for `cond/effects` heuristics to find accessed keys.
  - Runtime telemetry: wrap `ctx` with Proxies during evaluation to record property reads and event names (no side effects run during analysis mode).
- ACK editor persists `imports` into JSON to avoid re-analysis on subsequent loads.

Spoof Playback (Editor)

- Editor builds a `SpoofedContext` from `imports`, allowing authors to set values for flags/items/queries.
- The in-game renderer is used for preview; conditions read from the spoofed context via Proxies.
- Unknown keys default to neutral values and log for author action.

Sketch

```js
function withImportTracking(ctx, recorder) {
  const track = (obj, bucket) => new Proxy(obj || {}, {
    get(t, k) { if (typeof k === 'string') recorder[bucket].add(k); return t[k]; }
  });
  return {
    flags: track(ctx.flags, 'flags'),
    items: track(ctx.items, 'items'),
    query: new Proxy(ctx.query || {}, {
      get(t, k) { if (typeof k === 'string') recorder.queries.add(k); return t[k]; }
    }),
    emit: (name, payload) => { recorder.events.add(name); /* no-op in analysis */ },
  };
}
```

## Authoring UX (ACK)

- Choice destination helper: selecting `to` value `[new]` in the editor auto-creates a new node with a generated ID (e.g., `auto-001` or `new:<slug>`), inserts it, and focuses it.
- LLM references: when augmentation proposes `to: some.missing.node`, ACK creates a skeleton node with placeholder text and no choices; authors can fill it in later.
- Node ID generation: `dlid(prefix)` helper to ensure uniqueness using dialog ID + increment.
- Batch create: future discussion — markdown-to-tree import for rapid prototyping.

## Rollout

- Phase 1: Ship runtime, sample dialog (`npc.greeter`), and tests behind `ACK.config.dialogs.enabled`.
- Phase 2: Author 2–3 real NPC dialogs; add effects for quests/inventory.
- Phase 3: Optional polish — keyboard shortcuts, debug overlay of node IDs.

## Risks & Mitigations

- Authoring errors (broken node links) → add validation in dev mode; log unresolved `to` targets.
- Overgrown graphs → keep node text terse; prefer scene cuts to deep nesting.
- Side-effect sprawl → constrain mutations to `effects(ctx)` and documented events.

## Open Questions

- Should we expose a built-in choice to auto-repeat the last line for accessibility?
- Do we need per-node timeouts (auto-advance) for scripted scenes?
- Should dialog rendering live in HUD or a dedicated overlay layer?

## TODOs

- Persist LLM suggestions in ACK: Add a clear “Persist LLM nodes” control and per-choice “Accept suggestion” affordance that writes generated nodes/choices into the dialog JSON (removing volatile markers) and updates imports as needed.
- Imports + validation enhancements: Extend imports generation (capture more effects/events and inferred queries) and add an editor validator that highlights unresolved `to` targets or missing imports with actionable UI hints.

## Appendix: Minimal Runtime Sketch

```js
(function () {
  window.DLDialog = window.DLDialog || {};
  const bus = window.EventBus; // assumed global event bus
  let session = { state: 'idle', dialogId: null, nodeId: null, stack: [], ctx: null };
  let augmentor = null;

  function getDialog(id) { return (window.ACK && ACK.dialogs && ACK.dialogs[id]) || null; }
  function currentDialog() { return getDialog(session.dialogId); }
  function currentNode() { const d = currentDialog(); return d && d.nodes[session.nodeId]; }

  function enter(dialogId, context) {
    const d = getDialog(dialogId);
    if (!d || !ACK.config?.dialogs?.enabled) return;
    session = { state: 'active', dialogId, nodeId: d.start, stack: [], ctx: context || {} };
    renderWithAugmentation();
  }

  function choose(index) {
    if (session.state !== 'active') return;
    const node = currentNode();
    const choices = (node.choices || []).filter(c => !c.cond || c.cond(session.ctx));
    const choice = choices[index];
    if (!choice) return;
    if (choice.effects) choice.effects(session.ctx, window.ACK);
    if (choice.to === '@back') return back();
    if (!choice.to || choice.to === 'end') return close();
    session.stack.push(session.nodeId);
    session.nodeId = choice.to;
    renderWithAugmentation();
  }

  function back() {
    if (session.state !== 'active' || !ACK.config?.dialogs?.allowBack) return;
    const prev = session.stack.pop();
    if (prev == null) return;
    session.nodeId = prev;
    renderWithAugmentation();
  }

  function close() {
    session.state = 'idle';
    bus.emit('dialog:closed');
  }

  function snapshot() {
    const d = currentDialog();
    const node = currentNode() || {};
    const visible = (node.choices || []).filter(c => !c.cond || c.cond(session.ctx));
    return {
      dialogId: session.dialogId,
      nodeId: session.nodeId,
      text: typeof node.text === 'function' ? node.text(session.ctx) : node.text,
      choices: visible.map(c => ({ label: c.label, to: c.to }))
    };
  }

  function ensureImports(d) {
    // Placeholder: generate minimal imports if missing
    d.imports = d.imports || { flags: [], events: [], items: [], queries: [] };
  }

  function renderWithAugmentation() {
    const d = currentDialog();
    if (!d) return;
    ensureImports(d);
    const snap = snapshot();
    bus.emit('dialog:render', snap);
    const cfg = ACK.config?.dialogs || {};
    if (!cfg.llmEnabled || !augmentor) return;
    const maxGen = cfg.llmMaxChoices || 0;
    if (!maxGen) return;
    const suggestion = augmentor({ snapshot: snap, context: session.ctx, imports: d.imports });
    if (!suggestion) return;
    const ns = cfg.llmNamespace || 'gen';
    const nodes = suggestion.nodes || [];
    const choices = (suggestion.choices || []).slice(0, maxGen);
    // Upsert nodes
    nodes.forEach((n, i) => {
      const id = n.id || `${ns}.${session.dialogId}.${('000' + i).slice(-3)}`;
      d.nodes[id] = Object.assign({ generated: true }, n.node);
    });
    // Append choices (volatile)
    const node = currentNode();
    node.choices = (node.choices || []).concat(
      choices.map(c => Object.assign({ generated: true, source: 'llm', volatile: true }, c))
    );
    bus.emit('dialog:augment:apply', { dialogId: session.dialogId });
    bus.emit('dialog:render', snapshot());
  }

  DLDialog.registerAugmentor = (fn) => { augmentor = fn; };

  // Wire events
  bus.on('dialog:open', ({ dialogId, context }) => enter(dialogId, context));
  bus.on('dialog:choose', ({ index }) => choose(index));
  bus.on('dialog:back', back);
  bus.on('dialog:close', close);

  Object.assign(DLDialog, { enter, choose, back, close, snapshot });
})();
```

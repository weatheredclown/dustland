# TODO Burn Down Roadmap

*By Priya "Gizmo" Sharma*
> **Priority:** 6 – Align open specs with the broadcast milestone.
> *Date: 2025-09-12*
> *Status: Draft*

> **Gizmo:** We’ve scattered TODO checkboxes across half the archive. This roadmap stitches them into a build order so the caravan stops idling at blocked gates.

## Milestone Sequencing

1. **Scheduler Online, Gates Wired** – Finish the event scheduler service and editor tooling from *Reactive Systems* so the broadcast arc can queue beats instead of relying on ad hoc triggers. Fold in the roaming encounter hooks and portal flag checks outlined in the *Plot Draft* to prove the pipeline end-to-end. ([Reactive Systems](../in-progress/reactive-systems.md) §§36-40; [Plot Draft](../in-progress/plot-draft.md) §§273-280)
2. **Signature Encounters Integrated** – Hook Mara’s canyon puzzle, Jax’s repair run, and Nyx’s conversational tuning into the broadcast flow, journal, and telemetry so Fragment 1–3 ship with complete hero moments. ([Plot Draft](../in-progress/plot-draft.md) §§185-206)
3. **Persona Infrastructure Locked** – Extend the Adventure Kit schema with profile definitions, build the runtime profile service, and surface the editor inspector before wiring personas into the camp UI and broadcast saves. This clears the dependency chain for the Doppelgänger tasks. ([Persona Mechanics](../in-progress/persona-mechanics.md) §§100-113; [Plot Draft](../in-progress/plot-draft.md) §§222-230)
4. **Key Items & Branching Backbone** – Ship the Signal Compass UI, Memory Tape behavior, and branching quest scaffolding alongside relationship persistence so narrative choices stick. ([Plot Draft](../in-progress/plot-draft.md) §§232-249)
5. **Trader Economy Tuning** – Apply the Oasis Trader pricing curve, premium rotation rules, and supporting tests so early-game progression matches our scrap targets. ([Oasis Trader](../in-progress/oasis-trader.md) §§33-40)
6. **Puzzle Suite & Reusable Navigation** – Deliver the radio tower paper design plus implementation, finish the sound-navigation system, and complete graffiti puzzle specs so later fragments have ready-made challenge templates. ([Plot Draft](../in-progress/plot-draft.md) §§252-286)
7. **Hub & World Map Build-Out** – Lock the first hub city, route map, and supporting UI to ground the caravan between missions. ([Plot Draft](../in-progress/plot-draft.md) §§287-296)
8. **Narrative QA & Modder Enablement** – Run the full-fragment playtest loop, capture telemetry, and publish the broadcast fragment tutorial once the systems above stabilize. ([Plot Draft](../in-progress/plot-draft.md) §§299-314)

## Execution Notes

- **Dependency Guardrails:** Milestones 2–4 stay parked until Milestone 1 lands in-engine; they rely on scheduler hooks, persona persistence, and branching saves living in the same build.
- **Parallel Tracks:** Milestone 5 can start once scheduler APIs are stable. Milestone 6’s paper design work overlaps with persona service implementation, but implementation should wait for the scheduler branch to avoid rework.
- **Definition of Done:** Each milestone closes with tests or tooling called out in the source docs (e.g., scheduler regression coverage, trader balance scripts, broadcast telemetry capture). Leave no checkbox behind.
- **Review Cadence:** Hold weekly burn-down reviews with the owning leads—systems (Gizmo), narrative (Echo), economy (Clown), and encounter design (Wing)—to keep blockers visible and re-sequence if new dependencies emerge.

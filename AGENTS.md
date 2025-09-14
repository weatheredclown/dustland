# AGENTS

Guidelines for contributors and automated agents working on Dustland CRT.

## Code style
- Use plain JavaScript with globals; the project has no build step or bundler.
- Keep functions small and avoid heavy frameworks.
- Indent with two spaces and end statements with semicolons.
- Prefer `camelCase` for variables and functions.
- Use optional chaining (`?.`) and nullish coalescing (`??`) instead of `||` when defaulting values to preserve `0` and avoid crashes on missing properties.

## Testing
- Run `npm test` after making changes; it invokes Node's built-in test runner.
- Run `node scripts/supporting/presubmit.js` to check HTML files for unsupported fetch/import patterns.
- Ensure the working tree is clean and tests pass before committing.
- Use `node scripts/supporting/placement-check.js <module-file>` to verify items and NPCs aren't placed on walls or water when editing modules.
- Before adding new tests, check for existing coverage and extend or modify tests instead of duplicating cases.
- Prefer behavior-driven tests that validate outcomes instead of asserting internal implementation details.
- Run `./install-deps.sh` once to install optional browser dependencies required by some tests.
- After touching combat, movement, or NPC logic, run `node scripts/supporting/balance-tester-agent.js` to exercise event-bus handlers and path queues.

## Module editing
- Use the command line tools in `scripts/module-tools` for all module JSON changes.
- The tools mirror the Adventure Kit and provide CRUD commands for NPCs, buildings,
  zones, and nested data such as dialog trees and zone effects.
- Review `docs/guides/module-cli-tools.md` for usage details.
- If a change isn't supported, extend the tools and schema and update the guide before editing modules.

## Commit conventions
- Use concise messages with prefixes such as `feat:`, `fix:`, `system:`, or `docs:`.
- Commit directly to the main branch without creating new branches.

## Versioning
- Version numbers in `package.json` and `scripts/dustland-engine.js` are managed by a GitHub action.
- Include `feat`, `fix`, or `system!` in commit messages to signal minor, patch, or major bumps.
- Avoid manual edits to version fields.

## Documentation
- Update README files or inline comments when behavior or APIs change.
- Avoid referencing features that do not yet exist in the codebase; keep speculative ideas in design docs.
- Extend this file whenever new best practices emerge during development.

## Design documentation
- Keep design docs in `docs/design`.
- Each document should list its author and reflect the background and tone from `docs/team-bios.md`.

## Priorities
- Review `docs/roadmap/prioritized-backlog.md` and favor higher-ranked features when picking tasks.

## UI style
- Ensure any newly added buttons match the visual style of existing controls in both the game and editor.

## Lessons from prior work
- Keep pull requests small and self-contained to simplify review.
- Pair code changes with accompanying tests and documentation updates.
- Avoid sweeping refactors without strong tests or a clear fallback plan.
- Favor simple, menu-driven flows and minimize persistent state.
- Remove dead code promptly and consolidate shared operations.
- Ensure new code works across environments and normalize user-facing data.
- Provide tests for state transitions and dialog navigation to catch regressions early.
- Use `scripts/supporting/dialog-utils.js` to append branching dialog to existing NPCs when expanding modules.
- Reflect game changes across all modules; new functionality should be configurable via the Adventure Kit (ACK).
- Generate the world before applying modules; boot-order mistakes can duplicate rooms or overwrite interiors.
- Avoid fetching local JSON files at runtime; browsers block `file:` requests. Embed data in JavaScript files instead.

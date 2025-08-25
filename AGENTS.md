# AGENTS

Guidelines for contributors and automated agents working on Dustland CRT.

## Code style
- Use plain JavaScript with globals; the project has no build step or bundler.
- Keep functions small and avoid heavy frameworks.
- Indent with two spaces and end statements with semicolons.
- Prefer `camelCase` for variables and functions.

## Testing
- Run `npm test` after making changes; it invokes Node's built-in test runner.
- Run `node presubmit.js` to check HTML files for unsupported fetch/import patterns.
- Ensure the working tree is clean and tests pass before committing.
- Before adding new tests, check for existing coverage and extend or modify tests instead of duplicating cases.

## Commit conventions
- Use concise messages with prefixes such as `feat:`, `fix:`, or `docs:`.
- Commit directly to the main branch without creating new branches.

## Documentation
- Update README files or inline comments when behavior or APIs change.
- Extend this file whenever new best practices emerge during development.

## Design documentation
- Keep design docs in `docs/design`.
- Each document should list its author and reflect the background and tone from `docs/team-bios.md`.

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
- Reflect game changes across all modules; new functionality should be configurable via the Adventure Kit (ACK).

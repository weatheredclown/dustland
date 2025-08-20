# AGENTS

Guidelines for contributors and automated agents working on Dustland CRT.

## Code style
- Use modern ES modules; the project is plain JavaScript with no build step.
- Keep functions small and avoid heavy frameworks.
- Indent with two spaces and end statements with semicolons.
- Prefer `camelCase` for variables and functions.

## Testing
- Run `npm test` after making changes; it invokes Node's built-in test runner.
- Ensure the working tree is clean and tests pass before committing.

## Commit conventions
- Use concise messages with prefixes such as `feat:`, `fix:`, or `docs:`.
- Commit directly to the main branch without creating new branches.

## Documentation
- Update README files or inline comments when behavior or APIs change.
- Extend this file whenever new best practices emerge during development.

## Lessons from prior work
- Keep pull requests small and self-contained to simplify review.
- Pair code changes with accompanying tests and documentation updates.
- Avoid sweeping refactors without strong tests or a clear fallback plan.
- Favor simple, menu-driven flows and minimize persistent state.
- Remove dead code promptly and consolidate shared operations.
- Ensure new code works across environments (ES modules only) and normalize user-facing data.
- Provide tests for state transitions and dialog navigation to catch regressions early.
- Reflect game changes across all modules; new functionality should be configurable via the Adventure Kit (ACK).

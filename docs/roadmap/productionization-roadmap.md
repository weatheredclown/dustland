# Productionization Roadmap

*By Priya "Gizmo" Sharma*
> **Priority:** 5 – Lock down release hygiene.

A lean checklist that keeps the browser build ship-ready without introducing heavyweight pipelines.

## Build Reliability
- [x] Add a build health CLI that fails fast when compiled JavaScript is missing or older than its TypeScript source.
- [x] Expose a `npm run check:prod` command that runs the build health scan alongside lint, tests, and HTML presubmit checks.
- [ ] Automate nightly runs of the production check on CI to catch regressions before morning standup.

Current CI runs `npm test`, `npm run lint`, and `node scripts/supporting/presubmit.js` on pushes, but the nightly and release gates for `npm run check:prod` still need to be wired into the workflows.

## Release Comms
- [ ] Draft a one-pager summarizing the production check for the wider team.
- [ ] Fold the new checks into the QA checklist in `docs/guides/qa-checks.md`.

---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-08
oat_current_task_id: p01-t02
oat_generated: false
---

# Implementation: docs-framework-migration

**Started:** 2026-03-08
**Last Updated:** 2026-03-08

> This document is used to resume interrupted implementation sessions.
>
> Conventions:
> - `oat_current_task_id` always points at the **next plan task to do** (not the last completed task).
> - When all plan tasks are complete, set `oat_current_task_id: null`.
> - Reviews are **not** plan tasks. Track review status in `plan.md` under `## Reviews` (e.g., `| final | code | passed | ... |`).
> - Keep phase/task statuses consistent with the Progress Overview table so restarts resume correctly.
> - Before running the `oat-project-pr-final` skill, ensure `## Final Summary (for PR/docs)` is filled with what was actually implemented.

## Progress Overview

| Phase | Status | Tasks | Completed |
|-------|--------|-------|-----------|
| Phase 1: Foundation Packages | in_progress | 12 | 1/12 |
| Phase 2: Scaffold Templates + CLI | pending | 8 | 0/8 |
| Phase 3: Migration + Index Commands | pending | 10 | 0/10 |
| Phase 4: Integration + Polish | pending | 5 | 0/5 |

**Total:** 1/35 tasks completed

---

## Phase 1: Foundation Packages

**Status:** in_progress
**Started:** 2026-03-08

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {2-5 bullets describing user-visible / behavior-level changes delivered in this phase}

**Key files touched:**
- `{path}` - {why}

**Verification:**
- Run: `{command(s)}`
- Result: {pass/fail + notes}

**Notes / Decisions:**
- {trade-offs or deviations discovered during implementation}

### Task p01-t01: Scaffold docs-transforms package

**Status:** completed
**Commit:** df00797

**Outcome:**
- New `@oat/docs-transforms` package created with unified/unist-util-visit dependencies
- Exports empty `defaultTransforms` array as initial barrel export
- Package builds to `dist/` without errors

**Files changed:**
- `packages/docs-transforms/package.json` - package manifest with unified ecosystem deps
- `packages/docs-transforms/tsconfig.json` - TypeScript config extending root
- `packages/docs-transforms/vitest.config.ts` - test config
- `packages/docs-transforms/src/index.ts` - barrel export

**Verification:**
- Run: `pnpm install && pnpm --filter @oat/docs-transforms build`
- Result: pass

---

### Task p01-t02: Implement remarkTabs transform — test cases

**Status:** pending
**Commit:** -

---

### Task p01-t03: Implement remarkTabs transform

**Status:** pending
**Commit:** -

---

### Task p01-t04: Scaffold docs-config package

**Status:** pending
**Commit:** -

---

### Task p01-t05: Implement createDocsConfig factory — test + implement

**Status:** pending
**Commit:** -

---

### Task p01-t06: Implement createSourceConfig factory — test + implement

**Status:** pending
**Commit:** -

---

### Task p01-t07: Scaffold docs-theme package

**Status:** pending
**Commit:** -

---

### Task p01-t08: Implement DocsLayout component

**Status:** pending
**Commit:** -

---

### Task p01-t09: Implement DocsPage component

**Status:** pending
**Commit:** -

---

### Task p01-t10: Implement Mermaid component

**Status:** pending
**Commit:** -

---

### Task p01-t11: Wire FlexSearch in docs-config

**Status:** pending
**Commit:** -

---

### Task p01-t12: Phase 1 integration verify — all packages build

**Status:** pending
**Commit:** -

---

## Phase 2: Scaffold Templates + CLI

**Status:** pending
**Started:** -

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {placeholder}

**Key files touched:**
- `{path}` - {why}

**Verification:**
- Run: `{command(s)}`
- Result: {pass/fail + notes}

**Notes / Decisions:**
- {placeholder}

### Task p02-t01: Create Fumadocs template directory

**Status:** pending
**Commit:** -

---

### Task p02-t02: Rename existing MkDocs template directory

**Status:** pending
**Commit:** -

---

### Task p02-t03: Add framework choice prompt to docs init

**Status:** pending
**Commit:** -

---

### Task p02-t04: Implement Fumadocs scaffold path in scaffold.ts

**Status:** pending
**Commit:** -

---

### Task p02-t05: Set documentation config fields during scaffold

**Status:** pending
**Commit:** -

---

### Task p02-t06: Update bundle-assets script for new templates

**Status:** pending
**Commit:** -

---

### Task p02-t07: Integration test — scaffold Fumadocs app builds

**Status:** pending
**Commit:** -

---

### Task p02-t08: Phase 2 verification — end-to-end scaffold flow

**Status:** pending
**Commit:** -

---

## Phase 3: Migration + Index Commands

**Status:** pending
**Started:** -

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {placeholder}

**Key files touched:**
- `{path}` - {why}

**Verification:**
- Run: `{command(s)}`
- Result: {pass/fail + notes}

**Notes / Decisions:**
- {placeholder}

### Task p03-t01: Create docs migrate command skeleton

**Status:** pending
**Commit:** -

---

### Task p03-t02: Implement admonition-to-GFM codemod — tests

**Status:** pending
**Commit:** -

---

### Task p03-t03: Implement admonition-to-GFM codemod

**Status:** pending
**Commit:** -

---

### Task p03-t04: Implement frontmatter injection — tests + implement

**Status:** pending
**Commit:** -

---

### Task p03-t05: Wire migrate command handler

**Status:** pending
**Commit:** -

---

### Task p03-t06: Create docs index generate command skeleton

**Status:** pending
**Commit:** -

---

### Task p03-t07: Implement index generation logic — tests

**Status:** pending
**Commit:** -

---

### Task p03-t08: Implement index generation logic

**Status:** pending
**Commit:** -

---

### Task p03-t09: Wire index generate command + config update

**Status:** pending
**Commit:** -

---

### Task p03-t10: Phase 3 verification — migrate + index commands

**Status:** pending
**Commit:** -

---

## Phase 4: Integration + Polish

**Status:** pending
**Started:** -

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {placeholder}

**Key files touched:**
- `{path}` - {why}

**Verification:**
- Run: `{command(s)}`
- Result: {pass/fail + notes}

**Notes / Decisions:**
- {placeholder}

### Task p04-t01: Test migration against real fixture data

**Status:** pending
**Commit:** -

---

### Task p04-t02: E2E test — author markdown, build, verify render

**Status:** pending
**Commit:** -

---

### Task p04-t03: Verify MkDocs scaffold still works (FR8)

**Status:** pending
**Commit:** -

---

### Task p04-t04: Verify FlexSearch works in static export

**Status:** pending
**Commit:** -

---

### Task p04-t05: Phase 4 final verification

**Status:** pending
**Commit:** -

---

## Orchestration Runs

> This section is used by `oat-project-subagent-implement` to log parallel execution runs.
> Each run appends a new subsection — never overwrite prior entries.
> For single-thread execution (via `oat-project-implement`), this section remains empty.

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

Chronological log of implementation progress.

### 2026-03-08

**Session Start:** implementation begins

- [ ] p01-t01: Scaffold docs-transforms package

**What changed (high level):**
- {updated as tasks complete}

**Decisions:**
- HiLL checkpoints: pause only after p04 (run all phases continuously)

**Follow-ups / TODO:**
- {updated as needed}

**Blockers:**
- None

---

## Deviations from Plan

Document any deviations from the original plan.

| Task | Planned | Actual | Reason |
|------|---------|--------|--------|
| - | - | - | - |

## Test Results

Track test execution during implementation.

| Phase | Tests Run | Passed | Failed | Coverage |
|-------|-----------|--------|--------|----------|
| 1 | - | - | - | - |
| 2 | - | - | - | - |
| 3 | - | - | - | - |
| 4 | - | - | - | - |

## Final Summary (for PR/docs)

**What shipped:**
- {capability 1}
- {capability 2}

**Behavioral changes (user-facing):**
- {bullet}

**Key files / modules:**
- `{path}` - {purpose}

**Verification performed:**
- {tests/lint/typecheck/build/manual steps}

**Design deltas (if any):**
- {what changed vs design.md and why}

## References

- Plan: `plan.md`
- Design: `design.md`
- Spec: `spec.md`

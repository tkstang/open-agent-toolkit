---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-11
oat_current_task_id: null
oat_generated: false
---

# Implementation: collect-review-comments

**Started:** 2026-03-11
**Last Updated:** 2026-03-11

> This document is used to resume interrupted implementation sessions.
>
> Conventions:
>
> - `oat_current_task_id` always points at the **next plan task to do** (not the last completed task).
> - When all plan tasks are complete, set `oat_current_task_id: null`.
> - Reviews are **not** plan tasks. Track review status in `plan.md` under `## Reviews` (e.g., `| final | code | passed | ... |`).
> - Keep phase/task statuses consistent with the Progress Overview table so restarts resume correctly.
> - Before running the `oat-project-pr-final` skill, ensure `## Final Summary (for PR/docs)` is filled with what was actually implemented.

## Progress Overview

| Phase   | Status   | Tasks | Completed |
| ------- | -------- | ----- | --------- |
| Phase 1 | complete | 7     | 7/7       |

**Total:** 7/7 tasks completed

---

## Phase 1: Core Commands

**Status:** complete
**Started:** 2026-03-11

### Phase Summary

**Outcome (what changed):**

- Added `oat repo` command group as a new top-level namespace for repository-level analysis tools
- Added `oat repo pr-comments collect` command that fetches PR review comments from merged PRs via GitHub GraphQL API
- Added `oat repo pr-comments triage-collection` command for interactive keep/discard filtering of collected comments
- Comments are filtered (bots, trivial), assigned stable IDs (RC-001...), grouped by month, and output as paired JSON + Markdown files

**Key files touched:**

- `packages/cli/src/commands/index.ts` — registered `createRepoCommand()`
- `packages/cli/src/commands/repo/index.ts` — `repo` command group
- `packages/cli/src/commands/repo/pr-comments/index.ts` — `pr-comments` subgroup
- `packages/cli/src/commands/repo/pr-comments/collect/` — types, GraphQL queries, core logic, command registration
- `packages/cli/src/commands/repo/pr-comments/triage-collection/` — triage logic, command registration

**Verification:**

- Run: `pnpm --filter @oat/cli type-check` — passed
- Run: `pnpm --filter @oat/cli lint` — passed (0 warnings, 0 errors)
- Run: `pnpm build` — passed (5 tasks successful)
- Run: `pnpm run cli -- repo pr-comments --help` — correct output
- Run: `pnpm run cli -- repo pr-comments collect --help` — correct options

**Notes / Decisions:**

- Used GraphQL API instead of REST to get PR metadata (title, author, merge date) alongside comments in a single query
- Bot filtering uses `[bot]` suffix check on login; configurable known-bot list deferred to follow-up
- Trivial comment detection uses regex patterns (LGTM, nit, +1, thumbsup) — length threshold deferred
- Monthly chunks use comment `createdAt` date, not PR merge date, for grouping

### Task p01-t01: Create repo command group and pr-comments subgroup

**Status:** complete
**Commit:** d766175

### Task p01-t02: Implement collect command — types, GraphQL queries, core logic

**Status:** complete
**Commit:** d766175

### Task p01-t03: Implement triage-collection command

**Status:** complete
**Commit:** d766175

### Task p01-t04: Verification — build, type-check, lint

**Status:** complete
**Commit:** d766175

### Task p01-t05: (review) Fix default repo resolution and nested pagination

**Status:** complete
**Commit:** 18cf5c5f

**Outcome:**

- Added `resolveCurrentRepo()` to `CollectDependencies` — parses `owner/name` from git remote URL (SSH + HTTPS)
- When `--repo` is omitted, repo is resolved from `git remote get-url origin` before any GraphQL queries
- `repo` qualifier is now always present in the search query — prevents cross-repo leakage
- `owner`/`name` are always available for nested review-comment pagination — no more silent truncation

**Verification:**

- Run: `pnpm --filter @oat/cli type-check` — passed
- Run: `pnpm build` — passed

### Task p01-t06: (review) Fix monthly chunking to use merge date and reverse-chronological order

**Status:** complete
**Commit:** f24a06f3

**Outcome:**

- Changed grouping key from `createdAt.slice(0, 7)` to `prMergedAt.slice(0, 7)` — comments now group by PR merge month
- Changed sort order from ascending to descending — output files are now reverse-chronological

**Verification:**

- Run: `pnpm --filter @oat/cli type-check` — passed

### Task p01-t07: (review) Extend noise filtering to match discovery contract

**Status:** complete
**Commit:** 7fded065

**Outcome:**

- Extended GraphQL queries to include `__typename` on author field for both search and pagination queries
- Added three-layer bot detection: API `__typename === 'Bot'`, `[bot]` suffix, known-service login set (14 services)
- Expanded trivial-comment patterns: `looks good`, `ship it`, emoji-only, `nice`, `great`, `thanks`, etc.
- Added word-count threshold (<5 words) with code-reference escape hatch (backticks, file paths, line numbers)
- Updated `GraphQLReviewComment` type to include `__typename` on author

**Verification:**

- Run: `pnpm --filter @oat/cli type-check` — passed
- Run: `pnpm build` — passed (5 tasks successful)

---

## Orchestration Runs

> This section is used by `oat-project-subagent-implement` to log parallel execution runs.
> Each run appends a new subsection — never overwrite prior entries.
> For single-thread execution (via `oat-project-implement`), this section remains empty.

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

- **2026-03-11:** All 4 tasks implemented in a single commit (d766175). Built all files, verified type-check/lint/build pass, pushed to feature branch.
- **2026-03-11:** Final code review received — 3 fix tasks added (p01-t05, p01-t06, p01-t07).
- **2026-03-11:** All 3 review fix tasks completed (18cf5c5f, f24a06f3, 7fded065). Type-check + build pass.

---

## Deviations from Plan

| Task    | Planned               | Actual                      | Reason                                            |
| ------- | --------------------- | --------------------------- | ------------------------------------------------- |
| p01-t01 | Separate commits      | Single commit for all tasks | All tasks were implemented together in one pass   |
| p01-t02 | Configurable bot list | `[bot]` suffix check only   | Deferred configurable known-bot list to follow-up |
| p01-t02 | Length threshold      | Regex patterns only         | Deferred word-count threshold to follow-up        |

## Test Results

Track test execution during implementation.

| Phase | Tests Run                 | Passed   | Failed | Coverage |
| ----- | ------------------------- | -------- | ------ | -------- |
| 1     | type-check + lint + build | all pass | 0      | -        |

## Final Summary (for PR/docs)

**What shipped:**

- `oat repo pr-comments collect` — GraphQL-based PR review comment collector
- `oat repo pr-comments triage-collection` — interactive keep/discard triage

**Behavioral changes (user-facing):**

- New `oat repo` command group available in CLI
- `oat repo pr-comments collect --since 2025-01-01 --repo owner/name` fetches, filters, and outputs review comments
- `oat repo pr-comments triage-collection --month 2025-01` enables interactive curation of collected comments

**Key files / modules:**

- `packages/cli/src/commands/repo/` — new command group
- `packages/cli/src/commands/repo/pr-comments/collect/collect-comments.ts` — core collection logic
- `packages/cli/src/commands/repo/pr-comments/collect/graphql-queries.ts` — GraphQL queries
- `packages/cli/src/commands/repo/pr-comments/collect/pr-comments.types.ts` — type definitions
- `packages/cli/src/commands/repo/pr-comments/triage-collection/triage-comments.ts` — triage logic

**Verification performed:**

- type-check, lint, build all pass
- CLI help output verified for all new commands

**Design deltas (if any):**

- GraphQL API chosen over REST (pivot from discovery's original REST recommendation)
- Bot detection: three-layer approach (API type, `[bot]` suffix, known-service set) — matches discovery contract
- Trivial comment detection: phrase patterns + word-count threshold with code-reference escape — matches discovery contract
- Monthly chunking uses PR merge date (not comment creation date) — matches discovery constraint

### Review Received: final

**Date:** 2026-03-11
**Review artifact:** reviews/code-review-final-2026-03-11.md

**Findings:**

- Critical: 0
- Important: 1
- Medium: 2
- Minor: 0

**New tasks added:** p01-t05, p01-t06, p01-t07

**Fix tasks completed:** p01-t05 (18cf5c5f), p01-t06 (f24a06f3), p01-t07 (7fded065)

**Next:** Request re-review via `oat-project-review-provide code final`, then `oat-project-review-receive` to reach `passed`.

## References

- Plan: `plan.md`
- Discovery: `discovery.md`

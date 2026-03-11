---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-11
oat_current_task_id: p02-t07
oat_generated: false
---

# Implementation: docs-reorganization

**Started:** 2026-03-10
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

| Phase                                                              | Status      | Tasks | Completed |
| ------------------------------------------------------------------ | ----------- | ----- | --------- |
| Phase 1: Directory Structure and File Moves                        | completed   | 5     | 5/5       |
| Phase 2: Landing Pages, Guide Pages, and Generated Surface Refresh | in_progress | 7     | 6/7       |
| Phase 3: Cross-Reference Cleanup and Shared Entry-Point Updates    | pending     | 3     | 0/3       |
| Phase 4: Visual Elements and Content Enhancements                  | pending     | 2     | 0/2       |
| Phase 5: Final Verification                                        | pending     | 2     | 0/2       |

**Total:** 11/19 tasks completed

---

## Phase 1: Directory Structure and File Moves

**Status:** completed
**Started:** 2026-03-11

### Task p01-t01: Scaffold New Directory Structure

**Status:** completed
**Commit:** a0269c87

**Outcome (required):**

- Added the new `guide/` and `contributing/` section roots required by the rebased plan.
- Created non-conflicting placeholder `index.md` files for `guide/`, `guide/documentation/`, `guide/workflow/`, and `contributing/`.
- Kept the placeholders minimal so later move tasks can replace or rewrite section content cleanly.

**Files changed:**

- `apps/oat-docs/docs/guide/index.md` - added the user-guide root placeholder
- `apps/oat-docs/docs/guide/documentation/index.md` - added the documentation-section placeholder
- `apps/oat-docs/docs/guide/workflow/index.md` - added the workflow-section placeholder
- `apps/oat-docs/docs/contributing/index.md` - added the contributor-guide root placeholder

**Verification:**

- Run: `find apps/oat-docs/docs -type d | sort`
- Result: pass
- Run: `find apps/oat-docs/docs/guide apps/oat-docs/docs/contributing -maxdepth 3 -type f | sort`
- Result: pass

**Notes / Decisions:**

- Did not create placeholder `guide/provider-sync/index.md`, `guide/skills/index.md`, or `guide/ideas/index.md` because later `git mv` tasks supply those files and the artifact review explicitly removed the create-then-overwrite pattern.

---

### Task p01-t02: Move Provider Interop Files to guide/provider-sync/

**Status:** completed
**Commit:** 23254255

**Outcome (required):**

- Moved the provider interop docs into the new `guide/provider-sync/` section.
- Moved operational safety guidance into `contributing/hooks-and-safety.md`.
- Preserved file history with `git mv` so later rewrites still track back to the original docs.

**Files changed:**

- `apps/oat-docs/docs/guide/provider-sync/index.md` - moved provider-sync section landing page
- `apps/oat-docs/docs/guide/provider-sync/scope-and-surface.md` - moved scope/surface doc
- `apps/oat-docs/docs/guide/provider-sync/commands.md` - moved command reference doc
- `apps/oat-docs/docs/guide/provider-sync/providers.md` - moved provider-specific behavior doc
- `apps/oat-docs/docs/guide/provider-sync/manifest-and-drift.md` - moved manifest/drift doc
- `apps/oat-docs/docs/guide/provider-sync/config.md` - moved sync config doc
- `apps/oat-docs/docs/contributing/hooks-and-safety.md` - moved safety guidance into contributing

**Verification:**

- Run: `find apps/oat-docs/docs/guide/provider-sync -maxdepth 1 -type f | sort`
- Result: pass
- Run: `test -f apps/oat-docs/docs/contributing/hooks-and-safety.md && echo PASS`
- Result: pass
- Run: `find apps/oat-docs/docs/cli/provider-interop -maxdepth 1 -type f | sort`
- Result: pass (empty)

**Notes / Decisions:**

- Left the now-empty `apps/oat-docs/docs/cli/provider-interop/` directory in place for later stale-path cleanup, matching the plan.

---

### Task p01-t03: Move Workflow, Projects, and Review-Analysis Files to guide/workflow/

**Status:** completed
**Commit:** d82d0874

**Outcome (required):**

- Moved workflow lifecycle docs, project artifact docs, and repo-analysis docs into the merged `guide/workflow/` section.
- Preserved `workflow/index.md` and `projects/index.md` as temporary legacy stubs/source material for the later landing-page rewrite.
- Kept the old top-level workflow/projects directories partially intact so stale-path cleanup can happen deliberately in Phase 3.

**Files changed:**

- `apps/oat-docs/docs/guide/workflow/lifecycle.md` - moved lifecycle guide
- `apps/oat-docs/docs/guide/workflow/hill-checkpoints.md` - moved checkpoint guide
- `apps/oat-docs/docs/guide/workflow/reviews.md` - moved review-flow guide
- `apps/oat-docs/docs/guide/workflow/pr-flow.md` - moved PR-flow guide
- `apps/oat-docs/docs/guide/workflow/artifacts.md` - moved project artifact guide
- `apps/oat-docs/docs/guide/workflow/state-machine.md` - moved project state-machine guide
- `apps/oat-docs/docs/guide/workflow/repo-analysis.md` - moved repo PR-comment analysis guide

**Verification:**

- Run: `find apps/oat-docs/docs/guide/workflow -maxdepth 1 -type f | sort`
- Result: pass
- Run: `test -f apps/oat-docs/docs/workflow/index.md && test -f apps/oat-docs/docs/projects/index.md && echo PASS`
- Result: pass
- Run: `find apps/oat-docs/docs/workflow -maxdepth 1 -type f | sort && find apps/oat-docs/docs/projects -maxdepth 1 -type f | sort`
- Result: pass

**Notes / Decisions:**

- The legacy section index pages are intentionally left in place until `guide/workflow/index.md` absorbs their content in Phase 2.

---

### Task p01-t04: Move Documentation Files to guide/documentation/

**Status:** completed
**Commit:** 923724a8

**Outcome (required):**

- Moved the docs-app quickstart, command reference, and docs workflow pages into `guide/documentation/`.
- Preserved the dual-framework docs-command surface by moving the existing docs-app commands page intact for later rewrite.
- Left the remaining `cli/` and `skills/` section roots in place for later moves and cleanup.

**Files changed:**

- `apps/oat-docs/docs/guide/documentation/quickstart.md` - moved docs consumer quickstart
- `apps/oat-docs/docs/guide/documentation/commands.md` - moved docs command surface
- `apps/oat-docs/docs/guide/documentation/workflows.md` - moved docs workflow guide

**Verification:**

- Run: `find apps/oat-docs/docs/guide/documentation -maxdepth 1 -type f | sort`
- Result: pass
- Run: `find apps/oat-docs/docs/cli -maxdepth 1 -type f | sort`
- Result: pass
- Run: `find apps/oat-docs/docs/skills -maxdepth 1 -type f | sort`
- Result: pass

**Notes / Decisions:**

- The moved docs command page still describes both Fumadocs and MkDocs support, which matches the rebased plan and current product behavior.

---

### Task p01-t05: Move Remaining Files to New Locations

**Status:** completed
**Commit:** 93a96c57

**Outcome (required):**

- Moved the remaining planned Phase 1 docs into `guide/` and `contributing/`.
- Created the new `guide/skills/` and `guide/ideas/` directories as move targets.
- Left only the intentionally retained legacy docs in place: `cli/diagnostics.md`, `cli/local-paths.md`, `workflow/index.md`, `projects/index.md`, and the durable reference files.

**Files changed:**

- `apps/oat-docs/docs/guide/getting-started.md` - moved bootstrap docs
- `apps/oat-docs/docs/guide/tool-packs.md` - moved tool-pack docs
- `apps/oat-docs/docs/guide/cli-reference.md` - moved CLI index for later rewrite
- `apps/oat-docs/docs/guide/skills/index.md` - moved skills index
- `apps/oat-docs/docs/guide/ideas/index.md` - moved ideas index
- `apps/oat-docs/docs/guide/ideas/lifecycle.md` - moved ideas lifecycle docs
- `apps/oat-docs/docs/contributing/skills.md` - moved skill authoring/runtime contract docs
- `apps/oat-docs/docs/contributing/design-principles.md` - moved CLI design principles
- `apps/oat-docs/docs/contributing/commit-conventions.md` - moved commit conventions
- `apps/oat-docs/docs/contributing/documentation.md` - moved contributor docs page

**Verification:**

- Run: `find apps/oat-docs/docs/guide -maxdepth 2 -type f | sort`
- Result: pass
- Run: `find apps/oat-docs/docs/contributing -maxdepth 1 -type f | sort`
- Result: pass
- Run: `find apps/oat-docs/docs/cli -maxdepth 1 -type f | sort && find apps/oat-docs/docs/reference -maxdepth 1 -type f | sort`
- Result: pass

**Notes / Decisions:**

- `cli/diagnostics.md` and `cli/local-paths.md` remain intentionally for the later CLI-reference rewrite.

### Phase 1 Summary

**Outcome:** The audience-driven directory layout now exists on disk and all planned Phase 1 content moves are complete.

**Key files touched:**

- `apps/oat-docs/docs/guide/**`
- `apps/oat-docs/docs/contributing/**`
- legacy stub survivors in `apps/oat-docs/docs/workflow/index.md` and `apps/oat-docs/docs/projects/index.md`

**Verification run:**

- directory and moved-file presence checks across `guide/`, `contributing/`, and the retained legacy directories

**Notable decisions/deviations:**

- preserved the reviewed temporary-stub strategy for `workflow/index.md` and `projects/index.md`
- retained `cli/diagnostics.md` and `cli/local-paths.md` for planned content absorption in Phase 2

---

## Phase 2: Landing Pages, Guide Pages, and Generated Surface Refresh

**Status:** in_progress
**Started:** -

### Task p02-t01: Rewrite Homepage (apps/oat-docs/docs/index.md)

**Status:** completed
**Commit:** 42e72795

**Outcome (required):**

- Rewrote the homepage around the new guide/contributing/reference information architecture.
- Removed the obsolete manual navigation list that referenced legacy section paths.
- Re-routed the “Choose a usage path” section to the new moved docs sections.

**Files changed:**

- `apps/oat-docs/docs/index.md` - rewrote homepage structure and routing links

**Verification:**

- Run: `sed -n '1,220p' apps/oat-docs/docs/index.md`
- Result: pass
- Run: `test -f apps/oat-docs/docs/guide/index.md && test -f apps/oat-docs/docs/contributing/index.md && test -f apps/oat-docs/docs/reference/index.md`
- Result: pass

**Notes / Decisions:**

- Kept the existing three-capability framing and source-of-truth hierarchy intact, only changing navigation and routing language.

---

### Task p02-t02: Write User Guide Index (guide/index.md)

**Status:** completed
**Commit:** eb13b3c3

**Outcome (required):**

- Replaced the placeholder user-guide index with a real landing page for the new `guide/` section.
- Added the intended guide routing structure so the section now points users to provider sync, docs tooling, workflow, skills, ideas, and CLI reference material.
- Staged `guide/concepts.md` as the immediate next child page so the `## Contents` contract stays valid between tasks.

**Files changed:**

- `apps/oat-docs/docs/guide/index.md` - rewrote the user-guide landing page
- `apps/oat-docs/docs/guide/concepts.md` - added the initial placeholder shell needed for linked section integrity

**Verification:**

- Run: `sed -n '1,220p' apps/oat-docs/docs/guide/index.md`
- Result: pass
- Run: `for f in concepts.md getting-started.md provider-sync/index.md tool-packs.md documentation/index.md workflow/index.md skills/index.md ideas/index.md cli-reference.md; do test -f "apps/oat-docs/docs/guide/$f" || echo "MISSING $f"; done`
- Result: pass after staging `concepts.md`

**Notes / Decisions:**

- Creating a minimal `concepts.md` shell in this task avoided a broken `## Contents` link before `p02-t03` could expand the page.

---

### Task p02-t03: Write Core Concepts Page (guide/concepts.md)

**Status:** completed
**Commit:** 76a0f3bf

**Outcome (required):**

- Replaced the staged concepts placeholder with a real mental-model page for canonical assets, drift, scopes, skills, usage modes, and the workflow layer.
- Linked each concept to the moved docs sections that now hold the detailed behavior.
- Kept the page intentionally conceptual so the later visual-enhancement phase can layer diagrams onto stable prose.

**Files changed:**

- `apps/oat-docs/docs/guide/concepts.md` - expanded the placeholder into the real concepts page

**Verification:**

- Run: `sed -n '1,260p' apps/oat-docs/docs/guide/concepts.md`
- Result: pass
- Run: link existence checks for the referenced guide, contributing, quickstart, and reference pages
- Result: pass

**Notes / Decisions:**

- Deferred diagrams intentionally to `p04-t01`, matching the plan’s separation between prose structure and visual enhancement.

---

### Task p02-t04: Write Contributing Section Index and Sub-Pages

**Status:** completed
**Commit:** cc3a5cc0

**Outcome (required):**

- Replaced the placeholder contributing hub with a real contributor routing page.
- Added a dedicated code-contribution page and a separate markdown-features reference page.
- Reframed the docs and skills pages so contributor guidance is separated from the user-facing guide.

**Files changed:**

- `apps/oat-docs/docs/contributing/index.md` - rewrote contributor landing page
- `apps/oat-docs/docs/contributing/code.md` - added code contribution guide
- `apps/oat-docs/docs/contributing/documentation.md` - reframed docs contributor guide
- `apps/oat-docs/docs/contributing/markdown-features.md` - added markdown syntax reference
- `apps/oat-docs/docs/contributing/skills.md` - reframed execution contracts as skill-authoring guidance

**Verification:**

- Run: contributing file and link existence checks
- Result: pass
- Run: `sed -n '1,220p' apps/oat-docs/docs/contributing/index.md`
- Result: pass
- Run: `sed -n '1,260p' apps/oat-docs/docs/contributing/documentation.md`
- Result: pass

**Notes / Decisions:**

- Reused the existing docs contract content, but moved syntax examples into a dedicated markdown-features page so the contributor landing path is more focused.

---

### Task p02-t05: Write CLI Reference Page (guide/cli-reference.md)

**Status:** completed
**Commit:** 5aa21501

**Outcome (required):**

- Rewrote the moved CLI landing page into a shallow command-surface reference aligned to the new guide structure.
- Folded the short diagnostics and local-path guidance into the reference instead of keeping them as separate top-level destinations.
- Replaced stale pre-reorg links with routes into `guide/documentation/`, `guide/provider-sync/`, and `guide/workflow/`.

**Files changed:**

- `apps/oat-docs/docs/guide/cli-reference.md` - rewrote the CLI map and absorbed diagnostics/local-path guidance

**Verification:**

- Run: `sed -n '1,260p' apps/oat-docs/docs/guide/cli-reference.md`
- Result: pass
- Run: `rg -n "docs-consumer-quickstart|design-principles|bootstrap\\.md|tool-packs-and-assets|local-paths\\.md|diagnostics\\.md|repo-analysis\\.md|provider-interop|docs-apps\\.md" apps/oat-docs/docs/guide/cli-reference.md`
- Result: pass (only expected new-tree link targets remained)

**Notes / Decisions:**

- Kept the page intentionally shallow per plan by routing detailed command behavior to neighboring guide pages instead of duplicating their tables.

---

### Task p02-t06: Write Section Index Pages

**Status:** completed
**Commit:** 3a1b16f7

**Outcome (required):**

- Rewrote the six section landing pages so the new guide/reference structure is discoverable from each section root.
- Merged the old workflow and project introductions into `guide/workflow/index.md`.
- Slimmed `reference/index.md` down to durable reference material and routed contributor-facing material to its new home.

**Files changed:**

- `apps/oat-docs/docs/guide/provider-sync/index.md` - rewrote provider-sync landing page around canonical sync/adoption
- `apps/oat-docs/docs/guide/workflow/index.md` - merged workflow and project intro/routing
- `apps/oat-docs/docs/guide/documentation/index.md` - replaced placeholder with docs routing page
- `apps/oat-docs/docs/guide/skills/index.md` - added use-case guidance and updated skill catalog links
- `apps/oat-docs/docs/guide/ideas/index.md` - reframed ideas as lightweight exploration before projects
- `apps/oat-docs/docs/reference/index.md` - reduced reference to durable shared contracts

**Verification:**

- Run: `sed -n '1,260p'` on the six rewritten index pages
- Result: pass
- Run: stale-path grep across the six rewritten pages
- Result: pass
- Run: targeted `test -f` checks for every `## Contents` destination referenced by the rewritten pages
- Result: pass

**Notes / Decisions:**

- Kept contributor cross-links outside `## Contents` where they are related but not part of the section’s own child-page navigation contract.

---

### Task p02-t07: Refresh the Generated Docs Surface

**Status:** in_progress
**Commit:** -

---

## Phase 3: Cross-Reference Cleanup and Shared Entry-Point Updates

**Status:** pending
**Started:** -

### Task p03-t01: Audit and Fix Cross-References, Then Remove Retired Paths

**Status:** pending
**Commit:** -

---

### Task p03-t02: Trim Quickstart Page

**Status:** pending
**Commit:** -

---

### Task p03-t03: Add Audience Cross-Links

**Status:** pending
**Commit:** -

---

## Phase 4: Visual Elements and Content Enhancements

**Status:** pending
**Started:** -

### Task p04-t01: Add Mermaid Diagrams

**Status:** pending
**Commit:** -

---

### Task p04-t02: Add Tabbed Content

**Status:** pending
**Commit:** -

---

## Phase 5: Final Verification

**Status:** pending
**Started:** -

### Task p05-t01: Final Link Audit and Surface Verification

**Status:** pending
**Commit:** -

---

### Task p05-t02: Run Docs Quality Gates

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

- 2026-03-11: Rebased project artifacts against post-plan merged work. Added lightweight `design.md` and refreshed `discovery.md` and `plan.md` for the current Fumadocs docs app. No implementation tasks completed yet; next task remains `p01-t01`.
- 2026-03-11: Received `artifact-plan-review-2026-03-11.md` for the rebased plan. Applied the approved artifact-only edits to resolve placeholder overwrite conflicts and make legacy workflow/project index handling explicit. No implementation tasks were added.

---

## Deviations from Plan

Document any deviations from the original plan.

| Task | Planned | Actual | Reason |
| ---- | ------- | ------ | ------ |
| -    | -       | -      | -      |

## Test Results

Track test execution during implementation.

| Phase | Tests Run | Passed | Failed | Coverage |
| ----- | --------- | ------ | ------ | -------- |
| 1     | -         | -      | -      | N/A      |
| 2     | -         | -      | -      | N/A      |
| 3     | -         | -      | -      | N/A      |
| 4     | -         | -      | -      | N/A      |
| 5     | -         | -      | -      | N/A      |

## Final Summary (for PR/docs)

**What shipped:**

- {capability 1}

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
- Discovery: `discovery.md`

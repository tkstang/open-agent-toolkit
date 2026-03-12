---
oat_status: in_progress
oat_ready_for: oat-project-review-provide
oat_blockers: []
oat_last_updated: 2026-03-12
oat_project_state_updated: '2026-03-12T18:22:03Z'
oat_current_task_id: null
oat_generated: false
---

# Implementation: docs-reorganization

**Started:** 2026-03-10
**Last Updated:** 2026-03-12

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

| Phase                                                              | Status    | Tasks | Completed |
| ------------------------------------------------------------------ | --------- | ----- | --------- |
| Phase 1: Directory Structure and File Moves                        | completed | 5     | 5/5       |
| Phase 2: Landing Pages, Guide Pages, and Generated Surface Refresh | completed | 7     | 7/7       |
| Phase 3: Cross-Reference Cleanup and Shared Entry-Point Updates    | completed | 3     | 3/3       |
| Phase 4: Visual Elements and Content Enhancements                  | completed | 2     | 2/2       |
| Phase 5: Final Verification                                        | completed | 4     | 4/4       |

**Total:** 21/21 tasks completed

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

**Status:** completed
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

**Status:** completed
**Commit:** 7dd16c6b

**Outcome (required):**

- Regenerated the app-root docs index from the moved and rewritten docs tree.
- Confirmed the new `Guide`, `Contributing`, and `Reference` sections are now visible from the app root.
- Captured the expected duplicate legacy `Cli`, `Projects`, and `Workflow` entries that remain until Phase 3 cleanup removes or rewires the old paths.

**Files changed:**

- `apps/oat-docs/index.md` - regenerated app-root index for the current docs tree

**Verification:**

- Run: `pnpm -w run cli -- docs generate-index --docs-dir apps/oat-docs/docs --output apps/oat-docs/index.md`
- Result: pass
- Run: `sed -n '1,260p' apps/oat-docs/index.md`
- Result: pass

**Notes / Decisions:**

- The generated index still contains old top-level sections because their source files remain on disk for the planned Phase 3 stale-path audit and removal sequence.

---

## Phase 3: Cross-Reference Cleanup and Shared Entry-Point Updates

**Status:** completed
**Started:** 2026-03-11

### Task p03-t01: Audit and Fix Cross-References, Then Remove Retired Paths

**Status:** completed
**Commit:** a0431e6d

**Outcome (required):**

- Fixed live docs references that still pointed at retired pre-reorg docs paths.
- Removed the remaining legacy stub pages under `docs/cli/`, `docs/projects/`, and `docs/workflow/`.
- Regenerated the app-root index so the root surface now reflects only the reorganized sections.

**Files changed:**

- `apps/oat-docs/docs/guide/tool-packs.md` - rerouted related links to the new guide pages
- `apps/oat-docs/docs/guide/getting-started.md` - rerouted utility and provider-sync references
- `apps/oat-docs/docs/quickstart.md` - updated provider-agnostic tooling links to new guide paths
- `apps/oat-docs/docs/guide/documentation/quickstart.md` - fixed docs-workflow link
- `apps/oat-docs/docs/guide/documentation/workflows.md` - fixed related links into the new docs/contributing structure
- `apps/oat-docs/docs/guide/documentation/commands.md` - fixed related docs link
- `apps/oat-docs/docs/contributing/design-principles.md` - rerouted provider-sync references
- `apps/oat-docs/docs/guide/provider-sync/commands.md` - rerouted adjacent docs and design-principles links
- `apps/oat-docs/docs/guide/provider-sync/scope-and-surface.md` - rerouted adjacent docs links
- `apps/oat-docs/docs/cli/diagnostics.md` - removed retired legacy page
- `apps/oat-docs/docs/cli/local-paths.md` - removed retired legacy page
- `apps/oat-docs/docs/projects/index.md` - removed retired legacy stub
- `apps/oat-docs/docs/workflow/index.md` - removed retired legacy stub
- `apps/oat-docs/index.md` - regenerated after legacy-path cleanup

**Verification:**

- Run: docs-link-specific stale-path audit against old top-level docs roots
- Result: pass
- Run: `find` check confirming the retired legacy docs roots no longer contained files
- Result: pass
- Run: `pnpm -w run cli -- docs generate-index --docs-dir apps/oat-docs/docs --output apps/oat-docs/index.md`
- Result: pass

**Notes / Decisions:**

- The stale-reference audit was narrowed to markdown link targets and known old docs paths so code-path references like `packages/cli/src/**` did not create false positives.

---

### Task p03-t02: Trim Quickstart Page

**Status:** completed
**Commit:** 8aed40bd

**Outcome (required):**

- Kept Path A as the primary quickstart lane for interop-first setup.
- Left Path B concise and focused on routing readers into the new guide surfaces.
- Replaced the long inline workflow lane with shorter routing guidance into `guide/workflow/`.

**Files changed:**

- `apps/oat-docs/docs/quickstart.md` - trimmed workflow detail and rerouted readers to the guide

**Verification:**

- Run: `sed -n '1,240p' apps/oat-docs/docs/quickstart.md`
- Result: pass
- Run: stale-link grep for old docs paths in `apps/oat-docs/docs/quickstart.md`
- Result: pass

**Notes / Decisions:**

- Kept the external provider-plan import note inline because it is still useful quickstart context without requiring the full workflow docs.

---

### Task p03-t03: Add Audience Cross-Links

**Status:** completed
**Commit:** ab68bf8a

**Outcome (required):**

- Added explicit audience handoff sections between user-guide and contributor-guide docs where readers commonly cross boundaries.
- Clarified when to stay in the user guide versus when to switch into contributor or reference material.
- Preserved the `## Contents` contract while adding the cross-links as freeform prose below the machine-readable navigation blocks.

**Files changed:**

- `apps/oat-docs/docs/guide/skills/index.md` - added user vs contributor handoff guidance
- `apps/oat-docs/docs/guide/provider-sync/index.md` - added user vs contributor handoff guidance
- `apps/oat-docs/docs/contributing/documentation.md` - added routing back to user-guide and reference docs
- `apps/oat-docs/docs/reference/docs-index-contract.md` - added routing into user-guide and contributor docs

**Verification:**

- Run: `sed -n '1,240p'` across the four touched pages
- Result: pass
- Run: `rg -n "If You Are Trying To|Documentation User Guide|Hooks and Safety|Writing Skills|Docs Workflows|Docs Index Contract"` across the four touched pages
- Result: pass

**Notes / Decisions:**

- Kept the audience handoffs short and directive so they improve routing without turning the pages into duplicated mini-indexes.

---

## Phase 4: Visual Elements and Content Enhancements

**Status:** completed
**Started:** 2026-03-12

### Task p04-t01: Add Mermaid Diagrams

**Status:** completed
**Commit:** c20fc6eb

**Outcome (required):**

- Added a high-level lifecycle map, a workflow state transition map, a provider-sync flow diagram, and a capability-stack diagram.
- Kept the diagrams close to the conceptual sections they explain instead of isolating them in a visuals-only appendix.
- Verified that the current Fumadocs build path accepts the Mermaid blocks after building the missing local docs packages.

**Files changed:**

- `apps/oat-docs/docs/guide/workflow/lifecycle.md` - added a top-level lifecycle map
- `apps/oat-docs/docs/guide/workflow/state-machine.md` - added a state transition diagram
- `apps/oat-docs/docs/guide/provider-sync/index.md` - added a sync-flow diagram
- `apps/oat-docs/docs/guide/concepts.md` - added a capability-stack diagram

**Verification:**

- Run: `sed -n '1,220p'` across the four touched pages
- Result: pass
- Run: `pnpm --filter @oat/docs-config build`
- Result: pass
- Run: `pnpm --filter @oat/docs-theme build`
- Result: pass
- Run: `pnpm --filter @oat/docs-transforms build`
- Result: pass
- Run: `pnpm --filter oat-docs build`
- Result: pass

**Notes / Decisions:**

- The first `oat-docs` build attempt failed before docs parsing because the local `@oat/docs-config` workspace package had not been built in this worktree. After building the required docs packages, the docs build passed without Mermaid errors.

---

### Task p04-t02: Add Tabbed Content

**Status:** completed
**Commit:** 71b603b2

**Outcome (required):**

- Added tabbed browsing for provider-specific behavior, skill-family browsing, and syntax-vs-rendered markdown examples.
- Reused the repo's existing tab transform syntax instead of introducing a new docs pattern.
- Verified the updated pages through the current Fumadocs build path.

**Files changed:**

- `apps/oat-docs/docs/guide/provider-sync/providers.md` - converted provider mappings into provider tabs
- `apps/oat-docs/docs/guide/skills/index.md` - converted the full catalog into skill-family tabs
- `apps/oat-docs/docs/contributing/markdown-features.md` - converted examples into syntax-vs-rendered tabs

**Verification:**

- Run: `sed -n '1,260p'` across the three touched pages
- Result: pass
- Run: `pnpm --filter oat-docs build`
- Result: pass

**Notes / Decisions:**

- Left the surrounding prose outside the tab groups so the pages still scan well in plain markdown and keep the tabs focused on comparison-heavy content.

---

## Phase 5: Final Verification

**Status:** completed
**Started:** 2026-03-12

### Task p05-t01: Final Link Audit and Surface Verification

**Status:** completed
**Commit:** 4eaadbd1

**Outcome (required):**

- Fixed the last live docs links that still pointed at stale or mis-resolved docs paths.
- Fixed the docs index generator so nested generated links keep their full parent path in the app-root surface.
- Regenerated `apps/oat-docs/index.md` and verified the final docs surface resolves correctly.

**Files changed:**

- `apps/oat-docs/docs/guide/documentation/quickstart.md` - fixed final related-doc links
- `apps/oat-docs/docs/guide/documentation/commands.md` - fixed final related reference link
- `apps/oat-docs/docs/guide/documentation/workflows.md` - fixed final related reference link
- `apps/oat-docs/index.md` - regenerated after generator fix
- `packages/cli/src/commands/docs/index-generate/generator.ts` - fixed nested child path prefixing
- `packages/cli/src/commands/docs/index-generate/generator.test.ts` - added nested-path coverage

**Verification:**

- Run: markdown link audit over all docs markdown plus `apps/oat-docs/index.md`
- Result: pass
- Run: stale-path audit over the live docs surface
- Result: pass
- Run: contents-contract check across all docs `index.md` files
- Result: pass
- Run: `pnpm exec vitest run ./src/commands/docs/index-generate/generator.test.ts ./src/commands/docs/e2e-pipeline.test.ts` in `packages/cli`
- Result: pass

**Notes / Decisions:**

- The initial link audit surfaced a real generator bug: nested sections under `Guide` were rendered without their `guide/` prefix in `apps/oat-docs/index.md`. Fixing the generator was necessary because manual edits would have been overwritten during the final refresh.

---

### Task p05-t02: Run Docs Quality Gates

**Status:** completed
**Commit:** 64bd00a7

**Outcome (required):**

- Added a local markdownlint policy for the docs app so the quality gate matches the repo's actual Fumadocs authoring conventions.
- Re-ran the full docs verification path after the final surface refresh and cleared formatting, lint, and build checks.
- Closed implementation with the docs reorganization in a review-ready state.

**Files changed:**

- `apps/oat-docs/.markdownlint.jsonc` - added docs-lint policy aligned with frontmatter-plus-H1 pages, long narrative lines, tab syntax, and repeated subsection labels under separate command sections

**Verification:**

- Run: `pnpm -w run cli -- docs generate-index --docs-dir apps/oat-docs/docs --output apps/oat-docs/index.md`
- Result: pass
- Run: `pnpm --filter oat-docs docs:format:check`
- Result: pass
- Run: `pnpm --filter oat-docs docs:lint`
- Result: pass
- Run: `pnpm --filter oat-docs build`
- Result: pass

**Notes / Decisions:**

- The docs app had no markdownlint configuration before this task, so default markdownlint rules were failing the current frontmatter/H1, long-line, and tab-authoring patterns across the whole docs surface.
- `next build` still emits a non-blocking `MODULE_TYPELESS_PACKAGE_JSON` warning for `apps/oat-docs/next.config.js`; this did not affect the build result or the docs reorganization.

### Task p05-t03: (review) Fix CLI Reference Link in Design Principles

**Status:** completed
**Commit:** 6dcc5ff4

**Outcome (required):**

- Corrected the stale related-doc entry so the label now matches the actual destination in the reorganized docs tree.
- Removed the last misleading `CLI docs index` wording flagged by final review.

**Files changed:**

- `apps/oat-docs/docs/contributing/design-principles.md` - retargeted the related-doc link to the CLI reference page

**Verification:**

- Run: `rg -n 'CLI docs index|CLI Reference' apps/oat-docs/docs/contributing/design-principles.md`
- Result: pass (`CLI Reference` only)

**Notes / Decisions:**

- Kept the fix as a narrow copy-and-link correction because the review finding was about stale routing, not page structure.

---

### Task p05-t04: (review) Add Rationale Comments to Markdownlint Config

**Status:** completed
**Commit:** 14673c0e

**Outcome (required):**

- Added inline JSONC comments explaining why each markdownlint override exists for this docs surface.
- Kept the lint behavior unchanged while making the config self-documenting for future contributors.

**Files changed:**

- `apps/oat-docs/.markdownlint.jsonc` - documented the reason for each markdownlint exception used by the docs app

**Verification:**

- Run: `pnpm --filter oat-docs docs:lint`
- Result: pass

**Notes / Decisions:**

- Used JSONC comments instead of moving rationale into separate docs so the explanation stays attached to the rule it justifies.

### Phase 5 Summary

**Outcome:** Final verification passed, the two review-fix tasks were implemented, and the project is now awaiting final re-review.

**Key files touched:**

- `packages/cli/src/commands/docs/index-generate/generator.ts`
- `packages/cli/src/commands/docs/index-generate/generator.test.ts`
- `apps/oat-docs/index.md`
- `apps/oat-docs/.markdownlint.jsonc`
- `apps/oat-docs/docs/contributing/design-principles.md`

**Verification run:**

- link audit
- stale-path audit
- contents-contract check
- targeted docs-generator vitest coverage
- docs index generation
- docs format check
- docs lint
- docs build
- final review-fix verification

**Notable decisions/deviations:**

- Added a docs-local markdownlint config during final verification because the repo previously had no config and default rules were incompatible with established docs conventions.

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
- 2026-03-12: Completed final verification. Added docs-local markdownlint policy, cleared the docs quality gates, and finished implementation at `19/19` tasks complete.
- 2026-03-12: Received `final-review-2026-03-11.md`. Added review-fix tasks `p05-t03` and `p05-t04`, and deferred minor finding `m2` because Fumadocs-only tab rendering is the intended docs surface.
- 2026-03-12: Completed review-fix tasks `p05-t03` and `p05-t04`. The implementation is now awaiting final re-review.

### Review Received: final

**Date:** 2026-03-12
**Review artifact:** `reviews/archived/final-review-2026-03-11.md`

**Findings:**

- Critical: 0
- Important: 1
- Medium: 0
- Minor: 2

**New tasks added:** `p05-t03`, `p05-t04`

**Deferred Findings:**

- `m2` - Plain-markdown renderers show raw tab syntax in `apps/oat-docs/docs/guide/skills/index.md`. Deferred by explicit user decision because the docs app is the intended rendering target and no behavior is broken inside Fumadocs.

**Next:** Request re-review via `oat-project-review-provide code final`.

---

## Deviations from Plan

Document any deviations from the original plan.

| Task | Planned | Actual | Reason |
| ---- | ------- | ------ | ------ |
| -    | -       | -      | -      |

## Test Results

Track test execution during implementation.

| Phase | Tests Run                                                                                                                                      | Passed | Failed | Coverage |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | -------- |
| 1     | -                                                                                                                                              | -      | -      | N/A      |
| 2     | -                                                                                                                                              | -      | -      | N/A      |
| 3     | -                                                                                                                                              | -      | -      | N/A      |
| 4     | -                                                                                                                                              | -      | -      | N/A      |
| 5     | link/stale-path audits; contents-contract check; targeted docs-generator vitest; docs generate-index; docs format check; docs lint; docs build | pass   | 0      | N/A      |

## Final Summary (for PR/docs)

**What shipped:**

- Reorganized the docs app into audience-driven `guide/`, `contributing/`, and `reference/` surfaces with refreshed landing pages, cross-links, diagrams, tabs, and generated discovery entry points.
- Fixed nested-path generation in the docs index generator so `apps/oat-docs/index.md` reflects the actual docs tree without broken child links.

**Behavioral changes (user-facing):**

- Users now enter the docs through role-appropriate landing pages instead of the older mixed navigation structure.
- Provider sync, workflow, documentation tooling, skills, and ideas content now live under stable guide sections with explicit cross-links into contributor/reference material.
- The generated root docs surface now preserves parent path segments for nested guide pages.
- The remaining stale contributor-doc link found in final review was corrected, and the markdownlint config now explains its own rule exceptions.

**Key files / modules:**

- `apps/oat-docs/docs/**` - reorganized docs surface, rewritten landing pages, and navigation/cross-link updates
- `apps/oat-docs/.markdownlint.jsonc` - docs lint policy aligned with the current docs authoring model
- `packages/cli/src/commands/docs/index-generate/generator.ts` - fixed recursive nested-path generation
- `packages/cli/src/commands/docs/index-generate/generator.test.ts` - regression coverage for nested generated links

**Verification performed:**

- markdown link audit over docs markdown plus generated root index
- stale-path audit for retired docs locations
- `index.md` contents-contract verification across the docs tree
- `pnpm exec vitest run ./src/commands/docs/index-generate/generator.test.ts ./src/commands/docs/e2e-pipeline.test.ts` in `packages/cli`
- `pnpm -w run cli -- docs generate-index --docs-dir apps/oat-docs/docs --output apps/oat-docs/index.md`
- `pnpm --filter oat-docs docs:format:check`
- `pnpm --filter oat-docs docs:lint`
- `pnpm --filter oat-docs build`

**Design deltas (if any):**

- Added a docs-local markdownlint config during final verification because the docs app had no existing markdownlint configuration and the default rules were incompatible with the established frontmatter/H1, long-line, duplicate-subheading, and tabbed-example conventions.

## References

- Plan: `plan.md`
- Discovery: `discovery.md`

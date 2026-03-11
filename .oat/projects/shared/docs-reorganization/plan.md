---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-11
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ['p05']
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: docs-reorganization

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Reorganize OAT documentation around clearer audience-driven navigation, preserve the current Fumadocs docs-app contract, incorporate newly merged command surfaces, and improve discoverability without deleting documentation coverage.

**Architecture:** Reorganize markdown content under `apps/oat-docs/docs/`, regenerate the app-root docs surface at `apps/oat-docs/index.md`, update cross-links and landing pages, and verify the result with Fumadocs-era quality gates instead of MkDocs-specific ones.

**Tech Stack:** Markdown, Fumadocs/Next.js, `@oat/docs-config`, `@oat/docs-theme`, `@oat/docs-transforms` (links, tabs, Mermaid, callouts), existing CLI docs tooling (`oat docs generate-index`, `oat docs nav sync` for MkDocs consumers only)

**Commit Convention:** `docs(pNN-tNN): {description}` - e.g. `docs(p01-t01): scaffold new audience-driven directory structure`

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user
- [x] Set `oat_plan_hill_phases` in frontmatter
- [x] Rebased the plan against merged repo changes from March 10-11, 2026
- [x] Added a lightweight `design.md` because the docs runtime and command surface changed after initial planning

---

## Phase 1: Directory Structure and File Moves

Establish the new audience-driven layout inside `apps/oat-docs/docs/` and move existing content into its new home with minimal rewriting.

### Target Directory Structure

```text
apps/oat-docs/docs/
  index.md
  quickstart.md
  guide/
    index.md
    concepts.md
    getting-started.md
    provider-sync/
      index.md
      scope-and-surface.md
      commands.md
      providers.md
      manifest-and-drift.md
      config.md
    tool-packs.md
    documentation/
      index.md
      quickstart.md
      commands.md
      workflows.md
    workflow/
      index.md
      lifecycle.md
      artifacts.md
      state-machine.md
      hill-checkpoints.md
      reviews.md
      pr-flow.md
      repo-analysis.md
    skills/
      index.md
    ideas/
      index.md
      lifecycle.md
    cli-reference.md
  contributing/
    index.md
    code.md
    documentation.md
    markdown-features.md
    skills.md
    design-principles.md
    commit-conventions.md
    hooks-and-safety.md
  reference/
    index.md
    file-locations.md
    docs-index-contract.md
    oat-directory-structure.md
    troubleshooting.md
```

### Task p01-t01: Scaffold New Directory Structure

**Files:**

- Create: `apps/oat-docs/docs/guide/index.md` (placeholder)
- Create: `apps/oat-docs/docs/guide/documentation/index.md` (placeholder)
- Create: `apps/oat-docs/docs/guide/workflow/index.md` (placeholder)
- Create: `apps/oat-docs/docs/contributing/index.md` (placeholder)

**Step 1: Create directories and placeholder landing pages**

Create every new directory plus the placeholder `index.md` files that are not immediately supplied by a later `git mv`. `guide/provider-sync/index.md`, `guide/skills/index.md`, and `guide/ideas/index.md` should be created by their later move tasks instead of being scaffolded and overwritten here.

**Step 2: Verify**

Run:

```bash
find apps/oat-docs/docs -type d | sort
```

**Step 3: Commit**

```bash
git add apps/oat-docs/docs/guide apps/oat-docs/docs/contributing
git commit -m "docs(p01-t01): scaffold new audience-driven directory structure"
```

---

### Task p01-t02: Move Provider Sync Files to `guide/provider-sync/`

**Files:**

- Move: `apps/oat-docs/docs/cli/provider-interop/index.md` → `apps/oat-docs/docs/guide/provider-sync/index.md`
- Move: `apps/oat-docs/docs/cli/provider-interop/scope-and-surface.md` → `apps/oat-docs/docs/guide/provider-sync/scope-and-surface.md`
- Move: `apps/oat-docs/docs/cli/provider-interop/commands.md` → `apps/oat-docs/docs/guide/provider-sync/commands.md`
- Move: `apps/oat-docs/docs/cli/provider-interop/providers.md` → `apps/oat-docs/docs/guide/provider-sync/providers.md`
- Move: `apps/oat-docs/docs/cli/provider-interop/manifest-and-drift.md` → `apps/oat-docs/docs/guide/provider-sync/manifest-and-drift.md`
- Move: `apps/oat-docs/docs/cli/provider-interop/config.md` → `apps/oat-docs/docs/guide/provider-sync/config.md`
- Move: `apps/oat-docs/docs/cli/provider-interop/hooks-and-safety.md` → `apps/oat-docs/docs/contributing/hooks-and-safety.md`

**Step 1: Move files**

Use `git mv` so history is preserved.

**Step 2: Verify**

Confirm the moved files exist in their new locations and note any remaining references to `cli/provider-interop/` for later cleanup.

**Step 3: Commit**

```bash
git commit -m "docs(p01-t02): elevate provider sync docs into the user guide"
```

---

### Task p01-t03: Move Workflow, Projects, and Review-Analysis Files to `guide/workflow/`

**Files:**

- Move: `apps/oat-docs/docs/workflow/lifecycle.md` → `apps/oat-docs/docs/guide/workflow/lifecycle.md`
- Move: `apps/oat-docs/docs/workflow/hill-checkpoints.md` → `apps/oat-docs/docs/guide/workflow/hill-checkpoints.md`
- Move: `apps/oat-docs/docs/workflow/reviews.md` → `apps/oat-docs/docs/guide/workflow/reviews.md`
- Move: `apps/oat-docs/docs/workflow/pr-flow.md` → `apps/oat-docs/docs/guide/workflow/pr-flow.md`
- Move: `apps/oat-docs/docs/projects/artifacts.md` → `apps/oat-docs/docs/guide/workflow/artifacts.md`
- Move: `apps/oat-docs/docs/projects/state-machine.md` → `apps/oat-docs/docs/guide/workflow/state-machine.md`
- Move: `apps/oat-docs/docs/cli/repo-analysis.md` → `apps/oat-docs/docs/guide/workflow/repo-analysis.md`
- Retain temporarily as legacy stubs/source material: `apps/oat-docs/docs/workflow/index.md`, `apps/oat-docs/docs/projects/index.md`

**Step 1: Move files**

Use `git mv` for each file.

**Step 2: Preserve cleanup sequencing**

Do not remove the legacy `workflow/`, `projects/`, or `cli/` directories yet. Keep `workflow/index.md` and `projects/index.md` in place as temporary legacy stubs/source material until `guide/workflow/index.md` has absorbed their introductory content and Phase 3 confirms repo-wide references are updated.

**Step 3: Verify**

Confirm the workflow section contains lifecycle, project-artifact, and repo-analysis content in one place.

**Step 4: Commit**

```bash
git commit -m "docs(p01-t03): merge workflow, projects, and repo analysis docs"
```

---

### Task p01-t04: Move Documentation Files to `guide/documentation/`

**Files:**

- Move: `apps/oat-docs/docs/cli/docs-consumer-quickstart.md` → `apps/oat-docs/docs/guide/documentation/quickstart.md`
- Move: `apps/oat-docs/docs/cli/docs-apps.md` → `apps/oat-docs/docs/guide/documentation/commands.md`
- Move: `apps/oat-docs/docs/skills/docs-workflows.md` → `apps/oat-docs/docs/guide/documentation/workflows.md`

**Step 1: Move files**

Use `git mv`.

**Step 2: Preserve dual-framework scope**

Keep the moved docs-app commands page aligned with current product behavior: Fumadocs is the live app in this repo, but OAT still supports MkDocs init/migration flows.

**Step 3: Commit**

```bash
git commit -m "docs(p01-t04): consolidate documentation workflow pages"
```

---

### Task p01-t05: Move Remaining Files to Their Audience-Driven Locations

**Files:**

- Move: `apps/oat-docs/docs/cli/bootstrap.md` → `apps/oat-docs/docs/guide/getting-started.md`
- Move: `apps/oat-docs/docs/cli/tool-packs-and-assets.md` → `apps/oat-docs/docs/guide/tool-packs.md`
- Move: `apps/oat-docs/docs/cli/index.md` → `apps/oat-docs/docs/guide/cli-reference.md`
- Move: `apps/oat-docs/docs/skills/index.md` → `apps/oat-docs/docs/guide/skills/index.md`
- Move: `apps/oat-docs/docs/skills/execution-contracts.md` → `apps/oat-docs/docs/contributing/skills.md`
- Move: `apps/oat-docs/docs/ideas/index.md` → `apps/oat-docs/docs/guide/ideas/index.md`
- Move: `apps/oat-docs/docs/ideas/lifecycle.md` → `apps/oat-docs/docs/guide/ideas/lifecycle.md`
- Move: `apps/oat-docs/docs/cli/design-principles.md` → `apps/oat-docs/docs/contributing/design-principles.md`
- Move: `apps/oat-docs/docs/reference/commit-conventions.md` → `apps/oat-docs/docs/contributing/commit-conventions.md`
- Move: `apps/oat-docs/docs/contributing.md` → `apps/oat-docs/docs/contributing/documentation.md`
- Retain temporarily for content extraction and later cleanup: `apps/oat-docs/docs/cli/diagnostics.md`, `apps/oat-docs/docs/cli/local-paths.md`

**Step 1: Move files**

Use `git mv` and leave `diagnostics.md` and `local-paths.md` in place until `guide/cli-reference.md` absorbs the needed content.

**Step 2: Verify**

Confirm no moved page is stranded without an intended landing page in the new tree.

**Step 3: Commit**

```bash
git commit -m "docs(p01-t05): move remaining docs into guide and contributing sections"
```

---

## Phase 2: Landing Pages, Guide Pages, and Generated Surface Refresh

Write the new landing pages and reframe section-level docs for the current product surface.

### Task p02-t01: Rewrite Homepage (`apps/oat-docs/docs/index.md`)

**Files:**

- Modify: `apps/oat-docs/docs/index.md`

**Step 1: Rewrite**

- Keep the high-level OAT introduction and three-capability framing.
- Update `## Contents` to the new audience-driven structure.
- Rewrite `## Choose a usage path` for the new guide/contributing/reference split.
- Remove the redundant `## Navigation` section.
- Keep the source-of-truth hierarchy and align wording to the current repo.

**Step 2: Verify**

Confirm all homepage links resolve to the new locations.

**Step 3: Commit**

```bash
git commit -m "docs(p02-t01): rewrite docs homepage for audience-driven discovery"
```

---

### Task p02-t02: Write User Guide Index

**Files:**

- Modify: `apps/oat-docs/docs/guide/index.md`

**Step 1: Write**

Position `guide/` as the user-facing hub. `## Contents` should route to:

- Core Concepts
- Getting Started
- Provider Sync
- Tool Packs
- Documentation
- Workflow & Projects
- Skills
- Ideas
- CLI Reference

**Step 2: Commit**

```bash
git commit -m "docs(p02-t02): write user guide landing page"
```

---

### Task p02-t03: Write Core Concepts Page

**Files:**

- Create: `apps/oat-docs/docs/guide/concepts.md`

**Step 1: Write**

Synthesize the current mental model from existing content:

- canonical assets and provider views
- sync, drift, and canonical rule adoption
- project vs user scope
- skill workflows versus CLI commands
- the three usage modes
- quick explanation of the workflow lifecycle

Link to deeper pages instead of repeating detailed implementation content.

**Step 2: Commit**

```bash
git commit -m "docs(p02-t03): add core concepts page"
```

---

### Task p02-t04: Write the Contributing Section and Sub-Pages

**Files:**

- Modify: `apps/oat-docs/docs/contributing/index.md`
- Create: `apps/oat-docs/docs/contributing/code.md`
- Modify: `apps/oat-docs/docs/contributing/documentation.md`
- Create: `apps/oat-docs/docs/contributing/markdown-features.md`
- Modify: `apps/oat-docs/docs/contributing/skills.md`

**Step 1: Write `contributing/index.md`**

Create a contributor hub that routes readers into code, docs, markdown features, and skill authoring.

**Step 2: Write `contributing/code.md`**

Cover repo setup, monorepo structure, quality gates, and PR expectations using current repo commands.

**Step 3: Reframe `contributing/documentation.md`**

Keep the docs contract and local workflow. Move the feature catalog out to `markdown-features.md`.

**Step 4: Write `contributing/markdown-features.md`**

Document supported callouts, tabs, Mermaid, code blocks, and other reusable authoring patterns using the current Fumadocs transform behavior.

**Step 5: Reframe `contributing/skills.md`**

Turn the old execution-contract page into a contributor-facing skill-authoring guide while preserving the important runtime contract material.

**Step 6: Commit**

```bash
git commit -m "docs(p02-t04): build out the contributing guide"
```

---

### Task p02-t05: Rewrite the CLI Reference Page

**Files:**

- Modify: `apps/oat-docs/docs/guide/cli-reference.md`

**Step 1: Rewrite**

Use the moved `cli/index.md` as the source and keep this page intentionally shallow:

- command groups and global options
- bootstrap and tool management
- instruction integrity
- provider sync commands
- workflow/project commands
- repo state and internal commands
- `oat repo` command group with a link to detailed workflow/review analysis docs

Absorb the short, reference-style content that currently lives in `apps/oat-docs/docs/cli/diagnostics.md` and `apps/oat-docs/docs/cli/local-paths.md`.

**Step 2: Commit**

```bash
git commit -m "docs(p02-t05): rewrite cli reference around the new guide structure"
```

---

### Task p02-t06: Rewrite Section Index Pages

**Files:**

- Modify: `apps/oat-docs/docs/guide/provider-sync/index.md`
- Modify: `apps/oat-docs/docs/guide/workflow/index.md`
- Modify: `apps/oat-docs/docs/guide/documentation/index.md`
- Modify: `apps/oat-docs/docs/guide/skills/index.md`
- Modify: `apps/oat-docs/docs/guide/ideas/index.md`
- Modify: `apps/oat-docs/docs/reference/index.md`

**Step 1: Rewrite each index**

Each section must satisfy the `## Contents` contract and reflect the new merged repo state.

Specific requirements:

- `guide/provider-sync/index.md`: reflect canonical rule sync/adoption and cross-link to hooks/safety contributor material.
- `guide/workflow/index.md`: merge the intro and routing content from the legacy `workflow/index.md` and `projects/index.md`, then include `repo-analysis.md` in `## Contents`.
- `guide/documentation/index.md`: this page starts from the p01-t01 placeholder; rewrite it to route readers into docs app quickstart, commands, and docs workflows.
- `guide/skills/index.md`: add a short "Key Skills by Use Case" section before the full catalog.
- `reference/index.md`: slim it down to durable shared references after contributor material moves out.

**Step 2: Verify**

Confirm every `## Contents` link resolves.

**Step 3: Commit**

```bash
git commit -m "docs(p02-t06): rewrite section landing pages"
```

---

### Task p02-t07: Refresh the Generated Docs Surface

**Files:**

- Regenerate: `apps/oat-docs/index.md`

**Step 1: Regenerate**

Run:

```bash
pnpm -w run cli -- docs generate-index --docs-dir apps/oat-docs/docs --output apps/oat-docs/index.md
```

**Step 2: Verify**

Review the generated index and confirm the new guide/contributing/reference layout is discoverable from the app root.

**Step 3: Commit**

```bash
git add apps/oat-docs/index.md
git commit -m "docs(p02-t07): refresh generated docs surface index"
```

---

## Phase 3: Cross-Reference Cleanup and Shared Entry-Point Updates

Update relative links, shared entry pages, and stale-path cleanup criteria.

### Task p03-t01: Audit and Fix Cross-References, Then Remove Retired Paths

**Files:**

- Modify: moved docs pages with broken relative links
- Remove only after cleanup passes: retired legacy files/directories under `apps/oat-docs/docs/cli/`, `apps/oat-docs/docs/workflow/`, `apps/oat-docs/docs/projects/`, `apps/oat-docs/docs/skills/`, `apps/oat-docs/docs/ideas/`

**Step 1: Find stale references**

Audit markdown links and repo references to old docs paths. Use both local-doc checks and repo-wide searches.

**Step 2: Fix broken links**

Update relative links in moved pages and any remaining references from non-moved files.

**Step 3: Clean up retired paths**

Only after audits come back clean, remove no-longer-needed legacy files and directories.

**Step 4: Verify**

Re-run the stale-reference audit and confirm no repo docs or project artifacts still point to removed paths.

**Step 5: Commit**

```bash
git commit -m "docs(p03-t01): fix moved-page links and remove retired legacy paths"
```

---

### Task p03-t02: Trim the Shared Quickstart Page

**Files:**

- Modify: `apps/oat-docs/docs/quickstart.md`

**Step 1: Trim**

- Keep Path A (interop-only) as the main quickstart.
- Keep Path B concise and route readers into the new guide sections.
- Reduce the workflow lane details and link to the reorganized workflow docs for the full lifecycle material.
- Update links for the new locations and command surfaces.

**Step 2: Commit**

```bash
git commit -m "docs(p03-t02): trim quickstart and route deeper detail into the guide"
```

---

### Task p03-t03: Add Audience Cross-Links

**Files:**

- Modify: `apps/oat-docs/docs/guide/skills/index.md`
- Modify: `apps/oat-docs/docs/guide/provider-sync/index.md`
- Modify: `apps/oat-docs/docs/contributing/documentation.md`
- Modify: `apps/oat-docs/docs/reference/docs-index-contract.md`

**Step 1: Add cross-links**

Add explicit "if you are trying to..." links between user-guide and contributor-guide pages where audiences overlap.

**Step 2: Commit**

```bash
git commit -m "docs(p03-t03): add cross-links between user and contributor docs"
```

---

## Phase 4: Visual Elements and Content Enhancements

Use the existing Fumadocs markdown transforms to improve comprehension on key pages.

### Task p04-t01: Add Mermaid Diagrams

**Files:**

- Modify: `apps/oat-docs/docs/guide/workflow/lifecycle.md`
- Modify: `apps/oat-docs/docs/guide/workflow/state-machine.md`
- Modify: `apps/oat-docs/docs/guide/provider-sync/index.md`
- Modify: `apps/oat-docs/docs/guide/concepts.md`

**Step 1: Add diagrams**

Create diagrams for:

- workflow lifecycle
- workflow state transitions
- canonical-to-provider sync flow
- high-level OAT capability stack

**Step 2: Verify**

Confirm the diagrams render through the current Fumadocs build path.

**Step 3: Commit**

```bash
git commit -m "docs(p04-t01): add mermaid diagrams for core OAT flows"
```

---

### Task p04-t02: Add Tabbed Content

**Files:**

- Modify: `apps/oat-docs/docs/guide/provider-sync/providers.md`
- Modify: `apps/oat-docs/docs/guide/skills/index.md`
- Modify: `apps/oat-docs/docs/contributing/markdown-features.md`

**Step 1: Add tabs**

Use the repo's existing tab transform syntax for:

- provider-specific behavior
- skill-family browsing
- syntax-vs-rendered markdown examples

**Step 2: Verify**

Confirm tab rendering in the current docs build.

**Step 3: Commit**

```bash
git commit -m "docs(p04-t02): add tabbed content to key docs pages"
```

---

## Phase 5: Final Verification

### Task p05-t01: Final Link Audit and Surface Verification

**Files:**

- Verify: all `apps/oat-docs/docs/**/*.md`
- Verify: `apps/oat-docs/index.md`

**Step 1: Link audit**

Scan all markdown files for internal links and confirm targets exist.

**Step 2: Stale-path audit**

Search the repo for references to retired docs paths and confirm cleanup is complete.

**Step 3: Contents contract check**

Verify every `index.md` in the docs tree contains a valid `## Contents` section.

**Step 4: Generated surface check**

Confirm `apps/oat-docs/index.md` reflects the final docs tree.

**Step 5: Commit (if needed)**

```bash
git commit -m "docs(p05-t01): fix final link and discovery-surface issues"
```

---

### Task p05-t02: Run Docs Quality Gates

**Step 1: Refresh generated index**

```bash
pnpm -w run cli -- docs generate-index --docs-dir apps/oat-docs/docs --output apps/oat-docs/index.md
```

**Step 2: Run markdown quality checks**

```bash
pnpm --filter oat-docs docs:format:check
pnpm --filter oat-docs docs:lint
```

**Step 3: Run the docs build**

```bash
pnpm --filter oat-docs build
```

**Step 4: Fix any failures**

Address formatting, lint, link, or build issues before considering the docs reorganization ready for review.

**Step 5: Final commit (if needed)**

```bash
git commit -m "docs(p05-t02): fix docs quality gate failures"
```

---

## Reviews

| Scope  | Type     | Status          | Date       | Artifact                                              |
| ------ | -------- | --------------- | ---------- | ----------------------------------------------------- |
| design | artifact | pending         | -          | -                                                     |
| plan   | artifact | fixes_completed | 2026-03-11 | `reviews/archived/artifact-plan-review-2026-03-11.md` |
| p01    | code     | pending         | -          | -                                                     |
| p02    | code     | pending         | -          | -                                                     |
| p03    | code     | pending         | -          | -                                                     |
| p04    | code     | pending         | -          | -                                                     |
| p05    | code     | pending         | -          | -                                                     |
| final  | code     | pending         | -          | -                                                     |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

**Meaning:**

- `received`: review artifact exists but findings have not yet been converted into plan or code updates
- `fixes_added`: follow-up work has been added to the plan
- `fixes_completed`: the artifact or implementation has been updated and is ready for re-review
- `passed`: re-review found no blocking issues

---

## Implementation Complete

**Summary:**

- Phase 1: 5 tasks - directory structure and file moves
- Phase 2: 7 tasks - landing pages, guide rewrites, and generated surface refresh
- Phase 3: 3 tasks - cross-reference cleanup and shared entry-point updates
- Phase 4: 2 tasks - Mermaid diagrams and tabbed content
- Phase 5: 2 tasks - final verification and docs quality gates

**Total: 19 tasks**

Ready for implementation against the current docs app.

---

## References

- Discovery: `discovery.md`
- Design: `design.md`
- Plan review: `reviews/archived/artifact-plan-review-2026-03-11.md`

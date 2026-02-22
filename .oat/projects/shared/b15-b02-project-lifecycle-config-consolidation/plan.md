---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-02-21
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ["p10"]
oat_plan_source: imported
oat_import_reference: references/imported-plan.md
oat_import_source_path: /Users/thomas.stang/Code/open-agent-toolkit/.oat/repo/reference/external-plans/b15-b02-project-lifecycle-config-consolidation.md
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: B15 + B02 Project Lifecycle Config Consolidation

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Replace pointer-file project lifecycle state with config-backed state and ship `oat project open/pause` plus `oat config get/set/list`, then migrate CLI/skills to the new interface.

**Architecture:** Centralize repo/shared config in `.oat/config.json` and developer-local state in `.oat/config.local.json`, then route lifecycle commands, dashboard generation, and skills through shared config utilities.

**Tech Stack:** TypeScript ESM, Commander CLI, Vitest, Biome, pnpm workspaces

**Commit Convention:** `{type}({scope}): {description}` - e.g., `feat(p04-t01): add oat project open command`

## Planning Checklist

- [x] Source plan preserved at `references/imported-plan.md`
- [x] Imported plan normalized into canonical `pNN-tNN` OAT tasks
- [x] `oat_plan_source` metadata set to `imported`

---

## Phase 1: Extract Shared Frontmatter Write Utilities

### Task p01-t01: Move frontmatter write helpers to shared command utilities

**Files:**
- Create: `packages/cli/src/commands/shared/frontmatter-write.ts`
- Modify: `packages/cli/src/commands/project/set-mode/index.ts`
- Create: `packages/cli/src/commands/shared/frontmatter-write.test.ts`

**Step 1: Write test (RED)**

Add unit tests for `upsertFrontmatterField()` and `replaceFrontmatter()` covering overwrite behavior and comment preservation.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/shared/frontmatter-write.test.ts`
Expected: Test fails while utilities are not yet extracted.

**Step 2: Implement (GREEN)**

Move helper implementations from `set-mode` into `@commands/shared/frontmatter-write` and update imports.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/shared/frontmatter-write.test.ts`
Expected: Test passes with shared utility module.

**Step 3: Refactor**

Remove duplicated helper logic from `set-mode` and keep one source of truth.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/set-mode/index.test.ts`
Expected: Existing set-mode tests remain green.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/shared/frontmatter-write.ts packages/cli/src/commands/shared/frontmatter-write.test.ts packages/cli/src/commands/project/set-mode/index.ts
git commit -m "refactor(p01-t01): extract shared frontmatter write helpers"
```

---

## Phase 2: Build Config Infrastructure

### Task p02-t01: Add `oat-config` types and read/write/active-project helpers

**Files:**
- Create: `packages/cli/src/config/oat-config.ts`
- Create: `packages/cli/src/config/oat-config.test.ts`

**Step 1: Write test (RED)**

Add tests for:
- default read behavior when config files are missing
- read/write round-trip for `.oat/config.json` and `.oat/config.local.json`
- `resolveActiveProject()` for valid, missing, and invalid paths
- absolute path normalization to repo-relative
- `setActiveProject()` and `clearActiveProject({ lastPaused })`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/config/oat-config.test.ts`
Expected: Test fails before helper module exists.

**Step 2: Implement (GREEN)**

Implement `OatConfig`/`OatLocalConfig` and helper functions:
- `readOatConfig`, `writeOatConfig`
- `readOatLocalConfig`, `writeOatLocalConfig`
- `resolveActiveProject`, `setActiveProject`, `clearActiveProject`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/config/oat-config.test.ts`
Expected: Config helper tests pass.

**Step 3: Refactor**

Ensure all writes include trailing newline and repo-relative path normalization is centralized.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/config/oat-config.test.ts`
Expected: Stable green baseline.

**Step 5: Commit**

```bash
git add packages/cli/src/config/oat-config.ts packages/cli/src/config/oat-config.test.ts
git commit -m "feat(p02-t01): add OAT config utilities and tests"
```

---

### Task p02-t02: Update projects-root resolution chain and gitignore

**Files:**
- Modify: `packages/cli/src/commands/shared/oat-paths.ts`
- Modify: `.gitignore`
- Modify: `packages/cli/src/commands/shared/oat-paths.test.ts` (or nearest coverage)

**Step 1: Write test (RED)**

Add precedence tests for `resolveProjectsRoot()`:
`OAT_PROJECTS_ROOT` env -> `config.json.projects.root` -> `.oat/projects-root` -> default.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/shared/oat-paths.test.ts`
Expected: Test fails before precedence chain is updated.

**Step 2: Implement (GREEN)**

Update shared path resolution code to consume config helper data, keep legacy fallback during migration, and add `.oat/config.local.json` to local-only gitignore section.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/shared/oat-paths.test.ts`
Expected: Precedence tests pass.

**Step 3: Refactor**

Eliminate duplicate projects-root fallback logic in call sites where shared resolver is available.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/shared/oat-paths.test.ts`
Expected: Resolver contract remains green.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/shared/oat-paths.ts packages/cli/src/commands/shared/oat-paths.test.ts .gitignore
git commit -m "feat(p02-t02): resolve projects root from config chain"
```

---

## Phase 3: Add `oat config` CLI Commands

### Task p03-t01: Implement `oat config get/set/list` with key routing and JSON support

**Files:**
- Create: `packages/cli/src/commands/config/index.ts`
- Modify: `packages/cli/src/commands/index.ts`
- Create: `packages/cli/src/commands/config/index.test.ts`

**Step 1: Write test (RED)**

Cover:
- `get` for known keys and unknown key errors
- env override behavior for `projects.root`
- `get projects.root` legacy `.oat/projects-root` fallback
- `set` local vs shared key routing
- nullable empty-string coercion to `null`
- `list` merged values and source labels
- JSON output mode for all subcommands

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/config/index.test.ts`
Expected: Test fails before command registration and handlers.

**Step 2: Implement (GREEN)**

Add command creation + registration and key map for:
- `activeProject`, `lastPausedProject`
- `projects.root`, `worktrees.root`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/config/index.test.ts`
Expected: Command test suite passes.

**Step 3: Refactor**

Extract key metadata/constants to keep `get/set/list` behavior consistent.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/config/index.test.ts`
Expected: All config command tests pass.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/config/index.ts packages/cli/src/commands/config/index.test.ts packages/cli/src/commands/index.ts
git commit -m "feat(p03-t01): add oat config get set list commands"
```

---

## Phase 4: Add `oat project open`

### Task p04-t01: Implement project open/switch/resume semantics with dashboard refresh

**Files:**
- Create: `packages/cli/src/commands/project/open/index.ts`
- Modify: `packages/cli/src/commands/project/index.ts`
- Create: `packages/cli/src/commands/project/open/index.test.ts`

**Step 1: Write test (RED)**

Cover:
- opening with no prior active project
- switching from project A to B
- opening a paused project clears pause fields
- non-existent project and missing `state.md` errors
- JSON output mode

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/open/index.test.ts`
Expected: Test fails before command exists.

**Step 2: Implement (GREEN)**

Implement `oat project open <name> [--reason]` to resolve project path, mutate state frontmatter for paused projects, set `activeProject` in local config, clear matching `lastPausedProject`, and run `generateStateDashboard()`.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/open/index.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Share path + frontmatter mutation utilities with pause/set-mode where possible.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/open/index.test.ts`
Expected: Stable green open command coverage.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/project/open/index.ts packages/cli/src/commands/project/open/index.test.ts packages/cli/src/commands/project/index.ts
git commit -m "feat(p04-t01): add oat project open command"
```

---

## Phase 5: Add `oat project pause`

### Task p05-t01: Implement project pause semantics and last-paused tracking

**Files:**
- Create: `packages/cli/src/commands/project/pause/index.ts`
- Modify: `packages/cli/src/commands/project/index.ts`
- Create: `packages/cli/src/commands/project/pause/index.test.ts`

**Step 1: Write test (RED)**

Cover:
- pausing current active project clears `activeProject` and sets `lastPausedProject`
- pausing named non-active project does not clear active pointer
- pause reason persistence in state frontmatter
- no-project error and invalid-project error
- JSON output mode

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/pause/index.test.ts`
Expected: Test fails before command exists.

**Step 2: Implement (GREEN)**

Implement `oat project pause [name] [--reason]` with state frontmatter updates and conditional local-config pointer clearing, then refresh dashboard.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/pause/index.test.ts`
Expected: Tests pass.

**Step 3: Refactor**

Reuse shared state mutation helpers for lifecycle fields.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/pause/index.test.ts`
Expected: Pause command remains green.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/project/pause/index.ts packages/cli/src/commands/project/pause/index.test.ts packages/cli/src/commands/project/index.ts
git commit -m "feat(p05-t01): add oat project pause command"
```

---

## Phase 6: Update Dashboard Generation for Config + Pause State

### Task p06-t01: Migrate state dashboard readers and next-step guidance

**Files:**
- Modify: `packages/cli/src/commands/state/generate.ts`
- Modify: `packages/cli/src/commands/state/generate.test.ts`

**Step 1: Write test (RED)**

Add coverage for:
- active project read from `.oat/config.local.json`
- paused active project messaging
- no active project + `lastPausedProject` resume guidance
- paused metadata rendering (`oat_pause_timestamp`, `oat_pause_reason`)
- quick command list includes `oat project open/pause`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/state/generate.test.ts`
Expected: Test fails before reader/next-step logic is migrated.

**Step 2: Implement (GREEN)**

Update dashboard state helpers to use config utilities and pause-aware messaging.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/state/generate.test.ts`
Expected: Dashboard tests pass.

**Step 3: Refactor**

Consolidate lifecycle interpretation into a single helper for markdown and next-step logic.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/state/generate.test.ts`
Expected: Dashboard suite remains green.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/state/generate.ts packages/cli/src/commands/state/generate.test.ts
git commit -m "feat(p06-t01): make dashboard config-local and pause aware"
```

---

## Phase 7: Migrate CLI Consumers to Config Helpers

### Task p07-t01: Update project new + set-mode to config-backed active project handling

**Files:**
- Modify: `packages/cli/src/commands/project/new/scaffold.ts`
- Modify: `packages/cli/src/commands/project/set-mode/index.ts`
- Modify: related test files for `project new` and `set-mode`

**Step 1: Write test (RED)**

Add/adjust tests to assert local config writes are used instead of direct pointer file writes.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/new packages/cli/src/commands/project/set-mode`
Expected: Tests fail before migration.

**Step 2: Implement (GREEN)**

Replace direct pointer logic with `setActiveProject()`, `readOatLocalConfig()`, and shared projects-root resolver.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/new packages/cli/src/commands/project/set-mode`
Expected: Tests pass.

**Step 3: Refactor**

Remove stale local pointer helper functions.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/project/new packages/cli/src/commands/project/set-mode`
Expected: Consumer migrations remain green.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/project/new/scaffold.ts packages/cli/src/commands/project/set-mode/index.ts
git commit -m "refactor(p07-t01): migrate project new and set-mode to config"
```

---

### Task p07-t02: Update cleanup + install-workflows config consumers

**Files:**
- Modify: `packages/cli/src/commands/cleanup/project/project.ts`
- Modify: `packages/cli/src/commands/cleanup/artifacts/artifacts.ts`
- Modify: `packages/cli/src/commands/init/tools/workflows/install-workflows.ts`
- Modify: related tests for cleanup/install-workflows

**Step 1: Write test (RED)**

Add coverage for cleanup behavior reading from config-local active project and install-workflows writing projects root to config.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/cleanup packages/cli/src/commands/init/tools/workflows`
Expected: Tests fail before migration.

**Step 2: Implement (GREEN)**

Migrate cleanup readers to config-local and update workflow installer to write `config.json.projects.root` while preserving temporary `.oat/projects-root` compatibility behavior.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/cleanup packages/cli/src/commands/init/tools/workflows`
Expected: Tests pass.

**Step 3: Refactor**

Remove duplicate active-project resolution logic.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/cleanup packages/cli/src/commands/init/tools/workflows`
Expected: Migration remains green.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/cleanup packages/cli/src/commands/init/tools/workflows/install-workflows.ts
git commit -m "refactor(p07-t02): migrate cleanup and workflow install config consumers"
```

---

## Phase 8: Batch-Migrate Skills to `oat config` Commands

### Task p08-t01: Replace pointer-file reads/writes across project skills and templates

**Files:**
- Modify: 22 project-related skill files listed in imported source plan
- Modify: reference-doc skills (`docs-completed-projects-gap-review`, `update-repo-reference`) for projects-root reads
- Modify: `.agents/skills/create-oat-skill/references/oat-skill-template.md`

**Step 1: Write test (RED)**

Add grep-based regression checks for forbidden patterns:
- `cat .oat/active-project`
- `cat .oat/projects-root`

Run: `rg -n "cat \\.oat/(active-project|projects-root)" .agents/skills`
Expected: Existing matches found before migration.

**Step 2: Implement (GREEN)**

Update skill snippets to use:
- `oat config get activeProject`
- `oat config set activeProject ""` or `oat project pause`
- `oat config get projects.root`

Add TODO placeholder in skill docs where command availability must be validated on older branches.

Run: `rg -n "cat \\.oat/(active-project|projects-root)" .agents/skills`
Expected: No remaining matches in migrated skill scope.

**Step 3: Refactor**

Standardize shared resolution snippets so future skill updates change one canonical pattern.

**Step 4: Verify**

Run: `pnpm oat:validate-skills`
Expected: Skill validation passes.

**Step 5: Commit**

```bash
git add .agents/skills
git commit -m "refactor(p08-t01): migrate project skills to oat config commands"
```

---

## Phase 9: Update Worktree Bootstrap Pointer Propagation

### Task p09-t01: Shift bootstrap propagation from pointer files to config.local.json

**Files:**
- Modify: `.agents/skills/oat-worktree-bootstrap/SKILL.md`

**Step 1: Write test (RED)**

Add checklist/assertion text in the skill verification guidance for copying `.oat/config.local.json` and preserving `.oat/active-idea` copy behavior.

Run: `rg -n "active-project|config.local.json|active-idea" .agents/skills/oat-worktree-bootstrap/SKILL.md`
Expected: Existing pointer-centric text still present before update.

**Step 2: Implement (GREEN)**

Replace propagation steps to copy `.oat/config.local.json` (repo-relative paths safe across worktrees) plus `.oat/active-idea`.

Run: `rg -n "active-project" .agents/skills/oat-worktree-bootstrap/SKILL.md`
Expected: Legacy active-project copy guidance removed.

**Step 3: Refactor**

Clarify rationale for repo-relative path portability in copied local config.

**Step 4: Verify**

Run: `pnpm oat:validate-skills`
Expected: Skill remains valid after update.

**Step 5: Commit**

```bash
git add .agents/skills/oat-worktree-bootstrap/SKILL.md
git commit -m "docs(p09-t01): migrate worktree bootstrap pointer propagation"
```

---

## Phase 10: Remove Legacy Fallback Paths and Retire Pointer-Centric Skill Flows

### Task p10-t01: Remove legacy pointer fallback code and simplify legacy lifecycle skills

**Files:**
- Modify: `packages/cli/src/commands/shared/oat-paths.ts`
- Modify: `.gitignore`
- Modify: `.agents/skills/oat-project-clear-active/SKILL.md`
- Modify: `.agents/skills/oat-project-open/SKILL.md`
- Modify: any remaining pointer fallback code/tests

**Step 1: Write test (RED)**

Add regression tests asserting no fallback to `.oat/projects-root` and `.oat/active-project` for migrated commands.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/shared/oat-paths.test.ts`
Expected: Tests fail while fallback code still exists.

**Step 2: Implement (GREEN)**

Remove legacy fallback logic, update gitignore entries, and simplify legacy skills to delegate to `oat project pause/open`.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/shared/oat-paths.test.ts`
Expected: Tests pass with config-only source of truth.

**Step 3: Refactor**

Delete dead helper methods and stale comments describing pointer fallback behavior.

**Step 4: Verify**

Run: `rg -n "\.oat/(active-project|projects-root)" packages/cli/src .agents/skills/oat-project-clear-active .agents/skills/oat-project-open`
Expected: No active-project/projects-root fallback logic remains (except explicitly documented inert-file notes).

**Step 5: Commit**

```bash
git add packages/cli/src/commands/shared/oat-paths.ts .gitignore .agents/skills/oat-project-clear-active/SKILL.md .agents/skills/oat-project-open/SKILL.md
git commit -m "chore(p10-t01): remove legacy project pointer fallbacks"
```

---

## Phase 11: Record Decisions and Execute End-to-End Verification

### Task p11-t01: Add ADR decision records for config-local state and open/pause semantics

**Files:**
- Modify: `.oat/repo/reference/decision-record.md`

**Step 1: Write test (RED)**

Create TODO validation checklist entry for ADR IDs (`ADR-012`, `ADR-013`) since this repo does not appear to have automated ADR linting.

Run: `rg -n "ADR-012|ADR-013" .oat/repo/reference/decision-record.md`
Expected: No matches before update.

**Step 2: Implement (GREEN)**

Add both ADR entries with status/decision/supersedes details captured in the imported plan.

Run: `rg -n "ADR-012|ADR-013" .oat/repo/reference/decision-record.md`
Expected: Both ADR entries present.

**Step 3: Refactor**

Align ADR wording to existing decision-record style.

**Step 4: Verify**

Run: `pnpm lint --filter @oat/cli` (or docs check if available)
Expected: No formatting/lint issues from decision record edits.

**Step 5: Commit**

```bash
git add .oat/repo/reference/decision-record.md
git commit -m "docs(p11-t01): record config-local and lifecycle ADR decisions"
```

---

### Task p11-t02: Run full verification, regression checks, and backlog follow-up capture

**Files:**
- Modify: project notes/review artifacts as needed
- Modify: backlog inbox artifact if tracked in repo

**Step 1: Write test (RED)**

Define a verification checklist artifact that initially marks each integration/regression check as pending.

Run: `pnpm --filter @oat/cli test`
Expected: Use this run to surface any remaining failures before final cleanups.

**Step 2: Implement (GREEN)**

Execute and resolve failures until all checks pass:
- `pnpm --filter @oat/cli test`
- `pnpm build`
- `pnpm lint && pnpm type-check`
- command smoke tests for `oat config`, `oat project open`, `oat project pause`, `oat state refresh`
- skill regression checks from imported plan

Add follow-up backlog item for active-idea migration scope.

Run: `pnpm oat:validate-skills`
Expected: Validation passes and remaining follow-up is explicitly documented.

**Step 3: Refactor**

Tighten any flaky tests surfaced during full suite execution.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test && pnpm build && pnpm lint && pnpm type-check`
Expected: Clean end-to-end status.

**Step 5: Commit**

```bash
git add .
git commit -m "chore(p11-t02): complete lifecycle config consolidation verification"
```

---

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| p01 | code | pending | - | - |
| p02 | code | pending | - | - |
| p03 | code | pending | - | - |
| p04 | code | pending | - | - |
| p05 | code | pending | - | - |
| p06 | code | pending | - | - |
| p07 | code | pending | - | - |
| p08 | code | pending | - | - |
| p09 | code | pending | - | - |
| p10 | code | pending | - | - |
| p11 | code | pending | - | - |
| final | code | pending | - | - |
| spec | artifact | pending | - | - |
| design | artifact | pending | - | - |

**Status values:** `pending` -> `received` -> `fixes_added` -> `fixes_completed` -> `passed`

**Meaning:**
- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**
- Phase 1: 1 task - Shared frontmatter write utility extraction
- Phase 2: 2 tasks - Config utility layer and projects-root precedence update
- Phase 3: 1 task - `oat config get/set/list` command surface
- Phase 4: 1 task - `oat project open` activation/switch/resume behavior
- Phase 5: 1 task - `oat project pause` behavior and last-paused tracking
- Phase 6: 1 task - Dashboard lifecycle/read-path migration
- Phase 7: 2 tasks - CLI consumer migration to config helpers
- Phase 8: 1 task - Batch skill migration from pointer files to config commands
- Phase 9: 1 task - Worktree bootstrap propagation update
- Phase 10: 1 task - Legacy fallback removal and skill flow retirement
- Phase 11: 2 tasks - ADR updates and full verification/regression sweep

**Total: 14 tasks**

Ready for implementation.

---

## References

- Imported Source: `references/imported-plan.md`
- Decision Record: `.oat/repo/reference/decision-record.md`
- Dashboard Generator: `packages/cli/src/commands/state/generate.ts`
- Config Helpers: `packages/cli/src/config/oat-config.ts`

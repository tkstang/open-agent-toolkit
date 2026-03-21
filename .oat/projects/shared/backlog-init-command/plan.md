---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-20
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ['p02'] # phases to pause AFTER completing (empty = every phase)
oat_plan_source: quick # spec-driven | quick | imported
oat_import_reference: null # e.g., references/imported-plan.md
oat_import_source_path: null # original source path provided by user
oat_import_provider: null # codex | cursor | claude | null
oat_generated: false
---

# Implementation Plan: backlog-init-command

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Add an explicit, idempotent `oat backlog init` command that scaffolds the canonical local backlog directory structure and starter files for repositories that do not already have them.

**Architecture:** Extend the existing backlog CLI group with a scaffold command that resolves a backlog root, creates the missing directories and starter markdown files, and leaves existing curated content untouched on rerun. Use the current backlog file structure and managed index markers as the source of truth.

**Tech Stack:** TypeScript ESM, Commander, Node.js 22, Vitest, pnpm workspaces

**Commit Convention:** `{type}({scope}): {description}` - e.g., `feat(p01-t01): add backlog scaffold initializer`

## Planning Checklist

- [x] Deferred HiLL checkpoint confirmation to `oat-project-implement`

---

## Phase 1: Backlog Scaffold Command

Implement the new scaffold command and the filesystem helper it relies on.

### Task p01-t01: Implement backlog scaffold initializer

**Files:**

- Create: `packages/cli/src/commands/backlog/init.ts`
- Create: `packages/cli/src/commands/backlog/init.test.ts`

**Step 1: Write test (RED)**

Add focused tests for a fresh backlog root that assert:

- `items/` and `archived/` are created
- `index.md` is seeded with:
  - `# OAT Backlog Index`
  - `## Curated Overview`
  - `<!-- OAT BACKLOG-INDEX -->` / `<!-- END OAT BACKLOG-INDEX -->`
  - `## Notes`
- `completed.md` is seeded with:
  - `# OAT Backlog Completed`
  - `## Entry Format`
  - `## Completed Items`
- rerunning the initializer does not overwrite existing file contents

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/init.test.ts`
Expected: Test fails (RED)

**Step 2: Implement (GREEN)**

Implement an initializer that creates the backlog root when missing and writes starter content only for files that do not yet exist. Preserve any existing `index.md` or `completed.md` content on rerun.

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/init.test.ts`
Expected: Test passes (GREEN)

**Step 3: Refactor**

Extract reusable starter content/constants as needed so the command remains readable and future content drift is easy to manage.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/init.test.ts`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/commands/backlog/init.ts packages/cli/src/commands/backlog/init.test.ts
git commit -m "feat(p01-t01): add backlog scaffold initializer"
```

---

### Task p01-t02: Wire `oat backlog init` into the CLI

**Files:**

- Modify: `packages/cli/src/commands/backlog/index.ts`
- Modify: `packages/cli/src/commands/help-snapshots.test.ts`

**Step 1: Write test (RED)**

Add or update help snapshot coverage so:

- `oat backlog --help` lists `init`
- `oat backlog init --help` documents the command and `--backlog-root <path>`

**Step 2: Implement (GREEN)**

Register a new `init` subcommand under `createBacklogCommand()` that:

- resolves the backlog root using the same root resolution pattern as the existing backlog commands
- calls the initializer
- reports the resulting backlog root in text and JSON modes

**Step 3: Refactor**

Keep shared backlog-root resolution and output behavior consistent with the existing `generate-id` and `regenerate-index` commands.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/help-snapshots.test.ts`
Expected: Updated snapshots pass

**Step 5: Commit**

```bash
git add packages/cli/src/commands/backlog/index.ts packages/cli/src/commands/help-snapshots.test.ts
git commit -m "feat(p01-t02): add backlog init command"
```

---

## Phase 2: Compatibility Coverage

Prove that the new scaffold works cleanly with the existing backlog command surface and remains safe on rerun.

### Task p02-t01: Add regression coverage for scaffold compatibility

**Files:**

- Modify: `packages/cli/src/commands/backlog/init.test.ts`
- Modify: `packages/cli/src/commands/backlog/regenerate-index.test.ts`

**Step 1: Write test (RED)**

Add regression coverage that:

- runs the scaffold against an empty backlog root and then successfully regenerates the index
- verifies the managed table can be rewritten in the seeded `index.md`
- proves rerunning `init` preserves existing curated overview edits instead of resetting the file

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/init.test.ts src/commands/backlog/regenerate-index.test.ts`
Expected: New regression cases fail (RED)

**Step 2: Implement (GREEN)**

Adjust scaffold content or helper behavior as needed so the seeded files are fully compatible with `regenerate-index` and safe for repeated invocation.

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/init.test.ts src/commands/backlog/regenerate-index.test.ts`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

Tighten any duplicated test setup or scaffold text helpers while keeping the command contract unchanged.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/init.test.ts src/commands/backlog/regenerate-index.test.ts src/commands/help-snapshots.test.ts && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/commands/backlog/init.test.ts packages/cli/src/commands/backlog/regenerate-index.test.ts packages/cli/src/commands/help-snapshots.test.ts
git commit -m "test(p02-t01): cover backlog init compatibility"
```

---

## Phase 3: Review Fixes (final)

Address the final review findings around git-persisted scaffold directories and command-level CLI coverage.

### Task p03-t01: (review) Preserve empty backlog directories across git clone

**Files:**

- Modify: `packages/cli/src/commands/backlog/init.ts`
- Modify: `packages/cli/src/commands/backlog/init.test.ts`
- Modify: `packages/cli/src/commands/backlog/regenerate-index.test.ts`

**Step 1: Understand the issue**

Review finding: `oat backlog init` creates empty `items/` and `archived/` directories but does not seed tracked placeholders, so a committed/cloned scaffold can lose them and `oat backlog regenerate-index` then fails with `ENOENT`.
Location: `packages/cli/src/commands/backlog/init.ts:69`

**Step 2: Implement fix**

Seed tracked placeholders such as `items/.gitkeep` and `archived/.gitkeep` when initializing a fresh scaffold, without disturbing existing directory contents. Add regression coverage that simulates the git round-trip and proves `regenerate-index` works without rerunning `init`.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/init.test.ts src/commands/backlog/regenerate-index.test.ts`
Expected: All targeted backlog scaffold tests pass, including the clone-round-trip regression

**Step 4: Commit**

```bash
git add packages/cli/src/commands/backlog/init.ts packages/cli/src/commands/backlog/init.test.ts packages/cli/src/commands/backlog/regenerate-index.test.ts
git commit -m "fix(p03-t01): persist backlog scaffold directories in git"
```

---

### Task p03-t02: (review) Add command-level coverage for `oat backlog init`

**Files:**

- Create: `packages/cli/src/commands/backlog/index.test.ts`
- Modify: `packages/cli/src/commands/backlog/index.ts` (only if testability hooks are needed)

**Step 1: Understand the issue**

Review finding: current tests cover the initializer helper and help snapshots, but do not execute the actual Commander action for `oat backlog init`, leaving root resolution and text/JSON output behavior unverified.
Location: `packages/cli/src/commands/backlog/index.ts:66`

**Step 2: Implement fix**

Add command-level tests that run `backlog init` through the command surface with injected dependencies and assert default backlog-root resolution, `--backlog-root` override behavior, text output, JSON output `{ status: 'ok', backlogRoot }`, and `process.exitCode`. Make only the minimal production changes needed to support that harness.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/index.test.ts src/commands/backlog/init.test.ts src/commands/backlog/regenerate-index.test.ts`
Expected: Command-level and helper-level backlog tests all pass

**Step 4: Commit**

```bash
git add packages/cli/src/commands/backlog/index.test.ts packages/cli/src/commands/backlog/index.ts packages/cli/src/commands/backlog/init.test.ts packages/cli/src/commands/backlog/regenerate-index.test.ts
git commit -m "test(p03-t02): cover backlog init command surface"
```

---

## Reviews

{Track reviews here after running the oat-project-review-provide and oat-project-review-receive skills.}

{Keep both code + artifact rows below. Add additional code rows (p03, p04, etc.) as needed, but do not delete `spec`/`design`.}

| Scope  | Type     | Status  | Date       | Artifact                                       |
| ------ | -------- | ------- | ---------- | ---------------------------------------------- |
| p01    | code     | pending | -          | -                                              |
| p02    | code     | pending | -          | -                                              |
| final  | code     | passed  | 2026-03-20 | reviews/archived/final-review-2026-03-20-v2.md |
| spec   | artifact | pending | -          | -                                              |
| design | artifact | pending | -          | -                                              |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

**Meaning:**

- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**

- Phase 1: 2 tasks - add the scaffold initializer and wire `oat backlog init` into the backlog CLI
- Phase 2: 1 task - add compatibility and idempotence regression coverage
- Phase 3: 2 tasks - address final review findings around git persistence and command-level coverage

**Total: 5 tasks**

Ready for PR and finalization.

---

## References

- Design: `design.md` (required in spec-driven mode; optional in quick/import mode)
- Spec: `spec.md` (required in spec-driven mode; optional in quick/import mode)
- Discovery: `discovery.md`
- Imported Source: `references/imported-plan.md` (when `oat_plan_source: imported`)

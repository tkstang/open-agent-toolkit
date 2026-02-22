---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-02-21
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: []
oat_plan_source: imported
oat_import_reference: references/imported-plan.md
oat_import_source_path: /Users/thomas.stang/Code/open-agent-toolkit/.oat/repo/reference/external-plans/oat-instructions-validate-sync.md
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: `oat instructions validate` and `oat instructions sync`

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Add CLI commands that validate and repair AGENTS.md to CLAUDE.md pointer integrity across the repository.

**Architecture:** Add a new `instructions` command group with `validate` and `sync` subcommands built on shared scanning/utilities modules and DI-friendly command handlers.

**Tech Stack:** TypeScript ESM, Commander command modules, Vitest, pnpm workspaces

**Commit Convention:** `feat(pNN-tNN): {description}`

## Planning Checklist

- [x] HiLL checkpoints: none required (import mode)

---

## Phase 1: Command Foundations

### Task p01-t01: Define shared instructions types

**Files:**
- Create: `packages/cli/src/commands/instructions/instructions.types.ts`

**Step 1: Write test (RED)**

TODO: Add a lightweight type-surface test (or extend an existing test) that imports the new exported types and fails before the file exists.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/instructions.utils.test.ts`
Expected: Test fails (RED) until types are introduced or references are wired.

**Step 2: Implement (GREEN)**

Define the shared types from the imported source plan:
- `InstructionStatus`: `'ok' | 'missing' | 'content_mismatch'`
- `InstructionEntry`: `{ agentsPath, claudePath, status, detail }`
- `InstructionActionType`: `'create' | 'update' | 'skip'`
- `InstructionActionResult`: `'planned' | 'applied' | 'skipped'`
- `InstructionActionRecord`: `{ type, target, reason, result }`
- `InstructionsMode`: `'validate' | 'dry-run' | 'apply'`
- `InstructionsSummary`: `{ scanned, ok, missing, contentMismatch, created, updated, skipped }`
- `InstructionsJsonPayload`: `{ mode, status, summary, entries, actions }`
- DI interfaces: `InstructionsScanDependencies`, `InstructionsValidateCommandDependencies`, `InstructionsSyncCommandDependencies`

Run: `pnpm --filter @oat/cli type-check`
Expected: Type-check passes with the new type definitions.

**Step 3: Refactor**

Normalize naming and exports to mirror `cleanup.types.ts` conventions.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/`
Expected: New instructions test suite compiles and executes without type errors.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/instructions/instructions.types.ts
git commit -m "feat(p01-t01): add shared instructions command types"
```

---

### Task p01-t02: Implement scanner and utility layer

**Files:**
- Create: `packages/cli/src/commands/instructions/instructions.utils.ts`
- Create: `packages/cli/src/commands/instructions/instructions.utils.test.ts`

**Step 1: Write test (RED)**

Add failing tests for:
- recursive AGENTS.md discovery with exclusions (`.git`, `.oat`, `.worktrees` at root, `node_modules` at any depth)
- missing CLAUDE.md detection
- `content_mismatch` detection
- CRLF normalization acceptance (`@AGENTS.md\r\n` treated as valid)
- directory symlink skip behavior

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/instructions.utils.test.ts`
Expected: Tests fail (RED).

**Step 2: Implement (GREEN)**

Implement:
- `EXPECTED_CLAUDE_CONTENT = '@AGENTS.md\n'`
- `scanInstructionFiles(repoRoot, overrides?)` BFS walk with symlink-safe directory traversal
- `buildInstructionsSummary(entries, actions)`
- `buildInstructionsPayload({ mode, entries, actions })`
- `formatInstructionsReport(payload)`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/instructions.utils.test.ts`
Expected: Tests pass (GREEN).

**Step 3: Refactor**

Align helper and payload naming with cleanup command patterns.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/`
Expected: Utility tests remain green while commands are added.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/instructions/instructions.utils.ts packages/cli/src/commands/instructions/instructions.utils.test.ts
git commit -m "feat(p01-t02): add instructions scanner and utilities"
```

---

### Task p01-t03: Implement `oat instructions validate`

**Files:**
- Create: `packages/cli/src/commands/instructions/validate/validate.ts`
- Create: `packages/cli/src/commands/instructions/validate/validate.test.ts`

**Step 1: Write test (RED)**

Add failing tests for:
- exit code `0` when all entries are `ok`
- exit code `1` when any entry is `missing` or `content_mismatch`
- JSON payload output shape for `--json`
- no file writes during validate path

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/validate/validate.test.ts`
Expected: Tests fail (RED).

**Step 2: Implement (GREEN)**

Implement command handler with DI defaults using:
- `readGlobalOptions`
- `buildCommandContext`
- `resolveProjectRoot`
- `scanInstructionFiles`
- `CliError` exit semantics

Support: `oat instructions validate [--json]`.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/validate/validate.test.ts`
Expected: Tests pass (GREEN).

**Step 3: Refactor**

Keep handler thin and move formatting/payload construction into utilities.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/`
Expected: Phase 1 command and utility tests pass.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/instructions/validate/
git commit -m "feat(p01-t03): add instructions validate command"
```

---

## Phase 2: Sync, Registration, and End-to-End Coverage

### Task p02-t01: Implement `oat instructions sync`

**Files:**
- Create: `packages/cli/src/commands/instructions/sync/sync.ts`
- Create: `packages/cli/src/commands/instructions/sync/sync.test.ts`

**Step 1: Write test (RED)**

Add failing tests for:
- dry-run planning for `missing` entries (`create` planned)
- mismatch handling without `--force` (`skip` + exit `1`)
- mismatch handling with `--force` (`update` planned/applied)
- `--apply` writing canonical `@AGENTS.md\n`
- JSON payload output for dry-run and apply

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/sync/sync.test.ts`
Expected: Tests fail (RED).

**Step 2: Implement (GREEN)**

Implement command behavior:
- default dry-run mode
- `--apply` to execute writes
- `--force` to allow overwriting mismatched CLAUDE.md content
- `planSyncActions` mapping (`create`, `update`, `skip`)

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/sync/sync.test.ts`
Expected: Tests pass (GREEN).

**Step 3: Refactor**

Consolidate action planning/reporting into shared utilities to keep sync handler focused.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/`
Expected: Validate + sync tests pass together.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/instructions/sync/
git commit -m "feat(p02-t01): add instructions sync command"
```

---

### Task p02-t02: Register parent command and subcommands

**Files:**
- Create: `packages/cli/src/commands/instructions/index.ts`
- Create: `packages/cli/src/commands/instructions/index.test.ts`
- Modify: `packages/cli/src/commands/index.ts`

**Step 1: Write test (RED)**

Add failing command registration tests that assert:
- `instructions` parent command exists
- `validate` and `sync` subcommands are attached

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/index.test.ts`
Expected: Tests fail (RED).

**Step 2: Implement (GREEN)**

Implement:
- `createInstructionsCommand()` in `instructions/index.ts`
- registration in `packages/cli/src/commands/index.ts`

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/index.test.ts`
Expected: Tests pass (GREEN).

**Step 3: Refactor**

Ensure imports follow local `./...` and alias conventions used in CLI command modules.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/`
Expected: Registration and command tests pass.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/instructions/index.ts packages/cli/src/commands/instructions/index.test.ts packages/cli/src/commands/index.ts
git commit -m "feat(p02-t02): register instructions command group"
```

---

### Task p02-t03: Add integration coverage and run verification matrix

**Files:**
- Create: `packages/cli/src/commands/instructions/instructions.integration.test.ts`

**Step 1: Write test (RED)**

Create integration tests (temp filesystem) for:
- missing CLAUDE.md -> validate fails -> sync `--apply` creates -> validate passes
- custom CLAUDE.md -> sync skips without `--force` -> overwrite with `--force --apply`
- nested AGENTS.md detection
- `node_modules` exclusion
- directory symlink cycle skip
- CRLF pointer acceptance

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/instructions.integration.test.ts`
Expected: Tests fail (RED).

**Step 2: Implement (GREEN)**

Complete integration fixtures/assertions and wire dependencies for deterministic filesystem behavior.

Run: `pnpm --filter @oat/cli test -- --run packages/cli/src/commands/instructions/instructions.integration.test.ts`
Expected: Tests pass (GREEN).

**Step 3: Refactor**

Deduplicate fixture setup helpers and keep assertions focused on behavior-level outcomes.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test`
Expected: CLI package tests pass.

Run: `pnpm lint && pnpm type-check`
Expected: No regressions.

Run: `pnpm build && pnpm run cli -- instructions validate`
Expected: Command reports current repo integrity.

Run manual checks:
1. Delete `packages/cli/CLAUDE.md`, run validate (expects exit 1), run `oat instructions sync --apply`, rerun validate (expects exit 0).
2. Write custom content to a CLAUDE.md, run sync without force (expects skip), then run with `--force --apply` (expects update).
3. Run `pnpm run cli -- instructions validate --json` and confirm JSON payload shape.

**Step 5: Commit**

```bash
git add packages/cli/src/commands/instructions/instructions.integration.test.ts
git commit -m "feat(p02-t03): add instructions integration tests and verification"
```

---

## Reviews

Track reviews here after running the `oat-project-review-provide` and `oat-project-review-receive` skills.

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| p01 | code | pending | - | - |
| p02 | code | pending | - | - |
| final | code | received | 2026-02-21 | reviews/final-review-2026-02-21.md |
| spec | artifact | pending | - | - |
| design | artifact | pending | - | - |

**Status values:** `pending` -> `received` -> `fixes_added` -> `fixes_completed` -> `passed`

---

## Implementation Complete

**Summary:**
- Phase 1: 3 tasks - Types, scanning utilities, and validate command.
- Phase 2: 3 tasks - Sync command, command registration, integration and verification.

**Total: 6 tasks**

Ready for implementation execution.

---

## References

- Imported Source: `references/imported-plan.md`
- Backlog: `.oat/repo/reference/backlog.md` (B08)
- Backlog review: `.oat/repo/reviews/backlog-and-roadmap-review-2026-02-19.md`
- Reference script: `.agents/skills/oat-agent-instructions-analyze/scripts/resolve-instruction-files.sh`

---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-07
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ["p03"]
oat_plan_source: imported
oat_import_reference: references/imported-plan.md
oat_import_source_path: /Users/thomas.stang/.claude/plans/cozy-seeking-valley.md
oat_import_provider: claude
oat_generated: false
oat_template: false
---

# Implementation Plan: Flip CLI Mutability Convention (`--apply` → `--dry-run`)

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Unify all OAT CLI mutating commands under a single convention: mutate by default, `--dry-run` to preview.

**Architecture:** 6 commands currently use `--apply` (dry-run by default). 2 newer `tools` commands already use `--dry-run` (mutate by default). This plan flips the 6 legacy commands to match, updates shared infrastructure, and propagates changes through tests, docs, and skills. Clean removal of `--apply` with no deprecation (pre-1.0).

**Tech Stack:** TypeScript, Commander.js, pnpm/Turborepo monorepo

**Commit Convention:** `refactor(pNN-tNN): description` for code, `test(pNN-tNN): description` for tests, `docs(pNN-tNN): description` for docs

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user
- [x] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Core CLI Refactor

### Task p01-t01: Update shared CommandContext

**Files:**
- Modify: `packages/cli/src/app/command-context.ts`

**Step 1: Implement**

In `GlobalOptions`: rename `apply?: boolean` → `dryRun?: boolean`
In `CommandContext`: rename `apply: boolean` → `dryRun: boolean`
In `buildCommandContext`: change `apply: options.apply ?? false` → `dryRun: options.dryRun ?? false`

Commander auto-camelCases `--dry-run` to `dryRun`, so this maps cleanly.

**Step 2: Verify**

Run: `pnpm --filter @oat/cli type-check`
Expected: Type errors in downstream consumers (expected — fixed in subsequent tasks)

**Step 3: Commit**

Do NOT commit yet — this task cascades to all subsequent p01 tasks. Commit after p01-t07.

---

### Task p01-t02: Flip sync command

**Files:**
- Modify: `packages/cli/src/commands/sync/index.ts:335` — `.option('--dry-run', 'Preview sync changes without applying')`
- Modify: `packages/cli/src/commands/sync/index.ts:317` — Invert branch logic
- Modify: `packages/cli/src/commands/sync/sync.types.ts:46` — `SyncJsonPayload.apply: boolean` → `dryRun: boolean`
- Modify: `packages/cli/src/commands/sync/dry-run.ts:85` — JSON: `apply: false` → `dryRun: true`
- Modify: `packages/cli/src/commands/sync/dry-run.ts:94-97` — Hint: `"Run without --dry-run to apply changes."`
- Modify: `packages/cli/src/commands/sync/apply.ts:130` — JSON: `apply: true` → `dryRun: false`

**Step 1: Implement**

sync/index.ts — change `.option('--apply', ...)` to `.option('--dry-run', 'Preview sync changes without applying')`. Invert branch:
```typescript
if (context.dryRun) {
  runSyncDryRun(context, scopePlans, dependencies);
  return;
}
await runSyncApply(context, scopePlans, dependencies);
```

sync.types.ts — `SyncJsonPayload.apply: boolean` → `SyncJsonPayload.dryRun: boolean`

dry-run.ts:85 — `apply: false` → `dryRun: true`
dry-run.ts:96 — `"Apply changes with: oat sync --scope ${context.scope} --apply"` → `"Run without --dry-run to apply changes."`

apply.ts:130 — `apply: true` → `dryRun: false`

**Step 2: Verify**

Run: `pnpm --filter @oat/cli type-check`
Expected: Fewer type errors than after p01-t01

---

### Task p01-t03: Flip instructions sync command

**Files:**
- Modify: `packages/cli/src/commands/instructions/sync/sync.ts`

**Step 1: Implement**

- Line 142: `.option('--apply', ...)` → `.option('--dry-run', 'Preview sync changes without applying')`
- Line 144: Action param type `{ apply?: boolean }` → `{ dryRun?: boolean }`
- Line 157: `const apply = options.apply ?? false` → `const dryRun = options.dryRun ?? false`
- Lines 158-159: Invert: `const actions = dryRun ? plannedActions : await applySyncActions(...)`
- Line 163: `mode: apply ? 'apply' : 'dry-run'` → `mode: dryRun ? 'dry-run' : 'apply'`
- Line 164: `entries: apply ? getPostSyncEntries(...) : entries` → `entries: dryRun ? entries : getPostSyncEntries(...)`
- Line 172: `if (!apply)` → `if (dryRun)`
- Line 178: Hint → `'Run without --dry-run to apply changes.'`

---

### Task p01-t04: Flip remove skill and remove skills commands

**Files:**
- Modify: `packages/cli/src/commands/remove/skill/remove-skill.ts`
- Modify: `packages/cli/src/commands/remove/skills/remove-skills.ts`

**Step 1: Implement**

remove-skill.ts:
- Line 37: `RemoveSkillOptions` — `apply?: boolean` → `dryRun?: boolean`
- Line 278: `runRemoveSkill` signature — `apply: boolean` → `dryRun: boolean`
- Line 310: `if (!apply)` → `if (dryRun)`
- Line 350: `.option('--apply', ...)` → `.option('--dry-run', 'Preview removal without applying')`
- Line 365: `options.apply ?? false` → `options.dryRun ?? false`

remove-skills.ts:
- Line 18: `RemoveSkillsOptions` — `apply?: boolean` → `dryRun?: boolean`
- Line 38: `RemoveSkillsDependencies` interface — `apply: boolean` param → `dryRun: boolean`
- Line 71: `.option('--apply', ...)` → `.option('--dry-run', 'Preview removal without applying')`
- Line 111: `options.apply ?? false` → `options.dryRun ?? false`

---

### Task p01-t05: Flip cleanup commands

**Files:**
- Modify: `packages/cli/src/commands/cleanup/cleanup.utils.ts`
- Modify: `packages/cli/src/commands/cleanup/artifacts/artifacts.ts`
- Modify: `packages/cli/src/commands/cleanup/project/project.ts`

**Step 1: Implement**

cleanup.utils.ts:
- Line 25: `CreateCleanupPayloadArgs` — `apply: boolean` → `dryRun: boolean`
- Line 28: `toCleanupMode(apply: boolean)` → `toCleanupMode(dryRun: boolean)`, body: `return dryRun ? 'dry-run' : 'apply'`
- Line 69/77: `createCleanupPayload` — rename `apply` → `dryRun`, pass `toCleanupMode(dryRun)`

artifacts.ts:
- Line 547: `.option('--apply', ...)` → `.option('--dry-run', 'Preview cleanup without applying')`
- Line 555: Options type `{ apply?: boolean }` → `{ dryRun?: boolean }`
- Line 566: `apply: options.apply ?? false` → `dryRun: options.dryRun ?? false`
- Internal: all `apply` parameter references → `dryRun` with inverted semantics (`if (!apply)` → `if (dryRun)`)

project.ts:
- Line 24: `CleanupProjectRunOptions` — `apply?: boolean` → `dryRun?: boolean`
- Line 337: `.option('--apply', ...)` → `.option('--dry-run', 'Preview cleanup without applying')`
- Line 346: `apply: options.apply ?? false` → `dryRun: options.dryRun ?? false`
- Internal: rename `apply` → `dryRun` with inverted semantics

---

### Task p01-t06: Update auto-sync programmatic callers

**Files:**
- Modify: `packages/cli/src/commands/tools/remove/index.ts:43-49`
- Modify: `packages/cli/src/commands/tools/update/index.ts:43-49`
- Modify: `packages/cli/src/commands/tools/install/index.ts:20-25`

**Step 1: Implement**

Remove `'--apply'` from the `execFile` args array in all 3 files. `sync` now applies by default:
```typescript
[...process.execArgv, process.argv[1]!, 'sync', '--scope', scope]
```

---

### Task p01-t07: Update user-facing guidance strings

**Files:**
- Modify: `packages/cli/src/commands/init/tools/index.ts:154,156` — drop `--apply`
- Modify: `packages/cli/src/commands/init/tools/workflows/index.ts:79` — drop `--apply`
- Modify: `packages/cli/src/commands/init/tools/ideas/index.ts:85` — drop `--apply`
- Modify: `packages/cli/src/commands/init/tools/utility/index.ts:88` — drop `--apply`
- Modify: `packages/cli/src/commands/instructions/validate/validate.ts:50` — `'Fix with: oat instructions sync'`
- Modify: `packages/cli/src/commands/doctor/index.ts:252` — `'Run \`oat sync\` or \`oat init\` to create manifest.'`
- Modify: `packages/cli/src/commands/doctor/index.ts:457` — `'Regenerate codex roles with \`oat sync --scope project\`.'`
- Modify: `packages/cli/src/engine/hook.ts:19` — Drop `--apply` from `HOOK_DRIFT_WARNING`

**Step 1: Implement all guidance string changes**

**Step 2: Verify**

Run: `pnpm --filter @oat/cli type-check`
Expected: No type errors

**Step 3: Commit**

```bash
git add packages/cli/src/
git commit -m "refactor(p01): flip CLI mutability convention from --apply to --dry-run"
```

---

## Phase 2: Test Updates

### Task p02-t01: Update unit and snapshot tests

**Files:**
- Modify: `packages/cli/src/index.test.ts` — rename test, change argv `--apply` → `--dry-run`
- Modify: `packages/cli/src/commands/sync/index.test.ts` — invert test structure, update JSON assertions (`apply` → `dryRun`), update hint
- Modify: `packages/cli/src/commands/instructions/sync/sync.test.ts` — same pattern
- Modify: `packages/cli/src/commands/remove/skill/remove-skill.test.ts` — `['--apply']` → `[]`
- Modify: `packages/cli/src/commands/help-snapshots.test.ts` — update inline snapshots
- Modify: `packages/cli/src/commands/cleanup/cleanup.utils.test.ts` — rename `apply` → `dryRun` (inverted)
- Modify: `packages/cli/src/commands/cleanup/project/project.test.ts` — rename `apply` → `dryRun` (inverted)
- Modify: `packages/cli/src/commands/init/tools/workflows/index.test.ts:169` — drop `--apply`
- Modify: `packages/cli/src/commands/init/tools/ideas/index.test.ts:205` — drop `--apply`
- Modify: `packages/cli/src/commands/init/index.test.ts:833` — update `HOOK_DRIFT_WARNING`

**Step 1: Implement all test changes**

Key patterns:
- Tests that previously passed `['--apply']` to get apply behavior → remove flag (apply is now default)
- Tests that tested dry-run as default → now pass `['--dry-run']` flag
- JSON assertions: `apply: true/false` → `dryRun: false/true` (inverted)
- Help snapshots: `--apply  Apply sync changes (default is dry-run)` → `--dry-run  Preview sync changes without applying`

**Step 2: Verify**

Run: `pnpm --filter @oat/cli test`
Expected: All unit/snapshot tests pass

---

### Task p02-t02: Update integration and e2e tests

**Files:**
- Modify: `packages/cli/src/e2e/workflow.test.ts` — all `['sync', '--apply']` → `['sync']`
- Modify: `packages/cli/src/commands/commands.integration.test.ts` — all `['sync', '--apply']` → `['sync']`
- Modify: `packages/cli/src/commands/instructions/instructions.integration.test.ts` — update
- Modify: `packages/cli/src/commands/cleanup/cleanup.integration.test.ts` — rename `apply` → `dryRun`

**Step 1: Implement all integration test changes**

**Step 2: Verify**

Run: `pnpm --filter @oat/cli test`
Expected: All tests pass

**Step 3: Commit**

```bash
git add packages/cli/src/
git commit -m "test(p02): update all tests for --dry-run convention"
```

---

## Phase 3: Documentation & Reference Updates

### Task p03-t01: Update user-facing docs

**Files:**
- Modify: `README.md` — replace `--apply` references (6+ occurrences)
- Modify: `apps/oat-docs/docs/quickstart.md` — 8 references
- Modify: `apps/oat-docs/docs/reference/troubleshooting.md` — 6 references
- Modify: `apps/oat-docs/docs/cli/index.md` — 2 references
- Modify: `apps/oat-docs/docs/cli/tool-packs-and-assets.md` — 3 references
- Modify: `apps/oat-docs/docs/cli/provider-interop/commands.md` — update convention description
- Modify: `apps/oat-docs/docs/cli/provider-interop/hooks-and-safety.md` — 1 reference
- Modify: `apps/oat-docs/docs/workflow/reviews.md` — 1 reference

**Step 1: Implement**

Pattern: `oat sync --scope all --apply` → `oat sync --scope all`. Where explaining convention, update to describe `--dry-run`.

**Step 2: Commit**

```bash
git add README.md apps/oat-docs/
git commit -m "docs(p03-t01): update documentation for --dry-run convention"
```

---

### Task p03-t02: Update skills and agent docs

**Files:**
- Modify: `.agents/README.md:31` — drop `--apply`
- Modify: `.agents/docs/reference-architecture.md:323,393` — drop `--apply`
- Modify: `.agents/docs/skills-guide.md:339` — drop `--apply`
- Modify: `.agents/skills/create-skill/SKILL.md:225,371,393` — drop `--apply`
- Modify: `.agents/skills/create-oat-skill/SKILL.md:110` — drop `--apply`
- Modify: `.agents/skills/oat-worktree-bootstrap-auto/SKILL.md:129` — drop `--apply`
- Modify: `.agents/skills/oat-worktree-bootstrap-auto/scripts/bootstrap.sh:149` — drop `--apply`
- Modify: `packages/cli/AGENTS.md:27` — "Preserve dry-run-first" → "Preserve mutate-by-default with `--dry-run` opt-in"

**Step 1: Implement**

**Step 2: Commit**

```bash
git add .agents/ packages/cli/AGENTS.md
git commit -m "docs(p03-t02): update skills and agent docs for --dry-run convention"
```

---

### Task p03-t03: Update backlog and reference docs

**Files:**
- Modify: `.oat/repo/reference/backlog.md:27-39` — move item to Completed Archive
- Modify: `.oat/repo/reference/current-state.md` — update CLI convention description (if present)

**Step 1: Implement**

**Step 2: Commit**

```bash
git add .oat/repo/reference/
git commit -m "chore(p03-t03): update backlog and reference docs"
```

---

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| p01 | code | pending | - | - |
| p02 | code | pending | - | - |
| p03 | code | pending | - | - |
| final | code | fixes_completed | 2026-03-07 | reviews/final-review-2026-03-07.md |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

---

## Implementation Complete

**Summary:**
- Phase 1: 7 tasks - Core CLI refactor (CommandContext, 6 commands, auto-sync, guidance strings)
- Phase 2: 2 tasks - Test updates (unit/snapshot + integration/e2e)
- Phase 3: 3 tasks - Documentation (user-facing docs, skills/agent docs, backlog/reference)

**Total: 12 tasks**

Ready for code review and merge.

---

## Verification

1. `pnpm build` — TypeScript compiles
2. `pnpm type-check` — no type errors
3. `pnpm test` — all tests pass
4. `pnpm lint && pnpm format` — clean
5. Manual smoke tests:
   - `pnpm run cli -- sync --help` → shows `--dry-run`, not `--apply`
   - `pnpm run cli -- sync --scope project` → applies (mutate by default)
   - `pnpm run cli -- sync --scope project --dry-run` → shows plan without changes

## Risk Notes

- **JSON output breaking change**: `SyncJsonPayload.apply` → `dryRun` (inverted). Acceptable for pre-1.0.
- **Pre-commit hook drift**: Existing hooks contain old `HOOK_DRIFT_WARNING` text. Harmless — users re-run `oat init` to update.
- **No deprecation**: `--apply` removed entirely. External scripts get Commander "unknown option" error. Intended clean break.

---

## References

- Imported Source: `references/imported-plan.md`
- ADR-014: `.oat/repo/reference/decision-record.md` (lines 598-643)
- Discovery: `.oat/projects/shared/oat-tools-command-group/discovery.md` (Question 3)
- Backlog item: `.oat/repo/reference/backlog.md` (lines 27-39)

# Flip CLI Mutability Convention: `--apply` → `--dry-run`

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify all OAT CLI mutating commands under a single convention: mutate by default, `--dry-run` to preview.

**Architecture:** 6 commands currently use `--apply` (dry-run by default). 2 newer `tools` commands already use `--dry-run` (mutate by default). This plan flips the 6 legacy commands to match the newer convention, updates the shared `CommandContext` interface, and propagates changes through tests, docs, and skills.

**Tech Stack:** TypeScript, Commander.js, pnpm/Turborepo monorepo

---

## Context

New `oat tools` commands adopted `--dry-run` (mutate by default) per ADR-014, while existing commands still use `--apply` (dry-run by default). This split was intentionally deferred during `oat tools` implementation. This task completes the unification — purely mechanical, no behavior changes beyond default semantics. Clean removal of `--apply` (no deprecation period; tool is pre-1.0).

---

## Task 1: Update shared CommandContext

**Files:**
- Modify: `packages/cli/src/app/command-context.ts`

**Changes:**
- `GlobalOptions.apply?: boolean` → `GlobalOptions.dryRun?: boolean`
- `CommandContext.apply: boolean` → `CommandContext.dryRun: boolean`
- `buildCommandContext`: `apply: options.apply ?? false` → `dryRun: options.dryRun ?? false`

Note: Commander auto-camelCases `--dry-run` to `dryRun` in option objects, so this maps cleanly.

**Commit:** `refactor: rename CommandContext.apply to dryRun`

---

## Task 2: Flip `sync` command

**Files:**
- Modify: `packages/cli/src/commands/sync/index.ts:335` — `.option('--apply', ...)` → `.option('--dry-run', 'Preview sync changes without applying')`
- Modify: `packages/cli/src/commands/sync/index.ts:317` — Invert branch:
  ```typescript
  // Before: if (context.apply) { apply } else { dryRun }
  // After:
  if (context.dryRun) {
    runSyncDryRun(context, scopePlans, dependencies);
    return;
  }
  await runSyncApply(context, scopePlans, dependencies);
  ```
- Modify: `packages/cli/src/commands/sync/sync.types.ts:46` — `SyncJsonPayload.apply: boolean` → `SyncJsonPayload.dryRun: boolean`
- Modify: `packages/cli/src/commands/sync/dry-run.ts:85` — JSON: `apply: false` → `dryRun: true`
- Modify: `packages/cli/src/commands/sync/dry-run.ts:94-97` — Change hint:
  ```typescript
  // Before: "Apply changes with: oat sync --scope ${context.scope} --apply"
  // After:  "Run without --dry-run to apply changes."
  ```
- Modify: `packages/cli/src/commands/sync/apply.ts:130` — JSON: `apply: true` → `dryRun: false`

**Commit:** `refactor: flip sync command from --apply to --dry-run`

---

## Task 3: Flip `instructions sync` command

**Files:**
- Modify: `packages/cli/src/commands/instructions/sync/sync.ts`

**Changes:**
- Line 142: `.option('--apply', ...)` → `.option('--dry-run', 'Preview sync changes without applying')`
- Line 144: Action param type `{ apply?: boolean }` → `{ dryRun?: boolean }`
- Line 157: `const apply = options.apply ?? false` → `const dryRun = options.dryRun ?? false`
- Lines 158-159: Invert: `const actions = dryRun ? plannedActions : await applySyncActions(...)`
- Line 163: `mode: apply ? 'apply' : 'dry-run'` → `mode: dryRun ? 'dry-run' : 'apply'`
- Line 164: `entries: apply ? getPostSyncEntries(...) : entries` → `entries: dryRun ? entries : getPostSyncEntries(...)`
- Line 172: `if (!apply)` → `if (dryRun)`
- Line 178: Hint → `'Run without --dry-run to apply changes.'`
- Line 183: `else if` stays structurally the same, just uses `dryRun` variable

**Commit:** `refactor: flip instructions sync from --apply to --dry-run`

---

## Task 4: Flip `remove skill` and `remove skills` commands

**Files:**
- Modify: `packages/cli/src/commands/remove/skill/remove-skill.ts`
- Modify: `packages/cli/src/commands/remove/skills/remove-skills.ts`

**Changes in remove-skill.ts:**
- Line 37: `RemoveSkillOptions` — `apply?: boolean` → `dryRun?: boolean`
- Line 278: `runRemoveSkill` signature — `apply: boolean` → `dryRun: boolean`
- Line 310: `if (!apply)` → `if (dryRun)`
- Line 350: `.option('--apply', ...)` → `.option('--dry-run', 'Preview removal without applying')`
- Line 365: `options.apply ?? false` → `options.dryRun ?? false`

**Changes in remove-skills.ts:**
- Line 18: `RemoveSkillsOptions` — `apply?: boolean` → `dryRun?: boolean`
- Line 38: `RemoveSkillsDependencies` interface — `apply: boolean` param → `dryRun: boolean`
- Line 71: `.option('--apply', ...)` → `.option('--dry-run', 'Preview removal without applying')`
- Line 111: `options.apply ?? false` → `options.dryRun ?? false`

**Commit:** `refactor: flip remove skill/skills from --apply to --dry-run`

---

## Task 5: Flip `cleanup artifacts` and `cleanup project` commands

**Files:**
- Modify: `packages/cli/src/commands/cleanup/artifacts/artifacts.ts`
- Modify: `packages/cli/src/commands/cleanup/project/project.ts`
- Modify: `packages/cli/src/commands/cleanup/cleanup.utils.ts`

**Changes in cleanup.utils.ts:**
- Line 25: `CreateCleanupPayloadArgs` — `apply: boolean` → `dryRun: boolean`
- Line 28: `toCleanupMode(apply: boolean)` → `toCleanupMode(dryRun: boolean)`, body: `return dryRun ? 'dry-run' : 'apply'`
- Line 77: `toCleanupMode(apply)` → `toCleanupMode(dryRun)`

**Changes in artifacts.ts:**
- Line 547: `.option('--apply', ...)` → `.option('--dry-run', 'Preview cleanup without applying')`
- Line 555: Options type `{ apply?: boolean; ... }` → `{ dryRun?: boolean; ... }`
- Line 566: `apply: options.apply ?? false` → `dryRun: options.dryRun ?? false`
- Internal `runCleanupArtifacts` call args — rename `apply` → `dryRun` with inverted semantics throughout. All `if (!apply)` → `if (dryRun)`, `if (apply)` → `if (!dryRun)`.

**Changes in project.ts:**
- Line 24: `CleanupProjectRunOptions` — `apply?: boolean` → `dryRun?: boolean`
- Line 337: `.option('--apply', ...)` → `.option('--dry-run', 'Preview cleanup without applying')`
- Line 346: `apply: options.apply ?? false` → `dryRun: options.dryRun ?? false`
- Internal `runCleanupProject` — rename `apply` → `dryRun` with inverted semantics.

**Commit:** `refactor: flip cleanup commands from --apply to --dry-run`

---

## Task 6: Update auto-sync programmatic callers

**Files:**
- Modify: `packages/cli/src/commands/tools/remove/index.ts:43-49`
- Modify: `packages/cli/src/commands/tools/update/index.ts:43-49`
- Modify: `packages/cli/src/commands/tools/install/index.ts:20-25`

**Change:** Remove `'--apply'` from the `execFile` args array in all 3 files. `sync` now applies by default, so the auto-sync subprocess just needs:
```typescript
[...process.execArgv, process.argv[1]!, 'sync', '--scope', scope]
```

**Commit:** `refactor: drop --apply from auto-sync subprocess calls`

---

## Task 7: Update user-facing guidance strings

**Files:**
- Modify: `packages/cli/src/commands/init/tools/index.ts:154,156` — drop `--apply`
- Modify: `packages/cli/src/commands/init/tools/workflows/index.ts:79` — drop `--apply`
- Modify: `packages/cli/src/commands/init/tools/ideas/index.ts:85` — drop `--apply`
- Modify: `packages/cli/src/commands/init/tools/utility/index.ts:88` — drop `--apply`
- Modify: `packages/cli/src/commands/instructions/validate/validate.ts:50` — `'Fix with: oat instructions sync'` (drop `--apply`)
- Modify: `packages/cli/src/commands/doctor/index.ts:252` — `'Run \`oat sync\` or \`oat init\` to create manifest.'`
- Modify: `packages/cli/src/commands/doctor/index.ts:457` — `'Regenerate codex roles with \`oat sync --scope project\`.'`
- Modify: `packages/cli/src/engine/hook.ts:19` — `HOOK_DRIFT_WARNING`: drop `--apply` from suggested command

**Commit:** `refactor: update guidance strings to drop --apply references`

---

## Task 8: Update all tests

**Files (source tests — update `--apply` → default, add `--dry-run` where needed):**
- `packages/cli/src/index.test.ts` — rename test, change argv from `--apply` to `--dry-run`
- `packages/cli/src/commands/sync/index.test.ts` — invert test structure: apply tests become default (no flag), dry-run tests pass `--dry-run`; update JSON assertions (`apply` → `dryRun`); update hint message assertions
- `packages/cli/src/commands/instructions/sync/sync.test.ts` — same pattern
- `packages/cli/src/commands/remove/skill/remove-skill.test.ts` — change `['--apply']` to `[]`
- `packages/cli/src/commands/help-snapshots.test.ts` — update inline snapshots (option descriptions change)
- `packages/cli/src/commands/cleanup/cleanup.utils.test.ts` — rename `apply` param → `dryRun` (inverted)
- `packages/cli/src/commands/cleanup/project/project.test.ts` — rename `apply` → `dryRun` (inverted)
- `packages/cli/src/commands/cleanup/cleanup.integration.test.ts` — rename `apply` → `dryRun`

**Files (init tests — update expected output strings):**
- `packages/cli/src/commands/init/tools/workflows/index.test.ts:169` — drop `--apply` from expected string
- `packages/cli/src/commands/init/tools/ideas/index.test.ts:205` — drop `--apply` from expected string
- `packages/cli/src/commands/init/index.test.ts:833` — update `HOOK_DRIFT_WARNING` expected value

**Files (e2e/integration tests — change `['sync', '--apply']` to `['sync']`):**
- `packages/cli/src/e2e/workflow.test.ts` — all `['sync', '--apply']` → `['sync']`
- `packages/cli/src/commands/commands.integration.test.ts` — all `['sync', '--apply']` → `['sync']`
- `packages/cli/src/commands/instructions/instructions.integration.test.ts` — update

**Commit:** `test: update all tests for --dry-run convention`

---

## Task 9: Update docs

**Files:**
- `README.md` — replace all `--apply` with no flag (or `--dry-run` where showing dry-run usage)
- `apps/oat-docs/docs/quickstart.md`
- `apps/oat-docs/docs/reference/troubleshooting.md`
- `apps/oat-docs/docs/cli/index.md`
- `apps/oat-docs/docs/cli/tool-packs-and-assets.md`
- `apps/oat-docs/docs/cli/provider-interop/commands.md`
- `apps/oat-docs/docs/cli/provider-interop/hooks-and-safety.md`
- `apps/oat-docs/docs/workflow/reviews.md`

**Pattern:** Where docs currently say `oat sync --scope all --apply`, change to `oat sync --scope all`. Where docs explain the `--apply` flag convention, update to explain `--dry-run`.

**Commit:** `docs: update documentation for --dry-run convention`

---

## Task 10: Update skills, agent docs, and convention files

**Files:**
- `.agents/README.md:31` — drop `--apply`
- `.agents/docs/reference-architecture.md:323,393` — drop `--apply`
- `.agents/docs/skills-guide.md:339` — drop `--apply`
- `.agents/skills/create-skill/SKILL.md:225,371,393` — drop `--apply`
- `.agents/skills/create-oat-skill/SKILL.md:110` — drop `--apply`
- `.agents/skills/oat-worktree-bootstrap-auto/SKILL.md:129` — drop `--apply`
- `.agents/skills/oat-worktree-bootstrap-auto/scripts/bootstrap.sh:149` — drop `--apply`
- `packages/cli/AGENTS.md:27` — change "Preserve dry-run-first" to "Preserve mutate-by-default with `--dry-run` opt-in"

**Commit:** `docs: update skills and agent docs for --dry-run convention`

---

## Task 11: Update reference docs and backlog

**Files:**
- `.oat/repo/reference/backlog.md:27-39` — move item to In Progress / mark done
- `.oat/repo/reference/current-state.md` — update CLI convention description if present

**Commit:** `chore: update backlog and reference docs`

---

## Verification

1. `pnpm build` — TypeScript compiles (catches any missed `apply` → `dryRun` renames)
2. `pnpm type-check` — no type errors
3. `pnpm test` — all tests pass
4. `pnpm lint && pnpm format` — clean
5. Manual smoke tests:
   - `pnpm run cli -- sync --help` — shows `--dry-run`, not `--apply`
   - `pnpm run cli -- sync --scope project` — actually applies (mutate by default)
   - `pnpm run cli -- sync --scope project --dry-run` — shows plan without changes
   - `pnpm run cli -- instructions sync --help` — shows `--dry-run`
   - `pnpm run cli -- remove skill --help` — shows `--dry-run`
   - `pnpm run cli -- cleanup artifacts --help` — shows `--dry-run`

## Risk Notes

- **JSON output breaking change**: `SyncJsonPayload.apply` → `SyncJsonPayload.dryRun` (inverted). Acceptable for pre-1.0.
- **Pre-commit hook drift**: Existing installed hooks still contain old `HOOK_DRIFT_WARNING` text. Harmless — the warning is informational; users can re-run `oat init` to regenerate.
- **No deprecation**: `--apply` is removed entirely. Any external scripts using `--apply` will get a Commander "unknown option" error. This is the intended clean break.

---
oat_generated: true
oat_generated_at: 2026-03-07
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/oat-tools-command-group
---

# Code Review: final

**Reviewed:** 2026-03-07
**Scope:** Final implementation review (`8daef654e2fd2cf078a487a7302801be66530035..HEAD`)
**Files reviewed:** 38
**Commits:** `8daef654e2fd2cf078a487a7302801be66530035..HEAD`

## Summary

The branch ships the `oat tools` surface and the scoped CLI suite currently passes, but the final implementation still misses required post-mutation behavior on multiple paths. `oat tools install` never performs the specified auto-sync flow, and `--json` mode on `update`/`remove` returns before applying required exit-code and sync behavior. I also confirmed the earlier deferred plan-review findings are resolved: agent-aware removal is implemented, agent versioning was added at the source files, and `oat tools info` should be treated as approved scope.

## Findings

### Critical

- **`oat tools install` never runs the required post-mutation auto-sync** (`packages/cli/src/commands/tools/install/index.ts:4`)
  - Issue: The install wrapper only renames `createInitToolsCommand()` and inherits the legacy `oat init tools` behavior, which ends by printing manual `oat sync --apply` reminders instead of invoking sync (`packages/cli/src/commands/init/tools/index.ts:152`). FR9 requires install, update, and remove to auto-sync after successful mutations, with a `--no-sync` escape hatch. The shipped `oat tools install --help` output also confirms there is no `--no-sync` option on the new command.
  - Fix: Wrap the existing install flow instead of exposing it verbatim. After a successful non-dry-run install, invoke the same `autoSync(...)` helper used by update/remove, plumb a `--no-sync` option, and include sync status in JSON output.
  - Requirement: FR9

- **`--json` mode on `oat tools update` and `oat tools remove` bypasses required error handling and auto-sync** (`packages/cli/src/commands/tools/update/index.ts:96`)
  - Issue: Both commands return immediately after `logger.json(...)` (`packages/cli/src/commands/tools/update/index.ts:96`, `packages/cli/src/commands/tools/remove/index.ts:97`), so JSON invocations never reach the missing-tool exit-code path or the `autoSync(...)` block. Reproduction: `pnpm run cli -- tools update nonexistent --scope project --json` and `pnpm run cli -- tools remove nonexistent --scope project --json` both exited with code 0 while reporting `notInstalled`, and successful JSON mutations would skip sync entirely.
  - Fix: Move JSON serialization after validation and optional sync execution. Preserve exit code 1 for missing tools in JSON mode, run auto-sync whenever a non-dry-run mutation succeeded, and include the sync result in the JSON payload as designed.
  - Requirement: FR9, NFR1, NFR3

### Important

- **Project-scoped `oat tools` commands silently look in the caller's subdirectory instead of the repository root** (`packages/cli/src/commands/tools/list/list-tools.ts:30`)
  - Issue: The new tools commands call `resolveScopeRoot(scope, cwd, home)` directly, and for `project` that helper returns `resolve(cwd)` rather than `resolveProjectRoot(cwd)` (`packages/cli/src/fs/paths.ts:27`). The same pattern is used by list, outdated, info, update, and remove (`packages/cli/src/commands/tools/outdated/outdated-tools.ts:30`, `packages/cli/src/commands/tools/info/info-tool.ts:42`, `packages/cli/src/commands/tools/update/update-tools.ts:56`, `packages/cli/src/commands/tools/remove/remove-tools.ts:70`). Reproduction: `pnpm run cli -- --scope project --cwd packages/cli/src tools list --json` returned `{"tools":[]}` in this worktree, while `pnpm run cli -- --scope project --cwd packages/cli/src status --json` correctly resolved the repo root and found project content.
  - Fix: Give the tools command group the same repo-root resolution behavior used by `status`, `sync`, `remove skill`, and other project-scoped commands: resolve `project` scope through `resolveProjectRoot(context.cwd)` before scanning or mutating files.
  - Requirement: FR1, FR5, FR6, FR8

- **Agent scanning is still effectively unverified because the production path bypasses DI and the test asserts the fallback path instead of real discovery** (`packages/cli/src/commands/tools/shared/scan-tools.ts:108`)
  - Issue: The scan engine uses injected `readdir` for skills but calls `node:fs/promises.readdir(...)` directly for agents, which breaks the stated DI/testability design. The corresponding test named "finds installed agents in project scope" documents this limitation and currently asserts `[]` from a non-existent path instead of verifying successful agent discovery (`packages/cli/src/commands/tools/shared/scan-tools.test.ts:55`). That leaves the agent half of FR1/FR5/FR8 under-tested even though it is part of the shipped surface.
  - Fix: Route agent directory enumeration through the dependency interface as well, then add a positive test that proves real agent detection and status classification.
  - Requirement: FR1, FR5, NFR3

### Minor

None

## Requirements/Design Alignment

**Evidence sources used:** `.oat/projects/shared/oat-tools-command-group/discovery.md`, `.oat/projects/shared/oat-tools-command-group/spec.md`, `.oat/projects/shared/oat-tools-command-group/design.md`, `.oat/projects/shared/oat-tools-command-group/plan.md`, `.oat/projects/shared/oat-tools-command-group/implementation.md`, `.oat/projects/shared/oat-tools-command-group/reviews/plan-review-2026-03-07.md`

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| FR1 | partial | Single-tool update exists for skills and agents, but project-scope resolution is wrong from nested `cwd` values and JSON mode suppresses required update error/sync behavior. |
| FR2 | partial | Pack update exists, but project-scoped packs are affected by the same repo-root bug. |
| FR3 | partial | `--all` exists, but project-scope discovery/mutation can silently miss tools when invoked below the repo root. |
| FR4 | implemented | `--dry-run` is present and engine tests confirm it suppresses mutations. |
| FR5 | partial | Listing works from the repo root, but `--scope project` fails from nested working directories. |
| FR6 | partial | Outdated filtering works, but it inherits the same incorrect project-root resolution. |
| FR7 | partial | `oat tools install` reuses the install flow, but it does not satisfy the required post-mutation auto-sync behavior. |
| FR8 | partial | Unified remove exists and handles agents, but JSON mode suppresses the required exit-code/sync behavior and project-root resolution is inconsistent. |
| FR9 | missing | Auto-sync is missing for install and skipped entirely in JSON mode for update/remove. |
| NFR1 | partial | JSON payloads are parseable, but JSON mode changes behavior by omitting sync results and suppressing user-error exits. |
| NFR2 | implemented | The new handlers are non-interactive and rely on explicit flags/arguments; no unexpected prompts were found in the new command paths. |
| NFR3 | partial | Help snapshots and engine tests exist, but wrapper-level command behavior and agent discovery remain insufficiently covered. |
| NFR4 | implemented | Existing `oat init tools` and `oat remove skill/skills` behavior remains intact in the reviewed range. |

### Extra Work (not in declared requirements)

None. `oat tools info` was outside the original spec, but the project notes explicitly record it as approved scope, so it is not treated as scope creep in this review.

## Verification Commands

Run these to verify the implementation:

```bash
pnpm --filter @oat/cli test -- --run src/commands/help-snapshots.test.ts src/commands/shared/frontmatter.test.ts src/commands/tools/shared/scan-tools.test.ts src/commands/tools/shared/auto-sync.test.ts src/commands/tools/list/list-tools.test.ts src/commands/tools/outdated/outdated-tools.test.ts src/commands/tools/info/info-tool.test.ts src/commands/tools/update/update-tools.test.ts src/commands/tools/remove/remove-tools.test.ts src/engine/edge-cases.test.ts
pnpm run cli -- tools install --help
pnpm run cli -- tools update nonexistent --scope project --json
pnpm run cli -- tools remove nonexistent --scope project --json
pnpm run cli -- --scope project --cwd packages/cli/src tools list --json
pnpm run cli -- --scope project --cwd packages/cli/src status --json
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.

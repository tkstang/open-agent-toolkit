---
oat_generated: true
oat_generated_at: 2026-02-21
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/oat-instructions-validate-sync
oat_review_mode: project
---

# Code Review: final

**Reviewed:** 2026-02-21
**Range:** b31c077..HEAD
**Files reviewed:** 13
**Commits:** 6 (d8c57b7, 204e661, 3e56521, f07e4fd, d5f0455, b791cdd)

## Summary

All 34 requirements from the imported plan are implemented. The code follows CLI conventions (DI pattern, import policy, exit semantics, logger routing, dry-run-first). Test coverage is comprehensive: 6 utility tests, 4 validate tests, 7 sync tests, 2 registration tests, and 5 integration tests covering exclusions, CRLF, symlink cycles, and mismatch handling. No critical or important issues found.

## Findings

### Critical

None.

### Important

None.

### Minor

1. **Missing debug logging on permission/scan errors**
   Reference: `packages/cli/src/commands/instructions/instructions.utils.ts:74`, `packages/cli/src/commands/instructions/instructions.utils.ts:108`
   The imported plan specifies "Permission errors: log debug, continue scanning (graceful degradation)" but the implementation silently swallows errors with `catch { continue; }`. No debug callback is available via `InstructionsScanDependencies`.

   **Fix guidance:** Add an optional `debug?: (message: string) => void` callback to `InstructionsScanDependencies` and call it in catch blocks before continuing. This improves observability without changing behavior.

2. **No help-snapshot tests for instructions subcommands**
   Reference: `packages/cli/src/commands/help-snapshots.test.ts`
   The majority pattern in the codebase includes help-snapshot tests for subcommands (e.g., `providers list`, `providers inspect`, `index init`, `project new`). The instructions command group only has a root help snapshot entry but no subcommand-level snapshots for `instructions validate` and `instructions sync`.

   **Fix guidance:** Add snapshot assertions for `instructions`, `instructions validate`, and `instructions sync` help output to `help-snapshots.test.ts`, following the existing subcommand snapshot pattern.

## Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| InstructionStatus type | implemented | ok, missing, content_mismatch |
| InstructionEntry type | implemented | agentsPath, claudePath, status, detail |
| InstructionActionType/Result types | implemented | create, update, skip / planned, applied, skipped |
| InstructionsMode type | implemented | validate, dry-run, apply |
| InstructionsSummary type | implemented | All 7 fields present |
| InstructionsJsonPayload type | implemented | mode, status, summary, entries, actions |
| DI interfaces | implemented | Scan, Validate, Sync dependencies |
| BFS directory walk | implemented | readdir with withFileTypes |
| Skip directory symlinks | implemented | dirent.isSymbolicLink() check |
| Exclude node_modules (any depth) | implemented | Tested in integration |
| Exclude .worktrees/.git/.oat (root only) | implemented | Tested in integration |
| CRLF normalization | implemented | .replace(/\r\n/g, '\n') before comparison |
| EXPECTED_CLAUDE_CONTENT constant | implemented | '@AGENTS.md\n' |
| buildInstructionsSummary | implemented | Count aggregation |
| buildInstructionsPayload | implemented | Payload construction |
| formatInstructionsReport | implemented | Aligned table with markers |
| Validate: read-only | implemented | No writeFile in dependencies |
| Validate: exit 0 ok, exit 1 issues | implemented | Tested |
| Validate: JSON output | implemented | Tested |
| Validate: text summary with fix guidance | implemented | Points to sync --apply |
| Sync: dry-run by default | implemented | Tested |
| Sync: --apply flag | implemented | Tested |
| Sync: --force flag | implemented | Tested |
| Sync: planSyncActions logic | implemented | create/update/skip mapping |
| Sync: write @AGENTS.md\n | implemented | Canonical content |
| Sync: exit 0/1 semantics | implemented | Tested |
| Sync: dry-run guidance message | implemented | "Apply changes with: oat instructions sync --apply" |
| Parent command registration | implemented | createInstructionsCommand() |
| Command registration in index.ts | implemented | Added to registerCommands() |
| Integration: missing→create→ok flow | implemented | Tested |
| Integration: mismatch skip/force | implemented | Tested |
| Integration: node_modules exclusion | implemented | Tested |
| Integration: symlink cycle safety | implemented | Tested |
| Integration: CRLF acceptance | implemented | Tested |

### Extra Work (not in requirements)

None.

## Verification Commands

```bash
# Verify debug logging fix (after implementation)
pnpm --filter @oat/cli exec vitest run src/commands/instructions/instructions.utils.test.ts

# Verify help-snapshot additions (after implementation)
pnpm --filter @oat/cli exec vitest run src/commands/help-snapshots.test.ts

# Full verification
pnpm --filter @oat/cli test
pnpm lint && pnpm type-check
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.

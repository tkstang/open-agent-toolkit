# Plan: Configurable VCS Policy + Worktree Sync for OAT Artifact Directories

## Problem

High-churn artifact directories (`.oat/repo/reviews/`, `.oat/repo/reference/external-plans/`) create git noise when committed. Users need the ability to:
1. Choose whether these directories are tracked in git (per-repo policy)
2. Still propagate context artifacts to worktrees even when gitignored
3. Optionally copy generated artifacts back from worktree → primary branch

Currently, worktree bootstrap (Step 2.5) only copies `.oat/config.local.json` and `.oat/active-idea`. There's no configurable policy for artifact directories.

## Design

### Config Schema Extension (`.oat/config.json`)

Add an `artifacts` section to `OatConfig`:

```json
{
  "version": 1,
  "worktrees": { "root": ".worktrees" },
  "projects": { "root": ".oat/projects/shared" },
  "artifacts": {
    "policy": "tracked",
    "paths": [
      ".oat/repo/reviews",
      ".oat/repo/reference/external-plans"
    ]
  }
}
```

- **`artifacts.policy`**: `"tracked"` (default, current behavior) | `"local"` (gitignored)
- **`artifacts.paths`**: Array of repo-relative paths governed by the policy. Defaults to `[".oat/repo/reviews", ".oat/repo/reference/external-plans"]` when omitted.

Keep it simple — a single policy applies to all listed paths. Per-path policies would be over-engineering for now.

### CLI Changes

#### 1. `oat config` — expose new keys

Add config keys: `artifacts.policy`, `artifacts.paths`
- `oat config get artifacts.policy` → `tracked` or `local` (with source)
- `oat config set artifacts.policy local` → writes to `.oat/config.json`
- `oat config get artifacts.paths` → comma-separated list
- `oat config set artifacts.paths ".oat/repo/reviews,.oat/repo/reference/external-plans"`
- `oat config list` → includes both new keys

#### 2. `oat artifacts` — new command group

A small command group for managing artifact VCS policy:

**`oat artifacts status`**
- Reports current policy (`tracked`/`local`)
- Lists governed paths and whether each exists
- Shows gitignore state (are paths currently in `.gitignore`?)
- JSON + human output

**`oat artifacts apply-policy`**
- Reads `artifacts.policy` from config
- If `local`: adds paths to `.gitignore` (idempotent, appends section marker)
- If `tracked`: removes the artifact gitignore entries
- Dry-run by default (following the `--dry-run` convention after the flip lands, or `--apply` for now)
- Reports what changed

**`oat artifacts copy-to-worktree <worktree-path>`**
- Copies artifact directories from current repo → target worktree
- Only copies when policy is `local` (otherwise git handles it)
- Never overwrites existing files (safe default)
- `--force` to overwrite
- Reports files copied/skipped

**`oat artifacts copy-from-worktree <worktree-path>`**
- Copies artifact directories from worktree → current repo
- Same safety semantics (no overwrite by default)
- Reports files copied/skipped

#### 3. Worktree bootstrap integration

Update `oat-worktree-bootstrap` SKILL.md Step 2.5 to add:
- After existing config/idea propagation, check `artifacts.policy`
- If `local`: run artifact copy from source repo to new worktree
- Log what was copied
- Non-blocking (warn on failure, don't abort bootstrap)

### Implementation Steps

#### Step 1: Config schema extension
**Files:**
- `packages/cli/src/config/oat-config.ts` — extend `OatConfig` interface, add `artifacts` to normalization

**Changes:**
- Add `artifacts?: { policy?: 'tracked' | 'local'; paths?: string[] }` to `OatConfig`
- Add normalization in `normalizeOatConfig()` — validate policy enum, validate paths are strings, apply defaults
- Add `DEFAULT_ARTIFACT_PATHS` constant

#### Step 2: Config command extension
**Files:**
- `packages/cli/src/commands/config/index.ts` — add `artifacts.policy` and `artifacts.paths` to `ConfigKey` union, handle in get/set/list

**Changes:**
- Extend `ConfigKey` type with `'artifacts.policy' | 'artifacts.paths'`
- Add to `KEY_ORDER`
- Handle in `getConfigValue()` and `setConfigValue()`
- For `artifacts.paths` set: parse comma-separated input into array

#### Step 3: Artifacts command group
**Files (new):**
- `packages/cli/src/commands/artifacts/index.ts` — command registration
- `packages/cli/src/commands/artifacts/status.ts` — status subcommand
- `packages/cli/src/commands/artifacts/apply-policy.ts` — gitignore management
- `packages/cli/src/commands/artifacts/copy.ts` — copy-to/copy-from worktree

**`status` implementation:**
- Read config, resolve paths, check `.gitignore` for each path
- Output table: path | exists | gitignored | policy

**`apply-policy` implementation:**
- Read `.gitignore`, parse into sections
- Add/remove managed section (delimited by `# OAT artifact policy (managed)` markers)
- Write updated `.gitignore`
- Dry-run by default

**`copy-to-worktree` / `copy-from-worktree`:**
- Validate worktree path exists and is a git worktree
- For each artifact path: recursive copy with no-overwrite default
- Use existing `@fs/io` utilities where possible
- Report per-file outcomes

#### Step 4: Register artifacts command
**Files:**
- `packages/cli/src/commands/index.ts` (or wherever commands are registered) — add `createArtifactsCommand()`

#### Step 5: Worktree bootstrap skill update
**Files:**
- `.agents/skills/oat-worktree-bootstrap/SKILL.md` — update Step 2.5

**Changes:**
- Add artifact propagation step after config/idea copy
- Read `artifacts.policy` from copied config
- If `local`: copy artifact directories from source → worktree
- Log results, non-blocking

#### Step 6: Tests
**Files (new):**
- `packages/cli/src/config/oat-config.test.ts` — test artifact config normalization
- `packages/cli/src/commands/config/index.test.ts` — test new config keys
- `packages/cli/src/commands/artifacts/status.test.ts`
- `packages/cli/src/commands/artifacts/apply-policy.test.ts`
- `packages/cli/src/commands/artifacts/copy.test.ts`

#### Step 7: Build, lint, type-check
- `pnpm build && pnpm lint && pnpm type-check && pnpm test`

## Scoping Questions / Trade-offs

1. **Single policy vs per-path policy**: Starting with a single policy for all artifact paths. Per-path can be added later if needed.
2. **Gitignore management**: Using marker comments to own a section of `.gitignore` — avoids conflicts with user's manual entries.
3. **Copy semantics**: No-overwrite by default is safe. `--force` flag for explicit overwrite. No merge/diff — just file copy.
4. **Command naming**: `oat artifacts` is clear and discoverable. Alternatives considered: `oat vcs-policy`, `oat repo-artifacts`.
5. **Dependency on dry-run flip**: The `apply-policy` command will use `--apply` for now (matching current convention). When the flip lands, it switches to `--dry-run`.

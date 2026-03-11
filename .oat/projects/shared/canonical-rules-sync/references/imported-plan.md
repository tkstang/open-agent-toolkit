# Plan: Canonical Rules with Bidirectional Provider Sync

## Context

Glob-scoped rule files (`.claude/rules/*.md`, `.cursor/rules/*.mdc`, `.github/instructions/*.instructions.md`) currently live independently in each provider directory with identical body content but different frontmatter. The `oat-agent-instructions-apply` skill generates these in parallel with no canonical source of truth, no sync, and no adoption path.

The existing sync system already handles skills and agents via `.agents/skills/` and `.agents/agents/` → provider views (symlinks or copies). This plan extends that system to support rules with a "transform + copy" strategy, since rules require provider-specific frontmatter and file extensions and cannot be symlinked directly.

Additionally, stray provider-specific rules should be adoptable into canonical format (bidirectional), matching how stray skills are adopted today.

## Canonical Rule Format

Files in `.agents/rules/*.md`:

```yaml
---
description: 'React component conventions for the frontend'
globs:
  - 'src/components/**/*.tsx'
  - 'src/components/**/*.ts'
activation: glob
---
# Rule Title

{ body content — identical across all providers }
```

**Fields:**

- `description` (string, optional) — semantic purpose. Used by Cursor and Copilot; not emitted for Claude.
- `globs` (string array, optional) — file patterns. Required when `activation: glob`.
- `activation` (enum: `always | glob | agent-requested | manual`) — controls how providers activate the rule.

**Activation → provider mapping:**

| activation        | Claude                              | Cursor                                 | Copilot                |
| ----------------- | ----------------------------------- | -------------------------------------- | ---------------------- |
| `always`          | no frontmatter                      | `alwaysApply: true`                    | no `applyTo`           |
| `glob`            | `paths: [globs]`                    | `alwaysApply: false`, `globs: [array]` | `applyTo: 'comma,sep'` |
| `agent-requested` | degrades to always (no frontmatter) | `alwaysApply: false`, description only | degrades to always     |
| `manual`          | degrades to always (no frontmatter) | no frontmatter                         | degrades to always     |

## OAT-Managed Marker for Synced Rules

Synced rule files are copies (not symlinks), so they need a clear "do not edit" marker. Reuse the existing marker system from `packages/cli/src/engine/markers.ts`:

```
<!-- OAT-managed: do not edit directly. Source: .agents/rules/react-components.md -->
```

**Placement**: At the very end of the file as a trailing HTML comment. This avoids breaking YAML frontmatter parsers (which expect `---` on line 1) and avoids polluting the rule body that providers present to the AI. All target providers (Claude, Cursor, Copilot) ignore HTML comments in markdown, so this is safe everywhere.

## Implementation Steps

### Step 1: Extend `ContentType` to include `'rule'`

**File:** `packages/cli/src/shared/types.ts`

- Add `'rule'` to `ContentTypeSchema`: `z.enum(['skill', 'agent', 'rule'])`
- Add `'rule'` to `PROJECT_SCOPE_CONTENT_TYPES` array
- Rules are project-scoped only (not user-scoped), matching agents

### Step 2: Add rule path mappings to provider adapters

**Files:**

- `packages/cli/src/providers/claude/adapter.ts`
- `packages/cli/src/providers/cursor/adapter.ts`
- `packages/cli/src/providers/copilot/adapter.ts`

Add `rule` mapping to each adapter's `projectMappings`:

- Claude: `{ contentType: 'rule', canonicalDir: '.agents/rules', providerDir: '.claude/rules', nativeRead: false }`
- Cursor: `{ contentType: 'rule', canonicalDir: '.agents/rules', providerDir: '.cursor/rules', nativeRead: false }`
- Copilot: `{ contentType: 'rule', canonicalDir: '.agents/rules', providerDir: '.github/instructions', nativeRead: false }`

### Step 3: Extend `PathMapping` with transform hooks

**File:** `packages/cli/src/providers/shared/adapter.types.ts`

Add optional fields to `PathMapping` for content types that require transformation (not just copy/symlink):

```typescript
interface PathMapping {
  contentType: ContentType;
  canonicalDir: string;
  providerDir: string;
  nativeRead: boolean;
  // New: transform config for content types that can't use symlinks
  providerExtension?: string; // e.g. '.mdc', '.instructions.md'
  transformCanonical?: (canonicalContent: string) => string; // canonical → provider
  parseToCanonical?: (providerContent: string) => string; // provider → canonical (adoption)
}
```

When `transformCanonical` is present, the engine forces `copy` strategy (symlinks are impossible since content differs). When `providerExtension` is set, the engine replaces the canonical `.md` extension with the provider extension when computing the output path.

Set on each adapter's rule mapping:

- Claude: `providerExtension: '.md'`, `transformCanonical: transformCanonicalToClaudeRule`, `parseToCanonical: parseClaudeRuleToCanonical`
- Cursor: `providerExtension: '.mdc'`, `transformCanonical: transformCanonicalToCursorRule`, `parseToCanonical: parseCursorRuleToCanonical`
- Copilot: `providerExtension: '.instructions.md'`, `transformCanonical: transformCanonicalToCopilotRule`, `parseToCanonical: parseCopilotRuleToCanonical`

### Step 4: Create canonical rule types and parsing

**New files:**

- `packages/cli/src/rules/canonical/types.ts` — canonical rule interfaces
- `packages/cli/src/rules/canonical/parse.ts` — parse/strip frontmatter, body-only hashing
- `packages/cli/src/rules/canonical/render.ts` — serialize canonical rule back to markdown
- `packages/cli/src/rules/canonical/index.ts` — barrel re-export

```typescript
// types.ts
type RuleActivation = 'always' | 'glob' | 'agent-requested' | 'manual';

interface CanonicalRuleFrontmatter {
  description?: string;
  globs?: string[];
  activation: RuleActivation;
}

// parse.ts
function parseCanonicalRule(content: string): {
  frontmatter: CanonicalRuleFrontmatter;
  body: string;
};
function stripFrontmatterAndMarker(content: string): string; // body only, for hashing
function computeBodyHash(content: string): string; // hash of body only

// render.ts
function renderCanonicalRule(
  frontmatter: CanonicalRuleFrontmatter,
  body: string,
): string;
```

Reuse the `FRONTMATTER_PATTERN` regex from `packages/cli/src/agents/canonical/parse.ts` and the `yaml` npm package for parsing (already a dependency).

### Step 5: Create provider-specific rule transforms

Provider transforms live inside each provider directory, keeping provider knowledge local:

**New file:** `packages/cli/src/providers/claude/rule-transform.ts`

- `transformCanonicalToClaudeRule(content: string): string` — if `activation=always`: no frontmatter; if `activation=glob`: emit `paths: [globs]`. Appends OAT marker.
- `parseClaudeRuleToCanonical(content: string): string` — reads `paths`, infers activation, emits canonical frontmatter

**New file:** `packages/cli/src/providers/cursor/rule-transform.ts`

- `transformCanonicalToCursorRule(content: string): string` — emits `description`, `alwaysApply`, `globs` per Cursor's activation matrix
- `parseCursorRuleToCanonical(content: string): string` — inverse, including activation mode inference from field combinations

**New file:** `packages/cli/src/providers/copilot/rule-transform.ts`

- `transformCanonicalToCopilotRule(content: string): string` — emits `applyTo` (comma-joined globs), `description`
- `parseCopilotRuleToCanonical(content: string): string` — inverse

Each `transformCanonicalTo*` function appends the OAT-managed trailing marker comment.

**File name mapping** (via `providerExtension` on PathMapping):

- Claude: `react-components.md` → `react-components.md`
- Cursor: `react-components.md` → `react-components.mdc`
- Copilot: `react-components.md` → `react-components.instructions.md`

### Step 6: Update scanner to discover canonical rules

**File:** `packages/cli/src/engine/scanner.ts`

- `scanCanonical()` already iterates `SCOPE_CONTENT_TYPES[scope]` and maps content type to directory name
- Update the directory mapping: `'rule'` → `'rules'` (parallels `'skill'` → `'skills'`, `'agent'` → `'agents'`)
- Rules are **files** (`.md`), so set `includeFiles = true` for rule content type (like agents)

### Step 7: Update compute-plan for rule transform strategy

**File:** `packages/cli/src/engine/compute-plan.ts`

- `resolveStrategy()`: If mapping has `transformCanonical`, force `'copy'` strategy regardless of adapter/config setting
- `classifyOperation()` for rules: use `computeBodyHash()` from Step 4 to compare body-only content (strip frontmatter before hashing) since the full file content will always differ between canonical and provider
- Provider path resolution: when mapping has `providerExtension`, replace canonical `.md` extension: `canonicalEntry.name.replace(/\.md$/, mapping.providerExtension)`
- Update `canonicalRelativePath()` helper to map `'rule'` → `'rules'` directory name

### Step 8: Update execute-plan for rule transform

**File:** `packages/cli/src/engine/execute-plan.ts`

- Thread `transformCanonical` from the mapping through to `SyncPlanEntry` (extend `engine.types.ts`)
- In the `create_copy` / `update_copy` branch: if entry has `transformCanonical`, read canonical content → apply transform → write to provider path
- If no transform: existing copy behavior (direct file/directory copy)
- Marker is appended by the transform function itself, so no separate `applyCopyMarker()` needed for rules

### Step 9: Update stray detection for rules

**File:** `packages/cli/src/drift/strays.ts`

- `inferContentType()`: Recognize `'rules'` directory name → returns `'rule'`
- Also recognize `'instructions'` directory name (for Copilot's `.github/instructions/`) → returns `'rule'`
- `detectStrays()`: For rule content type, accept `.md`, `.mdc`, and `.instructions.md` file extensions (not just `.md`)

### Step 10: Add rule adoption to adopt-stray

**File:** `packages/cli/src/commands/shared/adopt-stray.ts`

Add a rule-specific adoption path in `adoptStrayToCanonical()`:

1. Detect if stray is a rule (via `mapping.contentType === 'rule'`)
2. Read the provider-specific file
3. Call `mapping.parseToCanonical(content)` to convert provider frontmatter → canonical format
4. Strip OAT-managed trailing marker if present
5. Determine canonical filename (strip provider-specific extension, ensure `.md`)
6. Write canonical file to `.agents/rules/`
7. Delete original provider file
8. The subsequent `oat sync` will propagate the canonical rule to all active providers
9. Update manifest

### Step 11: Update manifest types

**File:** `packages/cli/src/manifest/manifest.types.ts`

- `ManifestEntry.contentType` already uses `ContentType` — no change needed since Step 1 added `'rule'`
- For rules, `strategy` will always be `'copy'` and `contentHash` will be non-null (body-only hash)
- Add optional `bodyHash?: string` field for rule entries (hash of body without frontmatter, used for drift detection distinct from `contentHash` which hashes the full transformed file)

### Step 12: Update the `oat-agent-instructions-apply` skill

**File:** `.agents/skills/oat-agent-instructions-apply/SKILL.md`

Update the skill to generate canonical rules in `.agents/rules/` instead of directly generating provider-specific files. The skill should:

1. Write the rule body + canonical frontmatter to `.agents/rules/{name}.md`
2. Run `oat sync` to propagate to all active providers
3. Remove the separate provider-specific frontmatter templates (or keep as reference docs)

### Step 13: Tests

**New test files:**

- `packages/cli/src/rules/canonical/parse.test.ts` — Canonical frontmatter parsing, body extraction, body hashing
- `packages/cli/src/rules/canonical/render.test.ts` — Canonical rule serialization
- `packages/cli/src/providers/claude/rule-transform.test.ts` — Claude frontmatter round-trip
- `packages/cli/src/providers/cursor/rule-transform.test.ts` — Cursor frontmatter round-trip (all 4 activation modes)
- `packages/cli/src/providers/copilot/rule-transform.test.ts` — Copilot frontmatter round-trip

**Existing test files to update:**

- `packages/cli/src/engine/compute-plan.test.ts` — Add rule entries to plan computation tests
- `packages/cli/src/engine/execute-plan.test.ts` — Add rule transform execution tests
- `packages/cli/src/drift/strays.test.ts` — Add rule stray detection tests
- `packages/cli/src/commands/sync/index.test.ts` — Integration tests for rule sync flow
- `packages/cli/src/commands/shared/adopt-stray.test.ts` — Add rule adoption tests
- `packages/cli/src/providers/shared/adapter-contract.test.ts` — Allow `'rule'` content type, validate transform hooks on rule mappings

**Key test scenarios:**

- Round-trip: canonical → provider → canonical produces identical output
- Body content preserved exactly across all transforms
- Activation mode mapping correctness per provider
- Body-only hash ignores frontmatter differences (no false-positive drift)
- OAT marker correctly appended at end of file
- Stray detection recognizes `.md`, `.mdc`, `.instructions.md` extensions
- Adoption correctly strips provider extension and converts frontmatter

## Key Files Summary

| File                                                   | Change                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `packages/cli/src/shared/types.ts`                     | Add `'rule'` to ContentType                                                         |
| `packages/cli/src/providers/shared/adapter.types.ts`   | Add `providerExtension?`, `transformCanonical?`, `parseToCanonical?` to PathMapping |
| `packages/cli/src/providers/claude/adapter.ts`         | Add rule mapping with transform hooks                                               |
| `packages/cli/src/providers/cursor/adapter.ts`         | Add rule mapping with transform hooks                                               |
| `packages/cli/src/providers/copilot/adapter.ts`        | Add rule mapping with transform hooks                                               |
| `packages/cli/src/providers/claude/rule-transform.ts`  | **New** — Claude rule frontmatter transform (bidirectional)                         |
| `packages/cli/src/providers/cursor/rule-transform.ts`  | **New** — Cursor rule frontmatter transform (bidirectional)                         |
| `packages/cli/src/providers/copilot/rule-transform.ts` | **New** — Copilot rule frontmatter transform (bidirectional)                        |
| `packages/cli/src/rules/canonical/types.ts`            | **New** — canonical rule interfaces                                                 |
| `packages/cli/src/rules/canonical/parse.ts`            | **New** — parse frontmatter, strip body, body hash                                  |
| `packages/cli/src/rules/canonical/render.ts`           | **New** — serialize canonical rule to markdown                                      |
| `packages/cli/src/engine/scanner.ts`                   | Handle `'rule'` content type                                                        |
| `packages/cli/src/engine/compute-plan.ts`              | Force copy for transforms, body-only hashing, extension mapping                     |
| `packages/cli/src/engine/execute-plan.ts`              | Transform + write path for rules                                                    |
| `packages/cli/src/engine/engine.types.ts`              | Add `transformCanonical?` to SyncPlanEntry                                          |
| `packages/cli/src/engine/markers.ts`                   | No changes (reuse existing marker format)                                           |
| `packages/cli/src/drift/strays.ts`                     | Recognize rule directories + extensions                                             |
| `packages/cli/src/commands/shared/adopt-stray.ts`      | Rule adoption via `parseToCanonical`                                                |
| `packages/cli/src/manifest/manifest.types.ts`          | Add optional `bodyHash`                                                             |
| `.agents/skills/oat-agent-instructions-apply/SKILL.md` | Target `.agents/rules/` instead of provider dirs                                    |

## Verification

1. **Unit tests**: `pnpm --filter @oat/cli test` — all new and existing tests pass
2. **Type check**: `pnpm type-check` — no type errors from ContentType expansion
3. **Lint**: `pnpm lint` — clean
4. **Manual sync test**:
   - Create `.agents/rules/test-rule.md` with canonical frontmatter
   - Run `pnpm run cli -- sync --scope project`
   - Verify files appear in `.claude/rules/test-rule.md`, `.cursor/rules/test-rule.mdc`, `.github/instructions/test-rule.instructions.md`
   - Verify each has correct provider-specific frontmatter and OAT-managed marker
   - Verify manifest tracks all three entries with `contentType: 'rule'`
5. **Adoption test**:
   - Place a stray `.cursor/rules/stray-rule.mdc` with Cursor frontmatter
   - Run `pnpm run cli -- status`
   - Verify stray is detected and adoptable
   - Adopt → verify canonical `.agents/rules/stray-rule.md` is created with correct canonical frontmatter
6. **Drift test**:
   - Edit body of a synced provider rule
   - Run `oat sync` → verify it detects drift and re-syncs
   - Edit frontmatter only of provider rule → verify no false-positive drift (body unchanged)

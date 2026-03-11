---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-11
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: []
oat_plan_source: imported
oat_import_reference: references/imported-plan.md
oat_import_source_path: /root/.claude/plans/jiggly-stirring-wall.md
oat_import_provider: claude
oat_generated: false
---

# Implementation Plan: Canonical Rules with Bidirectional Provider Sync

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Add `.agents/rules/` as the canonical source of truth for glob-scoped rule files, with bidirectional sync to Claude, Cursor, and Copilot provider directories via frontmatter transformation.

**Architecture:** Extends the existing sync engine (scan -> compute-plan -> execute-plan) with transform hooks on `PathMapping`. Provider-specific frontmatter transforms live inside each provider directory, keeping provider knowledge local. Rules always use `copy` strategy (not symlinks) since content differs per provider.

**Tech Stack:** TypeScript, Zod schemas, YAML frontmatter parsing, SHA-256 hashing

**Commit Convention:** `feat(pNN-tNN): {description}` - e.g., `feat(p01-t01): add rule to ContentType`

## Planning Checklist

- [ ] Confirmed HiLL checkpoints with user
- [ ] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Core Types and Canonical Rule Module

### Task p01-t01: Add `'rule'` to ContentType

**Files:**

- Modify: `packages/cli/src/shared/types.ts`

**Step 1: Write test (RED)**

No new test file needed -- additive type change validated by existing type-check and adapter-contract tests downstream.

Run: `pnpm type-check`
Expected: Passes (additive change)

**Step 2: Implement (GREEN)**

- Add `'rule'` to `ContentTypeSchema`: `z.enum(['skill', 'agent', 'rule'])`
- Add `'rule'` to `PROJECT_SCOPE_CONTENT_TYPES` array
- Rules are project-scoped only (not user-scoped), matching agents

**Step 3: Refactor**

None needed -- additive change.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/shared/types.ts
git commit -m "feat(p01-t01): add rule to ContentType"
```

---

### Task p01-t02: Extend PathMapping with transform hooks

**Files:**

- Modify: `packages/cli/src/providers/shared/adapter.types.ts`

**Step 1: Write test (RED)**

No dedicated test -- adapter-contract tests (updated in p03-t05) will validate.

**Step 2: Implement (GREEN)**

Add optional fields to `PathMapping`:

```typescript
providerExtension?: string;                             // e.g. '.mdc', '.instructions.md'
transformCanonical?: (canonicalContent: string) => string;  // canonical -> provider
parseToCanonical?: (providerContent: string) => string;     // provider -> canonical (adoption)
```

When `transformCanonical` is present, the engine forces `copy` strategy. When `providerExtension` is set, the engine replaces the canonical `.md` extension.

**Step 3: Refactor**

None needed.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/providers/shared/adapter.types.ts
git commit -m "feat(p01-t02): extend PathMapping with transform hooks"
```

---

### Task p01-t03: Create canonical rule types

**Files:**

- Create: `packages/cli/src/rules/canonical/types.ts`

**Step 1: Write test (RED)**

No test needed for pure type definitions.

**Step 2: Implement (GREEN)**

```typescript
export type RuleActivation = 'always' | 'glob' | 'agent-requested' | 'manual';

export interface CanonicalRuleFrontmatter {
  description?: string;
  globs?: string[];
  activation: RuleActivation;
}
```

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/rules/canonical/types.ts
git commit -m "feat(p01-t03): add canonical rule types"
```

---

### Task p01-t04: Create canonical rule parse module

**Files:**

- Create: `packages/cli/src/rules/canonical/parse.ts`
- Create: `packages/cli/src/rules/canonical/parse.test.ts`

**Step 1: Write test (RED)**

```typescript
// packages/cli/src/rules/canonical/parse.test.ts
describe('parseCanonicalRule', () => {
  it('parses frontmatter and body from canonical rule');
  it('throws on missing activation field');
  it('handles optional description and globs');
});
describe('stripFrontmatterAndMarker', () => {
  it('returns body only, stripping frontmatter and trailing OAT marker');
});
describe('computeBodyHash', () => {
  it('produces same hash regardless of frontmatter differences');
  it('detects body content changes');
});
```

Run: `pnpm --filter @oat/cli test -- parse.test.ts`
Expected: Tests fail (RED)

**Step 2: Implement (GREEN)**

- `parseCanonicalRule(content: string)` -- split frontmatter from body using `FRONTMATTER_PATTERN` (from `agents/canonical/parse.ts`), parse YAML, validate required fields
- `stripFrontmatterAndMarker(content: string)` -- returns body text only (for hashing)
- `computeBodyHash(content: string)` -- SHA-256 hash of body only

Reuse the YAML parsing approach from `packages/cli/src/agents/canonical/parse.ts`.

Run: `pnpm --filter @oat/cli test -- parse.test.ts`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

Extract shared frontmatter regex if duplicated with agents module.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/rules/canonical/parse.ts packages/cli/src/rules/canonical/parse.test.ts
git commit -m "feat(p01-t04): add canonical rule parser with body hashing"
```

---

### Task p01-t05: Create canonical rule render module and barrel

**Files:**

- Create: `packages/cli/src/rules/canonical/render.ts`
- Create: `packages/cli/src/rules/canonical/render.test.ts`
- Create: `packages/cli/src/rules/canonical/index.ts`

**Step 1: Write test (RED)**

```typescript
describe('renderCanonicalRule', () => {
  it('serializes frontmatter + body to valid canonical markdown');
  it('round-trips with parseCanonicalRule');
});
```

Run: `pnpm --filter @oat/cli test -- render.test.ts`
Expected: Tests fail (RED)

**Step 2: Implement (GREEN)**

- `renderCanonicalRule(frontmatter, body)` -- serialize YAML frontmatter + body
- Create barrel `index.ts` re-exporting types, parse, render

Run: `pnpm --filter @oat/cli test -- render.test.ts`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/rules/canonical/
git commit -m "feat(p01-t05): add canonical rule renderer and barrel export"
```

---

## Phase 2: Provider Rule Transforms

### Task p02-t01: Claude rule transform

**Files:**

- Create: `packages/cli/src/providers/claude/rule-transform.ts`
- Create: `packages/cli/src/providers/claude/rule-transform.test.ts`

**Step 1: Write test (RED)**

```typescript
describe('transformCanonicalToClaudeRule', () => {
  it('emits no frontmatter for activation=always');
  it('emits paths array for activation=glob');
  it('degrades agent-requested to always');
  it('degrades manual to always');
  it('appends OAT-managed trailing marker');
  it('preserves body content exactly');
});
describe('parseClaudeRuleToCanonical', () => {
  it('infers activation=glob from paths field');
  it('infers activation=always when no paths');
  it('round-trips with transformCanonicalToClaudeRule');
});
```

Run: `pnpm --filter @oat/cli test -- rule-transform.test.ts`
Expected: Tests fail (RED)

**Step 2: Implement (GREEN)**

- `transformCanonicalToClaudeRule(content)` -- parse canonical frontmatter, emit Claude format, append OAT marker at end of file
- `parseClaudeRuleToCanonical(content)` -- read `paths` field, infer activation, emit canonical frontmatter

Claude rule format:

- `activation=always` -> body only (no frontmatter)
- `activation=glob` -> `---\npaths:\n  - glob1\n  - glob2\n---\n{body}`

Run: `pnpm --filter @oat/cli test -- rule-transform.test.ts`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/providers/claude/rule-transform.ts packages/cli/src/providers/claude/rule-transform.test.ts
git commit -m "feat(p02-t01): add Claude rule frontmatter transform"
```

---

### Task p02-t02: Cursor rule transform

**Files:**

- Create: `packages/cli/src/providers/cursor/rule-transform.ts`
- Create: `packages/cli/src/providers/cursor/rule-transform.test.ts`

**Step 1: Write test (RED)**

```typescript
describe('transformCanonicalToCursorRule', () => {
  it('emits alwaysApply: true for activation=always');
  it('emits alwaysApply: false + globs for activation=glob');
  it('emits description + alwaysApply: false for agent-requested');
  it('emits no frontmatter for manual');
  it('appends OAT-managed trailing marker');
});
describe('parseCursorRuleToCanonical', () => {
  it('infers activation from alwaysApply + globs combination');
  it('round-trips all 4 activation modes');
});
```

Run: `pnpm --filter @oat/cli test -- rule-transform.test.ts`
Expected: Tests fail (RED)

**Step 2: Implement (GREEN)**

Cursor MDC format:

- `activation=always` -> `---\ndescription: ...\nalwaysApply: true\n---`
- `activation=glob` -> `---\ndescription: ...\nalwaysApply: false\nglobs:\n  - ...\n---`
- `activation=agent-requested` -> `---\ndescription: ...\nalwaysApply: false\n---`
- `activation=manual` -> body only (no frontmatter)

Run: `pnpm --filter @oat/cli test -- rule-transform.test.ts`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/providers/cursor/rule-transform.ts packages/cli/src/providers/cursor/rule-transform.test.ts
git commit -m "feat(p02-t02): add Cursor rule frontmatter transform"
```

---

### Task p02-t03: Copilot rule transform

**Files:**

- Create: `packages/cli/src/providers/copilot/rule-transform.ts`
- Create: `packages/cli/src/providers/copilot/rule-transform.test.ts`

**Step 1: Write test (RED)**

```typescript
describe('transformCanonicalToCopilotRule', () => {
  it('emits no applyTo for activation=always');
  it('emits applyTo with comma-joined globs for activation=glob');
  it('includes description when present');
  it('appends OAT-managed trailing marker');
});
describe('parseCopilotRuleToCanonical', () => {
  it('infers activation=glob from applyTo field');
  it('infers activation=always when no applyTo');
  it('splits comma-joined applyTo into globs array');
  it('round-trips with transformCanonicalToCopilotRule');
});
```

Run: `pnpm --filter @oat/cli test -- rule-transform.test.ts`
Expected: Tests fail (RED)

**Step 2: Implement (GREEN)**

Copilot instructions format:

- `activation=always` -> `---\ndescription: ...\n---`
- `activation=glob` -> `---\napplyTo: 'glob1,glob2'\ndescription: ...\n---`

Run: `pnpm --filter @oat/cli test -- rule-transform.test.ts`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/providers/copilot/rule-transform.ts packages/cli/src/providers/copilot/rule-transform.test.ts
git commit -m "feat(p02-t03): add Copilot rule frontmatter transform"
```

---

### Task p02-t04: Add rule mappings to provider adapters

**Files:**

- Modify: `packages/cli/src/providers/claude/paths.ts` (or wherever `projectMappings` is defined)
- Modify: `packages/cli/src/providers/cursor/paths.ts` (or equivalent)
- Modify: `packages/cli/src/providers/copilot/paths.ts` (or equivalent)

**Step 1: Write test (RED)**

Existing adapter-contract tests catch missing rule mappings after p03-t05 updates them.

**Step 2: Implement (GREEN)**

Add rule mapping to each adapter's `projectMappings`:

- Claude: `{ contentType: 'rule', canonicalDir: '.agents/rules', providerDir: '.claude/rules', nativeRead: false, providerExtension: '.md', transformCanonical: transformCanonicalToClaudeRule, parseToCanonical: parseClaudeRuleToCanonical }`
- Cursor: `{ contentType: 'rule', canonicalDir: '.agents/rules', providerDir: '.cursor/rules', nativeRead: false, providerExtension: '.mdc', transformCanonical: transformCanonicalToCursorRule, parseToCanonical: parseCursorRuleToCanonical }`
- Copilot: `{ contentType: 'rule', canonicalDir: '.agents/rules', providerDir: '.github/instructions', nativeRead: false, providerExtension: '.instructions.md', transformCanonical: transformCanonicalToCopilotRule, parseToCanonical: parseCopilotRuleToCanonical }`

Also set `nativeRead: true` for Codex/Gemini rule mappings (they read canonical directly, no sync needed).

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/providers/*/
git commit -m "feat(p02-t04): add rule path mappings to all provider adapters"
```

---

## Phase 3: Sync Engine Integration

### Task p03-t01: Update scanner for rule discovery

**Files:**

- Modify: `packages/cli/src/engine/scanner.ts`

**Step 1: Write test (RED)**

Add test case to scanner tests for `contentType === 'rule'` producing entries from `.agents/rules/*.md`.

Run: `pnpm --filter @oat/cli test -- scanner`
Expected: New test fails (RED)

**Step 2: Implement (GREEN)**

- Update directory mapping: `'rule'` -> `'rules'`
- Set `includeFiles = true` for rule content type (rules are individual `.md` files, not directories)
- Widen `CanonicalEntry.type` to include `'rule'` (or use `ContentType` directly)

Run: `pnpm --filter @oat/cli test -- scanner`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

Consider using `ContentType` directly instead of a narrowed union for `CanonicalEntry.type`.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/engine/scanner.ts
git commit -m "feat(p03-t01): update scanner to discover canonical rules"
```

---

### Task p03-t02: Update compute-plan for rule strategy and extension mapping

**Files:**

- Modify: `packages/cli/src/engine/compute-plan.ts`
- Modify: `packages/cli/src/manifest/hash.ts` (if separate body hash helper needed)

**Step 1: Write test (RED)**

Add test cases to `compute-plan.test.ts`:

- Rule entry forces `copy` strategy when mapping has `transformCanonical`
- Provider path uses `providerExtension` (e.g., `.md` -> `.mdc`)
- Body-only hash comparison for rule entries (no false drift from frontmatter)

Run: `pnpm --filter @oat/cli test -- compute-plan`
Expected: New tests fail (RED)

**Step 2: Implement (GREEN)**

- `resolveStrategy()`: if mapping has `transformCanonical`, return `'copy'`
- `classifyOperation()`: for rules, use `computeBodyHash()` for drift detection
- Provider path resolution: `entry.name.replace(/\.md$/, mapping.providerExtension)` when `providerExtension` is set
- `canonicalRelativePath()`: map `'rule'` -> `'rules'`

Run: `pnpm --filter @oat/cli test -- compute-plan`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/engine/compute-plan.ts packages/cli/src/manifest/hash.ts
git commit -m "feat(p03-t02): compute-plan handles rule strategy, extensions, body hashing"
```

---

### Task p03-t03: Update execute-plan for rule transforms

**Files:**

- Modify: `packages/cli/src/engine/execute-plan.ts`
- Modify: `packages/cli/src/engine/engine.types.ts`

**Step 1: Write test (RED)**

Add test cases to `execute-plan.test.ts`:

- Rule entry with `transformCanonical` reads canonical, applies transform, writes to provider path
- Non-rule entries use existing copy behavior unchanged

Run: `pnpm --filter @oat/cli test -- execute-plan`
Expected: New tests fail (RED)

**Step 2: Implement (GREEN)**

- Extend `SyncPlanEntry` in `engine.types.ts` with optional `transformCanonical`
- In `create_copy`/`update_copy` branch: if `entry.transformCanonical` exists, read canonical content -> apply transform -> write to provider path
- Marker is embedded by the transform function (trailing comment), so skip separate `applyCopyMarker()` for transformed entries

Run: `pnpm --filter @oat/cli test -- execute-plan`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/engine/execute-plan.ts packages/cli/src/engine/engine.types.ts
git commit -m "feat(p03-t03): execute-plan applies transforms for rule entries"
```

---

### Task p03-t04: Update manifest types for rules

**Files:**

- Modify: `packages/cli/src/manifest/manifest.types.ts`

**Step 1: Write test (RED)**

No dedicated test -- existing manifest tests validate schema. Type check confirms schema compatibility.

**Step 2: Implement (GREEN)**

- Add optional `bodyHash?: string` field to manifest entry schema
- For rule entries, `strategy` is always `'copy'` and `bodyHash` stores the body-only hash (for drift detection distinct from `contentHash`)

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/manifest/manifest.types.ts
git commit -m "feat(p03-t04): add bodyHash to manifest entry for rule drift detection"
```

---

### Task p03-t05: Update adapter-contract tests for rules

**Files:**

- Modify: `packages/cli/src/providers/shared/adapter-contract.test.ts`

**Step 1: Write test (RED)**

Update `assertMappingsValid`:

- Allow `'rule'` content type
- Update canonical dir regex: `/^\.agents\/(skills|agents|rules)$/`
- When `contentType === 'rule'`, assert `transformCanonical` is defined (unless `nativeRead`)

Run: `pnpm --filter @oat/cli test -- adapter-contract`
Expected: Tests pass after adapter mappings from p02-t04

**Step 2: Implement (GREEN)**

Update assertions per above.

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test`
Expected: All tests pass

**Step 5: Commit**

```bash
git add packages/cli/src/providers/shared/adapter-contract.test.ts
git commit -m "feat(p03-t05): update adapter-contract tests for rule mappings"
```

---

## Phase 4: Stray Detection and Adoption

### Task p04-t01: Update stray detection for rules

**Files:**

- Modify: `packages/cli/src/drift/strays.ts`

**Step 1: Write test (RED)**

Add to `strays.test.ts`:

- `inferContentType` returns `'rule'` for `'rules'` and `'instructions'` directory names
- `detectStrays` accepts `.md`, `.mdc`, `.instructions.md` extensions for rules

Run: `pnpm --filter @oat/cli test -- strays`
Expected: New tests fail (RED)

**Step 2: Implement (GREEN)**

- `inferContentType()`: recognize `'rules'` -> `'rule'`, `'instructions'` -> `'rule'`
- `detectStrays()`: make extension filter configurable per content type/mapping

Run: `pnpm --filter @oat/cli test -- strays`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/drift/strays.ts
git commit -m "feat(p04-t01): stray detection recognizes rule directories and extensions"
```

---

### Task p04-t02: Add rule adoption path

**Files:**

- Modify: `packages/cli/src/commands/shared/adopt-stray.ts`

**Step 1: Write test (RED)**

Add to `adopt-stray.test.ts`:

- Rule stray adoption calls `mapping.parseToCanonical()` and writes to `.agents/rules/`
- Provider extension stripped, canonical `.md` extension used
- OAT marker stripped from adopted content

Run: `pnpm --filter @oat/cli test -- adopt-stray`
Expected: New tests fail (RED)

**Step 2: Implement (GREEN)**

- Detect rule strays via `mapping.contentType === 'rule'`
- Read provider file -> `mapping.parseToCanonical(content)` -> strip marker -> write to `.agents/rules/{name}.md`
- Filename: strip provider extension, ensure `.md` (e.g., `react-patterns.mdc` -> `react-patterns.md`)
- Delete original provider file; next `oat sync` propagates canonical to all providers

Run: `pnpm --filter @oat/cli test -- adopt-stray`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

None.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/commands/shared/adopt-stray.ts
git commit -m "feat(p04-t02): rule adoption converts provider frontmatter to canonical"
```

---

## Phase 5: Skill Update and Integration Testing

### Task p05-t01: Update oat-agent-instructions-apply skill

**Files:**

- Modify: `.agents/skills/oat-agent-instructions-apply/SKILL.md`

**Step 1: Write test (RED)**

No automated test -- skill is a markdown instruction file.

**Step 2: Implement (GREEN)**

Update the skill to:

1. Write rule body + canonical frontmatter to `.agents/rules/{name}.md`
2. Run `oat sync` to propagate to all active providers
3. Remove or mark deprecated the separate provider-specific frontmatter templates

**Step 3: Refactor**

None.

**Step 4: Verify**

Manual review of skill file content.

**Step 5: Commit**

```bash
git add .agents/skills/oat-agent-instructions-apply/
git commit -m "feat(p05-t01): update instructions skill to target canonical rules"
```

---

### Task p05-t02: End-to-end sync integration tests

**Files:**

- Modify: `packages/cli/src/commands/sync/index.test.ts`

**Step 1: Write test (RED)**

Add integration test scenarios:

- Create `.agents/rules/test-rule.md` with canonical frontmatter
- Run sync -> verify files appear in `.claude/rules/test-rule.md`, `.cursor/rules/test-rule.mdc`, `.github/instructions/test-rule.instructions.md`
- Verify each has correct provider-specific frontmatter + OAT marker
- Verify manifest tracks entries with `contentType: 'rule'`

Run: `pnpm --filter @oat/cli test -- sync`
Expected: Tests fail (RED)

**Step 2: Implement (GREEN)**

Wire everything together; fix any integration issues discovered.

Run: `pnpm --filter @oat/cli test -- sync`
Expected: Tests pass (GREEN)

**Step 3: Refactor**

Address any issues found during integration.

**Step 4: Verify**

Run: `pnpm lint && pnpm type-check && pnpm --filter @oat/cli test`
Expected: All pass

**Step 5: Commit**

```bash
git add packages/cli/src/commands/sync/
git commit -m "feat(p05-t02): add end-to-end sync integration tests for rules"
```

---

### Task p05-t03: Full verification

**Files:**

- None (verification only)

**Step 1: Verify all checks pass**

Run: `pnpm lint && pnpm type-check && pnpm --filter @oat/cli test`
Expected: All pass with no regressions

**Step 2: Manual smoke test**

1. Create `.agents/rules/test-rule.md` with canonical frontmatter
2. Run `pnpm run cli -- sync --scope project`
3. Verify synced files in all provider directories
4. Place a stray `.cursor/rules/stray-rule.mdc` -> verify adoption works
5. Edit synced rule body -> verify drift detection on next sync

**Step 3: Commit**

No commit needed (verification only).

---

## Reviews

| Scope | Type | Status  | Date | Artifact |
| ----- | ---- | ------- | ---- | -------- |
| p01   | code | pending | -    | -        |
| p02   | code | pending | -    | -        |
| p03   | code | pending | -    | -        |
| p04   | code | pending | -    | -        |
| p05   | code | pending | -    | -        |
| final | code | pending | -    | -        |

**Status values:** `pending` -> `received` -> `fixes_added` -> `fixes_completed` -> `passed`

**Meaning:**

- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**

- Phase 1: 5 tasks - Core types, PathMapping hooks, canonical rule module (types, parse, render)
- Phase 2: 4 tasks - Provider-specific rule transforms (Claude, Cursor, Copilot) + adapter mappings
- Phase 3: 5 tasks - Sync engine integration (scanner, compute-plan, execute-plan, manifest, contract tests)
- Phase 4: 2 tasks - Stray detection and adoption for rules
- Phase 5: 3 tasks - Skill update and end-to-end integration testing

**Total: 19 tasks**

Ready for code review and merge.

---

## References

- Imported Source: `references/imported-plan.md`

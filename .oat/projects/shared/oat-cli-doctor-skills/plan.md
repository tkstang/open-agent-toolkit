---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-15
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ['p03']
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: oat-cli-doctor-skills

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Create `/oat-doctor` and `/oat-docs` user-level skills distributed via a new "core" pack, with docs bundling to `~/.oat/docs/`.

**Architecture:** Two SKILL.md files following `create-oat-skill` conventions. New "core" pack in the CLI init/tools system (always user-scope). Docs from `apps/oat-docs/docs/` bundled into CLI assets and copied to `~/.oat/docs/` on core pack install.

**Tech Stack:** TypeScript (CLI), Markdown (SKILL.md), Bash (bundle script)

**Commit Convention:** `feat(p0N-tNN): {description}`

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user
- [x] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Skills (already committed, needs rework)

Phase 1 was committed but needs rework to follow `create-oat-skill` conventions and resolve docs to `~/.oat/docs/` only. This will be reconciled via Phase 3.

### Task p01-t01: Create oat-doctor skill (done — needs rework in Phase 3)

**Status:** committed (needs rework)
**Commit:** 83173df

### Task p01-t02: Create oat-docs skill (done — needs rework in Phase 3)

**Status:** committed (needs rework)
**Commit:** 83173df

### Task p01-t03: Register skills in manifest and bundle (done — needs rework in Phase 3)

**Status:** committed (needs rework)
**Commit:** 83173df

---

## Phase 2: Core Pack CLI Infrastructure

### Task p02-t01: Add `'core'` to PackName type and CORE_SKILLS to manifest

**Files:**

- Modify: `packages/cli/src/commands/tools/shared/types.ts`
- Modify: `packages/cli/src/commands/init/tools/shared/skill-manifest.ts`

**Step 1: Update types**

Add `'core'` to `PackName` type:

```typescript
export type PackName = 'core' | 'ideas' | 'workflows' | 'utility';
```

**Step 2: Add CORE_SKILLS constant**

In `skill-manifest.ts`, add:

```typescript
export const CORE_SKILLS = ['oat-docs', 'oat-doctor'] as const;
```

Move `'oat-docs'` and `'oat-doctor'` out of `UTILITY_SKILLS` (they were added in Phase 1 — move them to `CORE_SKILLS`).

**Step 3: Verify**

Run: `pnpm --filter @oat/cli type-check`
Expected: Pass

**Step 4: Commit**

```bash
git add packages/cli/src/commands/tools/shared/types.ts packages/cli/src/commands/init/tools/shared/skill-manifest.ts
git commit -m "feat(p02-t01): add core pack type and CORE_SKILLS manifest"
```

---

### Task p02-t02: Create install-core.ts installer

**Files:**

- Create: `packages/cli/src/commands/init/tools/core/install-core.ts`

**Step 1: Write test (RED)**

Create `packages/cli/src/commands/init/tools/core/install-core.test.ts` with tests:

- Copies skills to `~/.agents/skills/` (user scope)
- Copies docs from `assets/docs/` to `~/.oat/docs/`
- Skips docs that are already current (version check)
- Force flag overwrites existing
- Returns result with copiedSkills, copiedDocs counts

Run: `pnpm --filter @oat/cli test`
Expected: Fails (RED)

**Step 2: Implement (GREEN)**

Create `install-core.ts` following the utility/ideas pattern:

- Interface: `InstallCoreOptions { assetsRoot, targetRoot, force? }`
- Interface: `InstallCoreResult { copiedSkills[], updatedSkills[], skippedSkills[], outdatedSkills[], copiedDocs: number, updatedDocs: number, skippedDocs: number }`
- Loop through `CORE_SKILLS`, call `copyDirWithVersionCheck` for each skill
- Copy docs: recursively copy from `join(assetsRoot, 'docs')` to `join(targetRoot, '.oat', 'docs')` using `copyDirWithStatus`

Run: `pnpm --filter @oat/cli test`
Expected: Pass (GREEN)

**Step 3: Commit**

```bash
git add packages/cli/src/commands/init/tools/core/
git commit -m "feat(p02-t02): create install-core.ts for core pack installation"
```

---

### Task p02-t03: Create core subcommand (`oat init tools core`)

**Files:**

- Create: `packages/cli/src/commands/init/tools/core/index.ts`
- Create: `packages/cli/src/commands/init/tools/core/index.test.ts`

**Step 1: Write test (RED)**

Test cases:

- Core pack always installs at user scope (even without `--scope user`)
- Interactive mode shows skill selection
- Non-interactive installs all core skills
- Force option prompts for confirmation
- JSON output includes status, scope, result

**Step 2: Implement (GREEN)**

Follow the utility subcommand pattern but:

- Always resolve to user scope (core is always user-level)
- Description: `'Install OAT core skills (diagnostics, docs)'`
- Install skills to user scope root (`~/.agents/skills/`)
- Install docs to `~/.oat/docs/` (user home)

**Step 3: Commit**

```bash
git add packages/cli/src/commands/init/tools/core/
git commit -m "feat(p02-t03): add oat init tools core subcommand"
```

---

### Task p02-t04: Register core pack in init tools orchestrator

**Files:**

- Modify: `packages/cli/src/commands/init/tools/index.ts`

**Step 1: Write test (RED)**

Add test cases to `index.test.ts`:

- Core appears in pack selection choices
- Core is always installed at user scope regardless of `resolveUserEligibleScope` result
- Non-interactive mode includes core in defaults
- `buildToolPacksSectionBody` includes core pack info

**Step 2: Implement (GREEN)**

Update `index.ts`:

- Add `'core'` to `ToolPack` type
- Add core to `PACK_CHOICES`: `{ label: 'Core [user]', value: 'core', checked: true }`
- Update `isUserEligibleSelection` to include `'core'`
- Add core installation block in `runInitTools`: always install to user root
- Import `installCore` and add to dependencies
- Add `PACK_DESCRIPTIONS` entry for core
- Update `buildToolPacksSectionBody` to note core pack user scope

**Step 3: Commit**

```bash
git add packages/cli/src/commands/init/tools/index.ts packages/cli/src/commands/init/tools/index.test.ts
git commit -m "feat(p02-t04): register core pack in init tools orchestrator"
```

---

### Task p02-t05: Update scan-tools to recognize core pack

**Files:**

- Modify: `packages/cli/src/commands/tools/shared/scan-tools.ts`

**Step 1: Implement**

Import `CORE_SKILLS` and add to `resolveSkillPack`:

```typescript
if ((CORE_SKILLS as readonly string[]).includes(name)) return 'core';
```

**Step 2: Verify**

Run: `pnpm --filter @oat/cli test`
Expected: All tests pass (scan-tools tests should still pass since core skills weren't in any pack before)

**Step 3: Commit**

```bash
git add packages/cli/src/commands/tools/shared/scan-tools.ts
git commit -m "feat(p02-t05): teach scan-tools to recognize core pack"
```

---

### Task p02-t06: Update bundle-assets.sh for docs bundling

**Files:**

- Modify: `packages/cli/scripts/bundle-assets.sh`

**Step 1: Implement**

Add docs directory copy after the existing template/script copies:

```bash
# Bundle docs for ~/.oat/docs/ distribution
if [ -d "${REPO_ROOT}/apps/oat-docs/docs" ]; then
  mkdir -p "${ASSETS}/docs"
  cp -R "${REPO_ROOT}/apps/oat-docs/docs/"* "${ASSETS}/docs/"
fi
```

**Step 2: Verify**

Run: `pnpm build` and confirm `packages/cli/assets/docs/` contains the markdown files.

**Step 3: Commit**

```bash
git add packages/cli/scripts/bundle-assets.sh
git commit -m "feat(p02-t06): bundle OAT docs into CLI assets for core pack distribution"
```

---

### Task p02-t07: Update bundle-consistency test for core pack

**Files:**

- Modify: `packages/cli/src/commands/init/tools/shared/bundle-consistency.test.ts`

**Step 1: Implement**

- Import `CORE_SKILLS`
- Add test: `'bundles every core skill'`
- Update `'does not bundle skills that belong to no pack'` to include `CORE_SKILLS` in `allPackSkills`

**Step 2: Verify**

Run: `pnpm --filter @oat/cli test`
Expected: All pass

**Step 3: Commit**

```bash
git add packages/cli/src/commands/init/tools/shared/bundle-consistency.test.ts
git commit -m "test(p02-t07): add core pack to bundle-consistency test"
```

---

## Phase 3: Rework Skills Per create-oat-skill Conventions

### Task p03-t01: Rewrite oat-doctor following create-oat-skill template

**Files:**

- Modify: `.agents/skills/oat-doctor/SKILL.md`

**Step 1: Read the template**

Read `.agents/skills/create-oat-skill/references/oat-skill-template.md` and `create-agnostic-skill/SKILL.md` baseline.

**Step 2: Rewrite SKILL.md**

Apply `create-oat-skill` conventions:

- Baseline guidance from `create-agnostic-skill` (progressive disclosure, section layout)
- Mode assertion with BLOCKED/ALLOWED activities
- Progress indicators with separator banner
- No project root resolution needed (doctor is not project-scoped)
- Bash safety patterns
- Question handling portable across hosts
- Config explanations sourced from `~/.oat/docs/` (per D6)
- Core pack manifest list for available-but-uninstalled discovery (include `CORE_SKILLS`)

**Step 3: Verify**

Run `pnpm oat:validate-skills` if available, otherwise manual review.

**Step 4: Commit**

```bash
git add .agents/skills/oat-doctor/
git commit -m "feat(p03-t01): rewrite oat-doctor per create-oat-skill conventions"
```

---

### Task p03-t02: Rewrite oat-docs following create-oat-skill template

**Files:**

- Modify: `.agents/skills/oat-docs/SKILL.md`

**Step 1: Rewrite SKILL.md**

Apply `create-oat-skill` conventions:

- Docs resolution: `~/.oat/docs/` ONLY (per D2)
- Mode assertion: read-only Q&A
- Progress indicators
- Hybrid explain + act model
- Config explanations sourced from docs when relevant
- Clear error message when docs not found at `~/.oat/docs/`

**Step 2: Commit**

```bash
git add .agents/skills/oat-docs/
git commit -m "feat(p03-t02): rewrite oat-docs per create-oat-skill conventions, ~/.oat/docs/ only"
```

---

### Task p03-t03: Move skills from utility to core in manifest

**Files:**

- Modify: `packages/cli/src/commands/init/tools/shared/skill-manifest.ts`

**Step 1: Verify**

Ensure `oat-docs` and `oat-doctor` are in `CORE_SKILLS` (not `UTILITY_SKILLS`). This should already be done in p02-t01, but verify consistency.

**Step 2: Full verification**

Run: `pnpm build && pnpm lint && pnpm type-check && pnpm --filter @oat/cli test`
Expected: All pass

**Step 3: Commit (if changes needed)**

```bash
git add packages/cli/src/commands/init/tools/shared/skill-manifest.ts
git commit -m "feat(p03-t03): finalize core pack skill registration"
```

---

## Reviews

| Scope | Type | Status  | Date | Artifact |
| ----- | ---- | ------- | ---- | -------- |
| p01   | code | pending | -    | -        |
| p02   | code | pending | -    | -        |
| p03   | code | pending | -    | -        |
| final | code | pending | -    | -        |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

**Meaning:**

- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**

- Phase 1: 3 tasks — initial skill files + registration (committed, needs rework)
- Phase 2: 7 tasks — core pack CLI infrastructure (types, manifest, installer, subcommand, orchestrator, scan-tools, bundle, tests)
- Phase 3: 3 tasks — rewrite skills per create-oat-skill, finalize registration

**Total: 13 tasks**

---

## References

- Discovery: `discovery.md`
- Skill template: `.agents/skills/create-oat-skill/references/oat-skill-template.md`
- Agnostic baseline: `.agents/skills/create-agnostic-skill/SKILL.md`
- Skill manifest: `packages/cli/src/commands/init/tools/shared/skill-manifest.ts`
- Bundle script: `packages/cli/scripts/bundle-assets.sh`
- Utility installer (reference): `packages/cli/src/commands/init/tools/utility/install-utility.ts`
- Ideas installer (reference): `packages/cli/src/commands/init/tools/ideas/install-ideas.ts`
- Init tools orchestrator: `packages/cli/src/commands/init/tools/index.ts`
- Scan tools: `packages/cli/src/commands/tools/shared/scan-tools.ts`
- Types: `packages/cli/src/commands/tools/shared/types.ts`
- Bundle consistency test: `packages/cli/src/commands/init/tools/shared/bundle-consistency.test.ts`
- Docs source: `apps/oat-docs/docs/`

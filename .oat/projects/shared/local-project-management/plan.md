---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-16
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ['p05']
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
oat_template: false
---

# Implementation Plan: local-project-management

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Formalize the implicit backlog, roadmap, and reference document system into a structured, file-per-item backlog with CLI tooling, agent skills, and a dedicated `project-management` skill pack.

**Architecture:** File-per-item backlog under `.oat/repo/reference/backlog/` with hybrid index (CLI-generated + curated sections), three `oat-pjm-*` skills for creation/update/review, CLI commands for index regeneration and ID generation, and a `project-management` skill pack for distribution.

**Tech Stack:** TypeScript ESM, Node.js 22, Vitest, pnpm workspaces, Turborepo

**Commit Convention:** `{type}({scope}): {description}` - e.g., `feat(p01-t01): add backlog-item template`

## Planning Checklist

- [x] Defer HiLL checkpoint confirmation to oat-project-implement

---

## Phase 1: Templates and Directory Structure

Foundation artifacts — templates, directory scaffold, and state.md updates that all subsequent phases depend on.

### Task p01-t01: Create backlog item template

**Files:**

- Create: `.oat/templates/backlog-item.md`

**Step 1: Create template**

Create `.oat/templates/backlog-item.md` with YAML frontmatter matching the schema from discovery:

```yaml
---
id: bl-{hash}
title: '{title}'
status: open # open | in_progress | closed | wont_do
priority: medium # urgent | high | medium | low | none
scope: task # idea | task | feature | initiative
scope_estimate: null # XS | S | M | L | XL | XXL
labels: []
assignee: null
created: '{ISO 8601 UTC}'
updated: '{ISO 8601 UTC}'
associated_issues: []
---
```

Body sections: `## Description`, `## Acceptance Criteria`

Add `oat_template: true` and `oat_template_name: backlog-item` to frontmatter.

**Step 2: Verify**

Run: `cat .oat/templates/backlog-item.md | head -20`
Expected: Valid YAML frontmatter with all schema fields

**Step 3: Commit**

```bash
git add .oat/templates/backlog-item.md
git commit -m "feat(p01-t01): add backlog-item template"
```

---

### Task p01-t02: Create roadmap template

**Files:**

- Create: `.oat/templates/roadmap.md`

**Step 1: Create template**

Create `.oat/templates/roadmap.md` with Now / Next / Later horizon structure:

```markdown
---
oat_template: true
oat_template_name: roadmap
---

# Roadmap

## Now (Active / Committed)

{Entries with backlog item IDs and project names}

## Next (Planned)

{...}

## Later (Directional Intent)

{...}
```

Each entry format: `- **bl-XXXX: {title}** — brief description. Project: {name} (if linked)`

Optional theme groupings within each horizon.

**Step 2: Verify**

Run: `cat .oat/templates/roadmap.md`
Expected: Three horizon sections with guidance comments

**Step 3: Commit**

```bash
git add .oat/templates/roadmap.md
git commit -m "feat(p01-t02): add roadmap template with Now/Next/Later horizons"
```

---

### Task p01-t03: Create backlog directory structure

**Files:**

- Create: `.oat/repo/reference/backlog/index.md`
- Create: `.oat/repo/reference/backlog/completed.md`
- Create: `.oat/repo/reference/backlog/items/.gitkeep`
- Create: `.oat/repo/reference/backlog/archived/.gitkeep`

**Step 1: Create directory scaffold**

- `backlog/index.md` — skeleton with managed-section markers (`<!-- OAT BACKLOG-INDEX -->` / `<!-- END OAT BACKLOG-INDEX -->`) for CLI-generated section, plus a `## Curated Overview` section for agent-maintained summaries.
- `backlog/completed.md` — header with timestamp-ordered format guidance. Newest first. Template reference at top.
- `backlog/items/.gitkeep` and `backlog/archived/.gitkeep` — empty directories tracked by git.

**Step 2: Verify**

Run: `find .oat/repo/reference/backlog -type f | sort`
Expected: `archived/.gitkeep`, `completed.md`, `index.md`, `items/.gitkeep`

**Step 3: Commit**

```bash
git add .oat/repo/reference/backlog/
git commit -m "feat(p01-t03): scaffold backlog directory structure"
```

---

### Task p01-t04: Add `associated_issues` to state.md template

**Files:**

- Modify: `.oat/templates/state.md`

**Step 1: Add field**

Add `associated_issues: []` to the YAML frontmatter in `.oat/templates/state.md`, after `oat_blockers`. Include a comment explaining the format:

```yaml
associated_issues: [] # [{type: backlog|project|jira|linear, ref: "identifier"}]
```

**Step 2: Verify**

Run: `grep "associated_issues" .oat/templates/state.md`
Expected: Field present in frontmatter

**Step 3: Commit**

```bash
git add .oat/templates/state.md
git commit -m "feat(p01-t04): add associated_issues to state.md template"
```

---

## Phase 2: CLI Support

Commands and scripts for backlog index regeneration and item ID generation. These are used by the `oat-pjm-*` skills.

### Task p02-t01: Implement backlog item ID generation utility

**Files:**

- Create: `packages/cli/src/commands/backlog/shared/generate-id.ts`
- Create: `packages/cli/src/commands/backlog/shared/generate-id.test.ts`

**Step 1: Write test (RED)**

Test cases:

- `generateBacklogId(filename, timestamp)` returns `bl-` + 4-char hex hash
- Same inputs produce same output (deterministic)
- Different inputs produce different outputs
- Output matches pattern `/^bl-[a-f0-9]{4}$/`

**Step 2: Implement (GREEN)**

```typescript
export function generateBacklogId(filename: string, createdAt: string): string {
  // Hash filename + createdAt, take first 4 hex chars
  // Return `bl-${hash}`
}
```

Use Node.js `crypto.createHash('sha256')` for hashing.

**Step 3: Verify**

Run: `pnpm test packages/cli/src/commands/backlog/shared/generate-id.test.ts`
Expected: All tests pass

**Step 4: Commit**

```bash
git add packages/cli/src/commands/backlog/shared/
git commit -m "feat(p02-t01): add backlog item ID generation utility"
```

---

### Task p02-t02: Implement backlog index regeneration command

**Files:**

- Create: `packages/cli/src/commands/backlog/regenerate-index.ts`
- Create: `packages/cli/src/commands/backlog/regenerate-index.test.ts`

**Step 1: Write test (RED)**

Test cases:

- Reads all `.md` files from `items/` directory
- Parses YAML frontmatter from each item file
- Generates a markdown table (id, title, status, priority, scope, scope_estimate)
- Writes table between `<!-- OAT BACKLOG-INDEX -->` / `<!-- END OAT BACKLOG-INDEX -->` markers in `index.md`
- Preserves content outside managed markers
- Handles empty `items/` directory gracefully
- Sorts by priority (urgent > high > medium > low > none), then by title

**Step 2: Implement (GREEN)**

```typescript
export async function regenerateBacklogIndex(
  backlogRoot: string,
): Promise<void> {
  // 1. Glob items/*.md
  // 2. Parse frontmatter from each
  // 3. Sort by priority then title
  // 4. Render markdown table
  // 5. Replace managed section in index.md
}
```

Uses the existing `<!-- OAT ... -->` / `<!-- END OAT ... -->` managed-section pattern. Parse YAML frontmatter with the same approach used elsewhere in the CLI.

**Step 3: Verify**

Run: `pnpm test packages/cli/src/commands/backlog/regenerate-index.test.ts`
Expected: All tests pass

**Step 4: Commit**

```bash
git add packages/cli/src/commands/backlog/
git commit -m "feat(p02-t02): add backlog index regeneration command"
```

---

### Task p02-t03: Wire backlog CLI commands

**Files:**

- Create: `packages/cli/src/commands/backlog/index.ts`
- Modify: `packages/cli/src/index.ts` (or main command registration file)

**Step 1: Create command group**

Register `oat backlog` command group with subcommands:

- `oat backlog regenerate-index [--backlog-root <path>]` — calls `regenerateBacklogIndex()`
- `oat backlog generate-id <filename>` — calls `generateBacklogId()` and prints the ID

Follow existing command registration patterns (Commander.js).

**Step 2: Verify**

Run: `pnpm run cli -- backlog regenerate-index --help`
Expected: Help text showing usage and options

Run: `pnpm run cli -- backlog generate-id test-item`
Expected: Prints a `bl-XXXX` ID

**Step 3: Commit**

```bash
git add packages/cli/src/commands/backlog/
git commit -m "feat(p02-t03): wire backlog CLI command group"
```

---

## Phase 3: Agent Skills

The three `oat-pjm-*` skills. These are markdown-based procedural guides that live in `.agents/skills/`.

### Task p03-t01: Create `oat-pjm-add-backlog-item` skill

**Files:**

- Create: `.agents/skills/oat-pjm-add-backlog-item/SKILL.md`

**Step 1: Author skill**

Follow `create-oat-skill` conventions:

- YAML frontmatter: `name`, `version: 1.0.0`, `description`, `user-invocable: true`, `allowed-tools`
- Mode assertion section
- Progress indicators (`OAT ▸ ADD BACKLOG ITEM`)
- Process steps:
  1. Ask user for title and description (or accept from context)
  2. Generate ID via `oat backlog generate-id <filename>`
  3. Copy template from `.oat/templates/backlog-item.md`
  4. Fill frontmatter (id, title, created, updated)
  5. Agent provides initial `scope_estimate`, asks user for confirmation/adjustment
  6. Write item file to `.oat/repo/reference/backlog/items/<slug>.md`
  7. Run `oat backlog regenerate-index` to update managed section
  8. Guide agent to update curated section in `index.md` with brief overview
- Success criteria section

**Step 2: Verify**

Run: `cat .agents/skills/oat-pjm-add-backlog-item/SKILL.md | head -10`
Expected: Valid frontmatter with version 1.0.0

**Step 3: Commit**

```bash
git add .agents/skills/oat-pjm-add-backlog-item/
git commit -m "feat(p03-t01): add oat-pjm-add-backlog-item skill"
```

---

### Task p03-t02: Refactor `update-repo-reference` to `oat-pjm-update-repo-reference`

**Files:**

- Create: `.agents/skills/oat-pjm-update-repo-reference/SKILL.md`
- Modify: `.agents/skills/update-repo-reference/SKILL.md` (deprecation notice)

**Step 1: Copy and refactor**

- Copy existing `.agents/skills/update-repo-reference/SKILL.md` as the starting point
- Rename to `oat-pjm-update-repo-reference`, update frontmatter (`name`, `version: 1.0.0`)
- Add mode assertion and progress indicators per `create-oat-skill` conventions
- Update Step 2 references from flat `backlog.md` to new directory structure:
  - `backlog.md` → `backlog/index.md` (curated section updates)
  - `backlog-completed.md` → `backlog/completed.md`
  - Add: run `oat backlog regenerate-index` after modifying items
- Update `deferred-phases.md` references → remove (file retired)
- Update roadmap references to mention Now/Next/Later structure
- Add success criteria section

**Step 2: Add deprecation to old skill**

Add a note at the top of the original `update-repo-reference/SKILL.md`:

```markdown
> ⚠️ Deprecated: Use `oat-pjm-update-repo-reference` instead.
```

**Step 3: Verify**

Run: `grep "version:" .agents/skills/oat-pjm-update-repo-reference/SKILL.md`
Expected: `version: 1.0.0`

**Step 4: Commit**

```bash
git add .agents/skills/oat-pjm-update-repo-reference/ .agents/skills/update-repo-reference/
git commit -m "feat(p03-t02): refactor update-repo-reference to oat-pjm namespace"
```

---

### Task p03-t03: Refactor `review-backlog` to `oat-pjm-review-backlog`

**Files:**

- Create: `.agents/skills/oat-pjm-review-backlog/SKILL.md`
- Create: `.agents/skills/oat-pjm-review-backlog/references/backlog-review-template.md`
- Modify: `.agents/skills/review-backlog/SKILL.md` (deprecation notice)

**Step 1: Copy and refactor**

- Copy existing `review-backlog/SKILL.md` and `review-backlog/references/backlog-review-template.md`
- Rename to `oat-pjm-review-backlog`, update frontmatter (`name`, `version: 1.0.0`)
- Add mode assertion and progress indicators per conventions
- Update file paths throughout:
  - `backlog.md` → `backlog/index.md` + individual `backlog/items/*.md` files
  - `backlog-completed.md` → `backlog/completed.md` + `backlog/archived/*.md`
- Update item discovery: glob `backlog/items/*.md` instead of parsing flat markdown sections
- Parse YAML frontmatter from item files for value/effort/scope analysis
- Keep the existing review template structure (7 sections: executive summary, item catalog, dependency graph, parallel lanes, execution order, roadmap alignment, observations)
- Add success criteria section

**Step 2: Add deprecation to old skill**

Add deprecation note to `review-backlog/SKILL.md`.

**Step 3: Verify**

Run: `grep "version:" .agents/skills/oat-pjm-review-backlog/SKILL.md`
Expected: `version: 1.0.0`

**Step 4: Commit**

```bash
git add .agents/skills/oat-pjm-review-backlog/ .agents/skills/review-backlog/
git commit -m "feat(p03-t03): refactor review-backlog to oat-pjm namespace"
```

---

## Phase 4: Skill Pack Infrastructure

Register the `project-management` skill pack following the established pattern for distribution via `oat tools install/update/remove`.

### Task p04-t01: Add `PROJECT_MANAGEMENT_SKILLS` to skill manifest

**Files:**

- Modify: `packages/cli/src/commands/init/tools/shared/skill-manifest.ts`

**Step 1: Add manifest constants**

Add new exported constants:

```typescript
export const PROJECT_MANAGEMENT_SKILLS = [
  'oat-pjm-add-backlog-item',
  'oat-pjm-update-repo-reference',
  'oat-pjm-review-backlog',
] as const;

export const PROJECT_MANAGEMENT_TEMPLATES = [
  'backlog-item.md',
  'roadmap.md',
] as const;

export const PROJECT_MANAGEMENT_SCRIPTS = [] as const;
```

**Step 2: Verify**

Run: `pnpm type-check`
Expected: No type errors

**Step 3: Commit**

```bash
git add packages/cli/src/commands/init/tools/shared/skill-manifest.ts
git commit -m "feat(p04-t01): add project-management skills to manifest"
```

---

### Task p04-t02: Extend `PackName` type and pack resolution

**Files:**

- Modify: `packages/cli/src/commands/tools/shared/types.ts`
- Modify: `packages/cli/src/commands/tools/shared/scan-tools.ts`

**Step 1: Update PackName**

```typescript
export type PackName = 'ideas' | 'workflows' | 'utility' | 'project-management';
```

**Step 2: Update pack resolution**

In `scan-tools.ts`, add to `resolveSkillPack()`:

```typescript
if ((PROJECT_MANAGEMENT_SKILLS as readonly string[]).includes(name))
  return 'project-management';
```

Import `PROJECT_MANAGEMENT_SKILLS` from the manifest.

**Step 3: Verify**

Run: `pnpm type-check && pnpm lint`
Expected: No errors

**Step 4: Commit**

```bash
git add packages/cli/src/commands/tools/shared/types.ts packages/cli/src/commands/tools/shared/scan-tools.ts
git commit -m "feat(p04-t02): extend PackName and pack resolution for project-management"
```

---

### Task p04-t03: Create installer module

**Files:**

- Create: `packages/cli/src/commands/init/tools/project-management/install-project-management.ts`
- Create: `packages/cli/src/commands/init/tools/project-management/install-project-management.test.ts`

**Step 1: Write test (RED)**

Test cases:

- Copies all PROJECT_MANAGEMENT_SKILLS to target skills directory
- Copies all PROJECT_MANAGEMENT_TEMPLATES to target templates directory
- Returns correct result with copied/skipped/outdated arrays
- Handles force mode (overwrites existing)
- Skips skills with matching or newer versions

**Step 2: Implement (GREEN)**

Follow `install-workflows.ts` pattern:

- Define `InstallProjectManagementOptions` and `InstallProjectManagementResult` interfaces
- Iterate over `PROJECT_MANAGEMENT_SKILLS`, use `copyDirWithVersionCheck()` for each
- Iterate over `PROJECT_MANAGEMENT_TEMPLATES`, use `copyFileWithStatus()` for each
- Return detailed result tracking

**Step 3: Verify**

Run: `pnpm test packages/cli/src/commands/init/tools/project-management/`
Expected: All tests pass

**Step 4: Commit**

```bash
git add packages/cli/src/commands/init/tools/project-management/
git commit -m "feat(p04-t03): add project-management pack installer"
```

---

### Task p04-t04: Register pack in init tools and descriptions

**Files:**

- Modify: `packages/cli/src/commands/init/tools/index.ts`

**Step 1: Add pack choice and description**

Add to `PACK_CHOICES`:

```typescript
{ label: 'Project Management [project]', value: 'project-management', checked: false },
```

Add to `PACK_DESCRIPTIONS`:

```typescript
'project-management': 'Local backlog, roadmap, and reference doc management (oat-pjm-* skills)',
```

Wire `installProjectManagement()` call into `runInitTools()` when pack is selected.

**Step 2: Verify**

Run: `pnpm type-check && pnpm lint`
Expected: No errors

Run: `pnpm run cli -- tools install --help`
Expected: project-management appears as an available pack

**Step 3: Commit**

```bash
git add packages/cli/src/commands/init/tools/index.ts
git commit -m "feat(p04-t04): register project-management pack in init tools"
```

---

### Task p04-t05: Update `bundle-assets.sh` and verify consistency

**Files:**

- Modify: `packages/cli/scripts/bundle-assets.sh`

**Step 1: Add to bundle script**

Add the three `oat-pjm-*` skill names to the `SKILLS=()` bash array.
Add template copy commands for `backlog-item.md` and `roadmap.md` in the templates section.

**Step 2: Verify consistency**

Run: `pnpm test packages/cli/src/commands/init/tools/shared/bundle-consistency.test.ts`
Expected: All consistency tests pass (no orphaned skills, no missing skills)

Run: `pnpm build`
Expected: Build succeeds with bundled assets

**Step 3: Commit**

```bash
git add packages/cli/scripts/bundle-assets.sh
git commit -m "feat(p04-t05): add project-management skills to bundle-assets.sh"
```

---

## Phase 5: Migration

Migrate existing flat files to the new structure. This is the final phase because it depends on all tooling being in place.

### Task p05-t01: Migrate existing backlog items to file-per-item

**Files:**

- Modify: `.oat/repo/reference/backlog/index.md`
- Create: `.oat/repo/reference/backlog/items/*.md` (one per active backlog item)
- Modify: `.oat/repo/reference/backlog.md` (add deprecation pointer)

**Step 1: Decompose backlog.md**

For each of the 8 active items in `backlog.md`:

1. Create individual file in `backlog/items/<slug>.md` using backlog-item template
2. Fill frontmatter: generate ID via CLI, set title/status/priority/scope from existing data
3. Migrate description and acceptance criteria to body sections
4. Run `oat backlog regenerate-index` to populate managed section in index.md
5. Write curated summaries in the curated section of index.md

Item mapping (from existing flat backlog):

- Inbox items (3): `oat-project-capture-skill.md`, `s3-archival-project-complete.md`, `backlog-refinement-jira.md`
- Planned items (5): `oat-pjm-workflow.md`, `codex-prompt-wrapper.md`, `pr-review-skill-set.md`, `dependency-intelligence.md`, `idea-promotion-auto-discovery.md`

**Step 2: Add pointer to old file**

Add note at top of `backlog.md`:

```markdown
> ⚠️ Migrated: This file is superseded by `.oat/repo/reference/backlog/`. See `backlog/index.md` for the current backlog.
```

**Step 3: Verify**

Run: `find .oat/repo/reference/backlog/items -name "*.md" | wc -l`
Expected: 8 item files

Run: `grep "OAT BACKLOG-INDEX" .oat/repo/reference/backlog/index.md`
Expected: Managed section markers present with generated table

**Step 4: Commit**

```bash
git add .oat/repo/reference/backlog/ .oat/repo/reference/backlog.md
git commit -m "feat(p05-t01): migrate 8 backlog items to file-per-item structure"
```

---

### Task p05-t02: Migrate completed backlog to new structure

**Files:**

- Modify: `.oat/repo/reference/backlog/completed.md`
- Create: `.oat/repo/reference/backlog/archived/*.md` (selected items)
- Modify: `.oat/repo/reference/backlog-completed.md` (add deprecation pointer)

**Step 1: Migrate completed items**

- Populate `backlog/completed.md` with summary entries from the 31 completed items in `backlog-completed.md`. Format: timestamp-ordered, newest first, one-line summaries.
- For the 5 most recent completed items, create full item files in `backlog/archived/` with `status: closed` frontmatter. Older items get summary entries only (avoid file bloat for historical items).

**Step 2: Add pointer to old file**

Add deprecation note at top of `backlog-completed.md`.

**Step 3: Verify**

Run: `wc -l .oat/repo/reference/backlog/completed.md`
Expected: 31+ summary entries

**Step 4: Commit**

```bash
git add .oat/repo/reference/backlog/ .oat/repo/reference/backlog-completed.md
git commit -m "feat(p05-t02): migrate completed backlog to new structure"
```

---

### Task p05-t03: Migrate roadmap to Now/Next/Later structure

**Files:**

- Modify: `.oat/repo/reference/roadmap.md`

**Step 1: Restructure roadmap**

- Add template reference at top: `<!-- Structure guidance: .oat/templates/roadmap.md -->`
- Restructure existing 8 phases into Now / Next / Later horizons:
  - **Now:** Phase 7 (Quick Mode), Phase 8 (Provider Interop) — both in progress
  - **Next:** Phase 4 polish, Phase 5 (Staleness), Phase 6 (Parallel Execution)
  - **Later:** Phase 9 (Multi-Project), Phase 10 (Memory System)
- Reference backlog items by ID where applicable (after migration creates them)
- Preserve existing detail but reorganize into horizon sections
- Keep the status summary table for backward reference

**Step 2: Verify**

Run: `grep "^## Now\|^## Next\|^## Later" .oat/repo/reference/roadmap.md`
Expected: Three horizon headings

**Step 3: Commit**

```bash
git add .oat/repo/reference/roadmap.md
git commit -m "feat(p05-t03): migrate roadmap to Now/Next/Later structure"
```

---

### Task p05-t04: Retire `deferred-phases.md`

**Files:**

- Delete: `.oat/repo/reference/deferred-phases.md`
- Create: `.oat/repo/reference/backlog/items/staleness-knowledge-drift.md` (if not already created in p05-t01)
- Create: `.oat/repo/reference/backlog/items/memory-system.md` (if not already created in p05-t01)

**Step 1: Migrate remaining relevant items**

- Check if staleness/knowledge-drift and memory-system backlog items already exist from p05-t01 migration
- If not, create them as new backlog items with content from deferred-phases.md Phase 5 and Phase 10
- Delete `deferred-phases.md`

**Step 2: Regenerate index**

Run: `oat backlog regenerate-index`

**Step 3: Verify**

Run: `test ! -f .oat/repo/reference/deferred-phases.md && echo "deleted"`
Expected: "deleted"

**Step 4: Commit**

```bash
git add .oat/repo/reference/
git commit -m "feat(p05-t04): retire deferred-phases.md, migrate items to backlog"
```

---

## Phase 6: Review Fixes

Close the final code-review findings, then re-run the final review gate before PR preparation.

### Task p06-t01: (review) Add backlog ID collision handling to backlog item creation

**Files:**

- Modify: `.agents/skills/oat-pjm-add-backlog-item/SKILL.md`
- Modify: `packages/cli/src/commands/backlog/index.ts`
- Modify: `packages/cli/src/commands/backlog/shared/generate-id.ts`
- Modify: `packages/cli/src/commands/backlog/shared/generate-id.test.ts`

**Step 1: Understand the issue**

Review finding: the current file-backed backlog flow generates 4-character hex IDs without checking for collisions before writing a new item.
Location: `packages/cli/src/commands/backlog/shared/generate-id.ts:1-11`

**Step 2: Implement fix**

Add an explicit duplicate-ID guard to the backlog item creation flow. After generating a candidate ID, scan existing `backlog/items/*.md` records for a matching `id:` value and regenerate with a disambiguated input when needed. Keep the retry path documented in the `oat-pjm-add-backlog-item` skill so the workflow stays portable.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/shared/generate-id.test.ts`; `rg -n "collision|duplicate|existing id" .agents/skills/oat-pjm-add-backlog-item/SKILL.md`
Expected: tests pass and the skill documents the collision-handling flow

**Step 4: Commit**

```bash
git add .agents/skills/oat-pjm-add-backlog-item/SKILL.md packages/cli/src/commands/backlog/index.ts packages/cli/src/commands/backlog/shared/generate-id.ts packages/cli/src/commands/backlog/shared/generate-id.test.ts
git commit -m "fix(p06-t01): add backlog id collision handling"
```

### Task p06-t02: (review) Update `oat-pjm-update-repo-reference` to use Grep-tool instructions

**Files:**

- Modify: `.agents/skills/oat-pjm-update-repo-reference/SKILL.md`

**Step 1: Understand the issue**

Review finding: the skill still shows raw `rg` sanity-check commands instead of using the repo's Grep-tool convention.
Location: `.agents/skills/oat-pjm-update-repo-reference/SKILL.md:88-93`

**Step 2: Implement fix**

Replace the raw `rg` command examples with Grep-tool-oriented instructions or neutral wording that does not require shelling out to `rg`. Keep the verification guidance aligned with the skill's declared tool surface.

**Step 3: Verify**

Run: `rg -n "\\brg\\b" .agents/skills/oat-pjm-update-repo-reference/SKILL.md`
Expected: no raw `rg` invocation remains in the sanity-check step

**Step 4: Commit**

```bash
git add .agents/skills/oat-pjm-update-repo-reference/SKILL.md
git commit -m "fix(p06-t02): align repo-reference skill with grep-tool guidance"
```

### Task p06-t03: (review) Record the final 9-item backlog count in implementation deviations

**Files:**

- Modify: `implementation.md`

**Step 1: Understand the issue**

Review finding: the deviation log captures the initial 7-vs-8 migration mismatch but does not record the final active backlog count after the deferred-phases retirement added two more items.
Location: `implementation.md` deviation tracking for phase 5 migration outcomes

**Step 2: Implement fix**

Update the deviation tracking so it explicitly records that the active backlog settled at 9 items after `p05-t04` completed. Keep the note tied to the plan assumptions so future readers can reconcile the migration history without re-reading the commit log.

**Step 3: Verify**

Run: `rg -n "9 active item files|9 total|deferred-phases" .oat/projects/shared/local-project-management/implementation.md`
Expected: the implementation notes clearly explain the final 9-item outcome

**Step 4: Commit**

```bash
git add .oat/projects/shared/local-project-management/implementation.md
git commit -m "fix(p06-t03): document final backlog item count deviation"
```

### Task p06-t04: (review) Add reproducible input support to `oat backlog generate-id`

**Files:**

- Modify: `packages/cli/src/commands/backlog/index.ts`
- Modify: `packages/cli/src/commands/backlog/shared/generate-id.test.ts`
- Modify: `packages/cli/src/commands/help-snapshots.test.ts`

**Step 1: Understand the issue**

Review finding: the CLI subcommand always seeds ID generation with the invocation timestamp, so the same filename cannot be reproduced later from the command alone.
Location: `packages/cli/src/commands/backlog/index.ts:86`

**Step 2: Implement fix**

Add an optional `--created-at <timestamp>` input to `oat backlog generate-id` so callers can reproduce a known ID when they have the original creation timestamp. Keep the current timestamp-default behavior for the normal one-shot workflow, and document the option in the command help/output snapshots.

**Step 3: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/backlog/shared/generate-id.test.ts src/commands/help-snapshots.test.ts`; `pnpm run cli -- backlog generate-id test-item --help`
Expected: targeted tests pass and the CLI help documents the reproducible-input option

**Step 4: Commit**

```bash
git add packages/cli/src/commands/backlog/index.ts packages/cli/src/commands/backlog/shared/generate-id.test.ts packages/cli/src/commands/help-snapshots.test.ts
git commit -m "fix(p06-t04): add reproducible input support to generate-id"
```

---

## Reviews

{Track reviews here after running the oat-project-review-provide and oat-project-review-receive skills.}

{Keep both code + artifact rows below. Add additional code rows (p03, p04, etc.) as needed, but do not delete `spec`/`design`.}

| Scope  | Type     | Status          | Date       | Artifact                                    |
| ------ | -------- | --------------- | ---------- | ------------------------------------------- |
| p01    | code     | pending         | -          | -                                           |
| p02    | code     | pending         | -          | -                                           |
| p03    | code     | pending         | -          | -                                           |
| p04    | code     | pending         | -          | -                                           |
| p05    | code     | pending         | -          | -                                           |
| final  | code     | fixes_completed | 2026-03-16 | reviews/archived/final-review-2026-03-16.md |
| spec   | artifact | pending         | -          | -                                           |
| design | artifact | pending         | -          | -                                           |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

**Meaning:**

- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**

- Phase 1: 4 tasks - Templates and directory structure
- Phase 2: 3 tasks - CLI support (ID generation, index regeneration, command wiring)
- Phase 3: 3 tasks - Agent skills (add-backlog-item, update-repo-reference, review-backlog)
- Phase 4: 5 tasks - Skill pack infrastructure (manifest, types, installer, registration, bundling)
- Phase 5: 4 tasks - Migration (backlog items, completed items, roadmap, deferred-phases retirement)
- Phase 6: 4 tasks - Review fixes from the final code review

**Total: 23 tasks**

Review-fix tasks are complete. Re-run the final review gate to move this project from `fixes_completed` to `passed`.

---

## References

- Discovery: `discovery.md`

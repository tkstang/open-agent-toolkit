---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-15
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: []
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: oat-cli-doctor-skills

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Create `/oat-doctor` and `/oat-docs` utility skills, register them in the skill manifest and bundle script.

**Architecture:** Two standalone SKILL.md files following existing OAT skill conventions. No CLI code changes — skills use existing `oat` CLI commands with `--json` for data gathering.

**Tech Stack:** Markdown (SKILL.md), Bash (CLI invocations within skills)

**Commit Convention:** `feat(p01-tNN): {description}`

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user
- [x] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Create Skills and Register

### Task p01-t01: Create oat-doctor skill

**Files:**

- Create: `.agents/skills/oat-doctor/SKILL.md`

**Step 1: Author SKILL.md**

Create the oat-doctor skill with:

- Frontmatter: name, version 1.0.0, description, user-invocable, allowed-tools (Read, Bash, Glob, Grep, AskUserQuestion)
- Mode assertion: diagnostic only, no code changes
- Two modes: check (default) and summary (`--summary` argument)
- Progress indicators with step banners
- Check mode steps: gather data via `oat tools list --json --scope all`, `oat tools outdated --json --scope all`, `oat config list --json`; detect stale pointers, outdated skills, missing packs; output terse warnings with fix commands
- Summary mode steps: full dashboard of installed skills (user vs project), config values with explanations, available-but-uninstalled packs, template state
- Available-but-uninstalled discovery: embed the manifest skill lists and compare against installed

**Step 2: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors (SKILL.md is markdown, won't affect these)

**Step 3: Commit**

```bash
git add .agents/skills/oat-doctor/
git commit -m "feat(p01-t01): create oat-doctor diagnostic skill"
```

---

### Task p01-t02: Create oat-docs skill

**Files:**

- Create: `.agents/skills/oat-docs/SKILL.md`

**Step 1: Author SKILL.md**

Create the oat-docs skill with:

- Frontmatter: name, version 1.0.0, description, user-invocable, allowed-tools (Read, Glob, Grep, AskUserQuestion)
- Mode assertion: read-only Q&A, no documentation editing
- Steps: resolve docs location (repo `apps/oat-docs/docs/` or bundled `~/.oat/docs/`), read user question from arguments or ask, search docs for relevant content, synthesize answer from local docs, offer to demonstrate or invoke related skills
- Hybrid explain + act model: primarily answers questions, but can offer to run commands

**Step 2: Verify**

Run: `pnpm lint && pnpm type-check`
Expected: No errors

**Step 3: Commit**

```bash
git add .agents/skills/oat-docs/
git commit -m "feat(p01-t02): create oat-docs interactive Q&A skill"
```

---

### Task p01-t03: Register skills in manifest and bundle script

**Files:**

- Modify: `packages/cli/src/commands/init/tools/shared/skill-manifest.ts`
- Modify: `packages/cli/scripts/bundle-assets.sh`

**Step 1: Update skill-manifest.ts**

Add `'oat-doctor'` and `'oat-docs'` to `UTILITY_SKILLS` array (alphabetical order).

**Step 2: Update bundle-assets.sh**

Add `oat-doctor` and `oat-docs` to the `SKILLS` array (alphabetical order within the existing grouping).

**Step 3: Verify**

Run: `pnpm build && pnpm lint && pnpm type-check && pnpm --filter @oat/cli test`
Expected: All pass, including bundle-consistency test

**Step 4: Commit**

```bash
git add packages/cli/src/commands/init/tools/shared/skill-manifest.ts packages/cli/scripts/bundle-assets.sh
git commit -m "feat(p01-t03): register oat-doctor and oat-docs in utility pack manifest"
```

---

## Reviews

| Scope | Type | Status  | Date | Artifact |
| ----- | ---- | ------- | ---- | -------- |
| p01   | code | pending | -    | -        |
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

- Phase 1: 3 tasks — 2 skill files + manifest registration

**Total: 3 tasks**

Ready for code review and merge.

---

## References

- Discovery: `discovery.md`
- Skill manifest: `packages/cli/src/commands/init/tools/shared/skill-manifest.ts`
- Bundle script: `packages/cli/scripts/bundle-assets.sh`
- Existing utility skill reference: `.agents/skills/oat-docs-analyze/SKILL.md`
- Docs source: `apps/oat-docs/docs/`

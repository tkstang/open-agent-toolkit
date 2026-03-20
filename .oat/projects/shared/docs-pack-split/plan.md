---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-20
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ['p02'] # phases to pause AFTER completing (empty = every phase)
oat_plan_source: quick # spec-driven | quick | imported
oat_import_reference: null # e.g., references/imported-plan.md
oat_import_source_path: null # original source path provided by user
oat_import_provider: null # codex | cursor | claude | null
oat_generated: false
---

# Implementation Plan: docs-pack-split

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Split docs-related analyze/apply workflows into a dedicated `docs`
tool pack while keeping `oat-docs` in `core`, then update supporting CLI
commands, shared assets, and end-user documentation so pack behavior and docs
stay aligned.

**Architecture:** Extend the existing pack model by adding a first-class `docs`
pack alongside the current bundled packs, then propagate that new pack through
installer commands, pack scanning and lifecycle commands, shared helper asset
locations, and the docs/help surface.

**Tech Stack:** TypeScript CLI commands and Vitest tests in `packages/cli`,
shell asset bundling scripts, Markdown docs in `apps/oat-docs/docs`, and skill
metadata under `.agents/skills`.

**Commit Convention:** `{type}({scope}): {description}` - e.g., `feat(p01-t01): add user auth endpoint`

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user
- [x] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Add the Docs Pack to the CLI Model

### Task p01-t01: Introduce the `docs` pack manifest and installer command

**Files:**

- Create: `packages/cli/src/commands/init/tools/docs/index.ts`
- Create: `packages/cli/src/commands/init/tools/docs/index.test.ts`
- Create: `packages/cli/src/commands/init/tools/docs/install-docs.ts`
- Create: `packages/cli/src/commands/init/tools/docs/install-docs.test.ts`
- Modify: `packages/cli/src/commands/init/tools/shared/skill-manifest.ts`
- Modify: `packages/cli/src/commands/init/tools/index.ts`
- Modify: `packages/cli/src/commands/init/tools/shared/bundle-consistency.test.ts`

**Step 1: Write test (RED)**

Add failing tests for the new `docs` pack manifest, installer behavior, and
init-tools command registration.

Run: `pnpm --filter @oat/cli test -- src/commands/init/tools/docs/install-docs.test.ts src/commands/init/tools/docs/index.test.ts src/commands/init/tools/index.test.ts src/commands/init/tools/shared/bundle-consistency.test.ts`
Expected: Test fails (RED)

**Step 2: Implement (GREEN)**

Add `DOCS_SKILLS`, implement the new docs-pack installer command, wire the pack
into init-tools selection and descriptions, and keep bundle consistency tests in
sync with the new manifest.

Run: `pnpm --filter @oat/cli test -- src/commands/init/tools/docs/install-docs.test.ts src/commands/init/tools/docs/index.test.ts src/commands/init/tools/index.test.ts src/commands/init/tools/shared/bundle-consistency.test.ts`
Expected: Test passes (GREEN)

**Step 3: Refactor**

Refine pack descriptions and installer defaults so `docs` reads consistently
next to `core`, `utility`, and the other bundled packs.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli lint && pnpm --filter @oat/cli type-check`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/cli/src/commands/init/tools
git commit -m "feat(p01-t01): add docs tool pack installer"
```

---

### Task p01-t02: Propagate `docs` pack support through tool management and legacy removal flows

**Files:**

- Modify: `packages/cli/src/commands/tools/shared/types.ts`
- Modify: `packages/cli/src/commands/tools/shared/scan-tools.ts`
- Modify: `packages/cli/src/commands/tools/shared/scan-tools.test.ts`
- Modify: `packages/cli/src/commands/tools/list/list-tools.test.ts`
- Modify: `packages/cli/src/commands/tools/update/index.ts`
- Modify: `packages/cli/src/commands/tools/update/update-tools.test.ts`
- Modify: `packages/cli/src/commands/tools/remove/index.ts`
- Modify: `packages/cli/src/commands/tools/remove/remove-tools.test.ts`
- Modify: `packages/cli/src/commands/remove/skills/remove-skills.ts`
- Modify: `packages/cli/src/commands/remove/skills/remove-skills.test.ts`
- Modify: `packages/cli/src/commands/help-snapshots.test.ts`

**Step 1: Write test (RED)**

Add or update failing tests that expect `docs` pack membership in scan/list
results, tool update/remove pack validation, legacy `remove skills --pack`
support, and help snapshot output.

**Step 2: Implement (GREEN)**

Update pack unions, scanners, pack validators, and help text so the new pack is
handled anywhere pack names are parsed or displayed.

**Step 3: Refactor**

Remove duplicated pack-name literals where practical so future pack additions do
not require as much manual synchronization.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/tools/shared/scan-tools.test.ts src/commands/tools/list/list-tools.test.ts src/commands/tools/update/update-tools.test.ts src/commands/tools/remove/remove-tools.test.ts src/commands/remove/skills/remove-skills.test.ts src/commands/help-snapshots.test.ts`
Expected: Updated pack management tests and help snapshots pass

**Step 5: Commit**

```bash
git add packages/cli/src/commands/tools packages/cli/src/commands/remove packages/cli/src/commands/help-snapshots.test.ts
git commit -m "feat(p01-t02): wire docs pack through tool management"
```

---

## Phase 2: Decouple Shared Assets and Refresh Documentation

### Task p02-t01: Move the shared tracking helper to a neutral location and update skill references

**Files:**

- Create or move: neutral shared tracking helper location
- Modify: `.agents/skills/oat-agent-instructions-analyze/SKILL.md`
- Modify: `.agents/skills/oat-agent-instructions-apply/SKILL.md`
- Modify: `.agents/skills/oat-docs-analyze/SKILL.md`
- Modify: `.agents/skills/oat-docs-apply/SKILL.md`
- Modify: `packages/cli/scripts/bundle-assets.sh`
- Modify: any tests or asset expectations that depend on the helper path

**Step 1: Write test (RED)**

Add or update checks that fail while docs skills still reference a helper inside
another skill's directory or while the neutral helper is not bundled correctly.

Run: `rg -n "oat-agent-instructions-analyze/scripts/resolve-tracking.sh|resolve-tracking.sh" .agents/skills packages/cli/scripts`
Expected: Current references reveal the old cross-pack coupling

**Step 2: Implement (GREEN)**

Move the tracking helper to a neutral shared location, update all skill
references, and ensure bundled assets include the helper from its new home.

Run: `rg -n "resolve-tracking.sh" .agents/skills packages/cli/scripts .oat/scripts`
Expected: Only the new shared path is referenced

**Step 3: Refactor**

Tighten helper-path comments and reference notes in the skill docs so future
pack reorganizations do not recreate a hidden dependency.

**Step 4: Verify**

Run: `pnpm --filter @oat/cli test -- src/commands/init/tools/shared/bundle-consistency.test.ts && pnpm --filter @oat/cli type-check`
Expected: Asset and CLI checks pass with the helper in its neutral location

**Step 5: Commit**

```bash
git add .agents/skills .oat/scripts packages/cli/scripts
git commit -m "refactor(p02-t01): decouple docs pack helper path"
```

---

### Task p02-t02: Update product docs and examples for the new pack layout

**Files:**

- Modify: `README.md`
- Modify: `apps/oat-docs/docs/guide/tool-packs.md`
- Modify: `apps/oat-docs/docs/guide/getting-started.md`
- Modify: `apps/oat-docs/docs/guide/cli-reference.md`
- Modify: `apps/oat-docs/docs/guide/documentation/quickstart.md`
- Modify: `apps/oat-docs/docs/guide/documentation/workflows.md`
- Modify: any additional docs pages that still present the moved skills as part
  of `utility`

**Step 1: Write test (RED)**

Identify stale docs references to `utility` for docs workflows and stale pack
lists that do not mention `docs`.

Run: `rg -n "utility pack installs|core, ideas, workflows, utility|project-management, research|oat init tools utility|docs analysis and apply skills installed via the utility pack" README.md apps/oat-docs/docs`
Expected: Existing docs still reflect the pre-split pack model

**Step 2: Implement (GREEN)**

Update pack lists, installation examples, and docs workflow guidance so user
documentation matches the new `core`/`docs`/`utility` split.

Run: `rg -n "oat init tools docs|docs pack|utility pack installs" README.md apps/oat-docs/docs`
Expected: Docs references reflect the new pack and no stale guidance remains in
the touched pages

**Step 3: Refactor**

Trim duplicate explanations where a single canonical pack description page can
be referenced instead of restating the same taxonomy.

**Step 4: Verify**

Run: `pnpm --filter oat-docs docs:lint && pnpm build:docs`
Expected: Markdown lint and docs build pass

**Step 5: Commit**

```bash
git add README.md apps/oat-docs/docs
git commit -m "docs(p02-t02): document docs tool pack split"
```

---

## Reviews

{Track reviews here after running the oat-project-review-provide and oat-project-review-receive skills.}

{Keep both code + artifact rows below. Add additional code rows (p03, p04, etc.) as needed, but do not delete `spec`/`design`.}

| Scope  | Type     | Status  | Date | Artifact |
| ------ | -------- | ------- | ---- | -------- |
| p01    | code     | pending | -    | -        |
| p02    | code     | pending | -    | -        |
| final  | code     | pending | -    | -        |
| spec   | artifact | pending | -    | -        |
| design | artifact | pending | -    | -        |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

**Meaning:**

- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**

- Phase 1: 2 tasks - add the docs pack to installer, scanning, update/remove,
  and help surfaces
- Phase 2: 2 tasks - decouple shared helper assets and update repository/docs
  guidance

**Total: 4 tasks**

Ready for code review and merge.

---

## References

- Discovery: `discovery.md`
- Design: `design.md` (not used in this quick-mode project)
- Spec: `spec.md` (not used in this quick-mode project)

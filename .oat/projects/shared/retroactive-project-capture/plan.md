---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-12
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: []
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
oat_template: false
---

# Implementation Plan: retroactive-project-capture

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Create an `oat-project-capture` skill that retroactively builds OAT project artifacts from an existing branch and conversation context.

**Architecture:** Single SKILL.md file following established OAT skill conventions. No CLI command, no new packages — pure skill definition.

**Tech Stack:** Markdown (SKILL.md)

**Commit Convention:** `feat(p01-tNN): {description}` - e.g., `feat(p01-t01): scaffold oat-project-capture skill`

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user
- [x] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Skill Implementation

### Task p01-t01: Create oat-project-capture SKILL.md

**Files:**

- Create: `.agents/skills/oat-project-capture/SKILL.md`

**Step 1: Write skill definition**

Create the SKILL.md with proper frontmatter and the full capture workflow:

Frontmatter:

- `name: oat-project-capture`
- `version: 1.0.0`
- `description: Use when work happened outside the OAT project workflow and needs retroactive project tracking. Creates a full project from an existing branch and conversation context.`
- `disable-model-invocation: true`
- `user-invocable: true`
- `allowed-tools: Read, Write, Bash(git:*), Glob, Grep, AskUserQuestion`

Sections to include:

1. **Prerequisites** — Active git branch with commits, conversation context available.

2. **Mode Assertion** — OAT MODE: Capture. Blocked: no new implementation code. Allowed: project scaffolding, artifact population, state updates.

3. **Progress Indicators** — Phase banner (`OAT ▸ CAPTURE`) and step indicators for 8 steps.

4. **Step 0: Resolve context** — Detect current branch, infer base branch (main/master), verify commits exist beyond base. Check for existing project with candidate name.

5. **Step 1: Name inference** — Propose a project name based on conversation context (what was accomplished). Present to user via `AskUserQuestion` with option to accept or rename. Do NOT default to branch name — use semantic understanding of the work.

6. **Step 2: Branch analysis** — Run `git log --oneline {base}..HEAD`, `git diff --stat {base}..HEAD`, count commits, list files changed. Store analysis for use in later steps.

7. **Step 3: Project scaffold** — Run `oat project new "{name}" --mode quick`. Update state.md:
   - `oat_workflow_mode: quick`
   - `oat_workflow_origin: captured` (new origin value to distinguish from native quick-start)
   - `oat_phase: implement`
   - `oat_phase_status: in_progress`

8. **Step 4: Discovery synthesis** — Populate `discovery.md` from conversation context:
   - Initial Request: what the user wanted to accomplish
   - Key Decisions: decisions made during the conversation
   - Solution Space: alternatives considered (if any)
   - Constraints: any constraints that shaped the work
   - Success Criteria: what "done" looks like
   - Set `oat_status: complete`, `oat_generated: true`
   - Ask user to confirm or clarify anything unclear via `AskUserQuestion`

9. **Step 5: Implementation capture** — Populate `implementation.md`:
   - Create one task entry per commit (or group related commits into logical tasks)
   - Each task includes: status (completed), commit SHA, outcome (from commit message + diff summary), files changed
   - Group into phases if natural stages exist (e.g., "foundation", "feature", "tests")
   - Set `oat_status: in_progress` or `complete` based on user's answer in Step 6
   - Include Progress Overview table
   - Set `oat_generated: true`

10. **Step 6: Lifecycle state** — Ask user via `AskUserQuestion`:
    - "Is this work ready for review, or still in progress?"
    - Options: "Ready for review (Recommended)" / "Still in progress"
    - Update state.md accordingly:
      - Ready: `oat_phase: implement`, `oat_phase_status: complete`
      - In progress: `oat_phase: implement`, `oat_phase_status: in_progress`

11. **Step 7: Refresh dashboard and report** — Run `oat state refresh`. Print summary of what was created and suggest next actions:
    - If ready for review: `oat-project-review-provide` or `oat-project-pr-final`
    - If in progress: continue working, then invoke capture again or use `oat-project-reconcile`

12. **Self-Correction Protocol** — If catching yourself writing implementation code → STOP. If generating a plan.md → STOP (capture doesn't need a plan, the work is done).

**Step 2: Verify**

- Confirm SKILL.md frontmatter is valid YAML
- Confirm all sections follow conventions from existing skills (mode assertion, progress indicators, step numbering)
- Confirm `AskUserQuestion` is used at every uncertain decision point (name, discovery content, lifecycle state)

**Step 3: Commit**

```bash
git add .agents/skills/oat-project-capture/SKILL.md
git commit -m "feat(p01-t01): add oat-project-capture skill for retroactive project creation"
```

---

### Task p01-t02: Register skill for sync and CLI distribution

**Files:**

- Modify: `packages/cli/scripts/bundle-assets.sh` (add to SKILLS array)
- Modify: `packages/cli/src/commands/init/tools/workflows/install-workflows.ts` (add to WORKFLOW_SKILLS)

**Step 1: Register in bundle-assets.sh**

Add `oat-project-capture` to the `SKILLS` array in alphabetical order within the workflow skills group.

**Step 2: Register in install-workflows.ts**

Add `oat-project-capture` to the `WORKFLOW_SKILLS` constant (alphabetical).

**Step 3: Sync and validate**

```bash
oat sync
pnpm build
pnpm oat:validate-skills
pnpm test
```

Verify skill appears in `packages/cli/assets/skills/` after build. If a test asserts the exact skill list, update it to include the new skill.

**Step 4: Commit**

```bash
git add packages/cli/scripts/bundle-assets.sh packages/cli/src/commands/init/tools/workflows/install-workflows.ts
git commit -m "feat(p01-t02): register oat-project-capture for CLI distribution"
```

---

### Task p01-t03: Update backlog to reflect in-progress status

**Files:**

- Modify: `.oat/repo/reference/backlog.md`

**Step 1: Update backlog**

Move the `oat-project-capture` entry from Inbox to In Progress with a link to the project.

**Step 2: Verify**

Read backlog.md and confirm the entry moved correctly.

**Step 3: Commit**

```bash
git add .oat/repo/reference/backlog.md
git commit -m "chore(p01-t03): move oat-project-capture to in-progress in backlog"
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

- Phase 1: 3 tasks - Skill creation, CLI registration, and backlog update

**Total: 3 tasks**

Ready for code review and merge.

---

## References

- Discovery: `discovery.md`

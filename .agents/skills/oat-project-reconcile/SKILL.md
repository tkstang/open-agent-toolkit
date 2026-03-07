---
name: oat-project-reconcile
version: 1.0.0
description: Use when human-implemented commits need to be mapped back to planned tasks. Reconciles implementation.md and state.md after manual work outside the OAT workflow.
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Write, Bash(git:*), Glob, Grep, AskUserQuestion
---

# Reconcile Manual Implementation

Bridge the gap between human implementation and OAT's artifact-driven workflow. Analyzes commits made outside the structured OAT flow, maps them to planned tasks, and updates tracking artifacts after human confirmation.

## Prerequisites

**Required:**
- Active OAT project with a `plan.md` containing task definitions
- Project must be in `implement` phase (or `plan` phase with `oat_phase_status: complete`)
- At least one commit exists that is not tracked in `implementation.md`

## Mode Assertion

**OAT MODE: Reconciliation**

**Purpose:** Analyze manual/human commits, map them to planned tasks, and reconcile tracking artifacts with user confirmation.

## Progress Indicators (User-Facing)

- Print a phase banner once at start:

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   OAT ▸ RECONCILE
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- For each step, announce a compact header:
  - `OAT ▸ RECONCILE — Step N: {step_name}`
- Before multi-step bookkeeping:
  - `[1/N] {action}…`
- Keep it concise; don't print a line for every shell command.

**BLOCKED Activities:**
- No modifying code files
- No rewriting git history
- No deleting or overwriting existing implementation.md entries
- No silent assumptions on uncertain mappings

**ALLOWED Activities:**
- Reading git log, diffs, and file lists
- Reading plan.md, implementation.md, state.md
- Appending new entries to implementation.md
- Updating frontmatter pointers in implementation.md and state.md
- Asking user for confirmation on mappings
- Creating a single bookkeeping commit

**Self-Correction Protocol:**
If you catch yourself:
- Modifying code files → STOP (reconciliation is tracking-only)
- Assuming a mapping without user confirmation → STOP (present options)
- Overwriting existing entries → STOP (append only)

**Recovery:**
1. Acknowledge the deviation
2. Return to current step
3. Ask user for guidance

## Process

### Step 0: Resolve Active Project

OAT stores active project context in `.oat/config.local.json` (`activeProject`, local-only).

```bash
PROJECT_PATH=$(oat config get activeProject 2>/dev/null || true)
PROJECTS_ROOT="${OAT_PROJECTS_ROOT:-$(oat config get projects.root 2>/dev/null || echo ".oat/projects/shared")}"
PROJECTS_ROOT="${PROJECTS_ROOT%/}"
```

**If `PROJECT_PATH` is missing/invalid:**
- Ask the user for `{project-name}`
- Set `PROJECT_PATH` to `${PROJECTS_ROOT}/{project-name}`
- Write it for future phases:
  ```bash
  mkdir -p .oat
  oat config set activeProject "$PROJECT_PATH"
  ```

**If `PROJECT_PATH` is valid:** derive `{project-name}` as the directory name (basename of the path).

### Step 0.5: Prerequisite Check

Verify the project is ready for reconciliation:

1. **Check `plan.md` exists:**
   ```bash
   test -f "$PROJECT_PATH/plan.md" || { echo "ERROR: plan.md not found. Run oat-project-plan first."; exit 1; }
   ```

2. **Check project phase:**
   ```bash
   PHASE=$(grep "^oat_phase:" "$PROJECT_PATH/state.md" 2>/dev/null | awk '{print $2}')
   PHASE_STATUS=$(grep "^oat_phase_status:" "$PROJECT_PATH/state.md" 2>/dev/null | awk '{print $2}')
   ```
   - If `PHASE` is `implement`: proceed
   - If `PHASE` is `plan` and `PHASE_STATUS` is `complete`: proceed (plan just finished, implementation starting)
   - Otherwise: STOP — tell user the project is not in implementation phase

3. **Check for untracked commits:**
   - Read `implementation.md` if it exists — find the last recorded commit SHA
   - If all recent commits are already tracked, inform user: "No untracked commits found. Nothing to reconcile."

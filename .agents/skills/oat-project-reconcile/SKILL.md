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

### Step 1: Find Checkpoint

Identify the last commit that OAT has already tracked. Everything after this commit is "untracked human work" that needs reconciliation.

**Priority 1 — Last tracked commit in `implementation.md`:**

Read `implementation.md` and find the last task entry with a commit SHA (look for `**Commit:** {sha}` patterns where sha is not `-` or empty). This is the most reliable checkpoint because it's exactly what OAT already recorded.

```bash
LAST_TRACKED_SHA=$(grep -oP '\*\*Commit:\*\*\s+\K[0-9a-f]{7,40}' "$PROJECT_PATH/implementation.md" | tail -1)
```

**Priority 2 — Last OAT-convention commit in git log:**

If `implementation.md` has no tracked commits, scan git log for the last commit matching OAT patterns:

```bash
# Task commits: feat(p01-t01): ..., fix(p02-t03): ...
OAT_TASK_SHA=$(git log --oneline --grep='(p[0-9]*-t[0-9]*)' --extended-regexp -n 1 --format='%H')

# Bookkeeping commits: chore(oat): update tracking artifacts ...
OAT_BOOK_SHA=$(git log --oneline --grep='chore(oat):' -n 1 --format='%H')

# Use whichever is more recent (closer to HEAD)
if [ -n "$OAT_TASK_SHA" ] && [ -n "$OAT_BOOK_SHA" ]; then
  # Compare: is OAT_TASK_SHA an ancestor of OAT_BOOK_SHA?
  if git merge-base --is-ancestor "$OAT_TASK_SHA" "$OAT_BOOK_SHA" 2>/dev/null; then
    CHECKPOINT="$OAT_BOOK_SHA"
  else
    CHECKPOINT="$OAT_TASK_SHA"
  fi
elif [ -n "$OAT_TASK_SHA" ]; then
  CHECKPOINT="$OAT_TASK_SHA"
elif [ -n "$OAT_BOOK_SHA" ]; then
  CHECKPOINT="$OAT_BOOK_SHA"
fi
```

**Priority 3 — Merge-base fallback:**

If no OAT commits are found at all, fall back to the merge-base with the default branch:

```bash
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"
CHECKPOINT=$(git merge-base HEAD "$DEFAULT_BRANCH" 2>/dev/null)
```

If merge-base also fails (e.g., orphan branch), use the first commit on the branch:
```bash
CHECKPOINT=$(git rev-list --max-parents=0 HEAD | tail -1)
```

**Report checkpoint to user:**

```
OAT ▸ RECONCILE — Step 1: Checkpoint

Last tracked commit: {CHECKPOINT_SHA} ({date})
Source: {implementation.md | git log pattern | merge-base}
Task: {last_tracked_task_id or "pre-project"}

Commits since checkpoint: {count}
```

Count commits in range:
```bash
COMMIT_COUNT=$(git rev-list --count "$CHECKPOINT"..HEAD)
```

**User confirmation gate:**

Ask user: "Use this as the checkpoint? Or provide a different commit SHA."

If user provides an alternative SHA, validate it:
```bash
git cat-file -t "$USER_SHA" 2>/dev/null | grep -q commit
```

Store the confirmed checkpoint as `$CHECKPOINT` for use in subsequent steps.

### Step 2: Collect and Analyze Commits

Gather all commits between the checkpoint and HEAD, filter out noise, and extract metadata for mapping.

**Collect commits in range:**

```bash
git log --format='%H|%s|%an|%ai' "$CHECKPOINT"..HEAD --reverse
```

This gives oldest-first ordering (matches plan execution order). Parse each line into: `SHA`, `message`, `author`, `date`.

**Gather per-commit details:**

For each commit SHA, collect:

1. Changed files:
   ```bash
   git diff-tree --no-commit-id -r --name-only "$SHA"
   ```

2. Diff stats (insertions/deletions):
   ```bash
   git diff --stat "$SHA"~1.."$SHA" 2>/dev/null || git diff --stat "$(git hash-object -t tree /dev/null)".."$SHA"
   ```
   (The fallback handles the case where `$SHA` is the first commit on the branch.)

**Filter out non-implementation commits:**

Remove from the analysis set:

1. **Merge commits:**
   ```bash
   git rev-list --merges "$CHECKPOINT"..HEAD
   ```
   Any SHA in this list is excluded.

2. **Bookkeeping-only commits** — commits where ALL changed files match OAT tracking patterns:
   - Files ending in `implementation.md`, `state.md`, or `plan.md` within any `.oat/` path
   - Files ending in `state.md` within any `.oat/` path
   - Commit message starts with `chore(oat):`

   Rule: if every file in the commit matches `*.oat/*/implementation.md`, `*.oat/*/state.md`, `*.oat/*/plan.md`, or `*.oat/*/discovery.md` — then it's bookkeeping and should be excluded.

3. **Already-tracked commits** — commits whose SHA already appears in `implementation.md` task entries (from Step 0.5 check).

**Present commit summary to user:**

```
OAT ▸ RECONCILE — Step 2: Commit Analysis

Range: {CHECKPOINT_SHORT}..HEAD ({total_count} commits, {filtered_count} after filtering)
Filtered out: {merge_count} merges, {bookkeeping_count} bookkeeping, {tracked_count} already tracked

| #  | SHA (short) | Message (first 60 chars)          | Files | Insertions | Deletions |
|----|-------------|-----------------------------------|-------|------------|-----------|
| 1  | abc1234     | add auth endpoint                 | 3     | +120       | -5        |
| 2  | def5678     | fix validation logic              | 1     | +15        | -8        |
| .. | ...         | ...                               | ...   | ...        | ...       |
```

**Extract plan tasks for mapping:**

Read `plan.md` and extract all tasks:

1. Parse `### Task pNN-tNN: {Name}` headers to get task IDs and names
2. Parse `**Files:**` blocks under each task to get expected file lists (both `Create:` and `Modify:` entries)
3. Parse task descriptions/steps for keyword extraction (used in Step 3 for message matching)
4. Note which tasks already have `completed` status in `implementation.md` (skip these during mapping)

Store as a structured list:
```
TASKS = [
  { id: "p01-t01", name: "...", files: ["path/a.ts", "path/b.ts"], keywords: ["auth", "endpoint"] },
  { id: "p01-t02", name: "...", files: [...], keywords: [...] },
  ...
]
```

Only include tasks that are **not yet completed** in `implementation.md`.

### Step 3: Map Commits to Tasks

For each filtered commit from Step 2, attempt to map it to a planned task using signals in priority order. Once a commit is mapped via a higher-priority signal, skip lower-priority signals for that commit.

**Signal A — Task ID in commit message (→ High confidence):**

Check if the commit message contains a task ID pattern:

```bash
# Match patterns like: feat(p01-t03): ..., fix(p02-t01): ..., (p01-t02)
TASK_ID=$(echo "$COMMIT_MSG" | grep -oP 'p[0-9]+-t[0-9]+' | head -1)
```

If `$TASK_ID` matches a pending task in the plan: map with `confidence=high`.

**Signal B — File overlap (→ High/Medium/Low confidence):**

For each unmatched commit, compare its changed files against each pending task's file list:

```
For each pending task T:
  task_files = set of files listed in plan for T
  commit_files = set of files changed in this commit
  intersection = commit_files ∩ task_files
  overlap_ratio = |intersection| / |task_files|    (if task_files is non-empty)

  Classification:
    overlap_ratio ≥ 0.8 AND only one task matches at this level → confidence=high
    overlap_ratio ≥ 0.4 → confidence=medium
    overlap_ratio > 0   → confidence=low
```

Pick the best match (highest `overlap_ratio`). Break ties by plan order (earlier task wins).

If a commit's files don't appear in any task's file list, proceed to Signal C.

**Signal C — Message keyword match (→ Medium confidence):**

For each still-unmatched commit:

1. Tokenize the commit message: split on spaces/punctuation, lowercase, remove stop words (a, the, and, or, to, in, for, of, with, is, this, that)
2. Tokenize each pending task's name and description similarly
3. Count matching significant tokens (≥3 chars)

```
If matching_tokens ≥ 2 with a single task → confidence=medium
If matching_tokens ≥ 2 with multiple tasks → confidence=low (ambiguous)
```

**Signal D — No match (→ Unmapped):**

Any commits still unmatched after all signals: classify as `unmapped`.

**Multi-commit grouping:**

After individual mapping, group commits that map to the same task:

```
For each task with multiple mapped commits:
  - representative_sha = latest commit SHA (most recent)
  - combined_files = union of all commit file lists
  - combined_message = concatenation of commit messages (for outcome generation)
  - confidence = lowest confidence among grouped commits (conservative)
```

**Present mapping report:**

```
OAT ▸ RECONCILE — Step 3: Mapping Report

Mapped to tasks:
| Task      | Task Name                | Commits          | Confidence | Files |
|-----------|--------------------------|------------------|------------|-------|
| p01-t03   | Add validation logic     | abc1234, def5678 | high       | 4     |
| p02-t01   | Implement API endpoint   | ghi9012          | medium     | 2     |

Unmapped commits:
| SHA (short) | Message                    | Files |
|-------------|----------------------------|-------|
| jkl3456     | update readme              | 1     |
| mno7890     | fix typo in config         | 1     |

Tasks still pending (no commits matched):
| Task      | Task Name                |
|-----------|--------------------------|
| p02-t02   | Add integration tests    |

Summary: {mapped_task_count}/{total_pending_tasks} tasks addressed,
         {mapped_commit_count}/{total_commits} commits mapped,
         {unmapped_count} unmapped
```

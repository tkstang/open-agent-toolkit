---
name: oat-docs-apply
version: 1.0.0
description: Run when you have a docs analysis artifact and want to generate or update documentation structure and content. Creates a branch, applies approved changes, and optionally opens a PR.
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Write, Edit, Bash(git:*), Bash(gh:*), Glob, Grep, AskUserQuestion
---

# Docs Apply

Generate or update documentation files from a docs analysis artifact, with explicit approval and branch-based workflow.

## Prerequisites

- A recent docs analysis artifact in `.oat/repo/analysis/`.
- If no analysis exists, run `oat-docs-analyze` first.
- `jq` available in PATH for tracking updates.
- `gh` available if a PR should be opened automatically.

## Mode Assertion

**OAT MODE: Docs Apply**

**Purpose:** Apply approved documentation changes derived from a docs analysis artifact.

**BLOCKED Activities:**
- No unapproved documentation changes.
- No branch creation before the recommendation plan is reviewed.
- No changes outside the documentation scope except deterministic nav sync and tracking updates.

**ALLOWED Activities:**
- Reading analysis artifacts and the current docs surface.
- Creating or updating docs files and `mkdocs.yml` when approved.
- Running `oat docs nav sync` after approved structural changes.
- Creating branches, commits, and optional PRs.

**Self-Correction Protocol:**
If you catch yourself:
- Editing docs outside approved recommendations -> STOP and remove the extra change from the work plan.
- Applying manual nav changes when `oat docs nav sync` should be used -> STOP and switch to the CLI helper.

**Recovery:**
1. Return to the approved recommendation list.
2. Re-apply only approved docs changes and deterministic nav sync.

## Progress Indicators (User-Facing)

When executing this skill, provide lightweight progress feedback so the user can tell what’s happening.

- Print a phase banner once at start:

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   OAT ▸ DOCS APPLY
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Use step indicators:
  - `[1/7] Loading analysis artifact…`
  - `[2/7] Building recommendation plan…`
  - `[3/7] Reviewing approvals…`
  - `[4/7] Creating branch…`
  - `[5/7] Applying docs changes…`
  - `[6/7] Running nav sync + verification…`
  - `[7/7] Committing, tracking, and summary…`

## Process

### Step 0: Intake - Find Analysis Artifact

Locate the most recent docs analysis artifact:

```bash
ls -t .oat/repo/analysis/docs-*.md 2>/dev/null | head -1
```

If none exists, stop and instruct the user to run `oat-docs-analyze`.

### Step 1: Build the Recommendation Plan

Read the analysis artifact and turn each finding into a recommendation.

Common docs actions:

- Create missing `index.md`
- Add or repair `## Contents`
- Convert `overview.md` usage to the `index.md` contract
- Add or update `docs/contributing.md` plugin guidance
- Scaffold an OAT docs app when no docs app exists
- Run `oat docs nav sync` after approved structural changes

Use `references/apply-plan-template.md` and preserve the exact presented markdown as `APPLY_PLAN_MARKDOWN` for commit/PR summary use.

### Step 2: Review the Plan with the User

For each recommendation, ask for:

- `approve`
- `modify`
- `skip`

If all recommendations are skipped, stop without changing files.

### Step 3: Create Branch

After approvals:

```bash
TIMESTAMP=$(date -u +"%Y-%m-%d-%H%M")
BRANCH="oat/docs-${TIMESTAMP}"
git checkout -b "$BRANCH"
```

If branch creation fails because of unrelated local changes, ask the user to resolve that state before continuing.

### Step 4: Apply Approved Changes

For each approved recommendation:

1. Read the affected docs files.
2. Make targeted edits that satisfy the approved fix.
3. Prefer preserving existing prose and only changing the necessary sections.

When approved actions involve docs app creation or nav updates:

- Use `oat docs init` for scaffolding when appropriate.
- Use `oat docs nav sync` instead of manually editing nav when the CLI helper can generate it.

### Step 5: Verify and Sync Navigation

Run the smallest relevant verification set based on what changed:

- `oat docs nav sync`
- `pnpm --dir <docs-app> docs:lint`
- `pnpm --dir <docs-app> docs:format:check`
- `pnpm --dir <docs-app> docs:build`

If no docs app exists yet, use file-level verification and confirm the structural contract manually in the summary.

### Step 6: Commit and Optional PR

Commit the approved changes:

```bash
git add {approved-files}
git commit -m "docs: apply approved docs recommendations"
```

If the user wants a PR:

1. Push the branch.
2. Create a PR.
3. Include:
   - source analysis artifact
   - `APPLY_PLAN_MARKDOWN`
   - applied action summary
   - verification performed

### Step 7: Update Tracking and Output Summary

Update shared tracking:

```bash
TRACKING_SCRIPT=".agents/skills/oat-agent-instructions-analyze/scripts/resolve-tracking.sh"
ROOT_TARGET=$(bash "$TRACKING_SCRIPT" root)
ROOT_HASH=$(echo "$ROOT_TARGET" | jq -r '.commitHash')
ROOT_BRANCH=$(echo "$ROOT_TARGET" | jq -r '.baseBranch')

bash "$TRACKING_SCRIPT" write \
  docsApply \
  "$ROOT_HASH" \
  "$ROOT_BRANCH" \
  "apply"
```

Output:

```text
Apply complete.

  Files created:   {N}
  Files updated:   {N}
  Files skipped:   {N}
  Docs target:     {path}
  Verification:    {commands run}

Next step: Re-run oat-docs-analyze if you want a post-apply verification artifact.
```

## Deferred from v1

- Automatic content synthesis for missing topic pages
- Multi-docs-app fanout in one apply session
- Bulk conversion of legacy docs trees without user review

## References

- Apply plan template: `references/apply-plan-template.md`
- Shared tracking helper: `.agents/skills/oat-agent-instructions-analyze/scripts/resolve-tracking.sh`

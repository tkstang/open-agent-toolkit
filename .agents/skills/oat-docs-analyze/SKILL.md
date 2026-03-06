---
name: oat-docs-analyze
version: 1.0.0
description: Run when you need to evaluate documentation structure, navigation, and coverage against the OAT docs app contract. Produces a severity-rated analysis artifact for oat-docs-apply.
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Write, Bash(git:*), Glob, Grep, AskUserQuestion
---

# Docs Analysis

Scan a repository's documentation surface, evaluate it against the OAT docs contract, and write an actionable analysis artifact.

## Prerequisites

- Git repository with either an MkDocs app, a `docs/` tree, or root-level Markdown docs.
- `jq` available in PATH for tracking updates.

## Mode Assertion

**OAT MODE: Docs Analysis**

**Purpose:** Evaluate documentation quality, coverage, navigation, and `index.md` contract conformance.

**BLOCKED Activities:**
- No editing documentation files.
- No scaffolding new docs apps.
- No modifying `mkdocs.yml` or navigation.

**ALLOWED Activities:**
- Reading docs trees, MkDocs config, and related repository metadata.
- Writing a docs analysis artifact to `.oat/repo/analysis/`.
- Updating docs analysis tracking metadata.

**Self-Correction Protocol:**
If you catch yourself:
- Editing docs content directly -> STOP and move that recommendation to the artifact.
- Rewriting navigation while analyzing -> STOP and record the required fix instead.

**Recovery:**
1. Return to read-only analysis.
2. Capture the needed change as a finding or recommendation.

## Progress Indicators (User-Facing)

When executing this skill, provide lightweight progress feedback so the user can tell what’s happening.

- Print a phase banner once at start:

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   OAT ▸ DOCS ANALYSIS
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Use step indicators:
  - `[1/7] Resolving docs target + mode…`
  - `[2/7] Inventorying docs files…`
  - `[3/7] Evaluating index contract…`
  - `[4/7] Assessing quality + coverage…`
  - `[5/7] Checking nav and drift…`
  - `[6/7] Writing analysis artifact…`
  - `[7/7] Updating tracking + summary…`

## Process

### Step 0: Resolve Docs Target and Analysis Mode

Determine the documentation root using the first matching surface:

1. `apps/*/mkdocs.yml`
2. `mkdocs.yml` at repo root
3. `docs/`
4. Root-level Markdown docs (`README.md`, `CONTRIBUTING.md`, etc.) when no docs app exists

Prefer the OAT docs app when multiple MkDocs apps exist and one is clearly the active repo docs surface.

Resolve tracking and analysis mode using the shared helper:

```bash
TRACKING_SCRIPT=".agents/skills/oat-agent-instructions-analyze/scripts/resolve-tracking.sh"
TRACKING=$(bash "$TRACKING_SCRIPT" read docs 2>/dev/null || true)
```

- If the stored commit exists, run in `delta` mode and scope drift checks to changed docs directories.
- Otherwise run in `full` mode.

### Step 1: Inventory the Docs Surface

Build a complete inventory of:

- All Markdown files in the docs surface
- All directories containing Markdown files
- All `index.md` files
- Any `overview.md` files
- `mkdocs.yml` nav entries when present

Record the docs surface type:

- `mkdocs-app`
- `docs-tree`
- `root-markdown`

### Step 2: Evaluate the `index.md` Contract

Use `references/quality-checklist.md` and `references/directory-assessment-criteria.md`.

For every documentation directory:

1. Verify `index.md` exists.
2. Verify `index.md` includes a `## Contents` section.
3. Verify the `## Contents` section maps sibling pages and immediate child directories.
4. Flag `overview.md` usage as a migration finding.
5. Verify single-file directories still expose an `index.md` entrypoint.

### Step 3: Assess Quality and Coverage

Evaluate each docs page for:

- Topic clarity
- Discoverability from a parent index
- Command/path accuracy
- Staleness indicators
- Excessive duplication
- Missing contributor guidance for enabled plugins/extensions when an MkDocs app exists

In `delta` mode, always evaluate changed docs files plus the nearest parent `index.md` pages. In `full` mode, evaluate the whole docs surface.

### Step 4: Check Navigation and Drift

If `mkdocs.yml` exists:

1. Compare nav entries with the docs tree.
2. Flag pages present in docs but absent from nav.
3. Flag nav entries that point at missing pages.
4. Flag directories whose `index.md` `## Contents` section appears inconsistent with nav structure.

If no `mkdocs.yml` exists, record whether the repo should be migrated to an OAT docs app.

### Step 5: Severity-Rate Findings

Use these defaults:

- `Critical`: misleading docs that could cause destructive or unsafe actions
- `High`: missing docs app/index coverage for important areas, broken nav, or stale commands that block reliable usage
- `Medium`: incomplete `## Contents`, `overview.md` still in use, plugin/contributor guidance gaps, moderate duplication
- `Low`: polish, wording, or organization improvements

### Step 6: Write Analysis Artifact

Use `references/analysis-artifact-template.md`.

```bash
TIMESTAMP=$(date -u +"%Y-%m-%d-%H%M")
ARTIFACT_PATH=".oat/repo/analysis/docs-${TIMESTAMP}.md"
```

Populate the artifact with:

- Docs target and mode
- Inventory summary
- Severity-rated findings
- Directory coverage and contract gaps
- Navigation/drift findings
- Ordered recommendations

### Step 7: Update Tracking and Output Summary

Update docs tracking using the shared helper:

```bash
TRACKING_SCRIPT=".agents/skills/oat-agent-instructions-analyze/scripts/resolve-tracking.sh"
ROOT_TARGET=$(bash "$TRACKING_SCRIPT" root)
ROOT_HASH=$(echo "$ROOT_TARGET" | jq -r '.commitHash')
ROOT_BRANCH=$(echo "$ROOT_TARGET" | jq -r '.baseBranch')

bash "$TRACKING_SCRIPT" write \
  docs \
  "$ROOT_HASH" \
  "$ROOT_BRANCH" \
  "{mode}" \
  --artifact-path "$ARTIFACT_PATH"
```

Output a summary:

```text
Analysis complete.

  Docs target:      {path}
  Surface type:     {mkdocs-app|docs-tree|root-markdown}
  Files evaluated:  {N}
  Mode:             {full|delta}

  Findings:
    Critical:  {N}
    High:      {N}
    Medium:    {N}
    Low:       {N}

  Artifact: {artifact_path}

Next step: Run oat-docs-apply to act on these findings.
```

## Deferred from v1

- Automatic topic clustering for large legacy docs trees
- Heuristic ranking of "most important" missing indexes
- Direct generation of docs scaffolding without an apply review step

## References

- Analysis artifact template: `references/analysis-artifact-template.md`
- Quality checklist: `references/quality-checklist.md`
- Directory criteria: `references/directory-assessment-criteria.md`
- Shared tracking helper: `.agents/skills/oat-agent-instructions-analyze/scripts/resolve-tracking.sh`

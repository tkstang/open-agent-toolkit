---
oat_generated: true
oat_generated_at: {YYYY-MM-DD}
oat_analysis_type: docs
oat_analysis_mode: {full|delta}
oat_docs_target: {docs-target-path}
oat_analysis_commit: {commitHash}
---

# Docs Analysis: {repo-name}

**Date:** {YYYY-MM-DD}
**Mode:** {full|delta}
**Docs Target:** `{docs-target-path}`
**Surface Type:** {mkdocs-app|docs-tree|root-markdown}
**Commit:** {short-hash}

## Summary

- **Files evaluated:** {N}
- **Directories assessed:** {N}
- **Index coverage:** {N}% of docs directories contain `index.md`
- **Findings:** {N} Critical, {N} High, {N} Medium, {N} Low
- **Delta scope:** {N/A or "N files changed since {base-commit}"}

## Docs Inventory

| # | Type | Path | Status | Notes |
|---|------|------|--------|-------|
| 1 | index | `docs/index.md` | pass | Root index present |
| 2 | page | `docs/getting-started.md` | pass | Linked from root index |
| 3 | directory | `docs/reference/` | issues | Missing `index.md` |
| ... | | | | |

## Findings

### Critical

{Findings that could mislead agents into unsafe or destructive behavior.}

None | {numbered list}

### High

{Broken or missing docs structure that blocks reliable discovery or usage.}

None | {numbered list}

### Medium

{Contract, navigation, or contributor-guidance issues that materially reduce quality.}

None | {numbered list}

### Low

{Polish, wording, and smaller organizational issues.}

None | {numbered list}

## Directory Contract Gaps

| # | Directory | Gap | Severity | Recommended Fix |
|---|-----------|-----|----------|-----------------|
| 1 | `docs/api/` | Missing `index.md` | High | Add `index.md` with `## Contents` |
| 2 | `docs/cli/` | `overview.md` still present | Medium | Convert to `index.md` or linked topic page |
| ... | | | | |

{Or: "No directory contract gaps identified."}

## Navigation and Drift

| # | Surface | Issue | Severity | Notes |
|---|---------|-------|----------|-------|
| 1 | `mkdocs.yml` | Nav points to missing page | High | `reference/troubleshooting.md` removed |
| 2 | `docs/index.md` | `## Contents` missing subtree mapping | Medium | Child directory not described |
| ... | | | | |

{Or: "No navigation or drift issues identified."}

## Recommendations

1. **{Action}** — {rationale}
2. **{Action}** — {rationale}
3. ...

## Next Step

Run `oat-docs-apply` with this artifact to approve and apply the recommended documentation changes.

---
oat_generated: true
oat_generated_at: {YYYY-MM-DD}
oat_apply_type: docs
oat_source_analysis: {analysis-artifact-path}
oat_docs_target: {docs-target-path}
---

# Docs Apply Plan

**Date:** {YYYY-MM-DD}
**Source Analysis:** `{analysis-artifact-path}`
**Docs Target:** `{docs-target-path}`

## Instructions

Review each recommendation below and choose:

- **approve** — apply as described
- **modify** — apply with changes noted by the user
- **skip** — do not apply

## Recommendations

### {N}. {Action}: `{target-path}`

| Field | Value |
|---|---|
| Action | {create / update / move / scaffold / sync-nav} |
| Target | `{target-path}` |
| Rationale | {why this recommendation exists} |
| Source | {finding # / contract gap / nav issue} |
| Helper | `{oat docs nav sync | oat docs init | manual edit}` |

**Context:** {1-2 sentences}

**Decision:** {approve / modify / skip}
**Notes:** {user notes if modifying}

---

{Repeat for each recommendation}

## Summary of Approved Actions

| # | Action | Target | Decision |
|---|--------|--------|----------|
| {N} | {create/update/move/scaffold/sync-nav} | `{path}` | {approved/modified} |
| ... | | | |

**Total:** {N} approved, {N} modified, {N} skipped

## Proceed?

Confirm to begin applying the approved documentation changes.

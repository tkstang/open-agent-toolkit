---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-11
oat_generated: false
oat_template: false
---

# Discovery: Collect Review Comments

## Phase Guardrails (Discovery)

Discovery is for requirements and decisions, not implementation details.

## Initial Request

Build a repo-wide PR review comment collector. The existing tooling (`agent-reviews`, `oat-review-receive-remote`) operates per-PR only. We need the ability to collect, filter, and output all review comments across a repository for analysis — both for bulk historical review and incremental ongoing collection.

## Solution Space

### Approach 1: GitHub API Direct _(Recommended / Chosen)_

**Description:** Use `gh api repos/{owner}/{repo}/pulls/comments --paginate` to fetch all PR review comments repo-wide in a single pass. Own the JSON normalization and field mapping.

**When this is the right choice:** You want bulk collection, don't need per-PR orchestration overhead, and want full control over field mapping/filtering. Gives access to both resolved and unresolved comments.

**Tradeoffs:** You own the JSON normalization (mapping raw GitHub fields to the output model). But the schema is well-documented and stable.

### Approach 2: Iterate `agent-reviews` Across PRs

**Description:** Enumerate open/merged PRs, then call `npx agent-reviews --json --unresolved --pr <N>` for each.

**When this is the right choice:** You want the existing normalized output format and severity classification that agent-reviews already provides.

**Tradeoffs:** N+1 API calls (list PRs + one per PR). Slower, more API quota. Only gives unresolved comments — no access to resolved/historical.

### Approach 3: Hybrid

**Description:** GitHub API for the repo-wide sweep, then optionally pipe specific PRs through `agent-reviews` for its triage/severity classification.

**When this is the right choice:** You want speed and completeness but also want agent-reviews' classification for a subset.

**Tradeoffs:** More complexity, two code paths.

### Chosen Direction

**Approach:** GitHub API Direct (Approach 1)
**Rationale:** Simplest, fastest, most complete data. Single API pass. Full control over normalization. Access to all comments (resolved + unresolved).
**User validated:** Yes

## Key Decisions

1. **Two-layer architecture:** CLI command for raw collection/filtering + OAT skill for analysis/classification. The skill can either consume an already-generated file or invoke the CLI itself.
2. **GitHub API direct:** Use `gh api` for repo-wide collection rather than iterating `agent-reviews` per-PR.
3. **Configurable time window:** `--since` flag on merged PRs. Supports historical deep-dives (3–18 months) and incremental runs (30 days).
4. **Noise filtering at CLI layer:** Filter out bot comments and trivial/low-signal comments programmatically. Resolved threads and file path filtering deferred to the analysis skill.
5. **Dual output format:** Both JSON (for skill consumption) and Markdown (for human review).
6. **Time-based chunking:** Output split into monthly chunks, reverse chronological order, for manageable human scanning.
7. **Stable comment IDs:** Each comment gets a stable ID (e.g., `RC-001`) that correlates across JSON and Markdown outputs. Enables human pre-curation workflow ("RC-072: not relevant").
8. **Human pre-filter workflow:** Humans can optionally scan the Markdown, annotate/remove items by comment ID, and the analysis skill respects those annotations when consuming the data.
9. **CLI namespace:** `oat repo pr-comments collect` / `oat repo pr-comments triage-collection`. Scoped under `repo` to distinguish from per-PR review skills.
10. **Bot detection:** Two-layer — GitHub API `type: Bot` field + configurable known-service list (CodeRabbit, Copilot, Sourcery, Vercel, Supabase, Codacy, SonarCloud, etc.). The known-bot list ships with sensible defaults and is user-configurable.
11. **Trivial comment detection:** Combined approach — known phrase patterns (LGTM, +1, 👍, nit, looks good, ship it, etc.) OR under a length threshold (e.g., <5 words), unless the comment contains code references.

## Constraints

- Must work with `gh` CLI (standard GitHub auth context)
- Must handle pagination for large repos (GitHub API pages at 100 items)
- Output must be consumable by a future OAT analysis skill
- Comment IDs must be stable across JSON and Markdown outputs for cross-referencing
- Monthly chunking must handle edge cases (PRs spanning month boundaries — assign to merge date)

## Success Criteria

- CLI command collects all review comments from merged PRs within a configurable time window
- Bot comments and trivial comments are filtered out programmatically
- Output is produced in both JSON and Markdown formats
- Output is chunked by month (reverse chronological)
- Each comment has a stable ID that correlates across JSON and Markdown
- Markdown is human-scannable for quick pre-curation before skill analysis
- A future OAT skill can consume the JSON output (with or without human curation)

## Out of Scope

- The analysis/classification OAT skill (separate project/phase)
- Posting comments back to GitHub
- Real-time watching/monitoring of new comments
- Collecting issue comments (only PR review comments)
- Resolved thread filtering (deferred to analysis skill)
- File path pattern filtering (deferred to analysis skill)

## Deferred Ideas

- **Analysis skill** — OAT skill that consumes collector output, classifies findings by severity/category, and produces actionable recommendations. Will be a separate project.
- **Incremental/delta mode** — Only collect comments newer than last run. Could use a watermark file.
- **Cross-repo collection** — Collect across multiple repos in an org.
- **Comment threading** — Reconstruct full conversation threads (reply chains) for richer context.

## Resolved Questions

- **CLI command name:** `oat repo pr-comments collect` / `oat repo pr-comments triage-collection`. Scoped under `repo` namespace.
- **Bot detection heuristic:** GitHub API `type: Bot` + configurable known-service list. Ships with defaults, user can extend/override.
- **Trivial comment heuristic:** Known phrase patterns (LGTM, +1, etc.) combined with a length threshold (<5 words). Comments containing code references are preserved regardless.

## Assumptions

- The target repos use GitHub PRs with review comments (not just issue comments)
- `gh` CLI is authenticated and available in the execution environment
- Repos have manageable comment volumes (thousands, not millions — pagination handles the rest)

## Risks

- **Rate limiting:** Large repos with many PRs could hit GitHub API rate limits
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation Ideas:** Use `gh api` which handles auth token rate limits; add `--sleep` between pages if needed; document rate limit behavior

## Next Steps

Proceed to design depth decision point, then plan generation.

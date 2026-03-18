---
id: bl-f9bd
title: 'Staleness + knowledge drift upgrades'
status: open
priority: medium
scope: feature
scope_estimate: S
labels: ['workflow', 'staleness']
assignee: null
created: '2026-03-15T22:59:28Z'
updated: '2026-03-15T22:59:28Z'
associated_issues: []
---

## Description

OAT detects stale knowledge indexes and prompts users to re-run indexing when starting new projects or discovery phases. The core warn-and-prompt flow is working well in practice.

Remaining scope is optional automation and hardening:

- Consider a GitHub Actions cron workflow that runs `oat-repo-knowledge-index` on a schedule so the index is always fresh at session start.
- Optionally add a strict staleness mode that can block downstream phases when knowledge is stale or missing (low priority — current prompt-based flow works).
- Optionally add diff-based staleness detection in addition to age-based checks.

When to start:

- When the prompt-based flow becomes insufficient or when CI automation would save meaningful time.

## Acceptance Criteria

- (Already met) OAT detects stale knowledge indexes and prompts the user to re-index.
- (Optional) CI workflow or cron-based automation keeps the index fresh without manual intervention.
- (Optional) Strict freshness mode can block downstream phases when configured.

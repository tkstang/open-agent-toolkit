---
id: bl-aded
title: 'Provider sync enhancements (hooks syncing, expanded feature parity)'
status: open
priority: low
scope: feature
scope_estimate: M
labels: ['tooling', 'providers']
assignee: null
created: '2026-03-18T00:00:00Z'
updated: '2026-03-18T00:00:00Z'
associated_issues: []
---

## Description

Extend provider sync to support additional provider-specific features beyond skills and agents. The main candidate is hooks syncing — mirroring hook definitions across providers that support them. Capability documentation already exists; this is about expanding what `oat sync` can actually synchronize.

Proposed change:

- Add hooks syncing support to `oat sync` for providers that support hooks (e.g., Claude Code).
- Evaluate other provider-specific features that could benefit from sync (e.g., provider-specific configuration).
- Ensure sync is additive/non-destructive and respects the existing manifest safety model.

When to start:

- After core provider interop (Phase 8) is stable and hooks syncing demand is clear.

Split from the original `bl-71a1` which bundled this with the memory system. See also `bl-ca74` (memory system).

## Acceptance Criteria

- `oat sync` can synchronize hook definitions to providers that support them.
- Sync respects manifest-managed safety (no untracked destructive operations).
- Provider-specific features are opt-in and clearly scoped.

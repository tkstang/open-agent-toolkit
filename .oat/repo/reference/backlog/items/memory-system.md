---
id: bl-ca74
title: 'Memory system (cross-session context persistence)'
status: open
priority: low
scope: initiative
scope_estimate: L
labels: ['tooling', 'memory']
assignee: null
created: '2026-03-15T22:59:28Z'
updated: '2026-03-18T00:00:00Z'
associated_issues: []
---

## Description

Add a durable `.oat/memory/` surface for cross-session context, learned patterns, and workflow memory. This gives OAT the ability to carry forward insights, preferences, and decisions across sessions without relying on provider-specific memory features.

When to start:

- After Phase 8 and Phase 9 work is proven in real usage.

Split from the original `bl-71a1` which bundled this with provider enhancements. See also `bl-aded` (provider sync enhancements).

## Acceptance Criteria

- OAT defines a durable `.oat/memory/` surface for cross-session context and learned patterns.
- Memory persistence works independently of any specific provider.
- Clear contracts for what gets stored, when it's updated, and how it's consumed by skills.

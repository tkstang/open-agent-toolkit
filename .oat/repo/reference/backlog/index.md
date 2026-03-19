# OAT Backlog Index

> Generated backlog table lives inside the managed section below. Keep curated narrative updates in the overview section so CLI regeneration stays safe.

## Curated Overview

- `bl-42f9` (local PM workflow family) is now closed — shipped in PR #82 with `oat-pjm-*` skills, `oat backlog` CLI commands, and `project-management` tool pack.
- No items are currently in progress. All remaining items are open.
- Quick win: `bl-b3f7` (idea promotion) is the highest value-to-effort item.
- `bl-cbdd` (Codex prompt-wrappers) closed as not needed — Codex reads skills directly from `.agents/skills/`.
- Deferred: `bl-ea64` (S3 archival) and `bl-ff5d` (Jira refinement) — low value for current dogfood use.
- Longer-horizon: `bl-ca74` (memory system) and `bl-aded` (provider sync enhancements) are gated behind Phase 8/9 maturity.
- `bl-f9bd` (staleness) is downscoped — core detection works; remaining scope is optional CI automation.

<!-- OAT BACKLOG-INDEX -->

| ID      | Title                                                                                | Status | Priority | Scope      | Estimate |
| ------- | ------------------------------------------------------------------------------------ | ------ | -------- | ---------- | -------- |
| bl-3327 | Add dependency intelligence skill family                                             | open   | medium   | feature    | L        |
| bl-b3f7 | Add idea promotion and auto-discovery flow to oat-project-new                        | open   | medium   | feature    | L        |
| bl-9fb8 | Add PR review follow-on skill set (provide-remote, respond-remote, summarize-remote) | open   | medium   | feature    | L        |
| bl-ff5d | Backlog Refinement Flow (Jira ticket generation)                                     | open   | medium   | feature    | L        |
| bl-ea64 | Optional S3 archival in oat-project-complete workflow                                | open   | medium   | feature    | L        |
| bl-f9bd | Staleness + knowledge drift upgrades                                                 | open   | medium   | feature    | S        |
| bl-ca74 | Memory system (cross-session context persistence)                                    | open   | low      | initiative | L        |
| bl-aded | Provider sync enhancements (hooks syncing, expanded feature parity)                  | open   | low      | feature    | M        |

<!-- END OAT BACKLOG-INDEX -->

## Notes

- Active item files live in `backlog/items/`
- Archived item files live in `backlog/archived/`
- Historical completions are summarized in `backlog/completed.md`

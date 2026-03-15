---
oat_status: complete
oat_ready_for: oat-project-plan
oat_blockers: []
oat_last_updated: 2026-03-15
oat_generated: false
---

# Discovery: local-project-management

## Initial Request

Solidify the local project management system in OAT. Formalize the implicit backlog, roadmap, and reference document system into a structured, file-per-item backlog with CLI tooling and agent skills. This is the local-first foundation that remote PM integration (Jira/Linear) will layer on top of later.

Parent discovery: `.oat/projects/shared/project-management-integration/discovery.md` — contains the full conceptual model, research findings, and all resolved decisions.

## Scope

This project covers:

1. **Backlog directory restructure** — Migrate from flat `backlog.md` / `backlog-completed.md` to file-per-item structure under `.oat/repo/reference/backlog/`
2. **Backlog item template** — `.oat/templates/backlog-item.md` with the resolved schema (id, title, status, priority, scope, scope_estimate, labels, associated_issues)
3. **Backlog index (hybrid)** — `index.md` with CLI-generated section (from frontmatter) + curated section (maintained by agent)
4. **Completed log** — `completed.md` with timestamp-ordered entries + `archived/` for full item files
5. **Roadmap template** — `.oat/templates/roadmap.md` with Now/Next/Later structure; migrate existing `roadmap.md`
6. **`deferred-phases.md` retirement** — Migrate remaining relevant items (staleness, memory system) to backlog items, delete the file
7. **`oat-pjm-add-backlog-item` skill** — New skill: creates item from template, runs CLI to regenerate index, guides agent to update curated section, handles scope_estimate with agent estimate + user confirmation
8. **`oat-pjm-update-repo-reference` skill** — Refactor existing `update-repo-reference` into `oat-pjm-*` namespace, update for new backlog directory structure
9. **`oat-pjm-review-backlog` skill** — Refactor existing `review-backlog` into `oat-pjm-*` namespace, update to work with file-per-item structure. Reviews completed.md, index.md, and individual items. Presents analysis with quick wins, high-value items, scope estimates, and next-action recommendations
10. **CLI support** — Commands or scripts for backlog index regeneration (managed section pattern), backlog item ID generation (short hash)
11. **`associated_issues` in project state.md** — Add the field to project `state.md` template frontmatter
12. **Existing backlog migration** — Decompose current flat backlog items into individual files in the new structure

## Key Decisions (from parent discovery)

All decisions are documented in the parent discovery doc. Summary of those relevant to this project:

1. Backlog items, projects, and roadmap are independent concepts linked via `associated_issues`
2. Backlog items have flexible granularity with `scope` field (idea | task | feature | initiative)
3. `scope_estimate` uses t-shirt sizing (XS | S | M | L | XL | XXL) with agent estimate + user confirmation
4. IDs are `bl-` + 4-char hash (collision-free across worktrees)
5. Index is hybrid: CLI-generated section + curated narrative section
6. Completed items get summary in `completed.md` + full file moved to `archived/`
7. Completed log ordered by ISO 8601 UTC timestamp (newest first)
8. Roadmap uses Now / Next / Later horizons with optional theme groupings
9. Templates guide structure; actual files reference their template at top
10. `associated_issues` lives in project `state.md` frontmatter
11. Skills renamed to `oat-pjm-*` namespace

## Constraints

- Must not break existing OAT project workflows
- Existing backlog items must be preserved during migration (no data loss)
- Backlog items should be cheap to create — minimal required fields
- Generated index section uses existing `<!-- OAT ... -->` / `<!-- END OAT ... -->` managed-section pattern
- All `oat-pjm-*` skills must conform to `create-oat-skill` conventions: mode assertion, progress banners (`OAT ▸ ...`), project-root resolution (if project-scoped), semver frontmatter (`version: 1.0.0`), success criteria section
- Skills must be registered for CLI distribution via `bundle-assets.sh` + skill manifest (workflows category)

## Success Criteria

- Backlog directory structure is in place with index, completed, items/, archived/
- Templates exist for backlog items and roadmap
- All three skills are functional (add-backlog-item, update-repo-reference, review-backlog)
- CLI can regenerate the backlog index generated section
- Existing flat backlog items are migrated to individual files
- `deferred-phases.md` is retired, relevant items migrated
- Roadmap is migrated to Now/Next/Later structure
- `associated_issues` field is in state.md template

## Out of Scope

- Remote PM integration (Jira, Linear) — separate project
- Automated backlog-to-project promotion workflows
- Backlog item sub-tasks or hierarchical nesting
- Sprint/cycle management
- Time tracking

## Open Questions

None — all discovery questions resolved in parent discovery.

## Next Steps

Quick mode → proceed to plan. Scope is clear, no architecture decisions remain.

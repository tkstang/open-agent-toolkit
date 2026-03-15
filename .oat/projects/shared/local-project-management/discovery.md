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

## Conceptual Model

### Three Independent Concepts

The local PM system is built around three independent concepts that can be linked but are not hierarchically coupled:

#### 1. Backlog Items

The local equivalent of a Jira issue or Linear issue. Captured work at **any granularity** — a single task, a feature-sized chunk, or something that would break into multiple tickets when refined. Backlog items are cheap to create and don't require ceremony.

**Key properties:**

- Unique identifier (e.g., `bl-a3f2`)
- Title, description, status, priority, labels
- **Scope indicator:** `idea | task | feature | initiative` — a rough signal of granularity, not an enforced hierarchy level
- **Scope estimate:** `XS | S | M | L | XL | XXL` — t-shirt sizing for effort estimation
- `associated_issues` — polymorphic links to other backlog items, projects, or remote issues (Jira/Linear)
- Individual files per item, plus an index file for the bird's-eye view

**Granularity is flexible:** A backlog item might be equivalent to a single ticket, or it might represent work that would decompose into multiple tickets. The backlog captures work "at whatever resolution it was captured." Refinement and splitting happen later, tracked via `associated_issues` links.

#### 2. Projects

The existing OAT project workflow — a structured execution wrapper with phases (discovery → spec → design → plan → implement). Projects are about **how you work on something**, not where it sits in a hierarchy.

**Key property:** A project's scope is flexible. It could be equivalent to a single issue (quick mode, well-defined task) or to an epic (spec-driven, multi-task effort spanning several backlog items). The workflow mode reflects this — quick mode for simpler cases, spec-driven for bigger ones.

**Linking:** Projects use `associated_issues` to reference:

- Backlog items they encompass or were spawned from
- Remote issues/epics they correspond to (Jira, Linear)
- The link is many-to-many and bidirectional in intent

#### 3. Roadmap

A curated **planning narrative** — a single file that groups and prioritizes work by time horizon or theme. References backlog items and projects by name/ID. It's a human-authored document, not a generated tracking artifact.

**Key property:** The roadmap doesn't have its own item-level files because the items already live in backlog or projects. It's a lens on existing work, not a separate data store.

### Concept Mapping to Remote Tools

| Local Concept    | Remote Equivalent                               | Notes                                                     |
| ---------------- | ----------------------------------------------- | --------------------------------------------------------- |
| **Backlog item** | Jira issue, Linear issue                        | Lightweight, single unit of work (but granularity varies) |
| **Project**      | Jira issue _or_ Epic; Linear issue _or_ Project | Depends on scope; linked via `associated_issues`          |
| **Roadmap**      | Jira Roadmap view, Linear Roadmap               | Curated planning document                                 |

The mapping is not 1:1 — a backlog item could map to multiple remote tickets (if split during refinement), a project could map to a single remote issue or an epic, and `associated_issues` is the many-to-many glue in all directions.

### The `associated_issues` Link Model

All linking between local concepts and remote systems uses a single polymorphic reference format:

```yaml
associated_issues:
  - type: backlog # local backlog item
    ref: improve-cli-help
  - type: project # local OAT project
    ref: guided-oat-init
  - type: jira # remote Jira issue or epic
    ref: PROJ-123
  - type: linear # remote Linear issue or project
    ref: ENG-45
```

This works in both directions — a project references its backlog items, a backlog item references the project it was promoted into, and either can reference remote issues.

## Backlog Item Schema

```yaml
---
id: bl-a3f2
title: Add webhook support
status: open              # open | in_progress | closed | wont_do
priority: high            # urgent | high | medium | low | none
scope: feature            # idea | task | feature | initiative
scope_estimate: M         # XS | S | M | L | XL | XXL
labels: [cli, integrations]
assignee: null
created: 2026-03-15T14:30:00Z
updated: 2026-03-15T14:30:00Z
associated_issues:
  - type: linear
    ref: ENG-45
---

## Description

Support webhook endpoints for CLI event notifications...

## Acceptance Criteria

- ...
```

The `id` is a `bl-` prefix + 4-char hash generated from filename + creation timestamp. The `title` is the human-readable name, always displayed alongside the ID (e.g., `bl-a3f2: Add webhook support`).

The `scope_estimate` is a t-shirt size estimate of effort. The `oat-pjm-add-backlog-item` skill instructs the agent to provide an initial estimate, then asks the user for confirmation/adjustment.

### Backlog Directory Structure

```
.oat/repo/reference/backlog/
  index.md              — prioritized list, categories, status overview
  completed.md          — summary log of closed items
  items/                — active backlog item files
    improve-cli-help.md
    add-webhook-support.md
    fix-state-refresh-perf.md
  archived/             — completed item files (moved from items/ on close)
    update-agents-md.md
    add-timestamp-frontmatter.md
```

The index file provides the board view — groupable by status, priority, label, scope. It has a CLI-generated section (managed markers, auto-populated from item frontmatter using the existing `<!-- OAT ... -->` / `<!-- END OAT ... -->` pattern) and a curated section (brief narrative summaries maintained by the agent via `oat-pjm-add-backlog-item` skill).

### Full `reference/` Directory Structure

```
.oat/repo/reference/
  backlog/
    index.md              — prioritized overview
    completed.md          — summary log of closed items
    items/                — active backlog item files
    archived/             — completed item files
  roadmap.md              — curated planning narrative (Now / Next / Later)
  decision-record.md      — ADR log (unchanged)
  current-state.md        — snapshot of implemented state (unchanged)
  external-plans/         — imported plans from other sources (unchanged)
```

**Migration notes:**

- `backlog.md` (flat file) → decomposed into `backlog/index.md` + individual `backlog/items/*.md` files
- `backlog-completed.md` → decomposed into `backlog/completed.md` (summary log) + `backlog/archived/*.md` (full item files)
- `deferred-phases.md` → removed; still-relevant items migrated to backlog items (staleness/knowledge drift, memory system), remainder is done or dropped
- `roadmap.md` → migrated to Now / Next / Later structure with template reference

### Templates

```
.oat/templates/
  backlog-item.md         — template for new backlog items
  roadmap.md              — template defining Now / Next / Later structure
```

Actual files reference their template at the top (e.g., `<!-- Structure guidance: .oat/templates/roadmap.md -->`) so agents follow the pattern consistently.

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
13. **`project-management` skill pack** — New skill pack following the existing pack pattern (alongside `workflows`, `ideas`, `utility`). Includes all `oat-pjm-*` skills, associated templates (`backlog-item.md`, `roadmap.md`), and CLI scripts (index regeneration, ID generation). Requires: manifest entry in `skill-manifest.ts`, installer module, `bundle-assets.sh` integration, `PackName` type update, pack description/metadata, and bundle consistency test coverage

## Key Decisions

1. **Local concepts are independent:** Backlog items, projects, and roadmap are three separate concepts, not levels of a hierarchy. They are linked via `associated_issues` references.
2. **Backlog items have flexible granularity:** A backlog item can represent work at any level — single task, feature, or initiative-sized. The `scope` field provides a rough signal without enforcing hierarchy.
3. **Projects are scope-flexible:** An OAT project can be equivalent to a single issue or an epic, depending on the work. The workflow mode (quick vs. spec-driven) reflects this.
4. **`associated_issues` is the universal link:** Many-to-many, polymorphic references connect local concepts to each other and to remote systems (Jira, Linear). Same format everywhere.
5. **Roadmap is a narrative document:** A single curated file that references backlog items and projects, not a tracking system with its own items.
6. **Backlog items are file-per-item with an index:** Individual markdown files in `.oat/repo/reference/backlog/items/`, with an `index.md` for the bird's-eye view.
7. **Scope field for backlog items:** `idea | task | feature | initiative` — a rough granularity signal to help with triage and prioritization.
8. **Local-first, remote later:** Build the local backlog/roadmap system first. Remote integration (Jira/Linear) layers on top via `associated_issues` references without restructuring.
9. **Backlog lives in `reference/backlog/`:** The backlog directory structure is part of `.oat/repo/reference/`, alongside other curated reference docs (roadmap, decision record, current state).
10. **Completed items: summary + archived files:** Closed backlog items get a summary entry in `completed.md` and their full item file moved from `items/` to `archived/`.
11. **`deferred-phases.md` retired:** Legacy document merged/migrated — still-relevant phases (staleness/knowledge drift, memory system) become backlog items; the rest is done or dropped.
12. **Backlog item template:** `.oat/templates/backlog-item.md` provides consistent scaffolding for new items, matching the project template pattern.
13. **Completed log ordering:** `completed.md` entries ordered by ISO 8601 UTC timestamp — uses `oat_project_completed` from project `state.md` if the item was resolved via a project, otherwise the current UTC timestamp at close time. Newest first. Unique timestamps avoid merge conflicts.
14. **Backlog item IDs are short hashes:** IDs use a `bl-` prefix + 4-char hash (e.g., `bl-a3f2`), generated from filename + creation timestamp. Avoids worktree conflicts (no shared counter). Filenames remain human-readable (`staleness-knowledge-drift.md`). All references use the hash ID; display always pairs it with the title (`bl-a3f2: Staleness + knowledge drift`).
15. **Backlog index is hybrid (generated + curated):** `index.md` has a CLI-generated section (managed markers, auto-populated from item frontmatter) and a curated section (brief narrative summaries maintained by the agent via `oat-pjm-add-backlog-item` skill). Generated section uses the existing `<!-- OAT ... -->` / `<!-- END OAT ... -->` managed-section pattern.
16. **`oat-pjm-add-backlog-item` skill orchestrates creation:** Creates item file from template, runs CLI to regenerate the generated index section, then guides the agent to update the curated section with a brief overview.
17. **Roadmap uses Now / Next / Later horizons:** Primary structure is time-based horizons (Now = active/committed, Next = planned, Later = directional intent). Optional theme groupings within each horizon. Entries reference backlog items by ID and projects by name — detail lives in those artifacts, not the roadmap.
18. **Template-guided structure for roadmap and backlog:** `.oat/templates/roadmap.md` and `.oat/templates/backlog-item.md` define the canonical structure. Actual files reference their template at the top so agents follow the pattern consistently.
19. **`associated_issues` lives in project `state.md` frontmatter:** No separate config file — `state.md` is already the project metadata hub, and skills already read/write it.
20. **`scope_estimate` field on backlog items:** T-shirt sizing (XS / S / M / L / XL / XXL) for effort estimation. The `oat-pjm-add-backlog-item` skill has the agent provide an initial estimate and asks the user for confirmation, disagreement, or adjustment.
21. **Skill renames:** Existing skills get refactored into the `oat-pjm-*` namespace: `update-repo-reference` → `oat-pjm-update-repo-reference`; `review-backlog` → `oat-pjm-review-backlog`. New skill: `oat-pjm-add-backlog-item`.
22. **`oat-pjm-review-backlog` analyzes the full backlog:** Reviews `completed.md`, `index.md`, and individual backlog items. Presents the user with an analysis including quick wins, high-value items, scope estimates, and recommendations for what to work on next. Based on existing `review-backlog` skill with updates for the new file-per-item structure.
23. **`project-management` is a new skill pack:** All `oat-pjm-*` skills are distributed as a `project-management` pack, following the same pattern as `workflows`, `ideas`, and `utility` packs. This means: a `PROJECT_MANAGEMENT_SKILLS` constant in `skill-manifest.ts`, a dedicated installer (`install-project-management.ts`), `bundle-assets.sh` entries, `PackName` type extended to include `'project-management'`, pack description in `PACK_DESCRIPTIONS`, and bundle consistency test coverage. The pack includes skills, templates (backlog-item, roadmap), and CLI scripts. Scope: project only (like workflows).

## Constraints

- Must not break existing OAT project workflows
- Existing backlog items must be preserved during migration (no data loss)
- Backlog items should be cheap to create — minimal required fields
- Generated index section uses existing `<!-- OAT ... -->` / `<!-- END OAT ... -->` managed-section pattern
- All `oat-pjm-*` skills must conform to `create-oat-skill` conventions: mode assertion, progress banners (`OAT ▸ ...`), project-root resolution (if project-scoped), semver frontmatter (`version: 1.0.0`), success criteria section
- Skills must be distributed as a dedicated `project-management` skill pack, following the established pack pattern: manifest constant, installer, bundle-assets.sh, PackName type, consistency tests

## Success Criteria

- Backlog directory structure is in place with index, completed, items/, archived/
- Templates exist for backlog items and roadmap
- All three skills are functional (add-backlog-item, update-repo-reference, review-backlog)
- CLI can regenerate the backlog index generated section
- Existing flat backlog items are migrated to individual files
- `deferred-phases.md` is retired, relevant items migrated
- Roadmap is migrated to Now/Next/Later structure
- `associated_issues` field is in state.md template
- `project-management` skill pack is installable via `oat tools install` and passes bundle consistency tests

## Out of Scope

- Remote PM integration (Jira, Linear) — separate project (`remote-project-management`)
- Automated backlog-to-project promotion workflows
- Backlog item sub-tasks or hierarchical nesting
- Sprint/cycle management
- Time tracking

## Deferred Ideas

- **GitHub Issues integration** — Natural extension of `associated_issues`
- **Automated index generation** — Generate `index.md` entirely from item files on demand (currently hybrid)
- **Backlog item type templates** — Pre-filled templates for common item types (bug, feature, chore)
- **Cross-project backlog views** — Aggregating backlog items across multiple repos
- **Bulk import** — Importing issues from Jira/Linear into local backlog

## Assumptions

- The agent (Claude/Codex/etc.) will be the primary creator/manager of backlog items, though humans may also edit them directly
- Backlog items are repository-scoped (not global across repos)
- The existing `.oat/projects/` structure is unchanged — backlog lives in `.oat/repo/reference/backlog/`

## Risks

- **Backlog bloat:** Without discipline, the backlog grows indefinitely with stale items
  - **Likelihood:** High
  - **Impact:** Low
  - **Mitigation Ideas:** Periodic review prompts via `oat-pjm-review-backlog`, staleness detection in dashboard, `wont_do` status for explicit rejection

- **Index drift:** If the curated section of the index diverges from actual item files
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation Ideas:** Hybrid approach — generated section is always in sync, curated section maintained by skill. Validation can flag mismatches.

## Open Questions

None — all discovery questions resolved.

## Next Steps

Quick mode → proceed to plan. Scope is clear, no architecture decisions remain.

---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-15
oat_generated: false
---

# Discovery: project-management-integration

## Phase Guardrails (Discovery)

Discovery is for requirements and decisions, not implementation details.

- Prefer outcomes and constraints over concrete deliverables (no specific scripts, file paths, or function names).
- If an implementation detail comes up, capture it as an **Open Question** for design (or a constraint), not as a deliverable list.

## Initial Request

Create first-class project management integration for OAT with a provider model supporting three backends:

1. **Local** — Markdown-based project management (what exists today, but not yet formalized as a provider)
2. **Jira** — Integration with Atlassian Jira for team workflows
3. **Linear** — Integration with Linear for team workflows

The local mode is the right place to start. OAT is currently used by a solo contributor, and local PM works well for that. But the system should be designed for expansion to team-oriented tools (Jira, Linear) in other repos.

Key motivations:

- Formalize the implicit local PM system (backlog, projects, roadmap) as a first-class local system
- Design linking mechanisms that accommodate external PM tools with very different data models
- Enable OAT to be useful for teams, not just solo developers

## Conceptual Model

### Three Independent Concepts

Through discovery conversation, we established that the local PM system should be built around three independent concepts that can be linked but are not hierarchically coupled:

#### 1. Backlog Items

The local equivalent of a Jira issue or Linear issue. Captured work at **any granularity** — a single task, a feature-sized chunk, or something that would break into multiple tickets when refined. Backlog items are cheap to create and don't require ceremony.

**Key properties:**

- Unique identifier (e.g., `bl-003`)
- Title, description, status, priority, labels
- **Scope indicator:** `idea | task | feature | initiative` — a rough signal of granularity, not an enforced hierarchy level
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
id: bl-003
title: Add webhook support
status: open              # open | in_progress | closed | wont_do
priority: high            # urgent | high | medium | low | none
scope: feature            # idea | task | feature | initiative
labels: [cli, integrations]
assignee: null
created: 2026-03-15
updated: 2026-03-15
associated_issues:
  - type: linear
    ref: ENG-45
---

## Description

Support webhook endpoints for CLI event notifications...

## Acceptance Criteria

- ...
```

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

The index file provides the board view — groupable by status, priority, label, scope. Can be generated from item files, hand-curated, or both.

### Full `reference/` Directory Structure

The backlog restructuring fits within the broader `.oat/repo/reference/` directory, which also houses other curated reference documents:

```
.oat/repo/reference/
  backlog/
    index.md              — prioritized overview
    completed.md          — summary log of closed items
    items/                — active backlog item files
    archived/             — completed item files
  roadmap.md              — curated planning narrative
  decision-record.md      — ADR log (unchanged)
  current-state.md        — snapshot of implemented state (unchanged)
  external-plans/         — imported plans from other sources (unchanged)
```

**Migration notes:**

- `backlog.md` (flat file) → decomposed into `backlog/index.md` + individual `backlog/items/*.md` files
- `backlog-completed.md` → decomposed into `backlog/completed.md` (summary log) + `backlog/archived/*.md` (full item files)
- `deferred-phases.md` → removed; still-relevant items migrated to backlog items (staleness/knowledge drift, memory system), remainder is done or dropped
- `roadmap.md` → stays as-is (already a narrative document)

### Backlog Item Template

A `backlog-item.md` template in `.oat/templates/` enables consistent scaffolding of new backlog items (same pattern as project templates):

```
.oat/templates/
  backlog-item.md         — template for new backlog items
```

## Clarifying Questions

### Question 1: Source of truth model

**Q:** When Jira/Linear is connected, which system is the source of truth?

- (a) OAT is always the source of truth, external tools get synced outward
- (b) External tool is the source of truth, OAT pulls state inward
- (c) Bidirectional sync with conflict resolution
- (d) OAT artifacts are the working surface for agents; external tool is the record of truth for humans/teams

**A:** {Awaiting user input}
**Decision:** {Pending — deferred until remote integration phase}

### Question 2: Authentication and configuration

**Q:** How should credentials for Jira/Linear be managed?

- (a) Environment variables (JIRA_API_TOKEN, LINEAR_API_KEY)
- (b) Stored in `.oat/config.local.json` (gitignored)
- (c) Delegated to system keychain / credential helpers
- (d) Use existing CLI tools (jira-cli, linear-cli) if available

**A:** {Awaiting user input}
**Decision:** {Pending — deferred until remote integration phase}

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

## Constraints

- Must not break existing OAT project workflows — projects continue to work exactly as they do today
- External tool integrations must be optional — OAT must remain fully functional without Jira/Linear
- Credentials must never be stored in version-controlled files
- The `associated_issues` format should accommodate future backends beyond Jira/Linear (GitHub Issues, Notion, etc.)
- Agent sessions are ephemeral — the system cannot assume a long-running process for sync
- Backlog items should be cheap to create — minimal required fields

## Success Criteria

- Local backlog system is functional: create, list, update, close backlog items via CLI
- Backlog index provides a useful overview grouped by status/priority/scope
- Projects can reference backlog items via `associated_issues` and vice versa
- Roadmap file can be created and maintained referencing backlog items and projects
- Existing OAT project workflows continue to work unchanged
- The `associated_issues` format is extensible to remote providers without local changes

## Out of Scope (This Phase)

- Remote provider integration (Jira, Linear) — deferred to a subsequent phase
- Real-time sync or webhooks
- Visual dashboards or web UIs
- Time tracking or estimation features
- Sprint planning or velocity metrics
- Automated backlog-to-project promotion workflows

## Deferred Ideas

- **Remote provider integration** — Jira and Linear as `associated_issues` types with sync capabilities
- **GitHub Issues integration** — Natural extension of `associated_issues`
- **Automated index generation** — Generate `index.md` from item files on demand
- **Backlog item templates** — Pre-filled templates for common item types (bug, feature, chore)
- **Cross-project backlog views** — Aggregating backlog items across multiple repos
- **Bulk import** — Importing issues from Jira/Linear into local backlog

## Open Questions

- **Backlog index: generated or curated?** Should `index.md` be auto-generated from item files (always in sync but less flexible) or hand-curated (allows custom ordering/grouping but can drift)? Or a hybrid — generated with manual overrides?
- **Backlog item IDs:** Should IDs be auto-assigned sequential (`bl-001`, `bl-002`) or user-chosen (filename-based like `add-webhook-support`)? Sequential is unambiguous; name-based is more readable.
- **Roadmap structure:** What sections should the roadmap file have? Time-based horizons (Now / Next / Later)? Theme-based groupings? Both?
- **Project `associated_issues` location:** Should this field live in `state.md` frontmatter, or in a separate project-level config? State.md is already the project's metadata hub.

## Assumptions

- The local backlog system is the immediate priority; remote integration is a future phase
- The agent (Claude/Codex/etc.) will be the primary creator/manager of backlog items, though humans may also edit them directly
- Backlog items are repository-scoped (not global across repos)
- The existing `.oat/projects/` structure is unchanged — backlog lives in `.oat/repo/reference/backlog/` within the existing reference directory

## Risks

- **Backlog bloat:** Without discipline, the backlog grows indefinitely with stale items
  - **Likelihood:** High
  - **Impact:** Low
  - **Mitigation Ideas:** Periodic review prompts, staleness detection in dashboard, `wont_do` status for explicit rejection

- **Index drift:** If the index is hand-curated, it will diverge from actual item files
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation Ideas:** Hybrid approach — generated sections with manual annotations, or validation that flags mismatches

- **Scope creep into remote integration:** Temptation to design the local system around Jira/Linear's models
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation Ideas:** Design around OAT's own concepts. Remote integration is just another `associated_issues` type — it doesn't dictate local structure.

## Research Findings

### Jira Cloud REST API vs Linear GraphQL API

Key findings from comparative research (full report available):

- **Jira** uses REST, transition-based workflows (3 status categories: To Do / In Progress / Done), ADF for descriptions (but supports Markdown in UI), and type-based hierarchy (Epic → Story → Subtask)
- **Linear** uses GraphQL, free-move states (5 categories: Backlog / Unstarted / Started / Completed / Canceled), Markdown descriptions, and relationship-based hierarchy (Project → Issue → Sub-issue)
- **Common fields** across both: id, title, description, status/category, priority, assignee, labels, parent, dates, estimate
- **Key adapter challenges**: status category mapping (3 vs 5 categories), transition model differences (Jira requires transition IDs, Linear allows direct state assignment), hierarchy mismatch (Jira epics are issues, Linear projects are not)
- **Description format gap** is narrower than initially thought — Jira supports Markdown in the UI despite ADF being the API-native format

These findings validate the `associated_issues` approach: the local model should be designed around OAT's own concepts, with provider-specific mapping handled at the integration layer rather than baked into the local schema.

## Next Steps

1. Resolve remaining open questions (backlog index strategy, ID scheme, roadmap structure, completion flow)
2. Continue to specification phase for the local backlog/roadmap system
3. Defer remote integration questions (source of truth, auth) to a future phase

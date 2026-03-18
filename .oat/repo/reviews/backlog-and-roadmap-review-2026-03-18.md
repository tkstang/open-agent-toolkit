# Backlog & Roadmap Review

**Date:** 2026-03-18
**Scope:** All items in backlog.md (Inbox: 2 items, Planned: 5 items). In Progress, Deferred, and Completed sections excluded.
**Roadmap:** `.oat/repo/reference/roadmap.md`
**Purpose:** Prioritize by value/effort, surface dependencies, and recommend an execution sequence

---

## 1. Executive Summary

The backlog contains **7 items** (2 Inbox, 5 Planned) spanning 4 themes:

| Theme                  | Count | Key Observation                                                                 |
| ---------------------- | ----- | ------------------------------------------------------------------------------- |
| Workflow / PM          | 2     | Core PM workflow family (B03) is the largest strategic item; backlog refinement (B02) adds Jira integration |
| Skills                 | 3     | PR review follow-on (B05), dependency intelligence (B06), idea promotion (B07) — all extend existing skill families |
| Tooling                | 2     | S3 archival (B01) and Codex prompt-wrappers (B04) — both optional enhancements  |
| Cross-cutting          | 0     | No cross-cutting items; all are scoped to a single area                         |

**Top-line recommendations:**

1. **Start with B07 (idea promotion)** — the handshake contract is already documented in `oat-idea-summarize`, making this a well-bounded quick win that connects the ideas and projects workflows.
2. **Tackle B03 (PM workflow family) next** — it's the highest-value strategic item, formalizing ad-hoc flows that are already being run. Start with a discovery phase to scope the skill family.
3. **Defer B01 (S3 archival) and B02 (Jira backlog refinement)** — both are external integration work with narrow audience and optional value; save them for when there's a concrete user need.

---

## 2. Item Catalog

### Rating Key

| Rating     | Value                                                                          | Effort                                           |
| ---------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| **High**   | Unblocks other items, daily workflow impact, or product milestone prerequisite | > 3 days, high complexity, or touches many files |
| **Medium** | Improves quality/consistency but not blocking                                  | 1-3 days, moderate complexity                    |
| **Low**    | Nice-to-have or future-facing                                                  | < 1 day, straightforward, isolated change        |

### Priority Quadrants

```
                     High Value
                        |
         STRATEGIC      |      QUICK WIN
        (plan carefully)|    (do first)
                        |
  High Effort ----------+---------- Low Effort
                        |
         AVOID /        |      FILL-IN
         DEFER          |    (slot into gaps)
                        |
                     Low Value
```

---

### B01 - Optional S3 archival in `oat-project-complete` workflow

> Add optional S3 bucket upload during project completion for durable off-repo storage.

| Dimension    | Rating          | Rationale                                                                                                    |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Value**    | **Low**         | Nice-to-have for teams wanting cloud archival. Local archive works fine for current dogfood use. No items depend on this. |
| **Effort**   | **Medium**      | Needs AWS SDK integration, credential chain detection, config schema extension, error handling, and a `--skip-s3` CLI flag. The `oat-project-complete` skill is 12 steps; inserting S3 logic between Steps 8-9 is straightforward but the AWS plumbing adds scope. |
| **Quadrant** | **Avoid / Defer** |                                                                                                              |

- **Dependencies:** None
- **Blocked by:** Nothing
- **Blocks:** Nothing

---

### B02 - Backlog Refinement Flow (Jira ticket generation)

> Conversational flow to break initiatives into epics/stories/tasks and create them in Jira via Atlassian CLI.

| Dimension    | Rating          | Rationale                                                                                                    |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Value**    | **Low**         | Useful for teams using Jira, but narrow audience during dogfood phase. OAT's internal workflow doesn't use Jira. |
| **Effort**   | **High**        | Requires building a multi-round conversational skill, template-driven output format, Jira API/CLI integration, iterative refinement UX, and error handling for ticket creation. Significant new surface area. |
| **Quadrant** | **Avoid / Defer** |                                                                                                              |

- **Dependencies:** None (standalone integration)
- **Blocked by:** Nothing
- **Blocks:** Nothing

---

### B03 - First-class OAT project/repo management workflow family (`oat-pjm-*`)

> Formalize the ad-hoc PM flows (backlog capture/review/completion, decision records, reference refresh, review hygiene) into a repeatable skill family.

| Dimension    | Rating          | Rationale                                                                                                    |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Value**    | **High**        | Formalizes flows already being run ad-hoc. Daily workflow impact — currently these operations require manual orchestration. Supports both version-controlled and local-only modes, which is a prerequisite for broader adoption. Aligns with Phase 4 polish on the roadmap. |
| **Effort**   | **High**        | Spans multiple skills (backlog capture, decision records, reference refresh, review cleanup), config for gitignore policy, interactive multi-select flows, and dual-mode (tracked vs local-only) support. Two `oat-pjm-*` skills already exist (`add-backlog-item`, `review-backlog`) plus `oat-pjm-update-repo-reference`, providing a foundation to build on. |
| **Quadrant** | **Strategic**   |                                                                                                              |

- **Dependencies:** Builds on existing `oat-pjm-*` skills and `oat cleanup` commands
- **Blocked by:** Nothing (can start immediately)
- **Blocks:** Nothing directly, but establishes patterns other PM skills would follow

---

### B04 - Optional Codex prompt-wrapper generation for synced OAT skills

> Generate thin `.codex/prompts` wrappers for `oat-*` skills when syncing to Codex, keeping skill files as the source of truth.

| Dimension    | Rating          | Rationale                                                                                                    |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Value**    | **Medium**      | Improves Codex provider experience by making OAT skills invocable via Codex's prompt system. Currently Codex users must know the skill name convention. Aligns with Phase 8 (provider interop). |
| **Effort**   | **Low**         | Codex TOML sync infrastructure already exists (canonical agent parser/renderer + codec). This adds a parallel generation step during `oat sync` for the prompts directory. The wrappers are thin aliases — minimal template logic needed. |
| **Quadrant** | **Quick Win**   |                                                                                                              |

- **Dependencies:** Codex sync infrastructure (already implemented)
- **Blocked by:** Nothing
- **Blocks:** Nothing

---

### B05 - PR review follow-on skill set (provide-remote, respond-remote, summarize-remote)

> Evaluate and implement the remaining PR review skills: posting review comments to GitHub, responding to review threads, and generating summary comments.

| Dimension    | Rating          | Rationale                                                                                                    |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Value**    | **Medium**      | Completes the review skill family round-trip. Currently reviews are received from GitHub but findings can't be pushed back programmatically. Useful but the core review flow works without these. |
| **Effort**   | **Medium**      | Three skills to evaluate and potentially implement. Each follows the existing review skill pattern (project-scoped + generic variant). GitHub API interactions are well-understood. The `gh` CLI is already used elsewhere. Scoping as optional extensions reduces pressure on each individual skill. |
| **Quadrant** | **Strategic** (borderline Quick Win for individual skills) |                                                                                                              |

- **Dependencies:** Review receive skill family (completed, PR #29)
- **Blocked by:** Nothing
- **Blocks:** Nothing

---

### B06 - Dependency intelligence skill family

> Skills to analyze `package.json`, compare versions, summarize changelogs, classify breaking vs non-breaking, and suggest upgrade paths.

| Dimension    | Rating          | Rationale                                                                                                    |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Value**    | **Medium**      | Useful for any Node.js project, but doesn't unblock other OAT work. More of a "product" feature than a dogfood necessity. |
| **Effort**   | **Medium**      | Needs npm registry API calls, changelog parsing, semver analysis, and optional code usage scanning. No existing infrastructure for this — would be built from scratch. The skill pattern is established, but the domain logic is new. |
| **Quadrant** | **Fill-in**     |                                                                                                              |

- **Dependencies:** None
- **Blocked by:** Nothing
- **Blocks:** Nothing

---

### B07 - Add idea promotion and auto-discovery flow to `oat-project-new`

> Enhance `oat-project-new` to detect summarized ideas, offer promotion, seed discovery with idea context, and auto-trigger discovery.

| Dimension    | Rating          | Rationale                                                                                                    |
| ------------ | --------------- | ------------------------------------------------------------------------------------------------------------ |
| **Value**    | **High**        | Bridges the ideas and projects workflows, which are currently disconnected. The manual handoff from `oat-idea-summarize` to `oat-project-new` to `oat-project-discover` is friction-heavy. Connects two already-implemented workflow families. |
| **Effort**   | **Low**         | The `oat-idea-summarize` skill (Step 7) already documents the exact 4-step contract. `oat-project-new` is a lean 3-step skill. Changes are: (1) scan for summarized ideas in Step 1, (2) offer promotion choice, (3) pass summary as seed context to discover, (4) update ideas backlog. All pieces exist; this is wiring. |
| **Quadrant** | **Quick Win**   |                                                                                                              |

- **Dependencies:** Ideas workflow (implemented), `oat-project-new` (implemented), `oat-project-discover` (implemented)
- **Blocked by:** Nothing
- **Blocks:** Nothing

---

## 3. Dependency Graph

```
Legend:  ──▶  hard dependency (must complete first)
         - -▶  soft dependency (beneficial but not required)

B03 (PM workflow family) - -▶ B05 (PR review follow-on)
    Rationale: PM workflow patterns inform how review skills fit into the broader PM lifecycle

B04 (Codex prompt-wrappers) - -▶ B03 (PM workflow family)
    Rationale: New PM skills from B03 would benefit from Codex wrappers, but B04 can ship independently

B01 (S3 archival) [independent]
B02 (Jira refinement) [independent]
B06 (Dependency intelligence) [independent]
B07 (Idea promotion) [independent]
```

The dependency graph is notably sparse — most items are independent. The only connections are soft dependencies between B03/B04/B05, reflecting that the PM workflow family (B03) establishes patterns that others extend.

---

## 4. Parallel Lanes

These are independent work streams that can be tackled concurrently without conflicts.

### Lane A: Workflow Integration

Connecting existing workflow families and formalizing PM flows.

```
B07 (Idea promotion) ──▶ B03 (PM workflow family)
```

**Total estimated effort:** Medium-High (B07 is Low effort, B03 is High)
**Cross-lane dependencies:** B03 soft-depends on patterns used by Lane B

### Lane B: Provider & Review Extensions

Extending provider interop and review capabilities.

```
B04 (Codex prompt-wrappers) ──▶ B05 (PR review follow-on)
```

**Total estimated effort:** Medium (both individually Medium or lower)
**Cross-lane dependencies:** B05 benefits from B03 patterns (soft)

### Lane C: External Integrations (Deferred)

Cloud storage and third-party tool integrations.

```
B01 (S3 archival) [independent]
B02 (Jira refinement) [independent]
```

**Total estimated effort:** Medium-High (combined)
**Cross-lane dependencies:** None

### Lane D: Developer Tooling

Standalone developer-facing features.

```
B06 (Dependency intelligence) [independent]
```

**Total estimated effort:** Medium
**Cross-lane dependencies:** None

---

## 5. Recommended Execution Order

### Wave 1: Quick Wins

| Order | Item                               | Effort | Rationale                                                  |
| ----- | ---------------------------------- | ------ | ---------------------------------------------------------- |
| 1a    | **B07** - Idea promotion           | Low    | Highest value-to-effort ratio. Contract already documented. Bridges ideas ↔ projects workflow gap. |
| 1b    | **B04** - Codex prompt-wrappers    | Low    | Leverages existing Codex sync infrastructure. Small, isolated change. |

**Parallelism:** B07 and B04 can run fully in parallel — they touch different parts of the codebase.

### Wave 2: Strategic Investment

| Order | Item                               | Effort | Rationale                                                  |
| ----- | ---------------------------------- | ------ | ---------------------------------------------------------- |
| 2a    | **B03** - PM workflow family       | High   | Core strategic item. Formalizes ad-hoc flows. Should be scoped as an OAT project with discovery phase. |
| 2b    | **B05** - PR review follow-on      | Medium | Can start in parallel with B03 since it extends an already-completed skill family. Individual skills can ship incrementally. |

**Parallelism:** B03 and B05 can run in parallel since B05 extends the existing review family (not dependent on B03's PM patterns for its core implementation).

### Wave 3: Fill-in Work

| Order | Item                               | Effort | Rationale                                                  |
| ----- | ---------------------------------- | ------ | ---------------------------------------------------------- |
| 3a    | **B06** - Dependency intelligence  | Medium | Useful but not urgent. Slot into gaps between higher-priority work. |

**Parallelism:** Independent — can overlap with any other wave if capacity allows.

### Deferred

| Item                               | Rationale                                                  |
| ---------------------------------- | ---------------------------------------------------------- |
| **B01** - S3 archival              | Low value for current dogfood use. Revisit when a team requests cloud archival. |
| **B02** - Jira backlog refinement  | High effort, low value in dogfood context. No current Jira usage. Revisit when there's a concrete external team need. |

---

## 6. Roadmap Alignment

### How backlog items map to roadmap phases

| Roadmap Phase                              | Status                       | Backlog Items | Notes                                                                 |
| ------------------------------------------ | ---------------------------- | ------------- | --------------------------------------------------------------------- |
| Phase 4: Active project lifecycle + dashboard | Completed (polish remaining) | B03           | B03 aligns with the "polish remaining" work — formalizing PM flows    |
| Phase 7: Quick mode + template rendering     | In Progress                  | B07           | B07's idea promotion connects to `oat-project-new`, part of Phase 7 scope |
| Phase 8: Provider interop CLI                | In Progress                  | B04           | B04 (Codex prompt-wrappers) explicitly noted as related in roadmap     |
| Phase 3: Reviews + PR loop                   | Completed                    | B05           | B05 extends the completed Phase 3 work with optional follow-on skills  |
| (No phase)                                   | —                            | B01, B02, B06 | These items are not tied to any roadmap phase                          |

### Gaps: Roadmap items without backlog coverage

| Roadmap Item                                           | Phase   | Status                                                          |
| ------------------------------------------------------ | ------- | --------------------------------------------------------------- |
| Template rendering helper (`oat template render ...`)  | Phase 7 | Minor convenience — skills already handle scaffolding. Low priority unless manual template use becomes common. |
| Staleness + knowledge drift upgrades                   | Phase 5 | Already covered by backlog item `bl-f9bd`.                      |
| Parallel fan-out execution + reconcile tooling         | Phase 6 | Low urgency (Deferred status) — add backlog item when ready.    |
| Provider capability matrix + expanded docs             | Phase 8 | Capability docs already exist. Remaining work is expanding sync support for provider-specific features (e.g., hooks). Partially covered by `bl-71a1`. |
| Repo State Dashboard contract tightening               | Phase 4 | Covered by B03 (PM workflow family) — no separate item needed.  |

No significant uncovered gaps. The backlog-to-roadmap coverage is strong.

### Orphans: Backlog items not on the roadmap

| Backlog Item                            | Recommendation                                                    |
| --------------------------------------- | ----------------------------------------------------------------- |
| **B01** - S3 archival                   | Keep as standalone backlog item. Too narrow for a roadmap phase.  |
| **B02** - Jira backlog refinement       | Keep as standalone. Could fit under a future "Integrations" phase if more external integrations accumulate. |
| **B06** - Dependency intelligence       | Keep as standalone. Could fit under Phase 10 (provider enhancements) or a future "Developer Tooling" phase. |

---

## 7. Observations & Recommendations

### Strategic observations

1. **The backlog is lean and well-scoped.** With only 7 active items and most being independent, there's little coordination overhead. This is a sign of good backlog hygiene — completed items are properly archived.
2. **The ideas-to-projects gap (B07) is the most impactful quick win.** The contract is pre-documented, the pieces exist, and it connects two workflow families that are currently manually bridged. This should be first.
3. **B03 (PM workflow family) is the backbone investment.** It formalizes what's already being done ad-hoc. The existing `oat-pjm-*` skills (3 skills) provide a foundation. This deserves its own OAT project with proper discovery.
4. **External integrations (B01, B02) are premature.** Neither S3 archival nor Jira integration serves the current dogfood workflow. They should wait until there's pull from an actual user/team.
5. **Roadmap-to-backlog coverage is strong.** Phase 5 (staleness) and Phase 10 (provider enhancements) both have corresponding backlog items. The Phase 7 template rendering helper is the only uncovered item, and it's a minor convenience feature since skills already handle template scaffolding internally.

### Risks

| Risk                                        | Mitigation                                                       |
| ------------------------------------------- | ---------------------------------------------------------------- |
| B03 scope creep (PM workflow family is broad) | Start with discovery phase to tightly scope which flows to formalize first. Build incrementally — one skill at a time. |
| Phase 7 template helper is untracked         | Low risk — minor convenience feature. Consider dropping from roadmap if skills continue to handle scaffolding. |
| B05 (PR review follow-on) may not all be needed | The backlog item already says "evaluate" — assess each skill's value before implementing all three. |

### Quick wins to tackle immediately

1. **B07** - Idea promotion and auto-discovery (Low effort, High value — contract pre-documented in `oat-idea-summarize` Step 7)
2. **B04** - Codex prompt-wrapper generation (Low effort, Medium value — leverages existing Codex sync infrastructure)
3. **Consider dropping the Phase 7 template rendering helper** from the roadmap — skills already handle scaffolding, so this may not be needed

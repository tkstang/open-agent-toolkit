---
oat_status: complete
oat_ready_for: oat-project-spec
oat_blockers: []
oat_last_updated: 2026-02-27
oat_generated: false
---

# Discovery: repo-maintainability-review

## Initial Request

Bootstrap this quick-start project from `.oat/ideas/repo-analyze-skill` and carry forward the full concept details into an implementation-ready project.

## Source Idea

- Canonical source: `.oat/ideas/repo-analyze-skill/discovery.md`
- Proposed deliverable: reusable skill `oat-repo-maintainability-review`

## Problem

OAT has strong workflows for instruction analysis (`oat-agent-instructions-analyze`) and ad-hoc review (`oat-review-provide`), but no first-class skill for broad, structured repository health analysis.

### Current Gaps

- No consistent workflow for evaluating repo organization, conventions, docs, and maintainability.
- Architecture-style reviews vary by operator, producing inconsistent findings over time.
- DX is often under-scored or omitted from repo health assessments.
- No canonical artifact schema for repo-level analysis in `.oat/repo/analysis/`.
- No reusable mechanism for both repo-wide and directory-focused analysis.

## Idea

Create `oat-repo-maintainability-review`, an evidence-based, non-judgmental repository analysis skill that outputs a standardized artifact with:

- prioritized findings
- dual scoring (`Concern` + `Value`)
- effort sizing (`Scope`)
- confidence level
- recommended actions with success criteria
- phased execution plan (`Now / Next / Later`)

### Required Analysis Modes

1. Repo-wide analysis (`--scope repo`)
2. Directory-focused analysis (`--scope directory --target <path>`)

## Why This Matters

1. **Decision quality:** normalized scoring allows comparison across repos and time.
2. **Team ergonomics:** constructive framing surfaces risk without blame language.
3. **Execution:** findings translate into a practical backlog with clear next actions.
4. **Onboarding and sustainability:** docs and DX become explicit scored dimensions.

## Core Design Principles

1. **Evidence over opinion:** every finding includes concrete file-level evidence.
2. **Constructive framing:** prioritize opportunity/action language over fault language.
3. **Actionability first:** include ownership suggestions and measurable success criteria.
4. **DX as first-class:** setup, scripts, feedback loops, and debugging are mandatory dimensions.
5. **Scalable analysis:** support sub-agent fan-out/fan-in for large repos.
6. **Mode-aware output:** support `auto|local|tracked|inline` destination policy.

## Scoring Model

Every finding must include:

- **Concern:** `Critical | High | Medium | Low`
- **Value:** `High | Medium | Low`
- **Scope:** `XS | S | M | L | XL`
- **Confidence:** `High | Medium | Low`

### Scope Definitions

- `XS`: <0.5 day (docs, naming cleanup, script clarity)
- `S`: 1-2 days (localized refactor)
- `M`: 3-5 days (multi-file one-subsystem)
- `L`: 1-2 weeks (cross-subsystem refactor + migration)
- `XL`: 2+ weeks (architectural reshaping)

## Required Analysis Dimensions

1. **Architecture and organization**
- module boundaries
- dependency and coupling hotspots
- mixed-responsibility files
- layering violations

2. **Conventions and consistency**
- naming/layout consistency
- patterns across similar modules
- source vs generated boundaries
- style drift in critical areas

3. **Documentation and onboarding**
- root/project orientation quality
- feature-level doc coverage
- setup instruction validity/completeness
- first-week developer path clarity

4. **Developer experience (DX)**
- setup friction (env vars, dependencies, local infra)
- command discoverability and naming clarity
- feedback loop speed (build/test/lint)
- confidence tooling quality (tests/lint/type gates)
- debugging ergonomics (logs/diagnostics/errors)
- contribution ergonomics (DoD clarity, safe change paths)

5. **Testing and reliability**
- high-risk areas vs test depth
- brittle integration boundaries
- change safety for critical paths
- CI feedback quality

6. **Maintainability and delivery risk**
- knowledge silos and implicit coupling
- repetitive manual work lacking automation
- ownership ambiguity
- churn-heavy hotspots

## Artifact Contract

### Target Path

- `.oat/repo/analysis/<date>-repo-review-analysis.md`

### Required Frontmatter

```yaml
---
oat_generated: true
oat_generated_at: YYYY-MM-DD
oat_analysis_type: repo-review
oat_analysis_scope: repo|directory
oat_analysis_target: <path>
oat_analysis_mode: full|delta
oat_analysis_commit: <sha>
---
```

### Required Sections

1. Executive Summary
2. Scoring Summary
3. Prioritized Findings
4. Quick Wins (XS/S)
5. Strategic Initiatives (M/L/XL)
6. Suggested Execution Plan (Now/Next/Later)
7. Appendix (inventory metrics + assumptions)

### Finding Schema

```md
### {ID}. {Title}
- Category: Organization | Conventions | Documentation | DX | Architecture | Testing | Reliability
- Concern: {Critical|High|Medium|Low}
- Value: {High|Medium|Low}
- Scope: {XS|S|M|L|XL}
- Confidence: {High|Medium|Low}
- Evidence:
  - {path + concise fact}
  - {path + concise fact}
- Why this matters:
  - {impact on speed, quality, onboarding, risk}
- Recommended action:
  - {specific next step}
- Suggested owner:
  - {role/team}
- Dependencies:
  - {none or list}
- Success criteria:
  - {measurable outcome}
```

## Output Policy

Mirror `oat-review-provide` destination behavior:

- `tracked`: `.oat/repo/analysis`
- `local`: `.oat/projects/local/orphan-reviews` (or equivalent local-only area)
- `inline`: no file output
- `auto`: prefer tracked directory when available and not gitignored

## Sub-Agent Strategy (Large Repos)

Use optional parallel analysis tracks:

1. Architecture/organization
2. Conventions/consistency
3. Docs/onboarding
4. DX/workflow quality

Merge policy:

- dedupe overlapping findings
- merge evidence lists
- keep strongest rating on disagreement and note rationale
- normalize final scores to one vocabulary

## Implementation References

Patterns to reuse:

- `.agents/skills/oat-agent-instructions-analyze/SKILL.md`
- `.agents/skills/oat-review-provide/SKILL.md`
- `.agents/skills/oat-review-provide/scripts/resolve-review-output.sh`

Skill-local references to add:

- `references/repo-review-artifact-template.md`
- `references/repo-review-rubric.md`
- `references/dx-checklist.md`

## Clarifying Questions (Current Session)

### Question 1: Subagent Scope for v1

**Q:** Should v1 include first-class subagent orchestration, or keep subagents as an optional execution strategy?
**A:** Use optional fan-out: single-agent baseline with optional parallel tracks for large repositories.
**Decision:** Adopt Option B for v1.

## Options Considered: Subagent Strategy

### Option A: No Subagents in v1

**Description:** Keep `oat-repo-maintainability-review` strictly single-agent for v1 and defer all subagent behavior.

**Pros:**
- Lowest implementation complexity and fastest delivery.
- Aligns with `oat-agent-instructions-analyze`, which explicitly defers subagent parallelization in v1.

**Cons:**
- Slower analysis for large repositories.
- Defers validation of fan-out/fan-in merge policy.

### Option B: Optional Subagent Fan-Out (Recommended)

**Description:** Keep baseline execution single-agent, but document optional fan-out tracks for large repos and define deterministic merge policy.

**Pros:**
- Preserves a reliable baseline while enabling scale when available.
- Matches existing discovery intent ("support sub-agent fan-out/fan-in") without forcing provider-specific runtime coupling.
- Compatible with current portability constraints (Codex role-config based, mixed provider support).

**Cons:**
- Requires careful synthesis rules to avoid inconsistent scoring.
- Adds moderate process complexity to `SKILL.md`.

### Option C: First-Class Mandatory Subagent Orchestration

**Description:** Make subagent delegation a primary execution mode for v1 with dedicated roles and orchestration controls.

**Pros:**
- Strong scalability for large repos from day one.
- Encourages specialization by dimension (architecture/docs/DX/etc.).

**Cons:**
- Highest complexity and risk for v1.
- Cross-provider behavior is inconsistent (frontmatter and runtime differences), reducing portability.
- Adds operational setup burden (for example Codex multi-agent config roles).

## Constraints

- Analysis-only scope: no automatic repository code edits or refactoring.
- Findings must be evidence-backed and use constructive, non-judgmental language.
- Output behavior must support `auto|local|tracked|inline` with deterministic tracked naming.
- Cross-provider differences require single-agent baseline behavior to remain valid without subagent support.
- DX coverage is mandatory in every analysis output.

## Out of Scope

- Automatic code patch generation or direct refactoring application.
- Cross-repository benchmarking/scoring calibration in v1.
- Automatic Jira/GitHub issue creation from findings.
- Mandatory subagent orchestration as a hard dependency for successful execution.

## Success Criteria (v1)

- Supports repo-wide and directory-focused analysis.
- Enforces `Concern + Value + Scope + Confidence` per finding.
- Includes a mandatory DX section.
- Produces evidence-backed, constructive, actionable findings.
- Supports `auto|local|tracked|inline` output policy.
- Writes deterministic artifact names in `.oat/repo/analysis/`.

## Non-Goals (v1)

- Automatic code refactoring or patch generation
- Cross-repo benchmarking scores
- Automated Jira/GitHub issue creation
- Fully deterministic architecture scoring model

## Open Questions

1. Should this gain a follow-up apply/implementation skill?
2. Should `delta` analysis against tracked commit be default?
3. Should numeric scoring be added alongside labels?
4. Should large-repo output include dependency graphs?
5. How strict should confidence gating be for `Critical` findings?
6. Should category templates be added (backend/frontend/monorepo/infra)?

## Initial Rollout Plan

1. Implement `oat-repo-maintainability-review` as v1 skill draft.
2. Test on multiple repository shapes.
3. Calibrate scoring language consistency.
4. Add optional deterministic metrics helper script.
5. Decide whether paired follow-up skill is needed.

## Notes from Prior Discovery

- Large resolver files and weak docs are recurring maintainability pain points.
- Value framing is as important as concern framing for team adoption.
- Scope sizing is required to keep findings actionable.
- DX must be explicit and scored, not implied.
- Directory targeting should be supported from v1.

## Next Steps

Discovery decision on subagent strategy is captured (Option B). Awaiting HiLL discovery approval to unlock `oat-project-spec`.

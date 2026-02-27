---
oat_status: complete
oat_ready_for: oat-project-design
oat_blockers: []
oat_last_updated: 2026-02-27
oat_generated: false
oat_template: false
oat_template_name: spec
---

# Specification: repo-maintainability-review

## Phase Guardrails (Specification)

This specification defines requirements and acceptance criteria for a repository-analysis skill. It avoids implementation tasks, code changes, and component-level internals.

## Problem Statement

The project needs a repeatable way to evaluate repository maintainability and developer experience without relying on ad-hoc prompts. Existing workflows in this codebase support focused instruction analysis and ad-hoc review, but they do not provide a unified maintainability analysis contract that is consistent across runs.

Without a standardized rubric and output structure, teams get uneven findings quality, weak comparability over time, and unclear follow-through. The main failure mode is that outputs are descriptive but not actionable, especially when evidence quality or scope sizing is inconsistent.

This specification formalizes a requirements baseline for `oat-repo-review-analyze`: a structured, evidence-based analysis workflow that can run repo-wide or on a directory target, produce prioritized findings, and provide practical execution guidance while preserving portability across provider ecosystems.

## Goals

### Primary Goals
- Define a standard repository-analysis workflow that supports repo-wide and directory-scoped operation.
- Require normalized finding scores (`Concern`, `Value`, `Scope`, `Confidence`) with actionable recommendations.
- Make DX a mandatory analysis dimension in every run.
- Ensure output destinations follow OAT mode conventions (`auto`, `tracked`, `local`, `inline`).
- Ensure invocation UX is clear through argument hints, required-argument clarification, and explicit run-option reporting.
- Use provider-native structured question tools for clarification prompts when available.

### Secondary Goals
- Support optional subagent fan-out for large repositories while preserving single-agent baseline behavior.
- Improve repeatability of maintainability reviews across runs and repositories.

## Non-Goals

- Automatic code patching or refactoring.
- Mandatory first-class subagent orchestration for all executions.
- Cross-repository benchmarking or percentile scoring in v1.
- Automatic issue/ticket creation in external systems.

## Requirements

### Functional Requirements

**FR1: Scope Selection**
- **Description:** The workflow must support full-repository and directory-focused analysis.
- **Acceptance Criteria:**
  - User can run analysis with repository scope.
  - User can run analysis with directory scope and explicit target.
  - Invalid target handling returns actionable guidance.
- **Priority:** P0

**FR2: Standardized Artifact Structure**
- **Description:** The workflow must produce a standardized analysis artifact format.
- **Acceptance Criteria:**
  - Output includes executive summary, scoring summary, prioritized findings, quick wins, strategic initiatives, execution plan, and appendix.
  - Output includes required metadata describing analysis context.
- **Priority:** P0

**FR3: Normalized Scoring**
- **Description:** Every finding must use the required scoring dimensions.
- **Acceptance Criteria:**
  - Each finding contains `Concern`, `Value`, `Scope`, and `Confidence`.
  - Labels conform to approved vocabularies from discovery.
- **Priority:** P0

**FR4: Required Dimension Coverage**
- **Description:** Analysis must evaluate all required maintainability dimensions.
- **Acceptance Criteria:**
  - Output addresses architecture/organization.
  - Output addresses conventions/consistency.
  - Output addresses documentation/onboarding.
  - Output addresses DX.
  - Output addresses testing/reliability.
  - Output addresses maintainability/delivery risk.
- **Priority:** P0

**FR5: Mode-Aware Output Policy**
- **Description:** The workflow must support destination modes for generated output.
- **Acceptance Criteria:**
  - Supports `auto`, `tracked`, `local`, and `inline` behaviors.
  - `auto` behavior prefers tracked output when suitable.
  - Inline mode emits no file artifact.
- **Priority:** P0

**FR6: Actionable Prioritization**
- **Description:** Results must be organized into execution-ready improvement groupings.
- **Acceptance Criteria:**
  - Findings are prioritized and include clear recommended actions.
  - Output separates quick wins (smaller scope) from strategic initiatives (larger scope).
  - Output includes a staged Now/Next/Later execution framing.
- **Priority:** P1

**FR7: Optional Subagent Fan-Out**
- **Description:** The workflow may optionally fan out analysis tracks for large repositories.
- **Acceptance Criteria:**
  - Single-agent execution remains the default and must fully work on its own.
  - Optional parallel tracks can be defined for major dimensions.
  - Synthesis/merge policy deduplicates overlapping findings and normalizes final scores.
- **Priority:** P1

**FR8: Invocation Argument Clarity**
- **Description:** The skill must communicate expected arguments and resolve unclear required arguments before execution.
- **Acceptance Criteria:**
  - Skill frontmatter includes `argument-hint` reflecting supported arguments.
  - When required arguments are missing or ambiguous, the user is explicitly asked to clarify before continuing.
  - Skill prints a startup run-options summary (resolved scope, target, mode, and relevant toggles) before analysis begins.
- **Priority:** P0

**FR9: Provider-Aware Clarification Tooling**
- **Description:** Clarification prompts must use provider-native structured question tools when available.
- **Acceptance Criteria:**
  - For Claude Code execution, clarification questions use `AskUserQuestion` when available.
  - For Codex execution, clarification questions use `request_user_input` when available.
  - If provider-native question tooling is unavailable, the workflow falls back to explicit plain-language clarification prompts and blocks on user confirmation before proceeding.
- **Priority:** P0

### Non-Functional Requirements

**NFR1: Evidence Quality**
- **Description:** Findings must be evidence-based and defensible.
- **Acceptance Criteria:**
  - Every finding includes concrete repository evidence.
  - Confidence rating is present and consistent with evidence depth.
- **Priority:** P0

**NFR2: Constructive Communication**
- **Description:** Language should remain professional and improvement-oriented.
- **Acceptance Criteria:**
  - Findings avoid blame-centric wording.
  - Recommended actions are specific and outcome-focused.
- **Priority:** P0

**NFR3: Repeatability and Traceability**
- **Description:** Analysis outputs must be reproducible and attributable.
- **Acceptance Criteria:**
  - Output metadata captures analysis scope and execution context.
  - Tracked outputs use deterministic naming conventions.
- **Priority:** P1

**NFR4: Portability Across Providers**
- **Description:** Core behavior should not depend on any single provider-only capability.
- **Acceptance Criteria:**
  - Default execution path does not require subagent runtime features.
  - Provider-specific capabilities are optional enhancements, not hard dependencies.
- **Priority:** P1

## Constraints

- Analysis-only behavior; no automatic code modification.
- Required support for `auto|local|tracked|inline` output policy.
- Required inclusion of DX as a first-class dimension.
- Optional subagent behavior must not reduce correctness of single-agent mode.
- Specification remains architecture-level, not implementation-task-level.
- Required arguments must be resolved or explicitly clarified with the user before analysis execution.
- Clarification prompts must prioritize provider-native question tools when available.

## Dependencies

- Existing OAT workflow conventions and skill format.
- Existing review workflow patterns for mode and output policy behavior.
- Repository knowledge artifacts for architecture/integration/concern context.
- Local repository filesystem access for evidence collection.

## High-Level Design (Proposed)

The system is a structured analysis workflow that resolves scope and output mode, gathers repository evidence, synthesizes findings under a normalized rubric, and emits a prioritized artifact or inline result. The central behavior is deterministic formatting and consistent scoring, not code transformation.

The baseline path is single-agent: one orchestrator executes all required dimensions and writes a unified result. For large repositories, optional fan-out can partition analysis by dimension and then merge results using a deterministic dedupe and score-normalization policy.

**Key Components:**
- Analysis workflow controller
- Evidence collection and synthesis stage
- Scoring/rubric application stage
- Output mode resolver and artifact emitter
- Optional fan-out/fan-in orchestration policy

**Alternatives Considered:**
- Single-agent only v1: simpler, but less scalable for larger repositories.
- Mandatory subagent orchestration: more scalable, but too brittle across provider differences for v1.
- Unstructured ad-hoc prompting: rejected due to low repeatability and weak traceability.

## Success Metrics

- 100% of produced artifacts include all required top-level sections.
- 100% of findings include all required scoring fields.
- 100% of runs include explicit DX coverage.
- 100% of runs declare scope/mode context in output metadata.
- Pilot runs across multiple repository shapes produce prioritized findings that are actionable without re-prompting.

## Requirement Index

| ID | Description | Priority | Verification | Planned Tasks |
|----|-------------|----------|--------------|---------------|
| FR1 | Support repository and directory scope modes | P0 | manual: scope mode and target validation behavior | TBD - see plan.md |
| FR2 | Produce standardized artifact structure | P0 | manual: section and metadata completeness review | TBD - see plan.md |
| FR3 | Enforce normalized finding scoring fields | P0 | manual: finding schema conformance check | TBD - see plan.md |
| FR4 | Cover all required analysis dimensions | P0 | manual: dimension coverage checklist review | TBD - see plan.md |
| FR5 | Support mode-aware output destinations | P0 | unit + manual: output mode resolution scenarios | TBD - see plan.md |
| FR6 | Provide actionable prioritization and sequencing | P1 | manual: quick-win/strategic split and staged plan review | TBD - see plan.md |
| FR7 | Support optional subagent fan-out with deterministic synthesis | P1 | manual: documented fan-out and merge-policy validation | TBD - see plan.md |
| FR8 | Ensure argument-hint and required-argument clarity at invocation | P0 | manual: missing/ambiguous argument clarification and startup options summary check | TBD - see plan.md |
| FR9 | Use provider-native question tools for clarification when available | P0 | manual: provider-aware question tooling selection and fallback confirmation flow | TBD - see plan.md |
| NFR1 | Ensure evidence-backed findings quality | P0 | manual: evidence completeness and confidence alignment | TBD - see plan.md |
| NFR2 | Ensure constructive and actionable communication | P0 | manual: language and recommendation quality review | TBD - see plan.md |
| NFR3 | Ensure repeatability and traceability | P1 | manual: metadata and deterministic naming validation | TBD - see plan.md |
| NFR4 | Preserve provider portability of core behavior | P1 | manual: single-agent baseline viability review | TBD - see plan.md |

## Open Questions

- Should delta analysis become default in v1 or be staged into a follow-up version?
- Should numeric scoring be added in addition to label-based scoring?
- Should follow-on workflow exist to convert findings into implementation plans automatically?
- Should category-specific templates be introduced for repo archetypes (for example monorepo, backend-heavy, docs-heavy)?

## Assumptions

- Teams prefer a deterministic artifact contract over free-form narrative output.
- Existing OAT mode and output-policy conventions remain stable.
- Discovery-approved optional fan-out strategy remains valid for v1 scope.

## Risks

- **Risk:** Overly strict schema may reduce adaptability for edge-case repositories.
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation:** Keep rubric extensible while preserving required core fields.

- **Risk:** Optional fan-out can introduce synthesis inconsistency.
  - **Likelihood:** Medium
  - **Impact:** High
  - **Mitigation:** Define explicit merge and normalization policy in design phase.

- **Risk:** Stale knowledge artifacts can reduce context fidelity.
  - **Likelihood:** High
  - **Impact:** Medium
  - **Mitigation:** Treat knowledge docs as advisory and prioritize direct repository evidence during analysis.

## References

- Discovery: `discovery.md`
- Knowledge Base: `.oat/repo/knowledge/project-index.md`

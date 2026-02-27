---
oat_generated: true
oat_generated_at: 2026-02-27
oat_review_scope: design
oat_review_type: artifact
oat_project: .oat/projects/shared/repo-maintainability-review
---

# Artifact Review: design.md

**Reviewed:** 2026-02-27
**Scope:** design.md artifact against spec.md upstream dependency
**Files reviewed:** 2
**Artifacts used:** discovery.md, spec.md, design.md, state.md (all read and verified)

## Summary

The design artifact is well-structured, covers most spec requirements, and presents a clear architecture with typed interfaces, a component breakdown, and phased implementation. However, there are several alignment gaps with the upstream spec -- most notably a `FindingCategory` enum that omits a required dimension, an output destination path that diverges from the artifact contract in discovery, missing progress indicator conventions established by peer skills, and incomplete treatment of the `argument-hint` frontmatter in the skill definition. The design is close to ready but needs targeted fixes before it can safely inform a plan.

## Findings

### Critical

- **FindingCategory enum omits "Maintainability" dimension** (`design.md:241-248`)
  - Issue: FR4 (spec line 80) requires coverage of "maintainability/delivery risk" as a distinct dimension. The `FindingCategory` type in the data model lists `Organization`, `Conventions`, `Documentation`, `DX`, `Architecture`, `Testing`, and `Reliability` -- seven values. However, "Maintainability" is absent as a category. The discovery (line 115-119) explicitly lists "Maintainability and delivery risk" as the sixth required dimension. The current enum splits testing and reliability into separate categories (`Testing` and `Reliability`) which were a single dimension in the spec ("testing/reliability"), creating seven entries, but drops "Maintainability" entirely.
  - Fix: Replace the current seven-value enum with one that faithfully maps all six required dimensions from the spec. Recommended: `'Architecture' | 'Conventions' | 'Documentation' | 'DX' | 'Testing' | 'Maintainability'`. If a seventh or eighth category is desired for finer granularity, that is acceptable as long as all six spec-required dimensions have a clear mapping. Document the mapping explicitly.
  - Requirement: FR4

- **No `argument-hint` value defined in design** (`design.md:66-112`)
  - Issue: FR8 (spec lines 109-113) requires the skill frontmatter to include an `argument-hint` reflecting supported arguments, and the spec marks this P0. The design mentions `argument-hint` in the orchestrator responsibilities (line 72) and in implementation phase 1 (line 501), but never defines the actual hint string. Without this, the plan phase cannot verify the contract. The peer skill `oat-review-provide` provides a concrete example: `"[unstaged|staged|base_branch=<branch>|...] [--output <path>] [--mode auto|local|tracked|inline]"`. The design's API section (lines 296-303) defines `RepoReviewAnalyzeArgs` with `scope`, `target`, `mode`, `output`, `focus`, and `analysisMode`, but these are never composed into a frontmatter hint string.
  - Fix: Add a "Skill Frontmatter" subsection to the Component Design section (or API Design section) that provides the concrete `argument-hint` string, e.g. `"[--scope repo|directory] [--target <path>] [--mode auto|tracked|local|inline] [--focus <areas>] [--analysis-mode full|delta]"`. This makes the contract explicit for plan and implementation.
  - Requirement: FR8

### Important

- **Output destination path diverges from discovery artifact contract** (`design.md:224`, `design.md:202`)
  - Issue: The discovery document (line 125) specifies the target path as `.oat/repo/analysis/<date>-repo-review-analysis.md`. The design's `AnalysisRunMetadata` and Artifact Renderer mention "deterministic naming for tracked artifacts by date + scope slug" (line 202) but never define the concrete path pattern. The `oat-agent-instructions-analyze` skill (the closest peer pattern) uses `.oat/repo/analysis/agent-instructions-${TIMESTAMP}.md`. The design should specify the exact naming convention.
  - Fix: Add a concrete tracked output path pattern in the Artifact Renderer section or the Output Policy Resolver section. Recommend: `.oat/repo/analysis/<YYYY-MM-DD>-repo-review-<scope-slug>.md` to align with both the discovery contract and the peer skill naming convention.
  - Requirement: NFR3

- **No progress indicator convention defined** (`design.md` -- missing section)
  - Issue: Both peer skills (`oat-review-provide` at lines 44-58, `oat-agent-instructions-analyze` at lines 36-50) define explicit progress indicator conventions with phase banners and step indicators. The spec does not explicitly require this, but the design's overview (line 15) claims it "preserves OAT conventions around...progress indicators." No progress indicator section exists in the design to back this claim.
  - Fix: Add a "Progress Indicators" subsection to the Skill Orchestrator component (or a standalone section) defining the phase banner format and step indicators (e.g. `[1/N] Resolving scope and mode...`, `[2/N] Collecting evidence...`, etc.). This matches the claim in the overview and aligns with established OAT skill conventions.

- **`AnalysisMode: 'delta'` referenced but no delta behavior designed** (`design.md:83-89`, `design.md:219`)
  - Issue: The `RepoReviewRunConfig` interface includes `analysisMode: AnalysisMode` where `AnalysisMode = 'full' | 'delta'`. The `AnalysisRunMetadata` also includes `analysisMode`. However, no component describes what delta mode actually does -- how it scopes evidence collection, how it compares against a baseline, or what tracking mechanism it uses. The spec lists delta analysis as an open question (spec line 216: "Should delta analysis become default in v1 or be staged into a follow-up version?") but does not require it. The design includes it in the type system and data model without designing it.
  - Fix: Either (a) remove `delta` from the design's type system and data model, deferring it to a future version (consistent with the spec's open question), or (b) add a dedicated subsection in the Skill Orchestrator or a new "Delta Analysis" component that defines the tracking mechanism, baseline comparison logic, and scoping behavior. Option (a) is recommended for v1 since the spec does not require delta mode.

- **Skill frontmatter `allowed-tools` not specified** (`design.md` -- missing)
  - Issue: Both peer skills define `allowed-tools` in their frontmatter (`oat-review-provide`: `Read, Write, Bash, Glob, Grep, AskUserQuestion`; `oat-agent-instructions-analyze`: `Read, Write, Bash(git:*), Glob, Grep, AskUserQuestion`). The design does not specify which tools should be in the skill frontmatter. Given that the design references a Clarification Interaction Adapter using `AskUserQuestion` and `request_user_input`, and the skill needs filesystem and git access, the allowed-tools list is a relevant design decision (especially the `Bash` scope -- unrestricted vs `git:*` only).
  - Fix: Add `allowed-tools` to the Skill Frontmatter specification. Recommend: `Read, Write, Bash, Glob, Grep, AskUserQuestion` to match `oat-review-provide` since the skill needs broader bash access for evidence collection.

- **Synthesis Engine merge rules underspecified for cross-dimension conflicts** (`design.md:179-189`)
  - Issue: The Synthesis Engine says "Preserve strongest Concern when overlap exists; merge evidence lists" and "Require explanation when two analyzers disagree materially." This is helpful directionally but does not define (a) how overlap is detected (by finding title? by evidence file path?), (b) what "materially disagree" means (different Concern level? different Value?), or (c) how the explanation is surfaced in the final artifact. For FR7 (optional fan-out), the spec requires "Synthesis/merge policy deduplicates overlapping findings and normalizes final scores" (spec line 104).
  - Fix: Add concrete overlap detection criteria (e.g. "findings targeting the same file path or module with the same category are considered overlapping"), define the threshold for material disagreement (e.g. "Concern levels differ by 2+ tiers"), and specify where the merge explanation appears in the artifact (e.g. "as a note in the finding's evidence list").

### Minor

- **`RepoReviewAnalyzeSummary.clarificationChannel` leaks internal detail** (`design.md:314`)
  - Issue: The response interface includes `clarificationChannel` which describes an internal implementation choice (which tool was used for user prompting). This is not meaningful to the end user and is not required by any spec requirement. It clutters the summary output.
  - Suggestion: Move `clarificationChannel` to internal logging (already covered at line 390) rather than the user-facing response summary.

- **Component diagram is text-only and linear** (`design.md:39-51`)
  - Issue: The component diagram is a simple linear flow chart. It does not show the optional fan-out path or the relationship between the Clarification Interaction Adapter and the Scope/Target Resolver (both are invoked by the Orchestrator but at different stages). For a design artifact, this is a missed opportunity to show branching flows.
  - Suggestion: Add a note or alternative path in the diagram showing the fan-out branch (e.g. `-> Dimension Analysis -> [baseline: sequential] OR [fan-out: parallel workers] -> Synthesis Engine`).

- **Open questions are identical to spec open questions** (`design.md:487-491`)
  - Issue: All four open questions in the design are carried forward verbatim from the spec (spec lines 216-219). The design phase should either resolve these questions or add design-specific open questions (e.g. "Should the output mode resolver be a bash script or a TypeScript utility?", "Should fan-out use Task tool or Bash background processes?").
  - Suggestion: Either resolve the spec-level open questions with design decisions or add design-level questions that reflect implementation trade-offs discovered during the design process.

- **`output` field in `RepoReviewAnalyzeArgs` overlaps with `mode`** (`design.md:300`)
  - Issue: The args interface has both `mode?: 'auto' | 'tracked' | 'local' | 'inline'` and `output?: string`. The relationship between these is not documented. If `output` is a custom path, does it override `mode`? The peer script `resolve-review-output.sh` handles this by checking `--output` first (line 71-77), but the design does not state this precedence.
  - Suggestion: Add a note to the API Design section clarifying precedence: "If `output` is provided, it overrides `mode` and the artifact is written to the specified path directly."

## Requirements/Design Alignment

**Evidence sources used:** spec.md (primary), discovery.md (upstream context), design.md (artifact under review), oat-review-provide SKILL.md and resolve-review-output.sh (peer pattern verification), oat-agent-instructions-analyze SKILL.md (peer pattern verification)

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| FR1 | covered | ScopeMode type, target validation in AnalysisRunMetadata, error handling for invalid scope/target (line 319) |
| FR2 | covered | AnalysisRunMetadata frontmatter + required sections in Artifact Renderer. Concrete section list not enumerated but referenced from discovery contract. |
| FR3 | covered | RepoReviewFinding schema with all four scoring fields and approved vocab types (lines 236-264) |
| FR4 | partial | Six dimensions listed in Dimension Analyzers component, but FindingCategory enum has 7 entries that miss "Maintainability" (Critical finding above) |
| FR5 | covered | Output Policy Resolver with all four modes, inline no-file behavior, auto preference logic (lines 146-162) |
| FR6 | covered | PrioritizedExecutionPlan with quickWins/strategicInitiatives and now/next/later (lines 277-284) |
| FR7 | covered | Fan-out mentioned in orchestrator, synthesis engine, and implementation phases. Merge policy partially specified (Important finding above) |
| FR8 | partial | Mentioned in orchestrator responsibilities and Phase 1 tasks, but no concrete argument-hint string defined (Critical finding above) |
| FR9 | covered | Clarification Interaction Adapter with provider-specific channels and plain fallback (lines 113-144) |
| NFR1 | covered | Validation rule requires at least one evidence bullet per finding (line 268), confidence in schema |
| NFR2 | covered | Not explicitly addressed in component design but implied by finding schema fields (whyThisMatters, recommendedAction) |
| NFR3 | partial | Deterministic naming mentioned (line 202) but no concrete path pattern (Important finding above) |
| NFR4 | covered | Single-agent baseline as default, fan-out optional, no provider-specific hard dependencies |

### Extra Work (not in declared requirements)

- `AnalysisMode: 'delta'` is designed into the type system and data model but is not a spec requirement. The spec lists it as an open question. This is minor scope creep -- it is fine to leave it in as a type placeholder, but designing it without spec backing adds risk. See Important finding above.

## Verification Commands

These commands verify the design artifact's structure and alignment:

```bash
# Check that all spec requirement IDs appear in the design's testing strategy
grep -c "FR[0-9]" .oat/projects/shared/repo-maintainability-review/design.md

# Verify FindingCategory values in design match required dimensions from spec
grep -A 10 "FindingCategory" .oat/projects/shared/repo-maintainability-review/design.md

# Verify argument-hint presence (should exist after fix)
grep -i "argument-hint" .oat/projects/shared/repo-maintainability-review/design.md

# Cross-check design open questions against spec open questions to verify differentiation
diff <(grep "Should" .oat/projects/shared/repo-maintainability-review/spec.md) <(grep "Should" .oat/projects/shared/repo-maintainability-review/design.md)
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.

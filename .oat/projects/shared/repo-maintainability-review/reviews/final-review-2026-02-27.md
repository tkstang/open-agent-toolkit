---
oat_generated: true
oat_generated_at: 2026-02-27
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/repo-maintainability-review
---

# Code Review: final

**Reviewed:** 2026-02-27
**Scope:** final (9e412920d77fd814ce7c59ee698b39a300c7bd5c..HEAD) covering p01-t01 through p02-t04
**Files reviewed:** 5 (skill implementation files)
**Commits:** 20 (729e045..e2a01e3)

## Summary

The implementation delivers a well-structured skill package that covers the vast majority of spec and design requirements. The resolver script is solid, the SKILL.md orchestration contract is comprehensive, and the reference artifacts define clear schemas. There are no critical gaps -- all P0 requirements are addressed. The most significant findings are an artifact template frontmatter field missing from the design schema (`outputMode`), the SKILL.md lacking explicit guidance on invalid target error handling and actionable prioritization (quick wins vs strategic initiatives), and the resolver script not validating parent directory writability for custom output paths.

## Findings

### Critical

None

### Important

- **Artifact template frontmatter missing `outputMode` field from design schema** (`references/repo-review-artifact-template.md:7-16`)
  - Issue: The design's `AnalysisRunMetadata` interface (design.md:251-259) defines 7 fields including `outputMode: 'auto' | 'tracked' | 'local' | 'inline'`. The artifact template frontmatter only includes 6 fields and omits `outputMode`. The spec says "100% of runs declare scope/mode context in output metadata" (spec.md:193) and "Output metadata captures analysis scope and execution context" (NFR3, spec.md:142). The output mode is part of the execution context and is designed into the metadata schema.
  - Fix: Add `oat_output_mode: auto|tracked|local|inline` to the required frontmatter block in `references/repo-review-artifact-template.md` between `oat_analysis_mode` and `oat_analysis_commit` to match the design schema.
  - Requirement: NFR3

- **SKILL.md lacks explicit invalid-target error handling guidance** (`SKILL.md:17-20, SKILL.md:53`)
  - Issue: FR1 acceptance criteria (spec.md:55) requires "Invalid target handling returns actionable guidance." The design's error handling section (design.md:415-416) lists "invalid args, invalid target path" as user errors, and the security section (design.md:378) specifies "reject targets outside repository boundary." The SKILL.md mentions "target path must be inside repository root" as a prerequisite (line 19) and "validate scope/target" in the process (line 53), but never defines what the skill should do when a target is invalid -- no error message template, no fallback behavior, no actionable guidance format. A skill executor following these instructions would not have clear direction on how to handle a bad target.
  - Fix: Add a subsection under "Process" or "Required-Argument Clarification" that defines invalid-target behavior, e.g.: "If the target path does not exist or is outside the repository root, stop execution and inform the user with: the resolved target path, why it is invalid, and examples of valid targets."
  - Requirement: FR1

- **SKILL.md does not reference quick wins vs strategic initiatives split** (`SKILL.md:57`)
  - Issue: FR6 (spec.md:93-97) requires "Output separates quick wins (smaller scope) from strategic initiatives (larger scope)" and the design's `PrioritizedExecutionPlan` (design.md:316-321) defines explicit `quickWins` (XS/S) and `strategicInitiatives` (M/L/XL) arrays. The artifact template correctly includes "Quick Wins (XS/S)" and "Strategic Initiatives (M/L/XL)" as required sections (template lines 24-25). However, the SKILL.md orchestration instructions never mention quick wins, strategic initiatives, or the Scope-based split. The only prioritization reference is "Synthesize findings into prioritized recommendations" (line 57) which is generic. An agent executing the SKILL.md without reading references would not know to apply the XS/S vs M/L/XL split.
  - Fix: Add explicit guidance in the SKILL.md synthesis or process section instructing the executor to split findings by Scope into quick wins (XS/S) and strategic initiatives (M/L/XL), and to produce a Now/Next/Later execution plan. This can be a brief addition to the existing "Synthesis and Dedupe Rules" section or a new "Prioritization" subsection.
  - Requirement: FR6

### Minor

- **Resolver does not validate parent directory existence for custom output paths** (`scripts/resolve-analysis-output.sh:117-118`)
  - Issue: The design lists "Unwritable destination path" as an error case (design.md:365). When `--output /nonexistent/dir/file.md` is passed, the resolver returns the path without verifying that the parent directory exists or is writable. The peer resolver (`resolve-review-output.sh`) has the same behavior, so this is consistent with project conventions, but it means write failures surface later rather than at resolution time.
  - Suggestion: Consider adding a check for `dirname "$OUTPUT"` existence when the output is a file path, emitting a stderr warning (not a hard failure) if the parent directory does not exist. This would give earlier feedback while preserving the current non-destructive resolver contract.

- **Resolver `is_gitignored` may produce false negatives for non-existent paths** (`scripts/resolve-analysis-output.sh:74-81`)
  - Issue: The `is_gitignored` function calls `git check-ignore -q "$path"`. For paths that do not yet exist on disk, `git check-ignore` may not correctly evaluate gitignore rules in all cases (e.g., directory-only patterns like `dir/`). Since the resolver often checks paths that have not been created yet (e.g., the next available filename), the `output_gitignored` value may not always be accurate.
  - Suggestion: Document this limitation in a code comment, or note that `output_gitignored` is advisory (best-effort) rather than authoritative.

- **Rubric scope definitions are qualitative, not time-based as in discovery** (`references/repo-review-rubric.md:16-21`)
  - Issue: The discovery document (discovery.md:76-80) defines Scope with time estimates (XS = <0.5 day, S = 1-2 days, M = 3-5 days, L = 1-2 weeks, XL = 2+ weeks). The rubric uses qualitative descriptions instead (XS = "Single-file or very small localized change", etc.). While the qualitative descriptions are reasonable and arguably more portable across projects, this is a divergence from the upstream discovery definitions.
  - Suggestion: Either add the time estimates as parenthetical context alongside the qualitative descriptions, or note in the rubric that time estimates are project-dependent and the qualitative descriptions are canonical.

- **`--output` overrides `--mode inline` silently** (`scripts/resolve-analysis-output.sh:114-121`)
  - Issue: When both `--mode inline` and `--output /path/to/file.md` are provided, the resolver silently treats it as a file output because `--output` is checked before `--mode`. The design says `--output` takes precedence (design.md:345), so this behavior is correct by design. However, a user who explicitly requests inline mode and also provides an output path might expect a warning or error since the semantics conflict.
  - Suggestion: Consider emitting a stderr note (not an error) when `--mode inline` is combined with `--output`, e.g.: `"Note: --output overrides --mode inline; artifact will be written to file."` This preserves correctness while improving UX.

## Requirements/Design Alignment

**Evidence sources used:** spec.md (primary), design.md (secondary), discovery.md (upstream context), plan.md (task mapping), implementation.md (outcome verification)

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| FR1 | partial | Scope selection and target validation are in prerequisites and process. Invalid target error handling guidance is missing from SKILL.md (Important finding). |
| FR2 | implemented | Template defines required sections and frontmatter. Missing `outputMode` in frontmatter (Important finding) but otherwise complete. |
| FR3 | implemented | Rubric defines all scoring labels with approved vocab. Template schema includes all four fields. |
| FR4 | implemented | All six dimensions listed in SKILL.md with evidence and confidence rules. |
| FR5 | implemented | Resolver script handles all four modes correctly with `--output` precedence. Inline emits no file. |
| FR6 | partial | Template references Quick Wins and Strategic Initiatives sections. SKILL.md orchestration does not reference the split or Now/Next/Later framing (Important finding). |
| FR7 | implemented | Single-agent baseline default, optional fan-out documented with schema parity requirement. |
| FR8 | implemented | `argument-hint` in frontmatter, clarification flow with blocking semantics, run-options summary contract. |
| FR9 | implemented | Provider-aware clarification with AskUserQuestion, request_user_input, and plain fallback. |
| NFR1 | implemented | Evidence rules require concrete bullets; confidence alignment rules defined. |
| NFR2 | implemented | Rubric actionability rules require specific actions and testable success criteria. |
| NFR3 | partial | Deterministic naming in resolver is correct. Frontmatter metadata missing `outputMode` (Important finding). |
| NFR4 | implemented | Single-agent baseline does not require provider-specific features. Fan-out is optional. |

### Extra Work (not in declared requirements)

None. All implemented code maps directly to spec/design requirements.

## Verification Commands

Run these to verify the implementation:

```bash
# Verify all five skill files exist
test -f .agents/skills/oat-repo-review-analyze/SKILL.md && \
test -f .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh && \
test -f .agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md && \
test -f .agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md && \
test -f .agents/skills/oat-repo-review-analyze/references/dx-checklist.md && \
echo "PASS: all files exist"

# Verify frontmatter contract
rg -n "argument-hint|allowed-tools|disable-model-invocation|user-invocable" .agents/skills/oat-repo-review-analyze/SKILL.md

# Verify all six required dimensions in SKILL.md
rg -n "Architecture|Conventions|Documentation|DX|Testing|Maintainability" .agents/skills/oat-repo-review-analyze/SKILL.md

# Verify resolver handles all modes
bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode tracked
bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode inline
bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode local
bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode auto

# Verify scoring labels in rubric
rg -n "Critical|High|Medium|Low|XS|XL" .agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md

# Verify artifact template has required sections
rg -n "Executive Summary|Scoring Summary|Prioritized Findings|Quick Wins|Strategic Initiatives|Now / Next / Later" .agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md

# Verify provider-aware clarification in SKILL.md
rg -n "AskUserQuestion|request_user_input|plain-language|plain.language" .agents/skills/oat-repo-review-analyze/SKILL.md

# Verify merge/dedupe policy
rg -n "overlap|material disagreement|merge note|dedupe" .agents/skills/oat-repo-review-analyze/SKILL.md .agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.

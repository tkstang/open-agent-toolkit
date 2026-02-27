---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-02-27
oat_generated: false
oat_template: false
oat_template_name: design
---

# Design: repo-maintainability-review

## Overview

This design defines `oat-repo-review-analyze` as an analysis-only workflow skill that produces deterministic, evidence-based maintainability review artifacts. The design preserves OAT conventions around mode resolution, output policy, progress indicators, and artifact quality gates while avoiding implementation-coupled behavior.

The architecture uses a single-agent baseline as the default execution model and introduces optional fan-out/fan-in subagent orchestration for large repositories. The core contract is the artifact schema: consistent sections, normalized scoring, explicit confidence, and actionable recommendations mapped to staged execution. Invocation UX is also explicit: argument expectations are surfaced through `argument-hint`, required arguments are clarified before run start, and resolved run options are printed at execution start.

## Architecture

### System Context

`oat-repo-review-analyze` is a new workflow skill under `.agents/skills/` that composes with existing OAT capabilities. It follows the same operational model as `oat-review-provide` (scope + mode resolution, output policy) and the same structured analysis posture as `oat-agent-instructions-analyze` (explicit process steps, result summary, reproducible artifacts).

Boundaries:
- In scope: repository analysis and artifact generation.
- Out of scope: code patching, refactoring, and external ticketing automation.

**Key Components:**
- `Skill Orchestrator` (`SKILL.md`) - orchestrates scope/mode resolution, evidence collection, synthesis, output.
- `Output Policy Resolver` (`resolve-analysis-output.sh`) - resolves `auto|tracked|local|inline` behavior.
- `Clarification Interaction Adapter` - selects provider-native question tooling when available.
- `Dimension Analyzers` - architecture, conventions, docs/onboarding, DX, testing/reliability, maintainability risk.
- `Synthesis Engine` - dedupe, normalize scoring, prioritize actions.
- `Artifact Renderer` - applies standard template/rubric/checklist and emits final output.

### Component Diagram

```text
User Invocation
  -> Skill Orchestrator
     -> Scope/Target Resolver
     -> Clarification Interaction Adapter
     -> Output Policy Resolver
     -> Evidence Collection
     -> Dimension Analysis
        -> (optional) parallel fan-out workers
     -> Synthesis Engine
     -> Artifact Renderer
  -> Summary + artifact path (or inline output)
```

### Data Flow

```text
Input args + repo context
  -> RunConfig {scope,target,mode,focus,analysisMode}
  -> EvidenceSet {files,signals,notes}
  -> FindingSet {category,concern,value,scope,confidence,evidence,...}
  -> PrioritizedPlan {quickWins,strategicInitiatives,nowNextLater}
  -> FinalArtifact (tracked/local file OR inline response)
```

## Component Design

### Skill Orchestrator

**Purpose:** Single control plane for analysis execution.

**Responsibilities:**
- Parse and validate run arguments.
- Enforce clear invocation contracts (`argument-hint`, required-argument clarification).
- Resolve execution mode and output destination.
- Print resolved run options before analysis starts.
- Execute all required dimensions in baseline mode.
- Optionally activate fan-out workflow for large repos.
- Produce a final summary with counts and destination.

**Interfaces:**
```typescript
type ScopeMode = 'repo' | 'directory';
type OutputMode = 'auto' | 'tracked' | 'local' | 'inline';
type AnalysisMode = 'full' | 'delta';

interface RepoReviewRunConfig {
  scope: ScopeMode;
  target: string;
  mode: OutputMode;
  analysisMode: AnalysisMode;
  focusAreas?: string[];
  useFanOut?: boolean;
}

interface RunOptionsSummary {
  scope: ScopeMode;
  target: string;
  mode: OutputMode;
  analysisMode: AnalysisMode;
  useFanOut: boolean;
  focusAreas: string[];
}
```

**Dependencies:**
- `resolve-analysis-output.sh`
- skill-local references for artifact/rubric/dx-checklist
- repository scanning and file context access

**Design Decisions:**
- Keep orchestration declarative in skill instructions for portability.
- Enforce mandatory dimensions regardless of focus-area hints.

### Clarification Interaction Adapter

**Purpose:** Route clarification prompts through provider-native structured question tools when available.

**Responsibilities:**
- Select the best clarification channel for the active provider/runtime.
- Use `AskUserQuestion` for Claude Code execution when available.
- Use `request_user_input` for Codex execution when available.
- Fall back to explicit plain-language clarification prompts when structured tools are unavailable.
- Block execution until required clarifications are resolved.

**Interfaces:**
```typescript
type ClarificationChannel = 'ask_user_question' | 'request_user_input' | 'plain_prompt';

interface ClarificationRequest {
  id: string;
  question: string;
  required: boolean;
  choices?: string[];
}

interface ClarificationResponse {
  id: string;
  answer: string;
  channel: ClarificationChannel;
}
```

**Design Decisions:**
- Channel choice is provider-aware but behaviorally equivalent for correctness.
- Fallback channel must preserve blocking confirmation semantics.

### Output Policy Resolver

**Purpose:** Deterministically resolve where output should be written.

**Responsibilities:**
- Validate mode and path constraints.
- Determine tracked/local destination in `auto` mode.
- Return `inline-only` behavior when requested.

**Interfaces:**
```bash
bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode auto
```

**Design Decisions:**
- Mirror `oat-review-provide` destination behavior to reduce user surprise.
- Surface explicit errors for invalid combinations.

### Dimension Analyzers

**Purpose:** Produce structured findings per required dimension.

**Responsibilities:**
- Apply dimension-specific checks.
- Emit findings with full scoring and evidence fields.
- Track empty-result explanations when no meaningful issues are found.

**Design Decisions:**
- Keep analyzer outputs schema-compatible to simplify synthesis.
- Include DX checks as required, never optional.

### Synthesis Engine

**Purpose:** Merge per-dimension outputs into one actionable result.

**Responsibilities:**
- Deduplicate overlapping findings.
- Normalize score labels and confidence treatment.
- Prioritize by Concern/Value and split by Scope buckets.
- Build Now/Next/Later execution plan.

**Design Decisions:**
- Preserve strongest Concern when overlap exists; merge evidence lists.
- Require explanation when two analyzers disagree materially.

### Artifact Renderer

**Purpose:** Produce deterministic markdown output.

**Responsibilities:**
- Apply required frontmatter fields.
- Render required top-level sections and finding schema.
- Format final summary and metadata.

**Design Decisions:**
- Standard section order for comparability across runs.
- Deterministic naming for tracked artifacts by date + scope slug.

## Data Models

### AnalysisRunMetadata

**Purpose:** Trace analysis execution context.

**Schema:**
```typescript
interface AnalysisRunMetadata {
  generatedAt: string; // YYYY-MM-DD
  analysisType: 'repo-review';
  analysisScope: 'repo' | 'directory';
  analysisTarget: string;
  analysisMode: 'full' | 'delta';
  analysisCommit: string;
  outputMode: 'auto' | 'tracked' | 'local' | 'inline';
}
```

**Validation Rules:**
- `analysisTarget` must be `.` for repo scope or validated relative directory for directory scope.
- `analysisCommit` must resolve to a local commit hash.

**Storage:**
- Markdown frontmatter in output artifact (if not inline).

### RepoReviewFinding

**Purpose:** Canonical finding representation.

**Schema:**
```typescript
type Concern = 'Critical' | 'High' | 'Medium' | 'Low';
type Value = 'High' | 'Medium' | 'Low';
type Scope = 'XS' | 'S' | 'M' | 'L' | 'XL';
type Confidence = 'High' | 'Medium' | 'Low';

type FindingCategory =
  | 'Organization'
  | 'Conventions'
  | 'Documentation'
  | 'DX'
  | 'Architecture'
  | 'Testing'
  | 'Reliability';

interface RepoReviewFinding {
  id: string;
  title: string;
  category: FindingCategory;
  concern: Concern;
  value: Value;
  scope: Scope;
  confidence: Confidence;
  evidence: string[];
  whyThisMatters: string[];
  recommendedAction: string[];
  suggestedOwner: string;
  dependencies: string[];
  successCriteria: string[];
}
```

**Validation Rules:**
- At least one evidence bullet per finding.
- Score fields must use approved vocab.
- Success criteria must be specific and testable.

### PrioritizedExecutionPlan

**Purpose:** Stage recommended actions for execution.

**Schema:**
```typescript
interface PrioritizedExecutionPlan {
  quickWins: string[]; // XS/S
  strategicInitiatives: string[]; // M/L/XL
  now: string[];
  next: string[];
  later: string[];
}
```

## API Design

### Invocation Contract

**Method:** Skill invocation via arguments
**Path:** N/A (CLI skill execution)

**Request:**
```typescript
interface RepoReviewAnalyzeArgs {
  scope?: 'repo' | 'directory';
  target?: string;
  mode?: 'auto' | 'tracked' | 'local' | 'inline';
  output?: string;
  focus?: string; // comma-separated areas
  analysisMode?: 'full' | 'delta';
}
```

**Response:**
```typescript
interface RepoReviewAnalyzeSummary {
  filesReviewed: number;
  findingsByConcern: Record<string, number>;
  findingsByValue: Record<string, number>;
  artifactPath: string | 'inline-only';
  executionMode: 'single-agent' | 'fan-out';
  clarificationChannel: 'ask_user_question' | 'request_user_input' | 'plain_prompt';
}
```

**Error Handling:**
- Invalid scope/target combination
- Missing or ambiguous required arguments (must trigger clarification prompt)
- Structured question tool unavailable for provider/runtime (must fall back without skipping clarification)
- Unsupported output mode
- Unwritable destination path
- Missing required evidence fields in synthesized output

**Authorization:**
- Local repository access only; no remote auth flows.

## Security Considerations

### Authentication

No external authentication; local process context only.

### Authorization

Analysis limited to repository files. Directory targets are validated to prevent escaping repo root.

### Data Protection

- **Encryption:** Not applicable for local markdown artifacts.
- **PII Handling:** Artifacts should avoid copying sensitive content verbatim; summarize evidence where possible.
- **Input Validation:** Strict validation for scope/target/mode arguments and output paths.

### Threat Mitigation

- **Path traversal risk:** reject targets outside repository boundary.
- **Unsafe shell behavior:** helper scripts use strict shell mode and quoted variables.
- **Destructive action risk:** no mutation commands included in analysis workflow.

## Performance Considerations

### Scalability

Default single-agent mode for correctness and portability. Optional fan-out can parallelize large-repo analysis by dimension.

### Caching

No persistent cache in v1. Each run is independently computed.

### Database Optimization

Not applicable; no database usage.

### Resource Limits

- **Memory:** bounded by evidence collection strategy and result set size.
- **CPU:** proportional to repository size and dimension checks.
- **Network:** none required for core behavior.

## Error Handling

### Error Categories

- **User Errors:** invalid args, invalid target path, unsupported mode.
- **Invocation Errors:** missing/ambiguous required args prior to run start.
- **Clarification Channel Errors:** provider-native question tool unavailable in current runtime.
- **System Errors:** unreadable files, write failures.
- **Schema Errors:** synthesized output missing required finding fields.

### Retry Logic

- Retry once for transient filesystem write checks.
- No retry for invalid user input; fail with corrective guidance.

### Logging

- **Info:** resolved scope, mode, output policy.
- **Info:** startup options banner with resolved scope/target/mode/analysisMode/fan-out state.
- **Info:** selected clarification channel (`AskUserQuestion`, `request_user_input`, or plain prompt).
- **Warn:** fallback behavior (for example tracked -> local fallback in auto mode).
- **Error:** hard failures with reason and corrective action.

## Testing Strategy

### Requirement-to-Test Mapping

| ID | Verification | Key Scenarios |
|----|--------------|---------------|
| FR1 | manual | repo scope path, directory scope path, invalid target rejection |
| FR2 | manual | artifact contains required sections and frontmatter fields |
| FR3 | manual | findings include Concern/Value/Scope/Confidence with allowed labels |
| FR4 | manual | artifact contains coverage for all required dimensions including DX |
| FR5 | unit + manual | mode resolution behavior for auto/tracked/local/inline and inline no-file behavior |
| FR6 | manual | quick wins vs strategic initiatives split and Now/Next/Later population |
| FR7 | manual | optional fan-out produces deterministic merged findings and same schema as baseline |
| FR8 | manual | argument-hint present, missing/ambiguous required args trigger clarification, startup options summary printed |
| FR9 | manual | provider-aware question-tool selection (`AskUserQuestion`/`request_user_input`) with plain fallback |
| NFR1 | manual | each finding includes evidence bullets and confidence consistent with evidence depth |
| NFR2 | manual | wording is constructive and recommendations are actionable |
| NFR3 | manual | tracked artifact naming and metadata traceability checks |
| NFR4 | manual | single-agent run succeeds without provider-specific subagent features |

### Unit Tests

- **Scope:** output mode resolver logic, label validation helpers, merge conflict normalization rules.
- **Coverage Target:** core branching behavior for resolver and synthesis utilities.
- **Key Test Cases:**
  - auto mode chooses tracked when eligible.
  - auto mode falls back to local when tracked unavailable.
  - merge strategy keeps strongest Concern and merges evidence.
  - startup options summary renders resolved run config consistently.
  - clarification channel selection prefers provider-native tools when available.

### Integration Tests

- **Scope:** end-to-end skill dry-runs against representative repositories.
- **Test Environment:** local OAT repo with tracked/local destinations and optional inline mode.
- **Key Test Cases:**
  - repo scope produces complete artifact.
  - directory scope constrained output.
  - missing/ambiguous required args block execution until clarified.
  - Claude runtime uses `AskUserQuestion` when available.
  - Codex runtime uses `request_user_input` when available.
  - unavailability of structured question tools triggers plain-prompt fallback.
  - optional fan-out and baseline outputs both satisfy schema contract.

### End-to-End Tests

- **Scope:** user-level invocation through skill command flow.
- **Scenarios:**
  - default single-agent repo run.
  - directory-focused targeted run.
  - inline-only output run.

## Deployment Strategy

### Build Process

- Keep skill assets in `.agents/skills/oat-repo-review-analyze/`.
- Validate via repository checks: lint/type-check/tests as appropriate for touched code/scripts.
- Refresh provider views with `oat sync --scope all --apply` when needed.

### Deployment Steps

1. Add skill spec, references, and resolver script.
2. Validate content and script behavior locally.
3. Sync provider mirrors and run repo checks.
4. Document usage and rollout notes.

### Rollback Plan

- Revert skill directory changes.
- Remove synced provider copies if rollback includes distribution reversal.
- Keep prior analysis artifacts as historical records.

### Configuration

- **Environment Variables:** optional OAT environment variables only (for project roots and runtime behavior).
- **Feature Flags:** none required for baseline mode.

### Monitoring

- Monitor artifact quality through review sampling.
- Track failure reasons by mode/scope category.
- Track usage split between single-agent and fan-out runs.

## Migration Plan

No data or database migrations required.

Potential compatibility adjustments:
- If naming schema changes later, support legacy artifact discovery patterns.
- If default analysis mode changes (full vs delta), keep explicit mode override for backward compatibility.

## Open Questions

- Should delta mode be default once tracking primitives are stable?
- Should numeric scoring be introduced beside label scoring?
- Should there be a dedicated follow-up skill to convert findings to implementation plans?
- Should category-specific templates be introduced for different repo archetypes?

## Implementation Phases

### Phase 1: Baseline Skill Foundation

**Goal:** Establish deterministic single-agent analysis workflow and artifact contract.

**Tasks:**
- Define orchestrator workflow and required dimensions.
- Define and document invocation arguments with `argument-hint`.
- Add required-argument clarification flow for ambiguous/missing inputs.
- Add provider-aware clarification tooling (`AskUserQuestion` / `request_user_input`) with plain fallback.
- Add startup options summary output.
- Add artifact template, rubric, and DX checklist.
- Implement output mode resolver script.

**Verification:**
- Baseline run produces schema-complete artifact in tracked/local/inline modes.

### Phase 2: Synthesis Quality and Optional Fan-Out

**Goal:** Add deterministic prioritization quality and optional fan-out support.

**Tasks:**
- Implement dedupe and score normalization policy.
- Add optional fan-out guidance and merge policy.
- Validate parity between baseline and fan-out artifact schema.

**Verification:**
- Optional fan-out produces stable merged output and preserves schema requirements.

### Phase 3: Hardening and Rollout Validation

**Goal:** Validate across repo archetypes and tighten guidance based on findings quality.

**Tasks:**
- Pilot runs across multiple repository types.
- Calibrate rubric language and confidence guidance.
- Document known limitations and recommended usage patterns.

**Verification:**
- Pilot outputs pass quality checklist and are actionable without additional prompting.

## Dependencies

### External Dependencies

None required beyond local toolchain and repository filesystem.

### Internal Dependencies

- Existing OAT skill conventions and templates.
- Existing output mode policy patterns.
- Knowledge artifacts used for contextual alignment.

### Development Dependencies

- Node.js, pnpm, and existing CLI/test tooling in repo.

## Risks and Mitigation

- **Schema Rigidity Risk:** Medium | Medium
  - **Mitigation:** Keep required core fields stable and allow extensible optional fields.
  - **Contingency:** version rubric and template guidance without breaking core contract.

- **Fan-Out Synthesis Drift Risk:** Medium | High
  - **Mitigation:** codify deterministic merge rules and require evidence merge notes.
  - **Contingency:** disable fan-out for unstable scenarios; run baseline mode.

- **Provider Portability Risk:** Medium | Medium
  - **Mitigation:** keep baseline behavior provider-agnostic and treat fan-out as optional.
  - **Contingency:** document provider-specific fallbacks.

- **Context Staleness Risk:** High | Medium
  - **Mitigation:** prefer direct repository evidence over stale knowledge summaries.
  - **Contingency:** refresh knowledge index before broad pilot runs.

## References

- Specification: `spec.md`
- Discovery: `discovery.md`
- Knowledge Base: `.oat/repo/knowledge/project-index.md`
- Architecture Docs: `.oat/repo/knowledge/architecture.md`
- Conventions: `.oat/repo/knowledge/conventions.md`
- Testing: `.oat/repo/knowledge/testing.md`

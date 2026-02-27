---
name: oat-repo-review-analyze
version: 1.0.0
description: Use when you need a structured maintainability analysis for a repository or directory target with actionable findings.
argument-hint: "[--scope repo|directory] [--target <path>] [--mode auto|tracked|local|inline] [--output <path>] [--focus <areas>] [--analysis-mode full] [--fan-out]"
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Write, Bash, Glob, Grep, AskUserQuestion
---

# Repo Review Analysis

Analyze repository maintainability and developer experience using a deterministic rubric and output contract.

## Prerequisites

- Active git repository with readable source files.
- Scope resolved as `repo` or `directory`.
- When using `directory`, target path must be inside repository root.

## Mode Assertion

**OAT MODE: Repo Review Analysis**

**Purpose:** Produce evidence-backed maintainability findings and a prioritized execution plan.

**BLOCKED Activities:**
- No code modification tasks.
- No issue/ticket automation.

**ALLOWED Activities:**
- Repository evidence collection.
- Structured scoring and synthesis.
- Artifact generation in tracked/local/inline modes.

## Progress Indicators

- Print a phase banner once at start:
  - `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  - ` OAT ▸ REPO REVIEW ANALYZE`
  - `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
- Print step indicators before major work:
  - `[1/5] Resolving scope, arguments, and output policy...`
  - `[2/5] Collecting repository evidence...`
  - `[3/5] Running dimension analysis (single-agent or fan-out)...`
  - `[4/5] Synthesizing findings and scoring...`
  - `[5/5] Rendering artifact and summary...`
- For long-running fan-out or large scans, print start + completion lines.
- Print a resolved run-options summary before evidence collection begins.

## Process

1. Resolve invocation args and validate scope/target.
2. Resolve missing/ambiguous required args using provider-aware clarification.
3. Resolve output policy.
4. Gather evidence across required dimensions.
5. Synthesize findings into prioritized recommendations.
6. Render artifact or return inline output.

### Output Policy Resolution

Use the helper script to resolve destination policy:

```bash
bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode auto
```

Rules:
- `--output` takes precedence over mode-derived destination.
- `inline` emits no file artifact.
- Tracked naming contract: `.oat/repo/analysis/<YYYY-MM-DD>-repo-review-analysis.md`.
- If the same-day filename already exists, append `-2`, `-3`, etc.

### Required Analysis Dimensions

Every run must cover all required dimensions:

- `Architecture` - module boundaries, coupling, and system organization.
- `Conventions` - coding patterns, consistency, and repository standards.
- `Documentation` - onboarding quality, runbooks, and operational docs.
- `DX` - developer workflows, tooling friction, and feedback loops.
- `Testing` - test strategy depth, reliability signals, and failure clarity.
- `Maintainability` - ownership clarity, change safety, and delivery risk.

### Evidence and Confidence Rules

- Every finding must include at least one concrete evidence bullet.
- Evidence should reference specific files, commands, or repository structures.
- Confidence must align with evidence depth:
  - `High` when multiple strong signals agree.
  - `Medium` when evidence is sufficient but incomplete.
  - `Low` when evidence is directional and requires validation.
- If no issue is found for a dimension, provide a concise "no critical issues observed" note with supporting context.

### Required-Argument Clarification

- Required arguments must be resolved before analysis starts.
- Clarification channel priority:
  1. Use `AskUserQuestion` when running in Claude with tool availability.
  2. Use `request_user_input` when running in Codex with tool availability.
  3. Fall back to direct plain-language prompts when structured tools are unavailable.
- Clarification remains blocking in all modes: do not continue until answers are explicit.
- After clarification, print run options:
  - `scope`
  - `target`
  - `mode`
  - `analysis-mode`
  - `fan-out` state
  - `focus` selection (or `none`)

## Success Criteria

- Output includes required sections and metadata.
- Findings include scoring fields and evidence.
- Result includes now/next/later execution guidance.
- Required arguments are explicitly resolved before analysis execution.

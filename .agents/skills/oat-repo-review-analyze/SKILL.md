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

Progress indicators are defined in later tasks.

## Process

1. Resolve invocation args and validate scope/target.
2. Resolve output policy.
3. Gather evidence across required dimensions.
4. Synthesize findings into prioritized recommendations.
5. Render artifact or return inline output.

## Success Criteria

- Output includes required sections and metadata.
- Findings include scoring fields and evidence.
- Result includes now/next/later execution guidance.

---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-02-27
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ["p02"]
oat_plan_source: spec-driven
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: repo-maintainability-review

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel).

**Goal:** Implement `oat-repo-review-analyze` with the updated design contracts for argument clarity, provider-aware user questions, deterministic outputs, and maintainability-focused analysis synthesis.

**Architecture:** Create a skill package (`SKILL.md` + references + resolver script) with single-agent baseline analysis and optional fan-out guidance, then validate the artifact contract and merge rules.

**Tech Stack:** Markdown skill specs, Bash helper script, OAT workflow conventions, pnpm workspace tooling.

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user (carried forward: `p01`, `p02`, `final`)
- [x] Set `oat_plan_hill_phases` in frontmatter
- [x] Preserved existing `## Reviews` rows and statuses
- [x] Updated `spec.md` Requirement Index Planned Tasks mappings

---

## Phase 1: Skill Contract and Output Policy

### Task p01-t01: Scaffold Skill Package Files

**Files:**
- Create: `.agents/skills/oat-repo-review-analyze/SKILL.md`
- Create: `.agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh`
- Create: `.agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md`
- Create: `.agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md`
- Create: `.agents/skills/oat-repo-review-analyze/references/dx-checklist.md`

**Step 1: Write test (RED)**
- Run: `test -f .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: command fails before scaffold exists.

**Step 2: Implement (GREEN)**
- Create the full directory structure and placeholder files with section headers only.

**Step 3: Refactor**
- Ensure file names and paths follow OAT conventions and are one-level reference friendly.

**Step 4: Verify**
- Run: `test -f .agents/skills/oat-repo-review-analyze/SKILL.md && test -f .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh && test -f .agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md`
- Expected: all scaffold files exist.

**Step 5: Commit**
```bash
git add .agents/skills/oat-repo-review-analyze
git commit -m "feat(p01-t01): scaffold repo review analyze skill package"
```

---

### Task p01-t02: Encode Frontmatter and Invocation Contract

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/SKILL.md`

**Step 1: Write test (RED)**
- Run: `rg -n "argument-hint|allowed-tools|disable-model-invocation|user-invocable" .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: required contract entries are missing/incomplete.

**Step 2: Implement (GREEN)**
- Add frontmatter fields from design:
  - `disable-model-invocation: true`
  - `user-invocable: true`
  - `allowed-tools: Read, Write, Bash, Glob, Grep, AskUserQuestion`
  - `argument-hint` with `scope`, `target`, `mode`, `output`, `focus`, `analysis-mode`, `fan-out`
- Add mode assertion and prerequisite checks for spec-driven planning context.

**Step 3: Refactor**
- Align wording to existing OAT skill style and keep description routing-focused.

**Step 4: Verify**
- Run: `rg -n "allowed-tools: Read, Write, Bash, Glob, Grep, AskUserQuestion|argument-hint: \"\[--scope repo\|directory\]" .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: exact contract lines found.

**Step 5: Commit**
```bash
git add .agents/skills/oat-repo-review-analyze/SKILL.md
git commit -m "feat(p01-t02): add skill frontmatter argument contract"
```

---

### Task p01-t03: Add Clarification and Progress Interaction Flow

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/SKILL.md`

**Step 1: Write test (RED)**
- Run: `rg -n "AskUserQuestion|request_user_input|fallback|resolved run options|\[1/[0-9]+\]" .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: provider-aware clarification and progress conventions are incomplete.

**Step 2: Implement (GREEN)**
- Add explicit clarification flow:
  - prefer `AskUserQuestion` (Claude)
  - use `request_user_input` (Codex) when available
  - fallback to explicit plain-language prompt
- Require blocking clarification for missing/ambiguous required args.
- Add progress banner + step indicators and run-options summary print requirement.

**Step 3: Refactor**
- Keep prompts concise and deterministic; remove duplicate guidance.

**Step 4: Verify**
- Run: `rg -n "AskUserQuestion|request_user_input|plain-language clarification|OAT ▸ REPO REVIEW ANALYZE|resolved run options" .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: all interaction requirements present.

**Step 5: Commit**
```bash
git add .agents/skills/oat-repo-review-analyze/SKILL.md
git commit -m "feat(p01-t03): add provider-aware clarification and progress flow"
```

---

### Task p01-t04: Implement Output Resolver Behavior and Path Rules

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh`
- Modify: `.agents/skills/oat-repo-review-analyze/SKILL.md`

**Step 1: Write test (RED)**
- Run: `bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode auto`
- Expected: failure or missing behavior before implementation.

**Step 2: Implement (GREEN)**
- Implement `auto|tracked|local|inline` output resolution.
- Implement precedence: `--output` overrides mode-derived destination.
- Implement tracked naming contract: `.oat/repo/analysis/<YYYY-MM-DD>-repo-review-analysis.md` with same-day suffix (`-2`, `-3`, ...).
- Emit clear stderr errors for invalid mode/path combinations.

**Step 3: Refactor**
- Use strict shell mode and quoted variables; keep stdout machine-readable.

**Step 4: Verify**
- Run: `bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode tracked`
- Run: `bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode inline`
- Run: `bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode local --output ./tmp/review.md`
- Expected: each run returns deterministic mode/path semantics and no silent fallback.

**Step 5: Commit**
```bash
git add .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh .agents/skills/oat-repo-review-analyze/SKILL.md
git commit -m "feat(p01-t04): implement deterministic analysis output resolver"
```

---

### Task p01-t05: Author Artifact Template and Rubric Contracts

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md`
- Modify: `.agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md`
- Modify: `.agents/skills/oat-repo-review-analyze/references/dx-checklist.md`

**Step 1: Write test (RED)**
- Run: `rg -n "Executive Summary|Scoring Summary|Prioritized Findings|Quick Wins|Strategic Initiatives|Now / Next / Later|oat_analysis_type" .agents/skills/oat-repo-review-analyze/references/*.md`
- Expected: required section/schema markers missing before content is authored.

**Step 2: Implement (GREEN)**
- Define required frontmatter and top-level section layout.
- Define finding schema and labels (`Concern`, `Value`, `Scope`, `Confidence`).
- Encode required category mapping including `Maintainability` and `Testing` (with reliability checks).

**Step 3: Refactor**
- Normalize terminology with design and spec vocabulary.

**Step 4: Verify**
- Run: `rg -n "Maintainability|Testing|Confidence|recommendedAction|successCriteria" .agents/skills/oat-repo-review-analyze/references/*.md`
- Expected: schema and category mappings are explicit.

**Step 5: Commit**
```bash
git add .agents/skills/oat-repo-review-analyze/references
git commit -m "feat(p01-t05): finalize repo review artifact and rubric contracts"
```

---

## Phase 2: Synthesis, Fan-Out Guidance, and Hardening

### Task p02-t01: Define Dimension Analysis Workflow in SKILL.md

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/SKILL.md`

**Step 1: Write test (RED)**
- Run: `rg -n "Architecture|Conventions|Documentation|DX|Testing|Maintainability" .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: one or more required analysis dimensions missing.

**Step 2: Implement (GREEN)**
- Add explicit workflow for each required dimension.
- Require concrete evidence bullets and confidence rationale per finding.

**Step 3: Refactor**
- Deduplicate overlapping guidance between skill body and references.

**Step 4: Verify**
- Run: `rg -n "evidence|confidence|Architecture|Maintainability" .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: all required dimensions and evidence constraints present.

**Step 5: Commit**
```bash
git add .agents/skills/oat-repo-review-analyze/SKILL.md
git commit -m "feat(p02-t01): define required analysis dimensions and evidence rules"
```

---

### Task p02-t02: Codify Deterministic Synthesis Merge Policy

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/SKILL.md`
- Modify: `.agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md`

**Step 1: Write test (RED)**
- Run: `rg -n "overlap|material disagreement|Concern|merge note|dedupe" .agents/skills/oat-repo-review-analyze/SKILL.md .agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md`
- Expected: threshold and overlap rules incomplete.

**Step 2: Implement (GREEN)**
- Add overlap detection key (`category` + normalized path token + equivalent title intent).
- Add disagreement threshold (Concern or Value differs by 2+ tiers).
- Require merge-note evidence when threshold is crossed.

**Step 3: Refactor**
- Keep rubric and skill wording aligned with identical rule names.

**Step 4: Verify**
- Run: `rg -n "2\+|Critical > High > Medium > Low|merge note" .agents/skills/oat-repo-review-analyze/SKILL.md .agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md`
- Expected: deterministic merge policy documented end-to-end.

**Step 5: Commit**
```bash
git add .agents/skills/oat-repo-review-analyze/SKILL.md .agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md
git commit -m "feat(p02-t02): codify deterministic synthesis merge policy"
```

---

### Task p02-t03: Add Optional Fan-Out Path with Baseline Parity Guardrails

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/SKILL.md`

**Step 1: Write test (RED)**
- Run: `rg -n "single-agent baseline|optional fan-out|parallel|schema parity" .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: fan-out parity requirements incomplete.

**Step 2: Implement (GREEN)**
- Define default single-agent flow.
- Define optional fan-out execution hints and merge-back requirements.
- Require final output schema parity between baseline and fan-out runs.

**Step 3: Refactor**
- Keep fan-out path explicitly optional; avoid mandatory provider-specific dependencies.

**Step 4: Verify**
- Run: `rg -n "single-agent|fan-out|parity|same schema" .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: optional fan-out behavior and parity rules are explicit.

**Step 5: Commit**
```bash
git add .agents/skills/oat-repo-review-analyze/SKILL.md
git commit -m "feat(p02-t03): document optional fan-out with schema parity guardrails"
```

---

### Task p02-t04: Finalize Summary Output and Verification Runbook

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/SKILL.md`
- Modify: `.agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md`
- Modify: `.agents/skills/oat-repo-review-analyze/references/dx-checklist.md`

**Step 1: Write test (RED)**
- Run: `rg -n "findings by Concern|findings by Value|artifact path|verification commands|clarification channel" .agents/skills/oat-repo-review-analyze/SKILL.md .agents/skills/oat-repo-review-analyze/references/*.md`
- Expected: final summary or verification checklist fields incomplete.

**Step 2: Implement (GREEN)**
- Require completion summary with counts by Concern/Value and resolved artifact destination.
- Keep clarification channel in internal logging guidance, not user-facing summary schema.
- Add end-to-end verification checklist for repo scope, directory scope, and inline mode.

**Step 3: Refactor**
- Ensure completion summary language remains concise and action-oriented.

**Step 4: Verify**
- Run: `rg -n "Concern|Value|artifact path|inline|directory scope|internal logging" .agents/skills/oat-repo-review-analyze/SKILL.md .agents/skills/oat-repo-review-analyze/references/*.md`
- Expected: summary and validation runbook are complete.

**Step 5: Commit**
```bash
git add .agents/skills/oat-repo-review-analyze/SKILL.md .agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md .agents/skills/oat-repo-review-analyze/references/dx-checklist.md
git commit -m "feat(p02-t04): finalize summary contract and verification runbook"
```

---

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| p01 | code | pending | - | - |
| p02 | code | pending | - | - |
| final | code | pending | - | - |
| spec | artifact | pending | - | - |
| design | artifact | fixes_completed | 2026-02-27 | reviews/artifact-design-review-2026-02-27.md |

**Status values:** `pending` -> `received` -> `fixes_added` -> `fixes_completed` -> `passed`

---

## Implementation Complete

**Summary:**
- Phase 1: 5 tasks - scaffold skill package, encode invocation contract, add clarification/progress flow, implement output resolver, and finalize artifact references.
- Phase 2: 4 tasks - define dimension workflow, codify synthesis merge policy, add optional fan-out parity guidance, and finalize summary/verification runbook.

**Total: 9 tasks**

Ready for execution via `oat-project-implement`.

---

## References

- Discovery: `discovery.md`
- Specification: `spec.md`
- Design: `design.md`
- Design review artifact: `reviews/artifact-design-review-2026-02-27.md`
- Plan format contract: `.agents/skills/oat-project-plan-writing/SKILL.md`

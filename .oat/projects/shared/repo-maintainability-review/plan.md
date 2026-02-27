---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-02-27
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ["p01", "p02", "final"]
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: repo-maintainability-review

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel).

**Goal:** Implement `oat-repo-review-analyze` from the idea in `.oat/ideas/repo-analyze-skill` with reusable scoring and output conventions.

**Architecture:** Add a new skill package with references and helper scripts; reuse existing OAT patterns for progress indicators, output mode resolution, and artifact generation.

**Tech Stack:** Markdown skill specs, shell helper scripts, OAT CLI workflows, pnpm workspace tooling.

## Planning Checklist

- [x] Confirmed quick-mode workflow
- [x] Set `oat_plan_hill_phases` in frontmatter
- [x] Bound scope to skill implementation (no downstream application workflow)

---

## Phase 1: Skill Scaffold and Output Policy

### Task p01-t01: Scaffold `oat-repo-review-analyze` Skill Package

**Files:**
- Create: `.agents/skills/oat-repo-review-analyze/SKILL.md`
- Create: `.agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md`
- Create: `.agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md`
- Create: `.agents/skills/oat-repo-review-analyze/references/dx-checklist.md`

**Steps:**
1. Create the skill directory structure and base files.
2. Add skill frontmatter (`disable-model-invocation`, `user-invocable`, argument hint).
3. Define mode assertion, prerequisites, and progress indicators.
4. Encode required analysis dimensions and scoring schema.

**Verify:**
- Run: `test -f .agents/skills/oat-repo-review-analyze/SKILL.md && test -f .agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md`
- Expected: all scaffold files exist

**Commit:**
```bash
git add .agents/skills/oat-repo-review-analyze
git commit -m "feat(p01-t01): scaffold repo review analyze skill"
```

---

### Task p01-t02: Implement Output Mode Resolver for Analysis Artifacts

**Files:**
- Create: `.agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh`
- Modify: `.agents/skills/oat-repo-review-analyze/SKILL.md`

**Steps:**
1. Implement `auto|tracked|local|inline` output resolution behavior.
2. Mirror tracked/local preference logic used in existing review flows.
3. Document script usage in skill process steps.
4. Ensure failure messages are explicit for invalid mode/destination combinations.

**Verify:**
- Run: `bash .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh --mode auto`
- Expected: prints resolved mode and output directory/path semantics without error

**Commit:**
```bash
git add .agents/skills/oat-repo-review-analyze/scripts/resolve-analysis-output.sh .agents/skills/oat-repo-review-analyze/SKILL.md
git commit -m "feat(p01-t02): add analysis output mode resolver"
```

---

## Phase 2: Analysis Flow and Artifact Contract

### Task p02-t01: Author End-to-End Analysis Workflow in `SKILL.md`

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/SKILL.md`

**Steps:**
1. Define process steps for scope resolution (`repo` vs `directory` + `--target`).
2. Add evidence gathering and optional sub-agent fan-out guidance.
3. Define scoring synthesis and prioritization rules.
4. Add user-facing completion summary requirements (counts by Concern/Value).

**Verify:**
- Run: `rg -n "Concern|Value|Scope|Confidence|DX|repo|directory|tracked|inline" .agents/skills/oat-repo-review-analyze/SKILL.md`
- Expected: all required dimensions and modes are present

**Commit:**
```bash
git add .agents/skills/oat-repo-review-analyze/SKILL.md
git commit -m "feat(p02-t01): define repo review analysis workflow"
```

---

### Task p02-t02: Finalize Artifact Schema and Example Output Guidance

**Files:**
- Modify: `.agents/skills/oat-repo-review-analyze/references/repo-review-artifact-template.md`
- Modify: `.agents/skills/oat-repo-review-analyze/references/repo-review-rubric.md`
- Modify: `.agents/skills/oat-repo-review-analyze/references/dx-checklist.md`

**Steps:**
1. Encode required frontmatter fields and section layout.
2. Define finding schema fields and accepted label vocabularies.
3. Add quick wins vs strategic initiatives formatting rules.
4. Add appendix expectations (inventory metrics and assumptions).

**Verify:**
- Run: `rg -n "Executive Summary|Scoring Summary|Prioritized Findings|Quick Wins|Strategic Initiatives|Now / Next / Later" .agents/skills/oat-repo-review-analyze/references/*.md`
- Expected: artifact template and rubric contain all required sections

**Commit:**
```bash
git add .agents/skills/oat-repo-review-analyze/references
git commit -m "feat(p02-t02): finalize repo review artifact contract"
```

---

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| p01 | code | pending | - | - |
| p02 | code | pending | - | - |
| final | code | pending | - | - |
| spec | artifact | pending | - | - |
| design | artifact | received | 2026-02-27 | reviews/artifact-design-review-2026-02-27.md |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

---

## Implementation Complete

**Summary:**
- Phase 1: 2 tasks - scaffold skill and output resolver
- Phase 2: 2 tasks - define workflow and artifact contract

**Total: 4 tasks**

Ready for execution via `oat-project-implement`.

---

## References

- Idea source: `.oat/ideas/repo-analyze-skill/discovery.md`
- Existing pattern: `.agents/skills/oat-review-provide/SKILL.md`
- Existing pattern: `.agents/skills/oat-agent-instructions-analyze/SKILL.md`
- Discovery: `discovery.md`

---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-06
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ["p02"]
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: quick-start-discovery-capture

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Make `oat-project-quick-start` synthesize `discovery.md` from already-available session context, backfill discovery after startup Q&A when more detail had to be elicited, and create a separate `design.md` only when enough technical detail exists to justify it.

**Architecture:** Treat the quick-start skill contract as the primary behavior source, then align shared discovery/design scaffolding and targeted verification so quick-mode projects consistently start from a real discovery artifact and only grow a separate design artifact when the session contains enough detail to warrant it.

**Tech Stack:** Markdown skill files, OAT templates, TypeScript/Vitest tests for scaffold or validation guards

**Commit Convention:** `{type}({scope}): {description}` - e.g., `feat(p01-t01): tighten quick-start discovery capture`

## Planning Checklist

- [x] Confirmed quick mode should remain lightweight, with discovery required and design optional only when justified
- [x] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Tighten Quick-Start Discovery and Design Semantics

### Task p01-t01: Update the quick-start skill to require session-context synthesis and discovery backfill

**Files:**
- Modify: `.agents/skills/oat-project-quick-start/SKILL.md`

**Step 1: Write test (RED)**

Identify the current missing guidance in the skill text by adding or updating a targeted assertion that documents the new requirement:
- quick-start must synthesize `discovery.md` from current session context when enough detail already exists
- if quick-start asks startup questions, it must backfill discovery with the discussion and decisions before planning
- follow-up questions are only required for blocking gaps
- quick mode must not escalate into design/spec authoring automatically

Run: `pnpm test -- --runInBand packages/cli/src/validation/skills.test.ts`
Expected: New assertion fails before the skill text is updated

**Step 2: Implement (GREEN)**

Revise the quick-start skill so Step 2 explicitly instructs agents to:
- create `discovery.md` if missing
- populate it from the current conversation and repo context when sufficient detail already exists
- ask only the minimum additional questions needed to remove blockers
- backfill the discovery artifact with the answers, options considered, and resulting decisions before finalizing the plan

Run: `pnpm test -- --runInBand packages/cli/src/validation/skills.test.ts`
Expected: The targeted assertion and existing skill validation pass

**Step 3: Refactor**

Tighten wording for clarity and keep the contract concise so the guidance is actionable without turning quick mode into a spec-driven workflow.

**Step 4: Verify**

Run: `pnpm run cli -- internal validate-oat-skills`
Expected: No OAT skill validation findings

**Step 5: Commit**

```bash
git add .agents/skills/oat-project-quick-start/SKILL.md packages/cli/src/validation/skills.test.ts
git commit -m "feat(p01-t01): tighten quick-start synthesis and backfill"
```

---

### Task p01-t02: Define the optional-design threshold and align quick scaffolding

**Files:**
- Modify: `.agents/skills/oat-project-quick-start/SKILL.md`
- Modify: `.oat/templates/discovery.md`
- Modify: `.oat/templates/design.md` only if a quick-safe wording tweak is needed
- Modify: `packages/cli/src/commands/project/new/scaffold.test.ts`
- Modify: any adjacent quick-mode guidance only if it conflicts with the new discovery-first behavior

**Step 1: Write test (RED)**

Add a failing scaffold/template assertion that:
- a quick-mode project’s discovery artifact does not point users back to the spec-driven next step by default
- quick mode can remain discovery-only unless enough technical detail exists to justify a separate design artifact

Run: `pnpm test -- --runInBand packages/cli/src/commands/project/new/scaffold.test.ts`
Expected: New assertion fails against the current discovery template wording

**Step 2: Implement (GREEN)**

Update the shared discovery/design scaffolding so quick mode:
- has workflow-safe discovery next-step guidance
- treats design as optional and threshold-based rather than automatic
- stays coherent when a separate design file is not created

Run: `pnpm test -- --runInBand packages/cli/src/commands/project/new/scaffold.test.ts`
Expected: Quick-mode scaffold tests pass with the updated discovery template content

**Step 3: Refactor**

Keep the wording neutral enough to work across workflows, or make the minimum scaffold-aware adjustment needed without introducing template branching unless justified.

**Step 4: Verify**

Run: `pnpm test -- --runInBand packages/cli/src/commands/project/new/scaffold.test.ts packages/cli/src/validation/skills.test.ts`
Expected: Template and skill expectations both pass together

**Step 5: Commit**

```bash
git add .agents/skills/oat-project-quick-start/SKILL.md .oat/templates/discovery.md .oat/templates/design.md packages/cli/src/commands/project/new/scaffold.test.ts
git commit -m "feat(p01-t02): align quick discovery and design scaffolding"
```

---

## Phase 2: Add Durable Workflow Guards

### Task p02-t01: Add regression coverage for quick-start discovery-ready projects

**Files:**
- Modify: `packages/cli/src/validation/skills.test.ts`
- Modify: `packages/cli/src/commands/project/new/scaffold.test.ts`
- Modify: related helper code only if test setup needs it

**Step 1: Write test (RED)**

Add a focused regression scenario covering the full expectation:
- quick projects scaffold a discovery artifact suitable for direct planning
- the quick-start skill text requires discovery synthesis from existing context
- startup Q&A must be reflected back into discovery before planning
- optional design creation remains gated on whether enough detail exists to justify it
- the repo guard fails if either side regresses

Run: `pnpm test -- --runInBand packages/cli/src/validation/skills.test.ts packages/cli/src/commands/project/new/scaffold.test.ts`
Expected: At least one new assertion fails before the full guard is implemented

**Step 2: Implement (GREEN)**

Implement the smallest durable guard needed so the repo clearly signals if quick-start falls back to placeholder-only discovery behavior or starts creating design artifacts indiscriminately.

Run: `pnpm test -- --runInBand packages/cli/src/validation/skills.test.ts packages/cli/src/commands/project/new/scaffold.test.ts`
Expected: Regression coverage passes and protects the intended quick-mode behavior

**Step 3: Refactor**

Reduce brittleness in the new checks by asserting required intent rather than large verbatim text blocks.

**Step 4: Verify**

Run: `pnpm run cli -- internal validate-oat-skills && pnpm test -- --runInBand packages/cli/src/validation/skills.test.ts packages/cli/src/commands/project/new/scaffold.test.ts`
Expected: Skill validation and targeted regression coverage both pass

**Step 5: Commit**

```bash
git add .agents/skills/oat-project-quick-start/SKILL.md .oat/templates/discovery.md .oat/templates/design.md packages/cli/src/validation/skills.test.ts packages/cli/src/commands/project/new/scaffold.test.ts
git commit -m "test(p02-t01): add quick-start synthesis regression guard"
```

---

### Task p02-t02: Refresh OAT-facing references after the workflow change

**Files:**
- Modify: relevant OAT reference docs only if they now misdescribe quick mode
- Modify: any generated or curated reference artifacts that should reflect the new quick-start expectation

**Step 1: Identify drift**

Review repo-facing quick-mode references that mention `oat-project-quick-start`, discovery, or next-step routing to find any wording that now conflicts with the updated behavior.

Run: `rg -n "oat-project-quick-start|discovery.md|quick mode" .agents .oat`
Expected: Relevant references are identified before edits

**Step 2: Implement (GREEN)**

Update only the references that materially conflict with the new discovery-first quick-start behavior or the new optional-design threshold.

Run: `pnpm test -- --runInBand packages/cli/src/validation/skills.test.ts packages/cli/src/commands/project/new/scaffold.test.ts`
Expected: Targeted checks remain green after reference updates

**Step 3: Refactor**

Avoid duplicating long behavior descriptions where the skill itself is the canonical source.

**Step 4: Verify**

Run: `pnpm run cli -- internal validate-oat-skills`
Expected: Skill bundle remains valid after reference alignment

**Step 5: Commit**

```bash
git add .agents .oat
git commit -m "docs(p02-t02): sync quick-start discovery references"
```

---

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| p01 | code | pending | - | - |
| p02 | code | pending | - | - |
| final | code | received | 2026-03-06 | reviews/final-review-2026-03-06.md |
| spec | artifact | pending | - | - |
| design | artifact | pending | - | - |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

**Meaning:**
- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

## Implementation Complete

**Summary:**
- Phase 1: 2 tasks - tighten the quick-start contract and align quick discovery/design scaffolding
- Phase 2: 2 tasks - add durable regression guards and sync any conflicting quick-mode references

**Total: 4 tasks**

Ready for code review and merge.

---

## References

- Discovery: `discovery.md`
- Quick-start Skill: `.agents/skills/oat-project-quick-start/SKILL.md`
- Discovery Template: `.oat/templates/discovery.md`

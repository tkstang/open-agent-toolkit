---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-13
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: ['p01']
oat_plan_source: imported
oat_import_reference: references/imported-plan.md
oat_import_source_path: /root/.claude/plans/rustling-mixing-toast.md
oat_import_provider: claude
oat_generated: false
---

# Implementation Plan: Agent Instructions Doc Disclosure

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Add a documentation discovery step to `oat-agent-instructions-analyze` so that progressive disclosure decisions have concrete link targets, and instruction files can reference available project documentation.

**Architecture:** Skill definition changes only — new procedural step in SKILL.md, new quality criterion, updated artifact template. No code/script changes.

**Tech Stack:** Markdown skill definitions, OAT skill framework

**Commit Convention:** `feat(p01-t01): {description}` - e.g., `feat(p01-t01): add doc discovery step to analyze skill`

## Planning Checklist

- [ ] Confirmed HiLL checkpoints with user
- [ ] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Add Documentation Discovery to Analyze Skill

### Task p01-t01: Insert Doc Discovery Step in SKILL.md

**Files:**

- Modify: `.agents/skills/oat-agent-instructions-analyze/SKILL.md`

**Step 1: Write test (RED)**

No code tests — this is a skill definition. Verification is manual consistency check.

**Step 2: Implement (GREEN)**

1. Update progress indicators: change `[N/9]` to `[N/10]` throughout, renumber steps.
2. Insert new `### Step 2: Discover Documentation Surfaces` between current Step 1 (Discover Instruction Files) and Step 2 (Evaluate Quality).
3. The new step scans for documentation surfaces broadly (not dependent on OAT config):
   - OAT docs config (`.oat/config.json` `documentation.*`) — if it exists
   - Docs directories (`docs/`, `doc/`, `apps/*/docs/`) — check for `index.md` with `## Contents`
   - READMEs (`README.md` at root and key subdirectories)
   - Knowledge base (`.oat/repo/knowledge/`) — only if exists and current (check frontmatter staleness)
   - Standalone docs (`ARCHITECTURE.md`, `DESIGN.md`, `CONTRIBUTING.md`, `ADR/`, `decisions/`, `.github/*.md`)
4. Output is a Documentation Inventory used by subsequent steps.
5. Renumber all subsequent steps (old Step 2 → Step 3, old Step 3 → Step 4, etc.).
6. Update Step 3 (formerly Step 2, Evaluate Quality) to reference the documentation inventory when evaluating Criteria 12 and 14.
7. Update Step 4 (formerly Step 3, Coverage Gaps) to populate `Link Targets` from the inventory.

**Step 3: Refactor**

Ensure consistent step numbering and cross-references throughout the file.

**Step 4: Verify**

- Read the modified file and verify all step numbers are sequential 0-9 (10 steps).
- Verify the new step references are consistent with the artifact template.
- Verify existing step logic is preserved (only renumbered, not changed).

**Step 5: Commit**

```bash
git add .agents/skills/oat-agent-instructions-analyze/SKILL.md
git commit -m "feat(p01-t01): add doc discovery step to agent-instructions-analyze"
```

---

### Task p01-t02: Add Criterion 14 to Quality Checklist

**Files:**

- Modify: `.agents/skills/oat-agent-instructions-analyze/references/quality-checklist.md`

**Step 1: Write test (RED)**

No code tests — skill reference document.

**Step 2: Implement (GREEN)**

Add new criterion after Criterion 13:

```markdown
### 14. Available Documentation Is Referenced

- [ ] Instruction files reference relevant available documentation in their References section
- [ ] Scoped instruction files reference docs topically relevant to their directory scope
- [ ] References point to existing, current documentation (not stale or removed)
- [ ] Content duplicated from available docs is flagged for `link_only` instead
- **Severity if failing:** Low (missing references) or Medium (duplicates content that exists in docs)
```

**Step 3: Refactor**

Verify criterion numbering is sequential. Verify the Scoring section note about "applicable set" still makes sense with 14 criteria.

**Step 4: Verify**

Read the file and confirm criterion 14 follows the same structure as criteria 1-13.

**Step 5: Commit**

```bash
git add .agents/skills/oat-agent-instructions-analyze/references/quality-checklist.md
git commit -m "feat(p01-t02): add criterion 14 for doc reference quality"
```

---

### Task p01-t03: Add Documentation Inventory to Artifact Template

**Files:**

- Modify: `.agents/skills/oat-agent-instructions-analyze/references/analysis-artifact-template.md`

**Step 1: Write test (RED)**

No code tests — template document.

**Step 2: Implement (GREEN)**

Insert a `## Documentation Inventory` section between the Summary and Instruction File Inventory sections:

```markdown
## Documentation Inventory

Available documentation surfaces discovered in this repository. Used to populate link targets for `link_only` disclosure decisions and to evaluate Criterion 14 (Available Documentation Is Referenced).

| #   | Type                                   | Path     | Topics/Scope     | Current?            | Notes                                              |
| --- | -------------------------------------- | -------- | ---------------- | ------------------- | -------------------------------------------------- |
| 1   | {docs-app/readme/knowledge/standalone} | `{path}` | {topics covered} | {current/stale/N/A} | {e.g., OAT config root, package-level, thin index} |
| ... |                                        |          |                  |                     |                                                    |

{Or: "No documentation surfaces discovered."}
```

**Step 3: Refactor**

Ensure the table columns match what the new Step 2 in SKILL.md describes.

**Step 4: Verify**

Read the template and confirm the Documentation Inventory section appears in the right position and its structure is consistent with the SKILL.md step description.

**Step 5: Commit**

```bash
git add .agents/skills/oat-agent-instructions-analyze/references/analysis-artifact-template.md
git commit -m "feat(p01-t03): add doc inventory section to analysis artifact template"
```

---

## Reviews

| Scope | Type | Status  | Date       | Artifact                           |
| ----- | ---- | ------- | ---------- | ---------------------------------- |
| p01   | code | pending | -          | -                                  |
| final | code | passed  | 2026-03-13 | reviews/final-review-2026-03-13.md |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

**Meaning:**

- `received`: review artifact exists (not yet converted into fix tasks)
- `fixes_added`: fix tasks were added to the plan (work queued)
- `fixes_completed`: fix tasks implemented, awaiting re-review
- `passed`: re-review run and recorded as passing (no Critical/Important)

---

### Task p01-t04 (review): Fix Step 2 Cross-References in SKILL.md

**Files:**

- Modify: `.agents/skills/oat-agent-instructions-analyze/SKILL.md`

**Step 1: Implement**

Fix the "This inventory is used by" block in Step 2 (lines ~198-200):

- Change `**Step 4 (Evaluate Quality):**` → `**Step 3 (Evaluate Quality):**`
- Change `**Step 5 (Coverage Gaps):**` → `**Step 4 (Coverage Gaps):**`
- Change `**Step 9 (Write Artifact):**` → `**Step 8 (Write Artifact):**`

**Step 2: Verify**

Confirm all step cross-references in Step 2 now match actual step headings.

**Step 3: Commit**

```bash
git add .agents/skills/oat-agent-instructions-analyze/SKILL.md
git commit -m "fix(p01-t04): correct step cross-references in doc discovery step"
```

---

## Implementation Complete

**Summary:**

- Phase 1: 4 tasks - Add doc discovery step, quality criterion, artifact template section, fix cross-references

**Total: 4 tasks**

Ready for code review and merge.

---

## References

- Imported Source: `references/imported-plan.md`

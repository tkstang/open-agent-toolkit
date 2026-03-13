# Plan: Add Documentation Discovery Step to `oat-agent-instructions-analyze`

## Context

The `oat-agent-instructions-analyze` skill makes progressive disclosure decisions (`inline` vs `link_only`) but has no mechanism to discover what documentation exists in the repo. This means `link_only` recommendations lack concrete link targets, the apply skill halts when targets are missing, and instruction files miss opportunities to reference relevant docs (READMEs, docs apps, knowledge base files, architecture docs). Nested/scoped AGENTS.md files also don't get checked for whether they reference docs topically relevant to their package scope.

## Changes

### 1. Insert new Step 2 in SKILL.md: "Discover Documentation Surfaces"

**File:** `.agents/skills/oat-agent-instructions-analyze/SKILL.md`

Insert between current Step 1 (Discover Instruction Files) and Step 2 (Evaluate Quality). Renumber all subsequent steps. Update step count from 9 → 10 in progress indicators.

**What the step does:** Scan the repo broadly for documentation surfaces — not just OAT-configured docs. Build an inventory for use in subsequent disclosure decisions.

**Discovery sources (check all, none required):**

1. **OAT docs config** — Read `.oat/config.json` `documentation.*` if it exists. Extract `root`, `index` path. Signal only, not a requirement.
2. **Docs directories** — Scan for `docs/`, `doc/`, `apps/*/docs/`. For each, check for `index.md` with `## Contents` — if found, parse topic-to-path map.
3. **READMEs** — Find `README.md` at root and in key subdirectories (packages, apps, modules). Often the only documentation for a package.
4. **Knowledge base** — Check if `.oat/repo/knowledge/` exists and has files. If so, read `project-index.md` frontmatter for staleness (`oat_generated_at`, `oat_source_main_merge_base_sha`). Compare merge-base SHA against current HEAD. Only include if reasonably current (≤20 files changed, ≤7 days). If stale, note as stale and don't recommend linking.
5. **Standalone docs** — Scan for `ARCHITECTURE.md`, `DESIGN.md`, `CONTRIBUTING.md`, `ADR/`, `decisions/`, `.github/*.md`.

**Output:** A "Documentation Inventory" table in the analysis artifact:

```markdown
## Documentation Inventory

| #   | Type | Path | Topics/Scope | Current? | Notes |
| --- | ---- | ---- | ------------ | -------- | ----- |
```

**How subsequent steps use it:**

- Quality evaluation (Step 4) — Criterion 12 (Progressive Disclosure) and new Criterion 14 check whether instruction files reference available docs
- Coverage gaps (Step 5) — New AGENTS.md recommendations get `Link Targets` populated from the inventory
- Artifact writing (Step 9) — Progressive Disclosure Decisions table uses real link targets

### 2. Add Criterion 14 to quality checklist

**File:** `.agents/skills/oat-agent-instructions-analyze/references/quality-checklist.md`

```markdown
### 14. Available Documentation Is Referenced

- [ ] Instruction files reference relevant available documentation in their References section
- [ ] Scoped instruction files reference docs topically relevant to their directory scope
- [ ] References point to existing, current documentation (not stale or removed)
- [ ] Content duplicated from available docs is flagged for `link_only` instead
- **Severity if failing:** Low (missing references) or Medium (duplicates content that exists in docs)
```

### 3. Add Documentation Inventory section to artifact template

**File:** `.agents/skills/oat-agent-instructions-analyze/references/analysis-artifact-template.md`

Insert `## Documentation Inventory` section between Summary and Instruction File Inventory.

### 4. Update Step references in existing steps

In the renamed Step 4 (Evaluate Quality), add guidance to use the documentation inventory when evaluating Criteria 12 and 14.

In the renamed Step 5 (Coverage Gaps), add guidance to populate `Link Targets` from the inventory when recommending new AGENTS.md files — prefer docs specific to the package scope over project-wide docs.

### 5. Renumber progress indicators

```
[1/10] Resolving providers + mode…
[2/10] Discovering instruction files…
[3/10] Discovering documentation surfaces…    ← NEW
[4/10] Evaluating quality…
[5/10] Assessing directory coverage gaps…
[6/10] Discovering file-type patterns…
[7/10] Checking for drift…
[8/10] Checking cross-format consistency…
[9/10] Writing analysis artifact…
[10/10] Updating tracking + summary…
```

## Files Modified

1. `.agents/skills/oat-agent-instructions-analyze/SKILL.md` — New step, renumbered steps, updated count
2. `.agents/skills/oat-agent-instructions-analyze/references/quality-checklist.md` — Criterion 14
3. `.agents/skills/oat-agent-instructions-analyze/references/analysis-artifact-template.md` — Documentation Inventory section

## Files NOT Modified

- `oat-agent-instructions-apply/SKILL.md` — Already handles `link_only` with targets; no changes needed
- Instruction file templates — `{doc-path-or-url}` placeholder already correct; analyze supplies values
- No new scripts — discovery is procedural guidance in the skill definition, not a shell script

## Verification

1. Read all three modified files to confirm consistency (step numbering, criterion references, template sections align)
2. Confirm the artifact template's Documentation Inventory section matches what Step 2 describes
3. Confirm Step 4 (Quality) and Step 5 (Coverage Gaps) reference the inventory correctly
4. Verify the apply skill's Step 0 validation still works — `link_only` recommendations will now have targets, so validation passes

## Future: `agent-orient` skill (not in scope)

Noted for follow-up: a lightweight invocable skill for quick repo orientation — reads doc index files, instruction surfaces, and knowledge base. Complementary to this change (discovery feeds the artifact; orient would be a runtime capability for any agent).

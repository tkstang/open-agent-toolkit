---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-14
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: []
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: Research & Verification Skill Suite

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Build five provider-agnostic OAT skills (/skeptic, /compare, /deep-research, /analyze, /synthesize) forming a layered research, analysis, verification, and synthesis suite with shared schemas, cross-cutting conventions, and a sub-agent definition.

**Architecture:** Layered skill system — /skeptic is self-contained, /compare is standalone + sub-agent, /deep-research and /analyze are orchestrators that dispatch parallel workers and conditionally invoke /compare, /synthesize consumes artifacts from all above. Sub-agent dispatch follows the 3 execution tier pattern. All skills are provider-agnostic.

**Tech Stack:** Markdown SKILL.md files following OAT/Agent Skills Open Standard conventions. No executable code.

**Commit Convention:** `feat({task-id}): {description}` — e.g., `feat(p01-t01): add shared schema templates`

## Planning Checklist

- [x] Confirmed HiLL checkpoints with user (quick mode — no HiLL gates)
- [x] Set `oat_plan_hill_phases` in frontmatter (empty — no pause points)

---

## Phase 1: Foundation (schemas + sub-agent)

Shared infrastructure that other skills reference: schema templates for structured artifact output, and the skeptical-evaluator sub-agent definition.

### Task p01-t01: Create shared schema template files

**Files:**

- Create: `.agents/skills/deep-research/references/schema-base.md`
- Create: `.agents/skills/deep-research/references/schema-technical.md`
- Create: `.agents/skills/deep-research/references/schema-comparative.md`
- Create: `.agents/skills/deep-research/references/schema-conceptual.md`
- Create: `.agents/skills/deep-research/references/schema-architectural.md`
- Create: `.agents/skills/deep-research/references/schema-analysis.md`

**Step 1: Create base schema**

The base template shared by /deep-research and /analyze. Must include:

- Required artifact frontmatter contract (`oat_skill`, `oat_schema`, `oat_topic`, `oat_model`, `oat_generated_at`) plus optional keys
- Executive Summary section
- Methodology section (research methodology for /deep-research, analysis methodology for /analyze)
- Findings section (placeholder — structure varies by extended schema)
- Sources & References section

**Step 2: Create extended schema templates**

Each extended schema inherits the base and adds domain-specific sections:

- `schema-technical.md`: packages, repo analysis, code examples, integration notes
- `schema-comparative.md`: comparison table, dimensions, scoring, recommendation (shared with /compare)
- `schema-conceptual.md`: key themes, mental models, notable references, open questions
- `schema-architectural.md`: tradeoffs, constraints, decision framework, risk considerations
- `schema-analysis.md`: per-angle findings (6 angles), cross-angle synthesis, prioritized recommendations

**Step 3: Verify**

Run: `ls -la .agents/skills/deep-research/references/schema-*.md | wc -l`
Expected: 6 files exist

Run: Verify each schema file contains frontmatter and section headings matching the design specification

**Step 4: Commit**

```bash
git add .agents/skills/deep-research/references/schema-*.md
git commit -m "feat(p01-t01): add shared schema templates for research and analysis artifacts"
```

---

### Task p01-t02: Create skeptical-evaluator sub-agent definition

**Files:**

- Create: `.agents/agents/skeptical-evaluator.md`

**Step 1: Write agent definition**

Follow the pattern established by `.agents/agents/oat-reviewer.md` for structure. Must include:

- Frontmatter: `name`, `version` (1.0.0), `description`, `tools` (Read, Bash, Grep, Glob, WebSearch, WebFetch), `color` (red)
- Role description: adversarial evidence gatherer operating in a separate context
- Input contract: receives structured context package (CLAIM, BASIS, CLAIM_TYPE, AVAILABLE_SOURCES, INSTRUCTION)
- Output contract: returns inline findings to orchestrator (not written to disk)
- Behavioral rules: attempt to disprove first, cite specifically, never hallucinate sources, note supporting evidence only after exhausting contradictions
- Evidence gathering strategy per claim type (code_behavior, library_specific, documentation, factual, architectural)

**Step 2: Verify**

Run: Confirm file exists and frontmatter parses correctly
Run: Verify the agent definition includes all required contract elements from the design

**Step 3: Commit**

```bash
git add .agents/agents/skeptical-evaluator.md
git commit -m "feat(p01-t02): add skeptical-evaluator sub-agent definition"
```

---

## Phase 2: Independent Skills (/skeptic + /compare)

These skills have no orchestration dependencies on each other. /skeptic already has a draft; /compare is new.

### Task p02-t01: Update /skeptic SKILL.md to align with design

**Files:**

- Modify: `.agents/skills/skeptic/SKILL.md`

**Step 1: Align with design conventions**

Update the existing draft to:

- Use "Execution Tier" naming consistently (replace any "Tier 1/2/3" references with "Execution Tier 1/2/3")
- Reference the skeptical-evaluator agent definition created in p01-t02
- Align claim types with the design's 5-type classification
- Ensure the 4 verdict frames match the design exactly
- Add step logging format matching OAT convention (phase banner, `[N/M]` steps, `→` for long ops)
- Ensure provider split block for sub-agent detection follows `create-agnostic-skill` conventions
- Verify `allowed-tools` frontmatter is correct
- Ensure the context package structure matches the design specification

**Step 2: Verify**

Run: Read the updated SKILL.md and verify it references the skeptical-evaluator agent, uses Execution Tier naming, and includes all 5 claim types and 4 verdict frames

**Step 3: Commit**

```bash
git add .agents/skills/skeptic/SKILL.md
git commit -m "feat(p02-t01): align skeptic skill with design conventions and execution tier naming"
```

---

### Task p02-t02: Create /compare SKILL.md

**Files:**

- Create: `.agents/skills/compare/SKILL.md`

**Step 1: Write skill file**

Follow `create-agnostic-skill` conventions for cross-provider compatibility. Must include:

Frontmatter:

- `name: compare`
- `version: 0.1.0`
- `description`: domain-aware comparative analysis with clear recommendations
- `argument-hint`: items to compare + optional flags
- `user-invocable: true`
- `allowed-tools`: Read, Glob, Grep, Bash, WebSearch, WebFetch, AskUserQuestion, Agent, mcp\_\_\*

Workflow:

1. Parse items and optional dimensions from `$ARGUMENTS`; detect `--save` and `--context` flags
2. If `--context` provided, read context file/directory
3. Domain classification → dimension selection (npm packages, architectural approaches, business strategies, tools/apps, general)
4. Research each option against dimensions using available sources
5. Score/rank with qualitative assessment; produce clear recommendation
6. Output inline (default) or write artifact with `--save` flag using `schema-comparative.md` template
7. When writing artifact: include model-tagged filename, artifact frontmatter contract

Sub-agent invocation contract (when dispatched from /deep-research or /analyze):

- Uses comparative schema format
- Returns inline to orchestrator (no file write, no model-tagged filename)
- Step logging adapts (sub-agent context vs standalone)

**Step 2: Verify**

Run: Verify SKILL.md exists, frontmatter is valid, and includes domain→dimension mapping table, `--save` flag handling, `--context` flag handling, model-tagged filename convention, and sub-agent invocation contract

**Step 3: Commit**

```bash
git add .agents/skills/compare/SKILL.md
git commit -m "feat(p02-t02): add compare skill for domain-aware comparative analysis"
```

---

## Phase 3: Orchestrator Skills (/deep-research + /analyze)

Both dispatch parallel workers and conditionally invoke /compare. These depend on the /compare pattern and shared schemas from Phase 1.

### Task p03-t01: Create /deep-research SKILL.md

**Files:**

- Create: `.agents/skills/deep-research/SKILL.md`

**Step 1: Write skill file**

Follow `create-agnostic-skill` conventions. Must include:

Frontmatter:

- `name: deep-research`
- `version: 0.1.0`
- `description`: comprehensive research orchestrator producing structured artifacts
- `argument-hint`: topic + optional flags
- `user-invocable: true`
- `allowed-tools`: Read, Glob, Grep, Bash, WebSearch, WebFetch, AskUserQuestion, Agent, mcp\_\_\*

Workflow:

1. Parse topic from `$ARGUMENTS`; detect `--depth`, `--focus`, `--context`, output path flags
2. If `--context` provided, read context file/directory → extract constraints, focus areas, prior art
3. Topic classification (informed by context) → extended schema selection (technical, comparative, conceptual, architectural)
4. Research angle planning (context shapes priorities)
5. Sub-agent availability probe → select Execution Tier
6. [Execution Tier 1] Parallel worker dispatch — general-purpose sub-agents with structured prompts per angle, each receiving context summary. Provider split block for dispatch mechanism.
7. [Execution Tier 2] Sequential self-execution per angle
8. [Conditional] If competing options emerge → dispatch /compare as sub-agent (returns inline, embedded as supplementary section)
9. Aggregate findings from all angles
10. Resolve output target (Obsidian → path → default)
11. Write structured artifact using base + extended schema, with artifact frontmatter contract and model-tagged filename
12. Step logging throughout (phase banner, `[N/M]` steps)

Key contracts to include:

- Research-angle worker prompt template (what each worker receives)
- /compare conditional invocation (inline return, no intermediate file)
- Output target resolution priority
- `--depth` flag behavior (surface/standard/exhaustive)
- `--focus` flag behavior (narrows to specific angle)
- Schema reference paths

**Step 2: Verify**

Run: Verify SKILL.md exists, references schema files in `references/`, includes all 4 extended schema types, has Execution Tier 1/2/3 dispatch logic with provider split, --context threading, model-tagged filename, and artifact frontmatter contract

**Step 3: Commit**

```bash
git add .agents/skills/deep-research/SKILL.md
git commit -m "feat(p03-t01): add deep-research orchestrator skill"
```

---

### Task p03-t02: Create /analyze SKILL.md

**Files:**

- Create: `.agents/skills/analyze/SKILL.md`

**Step 1: Write skill file**

Follow `create-agnostic-skill` conventions. Must include:

Frontmatter:

- `name: analyze`
- `version: 0.1.0`
- `description`: multi-angle analysis of existing artifacts, codebases, documents, or systems
- `argument-hint`: target to analyze + optional --context
- `user-invocable: true`
- `allowed-tools`: Read, Glob, Grep, Bash, WebSearch, WebFetch, AskUserQuestion, Agent, mcp\_\_\*

Workflow:

1. Parse target from `$ARGUMENTS`; detect `--context` flag
2. If `--context` provided, read context file/directory → extract evaluation criteria
3. Input type classification (code, document, architecture, idea, mixed)
4. Analysis angle selection — all 6 always run, emphasis weighted by input type:
   - Adversarial/Critical, Gap Analysis, Opportunity Analysis, Structural/Organizational, Consistency/Coherence, Audience/Clarity
5. Sub-agent availability probe → select Execution Tier
6. [Execution Tier 1] Parallel worker dispatch — one general-purpose sub-agent per analysis angle, each receiving target content, angle description, context criteria, output format instructions. Provider split block.
7. [Execution Tier 2] Sequential self-execution per angle
8. [Conditional] If angle surfaces comparables → dispatch /compare as sub-agent
9. Cross-angle synthesis → prioritized recommendations
10. Write structured artifact using base + analysis extended schema, with artifact frontmatter contract and model-tagged filename
11. Step logging throughout

Key contracts to include:

- Input type → angle emphasis mapping table
- Analysis-angle worker prompt template
- /compare conditional invocation (same contract as /deep-research)
- `--context` separates "what to analyze" from "what to analyze it against"
- Schema reference: `schema-analysis.md`

**Step 2: Verify**

Run: Verify SKILL.md exists, includes all 6 analysis angles, input type→emphasis table, Execution Tier dispatch with provider split, --context handling, model-tagged filename, and artifact frontmatter contract

**Step 3: Commit**

```bash
git add .agents/skills/analyze/SKILL.md
git commit -m "feat(p03-t02): add analyze skill for multi-angle analysis"
```

---

## Phase 4: Synthesis + Integration

/synthesize consumes artifacts from all above. Then sync and verify.

### Task p04-t01: Create /synthesize SKILL.md

**Files:**

- Create: `.agents/skills/synthesize/SKILL.md`

**Step 1: Write skill file**

Follow `create-agnostic-skill` conventions. Must include:

Frontmatter:

- `name: synthesize`
- `version: 0.1.0`
- `description`: merge multiple analysis artifacts into a single coherent report with provenance tracking
- `argument-hint`: directory or file paths + optional --inline
- `user-invocable: true`
- `allowed-tools`: Read, Glob, Grep, Bash, AskUserQuestion

Note: no Agent, WebSearch, WebFetch — synthesis reads existing artifacts, doesn't research or dispatch.

Workflow:

1. Parse `$ARGUMENTS` — directory path (primary) or explicit file paths; detect `--inline` flag
2. [Directory mode] Scan directory for `.md` files → read frontmatter → filter by `oat_skill` key (artifact frontmatter contract). Report discovered artifacts.
3. [Explicit mode] Read specified file paths directly
4. Classify input types → determine output schema (superset of inputs; homogeneous = input schema + synthesis fields; mixed = generic synthesis wrapper)
5. For each source artifact:
   - Extract findings, conclusions, recommendations
   - Track provenance (file, `oat_model`, `oat_generated_at`)
6. Reconcile across sources:
   - Identify agreements (high confidence — multiple sources converge)
   - Surface contradictions (flag + lean, not decided fact)
   - Deduplicate without losing unique insights
7. Produce output:
   - [Artifact, default] Write synthesis document with superset schema sections: Source Agreement, Contradictions, Provenance Table, Unique Insights, Synthesis Methodology
   - [Inline, --inline flag] Condensed summary

Key contracts to include:

- Artifact frontmatter contract keys used for auto-detection (`oat_skill`, `oat_schema`, `oat_topic`, `oat_model`, `oat_generated_at`)
- Superset output schema table (input schema fields + synthesis additions)
- Conflict resolution protocol (flag → lean → mark as lean not fact)
- No sub-agent dispatch (no execution tiers)
- Does not modify input artifacts

**Step 2: Verify**

Run: Verify SKILL.md exists, includes auto-detection logic referencing artifact frontmatter contract, superset schema table, conflict resolution protocol, provenance tracking, and --inline flag handling

**Step 3: Commit**

```bash
git add .agents/skills/synthesize/SKILL.md
git commit -m "feat(p04-t01): add synthesize skill for multi-source artifact merging"
```

---

### Task p04-t02: Sync provider views and verify cross-provider loading

**Files:**

- Modified by sync: `.claude/skills/`, `.cursor/skills/`, `.codex/agents/` (provider views)
- Modified by sync: `.claude/agents/` (agent provider view)

**Step 1: Run OAT sync**

```bash
oat sync --scope all
```

This propagates all 5 skills and the skeptical-evaluator agent to provider-specific views.

**Step 2: Verify skill registration**

Run: `ls .agents/skills/skeptic/SKILL.md .agents/skills/compare/SKILL.md .agents/skills/deep-research/SKILL.md .agents/skills/analyze/SKILL.md .agents/skills/synthesize/SKILL.md`
Expected: All 5 SKILL.md files exist

Run: `ls .agents/agents/skeptical-evaluator.md`
Expected: Agent definition exists

Run: `ls .agents/skills/deep-research/references/schema-*.md | wc -l`
Expected: 6 schema files

Run: Verify provider views were created by `oat sync`

**Step 3: Commit**

```bash
git add .claude/ .cursor/ .codex/ .agents/
git commit -m "feat(p04-t02): sync provider views for all research and verification skills"
```

---

## Reviews

| Scope     | Type     | Status  | Date       | Artifact                                                 |
| --------- | -------- | ------- | ---------- | -------------------------------------------------------- |
| p01       | code     | passed  | 2026-03-14 | implementation.md (orchestration run 1)                  |
| p02       | code     | passed  | 2026-03-14 | implementation.md (orchestration run 1)                  |
| p03       | code     | passed  | 2026-03-14 | implementation.md (orchestration run 1)                  |
| p04       | code     | passed  | 2026-03-14 | implementation.md (orchestration run 1)                  |
| final     | code     | pending | -          | -                                                        |
| discovery | artifact | passed  | 2026-03-14 | reviews/archived/artifact-discovery-review-2026-03-14.md |
| design    | artifact | passed  | 2026-03-14 | reviews/archived/artifact-design-review-2026-03-14.md    |

---

## Implementation Complete

**Summary:**

- Phase 1: 2 tasks — Foundation (shared schemas + sub-agent definition)
- Phase 2: 2 tasks — Independent skills (/skeptic update + /compare)
- Phase 3: 2 tasks — Orchestrator skills (/deep-research + /analyze)
- Phase 4: 2 tasks — Synthesis + integration (/synthesize + sync)

**Total: 8 tasks**

Ready for code review and merge.

---

## References

- Design: `design.md`
- Discovery: `discovery.md`
- Brainstorming: `reference/brainstorming.md`
- Skeptic draft: `reference/skeptic-SKILL.md`
- Create-agnostic-skill conventions: `.agents/skills/create-agnostic-skill/SKILL.md`
- Review-provide execution tier pattern: `.agents/skills/oat-project-review-provide/SKILL.md`

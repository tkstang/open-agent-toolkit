---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-11
oat_generated: false
---

# Discovery: canonical-rule-sync

## Phase Guardrails (Discovery)

Discovery is for requirements and decisions, not implementation details.

- Prefer outcomes and constraints over concrete deliverables (no specific scripts, file paths, or function names).
- If an implementation detail comes up, capture it as an **Open Question** for design (or a constraint), not as a deliverable list.

## Initial Request

Evaluate Claude's plan for canonical, transform-synced provider rule files, then start a new OAT quick project and brainstorm the next steps needed to implement it safely in the existing sync engine.

## Clarifying Questions

### Question 1: Workflow

**Q:** Should this work start as a tracked OAT quick project rather than ad hoc notes?
**A:** Yes. The user explicitly requested `oat-project-quick-start`.
**Decision:** Use quick mode for discovery and planning, with the option to promote later if design scope expands.

## Solution Space

This request is exploratory. The desired outcome is clear, but there are multiple valid ways to extend the sync engine, and the choice affects manifest handling, drift detection, and future extensibility.

### Approach 1: Transform-Aware Canonical Rule Sync _(Recommended)_

**Description:** Add `.agents/rules/*.md` as canonical project-scoped content, then teach provider mappings to render provider-specific rule files during sync and parse stray provider rules back into canonical format during adoption.
**When this is the right choice:** Best when rules should behave like skills and agents long term, with one source of truth and adoption support across Claude, Cursor, and Copilot.
**Tradeoffs:** Requires careful integration with existing copy/symlink planning, drift detection, manifest storage, and provider path handling.

### Approach 2: Rule Support as a One-Off Pipeline

**Description:** Keep the current sync engine mostly unchanged and add a dedicated rule generation/adoption path outside the shared mapping abstractions.
**When this is the right choice:** Best if rules are the only transformed content type the repo will ever support and shipping speed matters more than consistency of architecture.
**Tradeoffs:** Faster to land initially, but it duplicates lifecycle logic that skills and agents already use and makes later generalization harder.

### Approach 3: Keep Provider-Native Rule Sources

**Description:** Continue generating and maintaining provider-specific rule files directly, with only loose coordination between them.
**When this is the right choice:** Best only if provider divergence is expected to be large enough that a shared canonical body no longer adds much value.
**Tradeoffs:** Preserves the current problems: no canonical source, no reliable sync, and no clean adoption story.

### Chosen Direction

**Approach:** Transform-aware canonical rule sync
**Rationale:** It matches the existing OAT mental model, keeps authorship in one place, and gives stray adoption a coherent target. It also avoids cementing rule generation as a parallel subsystem.
**User validated:** Yes — user approved the recommended direction before planning.

## Options Considered

Within the recommended approach, the main design choice is how generic the sync extension points should become in the first iteration.

### Option A: General Transform Hooks in `PathMapping`

**Description:** Extend provider mappings with enough metadata and hooks to support transformed content types in general, not just rules.

**Pros:**

- Reuses the existing adapter/mapping model instead of creating rule-specific engine branches.
- Leaves room for future transformed content types.
- Keeps provider-specific knowledge localized to provider packages.

**Cons:**

- Slightly larger first change set.
- Needs careful contract design to avoid leaking too much rule-specific behavior into the engine.

**Chosen:** A (recommended, pending user validation)

**Summary:** This is the most coherent long-term shape if we keep the extension surface small and compute drift using rendered provider output rather than rule-only body hashes.

### Option B: Rule-Specific Branches in Planning and Execution

**Description:** Add explicit `if (contentType === 'rule')` handling throughout planning, execution, stray detection, and adoption.

**Pros:**

- Smaller mental leap for the first implementation.
- Can be easier to test if treated as a tightly bounded feature.

**Cons:**

- More code duplication.
- Harder to reuse when another transformed content type appears later.
- More likely to grow special cases in compute-plan and drift handling.

**Chosen:** B is not recommended unless we want the narrowest possible MVP.

**Summary:** This is viable, but it would trade a smaller first patch for more maintenance burden and weaker architectural consistency.

## Key Decisions

1. **Canonical Source:** Provider rule files should not remain the source of truth; canonical authoring should live under `.agents/rules/`.
2. **Sync Model:** Rules should integrate with the existing sync/adoption lifecycle rather than remain a sidecar generator workflow.
3. **Project Workflow:** Quick mode is sufficient for discovery and planning unless design expands beyond a bounded engine change.

## Constraints

- Preserve the existing sync model for skills and agents.
- Avoid destructive behavior for existing provider-native files; stray rules need an adoption path.
- Provider-specific file formats differ in frontmatter shape and filename extension.
- Current engine logic assumes copied content can be compared by exact file hash and symlinked content by target path.

## Success Criteria

- A canonical rule format exists under `.agents/rules/` and can be synced to Claude, Cursor, and Copilot.
- Synced rule files are regenerated deterministically with provider-specific rendering.
- Stray provider rule files can be detected and adopted into canonical format.
- The implementation does not regress existing skill/agent sync behavior.

## Out of Scope

- Reworking the entire sync engine around an abstract plugin system beyond what rules need.
- Changing provider semantics beyond the minimal unavoidable degradation between activation models.
- Implementing unrelated skill or agent sync improvements.

## Deferred Ideas

- User-scoped canonical rules - defer until project-scoped rules land cleanly.
- Richer metadata preservation for lossy provider round-trips - defer unless adoption needs exact activation restoration.

## Open Questions

- **Abstraction Scope:** Should the first implementation add a small general-purpose transform layer to sync mappings, or should it optimize narrowly for rules and generalize later?
- **Drift Strategy:** Should drift be based on rendered provider output only, or do we also want canonical body-aware metadata for diagnostics?
- **Adoption Fidelity:** Do we accept lossy round-tripping for activation modes that providers cannot represent distinctly?

## Assumptions

- `.agents/rules/` should be project-scoped only, matching agents.
- The current OAT-managed marker style can be reused or minimally adapted for synced rule files.
- Rule support remains bounded enough for quick workflow rather than requiring full spec-driven artifacts.

## Risks

- **Manifest / Drift Mismatch:** Existing copy-mode drift logic compares exact file hashes and may produce noisy behavior if transforms are not accounted for.
  - **Likelihood:** High
  - **Impact:** High
  - **Mitigation Ideas:** Base manifest and drift comparisons on rendered provider output for transformed entries.
- **Lossy Adoption Semantics:** Some provider formats cannot express all canonical activation modes.
  - **Likelihood:** High
  - **Impact:** Medium
  - **Mitigation Ideas:** Document degradation explicitly and decide whether extra OAT metadata is worth carrying.
- **Special-Case Creep:** Rule support could introduce repeated `contentType === 'rule'` branches through the engine.
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation Ideas:** Keep the engine extension points generic and provider-specific transforms localized.

## Next Steps

Use this discovery artifact to drive the next workflow step:

- **Quick mode → straight to plan:** proceed directly to `plan.md` when scope is clear and no architecture decisions remain.
- **Quick mode → optional lightweight design:** produce a focused `design.md` (architecture, components, data flow, testing) before planning. Choose this when discovery surfaced architecture choices or component boundaries.
- **Quick mode → promote:** escalate to spec-driven if discovery revealed the scope is larger or more complex than expected.
- **Spec-driven mode:** continue to `oat-project-spec` (after HiLL approval if configured).

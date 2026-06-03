---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-06-03
oat_generated: false
---

# Discovery: skill-automation-and-review

## Phase Guardrails (Discovery)

Discovery is for requirements and decisions, not implementation details.

## Initial Request

A follow-up to PR #71 ("feat(skills): make end-of-lifecycle skills model-invokable"), driven by friction observed while dogfooding OAT. Four related but separable workstreams:

1. A second pass to make more OAT workflow skills model-invokable (natural-language triggerable) where the offer-and-confirm pattern applies.
2. An automatic, subagent-based accuracy review cycle for `oat-docs-analyze` and `oat-agent-instructions-analyze` output (fact-check the analysis artifact before its `-apply` sibling consumes it).
3. An automatic subagent review loop triggered when a `plan.md` is written — mirroring the subagent-driven implement review loop — across all plan-producing paths.
4. (Supporting) A CLI / resolver for "find the most recent review" so natural-language review-receive can locate a target.

Originally a fifth item — a `docs-pr` post-implement enforcement fix — was considered, but **dropped**: session history confirmed `oat-project-document` actually did run; the apparent inline-docs behavior was not a defect in this repo's current skill wiring.

## Background / Evidence

- **PR #71** removed `disable-model-invocation: true` from `oat-project-document`, `oat-project-pr-final`, `oat-project-summary`, and `oat-pjm-add-backlog-item`, rewriting each `description:` to lead with explicit-ask trigger phrasings plus a "do NOT auto-invoke" suppression clause. It traded a hard provider-level gate for a soft prompt-level one, intentionally, to fix the narrate-but-can't-execute failure in offer-and-confirm flows.
- Current model-invokable skills (disable-model-invocation false/absent): `oat-project-document`, `-pr-final`, `-summary`, `oat-pjm-add-backlog-item`, `-pjm-update-repo-reference`, `oat-wrap-up`, `oat-brainstorm`, `oat-docs`, `oat-worktree-bootstrap-auto`, plus utility skills (analyze/compare/deep-research/skeptic/synthesize).
- `oat-reviewer` agent already supports **artifact review** (`type: artifact` for spec/design) and a **structured-output mode** (`oat_output_mode: structured`, returns findings in-memory, writes no file). Dispatch tiers (Tier 1 subagent / Tier 2 inline fallback / Tier 3) are established in `oat-project-review-provide`.
- The plan `## Reviews` table convention (`oat-project-plan-writing`) already has **artifact rows** for `spec` and `design`, but **not** `plan`. Today spec/design skills only _offer_ an optional artifact review; no path auto-loops.
- All three plan-producing paths — `oat-project-plan` (spec-driven), `oat-project-quick-start` (quick), `oat-project-import-plan` (import) — already funnel plan authoring through `oat-project-plan-writing` canonical format invariants.
- `oat-project-progress` is a **read-only router** (no Write tool): it reports status and recommends the next skill; it does not advance work.
- `oat-project-review-receive` already auto-selects the most recent review by `oat_generated_at` frontmatter, but via inline `find` scoped to `$PROJECT_PATH/reviews` only. There is **no** CLI for review discovery today; ad-hoc reviews (`oat-review-provide`/`oat-review-receive`) live outside the project tree.

## Workstreams (Scope)

### A. Model-invocability second pass

Flip `disable-model-invocation` and apply the #71-style description rewrite (explicit-ask triggers + "do NOT auto-invoke" clause + gating) so these become natural-language triggerable while **still offering before acting**:

- `oat-project-review-provide` — triggers like "review project" / "review the project". Resolves a review scope, offers before acting.
- `oat-project-review-receive` — triggers like "receive review" / "process review". Finds the most recent review (project **or** ad-hoc) and offers to process. Reduces the tedium of typing the slash command.
- `oat-project-discover` — natural-language triggerable, **gated on an active spec-driven project existing**.
- `oat-project-progress` — safe (read-only router); triggers like "check progress" / "what's next".
- `oat-project-revise` — tentative ("maybe"); decide during planning.
- Explicitly **skip** the rest of the hard-gated lifecycle skills (new, complete, implement, quick-start, design, spec, plan, etc.).

Constraint: invocability must not become auto-invocation. The "offer, don't just do it" behavior is required, and gating (active project / active spec-driven project / a resolvable review) must suppress false positives.

### B. "Find most recent review" support

Provide a resolver so natural-language review-receive can locate a target without the user typing a path:

- Resolve the most recent review across **project** reviews (`$PROJECT/reviews`, `$PROJECT/reviews/archived`) and **ad-hoc** review locations, ordered by `oat_generated_at` frontmatter (not filesystem mtime).
- Open question (for planning): new CLI command (e.g. `oat review latest`) vs. centralizing the existing inline `find` logic into a shared helper the skills call.

### C. Auto artifact-review loop on plan write

After `plan.md` is authored by **any** path (`oat-project-plan`, `oat-project-quick-start`, `oat-project-import-plan`), automatically dispatch `oat-reviewer` in artifact mode (scope `plan`) into a **bounded** review → fix loop, mirroring subagent-driven implement, before handing off to implement.

- Anchor the trigger in shared `oat-project-plan-writing` (or a shared "plan finalization" step all three paths call) so coverage is consistent in one place.
- Add a `plan` row to the `## Reviews` table convention.
- Import-mode nuance: the review should likely check canonical-format conformance + completeness rather than rewrite the imported author's intent.

### D. Auto review cycle for the two analyze skills

After `oat-docs-analyze` and `oat-agent-instructions-analyze` write their severity-rated analysis artifact (to `.oat/repo/analysis/`), automatically dispatch a fact-checking subagent to verify accuracy / evidence / severities **before** the corresponding `-apply` skill consumes it.

- Reuse `oat-reviewer` structured-output mode + the Tier 1/Tier 2 dispatch pattern where it fits, or a thin analysis-reviewer variant.
- Same bounded-loop discipline as C.

### E. Fix quick-start lightweight-design discovery-completion gap

Surfaced as finding `M1` during this project's own plan review: the quick-start **lightweight-design path (Step 2.75)** never calls `oat project complete-discovery`. That call lives only in Step 2.6 (straight-to-plan) and the promote path, and Step 2.6 is explicitly skipped when "Lightweight design first" is chosen. Result: `discovery.md` stays `oat_status: in_progress` while the plan is marked `complete` — an internally inconsistent lifecycle record.

- Fix: in Step 2.75, mark discovery complete (via `oat project complete-discovery --ready-for oat-project-quick-start`) before plan generation.
- Folded into scope by user direction after the plan review; lands in Phase 3 alongside the quick-start loop wiring (same file).

## Key Decisions

1. **Single project, five workstreams:** quick-mode project covering A–D plus the E quick-start discovery-completion fix (E folded in after the plan review).
2. **Shared primitive for C and D:** both are a bounded auto subagent-review loop over an artifact. Design it once, apply it twice, so the two stay consistent and it can later generalize to spec/design artifact reviews.
3. **Invocability is offer-and-confirm, never silent:** model-invocability is opt-in per skill with mandatory offer + gating predicates.
4. **docs-pr enforcement dropped:** not a real defect (confirmed by history).

## Constraints

- Follows OAT skill-authoring conventions (`create-oat-skill` template): step indicators match actual steps; required sections present.
- Per-skill `version:` bump for every changed `.agents/skills/*/SKILL.md` (and `oat-reviewer.md` if the agent changes), per AGENTS.md and dogfooding-update needs.
- **Release guardrail:** changes under `.agents/skills`, `.agents/agents`, and any `packages/cli/src` work (the resolver/CLI) require the five lockstep public packages (`cli`, `control-plane`, `docs-config`, `docs-theme`, `docs-transforms`) to bump together, and `pnpm release:validate` must pass before done.
- Definition of done includes `pnpm build && pnpm lint && pnpm format && pnpm type-check && pnpm test` and `pnpm release:validate`.
- Provider-agnostic dispatch: subagent loops must degrade through the established Tier 1 → Tier 2 fallback (not all hosts can spawn subagents).

## Success Criteria

- The agreed subset of skills (A) is model-invokable with offer-and-confirm behavior and gating that suppresses unsolicited invocation; descriptions follow the #71 pattern.
- Natural-language "process review" / "review project" resolves an appropriate target (B) and routes to the correct receive/provide skill.
- Writing a `plan.md` via any of the three paths automatically runs a bounded reviewer loop and records a `plan` review row (C).
- Running either analyze skill automatically produces a verified analysis artifact before its `-apply` step (D).
- C and D share a single documented auto-review-loop primitive.
- A quick-start run that chooses lightweight design leaves `discovery.md` `oat_status: complete` before plan generation (E).
- All quality gates pass, including `pnpm release:validate` with the lockstep version bumps.

## Out of Scope

- `docs-pr` post-implement enforcement fix (dropped — not a defect here).
- Making the remaining hard-gated lifecycle skills (new/complete/implement/quick-start/design/spec/plan) model-invokable.
- Auto-review loops for spec/design artifacts (C is plan-only for now; generalization is a noted future extension, not this project).
- Changes to the stoa repo (separate; user will run `oat tools update` there independently).

## Open Questions

1. **B – discovery mechanism:** new CLI command (`oat review latest`) vs. shared helper centralizing the existing inline `find`; exactly which ad-hoc review locations to scan.
2. **C/D – reviewer shape:** extend `oat-reviewer` for "analysis artifact" review vs. a dedicated thin reviewer agent.
3. **C/D – loop policy:** loop bound (max cycles), auto-apply-fixes vs. offer-fixes, and how findings fold back into the artifact.
4. **C – default on/off:** auto-on for all three plan paths vs. config-gated (`workflow.*` key) with opt-out.
5. **A – final set + gating:** include/exclude `oat-project-revise`; exact gating predicates per skill.

## Next Steps

- **Quick mode → optional lightweight design:** produce a focused `design.md` for the shared auto-review-loop primitive (C/D) and the review-discovery mechanism (B) before planning — discovery surfaced a genuinely new architectural pattern.

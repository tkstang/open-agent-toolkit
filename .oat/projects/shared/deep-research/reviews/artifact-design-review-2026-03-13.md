---
oat_generated: true
oat_generated_at: 2026-03-13
oat_review_scope: design
oat_review_type: artifact
oat_project: .oat/projects/shared/deep-research
---

# Artifact Review: design

**Reviewed:** 2026-03-13
**Scope:** Design artifact review for the `deep-research` quick-mode project
**Files reviewed:** 2
**Commits:** N/A

## Summary

The design is directionally strong and captures the intended research suite structure, but it is not ready to drive plan generation yet. The current draft has a blocking contradiction in `/deep-research` fallback behavior and leaves several orchestrator contracts underspecified, which would force implementation decisions during planning instead of before it.

Artifacts used for this review: `discovery.md`, `design.md`, `plan.md`, and `implementation.md`.

## Findings

### Critical

- `/deep-research` has an unresolved contract contradiction between the shared 3-tier dispatch model and its own artifact-only guarantee. The dispatch section defines Tier 3 as `Inline (last resort)` for all three skills, but the `/deep-research` interface says it always produces an artifact and is never inline-only. This leaves the orchestrator's fallback behavior internally inconsistent and misaligned with discovery. References: [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L47), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L75), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L206), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L46), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L58)

### Important

- The schema model is underspecified for conditional `/compare` dispatch. The design says one extended schema is selected before research begins, but `/compare` is invoked only later if competing options emerge and returns comparative output. The document does not define whether `/deep-research` can switch schemas mid-run or how comparative output is embedded into a non-comparative artifact. References: [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L105), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L223), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L232), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L233)
- The orchestrator depends on worker contracts that are not actually designed. `research-angle sub-agents` are shown as the primary execution mechanism and `/compare` is treated as a sub-agent path, but the document only defines the `skeptical-evaluator` contract. There is no request/response contract for research-angle workers, no aggregation contract, and no invocation contract for `/compare` inside `/deep-research`. References: [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L36), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L108), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L198), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L233), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L237)
- The design expands scope beyond discovery without acknowledging the change. Discovery explicitly marked sub-agent definition files and full schema template files as out of scope, but the design turns both into concrete deliverables with file locations and filenames. That makes the design misaligned with the upstream artifact and risks pushing extra work into planning without approval. References: [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L73), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L74), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L13), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L241), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L263)

### Medium

- Cross-provider behavior is incomplete for a stated target environment. Discovery requires compatibility with Claude.ai, but the dispatch section only defines Claude Code, Cursor, and Codex behavior. The design should explicitly define Claude.ai's expected tier or fallback path. References: [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L50), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L56), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L57), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L61)
- The testing section is scenario-based, but it does not map discovery success criteria to explicit verification targets. That leaves plan generation without a clear requirement-to-test bridge for graceful degradation, cross-provider behavior, and output-mode guarantees. References: [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L64), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L278), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L301)

### Minor

None.

## Spec/Design Alignment

### Requirements Coverage

| Requirement                           | Status      | Notes                                                                                                                                                   |
| ------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Three-skill layered suite             | partial     | The architecture covers the three skills, but `/deep-research` fallback behavior and orchestration contracts are not consistent enough to plan against. |
| Cross-provider compatibility          | partial     | Claude Code, Cursor, and Codex are described, but Claude.ai handling is not specified.                                                                  |
| `/skeptic` inline-only output         | implemented | The design keeps `/skeptic` inline-only and defines the skeptical evaluator contract.                                                                   |
| `/deep-research` artifact-only output | missing     | The shared tier model still allows inline fallback, contradicting the artifact-only requirement.                                                        |
| Graceful degradation across providers | partial     | The tier model exists, but key fallback details are missing for `/deep-research` and Claude.ai.                                                         |

### Extra Work (not in requirements)

- Concrete schema template files and sub-agent definition files are introduced as deliverables even though discovery deferred them as out of scope.

## Verification Commands

- `sed -n '1,260p' /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md`
- `sed -n '1,320p' /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md`
- `sed -n '1,260p' /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/plan.md`
- `sed -n '1,200p' /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/implementation.md`

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.

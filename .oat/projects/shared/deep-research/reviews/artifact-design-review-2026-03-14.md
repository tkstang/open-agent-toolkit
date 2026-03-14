---
oat_generated: true
oat_generated_at: 2026-03-14
oat_review_scope: design
oat_review_type: artifact
oat_project: .oat/projects/shared/deep-research
---

# Artifact Review: design

**Reviewed:** 2026-03-14
**Scope:** Design artifact re-review for the `deep-research` quick-mode project
**Files reviewed:** 2
**Commits:** N/A

## Summary

This re-review resolves several earlier design issues: the artifact-only execution contradiction is gone, `/deep-research` and `/analyze` now distinguish output format from execution tier, and the design is broader and clearer about the five-skill suite. Even so, the design is still not ready for plan generation because the core parallel Tier 1 execution path is not concretely designed, and several orchestration metadata contracts remain ambiguous.

Artifacts used for this review: `discovery.md`, `design.md`, `plan.md`, `implementation.md`, and the archived prior design review.

## Findings

### Critical

- The primary Tier 1 execution path for `/deep-research` and `/analyze` is still not fully designed. The dispatch model requires a resolved agent or role for provider-native sub-agent execution, but the worker sections say research-angle and analysis-angle workers are generic and have no dedicated agent definitions. That leaves the core parallel sub-agent mechanism unspecified for key providers even though discovery treats parallel orchestration as a first-class behavior. References: [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L77), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L78), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L134), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L150), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L292), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L359), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L52), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L91), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L92)

### Important

- The `/compare` sub-agent contract is still internally inconsistent. One section says sub-agent invocation from `/deep-research` uses `/compare` in artifact mode, while the `/deep-research` contract says `/compare` returns inline to the orchestrator and writes no intermediate file. That ambiguity would force implementers to invent the I/O contract during planning. References: [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L247), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L299), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L301), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L302), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L366), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L539)
- `/deep-research` still lacks a complete `--context` contract in its own interface and flow. Discovery makes `--context path` a cross-cutting input, and the design repeats the convention globally, but the `/deep-research` interface and flow never show where the context is read or how it changes classification, angle planning, or synthesis. References: [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L58), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L68), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L82), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L21), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L131), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L264), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L447)
- `/synthesize` still depends on an undefined artifact frontmatter contract. The design says directory mode filters by structured artifact frontmatter and combines that metadata with model-tagged filenames for discovery and provenance, but it never specifies which frontmatter keys artifact-producing skills must emit. The shared schema section only defines Markdown body templates, so the metadata contract required for auto-detection is still missing. References: [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L64), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L93), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L396), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L398), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L443), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L507)

### Medium

- The verification approach still does not explicitly cover all required providers. Discovery requires Claude Code, Cursor, Codex, and Claude.ai compatibility, but the testing section only names concrete validation steps for Claude Code and Cursor. References: [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L52), [discovery.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md#L76), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L558), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L577), [design.md](/Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md#L581)

### Minor

None.

## Spec/Design Alignment

### Requirements Coverage

| Requirement                                      | Status      | Notes                                                                                                                               |
| ------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Five-skill layered suite                         | implemented | Design now covers `/skeptic`, `/compare`, `/deep-research`, `/analyze`, and `/synthesize`.                                          |
| Parallel orchestration for research and analysis | partial     | Tier 1 is described, but the actual worker-role contract remains underspecified.                                                    |
| `/compare` reuse from orchestrators              | partial     | The intention is clear, but the sub-agent I/O contract is still contradictory.                                                      |
| `--context` cross-cutting convention             | partial     | The global convention exists, but `/deep-research` does not yet thread it through its own interface and flow.                       |
| Provenance-aware synthesis                       | partial     | Model-tagged filenames are defined, but the artifact frontmatter contract needed for `/synthesize` auto-detection is still missing. |

### Extra Work (not in requirements)

None beyond the already acknowledged scope expansion, but the design still leaves key metadata and worker-contract details implicit.

## Verification Commands

- `sed -n '1,260p' /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/discovery.md`
- `sed -n '1,520p' /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/design.md`
- `sed -n '1,260p' /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/plan.md`
- `sed -n '1,200p' /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/implementation.md`
- `sed -n '1,240p' /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/deep-research/reviews/archived/artifact-design-review-2026-03-13.md`

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.

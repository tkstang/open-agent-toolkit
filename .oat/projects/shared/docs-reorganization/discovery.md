---
oat_status: complete
oat_ready_for: plan
oat_blockers: []
oat_last_updated: 2026-03-11
oat_generated: false
---

# Discovery: docs-reorganization

## Phase Guardrails (Discovery)

Discovery is for requirements and decisions, not implementation details.

- Prefer outcomes and constraints over concrete deliverables.
- Capture implementation-sensitive questions as design concerns unless they are already resolved by current repo state.

## Initial Request

User identified that OAT documentation coverage is strong but organization needs improvement. A quick-mode project and implementation plan were drafted on March 10, 2026. Since then, several major PRs merged, including the completed Fumadocs migration for `apps/oat-docs`, guided `oat init` setup, canonical rule sync/adoption updates, new `oat repo pr-comments` commands, and workflow-doc refinements. The request is to reopen the project, review those merged changes and related project artifacts, and fold the current repo reality back into discovery, design, and plan before implementation starts.

## Clarifying Questions

### Question 1: Audience Separation

**Q:** Should docs distinguish between consumer-facing (users of OAT) and internal/developer-facing content?
**A:** Yes. Consumer docs and contributor docs should be visibly separated, with cross-links instead of duplicated content.
**Decision:** The navigation should make the audience split explicit via a user-facing `guide/` section and a contributor-facing `contributing/` section.

### Question 2: Contributing Section Granularity

**Q:** Should the Contributing section be a single page or broken into focused sub-pages?
**A:** Break it out into focused pages.
**Decision:** Contributing becomes a multi-page developer guide with separate routing for code, docs, markdown features, and skill authoring.

### Question 3: Re-baseline Against Merged Work

**Q:** Should the project be revised against the merged work that landed after the original plan was written?
**A:** Yes.
**Decision:** The reorganization must target the current docs app and current command surface, not the March 10 snapshot.

## Solution Space

### Approach 1: Audience-Driven Restructure on Current Docs Architecture _(Recommended)_

**Description:** Reorganize the docs tree around user and contributor journeys while preserving the current Fumadocs app contract, generated docs surface index, and cross-links into durable reference material. Incorporate newly merged command surfaces into the revised information architecture instead of treating them as follow-up cleanup.

**When this is the right choice:** When documentation coverage is already broad, but the navigation and page grouping no longer match how users discover the current product.

**Tradeoffs:** Requires a more deliberate move plan, repo-wide stale-link cleanup, and a design pass to account for the post-migration docs pipeline.

### Approach 2: Minimal Navigation Cleanup

**Description:** Keep the existing top-level sections and only adjust ordering, index pages, and a few cross-links.

**When this is the right choice:** When repo structure is basically correct and only a few pages are misplaced.

**Tradeoffs:** It would not address audience mixing, would leave the new merged docs surfaces scattered across old sections, and would preserve the pre-migration mental model the repo has already moved beyond.

### Chosen Direction

**Approach:** Audience-Driven Restructure on Current Docs Architecture
**Rationale:** The problem is now bigger than page order. The repo has a new docs runtime, newly expanded CLI surfaces, and updated workflow docs. The right move is to reorganize around user intent while explicitly honoring the current `apps/oat-docs` architecture and generated-docs contract.
**User validated:** Yes

## Key Decisions

1. **Audience split stays primary:** User-facing docs live under `guide/`; contributor-facing docs live under `contributing/`; durable shared material stays in `reference/`.
2. **Provider sync is still elevated:** Provider interop remains a top-level user-guide topic and must explicitly incorporate canonical rule sync/adoption changes from PR #62.
3. **Workflow and projects merge into one guide section:** The merged section should absorb both lifecycle docs and project artifact/state docs.
4. **Repository analysis belongs with workflow/review docs:** The new `oat repo pr-comments ...` material supports review and PR learning loops on merged work and should be placed intentionally within the workflow-oriented user guide.
5. **Documentation docs must reflect both frameworks:** The live app is Fumadocs, but the product still supports MkDocs scaffolding and migration flows. Reorganized docs cannot pretend OAT is Fumadocs-only.
6. **Generated docs surface is part of the contract:** `apps/oat-docs/index.md` is generated output and must be refreshed from the docs tree instead of manually curated.
7. **Old-path cleanup replaces redirect work:** There is no live docs site requiring redirects yet. The requirement is repo-wide stale-reference cleanup before old paths are removed.
8. **Quick mode needs a lightweight design pass:** The merged docs/runtime changes introduced enough architectural nuance that the project should not go straight from discovery to implementation anymore.

## Constraints

- No content deletion. This is an information-architecture reorganization, not a scope reduction.
- The active docs app is `apps/oat-docs`, a Fumadocs/Next.js app using `source.config.ts`, `@oat/docs-config`, `@oat/docs-theme`, and `@oat/docs-transforms`. `apps/oat-docs/mkdocs.yml` is not part of the current app.
- OAT still ships docs commands for both Fumadocs and MkDocs (`oat docs init`, `oat docs migrate`, `oat docs nav sync`), so the documentation must preserve those product-level paths.
- Every documentation directory must maintain the `index.md` + `## Contents` contract.
- Mermaid diagrams and tabbed content must remain compatible with the Fumadocs transform pipeline already in the repo.
- Old directories can be removed only after repo-wide searches confirm no stale links or references remain.

## Success Criteria

- Every moved or rewritten page has a clear primary audience: user, contributor, or shared reference.
- Homepage and quickstart route users to the right path within two clicks: provider sync, workflow/projects, docs app setup, or contributing guidance.
- Guided `oat init`, canonical rule sync/adoption, and `oat repo pr-comments` command surfaces are placed in sections that match their purpose.
- `apps/oat-docs/index.md` is regenerated from the new tree and reflects the reorganized sections.
- No stale references remain to retired legacy paths after cleanup.
- The reorganized docs pass the Fumadocs build and markdown quality gates used by the repo.

## Out of Scope

- Changing the runtime behavior of the docs app or CLI commands.
- Rewriting OAT concepts from scratch beyond what is needed to synthesize existing content into clearer landing pages.
- Introducing a redirect system for a live docs deployment.
- Non-docs code changes outside what is necessary for docs verification commands already present in the repo.

## Deferred Ideas

- Interactive provider comparison or workflow chooser components in the docs UI.
- Search UX changes beyond what falls out of the existing generated index and Fumadocs search support.
- Automatic reference generation from CLI help output.

## Open Questions

- **Cleanup sequencing:** Whether old section stubs are useful for intermediate commits, or whether the move can go straight to full stale-path cleanup once repo-wide audits pass.
- **CLI detail balance:** How much command detail should remain on the topical pages versus the new `guide/cli-reference.md`.

## Assumptions

- `apps/oat-docs` remains the canonical docs app throughout this project.
- `pnpm -w run cli -- docs generate-index --docs-dir apps/oat-docs/docs --output apps/oat-docs/index.md` remains the canonical way to refresh the app-root docs index.
- The merged docs pages in `apps/oat-docs/docs/**` are the correct baseline for reorganizing current content.

## Risks

- **Stale relative links after moves:** Moving pages will break links unless relative paths are updated carefully.
  - **Likelihood:** High
  - **Impact:** Medium
  - **Mitigation:** Use repo-wide stale-path searches plus per-file link checks before deleting legacy directories.

- **Generated surface drift:** The docs tree could move successfully while `apps/oat-docs/index.md` stays out of date.
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation:** Treat generated-index refresh as a first-class plan task and final verification step.

- **Audience split could hide command docs:** If CLI detail is moved too aggressively, contributors may lose obvious entry points.
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation:** Keep a shallow CLI reference page in the user guide and cross-link deeply into topical pages.

## Next Steps

This quick-mode project should now use the optional lightweight design path before implementation. `design.md` should lock the current docs-app architecture, generated-index flow, and cleanup strategy, then `plan.md` should execute against that rebased design. Once those artifacts are aligned, the project is ready for `oat-project-implement`.

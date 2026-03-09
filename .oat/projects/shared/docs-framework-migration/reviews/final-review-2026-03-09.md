---
oat_generated: true
oat_generated_at: 2026-03-09
oat_review_scope: final
oat_review_type: code
oat_project: /Users/thomas.stang/Code/open-agent-toolkit/.worktrees/open-agent-toolkit/migrate-docs-framework/.oat/projects/shared/docs-framework-migration
---

# Code Review: final

**Reviewed:** 2026-03-09
**Scope:** Final implementation review for `docs-framework-migration` (`d954bfc70e75f21454df5e2fb08c563cf4c53eaf..HEAD`)
**Files reviewed:** 72
**Commits:** 49 commits (`d954bfc70e75f21454df5e2fb08c563cf4c53eaf..HEAD`)

## Summary

The branch lands most of the planned surface, but three P0 requirement gaps are still open in the shipped CLI and scaffold: the generated docs index contract is inverted, the Fumadocs scaffold never generates the required app-root AI index, and the shared config package never wires Mermaid/FlexSearch into the runtime pipeline. I also hit a red CLI verification path while reviewing: the new docs-init integration tests race on the shared bundled-assets directory and fail when run together.

## Findings

### Critical

- **Docs index generation targets the wrong artifact and corrupts `documentation.index`** (`packages/cli/src/commands/docs/index-generate/index.ts:60`, `packages/cli/src/commands/docs/index-generate/index.ts:73`, `packages/cli/src/commands/docs/init/scaffold.ts:175`, `packages/cli/src/commands/docs/init/index.ts:71`)
  - Issue: `oat docs index-generate` defaults to `join(docsDir, "index.md")`, so it overwrites the authored `docs/index.md` home page instead of creating the app-root `index.md` discoverability artifact required by FR6. The same flow then writes that absolute output path back into `.oat/config.json`, while `docs init` seeds Fumadocs with `documentation.index = <target>/docs/index.md`, so both the generated file and the config pointer end up aimed at the wrong surface.
  - Fix: Make the generated index live at the docs app root, keep `documentation.index` repo-relative, and update both `docs init` and `docs index generate` to agree on the same artifact path.
  - Requirement: FR6, FR7

- **The Fumadocs scaffold never produces the required app-root index artifact automatically** (`.oat/templates/docs-app-fuma/package.json.template:7`, `packages/cli/src/commands/docs/init/scaffold.ts:175`)
  - Issue: The Fumadocs template only exposes raw `next dev` / `next build` scripts. There is no `oat docs index generate` script and no pre-dev/pre-build integration, so a freshly scaffolded app never generates the AI-facing `index.md` artifact the spec/design require. Combined with the wrong `documentation.index` default, consumers are left with no working discoverability entry point at all.
  - Fix: Add a package-manager-agnostic docs-index script to the template and wire it into the dev/build lifecycle so scaffolded repos continuously regenerate the app-root index before Next runs.
  - Requirement: FR6, NFR2

- **Mermaid and static search are not actually wired into the shared docs pipeline** (`packages/docs-config/src/source-config.ts:14`, `packages/docs-config/src/search-config.ts:6`, `.oat/templates/docs-app-fuma/source.config.ts:10`)
  - Issue: `createSourceConfig()` only returns `remarkTabs` and `remarkAlert`, and nothing in the scaffold or shared packages consumes `createSearchConfig()`. The branch therefore does not implement the promised `remarkMdxMermaid`/Mermaid integration or FlexSearch static-search wiring from FR2, even though both features are called out in the spec, design, and scaffold docs.
  - Fix: Wire the Mermaid remark plugin and component mapping through `@oat/docs-config`/the scaffolded app, and connect the exported search config into the Fumadocs setup so static search is enabled by default.
  - Requirement: FR2, NFR3

### Important

- **The new docs-init integration coverage is currently red because bundled assets are rebuilt into a shared mutable directory** (`packages/cli/src/commands/docs/init/integration.test.ts:11`, `packages/cli/src/commands/docs/init/mkdocs-compat.test.ts:11`, `packages/cli/scripts/bundle-assets.sh:8`)
  - Issue: Both integration suites call `bundle-assets.sh`, and that script begins by deleting `packages/cli/assets`. When the test files run together under Vitest, they race on that shared directory; during review, `pnpm --filter @oat/cli exec vitest run src/commands/docs/e2e-pipeline.test.ts src/commands/docs/init/integration.test.ts src/commands/docs/init/mkdocs-compat.test.ts src/commands/docs/init/scaffold.test.ts src/commands/docs/index-generate/generator.test.ts` failed with `cp: ... No such file or directory`.
  - Fix: Make asset bundling test-local or serialized, or teach the script/tests to use isolated temp output directories so package verification is stable under normal parallel test execution.

### Medium

- **The CLI surface does not match the reviewed command contract** (`packages/cli/src/commands/docs/index.ts:14`, `packages/cli/src/commands/docs/index-generate/index.ts:118`)
  - Issue: The implementation ships `oat docs index-generate`, while the spec/design/plan describe `oat docs index generate`. That mismatch will break examples and any downstream automation written against the reviewed command shape.
  - Fix: Expose the nested command form (or an alias) and add command-level coverage so future renames cannot silently drift.

### Minor

None

## Requirements/Design Alignment

**Evidence sources used:** `spec.md`, `design.md`, `plan.md`, `implementation.md`, `state.md`, `reviews/artifact-design-review-2026-03-08-v2.md`, `reviews/artifact-plan-review-2026-03-08.md`, branch diff for `d954bfc70e75f21454df5e2fb08c563cf4c53eaf..HEAD`

**Deferred Findings Ledger (final scope):**
- Deferred Medium count: 0
- Deferred Minor count: 0
- None

| Requirement | Status | Notes |
|-------------|--------|-------|
| FR1 | implemented | `docs init` scaffolds both Fumadocs and MkDocs and interpolates title/description. |
| FR2 | partial | Tabs/callouts are wired, but Mermaid and FlexSearch are not actually integrated. |
| FR3 | implemented | `remarkTabs` ships with focused unit coverage. |
| FR4 | implemented | Shared layout/page/Mermaid components and scaffolded theme surface are present. |
| FR5 | implemented | Migration codemod and frontmatter injection land with fixture/e2e coverage. |
| FR6 | missing | Index generation writes to the authored docs page and is not integrated into scaffold scripts. |
| FR7 | partial | `documentation.index` exists, but Fumadocs writes the wrong target and serializes absolute paths. |
| FR8 | implemented | MkDocs scaffold is preserved alongside the new Fumadocs option. |
| NFR1 | implemented | Content pipeline remains plain markdown. |
| NFR2 | partial | Scaffold scripts do not yet automate index generation in a package-manager-agnostic way. |
| NFR3 | partial | Static export is configured, but static search/Mermaid wiring is incomplete. |
| NFR4 | implemented | Branding remains configurable and repo-local. |
| NFR5 | partial | Thin-scaffold structure is in place, but the missing index/search contract would force follow-up scaffold changes. |

### Extra Work (not in requirements)

None identified.

## Verification Commands

Executed during review:

```bash
git -C /Users/thomas.stang/Code/open-agent-toolkit/.worktrees/open-agent-toolkit/migrate-docs-framework diff --name-only d954bfc70e75f21454df5e2fb08c563cf4c53eaf..HEAD
git -C /Users/thomas.stang/Code/open-agent-toolkit/.worktrees/open-agent-toolkit/migrate-docs-framework log --oneline d954bfc70e75f21454df5e2fb08c563cf4c53eaf..HEAD
pnpm --filter @oat/docs-config exec vitest run src/next-config.test.ts src/source-config.test.ts src/search-config.test.ts
pnpm --filter @oat/docs-transforms exec vitest run src/remark-tabs.test.ts
pnpm --filter @oat/cli exec vitest run src/commands/docs/e2e-pipeline.test.ts src/commands/docs/init/integration.test.ts src/commands/docs/init/mkdocs-compat.test.ts src/commands/docs/init/scaffold.test.ts src/commands/docs/index-generate/generator.test.ts
```

Results:
- `@oat/docs-config` targeted tests: pass
- `@oat/docs-transforms` targeted tests: pass
- `@oat/cli` targeted docs tests: fail because `bundle-assets.sh` races on `packages/cli/assets`

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert these findings into plan tasks before merge.

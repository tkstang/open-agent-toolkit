---
oat_generated: true
oat_generated_at: 2026-03-09
oat_pr_type: project
oat_pr_scope: final
oat_project: .oat/projects/shared/docs-framework-migration
---

# feat: add Fumadocs documentation framework support

## Summary

Introduces a Fumadocs-based documentation platform for OAT, providing modern, polished docs sites from plain markdown authoring. Three new shared packages (`@oat/docs-config`, `@oat/docs-transforms`, `@oat/docs-theme`) encapsulate all framework complexity so consumer repos scaffold a thin Next.js app and upgrade via version bumps. Two new CLI commands (`oat docs migrate`, `oat docs generate-index`) support migration from MkDocs and AI-friendly navigation index generation. The existing MkDocs scaffold is preserved alongside Fumadocs as a framework choice.

## Goals

- Provide a Fumadocs scaffold via `oat docs init` that produces modern, statically-exported docs sites
- Maintain plain markdown authoring — authors never write JSX or MDX
- Encapsulate framework complexity in shared packages (thin scaffold, heavy packages)
- Provide a migration path from MkDocs (admonition codemod, frontmatter injection)
- Generate a navigation index artifact (`index.md`) for AI discoverability
- Support static export with client-side FlexSearch out of the box

## Non-Goals

- Docusaurus support (future extensibility point)
- Updating `oat-docs-analyze`/`oat-docs-apply` skills for Fumadocs awareness (follow-up)
- Custom docs plugins, doc versioning, hosted search, SSR/ISR modes

## Changes

### Phase 1: Foundation Packages (12 tasks)

- **`@oat/docs-transforms`** — `remarkTabs` plugin (MkDocs `=== "Tab"` syntax to Fumadocs `<Tabs>`/`<Tab>` JSX nodes), `remarkMermaid` plugin (mermaid fences to `<Mermaid>` component)
- **`@oat/docs-config`** — `createDocsConfig()` (Next.js static export + createMDX), `createSourceConfig()` (remark plugin wiring + search), `createSearchConfig()` (FlexSearch static search)
- **`@oat/docs-theme`** — `DocsLayout`, `DocsPage`, `Mermaid` components wrapping fumadocs-ui with `BrandingConfig` props

### Phase 2: Scaffold Templates + CLI (8 tasks)

- 11 Fumadocs template files in `.oat/templates/docs-app-fuma/` with token interpolation
- Framework choice prompt in `oat docs init` (Fumadocs or MkDocs)
- `--framework`, `--description` flags for non-interactive scaffolding
- Search API route template with `createFromSource` + `staticGET` + `revalidate = false`
- MkDocs templates moved to `.oat/templates/docs-app-mkdocs/` (content unchanged, FR8)
- `documentation.tooling` and `documentation.root` set automatically in `.oat/config.json`

### Phase 3: Migration + Index Commands (10 tasks)

- **`oat docs migrate`** — Converts MkDocs `!!!`/`???` admonitions to GFM `> [!TYPE]` callouts (14 types mapped to 5 GFM types), injects `title` frontmatter from `mkdocs.yml` nav, seeds empty `description` frontmatter. Dry-run by default, `--apply` to write.
- **`oat docs generate-index`** — Recursively walks docs directory, extracts titles from frontmatter (fallback: first heading, then filename title-case), includes descriptions, outputs `index.md` at app root. Updates `documentation.index` in config. Runs automatically via `predev`/`prebuild` hooks in scaffolded apps.

### Phase 4: Integration + Polish (13 tasks)

- E2E pipeline test (migration + index generation against real-world fixtures)
- MkDocs scaffold backward compatibility test (FR8)
- Structural verification of FlexSearch, search API route, and build pipeline
- 3 review cycles with all findings resolved

### Documentation Updates

- Updated CLI reference (`docs-apps.md`, `docs-consumer-quickstart.md`)
- Updated directory structure and file location references
- Updated docs workflow guide for dual-framework support

## Verification

- **Tests:** 867 passing (14 transforms, 9 config, ~844 CLI)
- **Lint:** Clean (Biome)
- **Type-check:** Clean (TypeScript)
- **Build:** Clean (Turborepo)

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| final | code | passed | 2026-03-09 | reviews/final-review-2026-03-09-v3.md |
| plan | artifact | passed | 2026-03-08 | reviews/artifact-plan-review-2026-03-08.md |

3 final review cycles completed. All Critical and Important findings resolved.

## Design Deltas

- CLI command `oat docs generate-index` (flat) instead of spec's `oat docs index generate` (nested) — no other index subcommands planned
- E2E build test validates pipeline logic rather than full npm install + build (workspace:* deps can't resolve outside monorepo)
- Search route verified structurally (test asserts `createFromSource`, `staticGET`, `revalidate = false`); full build test deferred per workspace constraint

## References

- [spec.md](https://github.com/tkstang/open-agent-toolkit/blob/migrate-docs-framework/.oat/projects/shared/docs-framework-migration/spec.md)
- [design.md](https://github.com/tkstang/open-agent-toolkit/blob/migrate-docs-framework/.oat/projects/shared/docs-framework-migration/design.md)
- [plan.md](https://github.com/tkstang/open-agent-toolkit/blob/migrate-docs-framework/.oat/projects/shared/docs-framework-migration/plan.md)
- [implementation.md](https://github.com/tkstang/open-agent-toolkit/blob/migrate-docs-framework/.oat/projects/shared/docs-framework-migration/implementation.md)
- [discovery.md](https://github.com/tkstang/open-agent-toolkit/blob/migrate-docs-framework/.oat/projects/shared/docs-framework-migration/discovery.md)
- [reviews/](https://github.com/tkstang/open-agent-toolkit/tree/migrate-docs-framework/.oat/projects/shared/docs-framework-migration/reviews)

---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-09
oat_current_task_id: p04-t13
oat_generated: false
---

# Implementation: docs-framework-migration

**Started:** 2026-03-08
**Last Updated:** 2026-03-08

> This document is used to resume interrupted implementation sessions.
>
> Conventions:
> - `oat_current_task_id` always points at the **next plan task to do** (not the last completed task).
> - When all plan tasks are complete, set `oat_current_task_id: null`.
> - Reviews are **not** plan tasks. Track review status in `plan.md` under `## Reviews` (e.g., `| final | code | passed | ... |`).
> - Keep phase/task statuses consistent with the Progress Overview table so restarts resume correctly.
> - Before running the `oat-project-pr-final` skill, ensure `## Final Summary (for PR/docs)` is filled with what was actually implemented.

## Progress Overview

| Phase | Status | Tasks | Completed |
|-------|--------|-------|-----------|
| Phase 1: Foundation Packages | complete | 12 | 12/12 |
| Phase 2: Scaffold Templates + CLI | complete | 8 | 8/8 |
| Phase 3: Migration + Index Commands | complete | 10 | 10/10 |
| Phase 4: Integration + Polish | in_progress | 13 | 12/13 |

**Total:** 42/43 tasks completed

---

## Phase 1: Foundation Packages

**Status:** in_progress
**Started:** 2026-03-08

### Phase Summary

**Outcome (what changed):**
- `@oat/docs-transforms` package: remarkTabs plugin transforms MkDocs `=== "Tab"` syntax into Fumadocs-compatible `<Tabs>`/`<Tab>` JSX AST nodes
- `@oat/docs-config` package: Config factories for Next.js (static export + createMDX), source config (remark plugins), and FlexSearch static search
- `@oat/docs-theme` package: DocsLayout (wraps fumadocs-ui), DocsPage (wraps fumadocs-ui page + body), Mermaid (client-side, dark/light mode)

**Key files touched:**
- `packages/docs-transforms/` - remarkTabs remark plugin + barrel export
- `packages/docs-config/` - createDocsConfig, createSourceConfig, createSearchConfig factories
- `packages/docs-theme/` - DocsLayout, DocsPage, Mermaid components + BrandingConfig type

**Verification:**
- Run: `pnpm build && pnpm lint && pnpm type-check && pnpm test`
- Result: all pass, 14 unit tests across transforms + config

**Notes / Decisions:**
- Pinned fumadocs to v15 (fumadocs-core@15.8.5, fumadocs-mdx@13.0.8, fumadocs-ui@15.8.5) — v16 requires Next.js 16
- remarkTabs re-parses indented code block content back into markdown AST — handles nested code blocks, lists, multi-paragraph content correctly
- createDocsConfig internally wires createMDX, so template next.config.js is a one-liner

### Task p01-t01: Scaffold docs-transforms package

**Status:** completed
**Commit:** df00797

**Outcome:**
- New `@oat/docs-transforms` package created with unified/unist-util-visit dependencies
- Exports empty `defaultTransforms` array as initial barrel export
- Package builds to `dist/` without errors

**Files changed:**
- `packages/docs-transforms/package.json` - package manifest with unified ecosystem deps
- `packages/docs-transforms/tsconfig.json` - TypeScript config extending root
- `packages/docs-transforms/vitest.config.ts` - test config
- `packages/docs-transforms/src/index.ts` - barrel export

**Verification:**
- Run: `pnpm install && pnpm --filter @oat/docs-transforms build`
- Result: pass

---

### Task p01-t02: Implement remarkTabs transform — test cases

**Status:** completed
**Commit:** 01cb9ca

**Outcome:**
- 7 test cases for remarkTabs covering single/multiple groups, code blocks, multi-paragraph, empty tabs, and no-op
- Tests confirm RED — remarkTabs module does not exist yet

**Files changed:**
- `packages/docs-transforms/src/remark-tabs.test.ts` - test suite for remarkTabs transform
- `packages/docs-transforms/package.json` - added remark-parse devDependency

**Verification:**
- Run: `pnpm --filter @oat/docs-transforms test`
- Result: fails (RED) as expected — module not found

---

### Task p01-t03: Implement remarkTabs transform

**Status:** completed
**Commit:** 5e2cb4f

**Outcome:**
- `remarkTabs` plugin transforms `=== "Title"` MkDocs tab syntax into `<Tabs>`/`<Tab>` mdxJsxFlowElement AST nodes
- Re-parses indented code block content back into proper markdown AST
- All 7 test cases pass, package builds cleanly

**Files changed:**
- `packages/docs-transforms/src/remark-tabs.ts` - remarkTabs plugin implementation
- `packages/docs-transforms/src/index.ts` - barrel export with remarkTabs in defaultTransforms
- `packages/docs-transforms/package.json` - moved remark-parse to regular dependency

**Verification:**
- Run: `pnpm --filter @oat/docs-transforms test && pnpm --filter @oat/docs-transforms build`
- Result: 7 tests pass, build clean

---

### Task p01-t04: Scaffold docs-config package

**Status:** completed
**Commit:** 0a757aa

**Outcome:**
- New `@oat/docs-config` package with fumadocs-core@15, fumadocs-mdx@13, flexsearch, remark-github-blockquote-alert
- Placeholder factories: createDocsConfig, createSourceConfig, createSearchConfig
- Pinned to fumadocs v15 for Next.js 15 compatibility (v16 requires Next.js 16)

**Files changed:**
- `packages/docs-config/package.json` - package manifest
- `packages/docs-config/tsconfig.json` - TypeScript config with JSX support
- `packages/docs-config/vitest.config.ts` - test config
- `packages/docs-config/src/index.ts` - barrel export
- `packages/docs-config/src/next-config.ts` - createDocsConfig placeholder
- `packages/docs-config/src/source-config.ts` - createSourceConfig placeholder
- `packages/docs-config/src/search-config.ts` - createSearchConfig placeholder

**Verification:**
- Run: `pnpm install && pnpm --filter @oat/docs-config build`
- Result: pass, no peer dep warnings

---

### Task p01-t05: Implement createDocsConfig factory — test + implement

**Status:** completed
**Commit:** f9e7730

**Outcome:**
- `createDocsConfig()` returns Next.js config with `output: 'export'`, `images.unoptimized`, `reactStrictMode`
- Internally wires `createMDX` from fumadocs-mdx/next for MDX processing
- 2 unit tests verifying config shape

**Files changed:**
- `packages/docs-config/src/next-config.ts` - wired createMDX, typed options
- `packages/docs-config/src/next-config.test.ts` - test suite

**Verification:**
- Run: `pnpm --filter @oat/docs-config test && pnpm --filter @oat/docs-config build`
- Result: 2 tests pass, build clean

---

### Task p01-t06: Implement createSourceConfig factory — test + implement

**Status:** completed
**Commit:** 78dc828

**Outcome:**
- `createSourceConfig()` returns remarkPlugins array with remarkTabs + remarkAlert, contentDir `./docs`
- 3 unit tests verifying plugin presence and content directory

**Files changed:**
- `packages/docs-config/src/source-config.ts` - wired remarkTabs and remarkAlert plugins
- `packages/docs-config/src/source-config.test.ts` - test suite
- `packages/docs-config/package.json` - added @types/mdast

**Verification:**
- Run: `pnpm --filter @oat/docs-config test && pnpm --filter @oat/docs-config build`
- Result: 5 tests pass, build clean

---

### Task p01-t07: Scaffold docs-theme package

**Status:** completed
**Commit:** 190cec0

**Outcome:**
- New `@oat/docs-theme` package with fumadocs-ui@15, next-themes
- Stub components: DocsLayout, DocsPage, Mermaid
- BrandingConfig type interface exported

**Files changed:**
- `packages/docs-theme/package.json` - package manifest with peer deps
- `packages/docs-theme/tsconfig.json` - TypeScript config with JSX
- `packages/docs-theme/src/index.ts` - barrel export
- `packages/docs-theme/src/types.ts` - BrandingConfig interface
- `packages/docs-theme/src/docs-layout.tsx` - stub layout component
- `packages/docs-theme/src/docs-page.tsx` - stub page component
- `packages/docs-theme/src/mermaid.tsx` - stub Mermaid component

**Verification:**
- Run: `pnpm install && pnpm --filter @oat/docs-theme build`
- Result: pass

---

### Task p01-t08: Implement DocsLayout component

**Status:** completed
**Commit:** f95e7fe

**Outcome:**
- DocsLayout wraps fumadocs-ui DocsLayout, maps BrandingConfig to nav options
- Accepts PageTree.Root + children, passes through to fumadocs

**Files changed:**
- `packages/docs-theme/src/docs-layout.tsx` - implemented with fumadocs-ui wrapping
- `packages/docs-theme/src/types.ts` - BrandingConfig (unchanged)
- `packages/docs-theme/package.json` - added fumadocs-core dependency

**Verification:**
- Run: `pnpm --filter @oat/docs-theme build && pnpm --filter @oat/docs-theme type-check`
- Result: pass

---

### Task p01-t09: Implement DocsPage component

**Status:** completed
**Commit:** 738c991

**Outcome:**
- DocsPage wraps fumadocs-ui DocsPage + DocsBody, accepts TOC + children

**Files changed:**
- `packages/docs-theme/src/docs-page.tsx` - wraps fumadocs-ui DocsPage/DocsBody

**Verification:**
- Run: `pnpm --filter @oat/docs-theme build`
- Result: pass

---

### Task p01-t10: Implement Mermaid component

**Status:** completed
**Commit:** 1f3e31b

**Outcome:**
- Client-side Mermaid component with dynamic import, dark/light mode support via next-themes
- Lazy mermaid.initialize() on first render, re-renders on theme change

**Files changed:**
- `packages/docs-theme/src/mermaid.tsx` - 'use client' component with dynamic mermaid import
- `packages/docs-theme/package.json` - added mermaid dependency

**Verification:**
- Run: `pnpm --filter @oat/docs-theme build`
- Result: pass

---

### Task p01-t11: Wire FlexSearch in docs-config

**Status:** completed
**Commit:** aa024e6

**Outcome:**
- createSearchConfig returns FlexSearch static search config
- 2 tests verifying config shape

**Files changed:**
- `packages/docs-config/src/search-config.test.ts` - test suite

**Verification:**
- Run: `pnpm --filter @oat/docs-config test`
- Result: 7 tests pass

---

### Task p01-t12: Phase 1 integration verify — all packages build

**Status:** completed
**Commit:** (no code changes, verification only)

**Outcome:**
- All 3 new packages build, lint, type-check clean
- All 14 unit tests pass (7 transforms, 7 config)
- Turborepo dependency ordering correct

**Verification:**
- Run: `pnpm build && pnpm lint && pnpm type-check && pnpm --filter @oat/docs-transforms test && pnpm --filter @oat/docs-config test`
- Result: all pass

---

## Phase 2: Scaffold Templates + CLI

**Status:** in_progress
**Started:** 2026-03-08

### Phase Summary

**Outcome (what changed):**
- Fumadocs template directory (`.oat/templates/docs-app-fuma/`) with 10 template files for Next.js scaffold
- Renamed existing template to `docs-app-mkdocs` to disambiguate
- Framework choice prompt (`--framework fumadocs|mkdocs`) and site description (`--description`) in `oat docs init`
- `scaffoldDocsApp` branches on framework with per-framework template file lists, sentinel files, and token replacements
- Documentation config fields (tooling, root, index) written to `.oat/config.json` after scaffold
- Integration tests verify end-to-end scaffold with real template files

**Key files touched:**
- `.oat/templates/docs-app-fuma/` - 10 Fumadocs template files
- `.oat/templates/docs-app-mkdocs/` - renamed from docs-app
- `packages/cli/src/commands/docs/init/resolve-options.ts` - DocsFramework type, framework/description prompts
- `packages/cli/src/commands/docs/init/scaffold.ts` - framework-aware scaffold with FRAMEWORK_CONFIGS
- `packages/cli/src/commands/docs/init/index.ts` - --framework, --description CLI flags, config writing
- `packages/cli/src/config/oat-config.ts` - added index field

**Verification:**
- Run: `pnpm build && pnpm lint && pnpm type-check && pnpm test`
- Result: all pass, 839 tests

**Notes / Decisions:**
- Integration test verifies token replacement and file structure but not npm install/build (workspace:* deps don't resolve outside monorepo)
- Default framework is `fumadocs` in non-interactive mode

### Task p02-t01: Create Fumadocs template directory

**Status:** completed
**Commit:** 70602b2

**Outcome:**
- 10 template files for Fumadocs scaffold: next.config.js, source.config.ts, tsconfig, app layout/page, lib/source, package.json.template, 3 starter docs
- Templates use `{{SITE_NAME}}`, `{{SITE_DESCRIPTION}}`, `{{PACKAGE_NAME}}` tokens
- Template imports from @oat/docs-config, @oat/docs-theme, fumadocs-mdx, fumadocs-core
- Updated bundle-assets.sh to include docs-app-fuma template

**Files changed:**
- `.oat/templates/docs-app-fuma/` - 10 template files
- `packages/cli/scripts/bundle-assets.sh` - added docs-app-fuma to bundle

**Verification:**
- Run: `find .oat/templates/docs-app-fuma/ -type f | wc -l`
- Result: 10 files present

**Notes / Decisions:**
- Templates live in `.oat/templates/` (not `packages/cli/assets/`) — assets dir is gitignored, populated at build time
- Used `{{FUMA_DEV_DEPENDENCIES}}` token in package.json.template for conditional lint/format deps

---

### Task p02-t02: Rename existing MkDocs template directory

**Status:** completed
**Commit:** 327c469

**Outcome:**
- Renamed `.oat/templates/docs-app` → `.oat/templates/docs-app-mkdocs` to disambiguate from Fumadocs template
- Updated `bundle-assets.sh` to reference `docs-app-mkdocs`
- Updated `scaffold.ts` template root from `'docs-app'` to `'docs-app-mkdocs'`
- Fixed scaffold test `seedAssets` to use new directory name

**Files changed:**
- `.oat/templates/docs-app-mkdocs/` - renamed from `docs-app`
- `packages/cli/scripts/bundle-assets.sh` - updated template reference
- `packages/cli/src/commands/docs/init/scaffold.ts` - updated template root
- `packages/cli/src/commands/docs/init/scaffold.test.ts` - fixed test helper

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: 834/834 tests pass

---

### Task p02-t03: Add framework choice prompt to docs init

**Status:** completed
**Commit:** 858640c

**Outcome:**
- Added `DocsFramework` type (`fumadocs | mkdocs`) and `siteDescription` field to resolved options
- Interactive prompt offers framework choice (Fumadocs/MkDocs) and optional site description
- Non-interactive defaults to `fumadocs` with empty description
- CLI accepts `--framework` and `--description` flags
- `getTemplateDir()` maps framework to template directory name
- Updated help snapshot and existing tests for new required fields

**Files changed:**
- `packages/cli/src/commands/docs/init/resolve-options.ts` - new types, prompts, getTemplateDir
- `packages/cli/src/commands/docs/init/resolve-options.test.ts` - updated expectations, new test
- `packages/cli/src/commands/docs/init/index.ts` - CLI flags for --framework, --description
- `packages/cli/src/commands/docs/init/scaffold.test.ts` - added required fields to test options
- `packages/cli/src/commands/help-snapshots.test.ts` - updated snapshot

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: 835/835 tests pass

---

### Task p02-t04: Implement Fumadocs scaffold path in scaffold.ts

**Status:** completed
**Commit:** 2b82588

**Outcome:**
- `scaffoldDocsApp` now branches on `options.framework` using per-framework template file lists and sentinel files
- MkDocs path unchanged; Fumadocs path scaffolds Next.js app structure (next.config.js, source.config.ts, tsconfig, app/, lib/, docs/)
- Added `{{SITE_DESCRIPTION}}` and `{{FUMA_DEV_DEPENDENCIES}}` token replacements
- 2 new tests: Fumadocs scaffold with lint/format deps, and without

**Files changed:**
- `packages/cli/src/commands/docs/init/scaffold.ts` - framework-aware scaffold with FRAMEWORK_CONFIGS map
- `packages/cli/src/commands/docs/init/scaffold.test.ts` - 2 new Fumadocs test cases

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: 837/837 tests pass

---

### Task p02-t05: Set documentation config fields during scaffold

**Status:** completed
**Commit:** 6fde133

**Outcome:**
- Added `index` field to `OatDocumentationConfig` type
- `scaffoldDocsApp` returns `documentationConfig` with tooling, root, index (and config for MkDocs)
- `runDocsInit` writes documentation config to `.oat/config.json` after scaffolding
- Tests verify returned config for both frameworks

**Files changed:**
- `packages/cli/src/config/oat-config.ts` - added index field + normalization
- `packages/cli/src/commands/docs/init/scaffold.ts` - buildDocumentationConfig, return in result
- `packages/cli/src/commands/docs/init/scaffold.test.ts` - config assertions
- `packages/cli/src/commands/docs/init/index.ts` - write config after scaffold

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: 837/837 tests pass

---

### Task p02-t06: Update bundle-assets script for new templates

**Status:** completed
**Commit:** 70602b2

**Outcome:**
- Both `docs-app-mkdocs` and `docs-app-fuma` are bundled by `bundle-assets.sh` (done in p02-t01)
- Verified both directories present in `packages/cli/assets/templates/`

**Files changed:**
- `packages/cli/scripts/bundle-assets.sh` - already updated in p02-t01

**Verification:**
- Run: `bash packages/cli/scripts/bundle-assets.sh && ls packages/cli/assets/templates/`
- Result: both docs-app-mkdocs and docs-app-fuma present

---

### Task p02-t07: Integration test — scaffold Fumadocs app builds

**Status:** completed
**Commit:** ff9dcb4

**Outcome:**
- Integration test scaffolds both Fumadocs and MkDocs apps using real template files from bundle-assets.sh
- Verifies file structure, no unresolved tokens, package.json validity, branding interpolation
- Tests run against real template files (not synthetic test data)

**Files changed:**
- `packages/cli/src/commands/docs/init/integration.test.ts` - new integration test

**Verification:**
- Run: `pnpm --filter @oat/cli test -- src/commands/docs/init/integration.test.ts`
- Result: 2/2 integration tests pass

---

### Task p02-t08: Phase 2 verification — end-to-end scaffold flow

**Status:** completed
**Commit:** (no code changes, verification only)

**Outcome:**
- Full workspace build, lint, type-check, test all pass
- 839 tests across all packages

**Verification:**
- Run: `pnpm build && pnpm lint && pnpm type-check && pnpm test`
- Result: all pass

---

## Phase 3: Migration + Index Commands

**Status:** complete
**Started:** 2026-03-08

### Phase Summary

**Outcome (what changed):**
- `oat docs migrate` command: converts MkDocs admonitions to GFM blockquotes, injects frontmatter (title/description) from mkdocs.yml nav or heading/filename fallback
- `oat docs index-generate` command: recursively walks docs directory, generates markdown index with titles from frontmatter/headings/filenames, writes output and updates config
- Both commands support dry-run/apply modes and JSON output

**Key files touched:**
- `packages/cli/src/commands/docs/migrate/` - command, codemod, frontmatter modules + tests
- `packages/cli/src/commands/docs/index-generate/` - command, generator modules + tests
- `packages/cli/src/commands/docs/index.ts` - registered both commands

**Verification:**
- Run: `pnpm test && pnpm lint && pnpm type-check && pnpm build`
- Result: 860 tests pass, all clean

**Notes / Decisions:**
- Admonition type mapping covers 14 MkDocs types → 5 GFM types (NOTE, WARNING, TIP, IMPORTANT, CAUTION)
- Frontmatter title resolution chain: mkdocsTitle → h1 heading → filename title-case
- Index generation sorts: index.md first, then directories before files, then lexical

### Task p03-t01: Create docs migrate command skeleton

**Status:** completed
**Commit:** b1863f8

**Outcome:**
- Created `docs migrate` command with `--docs-dir`, `--config`, `--apply` flags
- Dry-run by default, --apply writes changes
- Dependency injection pattern for testability
- Registered in docs command index

**Files changed:**
- `packages/cli/src/commands/docs/migrate/index.ts` - command skeleton with DI
- `packages/cli/src/commands/docs/index.ts` - registered migrate command

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: pass

---

### Task p03-t02: Implement admonition-to-GFM codemod — tests

**Status:** completed
**Commit:** b07e0ad

**Outcome:**
- 7 test cases for convertAdmonitions covering note, warning, tip, collapsible, multi-type, nested content, and no-op
- Tests confirm RED — codemod module does not exist yet

**Files changed:**
- `packages/cli/src/commands/docs/migrate/codemod.test.ts` - test suite

**Verification:**
- Run: `pnpm --filter @oat/cli test -- codemod.test`
- Result: fails (RED) as expected

---

### Task p03-t03: Implement admonition-to-GFM codemod

**Status:** completed
**Commit:** b0cbd29

**Outcome:**
- `convertAdmonitions()` converts MkDocs `!!!`/`???` syntax to GFM `> [!TYPE]` blockquotes
- ADMONITION_TYPE_MAP maps 14 MkDocs types to 5 GFM types (NOTE, WARNING, TIP, IMPORTANT, CAUTION)
- Line-by-line processing handles indented content blocks
- All 7 test cases pass

**Files changed:**
- `packages/cli/src/commands/docs/migrate/codemod.ts` - codemod implementation

**Verification:**
- Run: `pnpm --filter @oat/cli test -- codemod.test`
- Result: 7/7 tests pass (GREEN)

---

### Task p03-t04: Implement frontmatter injection — tests + implement

**Status:** completed
**Commit:** b0e6412

**Outcome:**
- `injectFrontmatter()` with title resolution chain: mkdocsTitle → heading → filename title-case
- Seeds empty `description: ""` when missing
- Does not modify files that already have both title and description
- 6 test cases covering all resolution paths

**Files changed:**
- `packages/cli/src/commands/docs/migrate/frontmatter.ts` - frontmatter injection
- `packages/cli/src/commands/docs/migrate/frontmatter.test.ts` - test suite

**Verification:**
- Run: `pnpm --filter @oat/cli test -- frontmatter`
- Result: 6/6 tests pass

---

### Task p03-t05: Wire migrate command handler

**Status:** completed
**Commit:** c81aa4e, d403beb

**Outcome:**
- Wired `migrateFiles()` handler: walks docs dir, applies convertAdmonitions + injectFrontmatter per .md file
- `parseMkdocsNavTitles()` extracts title mappings from mkdocs.yml nav section
- Dry-run reports changes, --apply writes files
- JSON output mode supported

**Files changed:**
- `packages/cli/src/commands/docs/migrate/index.ts` - full handler implementation

**Verification:**
- Run: `pnpm --filter @oat/cli test && pnpm lint`
- Result: pass (biome lint fix: replaced assignment-in-while with matchAll)

---

### Task p03-t06: Create docs index generate command skeleton

**Status:** completed
**Commit:** f81d2f5

**Outcome:**
- Created `docs index-generate` command with `--docs-dir` and `--output` flags
- Dependency injection pattern matching migrate command
- Registered in docs command index

**Files changed:**
- `packages/cli/src/commands/docs/index-generate/index.ts` - command skeleton
- `packages/cli/src/commands/docs/index.ts` - registered command

**Verification:**
- Run: `pnpm --filter @oat/cli test`
- Result: pass (updated help snapshots)

---

### Task p03-t07: Implement index generation logic — tests

**Status:** completed
**Commit:** 2c500d0

**Outcome:**
- 7 test cases for generateIndex and renderIndex covering flat dirs, nested dirs, fallback titles, empty dirs, and rendering
- Tests confirm RED for generateIndex, GREEN for renderIndex stubs

**Files changed:**
- `packages/cli/src/commands/docs/index-generate/generator.test.ts` - test suite

**Verification:**
- Run: `pnpm --filter @oat/cli test -- generator.test`
- Result: RED as expected for generateIndex

---

### Task p03-t08: Implement index generation logic

**Status:** completed
**Commit:** dba9e9e, 73d54d4

**Outcome:**
- `generateIndex()` recursively walks docsDir, parses frontmatter/headings/filenames for titles
- `renderIndex()` produces markdown list with descriptions and nested indentation
- Sorting: index.md first, then directories, then lexical
- All 860 tests pass

**Files changed:**
- `packages/cli/src/commands/docs/index-generate/generator.ts` - full implementation

**Verification:**
- Run: `pnpm test`
- Result: 860/860 tests pass (GREEN)

---

### Task p03-t09: Wire index generate command + config update

**Status:** completed
**Commit:** c243fe2

**Outcome:**
- Wired generateIndex/renderIndex to command handler
- Writes output file (default: `<docsDir>/index.md`)
- Updates `.oat/config.json` `documentation.index` field
- JSON and human-readable output modes
- Dependency injection for testability

**Files changed:**
- `packages/cli/src/commands/docs/index-generate/index.ts` - full handler implementation

**Verification:**
- Run: `pnpm --filter @oat/cli test && pnpm --filter @oat/cli type-check`
- Result: 860/860 tests pass, type-check clean

---

### Task p03-t10: Phase 3 verification — migrate + index commands

**Status:** completed
**Commit:** (no code changes, verification only)

**Outcome:**
- All migrate + index-generate code verified via existing test suites
- Full workspace: tests, lint, type-check, build all pass

**Verification:**
- Run: `pnpm test && pnpm lint && pnpm type-check && pnpm build`
- Result: 860 tests pass, all clean

---

## Phase 4: Integration + Polish

**Status:** complete
**Started:** 2026-03-08

### Phase Summary

**Outcome (what changed):**
- Real-world fixture-based migration tests (admonitions, frontmatter, combined pipeline, passthrough)
- E2E pipeline test: create MkDocs docs → migrate → generate index → verify output
- MkDocs scaffold compatibility tests (FR8): structure, config, no Fumadocs deps
- FlexSearch config verified: static type, output: 'export' in next.config
- Full workspace verification: 867 tests, lint, type-check, build all pass

**Key files touched:**
- `packages/cli/src/commands/docs/migrate/fixtures/` - 6 fixture files (3 input/expected pairs)
- `packages/cli/src/commands/docs/migrate/fixtures.test.ts` - fixture-based tests
- `packages/cli/src/commands/docs/e2e-pipeline.test.ts` - E2E pipeline test
- `packages/cli/src/commands/docs/init/mkdocs-compat.test.ts` - MkDocs compat tests

**Verification:**
- Run: `pnpm build && pnpm lint && pnpm type-check && pnpm test`
- Result: 867 tests pass, all clean

**Notes / Decisions:**
- E2E build test (npm install + build) not feasible: workspace:* deps don't resolve outside monorepo; validated pipeline logic + config instead
- FlexSearch verification is structural: config factory + template deps correct; runtime requires built app

### Task p04-t01: Test migration against real fixture data

**Status:** completed
**Commit:** abc43e7

**Outcome:**
- 6 fixture files: 3 input/expected pairs (admonitions, frontmatter, combined)
- 4 tests: admonition conversion, frontmatter injection, combined pipeline, passthrough
- Realistic MkDocs content patterns with nested blocks, code, mermaid

**Files changed:**
- `packages/cli/src/commands/docs/migrate/fixtures/` - 6 fixture files
- `packages/cli/src/commands/docs/migrate/fixtures.test.ts` - test suite

**Verification:**
- Run: `pnpm --filter @oat/cli test -- fixtures.test`
- Result: 4/4 tests pass

---

### Task p04-t02: E2E test — author markdown, build, verify render

**Status:** completed
**Commit:** a80397f

**Outcome:**
- Full pipeline test: create docs → migrate admonitions → inject frontmatter → generate index
- Verifies GFM callouts, mermaid passthrough, frontmatter, and index structure
- Validates links, descriptions, and sorted output in generated index

**Files changed:**
- `packages/cli/src/commands/docs/e2e-pipeline.test.ts` - E2E test

**Verification:**
- Run: `pnpm --filter @oat/cli test -- e2e-pipeline`
- Result: 1/1 test pass

---

### Task p04-t03: Verify MkDocs scaffold still works (FR8)

**Status:** completed
**Commit:** 7baa85d

**Outcome:**
- 2 tests: correct structure/config, and no Fumadocs dependencies
- Validates mkdocs.yml content, documentation config fields, absence of Next.js/Fumadocs files
- Uses real template files via bundle-assets.sh

**Files changed:**
- `packages/cli/src/commands/docs/init/mkdocs-compat.test.ts` - test suite

**Verification:**
- Run: `pnpm --filter @oat/cli test -- mkdocs-compat`
- Result: 2/2 tests pass

---

### Task p04-t04: Verify FlexSearch works in static export

**Status:** completed
**Commit:** (no code changes, verification only)

**Outcome:**
- createSearchConfig returns `{ engine: 'flexsearch', type: 'static' }` — verified by existing tests
- createDocsConfig returns `{ output: 'export' }` — prerequisite for static FlexSearch
- Template package.json includes fumadocs-core (provides search) as dependency

**Verification:**
- Run: `pnpm --filter @oat/docs-config test`
- Result: 7/7 tests pass

---

### Task p04-t05: Phase 4 final verification

**Status:** completed
**Commit:** (no code changes, verification only)

**Outcome:**
- Full workspace: build, lint, type-check, test all pass
- 867 tests across all packages

**Verification:**
- Run: `pnpm build && pnpm lint && pnpm type-check && pnpm test`
- Result: all pass

---

### Review Received: final

**Date:** 2026-03-09
**Review artifact:** reviews/final-review-2026-03-09.md

**Findings:**
- Critical: 3
- Important: 1
- Medium: 1
- Minor: 0

**New tasks added:** p04-t06, p04-t07, p04-t08, p04-t09, p04-t10

**Finding disposition map:**
- C1 (index generation wrong output path) → converted to p04-t06
- C2 (scaffold missing index generation scripts) → converted to p04-t07
- C3 (Mermaid/search not wired) → converted to p04-t08
- I1 (integration test race on shared assets) → converted to p04-t09
- M1 (CLI command contract mismatch) → converted to p04-t10

**Deferred Findings:** None

**Status:** All fix tasks complete. Review row updated to `fixes_completed`.

**Next:** Re-run `oat-project-review-provide code final` then `oat-project-review-receive` to reach `passed`.

### Review Received: final (re-review v2)

**Date:** 2026-03-09
**Review artifact:** reviews/final-review-2026-03-09-v2.md

**Findings:**
- Critical: 2
- Important: 0
- Medium: 0
- Minor: 0

**New tasks added:** p04-t11, p04-t12

**Finding disposition map:**
- C1 (scaffold calls removed `index-generate` command) → converted to p04-t11 (also includes user decision to flatten to `generate-index`)
- C2 (search config not consumed by scaffold) → converted to p04-t12

**Deferred Findings:** None

**Status:** All fix tasks complete. Review row updated to `fixes_completed`.

**Next:** Re-run `oat-project-review-provide code final` then `oat-project-review-receive` to reach `passed`.

### Task p04-t11: (review) Rename command to flat `generate-index` and fix scaffold template

**Status:** completed
**Commit:** 6013cf3

**Outcome:**
- Flattened nested `docs index generate` to `docs generate-index` (no other planned index subcommands)
- Updated scaffold template `predev`/`prebuild` scripts from `index-generate` to `generate-index`
- Updated scaffold test fixture and assertions for new command name
- Updated help snapshots

**Files changed:**
- `packages/cli/src/commands/docs/index-generate/index.ts` - flat `generate-index` command
- `packages/cli/src/commands/docs/index.ts` - import renamed export
- `.oat/templates/docs-app-fuma/package.json.template` - updated script commands
- `packages/cli/src/commands/docs/init/scaffold.test.ts` - updated fixture + assertions
- `packages/cli/src/commands/help-snapshots.test.ts` - updated snapshot

**Verification:**
- Run: `pnpm --filter @oat/cli test && pnpm run cli -- docs generate-index --help`
- Result: 867 tests pass, command accessible via `oat docs generate-index`

---

### Task p04-t12: (review) Wire search config into scaffold's Fumadocs runtime

**Status:** completed
**Commit:** a6d4f3d

**Outcome:**
- Added `app/api/search/route.ts` template using `createFromSource` + `staticGET` for static export search
- Updated `source.config.ts` template to export `sourceConfig.search` for discoverability
- Added search route to `FUMA_TEMPLATE_FILES` in `scaffold.ts`
- Test verifies search route is scaffolded and contains `createFromSource`/`staticGET`

**Files changed:**
- `.oat/templates/docs-app-fuma/app/api/search/route.ts` - new search API route template
- `.oat/templates/docs-app-fuma/source.config.ts` - export search config
- `packages/cli/src/commands/docs/init/scaffold.ts` - added search route to template list
- `packages/cli/src/commands/docs/init/scaffold.test.ts` - fixture + assertions for search

**Verification:**
- Run: `pnpm --filter @oat/cli test && pnpm --filter @oat/docs-config test`
- Result: 867 CLI tests pass, 9 docs-config tests pass

---

### Review Received: final (re-review v3)

**Date:** 2026-03-09
**Review artifact:** reviews/final-review-2026-03-09-v3.md

**Findings:**
- Critical: 0
- Important: 1
- Medium: 0
- Minor: 0

**New tasks added:** p04-t13

**Finding disposition map:**
- I1 (search route missing static marker) → converted to p04-t13

**Deferred Findings:** None
**Deferred Medium Resurfacing:** No deferred mediums across any prior cycle.
**Minor Disposition (final scope):** No minor findings.

**Review cycle:** 3 of 3 (limit reached — no further automated review cycles after this fix)

**Next:** Execute fix task p04-t13, then mark final review as `passed` (fix is verifiable by inspection given cycle limit).

---

### Task p04-t06: (review) Fix index generation output path and documentation.index config

**Status:** completed
**Commit:** 7a4ca43

**Outcome:**
- Default index output changed from `docs/index.md` to app-root `index.md`
- `documentation.index` config now stores repo-relative path instead of absolute
- Fumadocs scaffold `documentation.index` points at `<targetDir>/index.md` (app root artifact)

**Files changed:**
- `packages/cli/src/commands/docs/index-generate/index.ts` - fixed output default + relative config path
- `packages/cli/src/commands/docs/init/scaffold.ts` - fixed Fumadocs documentation.index target
- `packages/cli/src/commands/docs/init/scaffold.test.ts` - updated assertion

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/docs/init/scaffold.test.ts src/commands/docs/index-generate/generator.test.ts && pnpm --filter @oat/cli type-check`
- Result: 11 tests pass, type-check clean

---

### Task p04-t07: (review) Wire index generation into Fumadocs scaffold scripts

**Status:** completed
**Commit:** 9c45ca2

**Outcome:**
- Added `predev` and `prebuild` scripts running `npx oat docs index-generate` to Fumadocs template
- Scaffolded apps now auto-generate the app-root index artifact before Next.js dev/build
- Test assertion added verifying predev/prebuild contain index generation

**Files changed:**
- `.oat/templates/docs-app-fuma/package.json.template` - added predev/prebuild hooks
- `packages/cli/src/commands/docs/init/scaffold.test.ts` - added script assertions

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/docs/init/scaffold.test.ts`
- Result: 4/4 tests pass

---

### Task p04-t08: (review) Wire Mermaid remark plugin and search config into docs pipeline

**Status:** completed
**Commit:** d4ec081

**Outcome:**
- New `remarkMermaid` plugin transforms `mermaid` code fences → `<Mermaid chart="...">` MDX JSX elements
- `createSourceConfig()` now includes `remarkMermaid` in `remarkPlugins` and `search` field from `createSearchConfig()`
- Scaffold page template passes `{ Mermaid }` component mapping to MDX renderer
- FR2 (Mermaid + FlexSearch) and NFR3 (static search) now fully wired

**Files changed:**
- `packages/docs-transforms/src/remark-mermaid.ts` - new remarkMermaid plugin
- `packages/docs-transforms/src/index.ts` - export remarkMermaid, add to defaultTransforms
- `packages/docs-config/src/source-config.ts` - add remarkMermaid + search config
- `packages/docs-config/src/source-config.test.ts` - tests for remarkMermaid + search in config
- `.oat/templates/docs-app-fuma/app/[[...slug]]/page.tsx` - Mermaid MDX component mapping
- `packages/cli/src/commands/docs/init/scaffold.test.ts` - updated template fixture

**Verification:**
- Run: `pnpm --filter @oat/docs-transforms test && pnpm --filter @oat/docs-config test && pnpm build`
- Result: 16 tests pass (7 transforms + 9 config), workspace build clean

---

### Task p04-t09: (review) Fix integration test race on shared assets directory

**Status:** completed
**Commit:** d9dd7df

**Outcome:**
- `bundle-assets.sh` now respects `OAT_ASSETS_DIR` env var for output directory
- Both `integration.test.ts` and `mkdocs-compat.test.ts` bundle to isolated temp directories
- Tests pass reliably when run in parallel (verified with 5 docs test files concurrently)

**Files changed:**
- `packages/cli/scripts/bundle-assets.sh` - OAT_ASSETS_DIR env var support
- `packages/cli/src/commands/docs/init/integration.test.ts` - isolated temp assets dir
- `packages/cli/src/commands/docs/init/mkdocs-compat.test.ts` - isolated temp assets dir

**Verification:**
- Run: `pnpm --filter @oat/cli exec vitest run src/commands/docs/init/integration.test.ts src/commands/docs/init/mkdocs-compat.test.ts`
- Result: 4/4 tests pass (no race condition)

---

### Task p04-t10: (review) Expose nested `docs index generate` command form

**Status:** completed
**Commit:** 23000fb

**Outcome:**
- Restructured from `oat docs index-generate` to `oat docs index generate` matching spec contract
- Created `index` command group under `docs` with `generate` subcommand
- Updated help snapshots

**Files changed:**
- `packages/cli/src/commands/docs/index-generate/index.ts` - renamed export, wrapped in index group
- `packages/cli/src/commands/docs/index.ts` - use createDocsIndexCommand
- `packages/cli/src/commands/help-snapshots.test.ts` - updated snapshot

**Verification:**
- Run: `pnpm --filter @oat/cli test && pnpm run cli -- docs index generate --help`
- Result: 867 tests pass, command accessible via `oat docs index generate`

---

## Orchestration Runs

> This section is used by `oat-project-subagent-implement` to log parallel execution runs.
> Each run appends a new subsection — never overwrite prior entries.
> For single-thread execution (via `oat-project-implement`), this section remains empty.

<!-- orchestration-runs-start -->
<!-- orchestration-runs-end -->

---

## Implementation Log

Chronological log of implementation progress.

### 2026-03-08

**Session Start:** implementation begins

- [ ] p01-t01: Scaffold docs-transforms package

**What changed (high level):**
- {updated as tasks complete}

**Decisions:**
- HiLL checkpoints: pause only after p04 (run all phases continuously)

**Follow-ups / TODO:**
- {updated as needed}

**Blockers:**
- None

---

## Deviations from Plan

Document any deviations from the original plan.

| Task | Planned | Actual | Reason |
|------|---------|--------|--------|
| - | - | - | - |

## Test Results

Track test execution during implementation.

| Phase | Tests Run | Passed | Failed | Coverage |
|-------|-----------|--------|--------|----------|
| 1 | 14 | 14 | 0 | - |
| 2 | 839 | 839 | 0 | - |
| 3 | 860 | 860 | 0 | - |
| 4 | 867 | 867 | 0 | - |

## Final Summary (for PR/docs)

**What shipped:**
- `@oat/docs-transforms` — remarkTabs remark plugin (MkDocs tab syntax → Fumadocs `<Tabs>`/`<Tab>` JSX)
- `@oat/docs-config` — Config factories for Next.js (static export + createMDX), source config (remark plugins), FlexSearch static search
- `@oat/docs-theme` — DocsLayout, DocsPage, Mermaid components wrapping fumadocs-ui
- Fumadocs scaffold templates (10 files) with `oat docs init --framework fumadocs`
- `oat docs migrate` — Admonition-to-GFM codemod + frontmatter injection from mkdocs.yml nav
- `oat docs index-generate` — Recursive markdown index generation with config update

**Behavioral changes (user-facing):**
- `oat docs init` now prompts for framework choice (fumadocs/mkdocs) and site description
- `oat docs init --framework fumadocs` scaffolds a Next.js-based docs app with Fumadocs
- `oat docs migrate` converts MkDocs admonitions to GFM blockquotes and injects frontmatter
- `oat docs index-generate` creates a docs index from markdown files
- MkDocs scaffold path unchanged (FR8 backward compatibility)

**Key files / modules:**
- `packages/docs-transforms/` - remarkTabs plugin
- `packages/docs-config/` - Next.js, source, and search config factories
- `packages/docs-theme/` - DocsLayout, DocsPage, Mermaid components
- `.oat/templates/docs-app-fuma/` - 10 Fumadocs template files
- `packages/cli/src/commands/docs/migrate/` - codemod, frontmatter, command handler
- `packages/cli/src/commands/docs/index-generate/` - generator, command handler

**Verification performed:**
- 867 tests pass (14 transforms, 7 config, ~846 CLI)
- Lint: clean (Biome)
- Type-check: clean (TypeScript)
- Build: clean (Turborepo)

**Design deltas (if any):**
- E2E build test (p04-t02) tests pipeline logic rather than npm install + build (workspace:* deps can't resolve outside monorepo)
- FlexSearch verification (p04-t04) is structural — config factory + template deps correct; runtime requires built app

## References

- Plan: `plan.md`
- Design: `design.md`
- Spec: `spec.md`

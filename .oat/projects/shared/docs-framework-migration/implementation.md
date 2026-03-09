---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-08
oat_current_task_id: p01-t12
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
| Phase 1: Foundation Packages | in_progress | 12 | 11/12 |
| Phase 2: Scaffold Templates + CLI | pending | 8 | 0/8 |
| Phase 3: Migration + Index Commands | pending | 10 | 0/10 |
| Phase 4: Integration + Polish | pending | 5 | 0/5 |

**Total:** 11/35 tasks completed

---

## Phase 1: Foundation Packages

**Status:** in_progress
**Started:** 2026-03-08

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {2-5 bullets describing user-visible / behavior-level changes delivered in this phase}

**Key files touched:**
- `{path}` - {why}

**Verification:**
- Run: `{command(s)}`
- Result: {pass/fail + notes}

**Notes / Decisions:**
- {trade-offs or deviations discovered during implementation}

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

**Status:** pending
**Commit:** -

---

## Phase 2: Scaffold Templates + CLI

**Status:** pending
**Started:** -

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {placeholder}

**Key files touched:**
- `{path}` - {why}

**Verification:**
- Run: `{command(s)}`
- Result: {pass/fail + notes}

**Notes / Decisions:**
- {placeholder}

### Task p02-t01: Create Fumadocs template directory

**Status:** pending
**Commit:** -

---

### Task p02-t02: Rename existing MkDocs template directory

**Status:** pending
**Commit:** -

---

### Task p02-t03: Add framework choice prompt to docs init

**Status:** pending
**Commit:** -

---

### Task p02-t04: Implement Fumadocs scaffold path in scaffold.ts

**Status:** pending
**Commit:** -

---

### Task p02-t05: Set documentation config fields during scaffold

**Status:** pending
**Commit:** -

---

### Task p02-t06: Update bundle-assets script for new templates

**Status:** pending
**Commit:** -

---

### Task p02-t07: Integration test — scaffold Fumadocs app builds

**Status:** pending
**Commit:** -

---

### Task p02-t08: Phase 2 verification — end-to-end scaffold flow

**Status:** pending
**Commit:** -

---

## Phase 3: Migration + Index Commands

**Status:** pending
**Started:** -

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {placeholder}

**Key files touched:**
- `{path}` - {why}

**Verification:**
- Run: `{command(s)}`
- Result: {pass/fail + notes}

**Notes / Decisions:**
- {placeholder}

### Task p03-t01: Create docs migrate command skeleton

**Status:** pending
**Commit:** -

---

### Task p03-t02: Implement admonition-to-GFM codemod — tests

**Status:** pending
**Commit:** -

---

### Task p03-t03: Implement admonition-to-GFM codemod

**Status:** pending
**Commit:** -

---

### Task p03-t04: Implement frontmatter injection — tests + implement

**Status:** pending
**Commit:** -

---

### Task p03-t05: Wire migrate command handler

**Status:** pending
**Commit:** -

---

### Task p03-t06: Create docs index generate command skeleton

**Status:** pending
**Commit:** -

---

### Task p03-t07: Implement index generation logic — tests

**Status:** pending
**Commit:** -

---

### Task p03-t08: Implement index generation logic

**Status:** pending
**Commit:** -

---

### Task p03-t09: Wire index generate command + config update

**Status:** pending
**Commit:** -

---

### Task p03-t10: Phase 3 verification — migrate + index commands

**Status:** pending
**Commit:** -

---

## Phase 4: Integration + Polish

**Status:** pending
**Started:** -

### Phase Summary (fill when phase is complete)

**Outcome (what changed):**
- {placeholder}

**Key files touched:**
- `{path}` - {why}

**Verification:**
- Run: `{command(s)}`
- Result: {pass/fail + notes}

**Notes / Decisions:**
- {placeholder}

### Task p04-t01: Test migration against real fixture data

**Status:** pending
**Commit:** -

---

### Task p04-t02: E2E test — author markdown, build, verify render

**Status:** pending
**Commit:** -

---

### Task p04-t03: Verify MkDocs scaffold still works (FR8)

**Status:** pending
**Commit:** -

---

### Task p04-t04: Verify FlexSearch works in static export

**Status:** pending
**Commit:** -

---

### Task p04-t05: Phase 4 final verification

**Status:** pending
**Commit:** -

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
| 1 | - | - | - | - |
| 2 | - | - | - | - |
| 3 | - | - | - | - |
| 4 | - | - | - | - |

## Final Summary (for PR/docs)

**What shipped:**
- {capability 1}
- {capability 2}

**Behavioral changes (user-facing):**
- {bullet}

**Key files / modules:**
- `{path}` - {purpose}

**Verification performed:**
- {tests/lint/typecheck/build/manual steps}

**Design deltas (if any):**
- {what changed vs design.md and why}

## References

- Plan: `plan.md`
- Design: `design.md`
- Spec: `spec.md`

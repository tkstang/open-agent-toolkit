---
oat_status: complete
oat_ready_for: oat-project-plan
oat_blockers: []
oat_last_updated: 2026-03-11
oat_generated: false
oat_template: false
oat_template_name: design
---

# Design: docs-reorganization

## Overview

The reorganization should preserve the current `apps/oat-docs` runtime while reshaping the content tree around audience intent. The implementation target is no longer a MkDocs nav file; it is a Fumadocs app whose discoverability depends on the markdown tree, each directory `index.md` file, and the generated `apps/oat-docs/index.md` surface index.

The design uses a staged move-and-rewrite flow. First move files into a clearer `guide/`, `contributing/`, and `reference/` layout with `git mv` so history is preserved. Then rewrite landing pages and cross-links, refresh the generated docs surface, and remove legacy paths only after repo-wide stale-reference audits pass.

## Architecture

### System Context

This project changes only the docs content tree under `apps/oat-docs/docs/**` plus the generated app-root index at `apps/oat-docs/index.md`. It relies on the existing Fumadocs integration (`apps/oat-docs/source.config.ts`) and shared remark transforms from `@oat/docs-transforms` for links, tabs, callouts, and Mermaid.

**Key Components:**

- **Audience-driven docs tree:** Reorganized markdown directories and pages under `apps/oat-docs/docs/`.
- **Generated docs surface index:** `apps/oat-docs/index.md`, regenerated from the docs tree for app-level discovery.
- **Docs runtime contract:** Fumadocs source loading plus remark transforms and build scripts in `apps/oat-docs/package.json`.
- **Cleanup and verification layer:** Repo-wide stale-reference checks, markdown quality gates, and docs build validation.

### Component Diagram

```text
apps/oat-docs/docs/**
  ├─ index.md / quickstart.md
  ├─ guide/**
  ├─ contributing/**
  └─ reference/**
          │
          │  (index.md + ## Contents contract)
          ▼
oat docs generate-index
  --docs-dir apps/oat-docs/docs
  --output   apps/oat-docs/index.md
          │
          ▼
apps/oat-docs/source.config.ts
  + @oat/docs-transforms
          │
          ▼
pnpm --filter oat-docs build
```

### Data Flow

1. Pages are moved into the new audience-driven tree under `apps/oat-docs/docs/`.
2. Each section landing page maintains a machine-readable `## Contents` map for local discovery.
3. `oat docs generate-index` scans the docs tree and rewrites `apps/oat-docs/index.md`.
4. Fumadocs loads the markdown tree from `./docs` using the shared source config and transforms.
5. Final verification confirms no stale internal links remain and that the docs app still builds successfully.

## Component Design

### Audience-Driven Content Tree

**Purpose:** Give users and contributors clear top-level paths without losing detailed topical documentation.

**Responsibilities:**

- Move user-facing pages into `apps/oat-docs/docs/guide/**`
- Move contributor-facing material into `apps/oat-docs/docs/contributing/**`
- Keep stable shared references in `apps/oat-docs/docs/reference/**`
- Preserve root entry pages (`index.md`, `quickstart.md`) as shared routing surfaces

**Interfaces:**

```text
apps/oat-docs/docs/
  guide/
    provider-sync/
    documentation/
    workflow/
    skills/
    ideas/
    cli-reference.md
  contributing/
  reference/
```

**Dependencies:**

- Existing docs pages in `apps/oat-docs/docs/**`
- `apps/oat-docs/docs/reference/docs-index-contract.md`

**Design Decisions:**

- `apps/oat-docs/docs/cli/index.md` should be moved to `apps/oat-docs/docs/guide/cli-reference.md` instead of being abandoned and recreated from scratch.
- `apps/oat-docs/docs/cli/repo-analysis.md` should join the workflow-oriented user guide because it supports merged-PR review analysis rather than generic CLI setup.
- `apps/oat-docs/docs/contributing.md` becomes contributor-specific material under the new `contributing/` section instead of remaining the only contributor entry point.

### Generated Surface Index

**Purpose:** Keep the app-root discovery page aligned with the moved docs tree.

**Responsibilities:**

- Regenerate `apps/oat-docs/index.md` after structural changes
- Treat the file as generated output, not hand-authored docs
- Use the generated output as one of the final verification signals

**Interfaces:**

```bash
pnpm -w run cli -- docs generate-index \
  --docs-dir apps/oat-docs/docs \
  --output apps/oat-docs/index.md
```

**Dependencies:**

- `packages/cli/src/commands/docs/index-generate/*`
- `apps/oat-docs/package.json` `predev` and `prebuild` hooks

**Design Decisions:**

- Regenerating the index is a first-class plan task, not a side effect to remember at the end.
- The reorganization should leave the generated index readable and useful, but changes to its structure must come from the docs tree.

### Cleanup and Verification Layer

**Purpose:** Remove legacy paths safely and prove the reorganization works with the current docs runtime.

**Responsibilities:**

- Audit stale links and old-path references across the repo
- Delay deletion of legacy directories until reference cleanup passes
- Run markdown quality gates and docs build verification

**Interfaces:**

```bash
pnpm --filter oat-docs docs:format:check
pnpm --filter oat-docs docs:lint
pnpm --filter oat-docs build
rg "apps/oat-docs/docs/(cli|workflow|projects|skills|ideas)/"
```

**Dependencies:**

- `apps/oat-docs/package.json`
- Repo docs and project artifacts that may reference moved pages

**Design Decisions:**

- No redirect layer is needed at this stage; repo hygiene is enforced through stale-reference cleanup instead.
- Verification is based on the Fumadocs build path plus markdown checks, not on MkDocs commands.

## Data Models

### Section Move Record

**Purpose:** Capture each moved docs surface as an explicit mapping during implementation.

**Schema:**

```typescript
interface SectionMove {
  from: string;
  to: string;
  audience: 'user' | 'developer' | 'shared';
  reason: string;
}
```

**Validation Rules:**

- `from` must exist before the move starts
- `to` must match the audience-driven layout
- `reason` must explain why the page belongs in its new section

**Storage:**

- **Location:** `plan.md` task lists and implementation log
- **Persistence:** Markdown artifacts committed with the project

### Index Contract Entry

**Purpose:** Represent the per-directory discovery contract used by the docs app and docs tooling.

**Schema:**

```typescript
interface IndexContractEntry {
  indexPath: string;
  contentsLinks: string[];
}
```

**Validation Rules:**

- Every docs directory has an `index.md`
- Every section index contains `## Contents`
- Every child link in `## Contents` resolves after moves

**Storage:**

- **Location:** `apps/oat-docs/docs/**/index.md`
- **Persistence:** Version-controlled markdown

## API Design

No new runtime APIs are introduced. The relevant operational interfaces are existing CLI commands and npm scripts already in the repo:

- `oat docs generate-index`
- `pnpm --filter oat-docs docs:format:check`
- `pnpm --filter oat-docs docs:lint`
- `pnpm --filter oat-docs build`

## Security Considerations

### Authentication

Not applicable. This is a docs-only project with no new auth surface.

### Authorization

Not applicable. The reorganization does not change runtime access control.

### Data Protection

- **Encryption:** Not applicable.
- **PII Handling:** Avoid introducing incidental personal or private operational details into rewritten docs.
- **Input Validation:** Treat command examples, file paths, and cross-links as the data that needs validation during review and verification.

### Threat Mitigation

- **Incorrect operational guidance:** Mitigate by grounding rewrites in current merged code and docs pages.
- **Broken navigation discoverability:** Mitigate by preserving shared entry points and refreshing the generated app-root index.

## Performance Considerations

### Scalability

The docs remain a statically built markdown site; the main performance concern is avoiding unnecessary duplication and keeping the generated index coherent.

### Caching

Existing Fumadocs/Next.js behavior is unchanged.

### Resource Limits

The only meaningful resource limit is build stability. The reorganization should not introduce a path explosion or duplicated content that materially slows the existing docs build.

## Error Handling

### Error Categories

- **Broken relative links:** Fix before deleting old paths.
- **Generated index drift:** Regenerate `apps/oat-docs/index.md`.
- **Build or markdown check failures:** Stop and correct the offending pages before continuing.

### Retry Logic

No automated retries. Verification commands should be rerun after each fix batch.

### Logging

- **Info:** Track moved sections and rewritten landing pages in `implementation.md`.
- **Warn:** Note any intentional temporary stubs or staged cleanup decisions.
- **Error:** Record failed verification commands with enough detail to reproduce locally.

## Testing Strategy

### Requirement-to-Test Mapping

| ID  | Verification            | Key Scenarios                                                                                                                                    |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| DR1 | manual + repo audit     | Homepage and quickstart route readers into the new guide/contributing/reference split without dangling old links.                                |
| DR2 | manual + content review | Guided init, canonical rule sync/adoption, and repo PR comment analysis land in the right sections and are not stranded in legacy CLI structure. |
| DR3 | command                 | `oat docs generate-index` refreshes `apps/oat-docs/index.md` from the reorganized docs tree.                                                     |
| DR4 | command                 | `pnpm --filter oat-docs docs:format:check`, `docs:lint`, and `build` pass after moves and rewrites.                                              |
| DR5 | manual + build          | Mermaid diagrams and tabbed content still render through the Fumadocs transform pipeline.                                                        |

### Unit Tests

No new code-level unit tests are expected unless implementation reveals a tooling defect. This project is primarily validated through docs-focused command checks.

### Integration Tests

- Regenerate the app-root docs surface index
- Run markdown formatting and lint checks
- Run the `oat-docs` build end to end

### End-to-End Tests

- Navigate the reorganized doc entry points in the built app or local dev flow
- Confirm key user journeys still resolve cleanly after the move

## Deployment Strategy

### Build Process

Use the existing `oat-docs` build scripts. `prebuild` already runs `fumadocs-mdx` and regenerates the app-root docs index.

### Deployment Steps

1. Complete moves and landing-page rewrites.
2. Refresh `apps/oat-docs/index.md`.
3. Run markdown quality gates and `pnpm --filter oat-docs build`.
4. Merge once verification is clean.

### Rollback Plan

If the reorganization regresses discoverability or breaks the build, revert the move/rewrite commit batch and restore the previous docs tree.

## Migration Plan

### Migration Steps

1. Create the new audience-driven directories and required placeholder `index.md` files.
2. Move existing pages with `git mv` to preserve history.
3. Rewrite landing pages and topical cross-links for the new information architecture.
4. Regenerate `apps/oat-docs/index.md`.
5. Remove legacy paths only after stale-reference audits and build verification pass.

### Rollback Strategy

Rollback is a content-tree revert. There is no data migration or runtime schema migration involved.

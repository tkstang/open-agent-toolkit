---
oat_generated: true
oat_generated_at: 2026-02-22
oat_pr_type: project
oat_pr_scope: final
oat_project: .oat/projects/shared/rename-full-to-spec-driven-workflow
---

# PR: rename-full-to-spec-driven-workflow

## Summary

This PR renames the long OAT workflow lane/mode contract from `full` to `spec-driven` and aligns all affected runtime, skill, documentation, and sync surfaces.
It includes the skill rename from `oat-project-promote-full` to `oat-project-promote-spec-driven`, plus downstream provider-view and manifest reconciliation.
The change is intentionally non-backward-compatible per project discovery: legacy `full` mode metadata/CLI values are not retained as aliases.
Validation was completed end-to-end with targeted CLI tests, full workspace checks, and final review pass.

## Goals / Non-Goals

- Goals:
  - Replace long-lifecycle mode contract values with `spec-driven` across templates, CLI routing/scaffolding, and skill contracts.
  - Update user-facing lane terminology to `Spec-Driven` while preserving `quick` and `import` behavior.
  - Keep provider-linked views and sync manifest aligned with the renamed promote skill.
- Non-Goals:
  - No migration tooling for already-existing `oat_workflow_mode: full` projects.
  - No compatibility parsing/aliasing for legacy `full` mode values.
  - No redesign of quick/import workflow behavior.

## What Changed

- Phase 1: Canonical contract rename
  - Updated `.oat` templates and CLI defaults/parsing from `full` to `spec-driven`.
  - Updated route-map keys and project-new mode choices/defaults.
  - Renamed promotion skill to `oat-project-promote-spec-driven` and updated workflow installer/bundler references.
- Phase 2: Docs and skill contracts
  - Updated README, workflow/docs/cli references, and `.oat/repo` reference surfaces to `Spec-Driven/spec-driven` terminology.
  - Updated reviewer + key `oat-project-*` skills to use `spec-driven` mode defaults/wording.
  - Updated `.oat/repo/knowledge/project-index.md` and `.oat/sync/manifest.json` references tied to promote skill rename.
- Phase 3: Validation/readiness
  - Updated CLI help snapshot for `oat project new --mode`.
  - Ran smoke scaffolding (`--mode spec-driven`) and workspace checks (`lint`, `type-check`, `test`).
  - Reconciled provider symlinks/manifest so `oat-project-promote-spec-driven` is in sync and stale `promote-full` links were removed.
- Review-fix phase
  - Incorporated plan review findings (`p04-t01` through `p04-t09`) before final gate.

## Verification

- Targeted contract tests:
  - `pnpm --filter @oat/cli exec vitest run src/commands/help-snapshots.test.ts src/commands/project/new/index.test.ts src/commands/project/new/scaffold.test.ts src/commands/state/generate.test.ts`
- Skill validation:
  - `pnpm run cli -- internal validate-oat-skills`
- CLI smoke:
  - `pnpm run cli -- project new smoke-spec-driven --mode spec-driven --json`
  - `pnpm run cli -- state refresh`
- Workspace checks:
  - `pnpm lint`
  - `pnpm type-check`
  - `pnpm test`

## Reviews

| Scope | Type | Status | Date | Artifact |
|-------|------|--------|------|----------|
| plan | artifact | fixes_completed | 2026-02-21 | `reviews/artifact-plan-review-2026-02-21.md` |
| final | code | passed | 2026-02-21 | `reviews/final-review-2026-02-21.md` |

Final review disposition note:
- No Critical/Important/Medium findings.
- One Minor finding (archived external-plan wording) was explicitly deferred as out-of-scope historical content.

## Git Context

- Branch: `codex/spec-driven-workflow-rename`
- Merge-base: `66655f36143c03d6863f7d19b5da68c59ec08e98`
- Range: `66655f3..HEAD`
- Diff summary: `51 files changed, 1407 insertions(+), 169 deletions(-)`

## References

- Discovery: [discovery.md](https://github.com/tkstang/open-agent-toolkit/blob/codex/spec-driven-workflow-rename/.oat/projects/shared/rename-full-to-spec-driven-workflow/discovery.md)
- Plan: [plan.md](https://github.com/tkstang/open-agent-toolkit/blob/codex/spec-driven-workflow-rename/.oat/projects/shared/rename-full-to-spec-driven-workflow/plan.md)
- Implementation: [implementation.md](https://github.com/tkstang/open-agent-toolkit/blob/codex/spec-driven-workflow-rename/.oat/projects/shared/rename-full-to-spec-driven-workflow/implementation.md)
- Discovery (quick-mode requirement source): [discovery.md](https://github.com/tkstang/open-agent-toolkit/blob/codex/spec-driven-workflow-rename/.oat/projects/shared/rename-full-to-spec-driven-workflow/discovery.md)
- Reviews folder: [reviews/](https://github.com/tkstang/open-agent-toolkit/tree/codex/spec-driven-workflow-rename/.oat/projects/shared/rename-full-to-spec-driven-workflow/reviews)

Reduced-assurance note:
- This project ran in `quick` mode (`oat_workflow_mode: quick`), so `spec.md` and `design.md` are optional and not used as required gating artifacts.

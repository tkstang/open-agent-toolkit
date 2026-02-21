---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-02-21
oat_generated: false
---

# Discovery: rename-full-to-spec-driven-workflow

## Initial Request

Rename the long workflow lane/mode from `full` to `Spec-Driven` across OAT artifacts, docs, skills, and CLI/runtime behavior.

## Key Decisions

1. **New canonical term:** Use `spec-driven` as the canonical mode value and `Spec-Driven` as user-facing label.
2. **Compatibility policy:** No backward compatibility for legacy `full` metadata or CLI values.
3. **Scope:** Update templates, CLI/runtime routing, skills, docs, and tests in one coordinated pass.
4. **Promotion path naming:** Rename `oat-project-promote-full` to `oat-project-promote-spec-driven`.

## Constraints

- Do not implement compatibility aliases (`full` should not remain a supported workflow mode).
- Keep quick/import workflows intact (`quick`, `import` still valid).
- Keep changes focused on workflow-mode terminology, not unrelated uses of the word "full".

## Success Criteria

- `oat_workflow_mode` and `oat_plan_source` use `spec-driven` for the long lane.
- CLI scaffolding/help uses `spec-driven|quick|import`.
- Skill and reviewer contracts refer to Spec-Driven mode requirements.
- Documentation consistently describes three lanes: Spec-Driven, Quick, Import.
- Tests and snapshots pass with the renamed mode contract.

## Out of Scope

- Migration tooling for existing projects with `oat_workflow_mode: full`.
- Compatibility parsing of legacy `full` values.
- Behavioral redesign of quick/import workflows.

## Risks

- **Risk:** Missed literals in skills/docs/tests cause contract drift.
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation:** Do a targeted grep sweep for workflow-mode literals after edits and before final verification.
- **Risk:** Partial skill rename breaks workflow installation references.
  - **Likelihood:** Medium
  - **Impact:** High
  - **Mitigation:** Rename skill directory + update all registration/inventory references in same change.

## Next Steps

Plan is ready for implementation via `oat-project-implement`.

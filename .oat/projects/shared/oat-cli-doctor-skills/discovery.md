---
oat_status: complete
oat_ready_for: plan
oat_blockers: []
oat_last_updated: 2026-03-15
oat_generated: false
---

# Discovery: oat-cli-doctor-skills

## Phase Guardrails (Discovery)

Discovery is for requirements and decisions, not implementation details.

## Initial Request

Create two complementary user-level agent skills that ship together:

1. **`/oat-doctor`** — Diagnostic and summary skill that inspects OAT setup at project and user levels. Checks for skill updates, identifies misconfigurations, summarizes what's installed, and recommends corrective actions.
2. **`/oat-docs`** — Interactive Q&A skill backed by locally-bundled OAT documentation. Lets users ask questions about OAT workflows, CLI commands, and skill authoring.

Both are recommended as user-level skill installs so they work regardless of whether you're in a project directory.

## Key Decisions

1. **Two SKILL.md files, registered in utility pack:** Both skills are utility-class skills that work at any scope. They follow the existing OAT skill conventions (frontmatter, mode assertion, progress indicators, steps).
2. **Doctor uses existing CLI commands:** `oat tools list --json --scope all`, `oat tools outdated --json --scope all`, `oat config list --json`, and `oat sync --dry-run --json --scope project` provide all needed structured data. No new CLI commands needed for v1.
3. **Doctor has two modes:** Check mode (default, terse `brew doctor`-style warnings with fix commands) and Summary mode (full dashboard of installed packs, skills, config, available-but-uninstalled skills).
4. **Docs skill reads from `apps/oat-docs/docs/`:** For v1, the skill reads documentation directly from the repo's docs directory rather than a bundled `~/.oat/docs/` location. Docs bundling infrastructure is deferred — it requires CLI changes outside the scope of "author two skills."
5. **Skill registration:** Add both skills to `UTILITY_SKILLS` in `skill-manifest.ts` and to the `SKILLS` array in `bundle-assets.sh`.
6. **Available-but-uninstalled discovery:** Doctor compares installed skills against the manifest constants (`WORKFLOW_SKILLS`, `IDEA_SKILLS`, `UTILITY_SKILLS`) to surface packs/skills the user doesn't have. For v1, the skill embeds a copy of the manifest skill lists rather than calling a CLI command, since no `oat tools available` command exists yet.

## Constraints

- Must follow existing SKILL.md format (frontmatter, mode assertion, progress indicators, numbered steps)
- Must use `allowed-tools` that are available in the skill context
- Doctor's data gathering must use existing `oat` CLI commands with `--json` flag
- Both skills should be `user-invocable: true` and `disable-model-invocation: true`
- Must register in skill manifest and bundle script for distribution

## Success Criteria

- `/oat-doctor` runs in check mode by default, showing actionable warnings with fix commands
- `/oat-doctor --summary` shows a full dashboard of installed tools, config, and available packs
- `/oat-docs` answers questions about OAT by reading local documentation files
- Both skills are registered in the utility pack and bundle correctly
- `pnpm build`, `pnpm lint`, `pnpm type-check` pass after changes

## Out of Scope

- Docs bundling infrastructure (`~/.oat/docs/`, postinstall hooks, lazy creation)
- New CLI commands (`oat doctor`, `oat tools available`)
- Doctor writing report files (`.oat/doctor-report.md`)
- Skill versioning frontmatter beyond standard `version: 1.0.0`

## Deferred Ideas

- `~/.oat/docs/` bundling with CLI version pinning — requires CLI infrastructure work
- `oat tools available --json` command for programmatic manifest comparison
- Doctor report file output mode
- Schema introspection (`oat schema <command>`) for dynamic CLI discovery

## Next Steps

Straight to plan — scope is clear, two skill files plus manifest registration.

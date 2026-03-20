---
oat_status: complete
oat_ready_for: oat-project-plan
oat_blockers: []
oat_last_updated: 2026-03-20
oat_generated: false
---

# Discovery: backlog-init-command

## Initial Request

Add an explicit backlog scaffold CLI command for repositories that have OAT installed but do not yet have the file-backed backlog structure under `.oat/repo/reference/backlog/`. The immediate trigger was trying to use the new project-management flow in a fresh repo and finding that the backlog directories and starter files did not exist.

## Clarifying Questions

### Question 1: Scope of the fix

**Q:** Should the fix include automatic skill behavior changes, or stay at the CLI layer?
**A:** Keep it to a new CLI command for now and do not update `oat-pjm-*` skills.
**Decision:** This project will add `oat backlog init` only. Skill behavior stays unchanged.

### Question 2: Future PM direction

**Q:** Should the local backlog scaffold be treated as mandatory project-management initialization?
**A:** Not yet. Future Linear/Jira-backed project management may not need a local scaffold at all.
**Decision:** Keep the command backlog-scoped and explicit. Do not introduce PJM-specific or automatic initialization semantics in this task.

## Options Considered

### Option A: Explicit `oat backlog init` command

**Description:** Add a dedicated backlog CLI subcommand that creates the canonical backlog directories and starter markdown files on demand.

**Pros:**

- Keeps the setup behavior explicit and discoverable.
- Avoids coupling local-only setup assumptions into skills that may later support remote PM flows.
- Can be reused by any backlog-related workflow, not just add-item flows.

**Cons:**

- Requires users to learn one additional setup command.

**Chosen:** A

**Summary:** Use an explicit, idempotent `oat backlog init` command as the initial fix. It solves the immediate onboarding gap without overcommitting to a local-only PM model.

### Option B: Auto-scaffold from skills or other backlog commands

**Description:** Detect a missing backlog scaffold at runtime and create it implicitly from `oat-pjm-add-backlog-item` or other backlog operations.

**Pros:**

- Reduces manual setup steps for first-time users.
- Can feel smoother in purely local workflows.

**Cons:**

- Bakes local scaffold assumptions into higher-level flows prematurely.
- Makes repo mutations less explicit.
- Risks awkward behavior when future remote PM integrations do not want the same local scaffold.

**Chosen:** Not now

**Summary:** This remains a reasonable future enhancement, but it is intentionally deferred until the local-vs-remote PM model is clearer.

## Key Decisions

1. **Entry point:** Add `oat backlog init` as a first-class CLI command under the existing backlog command group.
2. **Scope boundary:** Do not update `oat-pjm-add-backlog-item` or other skills in this project.
3. **Scaffold behavior:** The command should create the canonical backlog directory structure and starter files, and be safe to rerun without clobbering existing curated content.

## Constraints

- This is a new follow-on task after the prior project-management backlog work was already merged.
- The solution should not assume local file-backed backlog setup is always required for future project-management integrations.
- The command must fit the existing backlog CLI surface and testing conventions.

## Success Criteria

- `oat backlog init` creates `.oat/repo/reference/backlog/`, `items/`, `archived/`, `index.md`, and `completed.md` when they are missing.
- The generated starter files use the existing managed index markers and starter sections expected by current backlog tooling.
- Re-running the command is idempotent and does not overwrite existing curated backlog content.
- Freshly scaffolded backlog roots work with existing backlog commands such as `oat backlog regenerate-index`.

## Out of Scope

- Automatic scaffold creation from `oat-pjm-*` skills or other backlog commands.
- Any remote Linear/Jira synchronization or project-management integration changes.
- Reworking the broader project-management onboarding flow beyond this explicit command.

## Deferred Ideas

- Auto-initialize the backlog scaffold from add-item or review flows once the local-vs-remote PM contract is clearer.
- Introduce a broader PM initialization story later if remote-backed project-management still benefits from partial local scaffolding.

## Open Questions

- **Future PM model:** Whether later Linear/Jira-backed flows should reuse this local scaffold, partially reuse it, or bypass it entirely.

## Assumptions

- The canonical starter content for `index.md` and `completed.md` should match the current file-backed backlog structure already used in this repo.
- A backlog-scoped command is the cleanest current entry point because the missing assets live under `.oat/repo/reference/backlog/`, not inside the installed skill pack.

## Risks

- **Scope creep toward full PM setup:** The command could grow into a broader local project-management initializer.
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation Ideas:** Keep the command narrowly scoped to backlog files and directories only.
- **Starter-content drift:** The scaffolded `index.md` and `completed.md` could diverge from the current canonical backlog structure over time.
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation Ideas:** Add focused tests that assert the expected managed markers and starter sections.

## Next Steps

Proceed directly to `plan.md`. The request is well-understood, scoped to a single CLI feature, and does not need a separate lightweight design step.

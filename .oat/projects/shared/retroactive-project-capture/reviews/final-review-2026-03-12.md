---
oat_generated: true
oat_generated_at: 2026-03-12
oat_review_scope: final
oat_review_type: code
oat_project: /Users/thomas.stang/Code/open-agent-toolkit/.oat/projects/shared/retroactive-project-capture
---

# Code Review: final

**Reviewed:** 2026-03-12
**Scope:** Final review of all files changed on `happier-test` since `f9d2dc46b5581132e68fcddedd2ca0c451a7aa4d`
**Files reviewed:** 19
**Commits:** `f9d2dc46b5581132e68fcddedd2ca0c451a7aa4d..HEAD` (2 commits)

## Summary

The branch is close, and the new `oat-project-capture` skill is wired into CLI distribution correctly. The remaining gaps are workflow-contract issues rather than test failures: the skill frontmatter currently blocks its own `oat` commands, and the retroactive project bookkeeping no longer accurately maps planned work to implemented work.

## Findings

### Critical

None

### Important

- **`allowed-tools` blocks the skill's required `oat` commands** (`.agents/skills/oat-project-capture/SKILL.md:7`)
  - Issue: The new skill is limited to `Bash(git:*)`, but its happy path requires non-git shell commands such as `oat project new "{name}" --mode quick` and `oat state refresh` later in the workflow (`.agents/skills/oat-project-capture/SKILL.md:147`, `.agents/skills/oat-project-capture/SKILL.md:258`). In hosts that honor the frontmatter contract, the skill cannot execute its own scaffold/refresh steps.
  - Fix: Broaden the frontmatter to allow the commands the skill actually uses, matching the existing workflow skills that need `oat`/shell execution.

- **Implementation tracking reuses `p01-t03` for different work than the plan defines** (`.oat/projects/shared/retroactive-project-capture/implementation.md:92`, `.oat/projects/shared/retroactive-project-capture/implementation.md:145`)
  - Issue: The plan defines `p01-t03` as the backlog move (`.oat/projects/shared/retroactive-project-capture/plan.md:157`), but `implementation.md` records `p01-t03` as sibling validation fixes and then states that task was "Not in original plan". That breaks the plan-to-implementation traceability this workflow depends on, even though the backlog file did change on the branch.
  - Fix: Preserve `p01-t03` for the backlog update and record the validation-fix work as an explicit deviation or a new task ID, so downstream review/PR tooling can follow the same task mapping as `plan.md`.

### Medium

- **The skill's "no plan generation" contract is contradicted by its chosen scaffold path** (`.agents/skills/oat-project-capture/SKILL.md:44`, `.agents/skills/oat-project-capture/SKILL.md:58`, `.agents/skills/oat-project-capture/SKILL.md:147`)
  - Issue: The skill repeatedly says capture must not generate `plan.md`, but Step 3 uses `oat project new --mode quick`, and the quick scaffold unconditionally creates `plan.md` (`packages/cli/src/commands/project/new/scaffold.ts:43`). That leaves the instructions internally inconsistent and makes the success criterion at `.agents/skills/oat-project-capture/SKILL.md:306` unattainable as written.
  - Fix: Either change the scaffold approach so capture truly avoids `plan.md`, or relax the contract and explain how the pre-seeded `plan.md` should be handled in captured projects.

### Minor

- **Backlog status no longer matches the captured project state** (`.oat/repo/reference/backlog.md:155`)
  - Issue: The backlog entry says "Implementation in progress", but the captured project state is already `implement` + `complete` and "Ready for review or PR" (`.oat/projects/shared/retroactive-project-capture/state.md:8`, `.oat/projects/shared/retroactive-project-capture/state.md:22`, `.oat/projects/shared/retroactive-project-capture/state.md:52`).
  - Fix: Update the backlog wording to reflect that implementation is complete and the item is awaiting review/PR, or document why backlog status intentionally lags project state.

## Spec/Design Alignment

**Evidence sources used:** `discovery.md`, `plan.md`, `implementation.md`, `state.md`, `reviews/self-review.md`

### Requirements Coverage

| Requirement                                | Status      | Notes                                                                                                               |
| ------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| Skill-only workflow                        | implemented | No CLI command was added; the feature ships as a skill plus installer registration.                                 |
| Conversation context drives capture        | implemented | Discovery and skill steps consistently prioritize conversation context over commit history.                         |
| Quick-mode scaffold with captured metadata | implemented | Skill sets quick-mode metadata and the captured project state reflects that origin.                                 |
| No retroactive plan generation             | partial     | Skill contract forbids generating `plan.md`, but Step 3 currently uses a scaffold that always creates it.           |
| Lifecycle state is user-chosen             | implemented | Step 6 records the review-ready vs in-progress branch.                                                              |
| CLI distribution registration              | implemented | `bundle-assets.sh`, `skill-manifest.ts`, and install-workflows coverage are updated.                                |
| Backlog reflects project status            | partial     | Entry moved into `In Progress`, but the status text no longer matches the project's completed implementation state. |

### Extra Work (not in declared requirements)

- Validation wording fixes in `.agents/skills/oat-project-document/SKILL.md` and `.agents/skills/oat-project-quick-start/SKILL.md`
- Project-capture bookkeeping artifacts under `.oat/projects/shared/retroactive-project-capture/`

## Verification Commands

```bash
pnpm oat:validate-skills
pnpm --filter @oat/cli test -- install-workflows
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.

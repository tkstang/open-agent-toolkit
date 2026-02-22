---
oat_generated: true
oat_generated_at: 2026-02-21
oat_review_scope: final
oat_review_type: code
oat_project: .oat/projects/shared/b09-review-workflow-hardening/
---

# Code Review: Final (b09-review-workflow-hardening)

**Reviewed:** 2026-02-21
**Scope:** Final code review -- all changes on `review-workflow-hardening` branch (13 commits from main)
**Files reviewed:** 15 (4 skill files, 5 CLI files, 6 provider symlinks)
**Commits:** 13 (e2cc732..4da3337)

## Summary

The implementation delivers all planned artifacts: three new receive skills, review gate hardening in `oat-project-subagent-implement`, CLI registration, and provider sync. Code quality is solid overall, with consistent structure across the new skills and correct CLI registration. Two important consistency gaps exist: the new remote receive skills lack the Self-Correction Protocol section required by the OAT skill template, and the severity model in `oat-review-provide` (3-tier) diverges from the new 4-tier model without an explicit reconciliation note in the subagent gate. There are no critical findings.

## Findings

### Critical

None

### Important

- **Missing Self-Correction Protocol in `oat-review-receive-remote`** (`.agents/skills/oat-review-receive-remote/SKILL.md:19-35`)
  - Issue: The OAT skill template (`create-oat-skill/references/oat-skill-template.md:30-33`) includes a required `Self-Correction Protocol` subsection within `Mode Assertion`. The local receive skill (`oat-review-receive/SKILL.md:36-41`) correctly includes one, but `oat-review-receive-remote` omits it entirely. The Mode Assertion section jumps from ALLOWED Activities directly to Progress Indicators.
  - Fix: Add a Self-Correction Protocol block after the ALLOWED Activities section in `oat-review-receive-remote/SKILL.md`, following the same pattern as `oat-review-receive/SKILL.md:36-41`. Suggested content should address: (1) auto-replying on GitHub without user confirmation, (2) mutating project lifecycle artifacts in ad-hoc mode, (3) skipping the findings overview before triage prompts.
  - Requirement: Plan P2-T1 Step 3 ("Ensure severity guidance is consistent with local receive skill and remove duplicate parser descriptions") and imported plan P2-T1 frontmatter referencing Mode Assertion.

- **Missing Self-Correction Protocol in `oat-project-review-receive-remote`** (`.agents/skills/oat-project-review-receive-remote/SKILL.md:19-35`)
  - Issue: Same omission as above. The project-scoped remote receive skill also lacks a Self-Correction Protocol subsection. The existing project-scoped local receive skill (`oat-project-review-receive/SKILL.md`) also lacks one, so this may be a pre-existing pattern gap, but the OAT skill template explicitly includes it and `oat-review-receive` (the foundational skill in this PR) does include it.
  - Fix: Add a Self-Correction Protocol block. Suggested guardrails: (1) making code changes in receive mode, (2) reusing existing task IDs instead of generating new ones, (3) posting GitHub replies without explicit user approval.
  - Requirement: Plan imported plan Phase 3 P3-T1 ("Align task-conversion language with `oat-project-review-receive`").

- **Autonomous gate uses 3-tier severity but new receive skills use 4-tier** (`.agents/skills/oat-project-subagent-implement/SKILL.md:206-207`)
  - Issue: The autonomous review gate Stage 2 explicitly states "Severity classification: Critical, Important, Minor" (3-tier, line 207), while all three new receive skills use 4-tier (Critical, Important, Medium, Minor). Line 445 even acknowledges the divergence: "Manual review findings use the full Critical/Important/Medium/Minor taxonomy." The pass criteria on line 210 reference "No Critical or Important findings" which is compatible, but the 3-tier severity classification in Stage 2 creates an ambiguity: if a reviewer using the gate finds a Medium-severity issue, there is no guidance on how to classify it. The verdict map `findings` structure (line 234-236) only has `critical`, `important`, and `minor` buckets with no `medium`.
  - Fix: Either (a) add `medium` to the verdict map findings structure and Stage 2 severity classification to match the 4-tier model used by receive skills, or (b) add an explicit note in Step 4 that the autonomous gate intentionally uses 3-tier and how Medium maps (e.g., "Medium findings from the reviewer should be classified as Minor for gate verdict purposes"). Option (b) is lower risk since it preserves the existing gate pass/fail semantics. Add `medium: []` to the verdict map YAML if choosing option (a).
  - Requirement: Imported plan "Verification" item 6: "All 3 receive skills use consistent 4-tier severity model and common findings format convention."

### Minor

- **Inconsistent step count between progress indicators and process sections in `oat-project-review-receive-remote`** (`.agents/skills/oat-project-review-receive-remote/SKILL.md:45-52`)
  - Issue: Progress indicators show 7 steps (`[1/7]...[7/7]`), but the Process section has 9 steps (Step 0 through Step 8). This is because Step 0 (project resolution) and Step 8 (GitHub replies) are not represented in the progress indicators. The imported plan specified Steps 0-10 which were consolidated to Steps 0-8 -- the consolidation is reasonable, but the progress indicator count should reflect the actual process flow or explicitly note that Step 0 and Step 8 are not counted in progress indicators.
  - Suggestion: Either add the missing steps to the progress indicators (making it `[1/9]...[9/9]`) or add a comment noting that Step 0 (pre-flight) and Step 8 (optional post-flight) are excluded from progress reporting. The local receive skill uses `[1/4]` for its 5-step process (Step 1-5, no Step 0), which is consistent since it has no Step 0, so the convention seems to be "progress indicators count process steps only." In that case, Step 8 (optional GitHub replies) should either be included or a note added that optional steps are excluded.

- **`oat-review-receive-remote` step count mismatch** (`.agents/skills/oat-review-receive-remote/SKILL.md:46-50`)
  - Issue: Progress indicators show 5 steps (`[1/5]...[5/5]`), but the Process section has 6 steps (Steps 1-6). Step 6 (Optional GitHub Reply Posting) is not represented in the progress indicators. This is the same pattern as above.
  - Suggestion: Either add `[6/6] Posting replies (optional)...` to the progress indicators or note that optional steps are excluded from the count. Be consistent across all three receive skills.

- **No `Recovery` subsection in `oat-review-receive` Self-Correction Protocol** (`.agents/skills/oat-review-receive/SKILL.md:36-41`)
  - Issue: The OAT skill template includes both `Self-Correction Protocol` and `Recovery` subsections within Mode Assertion. `oat-review-receive` includes the Self-Correction Protocol but omits the `Recovery` subsection. Other skills like `oat-review-provide` include both.
  - Suggestion: Add a brief Recovery subsection (e.g., "1. Re-locate review artifact. 2. Re-parse findings from last clean state.") This is low priority since the existing `oat-project-review-receive` also omits Recovery.

- **Bundle-assets.sh skills are not fully alphabetized** (`.agents/skills/ scope in `packages/cli/scripts/bundle-assets.sh:37-39`)
  - Issue: The `oat-review-*` skills are listed after `oat-worktree-bootstrap` (line 36-39), breaking the alphabetical convention used for the `oat-project-*` skills block. The imported plan P5-T1 Step 3 says "Re-sort arrays where required so list ordering remains deterministic and alphabetized by existing convention."
  - Suggestion: Move `oat-review-provide`, `oat-review-receive`, and `oat-review-receive-remote` to their correct alphabetical position (after `oat-project-*` but before `oat-repo-*`, or interleaved properly). However, looking at the existing file on main, this ordering was pre-existing for `oat-review-provide`, so the new skills just followed the existing convention of appending non-project skills after the project block. This is a cosmetic issue.

## Requirements/Design Alignment

**Evidence sources used:** `plan.md` (import mode, primary), `references/imported-plan.md` (original external plan), `implementation.md` (execution log)

### Requirements Coverage

| Requirement | Status | Notes |
|-------------|--------|-------|
| P1: `oat-review-receive` skill | implemented | 193 lines, all required sections present (mode assertion, progress, findings model, triage, task output, success criteria) |
| P1: Frontmatter correctness | implemented | All 6 required keys present and correct |
| P1: Progress banner + step indicators | implemented | `OAT > REVIEW RECEIVE` banner, `[1/4]..[4/4]` indicators |
| P1: 4-tier findings model | implemented | Critical/Important/Medium/Minor with stable IDs (C/I/M/m) |
| P1: Interactive triage flow | implemented | convert/defer/dismiss with rationale requirements |
| P1: Standalone task-list output | implemented | Markdown format, no plan task IDs |
| P1: 3-tier compatibility | implemented | Explicit rule: "If artifact uses a 3-tier model, treat Medium as zero findings" |
| P2: `oat-review-receive-remote` skill | implemented | 183 lines, PR resolution, agent-reviews fetch, classification, triage, task list, optional replies |
| P2: PR resolution | implemented | `--pr <N>` from args or auto-detect |
| P2: `agent-reviews` fetch flow | implemented | `npx agent-reviews --json --unresolved --pr <N>` |
| P2: Severity classification | implemented | 4-tier with `CHANGES_REQUESTED` as hint |
| P2: Troubleshooting section | implemented | Auth, PR detection, no comments, network/rate limit |
| P2: Optional reply workflow | implemented | Explicit user confirmation gate |
| P3: `oat-project-review-receive-remote` skill | implemented | 208 lines, project resolution, PR intake, plan task creation, artifact updates |
| P3: Active project resolution | implemented | Standard `PROJECT_PATH` + `PROJECTS_ROOT` resolution |
| P3: Review-fix task creation | implemented | Stable `pNN-tNN` IDs, `fix(pNN-tNN)` commit template |
| P3: `plan.md` updates | implemented | Reviews table, Implementation Complete totals |
| P3: `implementation.md` updates | implemented | Remote Review Received section, current task pointer |
| P3: `state.md` updates | implemented | Phase, status, current task frontmatter |
| P3: 3-cycle review limit | implemented | Step 7 includes cycle limit and routing |
| P4: Reviewer peer subagent dispatch (Step 4) | implemented | Explicit mechanism with artifact path and context |
| P4: Fix-loop with re-dispatch | implemented | Step 4 includes fix subagent dispatch and reviewer re-dispatch |
| P4: Verdict map structure | implemented | YAML schema with unit_id, verdict, retry_count, review_artifact, findings, disposition |
| P4: Hard pre-merge gate (Step 5) | implemented | `review_gate_missing` and `review_gate_failed` dispositions, `verdict == pass` requirement |
| P4: Run log gate evidence fields | implemented | `Reviewer dispatch`, `Review artifact`, `review_gate_executed`, `Fix-loop iterations` |
| P4: Non-negotiable constraints | implemented | Both verbatim constraints present: "Never merge a unit without an explicit pass verdict" and "Always dispatch reviewer as a peer subagent" |
| P5: CLI registration | implemented | Correct categories: 2 ad-hoc as utility, 1 project-scoped as workflow |
| P5: Bundle script | implemented | All 3 new skills in SKILLS array |
| P5: Test updates | implemented | Workflow count 20->21, utility skills array updated, all 546 tests pass |
| P5: Provider symlinks | implemented | 6 symlinks (3 claude, 3 cursor) verified |
| P5: Skill validation | implemented | 32 oat-* skills pass validation |

### Extra Work (not in declared requirements)

- `comment_id` field added to findings model in remote receive skills (`oat-review-receive-remote/SKILL.md:67`, `oat-project-review-receive-remote/SKILL.md:69`). This is not in the imported plan's common findings format (which only has `source` and `source_ref`), but it is a natural extension needed for the reply workflow (`npx agent-reviews --reply <id>`). This is justified scope addition, not scope creep.

### Design Alignment

**Architecture alignment:** Implementation follows the planned architecture of three independent receive skills sharing a common findings model convention (not a shared script), plus gate hardening in the existing subagent orchestrator.

**Naming convention:** All three new skills follow the specified `-remote` suffix pattern. Registration categories match conventions (`oat-review-*` as utility, `oat-project-*` as workflow).

**Gate structure:** Changes to `oat-project-subagent-implement` are surgical additions to Steps 4 and 5, plus log template and constraints. No existing behavior was removed; the policy-based skip escape hatch was tightened to a hard gate, which is a deliberate design decision documented in the implementation notes.

## Verification Commands

Run these to verify the implementation:

```bash
# Build and test
pnpm build && pnpm test

# Validate all skills
pnpm oat:validate-skills

# Verify new skill files exist
ls -la .agents/skills/oat-review-receive/SKILL.md .agents/skills/oat-review-receive-remote/SKILL.md .agents/skills/oat-project-review-receive-remote/SKILL.md

# Verify gate hardening terms in subagent-implement
rg -n "peer subagent|gate-review|review_gate_missing|review_gate_failed|review_gate_executed|merge a unit without" .agents/skills/oat-project-subagent-implement/SKILL.md

# Verify provider symlinks
ls -la .claude/skills/oat-review-receive .claude/skills/oat-review-receive-remote .claude/skills/oat-project-review-receive-remote

# Verify line counts are within budget
wc -l .agents/skills/oat-review-receive/SKILL.md .agents/skills/oat-review-receive-remote/SKILL.md .agents/skills/oat-project-review-receive-remote/SKILL.md .agents/skills/oat-project-subagent-implement/SKILL.md

# Verify CLI tests pass specifically
pnpm --filter @oat/cli test -- --run
```

## Recommended Next Step

Run the `oat-project-review-receive` skill to convert findings into plan tasks.

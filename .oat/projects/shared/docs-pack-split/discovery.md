---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-20
oat_generated: false
---

# Discovery: docs-pack-split

## Initial Request

Create a separate `docs` tool pack so documentation workflows no longer live in
the `utility` pack. Keep `oat-docs` in `core`, move the docs analyze/apply and
agent-instructions analyze/apply skills into the new pack, and then implement
the supporting CLI, scan/update/remove behavior, and documentation updates.

## Solution Space

The request started as exploratory because there were multiple reasonable pack
boundaries.

### Approach 1: Keep Everything in `utility`

**Description:** Leave both docs workflows and agent-instructions workflows in
the current `utility` pack.
**When this is the right choice:** Best if the priority is avoiding any CLI or
docs churn and the current categorization is acceptable.
**Tradeoffs:** Keeps the current conceptual mismatch where docs governance lives
in a generic utility bucket.

### Approach 2: Move All Docs-Related Skills Into `docs`

**Description:** Create a `docs` pack and move `oat-docs`, `oat-docs-*`, and
`oat-agent-instructions-*` into it.
**When this is the right choice:** Best if you want one pack to own both docs
access and docs authoring/governance workflows.
**Tradeoffs:** Weakens the current `core` story by moving foundational docs
access out of the always-available base pack.

### Approach 3: Keep `oat-docs` in `core`, Move Analyze/Apply Workflows Into `docs` _(Recommended)_

**Description:** Preserve `core` as foundational access and diagnostics, then
create a dedicated `docs` pack for active analyze/apply workflows over docs
surfaces and agent instructions.
**When this is the right choice:** Best when you want clearer pack ownership
without changing the meaning of `core`.
**Tradeoffs:** Requires a moderate CLI/docs migration and forces us to resolve
the existing shared-helper coupling between docs and agent-instructions skills.

### Chosen Direction

**Approach:** Approach 3
**Rationale:** It gives each pack a coherent product story:
`core` stays universal, `docs` becomes authoring/governance, and `utility`
shrinks back to generic maintenance helpers.
**User validated:** Yes

## Options Considered

### Option A: Make `docs` Pack User-Eligible

**Description:** Keep the new `docs` pack user/project install eligible, like
the current `utility` pack.

**Pros:**

- Preserves current flexibility for people who want docs workflows everywhere
- Avoids a scope regression for existing users of the moved skills

**Cons:**

- Requires one more user-eligible pack in the pack selection UX

**Chosen:** A

**Summary:** The new pack should remain user/project eligible so the split does
not silently narrow how these workflows are installed today.

### Option B: Keep the Shared Tracking Helper Under `oat-agent-instructions-analyze`

**Description:** Leave the helper where it is and let docs skills continue to
reference it across pack boundaries.

**Pros:**

- Smallest code change

**Cons:**

- Creates a hidden cross-pack runtime dependency
- Makes the new `docs` pack conceptually leaky and harder to maintain

**Chosen:** Neither

**Summary:** Move the helper to a neutral shared scripts location as part of
the split so pack boundaries are real, not just labels.

## Key Decisions

1. **Pack boundary:** `oat-docs` remains in `core`; `oat-docs-analyze`,
   `oat-docs-apply`, `oat-agent-instructions-analyze`, and
   `oat-agent-instructions-apply` move to a new `docs` pack.
2. **Pack intent:** `docs` covers active documentation and instruction
   governance workflows, not generic repo maintenance.
3. **Compatibility:** The split must update install, list, scan, update,
   remove, help text, and human docs together so the CLI and docs stay aligned.
4. **Dependency hygiene:** Shared helper scripts must move to a neutral location
   rather than remain inside one skill's private folder.

## Constraints

- Preserve existing behavior for `oat-docs` as foundational docs access in
  `core`.
- Avoid hidden runtime coupling between separately installed packs.
- Keep the pack taxonomy understandable from CLI help and docs alone.
- Update tests alongside code so pack membership and asset bundling stay
  enforced.

## Success Criteria

- A `docs` pack exists in the CLI and can be installed the same way as other
  packs.
- The four analyze/apply skills are recognized as `docs` pack members by
  scanning, listing, updating, and removing flows.
- The moved skills no longer depend on an internal helper path owned by another
  pack.
- End-user docs and help snapshots consistently describe the new pack layout.

## Out of Scope

- Rewriting the behavior of the docs or agent-instructions workflows beyond what
  is needed for the pack split and helper relocation.
- Reorganizing unrelated utility, research, or workflow packs.
- Introducing new documentation features beyond updated pack guidance.

## Deferred Ideas

- Consider a future `authoring` pack if skill creation and docs governance ever
  want to be grouped under one higher-level category.
- Revisit whether legacy `oat remove skills --pack ...` ergonomics should be
  modernized more broadly instead of only adding `docs`.

## Open Questions

- **Shared helper path:** Choose the exact neutral home for the tracking helper
  during implementation based on the existing canonical script conventions.
- **Docs coverage:** Decide how broadly to update existing docs pages and
  examples beyond the known pack and quickstart references if additional pack
  mentions surface during implementation.

## Assumptions

- `docs` should remain user/project eligible because the source skills currently
  come from the user-eligible `utility` pack.
- Quick workflow is sufficient because the scope is clear and no deeper
  architecture artifact is needed before planning.

## Risks

- **Partial pack wiring:** A new pack can be added in one command surface but
  missed in scan/update/remove/help flows.
  - **Likelihood:** Medium
  - **Impact:** High
  - **Mitigation Ideas:** Plan explicit tasks for CLI install surfaces,
    management commands, tests, and help snapshots.
- **Broken workflow references:** Moving the helper path can leave stale skill
  references behind.
  - **Likelihood:** Medium
  - **Impact:** Medium
  - **Mitigation Ideas:** Centralize helper relocation in its own task and
    verify with repo-wide searches plus targeted tests.
- **Docs drift:** Product docs may continue to say "utility" after the pack
  split ships.
  - **Likelihood:** High
  - **Impact:** Medium
  - **Mitigation Ideas:** Treat docs updates as a first-class plan task, not a
    cleanup item.

## Next Steps

Proceed directly to `plan.md`. Discovery resolved the pack boundary, no
lightweight design artifact is needed, and the remaining work is a clear
implementation sequence across CLI code, shared assets, and documentation.

---
oat_status: complete
oat_ready_for: oat-project-implement
oat_blockers: []
oat_last_updated: 2026-03-11
oat_phase: plan
oat_phase_status: complete
oat_plan_hill_phases: []
oat_plan_source: quick
oat_import_reference: null
oat_import_source_path: null
oat_import_provider: null
oat_generated: false
---

# Implementation Plan: collect-review-comments

> Execute this plan using `oat-project-implement` (sequential) or `oat-project-subagent-implement` (parallel), with phase checkpoints and review gates.

**Goal:** Add `oat repo pr-comments collect` and `oat repo pr-comments triage-collection` CLI commands that collect PR review comments from merged pull requests via the GitHub GraphQL API, filter noise, assign stable IDs, output monthly JSON+Markdown chunks, and support interactive triage.

**Architecture:** New `repo` command group under `packages/cli/src/commands/repo/` with `pr-comments` subgroup. Uses GitHub GraphQL API via `gh api graphql` to fetch merged PRs with nested review comments. Follows existing CLI patterns: Commander.js commands, dependency injection, logger-based output, `CommandContext`.

**Tech Stack:** TypeScript, Commander.js, `gh` CLI (GraphQL), Node.js child_process

**Commit Convention:** `feat(p01-tNN): {description}`

## Planning Checklist

- [x] Confirmed approach with user (GraphQL over REST)
- [x] Set `oat_plan_hill_phases` in frontmatter

---

## Phase 1: Core Commands

### Task p01-t01: Create repo command group and pr-comments subgroup

**Files:**

- Create: `packages/cli/src/commands/repo/index.ts`
- Create: `packages/cli/src/commands/repo/pr-comments/index.ts`
- Modify: `packages/cli/src/commands/index.ts`

**Steps:**

1. Create `repo` command group with `pr-comments` subgroup
2. Register `createRepoCommand()` in main command index
3. Verify `oat repo pr-comments --help` shows subcommands

---

### Task p01-t02: Implement collect command — types, GraphQL queries, core logic

**Files:**

- Create: `packages/cli/src/commands/repo/pr-comments/collect/pr-comments.types.ts`
- Create: `packages/cli/src/commands/repo/pr-comments/collect/graphql-queries.ts`
- Create: `packages/cli/src/commands/repo/pr-comments/collect/collect-comments.ts`
- Create: `packages/cli/src/commands/repo/pr-comments/collect/index.ts`

**Steps:**

1. Define TypeScript types for PR review comments, collection chunks, GraphQL response shapes
2. Write GraphQL queries: `SEARCH_MERGED_PRS_QUERY` (paginated merged PR search with nested review comments) and `REVIEW_COMMENTS_PAGE_QUERY` (for PRs with >100 comments)
3. Implement `runCollectComments()` with:
   - Paginated GraphQL fetching via `gh api graphql`
   - Bot filtering (`[bot]` suffix)
   - Trivial comment filtering (LGTM, nit, +1, thumbsup patterns)
   - Stable sequential ID assignment (`RC-001`, `RC-002`, ...)
   - Monthly grouping by `createdAt`
   - JSON + Markdown output per month chunk
4. Register Commander command with options: `--since`, `--until`, `--out-dir`, `--repo`, `--no-ignore-bots`
5. Dependency injection for `ghGraphQL` to enable testing

---

### Task p01-t03: Implement triage-collection command

**Files:**

- Create: `packages/cli/src/commands/repo/pr-comments/triage-collection/triage-comments.ts`
- Create: `packages/cli/src/commands/repo/pr-comments/triage-collection/index.ts`

**Steps:**

1. Implement `runTriageComments()` with:
   - Read collected JSON chunk by month
   - Interactive readline loop: show comment summary, prompt keep/discard
   - Write filtered output as `{month}.triaged.json`
   - Guard against non-interactive mode
2. Register Commander command with options: `--month`, `--input-dir`, `--output-dir`
3. Dependency injection for file reading to enable testing

---

### Task p01-t04: Verification — build, type-check, lint

**Steps:**

1. Run: `pnpm --filter @oat/cli type-check` — verify no type errors
2. Run: `pnpm --filter @oat/cli lint` — verify no lint errors
3. Run: `pnpm build` — verify full build succeeds
4. Run: `pnpm run cli -- repo pr-comments --help` — verify help output
5. Run: `pnpm run cli -- repo pr-comments collect --help` — verify options

---

### Task p01-t05: (review) Fix default repo resolution and nested pagination

**Files:**

- Modify: `packages/cli/src/commands/repo/pr-comments/collect/index.ts`
- Modify: `packages/cli/src/commands/repo/pr-comments/collect/collect-comments.ts`

**Step 1: Understand the issue**

Review finding: When `--repo` is omitted, the search query drops the `repo:` qualifier entirely, causing `gh api graphql` to search across every repository visible to the authenticated user. Nested review-comment pagination only works when `owner/name` was parsed from `--repo`, so PRs with >100 review comments are silently truncated in the default path.
Location: `collect/index.ts:29`, `collect-comments.ts:63`

**Step 2: Implement fix**

- Add a `resolveCurrentRepo()` helper that extracts `owner/name` from the current git remote (e.g., `git remote get-url origin` parsed to `owner/repo`)
- When `--repo` is omitted, call `resolveCurrentRepo()` and use the result for both the search qualifier and nested pagination
- Fail with a clear error message if repo resolution is impossible (no git remote, unparseable URL)
- Ensure the resolved repo value flows into the same code path as an explicit `--repo` flag

**Step 3: Verify**

Run: `pnpm --filter @oat/cli type-check`
Run: `pnpm build`
Expected: No type errors, build succeeds, `--help` still shows correct options

**Step 4: Commit**

```bash
git add packages/cli/src/commands/repo/pr-comments/collect/index.ts packages/cli/src/commands/repo/pr-comments/collect/collect-comments.ts
git commit -m "fix(p01-t05): resolve current repo from git remote when --repo is omitted"
```

---

### Task p01-t06: (review) Fix monthly chunking to use merge date and reverse-chronological order

**Files:**

- Modify: `packages/cli/src/commands/repo/pr-comments/collect/collect-comments.ts`

**Step 1: Understand the issue**

Review finding: Discovery requires reverse-chronological monthly chunks and says month assignment should use the PR merge date for PRs that span month boundaries. The implementation groups by `createdAt` and sorts months ascending.
Location: `collect-comments.ts:266`

**Step 2: Implement fix**

- Change the monthly grouping key from `comment.createdAt.slice(0, 7)` to `comment.prMergedAt.slice(0, 7)` (or equivalent field carrying the PR merge date)
- Sort the month chunks in descending order before writing output files
- Ensure the `prMergedAt` field is available on each comment record (it should already be carried from the GraphQL response)

**Step 3: Verify**

Run: `pnpm --filter @oat/cli type-check`
Run: `pnpm build`
Expected: No type errors, build succeeds

**Step 4: Commit**

```bash
git add packages/cli/src/commands/repo/pr-comments/collect/collect-comments.ts
git commit -m "fix(p01-t06): group monthly chunks by PR merge date, sort reverse-chronological"
```

---

### Task p01-t07: (review) Extend noise filtering to match discovery contract

**Files:**

- Modify: `packages/cli/src/commands/repo/pr-comments/collect/graphql-queries.ts`
- Modify: `packages/cli/src/commands/repo/pr-comments/collect/collect-comments.ts`
- Modify: `packages/cli/src/commands/repo/pr-comments/collect/pr-comments.types.ts`

**Step 1: Understand the issue**

Review finding: Discovery locked in two-layer bot detection (`type: Bot` plus known-service defaults) and a broader trivial-comment heuristic. The implementation only drops logins ending in `[bot]` and four exact body matches.
Location: `collect-comments.ts:25`, `collect-comments.ts:233`

**Step 2: Implement fix**

- Extend the GraphQL query to select the author `__typename` (or `type` field) to detect `Bot` type authors
- Add a known-service bot list as defaults (CodeRabbit, Copilot, Sourcery, Vercel, Supabase, Codacy, SonarCloud, etc.)
- Implement the broader trivial-comment heuristic: known phrases (`looks good`, `ship it`, `LGTM`, `+1`, emoji-only, `nit`) OR under a word-count threshold (e.g., <5 words)
- Add code-reference escape hatch: preserve short comments that reference code (contain backticks, file paths, line numbers)
- Update types if needed to carry the author type field

**Step 3: Verify**

Run: `pnpm --filter @oat/cli type-check`
Run: `pnpm build`
Expected: No type errors, build succeeds

**Step 4: Commit**

```bash
git add packages/cli/src/commands/repo/pr-comments/collect/graphql-queries.ts packages/cli/src/commands/repo/pr-comments/collect/collect-comments.ts packages/cli/src/commands/repo/pr-comments/collect/pr-comments.types.ts
git commit -m "fix(p01-t07): extend bot detection and trivial-comment filtering per discovery contract"
```

---

## Reviews

| Scope | Type     | Status          | Date       | Artifact                                |
| ----- | -------- | --------------- | ---------- | --------------------------------------- |
| plan  | artifact | pending         | -          | -                                       |
| p01   | code     | pending         | -          | -                                       |
| final | code     | fixes_completed | 2026-03-11 | reviews/code-review-final-2026-03-11.md |

**Status values:** `pending` → `received` → `fixes_added` → `fixes_completed` → `passed`

---

## Implementation Complete

**Summary:**

- Phase 1: 7 tasks — Command group structure, collect command with GraphQL, triage command, verification, 3 review fix tasks

**Total: 7 tasks**

Review fix tasks pending execution.

---

## References

- Discovery: `discovery.md`
- Repo command: `packages/cli/src/commands/repo/index.ts`
- Collect command: `packages/cli/src/commands/repo/pr-comments/collect/`
- Triage command: `packages/cli/src/commands/repo/pr-comments/triage-collection/`

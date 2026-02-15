---
name: oat-new-project
description: Create a new OAT project directory under {PROJECTS_ROOT}, scaffold artifacts from templates, and set it as the active project.
argument-hint: "<project-name> [--force] [--from-idea <idea-name>]"
disable-model-invocation: true
user-invocable: true
allowed-tools: Read, Write, Bash(pnpm:*), Glob, Grep, AskUserQuestion
---

# New OAT Project

Create a new OAT project directory, scaffold standard artifacts from `.oat/templates/`, and set `.oat/active-project`. Optionally promote a summarized idea into a project.

## Progress Indicators (User-Facing)

- Print a phase banner once at start using horizontal separators, e.g.:

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   OAT ▸ NEW PROJECT
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Before multi-step work (validation, scaffolding, dashboard refresh), print 2-5 short step indicators.
- For long-running operations, print a brief "starting..." line and a matching "done" line (duration optional).

## Process

### Step 0: Resolve Projects Root

Resolve `{PROJECTS_ROOT}` (same order as other OAT skills):

```bash
PROJECTS_ROOT="${OAT_PROJECTS_ROOT:-$(cat .oat/projects-root 2>/dev/null || echo \".oat/projects/shared\")}"
PROJECTS_ROOT="${PROJECTS_ROOT%/}"
```

### Step 1: Get Project Name and Check for Idea Promotion

**If `$ARGUMENTS` contains `--from-idea <idea-name>`:**
- Set `PROMOTING_IDEA` to the idea name
- Use the idea name as the default project name (user can rename)
- Skip the promotion prompt below and go to Step 2

**Otherwise, check for summarized ideas:**

Scan for summarized ideas at both project and user level:
- Glob `.oat/ideas/*/discovery.md` and `~/.oat/ideas/*/discovery.md`
- Check frontmatter for `oat_idea_state: summarized`

**If summarized ideas exist**, ask the user:
- "Is this a **new project**, or would you like to **promote an existing idea** into a project?"

**If promoting:**
- Present the list of summarized ideas (show name + overview from summary if available)
- User picks one → set `PROMOTING_IDEA` to the idea name, resolve `IDEAS_ROOT` to whichever level the idea lives in
- Default project name to the idea name, but let the user rename if they want

**If new project (or no summarized ideas found):**
- Ask for `{project-name}` as usual (slug format: alphanumeric/dash/underscore only)

### Step 2: Scaffold Project (Deterministic)

Use the TS scaffolder (dogfood-first; intended to become CLI logic later):

```bash
pnpm tsx .oat/scripts/new-oat-project.ts "{project-name}"
```

Optional flags:
- `--force` (non-destructive; only fills missing files/dirs, does not overwrite)
- `--no-set-active`
- `--no-dashboard`

### Step 3: Seed from Idea (if promoting)

**Skip this step if not promoting an idea.**

Read the idea's artifacts:
- Primary: `{IDEAS_ROOT}/{PROMOTING_IDEA}/summary.md`
- Supplemental: `{IDEAS_ROOT}/{PROMOTING_IDEA}/discovery.md`

Seed the project's `discovery.md` (`{PROJECTS_ROOT}/{project-name}/discovery.md`):

1. **Add provenance frontmatter** — add to the existing frontmatter block:
   ```yaml
   oat_seeded_from_idea: {PROMOTING_IDEA}
   ```

2. **Seed the Initial Request section** — replace `{Copy of user's initial request}` with content synthesized from the idea:
   ```markdown
   ## Initial Request

   *Promoted from idea: {PROMOTING_IDEA}*

   {Content from idea summary.md — Overview and Key Points sections}

   ### Idea Context

   {Content from idea discovery.md — What's the Idea, Why Is It Interesting, What Would It Look Like sections (skip empty/placeholder sections)}

   ### Open Questions (from idea)

   {Carry over Open Questions from both summary.md and discovery.md}
   ```

3. **Update ideas backlog** — in `{IDEAS_ROOT}/backlog.md`:
   - Move the idea's entry from its current section to **Archived**
   - Format: `- **{idea-name}** — promoted to project `{project-name}` *(Created: YYYY-MM-DD, Archived: YYYY-MM-DD)*`

### Step 4: Confirm + Next Step

Confirm to the user:
- Project path created: `{PROJECTS_ROOT}/{project-name}`
- Active project pointer set: `.oat/active-project`
- Repo State Dashboard refreshed: `.oat/state.md` (if enabled)
- If promoted: "Seeded from idea: {PROMOTING_IDEA}" and "Ideas backlog updated"

Then ask: **"Would you like to start discovery now, or do it later?"**

- **If yes:** Read the **`oat-discovery`** skill (`.agents/skills/oat-discovery/SKILL.md`) and invoke it. Discovery will find the seeded content already in place.
- **If later:** Tell the user: "Run the `oat-discovery` skill when you're ready to begin."

## Success Criteria

- ✅ `{PROJECTS_ROOT}/{project-name}/` exists
- ✅ Standard artifacts exist in the project dir (copied from `.oat/templates/*.md`)
- ✅ `.oat/active-project` points at the project path
- ✅ `.oat/state.md` is refreshed (unless disabled)
- ✅ If promoting: `discovery.md` seeded from idea artifacts with provenance frontmatter
- ✅ If promoting: ideas backlog entry moved to Archived

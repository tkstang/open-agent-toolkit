# P01 Local Receive Constraints

## Source Files

- `.agents/skills/oat-project-review-receive/SKILL.md`
- `.agents/skills/oat-review-provide/SKILL.md`
- `.agents/skills/create-oat-skill/references/oat-skill-template.md`

## Mode Assertion Constraints

- Include explicit `OAT MODE: Review Receive` assertion.
- Purpose must scope to artifact parsing, finding classification, triage, and task-list generation.
- `BLOCKED Activities` must prohibit code changes and project lifecycle mutations in ad-hoc mode.
- `ALLOWED Activities` must permit reading review artifacts, severity classification, triage, and output generation.

## Progress Indicator Constraints

- Banner required: `OAT ▸ REVIEW RECEIVE`.
- Numbered step indicators required before multi-step work.
- Keep step text concise and action-focused.
- Minimum flow for ad-hoc local receive:
  - `[1/4] Locating review artifact...`
  - `[2/4] Parsing findings...`
  - `[3/4] Triaging findings...`
  - `[4/4] Generating task list...`

## Findings Parsing and Severity Constraints

- Normalize findings to 4 tiers: `critical`, `important`, `medium`, `minor`.
- Support compatibility with 3-tier artifacts by treating missing medium section as zero findings.
- Use stable IDs per severity bucket:
  - Critical: `C1`, `C2`, ...
  - Important: `I1`, `I2`, ...
  - Medium: `M1`, `M2`, ...
  - Minor: `m1`, `m2`, ...
- Keep per-finding data shape stable:
  - `id`, `severity`, `title`, `file`, `line`, `body`, `fix_guidance`, `source`, `source_ref`.

## Triage Constraints

- Present findings overview before any disposition prompt.
- Default disposition policy:
  - Critical: convert to task
  - Important: convert to task
  - Medium: convert to task by default; defer only with explicit rationale
  - Minor: defer by default unless user opts to convert
- Dispositions must be explicit: `convert`, `defer`, `dismiss`.

## Output Constraints

- Output must be standalone markdown tasks (no plan task IDs).
- Task format:
  - `- [ ] [severity] title (file:line) - fix guidance`
- Support inline output and optional file output path.

## Template and Frontmatter Constraints

- Required frontmatter fields:
  - `name`
  - `description`
  - `disable-model-invocation: true`
  - `user-invocable: true`
  - `allowed-tools`
- Required sections:
  - `Mode Assertion`
  - `Progress Indicators (User-Facing)`
  - `Process`
  - `Success Criteria`

## Success Criteria Checklist (Authoring Gate)

- Mode Assertion present and scoped correctly.
- Progress banner + numbered steps present.
- 4-tier severity parsing and stable IDs documented.
- Findings overview step before triage documented.
- Triage rules and disposition outcomes documented.
- Task-list output format documented.
- Success Criteria section includes parse + triage + output completion.

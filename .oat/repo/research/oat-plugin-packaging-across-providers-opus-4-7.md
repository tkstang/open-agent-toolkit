---
skill: deep-research
schema: technical
topic: "Plugin packaging for OAT across Claude Code, Codex, and Cursor"
model: opus-4-7
generated_at: 2026-04-17
depth: standard
---

# Plugin Packaging for OAT Across Claude Code, Codex, and Cursor

## Executive Summary

As of April 2026, all three target providers have shipped plugin systems with structurally similar shapes — `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json`, `.cursor-plugin/plugin.json` — each supporting skills, sub-agents, and MCP declarations. **But "plugin surface exists" is not the same as "users install that way."** In practice, the dominant multi-provider distribution pattern in April 2026 is **"Claude plugin + universal CLI with `--ide <provider>` flag"** — not three equal plugins. Claude Code plugins are ~6 months old and have a mature marketplace; Cursor plugins launched Feb 2026 and have minimal third-party adoption; Codex plugins are similarly new. Every multi-provider repo surveyed that supports Claude plus anything else does so via a CLI installer, not via three plugins.

**Revised recommendation: ship a Claude Code plugin as the first provider surface, keep the CLI as the universal installer for all providers (including Claude, for users who prefer CLI), and defer Cursor/Codex plugins until their marketplaces mature — likely 6–12 months out.** The design pattern, validated by `thedotmack/claude-mem`, `obra/superpowers`, and `sickn33/antigravity-awesome-skills`: `npx @open-agent-toolkit/cli install --ide <provider>` becomes the cross-provider on-ramp; the Claude plugin wraps the same CLI for Claude-native marketplace discovery. OAT's existing `oat init` + `oat tools install <pack>` already does 90% of what the CLI needs — a thin `install` wrapper and an `--ide` flag on the provider adapters finishes it.

The main costs are bounded: one plugin manifest generator (Claude first), a CLI publishing cleanup to make `npx @open-agent-toolkit/cli` work outside the monorepo (asset pre-bundling + `workspace:*` resolution), and an `--ide <provider>` install shortcut. The benefits — Claude marketplace reach, zero-clone install for all providers via one CLI, validation of OAT's canonical-asset thesis — are substantial and directly serve OAT's provider-agnostic mission. Cursor and Codex plugins can be added later as the data shows demand, ideally emitted from the same packager subcommand so the incremental cost stays low.

## Methodology

Four parallel research angles plus one codebase-grounding exploration:

- **Claude Code plugin docs** — `code.claude.com/docs/en/plugins`, `plugins-reference`, `plugin-marketplaces`; verified directly via WebFetch on `/en/plugins`.
- **Codex plugin docs** — `developers.openai.com/codex/plugins`, `/plugins/build`, `/skills`, `/mcp`, `/custom-prompts`, plus `openai/codex` and `openai/codex-plugin-cc` on GitHub.
- **Cursor plugin docs** — `cursor.com/docs/plugins`, `/docs/plugins/building`, `cursor/plugins` + `cursor/plugin-template` on GitHub; WebFetch on `cursor.com` was blocked by CDN (403), so cross-referenced via GitHub READMEs.
- **Multi-provider repo survey** — 6 repos analyzed: `obra/superpowers`, `anthropics/claude-plugins-official`, `VoltAgent/awesome-agent-skills`, `sickn33/antigravity-awesome-skills`, `alirezarezvani/claude-skills`, `wshobson/commands`.
- **OAT grounding** — very-thorough exploration of `/home/user/open-agent-toolkit`, including `.agents/`, `.oat/sync/`, `packages/cli/src/commands/{init,tools,sync}/`, provider adapters, and the release contract.

Limitations: Cursor and Codex documentation sites return 403 to WebFetch; all Cursor and Codex details below are cross-referenced from at least two sources (official GitHub repos, DeepWiki, forum announcements) but were not independently verified by direct doc fetch.

## Findings

### Packages & Libraries

The three plugin systems as they exist today:

**Claude Code plugins** (launched Oct 2025, mature)
- Manifest: `.claude-plugin/plugin.json` — only `name` is required; rich optional surface includes `version`, `description`, `author`, `skills`, `commands`, `agents`, `hooks`, `mcpServers`, `lspServers`, `monitors`, `bin`, `userConfig`, `dependencies`.
- Capabilities: skills, commands (legacy, markdown flat-files), agents (restricted — cannot ship hooks/MCP/permissionMode), hooks (richest event set: `SessionStart`, `PreToolUse`, `PostToolUse`, `FileChanged`, `Stop`, etc.), MCP servers, LSP servers, background monitors, output styles, and `bin/` directory whose contents are added to the Bash tool's `$PATH` automatically.
- Distribution: official marketplace (submit via `claude.ai/settings/plugins/submit`); anyone can host via `.claude-plugin/marketplace.json` in a git repo; sources include `github`, git URL, `npm`, local path, and `git-subdir` (sparse monorepo clone).
- Install: `/plugin marketplace add <source>` then `/plugin install <name>@<marketplace>`; copied to `~/.claude/plugins/cache/`; per-plugin persistent state at `${CLAUDE_PLUGIN_DATA}` = `~/.claude/plugins/data/<id>/`.
- Updates: version-gated via `plugin.json` `version` field; `claude plugin update`; background auto-updates at startup; no lockfile, pin via `ref`/`sha`/`version`.

**Codex plugins** (formal system, 2026)
- Manifest: `.codex-plugin/plugin.json` — `name`, `version`, `description`, `skills`, `mcpServers`, `apps`, `interface`.
- Capabilities: skills, MCP servers, apps, UI assets; no dedicated hooks system; custom prompts live at `~/.codex/prompts/` and are user-scoped (project-scoped prompts are an open GitHub issue).
- Distribution: plugin marketplaces from GitHub, git URLs, local dirs, or `marketplace.json` URLs; desktop app "Plugins" panel.
- Install: `/plugin marketplace add …` → `/plugin install … @ marketplace` → `/reload-plugins`; cache path `~/.codex/plugins/cache/$MARKETPLACE/$PLUGIN/$VERSION/`.
- Config: `~/.codex/config.toml` (user) vs `.codex/config.toml` (project); skills discovered under `.agents/skills` (walked), `.codex/skills`, `~/.codex/skills/`; `CODEX_HOME` env overrides `~/.codex`.

**Cursor plugins** (Cursor 2.5, Feb 17 2026)
- Manifest: `.cursor-plugin/plugin.json` — required `name` (kebab-case), `displayName`, `author`, `description`, `keywords`, `license`, `version`; optional per-capability paths `agents`, `skills`, `hooks`, `mcp`.
- Capabilities: skills (`SKILL.md` — same format as Claude/Codex), agents (markdown with `name`, `description`, `model`, `is_background`), rules (`.cursor/rules/*.mdc` — still present, distinct from skills), hooks (narrower event set; supports `${CURSOR_PLUGIN_ROOT}` expansion), MCP (top-level `mcp.json` merged into `.cursor/mcp.json` on install), commands (`.cursor/commands/*.md` — no frontmatter).
- Distribution: official marketplace at `cursor.com/marketplace`; team/enterprise private marketplaces; `.cursor-plugin/marketplace.json` registry format.
- Install: Marketplace UI, in-editor `/add-plugin <name>`, or git URL pointing at a `plugin.json`.

### Repository Analysis

Seven surveyed multi-provider repos with install-path detail as of April 2026:

| Repo | Claude plugin | Cursor plugin | Codex plugin | Non-Claude path | Stars |
|---|---|---|---|---|---|
| `thedotmack/claude-mem` | ✅ marketplace | ❌ | ❌ | `npx claude-mem install --ide <gemini-cli\|opencode>` | — |
| `obra/superpowers` | ✅ marketplace (primary) | ❌ | ❌ | Manual install docs per provider | 157k |
| `anthropics/claude-plugins-official` | ✅ marketplace | ❌ | ❌ | Claude-only | 17.2k |
| `alirezarezvani/claude-skills` | ✅ marketplace | ❌ | ❌ | `./convert.sh --tool all` format transformer | 11.5k |
| **`sickn33/antigravity-awesome-skills`** | ❌ | ❌ | ❌ | **Pure `npx` CLI with `--claude/--cursor/--gemini` flags** | 33.6k |
| `VoltAgent/awesome-agent-skills` | ❌ | ❌ | ❌ | Catalog/index only, no installer | 16.1k |
| `wshobson/commands` | ❌ | ❌ | ❌ | `git clone … ~/.claude` (Claude-only, stalled Oct 2025) | 2.3k |

**Critical finding: zero surveyed repos ship a Cursor or Codex plugin today.** Every repo that supports Claude plus another provider does so via CLI installer (`claude-mem`, `sickn33`), format converter (`alirezarezvani`), or manual per-provider install docs (`superpowers`). Cursor plugins have existed for ~2 months and Codex plugins are similarly new — the ecosystem has not yet migrated.

This collapses the archetypes into two actually-used patterns in 2026:

1. **Claude plugin + universal CLI.** The plugin is the Claude-specific on-ramp; the CLI (`npx <tool> install --ide <provider>`) is the multi-provider on-ramp. `claude-mem` is the clearest exemplar; `superpowers` is a coarser variant with manual docs instead of `--ide` flags.
2. **Pure npx CLI, no plugins at all.** `sickn33/antigravity-awesome-skills` (33.6k stars) proves the CLI-only model is viable without any plugin surface.

Canonical `SKILL.md` with `name` + `description` frontmatter remains a de facto cross-provider standard, with no repo forking content per provider. This validates OAT's existing `.agents/skills/` abstraction and confirms that provider-specific differentiation belongs in *install location* and *optional transform*, not in skill bodies.

**Implication for OAT:** the three-plugin parity story the plugin surfaces suggest on paper does not yet exist in practice. A Claude plugin is the only provider-native plugin worth shipping today; the CLI is the right home for Cursor/Codex/Gemini/OpenCode support, with plugin manifests for those providers as a later optional emit-target once adoption signals warrant it.

### Code Examples

**Claude Code plugin manifest (verbatim from docs):**
```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": { "name": "Your Name" }
}
```

**Claude Code MCP in a plugin** (shows `npx` and `${CLAUDE_PLUGIN_ROOT}` patterns):
```json
{
  "mcpServers": {
    "plugin-api-client": {
      "command": "npx",
      "args": ["@company/mcp-server", "--plugin-mode"],
      "cwd": "${CLAUDE_PLUGIN_ROOT}"
    }
  }
}
```

**Codex plugin manifest:**
```json
{
  "name": "my-first-plugin",
  "version": "1.0.0",
  "description": "Reusable greeting workflow",
  "skills": "./skills/"
}
```

**Cursor plugin manifest (verbatim from `cursor/plugins`):**
```json
{
  "name": "continual-learning",
  "displayName": "Continual Learning",
  "version": "1.0.0",
  "description": "…",
  "author": {"name": "Cursor", "email": "plugins@cursor.com"},
  "license": "MIT",
  "category": "developer-tools",
  "agents": "./agents/",
  "skills": "./skills/",
  "hooks": "./hooks/hooks.json"
}
```

**OAT canonical skill frontmatter** (already matches the cross-provider standard):
```yaml
---
name: deep-research
version: 1.2.0
description: Comprehensive research orchestrator…
disable-model-invocation: false
user-invocable: true
---
```

### Integration Notes

OAT's current architecture maps cleanly onto plugins. The critical observations from the codebase grounding:

- **`.agents/skills/*/SKILL.md`** → drops in 1:1 to all three plugin `skills/` directories.
- **`.agents/agents/*.md`** → drops in 1:1 to Claude/Cursor `agents/` (3 agents today: `oat-codebase-mapper`, `oat-reviewer`, `skeptical-evaluator`).
- **Provider sync** — `packages/cli/src/providers/{claude,cursor,codex}/adapter.ts` already generates per-provider views. A plugin-packager is a fourth "provider adapter" that emits `.claude-plugin/plugin.json` + layout instead of symlinks.
- **`oat tools install`** — the seven existing packs (`core`, `workflows`, `ideas`, `docs`, `utility`, `project-management`, `research`) are the obvious units that plugins can install on demand after CLI bootstrap.
- **What stays in the CLI only** — `.oat/projects/`, `.oat/templates/`, `.oat/scripts/`, project workflows, drift detection, docs-tooling init. These are repo-local state machines; they do not belong inside a plugin.

Proposed division of responsibility (revised after the multi-provider survey):

1. **CLI (universal installer, existing + small additions)** — continues to own `init`, `sync`, `tools install/update`, `project *`, `docs`, `doctor`. Adds an `oat install --ide <claude|cursor|codex|gemini-cli|opencode>` shortcut that wraps `init` + `sync` + optional pack selection for a named provider. This is the multi-provider on-ramp.
2. **Claude Code plugin (first and only plugin, for now)** — ships: `.claude-plugin/plugin.json`, starter `skills/` (the `core` pack), `agents/` (the three OAT agents), a `SessionStart` hook that `npm install`s `@open-agent-toolkit/cli` into `${CLAUDE_PLUGIN_DATA}` and runs `oat init --scope project` on first session, and slash commands `/oat:sync`, `/oat:project-new`, `/oat:tools-install <pack>` that front common CLI ops.
3. **Cursor/Codex plugins — deferred.** Add when (a) their plugin marketplaces show third-party adoption, or (b) a user explicitly requests them. Emit them from the same `oat plugin emit --target <provider>` packager, so the incremental engineering cost is low when the time comes.

Install flows the user sees:
```bash
# Universal (any provider)
npx @open-agent-toolkit/cli install --ide cursor
npx @open-agent-toolkit/cli install --ide codex
npx @open-agent-toolkit/cli install --ide claude   # also works, for CLI-preferring users

# Claude-native marketplace path
/plugin marketplace add voxmedia/open-agent-toolkit-marketplace
/plugin install oat@open-agent-toolkit-marketplace
# SessionStart hook installs @open-agent-toolkit/cli into ${CLAUDE_PLUGIN_DATA},
# runs `oat init --scope project`, offers to install additional packs.
/oat:tools-install workflows
```

### Technical Tradeoffs

**Refactor scope (bounded, sequenced by priority):**

1. **CLI publishing cleanup (must-fix before anything else):**
   - `packages/cli/src/fs/assets.ts` hardcodes `../../../assets` relative to dist — fine in the monorepo, fails under npm global install unless assets are pre-bundled into the published package.
   - `packages/cli/package.json` uses `workspace:*` for `@open-agent-toolkit/control-plane` — must be resolved to a real version at publish time (standard `pnpm publish` handles this, but confirm it's in `pnpm release:validate`).
   - `packages/cli/scripts/bundle-assets.sh` assumes monorepo layout and must run before publish — document this in the release validate step.
   - `.oat/config.json` hardcodes `s3://vox-media-open-agent-toolkit/` archive URI — parameterize or strip from defaults before bundling into plugin/CLI starter state.
2. **`oat install --ide <provider>` shortcut** — wraps existing `init` + `sync` + optional pack prompts behind a single command, matching the `claude-mem`/`sickn33` pattern. Each `--ide` value routes to the existing provider adapter.
3. **Claude Code plugin packager** — `oat plugin emit --target claude` reads canonical `.agents/` + `.oat/sync/config.json` and writes a valid plugin directory: `.claude-plugin/plugin.json`, starter `skills/`, `agents/`, `hooks/hooks.json` with the `SessionStart` bootstrap, `commands/` (or `skills/`) for the `/oat:*` slash commands. Mostly glue over existing adapter code.
4. **Claude marketplace submission** — publish marketplace manifest, submit to `claude.ai/settings/plugins/submit`.
5. **Cursor/Codex packagers (deferred)** — when demand is demonstrated, add `--target cursor` and `--target codex` emitters. The adapter-per-provider architecture makes each incremental target small.
6. **Release lockstep impact** — existing five-package rule already covers the CLI. The Claude plugin bundle would join the lockstep by convention when it lands.

**Costs:**

- **Maintenance surface** — one plugin manifest format (Claude) to start; Cursor/Codex added later when needed. Mitigated by the packager-as-adapter pattern: each provider gets a small codec, updated independently.
- **Documentation split** — users will ask "do I install the plugin or the CLI?" Answer, mirroring `claude-mem`: the CLI is primary and works everywhere; the Claude plugin is a convenience wrapper for Claude marketplace users.
- **Marketplace review latency** — Anthropic's official marketplace is a submission queue. Own-hosted marketplaces work in the meantime but lose the discovery boost.

**Benefits:**

- **Distribution reach via Claude marketplace** — actively promoted by Anthropic; `superpowers` (157k stars) and `claude-plugins-official` (17.2k) prove the demand.
- **Zero-clone install via CLI `--ide` flag** — users of any provider get skills in seconds via `npx @open-agent-toolkit/cli install --ide <provider>`. Current OAT adoption requires `pnpm install` in a monorepo or global CLI install, which is a higher bar.
- **Version pinning and auto-update (Claude path)** — Claude Code auto-updates plugins at startup; existing `oat tools update` remains for non-plugin paths and for manual updates.
- **Validation of the canonical-asset thesis** — if one source produces both a Claude plugin bundle and N provider-specific CLI install targets cleanly, that's strong proof OAT's abstraction works.
- **"Install-more-packs" niche is underserved** — only `sickn33` does it well; OAT's `oat tools install <pack>` + seven-pack taxonomy is already a stronger implementation, and the plugin + CLI on-ramp makes it discoverable.

**Performance, bundle size, lock-in:** negligible. Plugins are inert until enabled; OAT is already portable across providers; marketplace submission is reversible (delist any time).

## Sources & References

**Claude Code**
- [Create plugins](https://code.claude.com/docs/en/plugins) — verified directly
- [Plugins reference](https://code.claude.com/docs/en/plugins-reference)
- [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Claude Code plugins announcement (Anthropic)](https://www.anthropic.com/news/claude-code-plugins)

**Codex**
- [Agent Skills — Codex](https://developers.openai.com/codex/skills)
- [Plugins — Codex](https://developers.openai.com/codex/plugins)
- [Build plugins — Codex](https://developers.openai.com/codex/plugins/build)
- [Custom Prompts — Codex](https://developers.openai.com/codex/custom-prompts)
- [MCP — Codex](https://developers.openai.com/codex/mcp)
- [AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md)
- [Configuration reference](https://developers.openai.com/codex/config-reference)
- [Changelog](https://developers.openai.com/codex/changelog)
- [openai/codex](https://github.com/openai/codex), [openai/skills](https://github.com/openai/skills), [openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc)

**Cursor**
- [Plugins — Cursor](https://cursor.com/docs/plugins)
- [Plugins reference — Cursor](https://cursor.com/docs/plugins/building)
- [Rules — Cursor](https://cursor.com/docs/context/rules)
- [MCP — Cursor](https://cursor.com/docs/context/mcp)
- [Commands — Cursor](https://cursor.com/docs/context/commands)
- [Extend Cursor with plugins](https://cursor.com/blog/marketplace)
- [Cursor 2.5 release forum](https://forum.cursor.com/t/cursor-2-5-plugins/152124)
- [cursor/plugins](https://github.com/cursor/plugins) — verified directly
- [cursor/plugin-template](https://github.com/cursor/plugin-template) — verified directly

**Multi-provider repo survey**
- [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) — canonical "Claude plugin + `npx … --ide` CLI" pattern
- [obra/superpowers](https://github.com/obra/superpowers), [obra/superpowers-marketplace](https://github.com/obra/superpowers-marketplace)
- [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official)
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)
- [sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)
- [alirezarezvani/claude-skills](https://github.com/alirezarezvani/claude-skills)
- [wshobson/commands](https://github.com/wshobson/commands)
- [Superpowers blog post](https://blog.fsck.com/2025/10/09/superpowers/)

**OAT codebase references**
- `packages/cli/src/commands/init/index.ts` — `oat init` orchestration
- `packages/cli/src/commands/tools/install/index.ts`, `packages/cli/src/commands/init/tools/shared/skill-manifest.ts` — pack definitions
- `packages/cli/src/commands/tools/update/update-tools.ts` — version-aware pack updater
- `packages/cli/src/providers/{claude,cursor,codex}/adapter.ts` — per-provider sync adapters
- `packages/cli/src/fs/assets.ts` — asset resolution (plugin-hostile hardcode flagged)
- `.oat/sync/config.json`, `.oat/sync/manifest.json` — sync state
- `packages/cli/package.json` — `@open-agent-toolkit/cli` v0.0.36, `bin: { oat: "dist/index.js" }`, `workspace:*` internal dep

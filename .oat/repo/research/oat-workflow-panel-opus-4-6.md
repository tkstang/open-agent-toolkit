---
skill: deep-research
schema: architectural
topic: 'OAT Workflow Panel — TUI interface with interactive workflow triggers'
model: opus-4-6
generated_at: 2026-04-03
depth: standard
---

# OAT Workflow Panel: Feasibility Research

## Executive Summary

Building a TUI panel that displays OAT project state and provides interactive controls to trigger workflow steps is **highly feasible**. The recommended approach is a **TypeScript package using Ink (React for CLI)** running as a standalone process in a Zellij or tmux pane, integrated into the existing OAT monorepo as `packages/panel/`.

**tmux is the pragmatic default** for this use case — it has battle-tested scriptability (`send-keys`, `split-window`, `capture-pane`), Claude Code's Agent Teams uses it exclusively, and every existing agent orchestrator in this space (claude-squad, agtx, ntm, dmux, opensessions) builds on tmux. Zellij has a more modern WASM plugin system and pipe-based IPC that are architecturally appealing, but its ecosystem is significantly smaller and Claude Code has no official Zellij support yet. The panel should target **tmux-first with Zellij as a supported alternative**, since the Ink-based TUI runs identically in either multiplexer's panes, and pane-spawning commands can be abstracted behind a multiplexer adapter.

A landscape analysis of seven existing tools — [tmux-agent-status](https://github.com/samleeney/tmux-agent-status), [claude-squad](https://github.com/smtg-ai/claude-squad), [agtx](https://github.com/fynnfluegge/agtx), [cmux](https://github.com/craigsc/cmux), [opensessions](https://github.com/ataraxy-labs/opensessions), [ntm](https://github.com/Dicklesworthstone/ntm), and [dmux](https://github.com/standardagents/dmux) — reveals converging patterns: filesystem-as-message-bus for state, git worktrees for isolation, and tmux for session management. **agtx stands out** as the closest prior art to what OAT needs: a Rust-based kanban TUI with per-phase agent assignment, plugin-driven workflows, and an MCP server for orchestrator-to-board communication. Its phase model (Backlog/Planning/Running/Review/Done) maps naturally to OAT's lifecycle. OAT already has a richer state model (`state.md` frontmatter with phase tracking, HiLL checkpoints, blockers, and task progress) that maps naturally to a panel UI. The main gap is the absence of a real-time notification mechanism, which can be bridged with Claude Code hooks and file watching.

**Ghostty** (the user's terminal) has native splits and tabs but no plugin system or general-purpose IPC, so it cannot replace a multiplexer for programmatic pane management. The recommended stack is **Ghostty (terminal) + tmux or Zellij (multiplexer) + OAT panel (TUI in a pane)**.

## Methodology

Twelve research angles were explored in parallel across two waves:

**Wave 1 (6 angles):**
1. **Reference implementation** — Analyzed tmux-agent-status architecture via GitHub
2. **OAT project state model** — Explored `.oat/` structure, `state.md` schema, workflow skills, and CLI commands in the local codebase
3. **Zellij vs tmux** — Researched Zellij plugin API, pipe system, layout format, and community plugins
4. **TUI frameworks** — Compared Ink, ratatui, bubbletea, blessed, Textual, and crossterm
5. **IPC and workflow triggers** — Researched file-based IPC, Unix sockets, Zellij pipes, Claude Code hooks, and pane spawning
6. **Architectural feasibility** — Explored the OAT monorepo structure (Turborepo, pnpm workspaces, build system)

**Wave 2 (6 angles — landscape analysis):**
7. **claude-squad** — Go-based multi-agent tmux orchestrator with unified dashboard
8. **agtx** — Rust kanban TUI with per-phase agent assignment and MCP-based orchestration
9. **cmux** — Bash git-worktree isolator for parallel Claude sessions
10. **opensessions** — TypeScript tmux sidebar with agent status monitoring
11. **ntm** — Go control plane with pipelines, safety policies, and REST/WebSocket API
12. **dmux** — TypeScript worktree-based multi-agent manager with file browser
13. **Ghostty terminal** — Feature assessment for native integration potential

Sources included GitHub repositories, Zellij/tmux documentation, framework docs, and the local OAT codebase.

## Findings

### Decision Framework

**Decision drivers:**
- Integrate with OAT's existing TypeScript ESM monorepo without introducing heavy cross-language build complexity
- Display real-time OAT project state (phase, task progress, blockers, HiLL checkpoints)
- Provide interactive controls to trigger workflow steps (implement, review, next phase)
- Support spawning new terminal panes for agent sessions
- Work with tmux (primary) and Zellij (supported alternative) via a multiplexer adapter

**Constraints:**
- Must not require users to learn a new programming language to contribute
- Must leverage OAT's existing state model (`state.md` frontmatter)
- Should be installable as part of the OAT CLI (`oat panel`)

**Quality attributes:**
- Maintainability (single-language preference)
- User experience (interactive, real-time updates)
- Integration depth (with both OAT state and terminal multiplexer)
- Installation simplicity

### Reference: tmux-agent-status Architecture

The [tmux-agent-status](https://github.com/samleeney/tmux-agent-status) project provides a validated architectural pattern:

- **Pure Bash** — TPM plugin with no compiled dependencies
- **Three-layer architecture**: (1) Agent hooks write status files to `~/.cache/tmux-agent-status/`, (2) a sidebar-collector daemon aggregates state, (3) display layers (sidebar pane, status line, fzf switcher) read aggregated state
- **Filesystem as message bus** — decouples agents from display; any process writing the right file format becomes trackable
- **Hook-driven input** — Claude Code hooks (`UserPromptSubmit`, `PreToolUse`, `Stop`, `Notification`) fire shell scripts that write status files
- **Status values**: `working`, `done`, `wait`, `parked` with precedence rules
- **Features**: per-pane and per-session status, fzf popup switcher, audio completion notifications, multi-agent deploy scripts

**Key takeaway**: The filesystem-as-IPC pattern is proven and simple. OAT can adopt this same pattern but with richer state (phases, tasks, checkpoints) and a more interactive panel.

### OAT Project State Model

OAT projects live in `.oat/projects/<scope>/<project>/` with a well-defined state model:

**Phase lifecycle** (stored in `state.md` frontmatter `oat_phase`):
```
discovery → spec → design → plan → implement
```

Quick mode skips spec/design: `discovery → plan → implement`

**Key state fields for panel display:**

| Field | Type | Purpose |
|-------|------|---------|
| `oat_phase` | string | Current phase (discovery\|spec\|design\|plan\|implement) |
| `oat_phase_status` | string | Phase state (in_progress\|complete\|pr_open) |
| `oat_workflow_mode` | string | Execution path (spec-driven\|quick\|import) |
| `oat_execution_mode` | string | Implementation variant (single-thread\|subagent-driven) |
| `oat_current_task` | string | Currently executing task ID (e.g., "pNN-tNN") |
| `oat_blockers` | array | Active blocker descriptions |
| `oat_hill_checkpoints` | array | Phases requiring human-in-the-loop approval |
| `oat_hill_completed` | array | Completed checkpoint approvals |
| `oat_lifecycle` | string | Project status (active\|paused) |

**Transition triggers** come from the `oat-project-next` skill, which reads state and routes to the appropriate phase skill. The panel would need to detect which transitions are available and surface them as actionable buttons.

**No built-in file watching** — OAT state transitions are explicit (skills read/write `state.md` directly) and pull-based (user runs `oat-project-next`). A panel must poll `state.md` or use external notifications (Claude Code hooks).

### Landscape Analysis: Existing Agent Orchestrators

Seven existing tools were analyzed. All are tmux-based. Key patterns and differentiation:

| Tool | Language | Multiplexer | Primary Pattern | Key Differentiator |
|------|----------|-------------|-----------------|-------------------|
| [tmux-agent-status](https://github.com/samleeney/tmux-agent-status) | Bash | tmux | Status monitoring | Filesystem-as-message-bus, hook-driven, sidebar + status bar |
| [claude-squad](https://github.com/smtg-ai/claude-squad) | Go | tmux | Multi-agent dashboard | Unified TUI with preview/diff tabs, git worktree isolation, daemon mode |
| [agtx](https://github.com/fynnfluegge/agtx) | Rust | tmux | Kanban orchestration | Per-phase agent assignment, MCP server, plugin system (TOML), SQLite state |
| [cmux](https://github.com/craigsc/cmux) | Bash | None (worktrees only) | Workspace isolation | Simplest tool — just worktree + branch + Claude launch |
| [opensessions](https://github.com/ataraxy-labs/opensessions) | TypeScript | tmux (Zellij experimental) | Sidebar companion | HTTP-driven metadata push, Solid UI, multi-agent-type watching |
| [ntm](https://github.com/Dicklesworthstone/ntm) | Go | tmux | Control plane | Pipelines with dependencies, safety policies, approval workflows, REST/WebSocket API |
| [dmux](https://github.com/standardagents/dmux) | TypeScript | tmux | Worktree manager | 11+ agent support, built-in file browser, lifecycle hooks |

**Converging patterns across the ecosystem:**
- **Git worktrees** for agent isolation (claude-squad, cmux, agtx, dmux)
- **tmux as the universal multiplexer** — every tool uses it; none have production Zellij support
- **Filesystem-based state** — status files, SQLite, or markdown frontmatter
- **Hook-driven notifications** — Claude Code hooks for status transitions
- **TUI dashboard** — most provide a unified view of all agent sessions

**agtx is the strongest prior art for OAT integration:**
- Its 5-column kanban (Backlog → Planning → Running → Review → Done) maps directly to OAT's 5-phase lifecycle (discovery → spec → design → plan → implement)
- Its TOML plugin system defines per-phase commands, prompts, and artifact gates — similar to OAT skills
- Its MCP server (`agtx serve`) exposes board state as JSON-RPC tools, enabling an orchestrator agent to drive the workflow
- Per-phase agent assignment (e.g., Gemini for research, Claude for implementation) aligns with OAT's execution modes
- Cyclic workflows (Review → Planning with phase counter) support OAT's review-receive pattern

**Key insight**: Rather than building from scratch, OAT could integrate with or draw heavily from agtx's architecture — particularly its kanban model, MCP-based orchestration, and plugin system — while adding OAT-specific state management (frontmatter, HiLL checkpoints, skill routing).

### Ghostty Terminal Assessment

Ghostty is the user's terminal emulator. Key findings for integration potential:

- **Built-in multiplexer**: Native splits and tabs with session restoration, but **no scriptable API** for programmatic pane management. The developers have explicitly declined arbitrary command execution from keybindings.
- **No plugin system**: No WASM, no extensions, no custom widgets.
- **Limited IPC**: Platform-native only (D-Bus on Linux, AppleScript on macOS). No general-purpose CLI for controlling splits/tabs programmatically. `ghostty +new-window` exists but is narrow.
- **Good terminal host**: GPU-accelerated, Kitty graphics protocol, shell integration — works well *hosting* tmux/Zellij sessions but cannot *replace* them for automation.

**Verdict**: Ghostty is a great terminal to run OAT inside, but the panel must rely on tmux or Zellij for programmatic pane management. Recommended stack: **Ghostty (terminal) + tmux/Zellij (multiplexer) + OAT panel (Ink TUI in a pane)**.

### Options Analyzed

#### Option A: TypeScript Ink Package in Monorepo

- **Description**: New package at `packages/panel/` using [Ink](https://github.com/vadimdemedes/ink) (React for CLI). Runs as a standalone process in a Zellij/tmux pane via `oat panel` CLI subcommand. Watches `state.md` for changes, spawns panes via `zellij run` / `tmux split-window`.
- **Tradeoffs**:
  - **Pros**: Native TypeScript/ESM fit; zero additional toolchain; shared imports with CLI (config, manifest modules); React component model for UI; proven in production (Claude Code, Gemini CLI, Wrangler all use Ink); Turborepo auto-detects new package
  - **Cons**: No native Zellij plugin integration (runs in a pane, not as a plugin); Ink's widget ecosystem is narrower than ratatui's; cannot be compiled to WASM
- **Constraints it satisfies**: All — single language, monorepo integration, interactive UI, real-time updates via React state
- **Constraints it violates**: None
- **Fit assessment**: Excellent. Lowest integration complexity, fastest iteration, best maintainability
- **Precedent**: Ink is used by Claude Code's own TUI, Gemini CLI, GitHub Copilot CLI, Cloudflare Wrangler

**Conceptual panel UI (Ink/React):**
```tsx
function WorkflowPanel({ project }: { project: OatProject }) {
  const [state, setState] = useState(readState(project));
  
  // Watch state.md for changes
  useEffect(() => {
    const watcher = fs.watch(project.statePath, () => {
      setState(readState(project));
    });
    return () => watcher.close();
  }, [project]);

  return (
    <Box flexDirection="column">
      <Text bold>📋 {project.name}</Text>
      <PhaseProgress phases={state.phases} current={state.oat_phase} />
      <TaskList tasks={state.tasks} current={state.oat_current_task} />
      <BlockerList blockers={state.oat_blockers} />
      <ActionButtons 
        nextAction={getNextAction(state)}
        onTrigger={(action) => spawnPane(action)}
      />
    </Box>
  );
}
```

#### Option B: Rust Zellij WASM Plugin

- **Description**: Native Zellij plugin written in Rust using `zellij-tile` crate. Renders directly in a Zellij pane via the plugin API. Uses Zellij's pipe system for bidirectional communication.
- **Tradeoffs**:
  - **Pros**: Deepest Zellij integration; can spawn panes via `open_terminal()` API; receives pipe messages natively; WASM sandboxing; can use `HighlightClicked` for interactive regions
  - **Cons**: Requires Rust toolchain in CI/CD; cannot share code with TypeScript CLI; duplicates state parsing logic; Zellij-only (no tmux fallback); steeper learning curve; `wasmi` interpreter is slower than native
- **Constraints it satisfies**: Integration depth, interactive UI
- **Constraints it violates**: Single-language preference, maintainability, multiplexer portability
- **Fit assessment**: High integration quality but high cost. Justified only if Zellij-native behavior is a hard requirement
- **Precedent**: zjstatus (community status bar plugin), zellij-forgot (command reference plugin)

**Zellij plugin API example:**
```rust
impl ZellijPlugin for OatPanel {
    fn load(&mut self, config: BTreeMap<String, String>) {
        subscribe(&[EventType::Timer, EventType::Key, EventType::Mouse]);
        set_timeout(1.0); // poll state every second
    }

    fn update(&mut self, event: Event) -> bool {
        match event {
            Event::Timer(_) => { self.refresh_state(); true }
            Event::Key(Key::Char('i')) => {
                open_terminal_floating(
                    &PathBuf::from("."),
                    None, // default shell
                );
                false
            }
            _ => false
        }
    }

    fn render(&mut self, rows: usize, cols: usize) {
        // Write ANSI-styled text to stdout
        println!("Phase: {} [{}]", self.phase, self.status);
    }
}
```

#### Option C: Hybrid — TypeScript CLI + Thin Zellij Plugin

- **Description**: Core logic in TypeScript (Path A), plus a thin Rust Zellij plugin that acts as a status bar indicator. The plugin communicates with the TypeScript process via Zellij pipes or Unix socket.
- **Tradeoffs**:
  - **Pros**: Best of both worlds — rich Ink UI + native Zellij status bar; TypeScript handles heavy lifting
  - **Cons**: Two integration points to maintain; added build complexity; marginal UX improvement over Path A alone
- **Constraints it satisfies**: Most, with enhanced Zellij integration
- **Constraints it violates**: Adds Rust build dependency
- **Fit assessment**: Medium. Over-engineered for initial release; viable as a Phase 2 enhancement
- **Precedent**: No direct precedent for this hybrid pattern

### Tradeoff Matrix

| Dimension | A: Ink (TypeScript) | B: Zellij WASM (Rust) | C: Hybrid |
|---|---|---|---|
| **Monorepo fit** | ★★★★★ Native | ★★☆☆☆ Separate toolchain | ★★★☆☆ Mixed |
| **Development speed** | ★★★★★ 2-3 weeks | ★★☆☆☆ 4-6 weeks | ★★★☆☆ 3-4 weeks |
| **Zellij integration** | ★★★☆☆ Via CLI commands | ★★★★★ Native plugin API | ★★★★☆ Plugin + CLI |
| **tmux support** | ★★★★☆ Via CLI commands | ☆☆☆☆☆ None | ★★★★☆ Via TypeScript layer |
| **Interactive UI** | ★★★★☆ Ink components | ★★★☆☆ Custom ANSI rendering | ★★★★☆ Ink + plugin |
| **Maintainability** | ★★★★★ Single language | ★★☆☆☆ Rust + TS | ★★★☆☆ Two languages |
| **Real-time updates** | ★★★★☆ File watch + hooks | ★★★★★ Pipes + timers | ★★★★★ Both channels |
| **Code sharing with CLI** | ★★★★★ Direct imports | ☆☆☆☆☆ None | ★★★★☆ TypeScript layer |

### Zellij vs tmux Comparison

| Capability | tmux | Zellij |
|---|---|---|
| **Plugin system** | None (shell scripts + hooks) | Native WASM plugins via `zellij-tile` |
| **Layout definition** | Custom format, limited | KDL files with plugin panes, floating panes |
| **Pane spawning** | `split-window`, `new-window` | `zellij run`, `open_terminal()` API |
| **IPC** | `send-keys`, environment vars | Pipe system (CLI-to-plugin, plugin-to-plugin) |
| **Interactive UI** | Status bar only (text) | Full pane rendering with mouse/key events |
| **Plugin isolation** | None | WASM sandboxing |
| **Session management** | Mature, ubiquitous | Session-manager plugin, resurrection |
| **Claude Code support** | Official (Agent Teams) | No official support (community request #31901) |
| **Ecosystem for agents** | 7/7 tools use it | 1/7 experimental support (opensessions) |
| **Scriptability** | Battle-tested, decades of tooling | Good CLI, less proven for automation |
| **UX/Discoverability** | Steep learning curve | Built-in keybinding hints per mode |

**Verdict**: **tmux is the pragmatic choice today.** Every agent orchestrator in the ecosystem builds on tmux. Claude Code's Agent Teams requires it. tmux's scriptable CLI is exactly what programmatic agent orchestration needs. However, Zellij's architecture (WASM plugins, pipes, KDL layouts) is more *modern* and would provide deeper integration *if* the ecosystem catches up. Since the OAT panel runs as a standalone Ink TUI process, it works identically in either multiplexer's panes — the only multiplexer-specific code is pane spawning, which can be abstracted behind a simple adapter:

```typescript
interface MuxAdapter {
  splitPane(command: string, opts?: { name?: string; cwd?: string; floating?: boolean }): void;
  listPanes(): PaneInfo[];
}

// tmux: tmux split-window -h -t $session "command"
// zellij: zellij run --name "name" -- command
```

**Recommendation**: Target tmux first (largest user base, proven patterns), support Zellij via adapter (user is actively setting it up), design the abstraction layer from day one so both are first-class.

### IPC Architecture

The recommended communication architecture layers multiple mechanisms:

| Layer | Mechanism | Purpose |
|-------|-----------|---------|
| **State persistence** | `state.md` frontmatter | Source of truth, survives crashes |
| **State observation** | `fs.watch()` on `state.md` | Panel detects changes |
| **Agent → Panel notifications** | Claude Code `Stop`/`PostToolUse` hooks | Agent signals completion |
| **Panel → Multiplexer** | `zellij run` / `tmux split-window` | Spawn new agent panes |
| **Panel → OAT** | Direct CLI invocation (`oat project ...`) | Trigger state transitions |

**Workflow example — user clicks "Implement":**
1. Panel reads `state.md`, determines `implement` is the next valid phase
2. User selects "Implement" button in the panel
3. Panel runs: `zellij run --name "implement" --cwd <project-dir> -- claude --prompt "Run oat-project-implement for <project>"`
4. Claude Code's `Stop` hook fires: `oat panel notify --event=agent-stopped`
5. Panel's `fs.watch()` detects `state.md` change, re-reads and updates UI

**Claude Code hook configuration** (`.claude/settings.json`):
```json
{
  "hooks": {
    "Stop": [{
      "matcher": "",
      "command": "oat panel notify --event=agent-stopped --session=$SESSION_ID"
    }]
  }
}
```

### TUI Framework Assessment

| Framework | Language | Monorepo Fit | Widget Richness | WASM/Zellij | Maintenance |
|---|---|---|---|---|---|
| **Ink** | TypeScript | ★★★★★ | ★★★★☆ | No | Very active |
| **ratatui** | Rust | ★★☆☆☆ | ★★★★★ | Not directly* | Very active |
| **bubbletea** | Go | ★★☆☆☆ | ★★★★☆ | No | Very active |
| **blessed** | Node.js | ★★★☆☆ | ★★★★☆ | No | Unmaintained |
| **Textual** | Python | ★☆☆☆☆ | ★★★★★ | No | Active |

*ratatui cannot be used inside Zellij WASM plugins — Zellij plugins use their own rendering API (`zellij-tile`), not a terminal backend. ratatui works only as a standalone process in a pane.

**Ink is the clear winner** for OAT: native TypeScript, React component model, production-proven, drops into the monorepo with zero friction.

### Risk Considerations

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| Ink widget gaps (no built-in progress bar, tree view) | Low | Medium | Use `ink-progress-bar`, `ink-select-input` community packages; custom components are straightforward in React |
| `fs.watch()` reliability across OS | Low | Low | Use `chokidar` for robust cross-platform file watching |
| Zellij not installed on user's system | Medium | Medium | Graceful degradation — panel works standalone, pane spawning requires Zellij/tmux |
| State file race conditions (concurrent agent writes) | Low | Low | OAT state writes are serialized through CLI commands; panel is read-only |
| Zellij API breaking changes | Low | Low | Panel communicates via `zellij` CLI (stable), not plugin API |

### Recommendation

- **Recommended option**: **Option A — TypeScript Ink Package**
- **Rationale**: Best monorepo fit, fastest development, single-language maintenance, proven framework (Ink), and sufficient integration depth via Zellij CLI commands. The marginal benefit of native Zellij plugin integration (Option B) does not justify the Rust toolchain overhead and code duplication.
- **Conditions**: Ink must remain maintained (high confidence — used by Claude Code, Gemini CLI). tmux CLI must remain stable for pane spawning (high confidence — decades of stability).
- **Fallback**: If deeper Zellij integration becomes necessary, pursue Option C (hybrid) as a Phase 2 enhancement — add a thin Rust status-bar plugin while keeping the core logic in TypeScript.
- **Next steps**:
  1. Scaffold `packages/panel/` with Ink, React, and TypeScript
  2. Implement `state.md` frontmatter parser and file watcher (chokidar)
  3. Build phase progress (kanban-style, inspired by agtx), task list, and action button components
  4. Implement multiplexer adapter abstraction (tmux primary, Zellij secondary)
  5. Add `oat panel` CLI subcommand
  6. Implement pane spawning for workflow triggers (`tmux split-window` / `zellij run`)
  7. Configure Claude Code hooks for agent-to-panel notifications
  8. Create default layout files: `.tmux.conf` snippet and `layouts/oat-panel.kdl` for Zellij
  9. Explore agtx's MCP server pattern for potential orchestrator-to-panel communication

## Sources & References

### Agent Orchestrator Landscape
1. [tmux-agent-status](https://github.com/samleeney/tmux-agent-status) — Bash tmux plugin; filesystem-as-message-bus pattern for agent status
2. [claude-squad](https://github.com/smtg-ai/claude-squad) — Go multi-agent dashboard with preview/diff tabs and git worktree isolation
3. [agtx](https://github.com/fynnfluegge/agtx) — Rust kanban TUI with per-phase agent assignment, MCP server, and TOML plugin system
4. [cmux](https://github.com/craigsc/cmux) — Bash git-worktree isolator for parallel Claude sessions
5. [opensessions](https://github.com/ataraxy-labs/opensessions) — TypeScript tmux sidebar with HTTP-driven agent status monitoring
6. [ntm](https://github.com/Dicklesworthstone/ntm) — Go control plane with pipelines, safety policies, and REST/WebSocket API
7. [dmux](https://github.com/standardagents/dmux) — TypeScript worktree-based multi-agent manager with built-in file browser

### Terminal & Multiplexer
8. [Zellij Plugin System](https://zellij.dev/documentation/plugins.html) — WASM plugin API, pipe system, layout format
9. [Zellij Pipe System](https://zellij.dev/documentation/plugin-pipes.html) — CLI-to-plugin and plugin-to-plugin messaging
10. [Zellij CLI Actions](https://zellij.dev/documentation/cli-actions) — Pane management commands
11. [zjstatus](https://github.com/dj95/zjstatus) — Community Zellij status bar plugin
12. [Ghostty](https://ghostty.org/docs/features) — Terminal emulator features and IPC limitations
13. [Ghostty Scripting Discussion](https://github.com/ghostty-org/ghostty/discussions/2353) — Developer stance on programmatic control
14. [Zellij support request for Claude Code](https://github.com/anthropics/claude-code/issues/31901)

### TUI Frameworks
15. [Ink](https://github.com/vadimdemedes/ink) — React for interactive command-line apps (TypeScript)
16. [ratatui](https://github.com/ratatui/ratatui) — Rust TUI framework
17. [zellij-tile crate](https://docs.rs/zellij-tile) — Rust SDK for Zellij plugins
18. [bubbletea](https://github.com/charmbracelet/bubbletea) — Go Elm-architecture TUI framework

### OAT Codebase
19. `packages/cli/src/commands/state/generate.ts` — State aggregation logic
20. `.agents/skills/oat-project-next/SKILL.md` — Workflow routing algorithm
21. `.oat/projects/shared/remote-project-management/state.md` — Example project state

### Integration
22. [Claude Code Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks) — Hook system for agent lifecycle events
23. [Node.js fs.watch](https://nodejs.org/api/fs.html#fswatchfilename-options-listener) — File watching API

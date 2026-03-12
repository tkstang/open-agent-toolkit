---
oat_status: in_progress
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-12
oat_generated: false
---

# Discovery: project-management-integration

## Phase Guardrails (Discovery)

Discovery is for requirements and decisions, not implementation details.

- Prefer outcomes and constraints over concrete deliverables (no specific scripts, file paths, or function names).
- If an implementation detail comes up, capture it as an **Open Question** for design (or a constraint), not as a deliverable list.

## Initial Request

Create first-class project management integration for OAT with a provider model supporting three backends:

1. **Local** — Markdown-based project management (what exists today, but not yet formalized as a provider)
2. **Jira** — Integration with Atlassian Jira for team workflows
3. **Linear** — Integration with Linear for team workflows

The local mode is the right place to start. OAT is currently used by a solo contributor, and local PM works well for that. But the system should be designed for expansion to team-oriented tools (Jira, Linear) in other repos.

Key motivations:

- Formalize the implicit local PM system (backlog.md, state.md, project lifecycle) as a first-class provider
- Design a provider abstraction that accommodates external PM tools with very different data models
- Enable OAT to be useful for teams, not just solo developers

## Clarifying Questions

### Question 1: Source of truth model

**Q:** When Jira/Linear is connected, which system is the source of truth? Options:

- (a) OAT is always the source of truth, external tools get synced outward
- (b) External tool is the source of truth, OAT pulls state inward
- (c) Bidirectional sync with conflict resolution
- (d) OAT artifacts are the working surface for agents; external tool is the record of truth for humans/teams

**A:** {Awaiting user input}
**Decision:** {Pending}

### Question 2: Scope of integration

**Q:** What PM concepts should the integration cover? The current local system has:

- **Backlog** (inbox → planned → in-progress → completed)
- **Projects** (discovery → spec → design → plan → implement → complete)
- **Tasks** (within plan.md / implementation.md)
- **State dashboard** (active project, phase, blockers)

For Jira/Linear, should the integration map all of these, or focus on a subset (e.g., just backlog items ↔ issues)?

**A:** {Awaiting user input}
**Decision:** {Pending}

### Question 3: Granularity of mapping

**Q:** An OAT "project" is a heavyweight concept (discovery, spec, design, plan, implementation). A Jira/Linear "issue" is lighter weight. How should these map?

- (a) OAT project ↔ Epic/Project; OAT plan tasks ↔ Issues/Tickets
- (b) OAT backlog item ↔ Issue; OAT project is an internal-only concept
- (c) Flexible: user configures what maps to what

**A:** {Awaiting user input}
**Decision:** {Pending}

### Question 4: Authentication and configuration

**Q:** How should credentials for Jira/Linear be managed? Options:

- (a) Environment variables (JIRA_API_TOKEN, LINEAR_API_KEY)
- (b) Stored in `.oat/config.local.json` (gitignored)
- (c) Delegated to system keychain / credential helpers
- (d) Use existing CLI tools (jira-cli, linear-cli) if available

**A:** {Awaiting user input}
**Decision:** {Pending}

## Solution Space

### Approach 1: Provider adapter pattern _(Recommended)_

**Description:** Define a PM provider adapter interface (similar to the existing sync provider adapter for Claude/Cursor/Codex). Each backend (Local, Jira, Linear) implements the interface. The CLI and skills interact with the abstract interface, not the concrete backend.

**When this is the right choice:** When multiple backends need to support the same operations, and we want to add new backends without changing the core system. This matches OAT's existing patterns.

**Tradeoffs:** Requires careful interface design upfront. The "lowest common denominator" problem — the interface can only expose what all providers support, unless we allow provider-specific extensions.

### Approach 2: Local-first with export/import bridges

**Description:** Keep the local markdown system as the primary interface. Add export commands (`oat pm export --to jira`) and import commands (`oat pm import --from linear`) that translate between formats. No real-time sync — just batch operations.

**When this is the right choice:** When integration needs are occasional (e.g., weekly sync with team board) rather than continuous. Simpler to implement, no sync complexity.

**Tradeoffs:** State can drift between OAT and external tool. Manual sync burden. Less useful for teams who live in Jira/Linear daily.

### Approach 3: Webhook-driven event bridge

**Description:** Use webhooks from Jira/Linear to push state changes into OAT, and OAT CLI hooks to push changes outward. Event-driven rather than polling.

**When this is the right choice:** When real-time sync matters and teams need immediate visibility.

**Tradeoffs:** Requires a running service or webhook receiver. Complex infrastructure. Overkill for most OAT use cases where the agent operates in sessions.

### Chosen Direction

**Approach:** {Awaiting user input}
**Rationale:** {Pending}
**User validated:** No

## Key Decisions

1. **Provider model:** {Pending — adapter pattern vs export/import vs event bridge}
2. **Source of truth:** {Pending — which system owns canonical state}
3. **Mapping granularity:** {Pending — how OAT concepts map to external concepts}
4. **Local mode formalization:** The existing implicit local PM system (backlog.md, state.md, project lifecycle) needs to be formalized as the first provider implementation, regardless of which approach is chosen.

## Constraints

- Must not break existing OAT project workflows — local mode should continue to work exactly as it does today
- External tool integrations must be optional — OAT must remain fully functional without Jira/Linear
- Credentials must never be stored in version-controlled files
- The provider interface should accommodate future backends beyond Jira/Linear (GitHub Projects, Notion, etc.)
- Agent sessions are ephemeral — the system cannot assume a long-running process for sync

## Success Criteria

- Local PM operations (backlog management, project lifecycle) are formalized behind the provider interface
- At least one external provider (Jira or Linear) can be configured and used for basic operations
- Existing OAT workflows continue to work unchanged
- New providers can be added by implementing a well-documented interface
- Configuration is simple: `oat init` or `oat pm configure` can set up a provider

## Out of Scope

- Real-time webhook sync (can be explored later)
- Visual dashboards or web UIs for PM
- Time tracking or estimation features
- Sprint planning or velocity metrics
- Multi-project portfolio management across providers

## Deferred Ideas

- **GitHub Projects integration** — Natural extension but lower priority than Jira/Linear
- **Notion integration** — Some teams use Notion for PM, could be a future provider
- **Cross-provider sync** — Syncing between Jira and Linear simultaneously
- **Custom field mapping** — Allowing users to define how custom fields map between providers
- **Bulk migration** — Importing entire Jira/Linear project history into OAT

## Open Questions

- **Offline capability:** How should the system behave when external providers are unreachable? Should local fallback be automatic?
- **Conflict resolution:** If both OAT and the external tool are modified between syncs, how are conflicts resolved?
- **Team visibility:** When an agent creates/updates items via OAT, how should attribution work in Jira/Linear? (bot user? acting-as user?)
- **Project lifecycle mapping:** OAT has a rich project lifecycle (discovery → spec → design → plan → implement). Do external tools need to know about this, or is it an OAT-internal concept?
- **Existing provider pattern reuse:** The sync provider adapter (Claude/Cursor/Codex) handles content sync. Should the PM provider reuse that pattern or be a separate adapter type?

## Assumptions

- Users who want Jira/Linear integration already have accounts and API access configured
- The agent (Claude/Codex/etc.) will be the primary user of the PM interface, not humans directly
- Network access is available during agent sessions when external providers are needed
- Jira Cloud (not Server/Data Center) is the target for Jira integration

## Risks

- **Abstraction leakage:** Jira and Linear have very different data models; forcing them into a common interface may produce a leaky or over-simplified abstraction
  - **Likelihood:** Medium
  - **Impact:** High
  - **Mitigation Ideas:** Design the interface around OAT's own concepts (backlog items, projects, tasks) rather than trying to abstract Jira/Linear concepts. Let each provider map its concepts to OAT's.

- **Sync complexity:** Bidirectional sync between markdown files and external APIs is notoriously hard to get right
  - **Likelihood:** High
  - **Impact:** High
  - **Mitigation Ideas:** Start with unidirectional sync (OAT → external or external → OAT). Add bidirectional later with explicit conflict resolution.

- **Scope creep:** PM integration can expand indefinitely (sprints, boards, custom fields, workflows)
  - **Likelihood:** High
  - **Impact:** Medium
  - **Mitigation Ideas:** Define a minimal viable interface and stick to it. Additional features go in provider-specific extensions.

- **Authentication complexity:** Each provider has different auth flows (OAuth for Jira, API keys for Linear)
  - **Likelihood:** Low
  - **Impact:** Medium
  - **Mitigation Ideas:** Start with simple API key/token auth. Add OAuth flows later if needed.

## Next Steps

Spec-driven mode: continue to specification phase after resolving the clarifying questions above. Key questions to resolve before proceeding:

1. Source of truth model (Q1)
2. Scope of integration (Q2)
3. Granularity of mapping (Q3)
4. Chosen approach from solution space

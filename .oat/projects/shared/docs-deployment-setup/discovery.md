---
oat_status: complete
oat_ready_for: null
oat_blockers: []
oat_last_updated: 2026-03-13
oat_generated: true
---

# Discovery: docs-deployment-setup

## Initial Request

The project recently migrated from MkDocs to FumaDocs (Next.js-based). An existing MkDocs deployment workflow from Honeycomb was available as a reference, but no deployment pipeline existed for the new FumaDocs docs site. The user wanted to evaluate what would differ between the two setups and set up deployment.

A secondary concern emerged: the docs build (by far the slowest package) was running on every `pnpm build`, slowing down all development work even when docs weren't being touched.

## Clarifying Questions

### Question 1: Deployment target

**Q:** Where should the docs deploy — S3 (like Honeycomb), GitHub Pages, or another host?
**A:** GitHub Pages for now. The project is open source, so Pages avoids Fastly/CDN complexity. Can migrate to S3+Fastly later if a custom Vox Media domain is needed.
**Decision:** Use GitHub Pages with `actions/deploy-pages`. Static export (`out/`) is already compatible. Migration path to S3 is trivial since it's just static files.

### Question 2: Build separation

**Q:** Should docs continue building as part of `pnpm build`?
**A:** No — it's cumbersome. Most code changes don't touch docs and shouldn't wait for the docs build. A separate `build:docs` command is preferred.
**Decision:** Use Turborepo `--filter` to exclude oat-docs from default build, add dedicated `build:docs` script.

## Key Decisions

1. **GitHub Pages over S3:** Simpler for open source, no CDN config needed, custom domain support exists if needed later.
2. **Build separation via Turborepo filter:** `--filter='!oat-docs'` excludes docs from default build; `--filter=oat-docs...` builds docs with all dependencies for the dedicated command.
3. **Broader change detection:** Unlike Honeycomb (single directory), OAT docs depend on three workspace packages, so the workflow watches `apps/oat-docs/**` plus `packages/docs-config/**`, `packages/docs-theme/**`, and `packages/docs-transforms/**`.

## Constraints

- Docs site uses Next.js static export (`output: 'export'`) — no server-side features
- Build depends on three workspace packages that must compile first (Turborepo handles ordering)
- Pre-build step runs `fumadocs-mdx` codegen and `oat docs generate-index` (handled by npm `prebuild` script)

## Success Criteria

- Docs deploy automatically to GitHub Pages on push to main (when docs files change)
- `pnpm build` no longer includes docs (faster for non-docs development)
- `pnpm build:docs` builds docs and all dependencies in one command
- Manual deploy via workflow_dispatch is available

## Out of Scope

- Custom domain / Fastly CDN configuration (can add later)
- Next.js `basePath` configuration (needed only if serving from a subpath)
- Vercel or other hosting alternatives

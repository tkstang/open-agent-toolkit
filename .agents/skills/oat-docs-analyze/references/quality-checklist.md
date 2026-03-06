# Docs Quality Checklist

Use this checklist when evaluating a docs surface.

## Structure

- Every docs directory has an `index.md`.
- Every `index.md` includes a `## Contents` section.
- `## Contents` links describe sibling files and immediate child directories.
- `overview.md` is not used as the directory entrypoint.

## Accuracy

- Commands match the current repo scripts and CLI surface.
- Referenced paths exist.
- Tooling/setup instructions are current.

## Discoverability

- Important pages are reachable from a parent `index.md` or site nav.
- Topic names are specific enough for agents to select the right page quickly.
- Large sections summarize what each child page covers.

## Docs App Contract

- `mkdocs.yml` exists when the repo is using an OAT docs app.
- Navigation is consistent with the docs tree.
- `docs/contributing.md` documents enabled plugins/extensions when an MkDocs app exists.

## Drift Signals

- Nav points to missing files.
- Files exist but are not represented in indexes/nav.
- Index descriptions no longer match the content they point to.
- Commands mention removed or renamed tooling.

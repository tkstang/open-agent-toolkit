import { describe, expect, it } from 'vitest';

import { detectExistingDocs, type DetectDocsDependencies } from './detect-docs';

function createDeps(
  existingFiles: Set<string> = new Set(),
  existingDirs: Set<string> = new Set(),
): DetectDocsDependencies {
  return {
    fileExists: async (path: string) => existingFiles.has(path),
    dirExists: async (path: string) => existingDirs.has(path),
  };
}

describe('detectExistingDocs', () => {
  it('returns null when no docs framework is detected', async () => {
    const result = await detectExistingDocs('/repo', createDeps());
    expect(result).toBeNull();
  });

  it('detects mkdocs.yml at repo root', async () => {
    const deps = createDeps(new Set(['/repo/mkdocs.yml']));
    const result = await detectExistingDocs('/repo', deps);
    expect(result).toEqual({ tooling: 'mkdocs', root: '.' });
  });

  it('detects mkdocs.yaml at repo root', async () => {
    const deps = createDeps(new Set(['/repo/mkdocs.yaml']));
    const result = await detectExistingDocs('/repo', deps);
    expect(result).toEqual({ tooling: 'mkdocs', root: '.' });
  });

  it('detects mkdocs.yml in docs/ subdirectory', async () => {
    const deps = createDeps(new Set(['/repo/docs/mkdocs.yml']));
    const result = await detectExistingDocs('/repo', deps);
    expect(result).toEqual({ tooling: 'mkdocs', root: 'docs' });
  });

  it('detects fumadocs via source.config.ts at repo root', async () => {
    const deps = createDeps(new Set(['/repo/source.config.ts']));
    const result = await detectExistingDocs('/repo', deps);
    expect(result).toEqual({ tooling: 'fumadocs', root: '.' });
  });

  it('detects fumadocs via apps/docs/source.config.ts', async () => {
    const deps = createDeps(new Set(['/repo/apps/docs/source.config.ts']));
    const result = await detectExistingDocs('/repo', deps);
    expect(result).toEqual({ tooling: 'fumadocs', root: 'apps/docs' });
  });

  it('detects docusaurus via docusaurus.config.ts', async () => {
    const deps = createDeps(new Set(['/repo/docusaurus.config.ts']));
    const result = await detectExistingDocs('/repo', deps);
    expect(result).toEqual({ tooling: 'docusaurus', root: '.' });
  });

  it('detects vitepress via docs/.vitepress/config.ts', async () => {
    const deps = createDeps(new Set(['/repo/docs/.vitepress/config.ts']));
    const result = await detectExistingDocs('/repo', deps);
    expect(result).toEqual({ tooling: 'vitepress', root: 'docs' });
  });

  it('detects nextra via theme.config.tsx', async () => {
    const deps = createDeps(new Set(['/repo/theme.config.tsx']));
    const result = await detectExistingDocs('/repo', deps);
    expect(result).toEqual({ tooling: 'nextra', root: '.' });
  });

  it('returns first match when multiple frameworks present (mkdocs takes priority)', async () => {
    const deps = createDeps(
      new Set(['/repo/mkdocs.yml', '/repo/docusaurus.config.js']),
    );
    const result = await detectExistingDocs('/repo', deps);
    expect(result).toEqual({ tooling: 'mkdocs', root: '.' });
  });
});

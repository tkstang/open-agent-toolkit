import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { checkLocalPathsStatus, type LocalPathStatus } from './status';

describe('oat local status', () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.map(async (dir) => rm(dir, { recursive: true, force: true })),
    );
    tempDirs.length = 0;
  });

  async function createRepoRoot(): Promise<string> {
    const root = await mkdtemp(join(tmpdir(), 'oat-local-status-'));
    tempDirs.push(root);
    await mkdir(join(root, '.oat'), { recursive: true });
    return root;
  }

  it('should list localPaths with existence and gitignore status', async () => {
    const repoRoot = await createRepoRoot();
    await mkdir(join(repoRoot, '.oat', 'ideas'), { recursive: true });
    await writeFile(join(repoRoot, '.gitignore'), '.oat/ideas/\n', 'utf8');

    const results = await checkLocalPathsStatus(repoRoot, [
      '.oat/ideas',
      '.oat/missing-dir',
    ]);

    expect(results).toEqual([
      { path: '.oat/ideas', exists: true, gitignored: true },
      { path: '.oat/missing-dir', exists: false, gitignored: false },
    ]);
  });

  it('should warn on config/gitignore drift', async () => {
    const repoRoot = await createRepoRoot();
    await mkdir(join(repoRoot, '.oat', 'projects', 'local'), {
      recursive: true,
    });
    // Path exists but is NOT in .gitignore
    await writeFile(join(repoRoot, '.gitignore'), '# empty\n', 'utf8');

    const results = await checkLocalPathsStatus(repoRoot, [
      '.oat/projects/local',
    ]);

    expect(results).toEqual([
      { path: '.oat/projects/local', exists: true, gitignored: false },
    ]);
  });

  it('should return empty array for no localPaths', async () => {
    const repoRoot = await createRepoRoot();
    const results = await checkLocalPathsStatus(repoRoot, []);
    expect(results).toEqual([]);
  });
});

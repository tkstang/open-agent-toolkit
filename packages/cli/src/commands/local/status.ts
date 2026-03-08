import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dirExists, fileExists } from '@fs/io';

export interface LocalPathStatus {
  path: string;
  exists: boolean;
  gitignored: boolean;
}

async function isPathGitignored(
  repoRoot: string,
  localPath: string,
): Promise<boolean> {
  const gitignorePath = join(repoRoot, '.gitignore');

  try {
    const content = await readFile(gitignorePath, 'utf8');
    const lines = content.split('\n').map((l) => l.trim());
    const withTrailingSlash = localPath.endsWith('/')
      ? localPath
      : `${localPath}/`;
    const withoutTrailingSlash = localPath.replace(/\/+$/, '');

    return lines.some(
      (line) =>
        line === withTrailingSlash ||
        line === withoutTrailingSlash ||
        line === `/${withTrailingSlash}` ||
        line === `/${withoutTrailingSlash}`,
    );
  } catch {
    return false;
  }
}

export async function checkLocalPathsStatus(
  repoRoot: string,
  localPaths: string[],
): Promise<LocalPathStatus[]> {
  const results: LocalPathStatus[] = [];

  for (const localPath of localPaths) {
    const absolutePath = join(repoRoot, localPath);
    const exists =
      (await dirExists(absolutePath)) || (await fileExists(absolutePath));
    const gitignored = await isPathGitignored(repoRoot, localPath);

    results.push({ path: localPath, exists, gitignored });
  }

  return results;
}

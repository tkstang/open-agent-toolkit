import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readOatConfig } from '@config/oat-config';
import { fileExists } from '@fs/io';

export async function resolveProjectsRoot(
  repoRoot: string,
  env: NodeJS.ProcessEnv,
): Promise<string> {
  const envRoot = env.OAT_PROJECTS_ROOT?.trim();
  if (envRoot) {
    return envRoot.replace(/\/+$/, '');
  }

  const config = await readOatConfig(repoRoot);
  const configRoot = config.projects?.root?.trim();
  if (configRoot) {
    return configRoot.replace(/\/+$/, '');
  }

  const rootFile = join(repoRoot, '.oat', 'projects-root');
  if (await fileExists(rootFile)) {
    const fromFile = (await readFile(rootFile, 'utf8')).trim();
    if (fromFile) {
      return fromFile.replace(/\/+$/, '');
    }
  }

  return '.oat/projects/shared';
}

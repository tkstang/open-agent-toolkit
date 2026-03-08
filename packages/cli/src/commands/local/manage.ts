import {
  readOatConfig,
  resolveLocalPaths,
  writeOatConfig,
} from '@config/oat-config';

export interface AddResult {
  added: string[];
  alreadyPresent: string[];
  all: string[];
}

export interface RemoveResult {
  removed: string[];
  notFound: string[];
  all: string[];
}

export async function addLocalPaths(
  repoRoot: string,
  paths: string[],
): Promise<AddResult> {
  const config = await readOatConfig(repoRoot);
  const existing = new Set(resolveLocalPaths(config));

  const added: string[] = [];
  const alreadyPresent: string[] = [];

  for (const p of paths) {
    const normalized = p.replace(/\/+$/, '');
    if (existing.has(normalized)) {
      alreadyPresent.push(normalized);
    } else {
      existing.add(normalized);
      added.push(normalized);
    }
  }

  const sorted = [...existing].sort();
  await writeOatConfig(repoRoot, { ...config, localPaths: sorted });

  return { added, alreadyPresent, all: sorted };
}

export async function removeLocalPaths(
  repoRoot: string,
  paths: string[],
): Promise<RemoveResult> {
  const config = await readOatConfig(repoRoot);
  const existing = resolveLocalPaths(config);
  const toRemove = new Set(paths.map((p) => p.replace(/\/+$/, '')));

  const removed: string[] = [];
  const notFound: string[] = [];

  for (const p of toRemove) {
    if (existing.includes(p)) {
      removed.push(p);
    } else {
      notFound.push(p);
    }
  }

  const remaining = existing.filter((p) => !toRemove.has(p));
  const updated = { ...config };

  if (remaining.length > 0) {
    updated.localPaths = remaining;
  } else {
    delete updated.localPaths;
  }

  await writeOatConfig(repoRoot, updated);

  return { removed, notFound, all: remaining };
}

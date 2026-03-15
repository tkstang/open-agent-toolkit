import { createHash } from 'node:crypto';

export function generateBacklogId(filename: string, createdAt: string): string {
  const hash = createHash('sha256')
    .update(filename)
    .update('\0')
    .update(createdAt)
    .digest('hex');

  return `bl-${hash.slice(0, 4)}`;
}

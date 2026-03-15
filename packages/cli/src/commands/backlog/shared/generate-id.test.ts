import { describe, expect, it } from 'vitest';

import { generateBacklogId } from './generate-id';

describe('generateBacklogId', () => {
  it('returns a backlog id with the expected prefix and hash length', () => {
    const id = generateBacklogId(
      'oat-project-capture-skill',
      '2026-03-15T22:30:00Z',
    );

    expect(id).toMatch(/^bl-[a-f0-9]{4}$/);
  });

  it('returns the same id for the same filename and timestamp', () => {
    const createdAt = '2026-03-15T22:30:00Z';

    expect(generateBacklogId('demo-item', createdAt)).toBe(
      generateBacklogId('demo-item', createdAt),
    );
  });

  it('returns different ids for different inputs', () => {
    const createdAt = '2026-03-15T22:30:00Z';

    expect(generateBacklogId('demo-item-a', createdAt)).not.toBe(
      generateBacklogId('demo-item-b', createdAt),
    );
    expect(generateBacklogId('demo-item-a', createdAt)).not.toBe(
      generateBacklogId('demo-item-a', '2026-03-15T22:31:00Z'),
    );
  });
});

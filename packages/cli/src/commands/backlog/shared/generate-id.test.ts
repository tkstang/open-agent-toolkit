import { describe, expect, it } from 'vitest';

import { generateBacklogId, generateUniqueBacklogId } from './generate-id';

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

  it('keeps the original candidate when no collision exists', () => {
    const createdAt = '2026-03-15T22:30:00Z';

    expect(generateUniqueBacklogId('demo-item', createdAt, [])).toBe(
      generateBacklogId('demo-item', createdAt),
    );
  });

  it('re-hashes with a nonce when the initial candidate collides', () => {
    const createdAt = '2026-03-15T22:30:00Z';
    const first = generateBacklogId('demo-item', createdAt);
    const second = generateBacklogId('demo-item', createdAt, 1);
    const unique = generateUniqueBacklogId('demo-item', createdAt, [first]);

    expect(unique).toBe(second);
    expect(unique).not.toBe(first);
  });

  it('skips multiple occupied candidates until it finds an unused id', () => {
    const createdAt = '2026-03-15T22:30:00Z';
    const occupied = [
      generateBacklogId('demo-item', createdAt, 0),
      generateBacklogId('demo-item', createdAt, 1),
      generateBacklogId('demo-item', createdAt, 2),
    ];

    expect(generateUniqueBacklogId('demo-item', createdAt, occupied)).toBe(
      generateBacklogId('demo-item', createdAt, 3),
    );
  });
});

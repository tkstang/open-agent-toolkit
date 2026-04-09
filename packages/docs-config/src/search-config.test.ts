import { describe, expect, it } from 'vitest';

import { createSearchConfig } from './search-config.js';

describe('createSearchConfig', () => {
  it('should return static search options with no api by default', () => {
    const config = createSearchConfig();

    expect(config.options.type).toBe('static');
    expect(config.options.api).toBeUndefined();
  });

  it('should prefix api URL with basePath when provided', () => {
    const config = createSearchConfig({ basePath: '/my-docs' });

    expect(config.options.type).toBe('static');
    expect(config.options.api).toBe('/my-docs/api/search');
  });
});

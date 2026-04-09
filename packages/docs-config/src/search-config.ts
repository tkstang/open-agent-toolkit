export interface SearchConfigOptions {
  basePath?: string;
}

export interface SearchConfig {
  options: {
    type: 'static';
    api?: string;
  };
}

export function createSearchConfig(
  options: SearchConfigOptions = {},
): SearchConfig {
  const { basePath } = options;

  return {
    options: {
      type: 'static' as const,
      ...(basePath ? { api: `${basePath}/api/search` } : {}),
    },
  };
}

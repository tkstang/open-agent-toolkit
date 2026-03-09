import type { Plugin } from 'unified';

export interface SourceConfigResult {
  remarkPlugins: Plugin[];
  contentDir: string;
}

export function createSourceConfig(): SourceConfigResult {
  return {
    remarkPlugins: [],
    contentDir: './docs',
  };
}

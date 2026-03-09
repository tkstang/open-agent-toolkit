import { remarkTabs } from '@oat/docs-transforms';
import type { Root } from 'mdast';
import { remarkAlert } from 'remark-github-blockquote-alert';
import type { Plugin } from 'unified';

// biome-ignore lint/suspicious/noExplicitAny: unified Plugin generics are covariant but typed invariantly
type RemarkPlugin = Plugin<any[], Root>;

export interface SourceConfigResult {
  remarkPlugins: RemarkPlugin[];
  contentDir: string;
}

export function createSourceConfig(): SourceConfigResult {
  return {
    remarkPlugins: [remarkTabs, remarkAlert],
    contentDir: './docs',
  };
}

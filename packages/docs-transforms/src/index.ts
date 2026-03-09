import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import { remarkTabs } from './remark-tabs.js';

export { remarkTabs } from './remark-tabs.js';

export const defaultTransforms: Plugin<[], Root>[] = [remarkTabs];

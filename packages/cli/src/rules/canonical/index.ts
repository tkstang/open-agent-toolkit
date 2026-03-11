export {
  parseCanonicalRuleFile,
  parseCanonicalRuleMarkdown,
  parseMarkdownFrontmatter,
  stripTrailingOatMarker,
} from './parse';
export {
  appendGeneratedMarker,
  renderCanonicalRuleMarkdown,
  renderMarkdownWithFrontmatter,
} from './render';
export type {
  CanonicalRuleDocument,
  CanonicalRuleFrontmatter,
  RuleActivation,
} from './types';
export { RULE_ACTIVATIONS } from './types';

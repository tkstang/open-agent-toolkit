import {
  appendGeneratedMarker,
  parseCanonicalRuleMarkdown,
  parseMarkdownFrontmatter,
  renderCanonicalRuleMarkdown,
  renderMarkdownWithFrontmatter,
} from '@rules/canonical/index';

function parseDescription(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }
  return undefined;
}

function parseApplyTo(value: unknown): string[] | undefined {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const globs = value
    .split(',')
    .map((glob) => glob.trim())
    .filter(Boolean);

  return globs.length > 0 ? globs : undefined;
}

export function transformCanonicalToCopilotRule(
  canonicalContent: string,
  canonicalPath?: string,
): string {
  const rule = parseCanonicalRuleMarkdown(canonicalContent);
  const frontmatter =
    rule.activation === 'glob' && rule.globs
      ? {
          ...(rule.description !== undefined
            ? { description: rule.description }
            : {}),
          applyTo: rule.globs.join(','),
        }
      : rule.description !== undefined
        ? { description: rule.description }
        : null;

  return appendGeneratedMarker(
    renderMarkdownWithFrontmatter(frontmatter, rule.body),
    canonicalPath,
  );
}

export function parseCopilotRuleToCanonical(providerContent: string): string {
  const { frontmatter, body } = parseMarkdownFrontmatter(providerContent);
  const description = parseDescription(frontmatter?.description);
  const globs = parseApplyTo(frontmatter?.applyTo);

  return renderCanonicalRuleMarkdown(
    {
      ...(description !== undefined ? { description } : {}),
      ...(globs !== undefined ? { globs } : {}),
      activation: globs ? 'glob' : 'always',
    },
    body,
  );
}

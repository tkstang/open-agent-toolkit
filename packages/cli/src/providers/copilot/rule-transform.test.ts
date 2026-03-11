import { describe, expect, it } from 'vitest';

import {
  parseCopilotRuleToCanonical,
  transformCanonicalToCopilotRule,
} from './rule-transform';

describe('Copilot rule transforms', () => {
  it('renders glob activation with applyTo and round-trips', () => {
    const canonical = `---
description: React components
globs:
  - src/components/**/*.tsx
  - src/components/**/*.ts
activation: glob
---

# React Components`;

    const rendered = transformCanonicalToCopilotRule(
      canonical,
      '.agents/rules/react-components.md',
    );

    expect(rendered).toContain(
      'applyTo: src/components/**/*.tsx,src/components/**/*.ts',
    );
    expect(parseCopilotRuleToCanonical(rendered)).toBe(canonical);
  });

  it('degrades agent-requested rules to always for Copilot', () => {
    const canonical = `---
description: Review when asked
activation: agent-requested
---

# Review Rule`;

    const rendered = transformCanonicalToCopilotRule(
      canonical,
      '.agents/rules/review-rule.md',
    );

    expect(rendered).not.toContain('applyTo:');
    expect(parseCopilotRuleToCanonical(rendered)).toContain(
      'activation: always',
    );
  });
});

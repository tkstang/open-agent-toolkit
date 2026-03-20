import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

function repoFilePath(relativePath: string): string {
  return join(import.meta.dirname, '../../../../../../../', relativePath);
}

describe('agent instructions bundle contract', () => {
  it('requires recommendation packs to preserve behavioral and workflow guidance', () => {
    const packTemplate = readFileSync(
      repoFilePath(
        '.agents/skills/oat-agent-instructions-analyze/references/recommendation-pack-template.md',
      ),
      'utf8',
    );

    expect(packTemplate).toContain('## Evidence');
    expect(packTemplate).toContain('## Structural Conventions');
    expect(packTemplate).toContain('## Behavioral Conventions');
    expect(packTemplate).toContain('## Counter-Examples');
    expect(packTemplate).toContain('## New-File Workflow');
    expect(packTemplate).toContain('## Preferred Default for New Files');
    expect(packTemplate).toContain('## Claim Corrections');
    expect(packTemplate).toContain('## Generation Constraints');
  });

  it('requires the bundle manifest and summary templates to index recommendation packs', () => {
    const manifestTemplate = readFileSync(
      repoFilePath(
        '.agents/skills/oat-agent-instructions-analyze/references/recommendations-manifest-template.yaml',
      ),
      'utf8',
    );
    const summaryTemplate = readFileSync(
      repoFilePath(
        '.agents/skills/oat-agent-instructions-analyze/references/bundle-summary-template.md',
      ),
      'utf8',
    );

    expect(manifestTemplate).toContain('bundleVersion: 1');
    expect(manifestTemplate).toContain('id: rec-001');
    expect(manifestTemplate).toContain('pack: packs/rec-001.md');

    expect(summaryTemplate).toContain('## Recommendation Index');
    expect(summaryTemplate).toContain('Provider / Format');
    expect(summaryTemplate).toContain('`packs/rec-001.md`');
    expect(summaryTemplate).toContain(
      'Every listed pack file must exist under `packs/`.',
    );
  });

  it('requires the apply plan template to carry bundle-addressable recommendation metadata', () => {
    const applyPlanTemplate = readFileSync(
      repoFilePath(
        '.agents/skills/oat-agent-instructions-apply/references/apply-plan-template.md',
      ),
      'utf8',
    );

    expect(applyPlanTemplate).toContain('**Source Bundle:**');
    expect(applyPlanTemplate).toContain('| Recommendation ID');
    expect(applyPlanTemplate).toContain('| Bundle Pack');
  });

  it('requires apply to consume the bundle before falling back to markdown-only review context', () => {
    const applySkill = readFileSync(
      repoFilePath('.agents/skills/oat-agent-instructions-apply/SKILL.md'),
      'utf8',
    );

    expect(applySkill).toContain(
      'the bundle is the primary generation contract',
    );
    expect(applySkill).toContain(
      'If the bundle exists but is incomplete, stop and require a refreshed analysis rather than falling back silently to the',
    );
    expect(applySkill).toContain(
      'build the plan from the bundle manifest and recommendation packs first',
    );
    expect(applySkill).toContain(
      "load the approved recommendation's manifest entry and matching pack before",
    );
    expect(applySkill).toContain(
      'Do not generate from the markdown summary alone.',
    );
  });
});

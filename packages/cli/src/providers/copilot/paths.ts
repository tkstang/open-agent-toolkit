import type { PathMapping } from '@providers/shared/adapter.types';

export const COPILOT_PROJECT_MAPPINGS: PathMapping[] = [
  {
    contentType: 'skill',
    canonicalDir: '.agents/skills',
    providerDir: '.github/skills',
    nativeRead: false,
  },
  {
    contentType: 'agent',
    canonicalDir: '.agents/agents',
    providerDir: '.github/agents',
    nativeRead: false,
  },
  {
    contentType: 'rule',
    canonicalDir: '.agents/rules',
    providerDir: '.github/instructions',
    nativeRead: false,
  },
];

export const COPILOT_USER_MAPPINGS: PathMapping[] = [
  {
    contentType: 'skill',
    canonicalDir: '.agents/skills',
    providerDir: '.copilot/skills',
    nativeRead: false,
  },
  {
    contentType: 'agent',
    canonicalDir: '.agents/agents',
    providerDir: '.copilot/agents',
    nativeRead: false,
  },
];

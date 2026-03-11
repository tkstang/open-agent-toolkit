import type { PathMapping } from '@providers/shared/adapter.types';

export const CLAUDE_PROJECT_MAPPINGS: PathMapping[] = [
  {
    contentType: 'skill',
    canonicalDir: '.agents/skills',
    providerDir: '.claude/skills',
    nativeRead: false,
  },
  {
    contentType: 'agent',
    canonicalDir: '.agents/agents',
    providerDir: '.claude/agents',
    nativeRead: false,
  },
  {
    contentType: 'rule',
    canonicalDir: '.agents/rules',
    providerDir: '.claude/rules',
    nativeRead: false,
  },
];

export const CLAUDE_USER_MAPPINGS: PathMapping[] = [
  {
    contentType: 'skill',
    canonicalDir: '.agents/skills',
    providerDir: '.claude/skills',
    nativeRead: false,
  },
  {
    contentType: 'agent',
    canonicalDir: '.agents/agents',
    providerDir: '.claude/agents',
    nativeRead: false,
  },
];

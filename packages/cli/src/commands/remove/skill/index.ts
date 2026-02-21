import { Command } from 'commander';

export function createRemoveSkillCommand(): Command {
  return new Command('skill')
    .description('Remove a single installed skill by name')
    .argument('<name>', 'Skill name (e.g., oat-idea-scratchpad)')
    .option('--apply', 'Apply removal changes (default is dry-run)');
}

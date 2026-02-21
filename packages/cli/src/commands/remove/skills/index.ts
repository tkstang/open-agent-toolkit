import { Command } from 'commander';

export function createRemoveSkillsCommand(): Command {
  return new Command('skills')
    .description('Remove installed skills by pack')
    .requiredOption(
      '--pack <pack>',
      'Skill pack to remove (ideas|workflows|utility)',
    )
    .option('--apply', 'Apply removal changes (default is dry-run)');
}

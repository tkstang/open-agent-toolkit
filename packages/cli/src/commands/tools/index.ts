import { Command } from 'commander';

export function createToolsCommand(): Command {
  return new Command('tools').description(
    'Manage OAT tool packs (install, update, remove, list)',
  );
}

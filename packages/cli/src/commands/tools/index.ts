import { Command } from 'commander';
import { createToolsListCommand } from './list';

export function createToolsCommand(): Command {
  const cmd = new Command('tools').description(
    'Manage OAT tool packs (install, update, remove, list)',
  );

  cmd.addCommand(createToolsListCommand());

  return cmd;
}

import { Command } from 'commander';
import { createToolsInfoCommand } from './info';
import { createToolsListCommand } from './list';
import { createToolsOutdatedCommand } from './outdated';

export function createToolsCommand(): Command {
  const cmd = new Command('tools').description(
    'Manage OAT tool packs (install, update, remove, list)',
  );

  cmd.addCommand(createToolsListCommand());
  cmd.addCommand(createToolsOutdatedCommand());
  cmd.addCommand(createToolsInfoCommand());

  return cmd;
}

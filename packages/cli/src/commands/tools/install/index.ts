import { createInitToolsCommand } from '@commands/init/tools';
import type { Command } from 'commander';

export function createToolsInstallCommand(): Command {
  // Reuse the init tools command with a different name.
  // This preserves all pack subcommands (ideas, workflows, utility)
  // and the interactive install flow.
  const cmd = createInitToolsCommand();
  cmd.name('install');
  return cmd;
}

import { buildCommandContext } from '@app/command-context';
import { readGlobalOptions } from '@commands/shared/shared.utils';
import { scanTools } from '@commands/tools/shared/scan-tools';
import { resolveAssetsRoot } from '@fs/assets';
import { resolveScopeRoot } from '@fs/paths';
import { Command } from 'commander';
import {
  type OutdatedToolsDependencies,
  runOutdatedTools,
} from './outdated-tools';

const defaultDependencies: OutdatedToolsDependencies = {
  scanTools,
  resolveScopeRoot,
  resolveAssetsRoot,
};

export function createToolsOutdatedCommand(
  dependencies: OutdatedToolsDependencies = defaultDependencies,
): Command {
  return new Command('outdated')
    .description('Show tools with available updates')
    .action(async (_opts, command) => {
      const globalOptions = readGlobalOptions(command);
      const context = buildCommandContext(globalOptions);
      await runOutdatedTools(context, dependencies);
    });
}

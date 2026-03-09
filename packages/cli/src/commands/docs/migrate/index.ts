import {
  buildCommandContext,
  type CommandContext,
  type GlobalOptions,
} from '@app/command-context';
import { readGlobalOptions } from '@commands/shared/shared.utils';
import { Command, Option } from 'commander';

interface MigrateOptions {
  docsDir?: string;
  config?: string;
  apply?: boolean;
}

interface MigrateDependencies {
  buildCommandContext: (options: GlobalOptions) => CommandContext;
  runMigrate: (
    context: CommandContext,
    options: MigrateOptions,
  ) => Promise<void>;
}

const DEFAULT_DEPENDENCIES: MigrateDependencies = {
  buildCommandContext,
  runMigrate: async (context, options) => {
    const mode = options.apply ? 'apply' : 'dry-run';
    if (context.json) {
      context.logger.json({
        status: 'ok',
        mode,
        docsDir: options.docsDir ?? 'docs',
      });
      return;
    }
    context.logger.info(`docs migrate: ${mode} (not yet implemented)`);
  },
};

async function runMigrateCommand(
  context: CommandContext,
  options: MigrateOptions,
  dependencies: MigrateDependencies,
): Promise<void> {
  try {
    await dependencies.runMigrate(context, options);
    process.exitCode = 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (context.json) {
      context.logger.json({ status: 'error', message });
    } else {
      context.logger.error(message);
    }
    process.exitCode = 1;
  }
}

export function createDocsMigrateCommand(
  overrides: Partial<MigrateDependencies> = {},
): Command {
  const dependencies: MigrateDependencies = {
    ...DEFAULT_DEPENDENCIES,
    ...overrides,
  };

  return new Command('migrate')
    .description(
      'Migrate MkDocs markdown to Fumadocs format (admonitions, frontmatter)',
    )
    .addOption(
      new Option('--docs-dir <path>', 'Documentation source directory').default(
        'docs',
      ),
    )
    .addOption(
      new Option('--config <path>', 'Path to mkdocs.yml for nav title lookup'),
    )
    .option('--apply', 'Apply changes (default: dry-run)', false)
    .action(async (options: MigrateOptions, command: Command) => {
      const context = dependencies.buildCommandContext(
        readGlobalOptions(command),
      );
      await runMigrateCommand(context, options, dependencies);
    });
}

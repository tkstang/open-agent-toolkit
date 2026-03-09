import {
  buildCommandContext,
  type CommandContext,
  type GlobalOptions,
} from '@app/command-context';
import { readGlobalOptions } from '@commands/shared/shared.utils';
import { Command, Option } from 'commander';

interface IndexGenerateOptions {
  docsDir: string;
  output?: string;
}

interface IndexGenerateDependencies {
  buildCommandContext: (options: GlobalOptions) => CommandContext;
  runIndexGenerate: (
    context: CommandContext,
    options: IndexGenerateOptions,
  ) => Promise<void>;
}

const DEFAULT_DEPENDENCIES: IndexGenerateDependencies = {
  buildCommandContext,
  runIndexGenerate: async (context, options) => {
    if (context.json) {
      context.logger.json({
        status: 'ok',
        docsDir: options.docsDir,
        output: options.output ?? 'index.md',
      });
      return;
    }
    context.logger.info('docs index generate: not yet implemented');
  },
};

async function runIndexGenerateCommand(
  context: CommandContext,
  options: IndexGenerateOptions,
  dependencies: IndexGenerateDependencies,
): Promise<void> {
  try {
    await dependencies.runIndexGenerate(context, options);
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

export function createDocsIndexGenerateCommand(
  overrides: Partial<IndexGenerateDependencies> = {},
): Command {
  const dependencies: IndexGenerateDependencies = {
    ...DEFAULT_DEPENDENCIES,
    ...overrides,
  };

  return new Command('index-generate')
    .description('Generate a docs index from markdown files')
    .addOption(
      new Option('--docs-dir <path>', 'Documentation source directory').default(
        'docs',
      ),
    )
    .addOption(
      new Option('--output <path>', 'Output file path (default: index.md)'),
    )
    .action(async (options: IndexGenerateOptions, command: Command) => {
      const context = dependencies.buildCommandContext(
        readGlobalOptions(command),
      );
      await runIndexGenerateCommand(context, options, dependencies);
    });
}

import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import {
  buildCommandContext,
  type CommandContext,
  type GlobalOptions,
} from '@app/command-context';
import { readGlobalOptions } from '@commands/shared/shared.utils';
import { Command, Option } from 'commander';
import YAML from 'yaml';
import { buildDocsNavTree } from './contents';

interface DocsNavSyncCommandOptions {
  targetDir?: string;
}

interface SyncDocsNavigationOptions {
  appRoot: string;
}

interface SyncDocsNavigationResult {
  appRoot: string;
  docsRoot: string;
  mkdocsPath: string;
  nav: ReturnType<typeof buildDocsNavTree> extends Promise<infer T> ? T : never;
}

interface DocsNavSyncDependencies {
  buildCommandContext: (options: GlobalOptions) => CommandContext;
  syncDocsNavigation: (
    options: SyncDocsNavigationOptions,
  ) => Promise<SyncDocsNavigationResult>;
}

const DEFAULT_DEPENDENCIES: DocsNavSyncDependencies = {
  buildCommandContext,
  syncDocsNavigation,
};

export async function syncDocsNavigation(
  options: SyncDocsNavigationOptions,
): Promise<SyncDocsNavigationResult> {
  const mkdocsPath = join(options.appRoot, 'mkdocs.yml');
  const docsRoot = join(options.appRoot, 'docs');
  const nav = await buildDocsNavTree({ docsRoot });
  const mkdocsSource = await readFile(mkdocsPath, 'utf8');
  const mkdocsDocument = YAML.parseDocument(mkdocsSource);

  mkdocsDocument.set('nav', nav);
  await writeFile(mkdocsPath, mkdocsDocument.toString(), 'utf8');

  return {
    appRoot: options.appRoot,
    docsRoot,
    mkdocsPath,
    nav,
  };
}

async function runDocsNavSyncCommand(
  context: CommandContext,
  options: DocsNavSyncCommandOptions,
  dependencies: DocsNavSyncDependencies,
): Promise<void> {
  try {
    const targetDir = options.targetDir ?? '.';
    const result = await dependencies.syncDocsNavigation({
      appRoot: resolve(context.cwd, targetDir),
    });

    if (context.json) {
      context.logger.json({
        status: 'ok',
        appRoot: result.appRoot,
        docsRoot: result.docsRoot,
        mkdocsPath: result.mkdocsPath,
        nav: result.nav,
      });
    } else {
      context.logger.info(`Synced docs navigation in ${targetDir}`);
      context.logger.info(`  MkDocs config: ${result.mkdocsPath}`);
      context.logger.info(`  Docs root: ${result.docsRoot}`);
    }

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

export function createDocsNavSyncCommand(
  overrides: Partial<DocsNavSyncDependencies> = {},
): Command {
  const dependencies: DocsNavSyncDependencies = {
    ...DEFAULT_DEPENDENCIES,
    ...overrides,
  };

  return new Command('sync')
    .description('Regenerate docs navigation from index.md contents')
    .addOption(
      new Option(
        '--target-dir <path>',
        'Docs app directory containing mkdocs.yml',
      ),
    )
    .action(async (options: DocsNavSyncCommandOptions, command: Command) => {
      const context = dependencies.buildCommandContext(
        readGlobalOptions(command),
      );
      await runDocsNavSyncCommand(context, options, dependencies);
    });
}

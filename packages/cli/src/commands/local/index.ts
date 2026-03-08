import { buildCommandContext } from '@app/command-context';
import { readGlobalOptions } from '@commands/shared/shared.utils';
import { readOatConfig, resolveLocalPaths } from '@config/oat-config';
import { resolveProjectRoot } from '@fs/paths';
import { Command } from 'commander';
import { applyGitignore } from './apply';
import { checkLocalPathsStatus } from './status';

export function createLocalCommand(): Command {
  return new Command('local')
    .description('Manage local-only paths (gitignored, worktree-synced)')
    .addCommand(
      new Command('status')
        .description(
          'List localPaths with existence and gitignore membership status',
        )
        .action(async (_options: unknown, command: Command) => {
          const context = buildCommandContext(readGlobalOptions(command));
          try {
            const repoRoot = await resolveProjectRoot(context.cwd);
            const config = await readOatConfig(repoRoot);
            const localPaths = resolveLocalPaths(config);

            if (localPaths.length === 0) {
              if (context.json) {
                context.logger.json({ status: 'ok', paths: [] });
              } else {
                context.logger.info(
                  'No localPaths configured. Use `oat local add` to add paths.',
                );
              }
              process.exitCode = 0;
              return;
            }

            const results = await checkLocalPathsStatus(repoRoot, localPaths);
            const hasDrift = results.some((r) => r.exists && !r.gitignored);

            if (context.json) {
              context.logger.json({ status: 'ok', paths: results, hasDrift });
            } else {
              const lines = ['Path                        Exists  Gitignored'];
              lines.push('---                         ------  ----------');
              for (const r of results) {
                const existsStr = r.exists ? 'yes' : 'no';
                const gitStr = r.gitignored ? 'yes' : 'no';
                const warn =
                  r.exists && !r.gitignored ? ' ⚠ not gitignored' : '';
                lines.push(
                  `${r.path.padEnd(28)} ${existsStr.padEnd(8)} ${gitStr}${warn}`,
                );
              }

              context.logger.info(lines.join('\n'));

              if (hasDrift) {
                context.logger.warn(
                  '\nDrift detected: some localPaths exist but are not gitignored.',
                );
                context.logger.warn('Run `oat local apply` to fix.');
              }
            }
            process.exitCode = 0;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            if (context.json) {
              context.logger.json({ status: 'error', message });
            } else {
              context.logger.error(message);
            }
            process.exitCode = 1;
          }
        }),
    )
    .addCommand(
      new Command('apply')
        .description('Sync .gitignore with configured localPaths')
        .option('--dry-run', 'Show what would change without writing')
        .action(async (options: { dryRun?: boolean }, command: Command) => {
          const context = buildCommandContext(readGlobalOptions(command));
          try {
            const repoRoot = await resolveProjectRoot(context.cwd);
            const config = await readOatConfig(repoRoot);
            const localPaths = resolveLocalPaths(config);

            if (options.dryRun) {
              if (localPaths.length === 0) {
                context.logger.info(
                  'No localPaths configured. Managed section would be removed (if present).',
                );
              } else {
                context.logger.info(
                  `Would write ${localPaths.length} path(s) to .gitignore managed section:`,
                );
                for (const p of localPaths) {
                  context.logger.info(`  ${p.endsWith('/') ? p : `${p}/`}`);
                }
              }
              process.exitCode = 0;
              return;
            }

            const result = await applyGitignore(repoRoot, localPaths);

            if (context.json) {
              context.logger.json({
                status: 'ok',
                action: result.action,
                paths: result.paths,
              });
            } else {
              switch (result.action) {
                case 'created':
                  context.logger.info(
                    `Created .gitignore with ${result.paths.length} managed path(s).`,
                  );
                  break;
                case 'updated':
                  context.logger.info(
                    `Updated .gitignore managed section (${result.paths.length} path(s)).`,
                  );
                  break;
                case 'no-change':
                  context.logger.info(
                    '.gitignore managed section is already up to date.',
                  );
                  break;
              }
            }
            process.exitCode = 0;
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            if (context.json) {
              context.logger.json({ status: 'error', message });
            } else {
              context.logger.error(message);
            }
            process.exitCode = 1;
          }
        }),
    );
}

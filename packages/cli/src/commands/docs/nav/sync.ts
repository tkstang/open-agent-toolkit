import { Command, Option } from 'commander';

export function createDocsNavSyncCommand(): Command {
  return new Command('sync')
    .description('Regenerate docs navigation from index.md contents')
    .addOption(
      new Option(
        '--target-dir <path>',
        'Docs app directory containing mkdocs.yml',
      ),
    );
}

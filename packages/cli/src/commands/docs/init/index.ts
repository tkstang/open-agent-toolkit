import { Command, Option } from 'commander';

export function createDocsInitCommand(): Command {
  return new Command('init')
    .description('Scaffold an OAT docs app')
    .addOption(new Option('--app-name <name>', 'Docs app name'))
    .addOption(
      new Option('--target-dir <path>', 'Target directory for the docs app'),
    )
    .addOption(
      new Option('--lint <mode>', 'Markdown lint mode')
        .choices(['markdownlint', 'none'])
        .default('markdownlint'),
    )
    .addOption(
      new Option('--format <mode>', 'Markdown format mode')
        .choices(['prettier', 'none'])
        .default('prettier'),
    )
    .option('--yes', 'Accept defaults without prompting');
}

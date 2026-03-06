import { Command } from 'commander';
import { createDocsInitCommand } from './init';
import { createDocsNavCommand } from './nav';

export function createDocsCommand(): Command {
  return new Command('docs')
    .description('OAT documentation bootstrap and maintenance commands')
    .addCommand(createDocsInitCommand())
    .addCommand(createDocsNavCommand());
}

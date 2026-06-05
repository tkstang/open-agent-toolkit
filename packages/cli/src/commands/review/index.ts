import { Command } from 'commander';

import { createReviewLatestCommand } from './latest';

export function createReviewCommand(): Command {
  return new Command('review')
    .description('OAT review artifact commands')
    .addCommand(createReviewLatestCommand());
}

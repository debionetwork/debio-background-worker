export * from './genetic-analyst-staked/genetic-analyst-staked.command';
export * from './genetic-analyst-unstake/genetic-analyst-unstaked.command';
export * from './genetic-analyst-verification-status/genetic-analyst-verification-status.command';
export * from './genetic-analyst-registered/genetic-analyst-registered.command';

import { GeneticAnalystRegisteredHandler } from './genetic-analyst-registered/genetic-analyst-registered.handler';
import { GeneticAnalystStakedHandler } from './genetic-analyst-staked/genetic-analyst-staked.handler';
import { GeneticAnalystUnstakedHandler } from './genetic-analyst-unstake/genetic-analyst-unstaked.handler';
import { GeneticAnalystVerificationStatusHandler } from './genetic-analyst-verification-status/genetic-analyst-verification-status.handler';

export const GeneticAnalystCommandHandlers = [
  GeneticAnalystRegisteredHandler,
  GeneticAnalystStakedHandler,
  GeneticAnalystUnstakedHandler,
  GeneticAnalystVerificationStatusHandler,
];

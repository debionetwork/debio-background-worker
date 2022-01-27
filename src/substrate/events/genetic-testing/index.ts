export * from './commands/data-staked/data-staked.command';

import { DataStakedHandler } from './commands/data-staked/data-staked.handler';

export const GeneticTestingCommandHandlers = [DataStakedHandler];

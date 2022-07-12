export * from './commands/add-genetic-data/add-genetic-data.command';
export * from './commands/remove-genetic-data/remove-genetic-data.command';
export * from './commands/update-genetic-data/update-genetic-data.command';

import { AddGeneticDataHandler } from './commands/add-genetic-data/add-genetic-data.handler';
import { RemoveGeneticDataHandler } from './commands/remove-genetic-data/remove-genetic-data.handler';
import { UpdateGeneticDataHandler } from './commands/update-genetic-data/update-genetic-data.handler';

export const GeneticDataCommandHandlers = [
  AddGeneticDataHandler,
  RemoveGeneticDataHandler,
  UpdateGeneticDataHandler,
];

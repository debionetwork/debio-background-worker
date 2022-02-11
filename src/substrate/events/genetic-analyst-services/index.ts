import { GeneticAnalystServicesCreatedHandler } from './commands/genetic-analyst-services-created/genetic-analyst-services-created.handler';
import { GeneticAnalystServicesDeletedHandler } from './commands/genetic-analyst-services-deleted/genetic-analyst-services-deleted.handler';
import { GeneticAnalystServicesUpdatedHandler } from './commands/genetic-analyst-services-updated/genetic-analyst-services-updated.handler';

export * from './commands/genetic-analyst-services-created/genetic-analyst-services-created.command';
export * from './commands/genetic-analyst-services-deleted/genetic-analyst-services-deleted.command';
export * from './commands/genetic-analyst-services-updated/genetic-analyst-services-updated.command';

export const GeneticAnalystServicesCommandHandlers = [
  GeneticAnalystServicesCreatedHandler,
  GeneticAnalystServicesDeletedHandler,
  GeneticAnalystServicesUpdatedHandler,
];

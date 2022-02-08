import { GeneticAnalystsDeletedHandler } from './commands/genetic-analysts-deleted/genetic-analysts-deleted.handler';
import { GeneticAnalystsRegisteredHandler } from './commands/genetic-analysts-registered/genetic-analysts-registered.handler';
import { GeneticAnalystsUpdatedHandler } from './commands/genetic-analysts-updated/genetic-analysts-updated.handler';

export * from './commands/genetic-analysts-registered/genetic-analysts-registered.command';
export * from './commands/genetic-analysts-updated/genetic-analysts-updated.command';
export * from './commands/genetic-analysts-deleted/genetic-analysts-deleted.command';

export const GeneticAnalystsCommandHandlers = [
  GeneticAnalystsRegisteredHandler,
  GeneticAnalystsUpdatedHandler,
  GeneticAnalystsDeletedHandler,
];

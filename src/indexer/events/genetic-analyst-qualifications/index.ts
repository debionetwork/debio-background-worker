import { GeneticAnalystsQualificationCreatedHandler } from './commands/genetic-analysts-qualification-created/genetic-analysts-qualification-created.handler';
import { GeneticAnalystsQualificationDeletedHandler } from './commands/genetic-analysts-qualification-deleted/genetic-analysts-qualification-deleted.handler';
import { GeneticAnalystsQualificationUpdatedHandler } from './commands/genetic-analysts-qualification-updated/genetic-analysts-qualification-updated.handler';

export * from './commands/genetic-analysts-qualification-created/genetic-analysts-qualification-created.command';
export * from './commands/genetic-analysts-qualification-updated/genetic-analysts-qualification-updated.command';
export * from './commands/genetic-analysts-qualification-deleted/genetic-analysts-qualification-deleted.command';

export const GeneticAnalystQualificationsCommandHandlers = [
  GeneticAnalystsQualificationCreatedHandler,
  GeneticAnalystsQualificationUpdatedHandler,
  GeneticAnalystsQualificationDeletedHandler,
];

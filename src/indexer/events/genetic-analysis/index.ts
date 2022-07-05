import { GeneticAnalysisInProgressHandler } from './commands/genetic-analysis-in-progress/genetic-analysis-in-progress.handler';
import { GeneticAnalysisRejectedHandler } from './commands/genetic-analysis-rejected/genetic-analysis-rejected.handler';
import { GeneticAnalysisResultReadyHandler } from './commands/genetic-analysis-result-ready/genetic-analysis-result-ready.handler';
import { GeneticAnalysisSubmittedHandler } from './commands/genetic-analysis-submitted/genetic-analysis-submitted.handler';

export * from './commands/genetic-analysis-submitted/genetic-analysis-submitted.command';
export * from './commands/genetic-analysis-in-progress/genetic-analysis-in-progress.command';
export * from './commands/genetic-analysis-rejected/genetic-analysis-rejected.command';
export * from './commands/genetic-analysis-result-ready/genetic-analysis-result-ready.command';

export const GeneticAnalysisCommandHandlers = [
  GeneticAnalysisSubmittedHandler,
  GeneticAnalysisInProgressHandler,
  GeneticAnalysisRejectedHandler,
  GeneticAnalysisResultReadyHandler,
];

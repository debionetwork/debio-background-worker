import { GeneticAnalysisOrderCreatedHandler } from './commands/genetic-analysis-order-created/genetic-analysis-order-created.handler';
import { GeneticAnalysisOrderCancelledHandler } from './commands/genetic-analysis-order-cancelled/genetic-analysis-order-cancelled.handler';
import { GeneticAnalysisOrderFailedHandler } from './commands/genetic-analysis-order-failed/genetic-analysis-order-failed.handler';
import { GeneticAnalysisOrderFulfilledHandler } from './commands/genetic-analysis-order-fulfilled/genetic-analysis-order-fulfilled.handler';
import { GeneticAnalysisOrderPaidHandler } from './commands/genetic-analysis-order-paid/genetic-analysis-order-paid.handler';
import { GeneticAnalysisOrderRefundedHandler } from './commands/genetic-analysis-order-refunded/genetic-analysis-order-refunded.handler';

export * from './commands/genetic-analysis-order-cancelled/genetic-analysis-order-cancelled.command';
export * from './commands/genetic-analysis-order-created/genetic-analysis-order-created.command';
export * from './commands/genetic-analysis-order-fulfilled/genetic-analysis-order-fulfilled.command';
export * from './commands/genetic-analysis-order-paid/genetic-analysis-order-paid.command';
export * from './commands/genetic-analysis-order-failed/genetic-analysis-order-failed.command';
export * from './commands/genetic-analysis-order-refunded/genetic-analysis-order-refunded.command';

export const GeneticAnalysisOrderCommandHandlers = [
  GeneticAnalysisOrderCreatedHandler,
  GeneticAnalysisOrderCancelledHandler,
  GeneticAnalysisOrderFailedHandler,
  GeneticAnalysisOrderFulfilledHandler,
  GeneticAnalysisOrderPaidHandler,
  GeneticAnalysisOrderRefundedHandler,
];

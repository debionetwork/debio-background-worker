import { GeneticAnalystsDeletedHandler } from './commands/genetic-analysts-deleted/genetic-analysts-deleted.handler';
import { GeneticAnalystsRegisteredHandler } from './commands/genetic-analysts-registered/genetic-analysts-registered.handler';
import { GeneticAnalystsStakeSuccessfulHandler } from './commands/genetic-analysts-stake-successful/genetic-analysts-stake-successful.handler';
import { GeneticAnalystsUpdateVerificationStatusHandler } from './commands/genetic-analysts-update-verification-status/genetic-analysts-update-verification-status.handler';
import { GeneticAnalystsUpdatedHandler } from './commands/genetic-analysts-updated/genetic-analysts-updated.handler';
import { GeneticAnalystsUpdateAvailabilityStatusHandler } from './commands/genetic-analysts-update-availability-status/genetic-analysts-update-availability-status.handler';
import { GeneticAnalystsRetrieveUnstakeAmountHandler } from './commands/genetic-analysts-retrieve-unstake-amount/genetic-analysts-retrieve-unstake-amount.handler';
import { GeneticAnalystUnstakeSuccessfulHandler } from './commands/genetic-analysts-unstake-successful/genetic-analysts-unstake-successful.handler';
import { GeneticAnalystVerificationFailedHandler } from './commands/genetic-analysts-verification-failed/genetic-analysts-verification-failed.handler';

export * from './commands/genetic-analysts-registered/genetic-analysts-registered.command';
export * from './commands/genetic-analysts-updated/genetic-analysts-updated.command';
export * from './commands/genetic-analysts-stake-successful/genetic-analysts-stake-successful.command';
export * from './commands/genetic-analysts-update-verification-status/genetic-analysts-update-verification-status.command';
export * from './commands/genetic-analysts-deleted/genetic-analysts-deleted.command';
export * from './commands/genetic-analysts-update-availability-status/genetic-analysts-update-availability-status.command';
export * from './commands/genetic-analysts-retrieve-unstake-amount/genetic-analysts-retrieve-unstake-amount.command';
export * from './commands/genetic-analysts-unstake-successful/genetic-analysts-unstake-successful.command';
export * from './commands/genetic-analysts-verification-failed/genetic-analysts-verification-failed.command';

export const GeneticAnalystsCommandHandlers = [
  GeneticAnalystsRegisteredHandler,
  GeneticAnalystsUpdatedHandler,
  GeneticAnalystsStakeSuccessfulHandler,
  GeneticAnalystsUpdateVerificationStatusHandler,
  GeneticAnalystsDeletedHandler,
  GeneticAnalystsUpdateAvailabilityStatusHandler,
  GeneticAnalystsRetrieveUnstakeAmountHandler,
  GeneticAnalystUnstakeSuccessfulHandler,
  GeneticAnalystVerificationFailedHandler,
];

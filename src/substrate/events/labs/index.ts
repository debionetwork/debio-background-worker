export * from './commands/lab-updated/lab-updated.command';
export * from './commands/lab-registered/lab-registered.command';
export * from './commands/lab-deregistered/lab-deregistered.command';
export * from './commands/lab-update-verification-status/lab-update-verification-status.command';
export * from './commands/lab-retrieve-unstake-amount/lab-retrieve-unstake-amount.command';
export * from './commands/lab-stake-successful/lab-stake-successful.command';
export * from './commands/lab-unstake-successful/lab-unstake-successful.command';

import { LabUpdatedHandler } from './commands/lab-updated/lab-updated.handler';
import { LabRegisteredHandler } from './commands/lab-registered/lab-registered.handler';
import { LabDeregisteredHandler } from './commands/lab-deregistered/lab-deregistered.handler';
import { LabUpdateVerificationStatusHandler } from './commands/lab-update-verification-status/lab-update-verification-status.handler';
import { LabRetrieveUnstakeAmountHandler } from './commands/lab-retrieve-unstake-amount/lab-retrieve-unstake-amount.handler';
import { LabStakeSuccessfulHandler } from './commands/lab-stake-successful/lab-stake-successful.handler';
import { LabUnstakeSuccessfulHandler } from './commands/lab-unstake-successful/lab-unstake-successful.handler';

export const LabCommandHandlers = [
  LabUpdatedHandler,
  LabRegisteredHandler,
  LabDeregisteredHandler,
  LabUpdateVerificationStatusHandler,
  LabRetrieveUnstakeAmountHandler,
  LabStakeSuccessfulHandler,
  LabUnstakeSuccessfulHandler,
];

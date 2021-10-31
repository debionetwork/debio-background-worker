export * from './commands/lab-updated/lab-updated.command';
export * from './commands/lab-registered/lab-registered.command';
export * from './commands/lab-deregistered/lab-deregistered.command';
export * from './commands/lab-update-verification-status/lab-update-verification-status.command';

import { LabUpdatedHandler } from './commands/lab-updated/lab-updated.handler';
import { LabRegisteredHandler } from './commands/lab-registered/lab-registered.handler';
import { LabDeregisteredHandler } from './commands/lab-deregistered/lab-deregistered.handler';
import { LabUpdateVerificationStatusHandler } from './commands/lab-update-verification-status/lab-update-verification-status.handler';

export const LabCommandHandlers = [
  LabUpdatedHandler,
  LabRegisteredHandler,
  LabDeregisteredHandler,
  LabUpdateVerificationStatusHandler,
];

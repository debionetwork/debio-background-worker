export * from './commands/certification-created/certification-created.command';
export * from './commands/certification-updated/certification-updated.command';
export * from './commands/certification-deleted/certification-deleted.command';

import { CertificationCreatedHandler } from './commands/certification-created/certification-created.handler';
import { CertificationDeletedHandler } from './commands/certification-deleted/certification-deleted.handler';
import { CertificationUpdatedHandler } from './commands/certification-updated/certification-updated.handler';

export const CertificationsCommandHandlers = [
  CertificationCreatedHandler,
  CertificationDeletedHandler,
  CertificationUpdatedHandler,
];

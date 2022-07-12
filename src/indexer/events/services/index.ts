export * from './commands/service-updated/service-updated.command';
export * from './commands/service-created/service-created.command';
export * from './commands/service-deleted/service-deleted.command';

import { ServiceUpdatedHandler } from './commands/service-updated/service-updated.handler';
import { ServiceCreatedHandler } from './commands/service-created/service-created.handler';
import { ServiceDeletedHandler } from './commands/service-deleted/service-deleted.handler';

export const ServiceCommandHandlers = [
  ServiceUpdatedHandler,
  ServiceCreatedHandler,
  ServiceDeletedHandler,
];

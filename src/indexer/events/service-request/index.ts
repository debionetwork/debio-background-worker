export * from './commands/create-service-request/create-service-request.command';
export * from './commands/update-service-request/update-service-request.command';

import { CreateServiceRequestHandler } from './commands/create-service-request/create-service-request.handler';
import { UpdateServiceRequestHandler } from './commands/update-service-request/update-service-request.handler';

export const RequestServiceCommandHandlers = [
  CreateServiceRequestHandler,
  UpdateServiceRequestHandler,
];

export * from './commands/create-service-request/create-service-request.command';
export * from './commands/request-claimed/request-claimed.command';

import { CreateServiceRequestHandler } from './commands/create-service-request/create-service-request.handler';
import { RequestClaimedHandler } from './commands/request-claimed/request-claimed.handler';

export const RequestServiceCommandHandlers = [CreateServiceRequestHandler];
export const RequestClaimedCommandHandlers = [RequestClaimedHandler];

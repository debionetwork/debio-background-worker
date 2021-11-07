export * from './commands/create-service-request/create-service-request.command';
export * from './commands/claimed-service-request/claimed-service-request.command';

import { CreateServiceRequestHandler } from './commands/create-service-request/create-service-request.handler';
import { ClaimedServiceRequestHandler } from './commands/claimed-service-request/claimed-service-request.handler';

export const RequestServiceCommandHandlers = [
    CreateServiceRequestHandler, 
    ClaimedServiceRequestHandler
];

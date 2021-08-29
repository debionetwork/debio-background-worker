export * from './commands/create-service-request/create-service-request.command';

import { CreateServiceRequestHandler } from './commands/create-service-request/create-service-request.handler';

export const RequestServiceCommandHandlers = [
    CreateServiceRequestHandler,
];

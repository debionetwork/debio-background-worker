export * from './commands/create-service-request/create-service-request.command';
export * from './commands/claimed-service-request/claimed-service-request.command';
export * from './commands/processed-service-request/processed-service-request.command';
export * from './commands/finalized-service-request/finalized-service-request.command';
export * from './commands/unstaked-service-request/unstaked-service-request.command';

import { CreateServiceRequestHandler } from './commands/create-service-request/create-service-request.handler';
import { ClaimedServiceRequestHandler } from './commands/claimed-service-request/claimed-service-request.handler';
import { ProcessedServiceRequestHandler } from './commands/processed-service-request/processed-service-request.handler';
import { FinalizedServiceRequestHandler } from './commands/finalized-service-request/finalized-service-request.handler';
import { UnstakedServiceRequestHandler } from './commands/unstaked-service-request/unstaked-service-request.handler';

export const RequestServiceCommandHandlers = [
  CreateServiceRequestHandler, 
  ClaimedServiceRequestHandler,
  ProcessedServiceRequestHandler,
  FinalizedServiceRequestHandler,
  UnstakedServiceRequestHandler
];

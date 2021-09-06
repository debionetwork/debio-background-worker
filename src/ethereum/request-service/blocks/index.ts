export * from './commands/set-last-request-service-block/set-last-request-service-block.command';
export * from './queries/get-last-request-service-block/get-last-request-service-block.query';

import { SetLastRequestServiceBlockHandler } from './commands/set-last-request-service-block/set-last-request-service-block.handler';
import { GetLastRequestServiceBlockHandler } from './queries/get-last-request-service-block/get-last-request-service-block.handler';

export const BlockCommandHandlers = [SetLastRequestServiceBlockHandler];
export const BlockQueryHandlers = [GetLastRequestServiceBlockHandler];

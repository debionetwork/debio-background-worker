export * from './commands/set-last-block.command';
export * from './commands/get-last-block.command';

import { SetLastBlockHandler } from './commands/set-last-block.handler';
import { GetLastBlockHandler } from './commands/get-last-block.handler';

export const BlockCommandHandlers = [SetLastBlockHandler, GetLastBlockHandler];

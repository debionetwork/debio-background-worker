export * from './commands/set-last-block/set-last-block.command';
export * from './queries/get-last-block/get-last-block.query';

import { SetLastBlockHandler } from './commands/set-last-block/set-last-block.handler';
import { GetLastBlockHandler } from './queries/get-last-block/get-last-block.handler';


export const BlockCommandHandlers = [
    SetLastBlockHandler
];
export const BlockQueryHandlers = [
    GetLastBlockHandler
];

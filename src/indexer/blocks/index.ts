export * from './commands/set-last-substrate-block/set-last-substrate-block.command';
export * from './queries/get-last-substrate-block/get-last-substrate-block.query';
export * from './commands/delete-all-indexes/delete-all-indexes.command';
export * from './commands/set-last-substrate-block-old/set-last-substrate-block-old.command';

import { SetLastSubstrateBlockHandler } from './commands/set-last-substrate-block/set-last-substrate-block.handler';
import { GetLastSubstrateBlockHandler } from './queries/get-last-substrate-block/get-last-substrate-block.handler';
import { DeleteAllIndexesHandler } from './commands/delete-all-indexes/delete-all-indexes.handler';
import { SetLastSubstrateBlockOldHandler } from './commands/set-last-substrate-block-old/set-last-substrate-block-old.handler';

export const BlockCommandHandlers = [
  SetLastSubstrateBlockHandler,
  DeleteAllIndexesHandler,
  SetLastSubstrateBlockOldHandler,
];

export const BlockQueryHandlers = [GetLastSubstrateBlockHandler];

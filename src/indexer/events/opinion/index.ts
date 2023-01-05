export * from './commands/opinion-added/opinion-added.command';
export * from './commands/opinion-removed/opinion-removed.command';
export * from './commands/opinion-status-updated/opinion-status-updated.command';
export * from './commands/opinion-updated/opinion-updated.command';

import { OpinionAddedHandler } from './commands/opinion-added/opinion-added.handler';
import { OpinionRemovedHandler } from './commands/opinion-removed/opinion-removed.handler';
import { OpinionStatusUpdatedHandler } from './commands/opinion-status-updated/opinion-status-updated.handler';
import { OpinionUpdatedHandler } from './commands/opinion-updated/opinion-updated.handler';

export const OpinionCommandHandlers = [
  OpinionAddedHandler,
  OpinionRemovedHandler,
  OpinionStatusUpdatedHandler,
  OpinionUpdatedHandler,
];

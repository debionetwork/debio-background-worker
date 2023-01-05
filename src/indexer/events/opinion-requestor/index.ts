export * from './commands/opinion-requested/opinion-requested.command';
export * from './commands/opinion-requestor-info-updated/opinion-requestor-info-updated.command';

import { OpinionRequestedHandler } from './commands/opinion-requested/opinion-requested.handler';
import { OpinionRequestorInfoUpdatedHandler } from './commands/opinion-requestor-info-updated/opinion-requestor-info-updated.handler';

export const OpinionRequestorCommandHandlers = [
  OpinionRequestedHandler,
  OpinionRequestorInfoUpdatedHandler,
];

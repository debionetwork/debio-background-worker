export * from './service-request-created/service-request-created.command';
export * from './service-request-processed/service-request-processed.command';
export * from './service-request-unstaked/service-request-unstaked.command';
export * from './service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.command';
export * from './service-request-excess/service-request-excess.command';
export * from './service-request-claimed/service-request-claimed.command';
export * from './service-request-staking-amount-refunded/service-request-staking-amount-refunded.command';
export * from './service-request-updated/service-request-updated.command';

import { ServiceRequestCreatedHandler } from './service-request-created/service-request-created.handler';
import { ServiceRequestProcessedHandler } from './service-request-processed/service-request-processed.handler';
import { ServiceRequestUnstakedHandler } from './service-request-unstaked/service-request-unstaked.handler';
import { ServiceRequestWaitingForUnstakedHandler } from './service-request-waiting-for-unstaked/service-request-waiting-for-unstaked.handler';
import { ServiceRequestStakingAmountExcessRefunded } from './service-request-excess/service-request-excess.handler';
import { ServiceRequestClaimedCommandHandler } from './service-request-claimed/service-request-claimed.handler';
import { ServiceRequestStakingAmountRefundedHandler } from './service-request-staking-amount-refunded/service-request-staking-amount-refunded.handler';
import { ServiceRequestUpdatedHandler } from './service-request-updated/service-request-updated.handler';

export const ServiceRequestCommandHandlers = [
  ServiceRequestCreatedHandler,
  ServiceRequestProcessedHandler,
  ServiceRequestUnstakedHandler,
  ServiceRequestWaitingForUnstakedHandler,
  ServiceRequestStakingAmountExcessRefunded,
  ServiceRequestClaimedCommandHandler,
  ServiceRequestStakingAmountRefundedHandler,
  ServiceRequestUpdatedHandler,
];

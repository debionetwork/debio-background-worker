export * from './service-request-created/service-request-created.command';
export * from './service-request-excess/service-request-excess.command';
export * from './service-request-staking-amount-refunded/service-request-staking-amount-refunded.command';
export * from './service-request-updated/service-request-updated.command';

import { ServiceRequestCreatedHandler } from './service-request-created/service-request-created.handler';
import { ServiceRequestStakingAmountExcessRefunded } from './service-request-excess/service-request-excess.handler';
import { ServiceRequestStakingAmountRefundedHandler } from './service-request-staking-amount-refunded/service-request-staking-amount-refunded.handler';
import { ServiceRequestUpdatedHandler } from './service-request-updated/service-request-updated.handler';

export const ServiceRequestCommandHandlers = [
  ServiceRequestCreatedHandler,
  ServiceRequestStakingAmountExcessRefunded,
  ServiceRequestStakingAmountRefundedHandler,
  ServiceRequestUpdatedHandler,
];

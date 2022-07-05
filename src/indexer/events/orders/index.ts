export * from './commands/order-created/order-created.command';
export * from './commands/order-paid/order-paid.command';
export * from './commands/order-fulfilled/order-fulfilled.command';
export * from './commands/order-refunded/order-refunded.command';
export * from './commands/order-cancelled/order-cancelled.command';
export * from './commands/order-failed/order-failed.command';

import { OrderCreatedHandler } from './commands/order-created/order-created.handler';
import { OrderPaidHandler } from './commands/order-paid/order-paid.handler';
import { OrderFulfilledHandler } from './commands/order-fulfilled/order-fulfilled.handler';
import { OrderRefundedHandler } from './commands/order-refunded/order-refunded.handler';
import { OrderCancelledHandler } from './commands/order-cancelled/order-cancelled.handler';
import { OrderFailedHandler } from './commands/order-failed/order-failed.handler';

export const OrderCommandHandlers = [
  OrderCreatedHandler,
  OrderPaidHandler,
  OrderFulfilledHandler,
  OrderRefundedHandler,
  OrderCancelledHandler,
  OrderFailedHandler,
];

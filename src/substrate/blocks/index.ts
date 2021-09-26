export * from './commands/set-last-substrate-block/set-last-substrate-block.command';
export * from './queries/get-last-substrate-block/get-last-substrate-block.query';
export * from './commands/delete-all-indexes/delete-all-indexes.command';
export * from './commands/cancel-order-block/cancel-order-block.command';
export * from './commands/create-order-block/create-order-block.command';
export * from './commands/failed-order-block/failed-order-block.command';
export * from './commands/fulfill-order-block/fulfill-order-block.command';
export * from './commands/paid-order-block/paid-order-block.command';
export * from './commands/refunded-order-block/refunded-order-block.command';
export * from './commands/create-service-block/create-service-block.command';
export * from './commands/delete-service-block/delete-service-block.command';
export * from './commands/update-service-block/update-service-block.command';
export * from './commands/deregister-lab-block/deregister-lab-block.command';
export * from './commands/register-lab-block/register-lab-block.command';
export * from './commands/update-lab-block/update-lab-block.command';

import { SetLastSubstrateBlockHandler } from './commands/set-last-substrate-block/set-last-substrate-block.handler';
import { GetLastSubstrateBlockHandler } from './queries/get-last-substrate-block/get-last-substrate-block.handler';
import { DeleteAllIndexesHandler } from './commands/delete-all-indexes/delete-all-indexes.handler';

import { CancelOrderBlockHandler } from './commands/cancel-order-block/cancel-order-block.handler';
import { CreateOrderBlockHandler } from './commands/create-order-block/create-order-block.handler';
import { FailedOrderBlockHandler } from './commands/failed-order-block/failed-order-block.handler';
import { FulfillOrderBlockHandler } from './commands/fulfill-order-block/fulfill-order-block.handler';
import { PaidOrderBlockHandler } from './commands/paid-order-block/paid-order-block.handler';
import { RefundedOrderBlockHandler } from './commands/refunded-order-block/refunded-order-block.handler';
import { CreateServiceBlockHandler } from './commands/create-service-block/create-service-block.handler';
import { DeleteServiceBlockHandler } from './commands/delete-service-block/delete-service-block.handler';
import { UpdateServiceBlockHandler } from './commands/update-service-block/update-service-block.handler';
import { DeregisterLabBlockHandler } from './commands/deregister-lab-block/deregister-lab-block.handler';
import { RegisterLabBlockHandler } from './commands/register-lab-block/register-lab-block.handler';
import { UpdateLabBlockHandler } from './commands/update-lab-block/update-lab-block.handler';

export const BlockCommandHandlers = [
  SetLastSubstrateBlockHandler,
  DeleteAllIndexesHandler,
	CancelOrderBlockHandler,
	CreateOrderBlockHandler,
	FailedOrderBlockHandler,
	FulfillOrderBlockHandler,
	PaidOrderBlockHandler,
	RefundedOrderBlockHandler,
	CreateServiceBlockHandler,
	DeleteServiceBlockHandler,
	UpdateServiceBlockHandler,
	DeregisterLabBlockHandler,
	RegisterLabBlockHandler,
	UpdateLabBlockHandler,
];

export const BlockQueryHandlers = [GetLastSubstrateBlockHandler];

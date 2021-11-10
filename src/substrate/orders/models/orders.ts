import { Price } from "src/substrate/services/models/price";
import { ServiceFlow } from "src/substrate/models/service-flow";
import { Currency } from "./currency";
import { OrderStatus } from "./order-status";

export class Orders {
	id: string;
	serviceId: string;
	customerId: string;
	customerBoxPublicKey: string;
	sellerId: string;
	dnaSampleTrackingId: string;
	currency: Currency;
	prices: Price[];
	additionalPrices: Price[];
	orderFlow: ServiceFlow;
	status: OrderStatus;
	createdAt: BigInt;
	updatedAt: BigInt;
}
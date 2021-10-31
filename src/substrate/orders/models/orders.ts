import { Price } from "src/substrate/services/models/price";
import { ServiceFlow } from "src/substrate/models/service-flow";
import { Currency } from "./currency";
import { OrderStatus } from "./order-status";

export class Orders {
	id: string;
	service_id: string;
	customer_id: string;
	customer_box_public_key: string;
	seller_id: string;
	dna_sample_tracking_id: string;
	currency: Currency;
	prices: Price[];
	additional_prices: Price[];
	order_flow: ServiceFlow;
	status: OrderStatus;
	created_at: BigInt;
	updated_at: BigInt;
}
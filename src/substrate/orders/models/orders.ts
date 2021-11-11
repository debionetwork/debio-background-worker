import { Price } from "src/substrate/services/models/price";
import { ServiceFlow } from "src/substrate/models/service-flow";
import { Currency } from "./currency";
import { OrderStatus } from "./order-status";

export class Orders {
	constructor(
		_id: any, 
		_serviceId: any, 
		_customerId: any, 
		_customerBoxPublicKey: any,
		_sellerId: any,
		_dnaSampleTrackingId: any,
		_currency: any,
		_prices: Array<any>,
		_additionalPrices: Array<any>,
		_status: any,
		_orderFlow: any,
		_createdAt: BigInt,
		_updatedAt: BigInt) {
			this.id = _id;
			this.serviceId = _serviceId;
			this.customerId = _customerId;
			this.customerBoxPublicKey = _customerBoxPublicKey;
			this.sellerId = _sellerId;
			this.dnaSampleTrackingId = _dnaSampleTrackingId;
			this.currency = _currency;

			for (let i = 0; i < _prices.length; i++) {
				const price: Price = new Price(_prices[i]["component"], _prices[i]["value"]);
				this.prices.push(price);
			}

			for (let i = 0; i < _additionalPrices.length; i++) {
				const price: Price = new Price(_prices[i]["component"], _prices[i]["value"]);
				this.additionalPrices.push(price);
			}

			this.orderFlow = _orderFlow;
			this.status = _status;
			this.createdAt = _createdAt.toString();
			this.updatedAt = _updatedAt.toString();
	}

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
	createdAt: string;
	updatedAt: string;
}
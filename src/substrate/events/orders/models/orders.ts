import { Price } from '../../services/models/price';
import { ServiceFlow } from '../../../models/service-flow';
import { Currency } from './currency';
import { OrderStatus } from './order-status';

export class Orders {
  constructor(order: any) {
    this.id = order.id;
    this.serviceId = order.serviceId;
    this.customerId = order.customerId;
    this.customerBoxPublicKey = order.customerBoxPublicKey;
    this.sellerId = order.sellerId;
    this.dnaSampleTrackingId = order.dnaSampleTrackingId;
    this.currency = order.currency;

    this.prices = [];

    const prices = order.prices;
    for (let i = 0; i < prices.length; i++) {
      const price: Price = new Price(prices[i]);
      this.prices.push(price);
    }

    this.additionalPrices = [];

    const additionalPrices = order.additionalPrices;
    for (let i = 0; i < additionalPrices.length; i++) {
      const price: Price = new Price(additionalPrices[i]);
      this.additionalPrices.push(price);
    }

    this.orderFlow = order.orderFlow;
    this.status = order.status;
    this.createdAt = order.createdAt;
    this.updatedAt = order.updatedAt;
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

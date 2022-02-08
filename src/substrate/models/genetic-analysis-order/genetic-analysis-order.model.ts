import { Price } from '../../events/services/models/price';
import { CurrencyType } from '../currencyType';
import { GeneticAnalysisOrderStatus } from './genetic-analysis-order.status';

export class GeneticAnalysisOrderModel {
  constructor(geneticAnalysisOrder: any) {
    this.id = geneticAnalysisOrder.id;
    this.service_id = geneticAnalysisOrder.serviceId;
    this.customer_id = geneticAnalysisOrder.customerId;
    this.customer_box_public_key = geneticAnalysisOrder.customerBoxPublicKey;
    this.seller_id = geneticAnalysisOrder.sellerId;
    this.genetic_analysis_tracking_id =
      geneticAnalysisOrder.geneticAnalysisTrackingId;
    this.currency = geneticAnalysisOrder.currency;

    this.prices = Array<Price>();

    const prices = geneticAnalysisOrder.prices;
    for (let i = 0; i < prices.length; i++) {
      const price: Price = new Price(prices[i]);
      this.prices.push(price);
    }

    this.additional_prices = Array<Price>();

    const additionalPrices = geneticAnalysisOrder.additionalPrices;
    for (let i = 0; i < additionalPrices.length; i++) {
      const additionalPrice = new Price(additionalPrices[i]);
      this.additional_prices.push(additionalPrice);
    }

    this.status = geneticAnalysisOrder.status;
    this.created_at = geneticAnalysisOrder.createdAt;
    this.updated_at = geneticAnalysisOrder.updatedAt;
  }

  public id: string;
  public service_id: string;
  public customer_id: string;
  public customer_box_public_key: string;
  public seller_id: string;
  public genetic_analysis_tracking_id: string;
  public currency: CurrencyType;
  public prices: Price[];
  public additional_prices: Price[];
  public status: GeneticAnalysisOrderStatus;
  public created_at: string;
  public updated_at: string;
}

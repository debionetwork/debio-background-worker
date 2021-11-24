import { Price } from './price';

export class PriceByCurrency {
  constructor(
    priceByCurrency: any
  ) {
    this.currency     = priceByCurrency.currency;
    this.total_price  = priceByCurrency.totalPrice.toString();

    this.price_components = [];

    const priceComponents: any = priceByCurrency.priceComponents;
    for (let i = 0; i < priceComponents.length; i++) {
      const price: Price = new Price(priceComponents[i]);
      this.price_components.push(price);
    }

    this.additional_prices = [];
    
    const additionalPrices: any = priceByCurrency.additionalPrices;
    for (let i = 0; i < additionalPrices.length; i++) {
      const price: Price = new Price(additionalPrices[i]);
      this.additional_prices.push(price);
    }
  }
  currency: string;
  total_price: string;
  price_components: Price[];
  additional_prices: Price[];
}

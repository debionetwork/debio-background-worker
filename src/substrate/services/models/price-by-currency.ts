import { Price } from './price';

export class PriceByCurrency {
  constructor(
    _currency: any,
    _totalPrice: any,
    _priceComponents: Array<any>,
    _additionalPrices: Array<any>
  ) {
    this.currency     = _currency;
    this.total_price  = _totalPrice.toString();

    this.price_components = [];

    for (let i = 0; i < _priceComponents.length; i++) {
      const price: Price = new Price(_priceComponents[i]["component"], _priceComponents[i]["value"]);
      this.price_components.push(price);
    }

    this.additional_prices = [];
    
    for (let i = 0; i < _additionalPrices.length; i++) {
      const price: Price = new Price(_additionalPrices[i]["component"], _additionalPrices[i]["value"]);
      this.additional_prices.push(price);
    }
  }
  currency: string;
  total_price: string;
  price_components: Price[];
  additional_prices: Price[];
}

import { Price } from './service/price';
import { CurrencyType } from './currencyType';

export class PricesByCurrency {
  constructor(priceByCurrency: any) {
    this.currency = priceByCurrency.currency;
    this.total_price = priceByCurrency.totalPrice;
    this.price_components = priceByCurrency.priceComponents;
    this.additional_prices = priceByCurrency.additionalPrices;
  }

  public currency: CurrencyType;
  public total_price: string;
  public price_components: Price[];
  public additional_prices: Price[];
}

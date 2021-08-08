import { Price } from "./price";

export class PriceByCurrency{
    currency: string;
    total_price: Number;
    price_components: Price[];
    additional_prices: Price[];
}
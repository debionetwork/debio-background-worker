import { ExpectedDuration } from '../expectedDuration';
import { PricesByCurrency } from '../pricesByCurrency';

export class GeneticAnalystsServicesInfo {
  constructor(info: any) {
    this.name = info.name;

    this.prices_by_currency = Array<PricesByCurrency>();

    const pricesByCurrency = info.pricesByCurrency || [];
    for (let i = 0; i < pricesByCurrency.length; i++) {
      const priceByCurrency: PricesByCurrency = new PricesByCurrency(
        pricesByCurrency[i],
      );
      this.prices_by_currency.push(priceByCurrency);
    }

    this.expected_duration = new ExpectedDuration(info.expectedDuration);
    this.description = info.description;
    this.test_result_sample = info.testResultSample;
  }

  public name: string;
  public prices_by_currency: PricesByCurrency[];
  public expected_duration: ExpectedDuration;
  public description: string;
  public test_result_sample: string;
}

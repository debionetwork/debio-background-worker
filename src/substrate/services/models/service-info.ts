import { PriceByCurrency } from './price-by-currency';

export class ServiceInfo {
  constructor(
    info: any
  ) {
    const decoder = new TextDecoder();

    this.prices_by_currency = [];
    
    const priceByCurrency: any = info.pricesByCurrency;
    for (let i = 0; i < priceByCurrency.length; i++) {
      const pbc: PriceByCurrency = new PriceByCurrency(priceByCurrency[i]);

      this.prices_by_currency.push(pbc);
    }   

    this.prices_by_currency     = info.pricesByCurrency;
    this.name                   = info.name;
    this.expected_duration      = info.expectedDuration;
    this.category               = info.category;
    this.description            = info.description;
    this.dna_collection_process = info.dnaCollectionProcess;
    this.test_result_sample     = info.testResultSample;
    this.long_description       = info.longDescription;
    this.image                  = info.image;
  }

  name: string;
  prices_by_currency: PriceByCurrency[];
  expected_duration: string;
  category: string;
  description: string;
  dna_collection_process?: string;
  test_result_sample: string;
  long_description?: string;
  image?: string;
}

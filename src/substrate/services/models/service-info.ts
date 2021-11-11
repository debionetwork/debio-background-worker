import { PriceByCurrency } from './price-by-currency';

export class ServiceInfo {
  constructor(
    _name: any,
    _pricesByCurrency: Array<any>,
    _expectedDuration: any,
    _category: any,
    _description: any,
    _dnaCollectionProcess: any,
    _testResultSample: any,
    _longDescription: any,
    _image: any
  ) {
    const decoder = new TextDecoder();

    this.name = decoder.decode(_name);

    this.prices_by_currency = [];
    
    for (let i = 0; i < _pricesByCurrency.length; i++) {
      const pbc: PriceByCurrency = new PriceByCurrency(
        _pricesByCurrency[i]["currency"],
        _pricesByCurrency[i]["totalPrice"],
        _pricesByCurrency[i]["priceComponents"],
        _pricesByCurrency[i]["additionalPrices"]
      );
      this.prices_by_currency.push(pbc);
    }

    this.expected_duration = _expectedDuration;
    this.category = decoder.decode(_category);
    this.description = decoder.decode(_description);
    this.dna_collection_process = decoder.decode(_dnaCollectionProcess);
    this.test_result_sample = decoder.decode(_testResultSample);
    this.long_description = _longDescription;
    this.image = decoder.decode(_image);
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

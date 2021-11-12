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

    this.name                   = decoder.decode(_name);
    this.expected_duration      = _expectedDuration;
    this.category               = decoder.decode(_category);
    this.description            = decoder.decode(_description);
    this.dna_collection_process = decoder.decode(_dnaCollectionProcess);
    this.test_result_sample     = decoder.decode(_testResultSample);
    this.long_description       = _longDescription instanceof Uint8Array ? decoder.decode(_longDescription) : null;
    this.image                  = _image instanceof Uint8Array ? decoder.decode(_image) : null;
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

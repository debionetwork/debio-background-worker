import { PriceByCurrency } from './price-by-currency';

export class ServiceInfo {
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

import { PriceByCurrency } from './price-by-currency';

export class ServiceInfo {
  name: string;
  pricesByCurrency: PriceByCurrency[];
  expectedDuration: string;
  category: string;
  description: string;
  dnaCollectionProcess?: string;
  testResultSample: string;
  longDescription?: string;
  image?: string;
}

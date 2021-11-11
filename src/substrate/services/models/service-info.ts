import { PriceByCurrency } from './price-by-currency';

export class ServiceInfo {
  name: Uint8Array;
  pricesByCurrency: PriceByCurrency[];
  expectedDuration: string;
  category: Uint8Array;
  description: Uint8Array;
  dnaCollectionProcess?: Uint8Array;
  testResultSample: Uint8Array;
  longDescription?: Uint8Array;
  image?: Uint8Array;
}

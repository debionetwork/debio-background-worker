export class ServicePrice {
  constructor(servicePrice: any) {
    this.assetId = servicePrice.assetId;
    this.testingPrice = servicePrice.testingPrice;
    this.qcPrice = servicePrice.qcPrice;
  }

  assetId: string;
  testingPrice: number;
  qcPrice: number;
}

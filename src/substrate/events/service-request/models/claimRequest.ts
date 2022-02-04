export class ClaimRequestModel {
  constructor(claimRequest: any) {
    this.requestHash = claimRequest.requestHash;
    this.labAddress = claimRequest.labAddress;
    this.serviceId = claimRequest.serviceId;
    this.testingPrice = claimRequest.testingPrice;
    this.qcPrice = claimRequest.qcPrice;
  }
  requestHash: string;
  labAddress: string;
  serviceId: string;
  testingPrice: string;
  qcPrice: string;
}

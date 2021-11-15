export class ClaimRequestModel {
  constructor(
    _requestHash: any,
    _labAddress: any,
    _serviceId: any,
    _testingPrice: any,
    _qcPrice: any) {
    this.requestHash  = _requestHash;
    this.labAddress   = _labAddress;
    this.serviceId    = _serviceId;
    this.testingPrice = _testingPrice.toString();
    this.qcPrice      = _qcPrice.toString();
  }
  requestHash: string;
  labAddress: string;
  serviceId: string;
  testingPrice: string;
  qcPrice: string;
}

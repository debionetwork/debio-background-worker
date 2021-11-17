export class ServiceInvoice {
  constructor(
    _requestHash: any,
    _orderId: any,
    _serviceId: any,
    _customerAddress: any,
    _sellerAddress: any,
    _dnaSampleTrackingId: any,
    _testingPrice: any,
    _qcPrice: any,
    _payAmount: any) {
    this.requestHash          = _requestHash;
    this.orderId              = _orderId;
    this.serviceId            = _serviceId;
    this.customerAddress      = _customerAddress;
    this.sellerAddress        = _sellerAddress;
    this.dnaSampleTrackingId  = _dnaSampleTrackingId;
    this.testingPrice         = _testingPrice.toString();
    this.qcPrice              = _qcPrice.toString();
    this.payAmount            = _payAmount.toString();
  }

  requestHash: string;
  orderId: string;
  serviceId: string;
  customerAddress: string;
  sellerAddress: string;
  dnaSampleTrackingId: string;
  testingPrice: string;
  qcPrice: string;
  payAmount: string;
}
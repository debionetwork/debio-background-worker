export class ServiceInvoice {
  constructor(
    serviceInvoice: any
  ) {
    this.requestHash          = serviceInvoice.requestHash;
    this.orderId              = serviceInvoice.orderId;
    this.serviceId            = serviceInvoice.serviceId;
    this.customerAddress      = serviceInvoice.customerAddress;
    this.sellerAddress        = serviceInvoice.sellerAddress;
    this.dnaSampleTrackingId  = serviceInvoice.dnaSampleTrackingId;
    this.testingPrice         = serviceInvoice.testingPrice;
    this.qcPrice              = serviceInvoice.qcPrice;
    this.payAmount            = serviceInvoice.payAmount;
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
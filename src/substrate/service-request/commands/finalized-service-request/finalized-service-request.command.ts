import { BlockMetadata } from "../../models/blockMetadata";
import { ServiceInvoice } from "../../models/serviceInvoice";

export class FinalizedServiceRequestCommand {
  serviceInvoice: ServiceInvoice;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetadata) {
    const serviceInvoiceData = args[1];
    this.serviceInvoice = new ServiceInvoice(
      serviceInvoiceData['requestHash'],
      serviceInvoiceData['orderId'],
      serviceInvoiceData['serviceId'],
      serviceInvoiceData['customerAddress'],
      serviceInvoiceData['sellerAddress'],
      serviceInvoiceData['dnaSampleTrackingId'],
      serviceInvoiceData['testingPrice'],
      serviceInvoiceData['qcPrice'],
      serviceInvoiceData['payAmount']
    );
  }
}
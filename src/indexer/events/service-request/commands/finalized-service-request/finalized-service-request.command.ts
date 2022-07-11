import { BlockMetaData } from '../../../../models/block-meta-data';
import { ServiceInvoice } from '../../../../models/service-request/service-invoice';

export class FinalizedServiceRequestCommand {
  serviceInvoice: ServiceInvoice;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const serviceInvoiceData = args[1];
    this.serviceInvoice = new ServiceInvoice(serviceInvoiceData.toHuman());
  }
}

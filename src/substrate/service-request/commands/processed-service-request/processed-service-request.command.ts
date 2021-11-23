import { BlockMetadata } from "../../models/blockMetadata";
import { ServiceInvoice } from "../../models/serviceInvoice";

export class ProcessedServiceRequestCommand {
  serviceInvoice: ServiceInvoice;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetadata) {
    const serviceInvoiceData = args[1];
    this.serviceInvoice = new ServiceInvoice(serviceInvoiceData.toHuman());
  }
}
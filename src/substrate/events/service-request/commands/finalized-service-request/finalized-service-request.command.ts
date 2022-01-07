import { BlockMetaData } from '../../../../models/blockMetaData';
import { ServiceInvoice } from "../../models/serviceInvoice";

export class FinalizedServiceRequestCommand {
  serviceInvoice: ServiceInvoice;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const serviceInvoiceData = args[1];
    this.serviceInvoice = new ServiceInvoice(serviceInvoiceData.toHuman());
  }
}
import { BlockMetadata } from "../../models/blockMetadata";
import { ServiceInvoice } from "../../models/serviceInvoice";

export class FinalizedServiceRequestCommand {
  serviceInvoice: ServiceInvoice;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetadata) {
    this.serviceInvoice = new ServiceInvoice(
      args[1]['requestHash'],
      args[1]['orderId'],
      args[1]['serviceId'],
      args[1]['customerAddress'],
      args[1]['sellerAddress'],
      args[1]['dnaSampleTrackingId'],
      args[1]['testingPrice'],
      args[1]['qcPrice'],
      args[1]['payAmount']
    );
  }
}
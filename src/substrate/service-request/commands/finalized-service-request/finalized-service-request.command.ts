import { BlockMetadata } from "../../models/blockMetadata";
import { ServiceInvoice } from "../../models/serviceInvoice";

export class FinalizedServiceRequestCommand {
  request: ServiceInvoice;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetadata) {
    this.request = args[1];
  }
}
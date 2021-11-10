import { BlockMetadata } from "../../models/blockMetadata";

export class RefundedServiceRequestCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetadata) {
    
  }
}
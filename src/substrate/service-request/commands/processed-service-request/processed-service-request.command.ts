import { BlockMetadata } from "../../models/blockMetadata";

export class ProcessedServiceRequestCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetadata) {
    
  }
}
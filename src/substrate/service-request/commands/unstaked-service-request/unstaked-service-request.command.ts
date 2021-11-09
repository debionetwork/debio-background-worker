import { BlockMetadata } from "../../models/blockMetadata";

export class UnstakedServiceRequestCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetadata) {
    
  }
}
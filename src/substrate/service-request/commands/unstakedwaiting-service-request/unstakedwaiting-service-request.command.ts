import { BlockMetadata } from "../../models/blockMetadata";

export class UnstakedWaitingServiceRequestCommand {
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetadata) {
    
  }
}
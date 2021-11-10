import { BlockMetadata } from "../../models/blockMetadata";
import { ClaimRequestModel } from "../../models/claimRequest";

export class ClaimedWaitingServiceRequestCommand {
  request: ClaimRequestModel;
  blockMetadata: BlockMetadata;
  constructor(args: Array<any>, blockMetadata: BlockMetadata) {
    this.request = args[1];
    this.blockMetadata = blockMetadata;
  }
}
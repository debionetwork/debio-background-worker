import { BlockMetaData } from "../../../../models/blockMetaData";
import { ClaimRequestModel } from "../../models/claimRequest";

export class ClaimedWaitingServiceRequestCommand {
  request: ClaimRequestModel;
  blockMetadata: BlockMetaData;
  constructor(args: Array<any>, blockMetadata: BlockMetaData) {
    this.request = args[1];
    this.blockMetadata = blockMetadata;
  }
}
import { BlockMetadata } from "../../models/blockMetadata";
import { ClaimRequestModel } from "../../models/claimRequest";

export class RequestClaimedCommand {
    request: ClaimRequestModel;
    blockMetadata: BlockMetadata;
    constructor(args: Array<unknown>, blockMetadata: BlockMetadata) {
      this.request = new ClaimRequestModel(args);
      this.blockMetadata = blockMetadata;
    }
}
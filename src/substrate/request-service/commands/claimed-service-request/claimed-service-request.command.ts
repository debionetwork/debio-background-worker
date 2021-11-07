import { BlockMetadata } from "../../models/blockMetadata";
import { ClaimRequestModel } from "../../models/claimRequest";

export class ClaimedServiceRequestCommand {
    request: ClaimRequestModel;
    blockMetadata: BlockMetadata;
    constructor(args: Array<any>, blockMetadata: BlockMetadata) {
      this.request = args[0];
      this.blockMetadata = blockMetadata;
    }
}
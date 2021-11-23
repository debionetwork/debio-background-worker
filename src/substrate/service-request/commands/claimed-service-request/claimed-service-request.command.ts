import { BlockMetadata } from "../../models/blockMetadata";
import { ClaimRequestModel } from "../../models/claimRequest";

export class ClaimedServiceRequestCommand {
    claimRequest: ClaimRequestModel;
    constructor(args: Array<any>, public readonly blockMetadata: BlockMetadata) {
      const claimRequestData = args[1];
      this.claimRequest = new ClaimRequestModel(
        claimRequestData["requestHash"],
        claimRequestData["labAddress"],
        claimRequestData["serviceId"],
        claimRequestData["testingPrice"],
        claimRequestData["qcPrice"]
      );
    }
}
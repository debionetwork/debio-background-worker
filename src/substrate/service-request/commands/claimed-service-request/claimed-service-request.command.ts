import { BlockMetadata } from "../../models/blockMetadata";
import { ClaimRequestModel } from "../../models/claimRequest";

export class ClaimedServiceRequestCommand {
    request: ClaimRequestModel;
    constructor(args: Array<any>, public readonly blockMetadata: BlockMetadata) {
      this.request = new ClaimRequestModel(
        args[1]["requestHash"],
        args[1]["labAddress"],
        args[1]["serviceId"],
        args[1]["testingPrice"],
        args[1]["qcPrice"]
      );
    }
}
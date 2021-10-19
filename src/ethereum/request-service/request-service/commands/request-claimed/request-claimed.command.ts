import { BlockMetadata } from "../../models/blockMetadata";
import { RequestModel } from "../../models/request";

export class RequestClaimedCommand {
    request: RequestModel;
    blockMetadata: BlockMetadata;
    constructor(args: Array<unknown>, blockMetadata: BlockMetadata) {
      this.request = new RequestModel(args);
      this.blockMetadata = blockMetadata;
    }
}
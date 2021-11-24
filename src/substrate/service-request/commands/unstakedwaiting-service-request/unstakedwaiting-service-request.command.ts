import { BlockMetadata } from "../../models/blockMetadata";
import { RequestModel } from "../../models/request";

export class UnstakedWaitingServiceRequestCommand {
  request: RequestModel;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetadata) {
    const requestData = args[1];
    this.request = new RequestModel(requestData.toHuman());
  }
}
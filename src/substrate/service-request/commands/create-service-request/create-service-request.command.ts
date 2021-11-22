import { BlockMetadata } from '../../models/blockMetadata';
import { RequestModel } from '../../models/request';

export class CreateServiceRequestCommand {
  request: RequestModel;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetadata) {
    const requestData = args[1];
    this.request = new RequestModel(
      requestData["hash_"],
      requestData["requesterAddress"],
      requestData["labAddress"],
      requestData["country"],
      requestData["region"],
      requestData["city"],
      requestData["serviceCategory"],
      requestData["stakingAmount"],
      requestData["status"],
      requestData["createdAt"],
      requestData["updatedAt"],
      requestData["unstakedAt"]
    );
  }
}

import { BlockMetadata } from '../../models/blockMetadata';
import { RequestModel } from '../../models/request';

export class CreateServiceRequestCommand {
  request: RequestModel;
  blockMetadata: BlockMetadata;
  constructor(args: Array<any>, blockMetadata: BlockMetadata) {
    this.request = new RequestModel(
      args[1]["hash_"],
      args[1]["requesterAddress"],
      args[1]["labAddress"],
      args[1]["country"],
      args[1]["region"],
      args[1]["city"],
      args[1]["serviceCategory"],
      args[1]["stakingAmount"],
      args[1]["status"],
      args[1]["unstakedAt"]
    );
    this.blockMetadata = blockMetadata;
  }
}

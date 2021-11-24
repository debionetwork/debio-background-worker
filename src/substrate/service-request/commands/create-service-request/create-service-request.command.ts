import { BlockMetadata } from '../../models/blockMetadata';
import { RequestModel } from '../../models/request';

export class CreateServiceRequestCommand {
  request: RequestModel;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetadata) {
    const requestData = args[1];
    this.request = new RequestModel(requestData.toHuman());
  }
}

import { BlockMetaData } from '../../../../models/block-meta-data';
import { RequestModel } from '../../../../models/service-request/request';

export class CreateServiceRequestCommand {
  request: RequestModel;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const requestData = args[1];
    this.request = new RequestModel(requestData.toHuman());
  }
}

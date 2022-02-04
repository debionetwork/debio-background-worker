import { BlockMetaData } from '../../../../models/blockMetaData';
import { RequestModel } from '../../models/request';

export class CreateServiceRequestCommand {
  request: RequestModel;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const requestData = args[1];
    this.request = new RequestModel(requestData.toHuman());
  }
}

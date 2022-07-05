import { BlockMetaData } from '../../../../models/blockMetaData';
import { RequestModel } from '../../../../models/service-request/request';

export class UnstakedServiceRequestCommand {
  request: RequestModel;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const requestData = args[1];
    this.request = new RequestModel(requestData.toHuman());
  }
}

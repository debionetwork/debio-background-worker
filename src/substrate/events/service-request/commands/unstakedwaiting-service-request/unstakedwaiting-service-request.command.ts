import { BlockMetaData } from '../../../../models/blockMetaData';
import { RequestModel } from '../../models/request';

export class UnstakedWaitingServiceRequestCommand {
  request: RequestModel;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const requestData = args[1];
    this.request = new RequestModel(requestData.toHuman());
  }
}

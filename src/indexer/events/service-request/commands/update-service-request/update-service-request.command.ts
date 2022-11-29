import { UpdateServiceRequest } from '../../../../models/service-request/update-service-request';
import { BlockMetaData } from '../../../../models/block-meta-data';
import { RequestModel } from '@indexer/models/service-request/request';

export class UpdateServiceRequestCommandIndexer {
  updateServiceRequest: UpdateServiceRequest;
  request: RequestModel;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const hash = args[0].toString();
    const status = args[1].toString();
    const requestData = args[2].toHuman();
    this.request = new RequestModel(requestData);
    this.updateServiceRequest = new UpdateServiceRequest(hash, status);
  }
}

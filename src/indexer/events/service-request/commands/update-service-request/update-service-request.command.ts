import { UpdateServiceRequest } from '../../../../models/service-request/update-service-request';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class UpdateServiceRequestCommandIndexer {
  updateServiceRequest: UpdateServiceRequest;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const requestId = args[1].toString();
    const status = args[2].toString();
    this.updateServiceRequest = new UpdateServiceRequest(requestId, status);
  }
}

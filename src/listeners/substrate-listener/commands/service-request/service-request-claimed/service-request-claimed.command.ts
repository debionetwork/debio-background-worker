import { BlockMetaData } from '../../../models/block-metadata.event-model';
import { ClaimRequestModel } from '../../../../../indexer/models/service-request/claim-request';

export class ServiceRequestClaimedCommand {
  request: ClaimRequestModel;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const requestData = args[1];
    this.request = new ClaimRequestModel(requestData.toHuman());
  }
}

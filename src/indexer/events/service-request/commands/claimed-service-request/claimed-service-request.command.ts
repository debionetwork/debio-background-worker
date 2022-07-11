import { BlockMetaData } from '../../../../models/block-meta-data';
import { ClaimRequestModel } from '../../../../models/service-request/claim-request';

export class ClaimedServiceRequestCommand {
  claimRequest: ClaimRequestModel;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const claimRequestData = args[1];
    this.claimRequest = new ClaimRequestModel(claimRequestData.toHuman());
  }
}

import { BlockMetaData } from '../../../../models/blockMetaData';
import { ClaimRequestModel } from '../../models/claimRequest';

export class ClaimedServiceRequestCommand {
  claimRequest: ClaimRequestModel;
  constructor(args: Array<any>, public readonly blockMetadata: BlockMetaData) {
    const claimRequestData = args[1];
    this.claimRequest = new ClaimRequestModel(claimRequestData.toHuman());
  }
}

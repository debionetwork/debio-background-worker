import { RequestStatus } from '@debionetwork/polkadot-provider';
import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class ServiceRequestUpdatedCommand {
  requestId: string;
  status: RequestStatus;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.requestId = args[1].toString();
    this.status = args[2].toString();
  }
}

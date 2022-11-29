import { RequestStatus } from '@debionetwork/polkadot-provider';
import { BlockMetaData } from '../../../models/block-metadata.event-model';

export class ServiceRequestUpdatedCommand {
  hash: string;
  status: RequestStatus;
  constructor(args: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.hash = args[0].toString();
    this.status = args[1].toString();
  }
}

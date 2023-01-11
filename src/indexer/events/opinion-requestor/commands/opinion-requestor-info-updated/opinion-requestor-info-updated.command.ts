import { RequestorInfo } from '@indexer/models/opinion-requestor';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class OpinionRequestorInfoUpdatedCommandIndexer {
  accountId: string;
  requestorInfo: RequestorInfo;
  requestorId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.requestorInfo = new RequestorInfo(data[1].toHuman());
    this.requestorId = data[2].toString();
  }
}

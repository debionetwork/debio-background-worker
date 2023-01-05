import { BlockMetaData } from '../../../../models/block-meta-data';

export class OpinionStatusUpdatedCommandIndexer {
  accountId: string;
  hash: string;
  status: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.hash = data[1].toString();
    this.status = data[2].toString();
  }
}

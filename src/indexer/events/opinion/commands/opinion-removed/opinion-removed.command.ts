import { BlockMetaData } from '../../../../models/block-meta-data';

export class OpinionRemovedCommandIndexer {
  accountId: string;
  hash: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.hash = data[1].toString();
  }
}

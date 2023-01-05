import { BlockMetaData } from '../../../../models/block-meta-data';
import { Opinion } from '@indexer/models/opinion';

export class OpinionUpdatedCommandIndexer {
  accountId: string;
  opinion: Opinion;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.opinion = new Opinion(data[1].toHuman());
  }
}

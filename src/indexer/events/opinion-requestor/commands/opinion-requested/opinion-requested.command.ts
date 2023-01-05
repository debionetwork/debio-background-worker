import { BlockMetaData } from '../../../../models/block-meta-data';
import { OpinionRequestor } from '@indexer/models/opinion-requestor';

export class OpinionRequestedCommandIndexer {
  accountId: string;
  opinionRequestor: OpinionRequestor;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.opinionRequestor = new OpinionRequestor(data[1].toHuman());
  }
}

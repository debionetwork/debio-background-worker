import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalStakedCommandIndexer {
  balance: string;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.balance = data[1].toString();
  }
}

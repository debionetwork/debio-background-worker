import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalUnstakedCommandIndexer {
  balance: string;
  status: string;
  moment: string;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.balance = data[1].toString();
    this.status = data[2].toString();
    this.moment = data[3].toString();
  }
}

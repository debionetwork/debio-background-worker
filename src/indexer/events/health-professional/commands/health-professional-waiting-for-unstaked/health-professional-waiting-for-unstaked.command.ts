import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalWaitingForUnstakedCommandIndexer {
  status: string;
  moment: string;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.status = data[1].toString();
    this.moment = data[2].toString();
  }
}

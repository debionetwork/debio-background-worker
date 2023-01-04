import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalUnstakedCommandIndexer {
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
  }
}

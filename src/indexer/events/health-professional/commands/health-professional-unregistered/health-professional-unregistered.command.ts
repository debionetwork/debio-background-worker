import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalUnregisteredCommandIndexer {
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
  }
}

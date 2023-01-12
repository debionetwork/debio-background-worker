import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalQualificationDeletedCommandIndexer {
  id: string;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.id = data[1].toString();
  }
}

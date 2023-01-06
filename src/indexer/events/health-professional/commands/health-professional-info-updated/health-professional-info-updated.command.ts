import { HealthProfessionalInfo } from '@indexer/models/health-professional/info';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalInfoUpdatedCommandIndexer {
  healthProfessionalInfo: HealthProfessionalInfo;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.healthProfessionalInfo = new HealthProfessionalInfo(data[1].toHuman());
  }
}

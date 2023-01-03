import { HealthProfessional } from '@indexer/models/health-professional';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalStakedCommandIndexer {
  healthProfessional: HealthProfessional;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.healthProfessional = new HealthProfessional(data[1]);
  }
}

import { HealthProfessionalQualification } from '@indexer/models/health-professional-qualification';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalQualificationUpdatedCommandIndexer {
  healthProfessionalQualification: HealthProfessionalQualification;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.healthProfessionalQualification = new HealthProfessionalQualification(
      data[1].toHuman(),
    );
  }
}

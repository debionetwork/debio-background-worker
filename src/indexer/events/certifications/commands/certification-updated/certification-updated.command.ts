import { BlockMetaData } from '../../../../models/block-meta-data';
import { Certification } from '../../../../models/certification/certification';

export class CertificationUpdatedCommandIndexer {
  certification: Certification;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    const certificationData = data[0];
    this.certification = new Certification(certificationData.toHuman());
  }
}

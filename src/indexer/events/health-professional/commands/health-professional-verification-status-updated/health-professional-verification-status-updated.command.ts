import { VerificationStatus } from '@indexer/models/verification-status';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalVerificationStatusCommandIndexer {
  verificationStatus: VerificationStatus;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.verificationStatus = data[1].toString() as VerificationStatus;
  }
}

import { AvailabilityStatus } from '@indexer/models/availability-status';
import { BlockMetaData } from '../../../../models/block-meta-data';

export class HealthProfessionalAvailabilityStatusCommandIndexer {
  availabilityStatus: AvailabilityStatus;
  accountId: string;
  constructor(data: Array<any>, public readonly blockMetaData: BlockMetaData) {
    this.accountId = data[0].toString();
    this.availabilityStatus = data[1].toString() as AvailabilityStatus;
  }
}

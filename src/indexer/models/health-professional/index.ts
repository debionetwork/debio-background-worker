import { AvailabilityStatus } from '../availability-status';
import { StakeStatus } from '../stake-status';
import { VerificationStatus } from '../verification-status';
import { HealthProfessionalInfo } from './info';

export class HealthProfessional {
  constructor(data: any) {
    this.account_id = data.account_id;
    this.qualifications = data.qualifications;
    this.info = new HealthProfessionalInfo(data.info);
    this.stake_amount = data.stake_amount;
    this.stake_status = data.stake_status;
    this.verification_status = data.verification_status;
    this.availability_status = data.availability_status;
    this.unstaked_at = data.unstaked_at
      ? new Date(Number((data.unstaked_at as string).split(',').join('')))
      : null;
  }

  account_id: string;
  qualifications: string;
  info: HealthProfessionalInfo;
  stake_amount: string;
  stake_status: StakeStatus;
  verification_status: VerificationStatus;
  availability_status: AvailabilityStatus;
  unstaked_at: Date;
}

import { AvailabilityStatus } from '../availability-status';
import { StakeStatus } from '../stake-status';
import { VerificationStatus } from '../verification-status';
import { HealthProfessionalInfo } from './info';

export class HealthProfessional {
  constructor(data: any) {
    this.account_id = data.accountId;
    this.qualifications = data.qualifications;
    this.info = new HealthProfessionalInfo(data.info);
    this.stake_amount = data.stakeAmount;
    this.stake_status = data.stakeStatus;
    this.verification_status = data.verificationStatus;
    this.availability_status = data.availabilityStatus;
    this.unstaked_at = data.unstakedAt
      ? Number((data.unstaked_at as string).split(',').join(''))
      : null;
  }

  account_id: string;
  qualifications: string[];
  info: HealthProfessionalInfo;
  stake_amount: string;
  stake_status: StakeStatus;
  verification_status: VerificationStatus;
  availability_status: AvailabilityStatus;
  unstaked_at: number;
}

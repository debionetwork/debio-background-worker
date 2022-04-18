import { StakeStatus } from '../../models/stake-status';
import { LabInfo } from '../../models/lab/lab-info';
import { LabVerificationStatus } from '../../models/lab/lab-verification-status';

export class Lab {
  constructor(lab: any) {
    this.accountId = lab.accountId;
    this.services = lab.services;
    this.certifications = lab.certifications;
    this.verificationStatus = lab.verificationStatus;
    this.info = new LabInfo(lab.info);
    this.stake_amount = lab.stakeAmount;
    this.stake_status = lab.stakeStatus;
    this.unstake_at = lab.unstakeAt;
    this.retrieve_unstake_at = lab.retrieveUnstakeAt;
  }
  accountId: string;
  services: string[];
  certifications: string[];
  verificationStatus: LabVerificationStatus;
  info: LabInfo;
  stake_amount: string;
  stake_status: StakeStatus;
  unstake_at: string;
  retrieve_unstake_at: string;
}

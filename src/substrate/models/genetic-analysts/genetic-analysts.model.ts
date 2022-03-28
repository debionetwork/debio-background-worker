import { AvailabilityStatus } from '../availabilityStatus';
import { StakeStatus } from '../stake-status';
import { VerificationStatus } from '../verificationStatus';
import { GeneticAnalystsInfo } from './genetic-analysts.info';

export class GeneticAnalystsModel {
  constructor(geneticAnalysts: any) {
    this.account_id = geneticAnalysts.accountId;
    this.services = geneticAnalysts.services;
    this.qualifications = geneticAnalysts.qualifications;
    this.info = new GeneticAnalystsInfo(geneticAnalysts.info);
    this.stake_amount = geneticAnalysts.stakeAmount;
    this.stake_status = geneticAnalysts.stakeStatus;
    this.verification_status = geneticAnalysts.verificationStatus;
    this.availability_status = geneticAnalysts.availabilityStatus;
    this.availability_status = geneticAnalysts.availabilityStatus;
    this.unstake_at = geneticAnalysts.unstakeAt;
    this.retrieve_unstake_at = geneticAnalysts.retrieveUnstakeAt;
  }

  public account_id: string;
  public services: string[];
  public qualifications: string[];
  public info: GeneticAnalystsInfo;
  public stake_amount: BigInt;
  public stake_status: StakeStatus;
  public verification_status: VerificationStatus;
  public availability_status: AvailabilityStatus;
  public unstake_at: string;
  public retrieve_unstake_at: string;
}

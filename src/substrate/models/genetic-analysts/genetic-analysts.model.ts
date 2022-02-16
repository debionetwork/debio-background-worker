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
  }

  public account_id: string;
  public services: string[];
  public qualifications: string[];
  public info: GeneticAnalystsInfo;
  public stake_amount: BigInt;
  public stake_status: StakeStatus;
  public verification_status: VerificationStatus;
}

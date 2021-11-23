import { LabInfo } from './lab-info';
import { LabVerificationStatus } from './lab-verification-status';

export class Lab {
  constructor(lab: any) {
    this.accountId = lab.accountId;
    this.services = lab.services;
    this.certifications = lab.certifications;
    this.verificationStatus = lab.verificationStatus;
    this.info = new LabInfo(lab.info);
  }
  accountId: string;
  services: string[];
  certifications: string[];
  verificationStatus: LabVerificationStatus;
  info: LabInfo;
}

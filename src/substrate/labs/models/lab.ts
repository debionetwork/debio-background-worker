import { LabInfo } from './lab-info';
import { LabVerificationStatus } from './lab-verification-status';

export class Lab {
  constructor(
    _accountId: any, 
    _services: Array<any>, 
    _certifications: Array<any>, 
    _verificationStatus: any,
    _info: any) {
      this.accountId          = _accountId;
      this.services           = _services;
      this.verificationStatus = _verificationStatus;
      
      this.info = new LabInfo(
        _info["boxPublicKey"],
        _info["name"],
        _info["email"],
        _info["phoneNumber"],
        _info["website"],
        _info["country"],
        _info["region"],
        _info["city"],
        _info["address"],
        _info["latitude"],
        _info["longitude"],
        _info["profileImage"]
      );
  }
  accountId: string;
  services: string[];
  certifications: string[];
  verificationStatus: LabVerificationStatus;
  info: LabInfo;
}

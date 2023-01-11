import { QualificationInfo } from './info';

export class HealthProfessionalQualification {
  constructor(data: any) {
    this.id = data.id;
    this.owner = data.owner;
    this.info = new QualificationInfo(data.info);
  }

  id: string;
  owner: string;
  info: QualificationInfo;
}

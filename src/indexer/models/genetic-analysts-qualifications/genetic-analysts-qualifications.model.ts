import { GeneticAnalystsQualificationInfo } from './genetic-analysts-qualifications.info';

export class GeneticAnalystsQualificationModel {
  constructor(geneticAnalystsQualification: any) {
    this.id = geneticAnalystsQualification.id;
    this.owner_id = geneticAnalystsQualification.ownerId;
    this.info = new GeneticAnalystsQualificationInfo(
      geneticAnalystsQualification.info,
    );
  }

  public id: string;
  public owner_id: string;
  public info: GeneticAnalystsQualificationInfo;
}

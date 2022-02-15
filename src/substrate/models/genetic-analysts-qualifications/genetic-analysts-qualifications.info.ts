import { GeneticAnalystsQualificationsCertification } from './genetic-analysts-qualifications.certificate';
import { GeneticAnalystsQualificationExperience } from './genetic-analysts-qualifications.experience';

export class GeneticAnalystsQualificationInfo {
  constructor(info: any) {
    this.experience = info.experience;
    this.certification = info.certification;
  }

  public experience: GeneticAnalystsQualificationExperience[];
  public certification: GeneticAnalystsQualificationsCertification[];
}

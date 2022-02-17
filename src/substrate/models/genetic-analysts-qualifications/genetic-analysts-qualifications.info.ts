import { GeneticAnalystsQualificationsCertification } from './genetic-analysts-qualifications.certificate';
import { GeneticAnalystsQualificationExperience } from './genetic-analysts-qualifications.experience';

export class GeneticAnalystsQualificationInfo {
  constructor(info: any) {
    this.experience = Array<GeneticAnalystsQualificationExperience>();
    
    const experiences = info.experience || [];
    for (let i = 0; i < experiences.length; i++) {
      const experience: GeneticAnalystsQualificationExperience =
        new GeneticAnalystsQualificationExperience(experiences[i]);
      this.experience.push(experience);
    }

    this.certification = info.certification;

    const certifications = info.certification || [];
    for (let i = 0; i < certifications.length; i++) {
      const certification: GeneticAnalystsQualificationsCertification =
        new GeneticAnalystsQualificationsCertification(certifications[i]);
      this.certification.push(certification);
    }
  }

  public experience: GeneticAnalystsQualificationExperience[];
  public certification: GeneticAnalystsQualificationsCertification[];
}

export class QualificationInfo {
  constructor(data: any) {
    this.experiences = [];
    this.certifications = [];

    for (const experience of data.experiences) {
      this.experiences.push(new Experience(experience));
    }

    for (const certification of data.certifications) {
      this.certifications.push(new Certification(certification));
    }
  }

  experiences: Experience[];
  certifications: Certification[];
}

export class Certification {
  constructor(data: any) {
    this.title = data.title;
    this.issuer = data.issuer;
    this.month = data.month;
    this.year = data.year;
    this.description = data.description;
    this.supporting_document = data.supporting_document;
  }

  title: string;
  issuer: string;
  month: string;
  year: string;
  description: string;
  supporting_document: string;
}

export class Experience {
  constructor(data: any) {
    this.title = data.title;
  }
  title: string;
}
